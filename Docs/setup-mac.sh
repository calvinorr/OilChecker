#!/usr/bin/env bash
set -euo pipefail

echo "=== OilPrice Mac setup ==="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install from https://nodejs.org/ and rerun."
  exit 1
fi

NODE_MAJOR="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
if [ "${NODE_MAJOR}" -lt 18 ]; then
  echo "Node.js 18+ is recommended. Current: $(node -v)"
fi

echo "--- installing npm dependencies ---"
npm install

echo
echo "Done."
echo "- Add your GEMINI_API_KEY to .env.local (leave secrets out of git)."
echo "- Start the app with: npm run dev"
