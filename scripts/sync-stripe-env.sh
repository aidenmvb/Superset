#!/usr/bin/env bash
# Pull Stripe keys from the Stripe CLI config into server/.env
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CFG="${HOME}/.config/stripe/config.toml"
ENV_FILE="${ROOT}/server/.env"

if [[ ! -f "$CFG" ]]; then
  echo "Stripe CLI config not found at $CFG"
  echo "Run: stripe login"
  exit 1
fi

python3 <<PY
import re
from pathlib import Path

cfg = Path.home().joinpath(".config/stripe/config.toml").read_text()
env_path = Path(${ENV_FILE@Q})

def first(*patterns):
    for p in patterns:
        m = re.search(p, cfg)
        if m:
            return m.group(1)
    return ""

sk = first(r"live_mode_api_key\s*=\s*'([^']+)'", r"test_mode_api_key\s*=\s*'([^']+)'")
pk = first(r"live_mode_pub_key\s*=\s*'([^']+)'", r"test_mode_pub_key\s*=\s*'([^']+)'")
if not sk or not pk:
    raise SystemExit("Could not find Stripe API keys in CLI config.")

mode = "live" if sk.startswith("sk_live_") else "test"
existing = env_path.read_text() if env_path.exists() else ""
lines = [
    l for l in existing.splitlines()
    if l and not l.startswith("STRIPE_SECRET_KEY=") and not l.startswith("STRIPE_PUBLISHABLE_KEY=")
]
if not any(l.startswith("PORT=") for l in lines):
    lines.insert(0, "PORT=3001")
lines.append(f"STRIPE_SECRET_KEY={sk}")
lines.append(f"STRIPE_PUBLISHABLE_KEY={pk}")
env_path.write_text("\n".join(lines) + "\n")
print(f"Updated {env_path} with Stripe {mode} keys (values not shown)")
PY
