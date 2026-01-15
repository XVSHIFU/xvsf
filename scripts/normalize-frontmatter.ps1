param(
  [string]$PostsDir = "content/posts",
  [string]$TimeZone = "+08:00",
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Read file as UTF-8 (no BOM) first; if it contains replacement chars, fallback to GBK.
function Read-TextAuto {
  param([Parameter(Mandatory=$true)][string]$Path)

  $utf8 = New-Object System.Text.UTF8Encoding($false, $false)   # no BOM, no throw
  $gbk  = [System.Text.Encoding]::GetEncoding(936)              # GBK

  $bytes = [System.IO.File]::ReadAllBytes($Path)

  $textUtf8 = $utf8.GetString($bytes)

  # If decoding produced replacement characters, it's likely not UTF-8.
  if ($textUtf8.IndexOf([char]0xFFFD) -ge 0) {
    return $gbk.GetString($bytes)
  }

  return $textUtf8
}

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Text
  )
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}

function Convert-InlineListToYamlLines {
  param(
    [Parameter(Mandatory=$true)][string]$Key,
    [Parameter(Mandatory=$true)][string]$InlineValue
  )

  $s = $InlineValue.Trim()

  if (-not ($s.StartsWith("[") -and $s.EndsWith("]"))) {
    return @("${Key}: $InlineValue")
  }

  $inner = $s.Substring(1, $s.Length - 2)

  $parts = $inner -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

  $lines = @("${Key}:")
  foreach ($p in $parts) {
    $v = $p.Trim()
    if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
      $v = $v.Substring(1, $v.Length - 2)
    }
    $v = $v.Replace('"','\"')
    $lines += "  - `"$v`""
  }
  return $lines
}

function Ensure-KeyLine {
  param(
    [Parameter(Mandatory=$true)][System.Collections.Generic.List[string]]$Lines,
    [Parameter(Mandatory=$true)][string]$Key,
    [Parameter(Mandatory=$true)][string]$LineToAdd
  )
  $exists = $Lines | Where-Object { $_ -match "^\s*$([regex]::Escape($Key))\s*:" }
  if (-not $exists) {
    $Lines.Add($LineToAdd) | Out-Null
  }
}

$postsPath = Join-Path $PSScriptRoot "..\$PostsDir"
$postsPath = (Resolve-Path $postsPath).Path

$files = Get-ChildItem -Path $postsPath -Filter *.md -File
if ($files.Count -eq 0) {
  Write-Host "[INFO] No markdown files found in $postsPath"
  exit 0
}

$changed = 0
foreach ($f in $files) {
  $raw = Read-TextAuto -Path $f.FullName

  if ($raw -notmatch "^(?s)---\s*\r?\n(.*?)\r?\n---\s*\r?\n") {
    continue
  }

  $fm = $Matches[1]
  $rest = $raw.Substring($Matches[0].Length)

  $fmLines = New-Object System.Collections.Generic.List[string]
  foreach ($line in ($fm -split "\r?\n")) {
    $noComment = ($line -replace "\s+#.*$","").TrimEnd()
    if ($noComment.Trim() -ne "") { $fmLines.Add($noComment) | Out-Null }
  }

  $newLines = New-Object System.Collections.Generic.List[string]

  $i = 0
  while ($i -lt $fmLines.Count) {
    $line = $fmLines[$i]

    if ($line -match "^\s*toc\s*:\s*(true|false)\s*$") {
      $val = $Matches[1]
      $newLines.Add("showToc: $val") | Out-Null
      $i++
      continue
    }

    if ($line -match "^\s*date\s*:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s*$") {
      $d = $Matches[1]
      $t = $Matches[2]
      $newLines.Add("date: $d" + "T" + "$t$TimeZone") | Out-Null
      $i++
      continue
    }

    if ($line -match "^\s*(tags|categories)\s*:\s*(\[.*\])\s*$") {
      $key = $Matches[1]
      $val = $Matches[2]
      $converted = Convert-InlineListToYamlLines -Key $key -InlineValue $val
      foreach ($cl in $converted) { $newLines.Add($cl) | Out-Null }
      $i++
      continue
    }

    $newLines.Add($line) | Out-Null
    $i++
  }

  Ensure-KeyLine -Lines $newLines -Key "draft" -LineToAdd "draft: false"

  $showTocLine = $newLines | Where-Object { $_ -match "^\s*showToc\s*:\s*true\s*$" }
  if ($showTocLine) {
    Ensure-KeyLine -Lines $newLines -Key "tocOpen" -LineToAdd "tocOpen: true"
  }

  $newFm = ($newLines -join "`n").Trim() + "`n"
  $newRaw = "---`n$newFm---`n$rest"

  if ($newRaw -ne $raw) {
    $changed++
    Write-Host "[CHANGED] $($f.Name)"
    if (-not $DryRun) {
      Write-Utf8NoBom -Path $f.FullName -Text $newRaw
    }
  }
}

if ($DryRun) {
  Write-Host "[DONE] DryRun complete. Files changed would be: $changed"
} else {
  Write-Host "[DONE] Normalization complete. Files changed: $changed"
}