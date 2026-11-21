#!/usr/bin/env bash
#
# IGIFY Phase 0 — read-only host inventory
#
# Collects facts about a Docker host so the backend review can proceed on
# evidence. It does NOT start, stop, restart, pull, remove or modify anything,
# and it does NOT read container environment variables (they may hold secrets).
#
# Usage:
#   ./collect-host-inventory.sh [output-directory] [--with-sizes]
#
#   --with-sizes   also measure the size of each Docker volume mountpoint.
#                  Slower on large volumes; safe to omit.
#
# Output: a directory of plain text files. Review before sharing; see
# docs/INVENTORY.md for what to redact and where to send it.

set -u
umask 077

WITH_SIZES=0
OUT=""

for arg in "$@"; do
  case "$arg" in
    --with-sizes) WITH_SIZES=1 ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
    *) OUT="$arg" ;;
  esac
done

[ -n "$OUT" ] || OUT="igify-inventory-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT" || { echo "cannot create $OUT" >&2; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }

say() { printf '%s\n' "$*" | tee -a "$OUT/00-summary.txt" >/dev/null; }
emit() {
  # emit <filename> <command...>
  local file="$1"; shift
  {
    printf '$ %s\n\n' "$*"
    "$@" 2>&1
  } > "$OUT/$file"
}

section() { say ""; say "== $* =="; }

say "IGIFY host inventory"
say "Generated: $(date -Is 2>/dev/null || date)"
say "Host: $(hostname 2>/dev/null || echo unknown)"
say "Output: $OUT"
say ""
say "REMINDER: this kit is read-only by design. Review 03-docker-containers.txt"
say "and 04-docker-volumes.txt for anything you would rather not share."

# ── 1. Host ───────────────────────────────────────────────────────────────
section "Host and operating system"
{
  echo "date: $(date -Is 2>/dev/null || date)"
  echo "hostname: $(hostname 2>/dev/null)"
  echo "user: $(id -un 2>/dev/null)"
  echo "kernel: $(uname -srm 2>/dev/null)"
  echo "uptime: $(uptime 2>/dev/null)"
  echo
  echo "--- /etc/os-release ---"
  cat /etc/os-release 2>/dev/null || echo "not available"
  echo
  echo "--- architecture ---"
  uname -m 2>/dev/null || echo "not available"
} > "$OUT/01-host.txt" 2>&1

# ── 2. Hardware and storage ───────────────────────────────────────────────
section "Hardware and storage"
{
  echo "--- CPU ---"
  if have nproc; then echo "cores: $(nproc)"; fi
  grep -m1 'model name' /proc/cpuinfo 2>/dev/null || true
  echo
  echo "--- memory ---"
  have free && free -h || echo "free not available"
  echo
  echo "--- block devices ---"
  have lsblk && lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT 2>/dev/null || echo "lsblk not available"
  echo
  echo "--- filesystems ---"
  df -hT 2>/dev/null || df -h 2>/dev/null || echo "df not available"
  echo
  echo "--- mounts of interest ---"
  grep -E ' /(srv|var|data|mnt|opt)(/| )' /proc/mounts 2>/dev/null || true
} > "$OUT/02-hardware.txt" 2>&1

# ── 3. Docker daemon ──────────────────────────────────────────────────────
section "Docker"
if ! have docker; then
  say "docker CLI not found on this host."
  echo "docker CLI not found" > "$OUT/03-docker.txt"
else
  {
    echo "--- versions ---"
    docker version 2>&1 | sed -n '1,40p'
    echo
    echo "--- compose ---"
    docker compose version 2>&1 || docker-compose version 2>&1 || echo "compose not available"
    echo
    echo "--- info (selected fields, no secrets) ---"
    docker info --format '{{.ServerVersion}} | storage={{.Driver}} | cgroup={{.CgroupDriver}} | running={{.ContainersRunning}} | stopped={{.ContainersStopped}} | images={{.Images}} | memory={{.MemTotal}} | cpus={{.NCPU}}' 2>&1
    echo
    echo "--- disk usage ---"
    docker system df 2>&1
  } > "$OUT/03-docker.txt" 2>&1
fi

# ── 4. Containers ─────────────────────────────────────────────────────────
section "Containers"
if have docker; then
  {
    echo "--- all containers ---"
    docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>&1
    echo
    echo "--- per container (no environment variables) ---"
    docker ps -aq 2>/dev/null | while read -r id; do
      docker inspect --format '
name={{.Name}} image={{.Config.Image}} state={{.State.Status}} restart={{.HostConfig.RestartPolicy.Name}} started={{.State.StartedAt}}
networks={{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}
mounts={{range .Mounts}}{{.Type}}:{{.Source}}->{{.Destination}} {{end}}' "$id" 2>/dev/null
    done
    echo
    echo "--- compose projects ---"
    docker compose ls -a 2>&1 || echo "compose ls not supported on this version"
    echo
    echo "--- listening sockets ---"
    if have ss; then ss -lntu 2>/dev/null; elif have netstat; then netstat -lntu 2>/dev/null; else echo "no ss/netstat"; fi
  } > "$OUT/04-containers.txt" 2>&1
fi

# ── 5. Volumes, networks, images ──────────────────────────────────────────
section "Volumes, networks, images"
if have docker; then
  {
    echo "--- volumes ---"
    docker volume ls 2>&1
    echo
    docker volume ls -q 2>/dev/null | while read -r v; do
      mount=$(docker volume inspect --format '{{.Mountpoint}}' "$v" 2>/dev/null)
      echo "$v -> ${mount:-unknown}"
    done
    echo
    echo "--- networks ---"
    docker network ls 2>&1
    echo
    echo "--- images ---"
    docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}' 2>&1
  } > "$OUT/05-volumes-networks-images.txt" 2>&1
fi

# ── 6. Optional volume sizes ──────────────────────────────────────────────
if [ "$WITH_SIZES" = "1" ] && have docker; then
  section "Volume sizes (slower)"
  {
    docker volume ls -q 2>/dev/null | while read -r v; do
      mount=$(docker volume inspect --format '{{.Mountpoint}}' "$v" 2>/dev/null)
      if [ -n "$mount" ] && [ -d "$mount" ]; then
        printf '%-40s %s\n' "$v" "$(du -sh "$mount" 2>/dev/null | cut -f1)"
      fi
    done
  } > "$OUT/06-volume-sizes.txt" 2>&1
fi

# ── 7. Manifests ──────────────────────────────────────────────────────────
section "File checksums"
( cd "$OUT" && for f in *.txt; do [ -f "$f" ] && sha256sum "$f"; done ) > "$OUT/07-checksums.txt" 2>&1 || true

say ""
say "Files written:"
ls -1 "$OUT" 2>/dev/null | sed 's/^/  /'
say ""
say "Next: open docs/INVENTORY.md, redact anything sensitive, fill the tables,"
say "and share this directory with the project review."
