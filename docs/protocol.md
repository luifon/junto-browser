# The messages between the extension and the client

The extension and the Junto client exchange JSON messages through Chrome native messaging: Chrome starts the native messaging host `junto.browser`, and each message on its standard input and output is a 4-byte length in native byte order (little-endian on the supported systems) followed by UTF-8 JSON of at most 1 MB from the host to the extension. The host passes the messages to the running client. `src/protocol.ts` is the reference; this file explains it.

Protocol version: 1. Each side sends `hello` first; a side that receives another version ends the connection.

## From the client

| `kind` | Fields | Meaning |
|---|---|---|
| `hello` | `version` | The client's protocol version. |
| `list-tabs` | `request` | Asks for the open tabs. |
| `start` | `request`, `tabId`, `sound` | Asks to share one tab, with its sound when `sound` is true. |
| `answer` | `share`, `sdp` | The WebRTC answer to the offer of a share. |
| `candidate` | `share`, `candidate`, `mid` | A WebRTC candidate of the client. |
| `stop` | `share` | Ends a share. |

## From the extension

| `kind` | Fields | Meaning |
|---|---|---|
| `hello` | `version` | The extension's protocol version. |
| `tabs` | `request`, `tabs` | The open tabs: `tabId`, `windowId`, `title`, `url`, `iconUrl`, `active`, `audible`. |
| `invoked` | `tab` | The person pressed the extension button on this tab, so it may be captured. |
| `offer` | `request` or null, `share`, `tabId`, `sdp` | The WebRTC offer of a new share. `request` names the `start` it answers; null when the share started from the browser. |
| `candidate` | `share`, `candidate`, `mid` | A WebRTC candidate of the extension. |
| `ended` | `share`, `reason` | A share ended: `stopped`, `tab-closed` or `failed`. |
| `refused` | `request`, `reason` | A `start` was refused: `not-invoked`, `no-tab` or `capture-failed`. |

`request` is a number that the client chooses; the answer carries it back. `share` is an identifier that the extension chooses for each share.
