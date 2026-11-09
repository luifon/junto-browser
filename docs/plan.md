# Plan

The work in order. Each step ends with its tests passing and, where it decides something, an ADR. Steps 1 to 4 need no change in Junto: the mock host of `tools/mock-host/` stands in for the client.

## 1. Capture a tab in the offscreen document

- On a press of the extension button on a tab (or its keyboard shortcut), the service worker calls `chrome.tabCapture.getMediaStreamId({ targetTabId })`, creates the offscreen document with the reason `USER_MEDIA` if it does not exist, and gives it the identifier.
- The offscreen document calls `navigator.mediaDevices.getUserMedia` with `chromeMediaSource: "tab"` and `chromeMediaSourceId` for audio and video. The identifier can be used once and expires after a few seconds.
- While a tab is captured, Chrome does not play its sound to the person: the offscreen document plays it again through an `AudioContext` (`createMediaStreamSource(stream).connect(context.destination)`).
- The capture ends when the tab closes, when the client asks (`stop`), and when the person presses the button again; the extension then reports `ended` with its reason.
- Done when: a manual test on a page that plays video and sound shows the stream in the offscreen document, the person still hears the tab, and each end path reports `ended`.

## 2. The native messaging connection

- The service worker keeps one port to the host (`chrome.runtime.connectNative("junto.browser")`), opened at browser start and when the button is pressed; it reconnects after the host ends, with a bounded delay between attempts.
- Every message that arrives is checked by `readFromClient` of `src/protocol.ts`; a message of another form is ignored and logged.
- Done when: with the mock host installed, the log shows `hello` both ways, the list of tabs, the `invoked` message after a press, and the extension survives a restart of the host.

## 3. The WebRTC connection to the client

- The offscreen document creates an `RTCPeerConnection` with the tab's tracks, sends the `offer` through the service worker and the host, applies the `answer`, and exchanges `candidate` messages. Only host candidates on the loopback interface are needed: the client runs on the same computer.
- The picture is sent at the size and rate of the tab, with the codec that the client offers; the sound as Opus.
- Done when: a test page of the repository plays the role of the client (a second `RTCPeerConnection` in a normal tab, answering through the mock host) and shows the received picture and plays the received sound.

## 4. Errors and limits

- A `start` of the client for a tab on which the person has not pressed the button is refused with `not-invoked`.
- A tab that cannot be captured (`chrome://` pages, the Chrome Web Store, another extension's pages) is refused with `capture-failed` and a reason.
- Done when: unit tests cover the refusals, and manual tests cover the pages that Chrome does not allow.

## 5. The Junto side (in the Junto repository, with its maintainer)

- The native messaging host: a small program installed with the client, and its manifest in the folder that Chrome reads on each system (a file on macOS and Linux, a registry key on Windows), with the identifier of the extension in `allowed_origins`.
- The local connection between the host and the running client, open only to the same user.
- A share source "tab" in the media engine that answers the offer, receives the picture and the sound, and gives them to the publication of a share in a free slot (Junto ADR 0737, ADR 0510).
- The Browser tabs part of the share dialog of the client.

## Open decisions

- **How a tab share starts from Junto's share dialog.** Chrome allows the capture only of a tab on which the person invoked the extension. Either the dialog brings the chosen tab to the front and asks the person to press the button of the extension, or a tab share starts only from the browser. The maintainer decides.
- **The fixed identifier of the extension** in development and in the Chrome Web Store (the `key` field of the manifest), which the manifest of the host names.
- **The cost** of decoding the tab picture in the client and encoding it again for the call; measured as Junto ADR 0914 does.
- **Publication** in the Chrome Web Store: the maintainer decides when and under which account.
