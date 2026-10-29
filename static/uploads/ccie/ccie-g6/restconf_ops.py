"""RESTCONF VTY repair and native configuration backup. Real IOS-XE required."""
import argparse, copy, getpass, hashlib, json, os
from pathlib import Path
from datetime import datetime, timezone
import requests

HEADERS = {"Accept": "application/yang-data+json", "Content-Type": "application/yang-data+json"}
ROOT = "/restconf/data/Cisco-IOS-XE-native:native"

def evidence_path(stem, suffix):
    return stem.parent / (stem.name + suffix)

def vty_patch(document):
    keys = [k for k in document if k.split(":")[-1] == "vty"]
    if len(keys) != 1 or not isinstance(document[keys[0]], list) or not document[keys[0]]:
        raise ValueError("Expected a nonempty YANG vty list")
    entries = []
    for row in document[keys[0]]:
        if "first" not in row:
            raise ValueError("Missing VTY list key first")
        item = {k: copy.deepcopy(row[k]) for k in ("first", "last") if k in row}
        item["transport"] = {"input": {"all": [None]}}
        entries.append(item)
    return {keys[0]: entries}

def checked_json(response):
    response.raise_for_status()
    value = response.json()
    if not isinstance(value, dict) or not value or any(k.split(":")[-1] == "errors" for k in value):
        raise ValueError("Invalid or error RESTCONF document")
    return value

def main():
    p = argparse.ArgumentParser()
    p.add_argument("action", choices=["backup", "vty-plan", "vty-apply"])
    p.add_argument("hosts", nargs="+")
    p.add_argument("--username", default="admin")
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--insecure-lab", action="store_true", help="Explicitly allow lab self-signed TLS")
    a = p.parse_args()
    password = os.environ.get("CCIE_RESTCONF_PASSWORD") or getpass.getpass("RESTCONF password: ")
    a.out.mkdir(parents=True, exist_ok=True)
    failed = False
    for host in a.hosts:
        try:
            import ipaddress
            ipaddress.IPv4Address(host)
            base = "https://" + host + ROOT
            s = requests.Session(); s.auth = (a.username, password); s.headers.update(HEADERS)
            s.verify = not a.insecure_lab
            path = base if a.action == "backup" else base + "/line/vty"
            before = checked_json(s.get(path, timeout=(5, 30)))
            stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
            stem = a.out / (host + "-" + stamp)
            raw = json.dumps(before, ensure_ascii=False, indent=2).encode()
            evidence_path(stem, ".before.json").write_bytes(raw)
            if a.action == "backup":
                if not any(k.split(":")[-1] == "native" for k in before):
                    raise ValueError("Native root missing; not a configuration backup")
            else:
                patch = vty_patch(before)
                evidence_path(stem, ".patch.json").write_text(json.dumps(patch, indent=2))
                if a.action == "vty-apply":
                    s.patch(path, json=patch, timeout=(5, 30)).raise_for_status()
                    after = checked_json(s.get(path, timeout=(5, 30)))
                    evidence_path(stem, ".after.json").write_text(json.dumps(after, indent=2))
                    key = next(k for k in after if k.split(":")[-1] == "vty")
                    expected = {(r["first"], r.get("last")) for r in next(iter(patch.values()))}
                    actual = {(r["first"], r.get("last")) for r in after[key]}
                    if expected != actual or any(r.get("transport", {}).get("input") != {"all": [None]} for r in after[key]):
                        raise RuntimeError("VTY read-back did not match all configurable ranges")
            evidence_path(stem, ".manifest.json").write_text(json.dumps({"host":host,"action":a.action,"sha256":hashlib.sha256(raw).hexdigest(),"time":stamp,"verified_http":True},indent=2))
            print(host + ": " + a.action + " succeeded")
        except (requests.RequestException, ValueError, KeyError, TypeError, RuntimeError, OSError) as exc:
            failed = True; print(host + ": FAILED: " + str(exc))
        finally:
            if "s" in locals(): s.close()
    raise SystemExit(1 if failed else 0)

if __name__ == "__main__":
    main()
