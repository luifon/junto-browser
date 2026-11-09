# Guide to the repository

This file is for a person or a coding agent who opens the repository. `CONTRIBUTING.md` holds the flow and the rules of a contribution; this file adds the layout and what to read first.

## Read first

1. `README.md`: what the extension is and how to build it.
2. `docs/adr/0001-the-extension-is-a-share-source-of-the-client.md`: the design.
3. `docs/plan.md`: the work in order and the open decisions.
4. `docs/protocol.md` and `src/protocol.ts`: the messages.

The Junto repository is <https://github.com/luifon/junto>. Its `AGENTS.md`, ADR 0901 (how the repository is kept) and ADR 0907 (contributions and releases) apply here unless `CONTRIBUTING.md` says otherwise. Its shares are described in ADR 0502 (sound), ADR 0510 (several shares), ADR 0737 (shares in the media engine) and ADR 0738 (the share dialog).

## Layout

- `src/manifest.json`: the extension, Manifest V3, Chrome only.
- `src/protocol.ts`: the messages and the check of each message that arrives.
- `src/background.ts`: the service worker.
- `src/offscreen.ts`, `src/offscreen.html`: the offscreen document that will hold the captured tab.
- `tests/`: the unit tests (Vitest).
- `tools/mock-host/`: a stand-in for the Junto native messaging host, in Python without dependencies.
- `build.mjs`: bundles `src/` into `dist/` with esbuild.
- `docs/`: the design, the plan and the protocol.

## Before a commit

The checks of `CONTRIBUTING.md` must pass.
