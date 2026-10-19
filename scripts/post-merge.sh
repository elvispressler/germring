#!/bin/bash
set -e

current_phase="startup"
phase_started_ms=""
phase_pid=""
timeout_handled=0
timeout_pending=0

current_time_ms() {
  date +%s%3N
}

handle_timeout() {
  local signal="$1"
  local elapsed_ms="unknown"
  local pid=""

  if (( timeout_handled )); then
    exit 124
  fi
  timeout_handled=1
  trap '' TERM

  if [[ -n "$phase_started_ms" ]]; then
    elapsed_ms=$(( $(current_time_ms) - phase_started_ms ))
  fi

  if [[ -n "$phase_pid" ]]; then
    pid="$phase_pid"
    phase_pid=""
    kill -TERM -- "-$pid" 2>/dev/null || true
    kill -KILL -- "-$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi

  printf '[post-merge] timed out during %s after %sms\n' \
    "$current_phase" "$elapsed_ms" >&2
  exit 124
}

trap 'handle_timeout TERM' TERM

run_phase() {
  local phase="$1"
  shift

  current_phase="$phase"
  phase_started_ms=$(current_time_ms)
  printf '[post-merge] %s\n' "$phase"

  timeout_pending=0
  trap 'timeout_pending=1' TERM
  setsid "$@" &
  phase_pid=$!
  trap 'handle_timeout TERM' TERM
  if (( timeout_pending )); then
    handle_timeout TERM
  fi

  set +e
  wait "$phase_pid"
  local exit_code=$?
  set -e
  phase_pid=""
  local elapsed_ms=$(( $(current_time_ms) - phase_started_ms ))
  phase_started_ms=""

  if (( exit_code != 0 )); then
    printf '[post-merge] %s failed after %sms\n' "$phase" "$elapsed_ms" >&2
    return "$exit_code"
  fi

  printf '[post-merge] %s completed in %sms\n' "$phase" "$elapsed_ms"
  current_phase="startup"
}

run_phase "install dependencies" pnpm install --frozen-lockfile
run_phase "typecheck" pnpm run typecheck
run_phase "synchronize schema" pnpm --filter db push
