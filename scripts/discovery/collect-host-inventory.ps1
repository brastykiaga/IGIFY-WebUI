# IGIFY Phase 0 — read-only host inventory (Windows / Docker Desktop)
#
# Collects facts about a Docker host. It does NOT start, stop, restart, pull,
# remove or modify anything, and it does NOT read container environment
# variables (they may hold secrets).
#
# Usage:
#   .\collect-host-inventory.ps1 [-Out <directory>] [-WithSizes]
#
# Output: a directory of plain text files. Review before sharing; see
# docs/INVENTORY.md for what to redact and where to send it.

param(
    [string]$Out = "igify-inventory-$(Get-Date -Format 'yyyyMMdd-HHmmss')",
    [switch]$WithSizes
)

$ErrorActionPreference = 'SilentlyContinue'
New-Item -ItemType Directory -Path $Out -Force | Out-Null

function Save {
    param([string]$Name, [scriptblock]$Body)
    $path = Join-Path $Out $Name
    try {
        & $Body *>&1 | Out-File -FilePath $path -Encoding utf8
    } catch {
        "ERROR: $_" | Out-File -FilePath $path -Encoding utf8
    }
}

function Has-Cli {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

$summary = Join-Path $Out '00-summary.txt'
@(
    'IGIFY host inventory (Windows)',
    "Generated: $(Get-Date -Format o)",
    "Host: $env:COMPUTERNAME",
    "Output: $Out",
    '',
    'REMINDER: read-only by design. Review 04-containers.txt and 05-volumes-images.txt',
    'for anything you would rather not share.'
) | Out-File -FilePath $summary -Encoding utf8

# ── 1. Host ───────────────────────────────────────────────────────────────
Save '01-host.txt' {
    '--- operating system ---'
    Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture, LastBootUpTime | Format-List
    '--- computer ---'
    Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer, Model, TotalPhysicalMemory, NumberOfProcessors, NumberOfLogicalProcessors | Format-List
    '--- powershell ---'
    $PSVersionTable | Format-List
}

# ── 2. Hardware and storage ───────────────────────────────────────────────
Save '02-hardware.txt' {
    '--- CPU ---'
    Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed | Format-List
    '--- memory ---'
    Get-CimInstance Win32_OperatingSystem | Select-Object @{n = 'TotalGB'; e = { [math]::Round($_.TotalVisibleMemorySize / 1MB, 1) } }, @{n = 'FreeGB'; e = { [math]::Round($_.FreePhysicalMemory / 1MB, 1) } } | Format-List
    '--- volumes ---'
    Get-Volume | Select-Object DriveLetter, FileSystemLabel, FileSystem, @{n = 'SizeGB'; e = { [math]::Round($_.Size / 1GB, 1) } }, @{n = 'FreeGB'; e = { [math]::Round($_.SizeRemaining / 1GB, 1) } } | Format-Table -AutoSize
}

# ── 3. Docker daemon ──────────────────────────────────────────────────────
if (-not (Has-Cli docker)) {
    'docker CLI not found on this host.' | Out-File (Join-Path $Out '03-docker.txt') -Encoding utf8
} else {
    Save '03-docker.txt' {
        '--- versions ---'
        docker version
        '--- compose ---'
        docker compose version
        '--- info (selected fields, no secrets) ---'
        docker info --format '{{.ServerVersion}} | storage={{.Driver}} | running={{.ContainersRunning}} | stopped={{.ContainersStopped}} | images={{.Images}} | memory={{.MemTotal}} | cpus={{.NCPU}}'
        '--- disk usage ---'
        docker system df
    }

    Save '04-containers.txt' {
        '--- all containers ---'
        docker ps -a --format 'table {{.Names}}`t{{.Image}}`t{{.Status}}`t{{.Ports}}'
        '--- per container (no environment variables) ---'
        $ids = docker ps -aq
        foreach ($id in $ids) {
            docker inspect --format 'name={{.Name}} image={{.Config.Image}} state={{.State.Status}} restart={{.HostConfig.RestartPolicy.Name}} networks={{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}mounts={{range .Mounts}}{{.Type}}:{{.Source}}->{{.Destination}} {{end}}' $id
        }
        '--- compose projects ---'
        docker compose ls -a
        '--- listening ports ---'
        Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess | Sort-Object LocalPort | Format-Table -AutoSize
    }

    Save '05-volumes-images.txt' {
        '--- volumes ---'
        docker volume ls
        '--- volume mountpoints ---'
        foreach ($v in (docker volume ls -q)) {
            $mount = (docker volume inspect --format '{{.Mountpoint}}' $v)
            "$v -> $mount"
        }
        '--- networks ---'
        docker network ls
        '--- images ---'
        docker images --format 'table {{.Repository}}`t{{.Tag}}`t{{.ID}}`t{{.CreatedSince}}`t{{.Size}}'
    }

    if ($WithSizes) {
        Save '06-volume-sizes.txt' {
            foreach ($v in (docker volume ls -q)) {
                $mount = (docker volume inspect --format '{{.Mountpoint}}' $v)
                if ($mount -and (Test-Path $mount)) {
                    $mb = [math]::Round(((Get-ChildItem $mount -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB), 1)
                    "$v`t$mb MB"
                }
            }
        }
    }
}

# ── 7. Checksums ──────────────────────────────────────────────────────────
Get-ChildItem -Path $Out -Filter *.txt | ForEach-Object {
    $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
    "$hash  $($_.Name)"
} | Out-File -FilePath (Join-Path $Out '07-checksums.txt') -Encoding utf8

Write-Host ''
Write-Host 'Files written:'
Get-ChildItem $Out -Filter *.txt | Select-Object -ExpandProperty Name | ForEach-Object { Write-Host "  $_" }
Write-Host ''
Write-Host 'Next: open docs/INVENTORY.md, redact anything sensitive, fill the tables,'
Write-Host 'and share this directory with the project review.'
