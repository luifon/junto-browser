# 0001. The extension is a share source of the client

Status: proposed (scaffold, 2026-11-04).

## Context

The Junto client shares a screen or a window with the sound of the system or of one application (Junto ADR 0502). A browser plays the sound of all its tabs through one application, so the client cannot share one tab with only its own sound, and it cannot share a tab that is not in front. Only the browser can capture one tab.

Chrome gives an extension the picture and the sound of one tab through `chrome.tabCapture.getMediaStreamId`. The documentation of Chrome states two limits:

- The call is allowed only for a tab on which the person has invoked the extension: its button in the toolbar, its keyboard shortcut, or another action of the person, as for the `activeTab` permission. An extension cannot start the capture of a tab that the person chose in another program.
- While a tab is captured, the browser does not play its sound to the person. The extension plays it again through an `AudioContext`.

The identifier of a stream can be used once, for a few seconds, in the offscreen document of the extension (`USER_MEDIA` reason), which calls `getUserMedia` with `chromeMediaSource: "tab"`.

The extension is for Chrome only (the operator's decision of 2026-11-04). Firefox gives extensions no live picture and sound of a tab, and other browsers are not in scope.

## Decision

The extension is one more share source of the client. It does not join the call.

- In Junto, each share belongs to the participant of the device in the media server and takes one of its slots (Junto ADR 0737, ADR 0510). The names of the tracks, the track permissions, the limit of three shares, the sound settings of a share, the watching reports and the recording all depend on this. An extension that joined the media server as a participant of its own would need changes to all of them.
- The extension sends the picture and the sound of the tab to the client over a WebRTC connection on the same computer. The client publishes them as a share of the kind "tab" in a free slot, as it publishes a captured screen.
- The signalling of that connection (offer, answer, candidates) and the other messages go through native messaging: the browser starts the native messaging host of Junto, `junto.browser`, and exchanges JSON messages with it on its standard input and output. The host passes them to the running client over a local connection that only the same user can open. The messages are in `src/protocol.ts`.
- The client asks for the list of tabs and shows each tab as its own item in its share dialog. A share of a tab starts after the person invokes the extension on that tab, as Chrome requires; the extension then tells the client (`invoked`). A request of the client to share a tab that the person has not invoked is refused with `not-invoked`.

## Work in Junto

- The native messaging host: a program installed with the client, and its manifest in the folder that Chrome reads on each system (a file on macOS and Linux, a registry key on Windows), with the identifier of the extension in `allowed_origins`.
- The local connection between the host and the client, open only to the same user.
- A share source "tab" in the media engine that receives a WebRTC picture and sound from the extension and gives them to the publication of a share.
- The Browser tabs part of the share dialog.

## Open points

- How the person starts the share of a tab from the share dialog of Junto: the dialog brings the chosen tab to the front and asks the person to press the button of the extension, or the share of a tab starts only from the browser. This is the operator's decision.
- The fixed identifier of the extension in development and in the store (the `key` field of the manifest), which the manifest of the host names.
- The cost of decoding the tab picture in the client and encoding it again for the call, measured as in Junto ADR 0914.
