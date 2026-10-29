"""Run inside real IOS-XE Guest Shell; no default VRF and no disabled AF queries."""
import re

def vrfs(text):
    result = []
    for line in text.splitlines():
        m = re.match(r"^\s*(\S+)\s+(?:<not set>|\S+)\s+(ipv[46](?:,\s*ipv[46])?)\b", line)
        if m and m.group(1).lower() not in ("default", "global"):
            result.append((m.group(1), re.findall(r"ipv[46]", m.group(2))))
    return result

def dump(execute):
    for name, families in vrfs(execute("show vrf brief")):
        if not re.match(r"^[A-Za-z0-9_.:-]+\Z", name):
            raise ValueError("Unsupported VRF name: " + repr(name))
        for af in families:
            command = ("show ip route vrf " if af == "ipv4" else "show ipv6 route vrf ") + name
            print("\n### " + command)
            print(execute(command))

if __name__ == "__main__":
    from cli import cli
    dump(cli)
