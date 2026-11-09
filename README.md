# Junto for Chrome

A Chrome extension that lets the [Junto](https://github.com/luifon/junto) desktop client share one browser tab in a call, with the picture and the sound of that tab only.

Junto is a self-hosted application for team chat, voice and video calls, and screen sharing. Its desktop client can share a screen, a window or an application, with the sound of the system or of one application. A browser plays the sound of all its tabs through one application, and only the browser itself can capture one tab. Chrome gives that capture to extensions through `chrome.tabCapture` (ADR 0001). The extension is for Chrome only.

**Status:** early. The extension lists the open tabs, records the tabs on which the person pressed its button, and has the message format of its exchange with the client, with tests. The capture of a tab, the connection to the client, and the Junto side (the native messaging host and the share source of a tab) are not built. `docs/plan.md` lists the work in order.

## Documents

- `docs/adr/0001-the-extension-is-a-share-source-of-the-client.md`: the design and its reasons.
- `docs/plan.md`: the work in order, what "done" means for each step, and the open decisions.
- `docs/protocol.md`: the messages between the extension and the client.
- `CONTRIBUTING.md`: how to contribute, the contributor licence agreement, the checks.
- `AGENTS.md`: the layout and what to read first, for a person or a coding agent.

## Build and test

Node.js 24 or newer, and Python 3 for the mock host.

```sh
npm ci
npm run check   # the type check
npm test        # the unit tests
npm run build   # writes the unpacked extension to dist/
```

Load it in Chrome: open `chrome://extensions`, turn on "Developer mode", press "Load unpacked" and choose `dist/`. Chrome shows the identifier of the extension on its card; the mock host needs it.

## Develop without the Junto client

`tools/mock-host/` is a stand-in for the Junto native messaging host. It answers the hello, asks for the list of tabs, asks to start a share of a tab on which you pressed the button of the extension, and writes every message to a log file. See `tools/mock-host/README.md`.

## Licence

Apache License 2.0, as Junto. A contribution is accepted under the contributor licence agreement of Junto (`CONTRIBUTING.md`).
