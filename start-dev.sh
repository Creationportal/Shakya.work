#!/bin/sh
# Launcher for the shakya.work local dev server.
# Run once in Terminal:  sh "/Users/shakya/web upgrade 2.0 copy 2/start-dev.sh"
# Then open http://localhost:3000
cd "/Users/shakya/web upgrade 2.0 copy 2" || exit 1
env -u NODE_OPTIONS npx next dev -p 3000
