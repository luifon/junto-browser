# Mock host

A stand-in for the Junto native messaging host `junto.browser`, so that the extension can be developed without the Junto client. Python 3, no dependencies.

1. Build and load the extension (`README.md` of the repository), and copy its identifier from `chrome://extensions`.
2. Install the manifest for your user: `python3 tools/mock-host/install.py <identifier>`. On macOS and Linux this writes `junto.browser.json` to the folder that Chrome reads; on Windows it writes the manifest next to the script and prints the `reg add` command to run.
3. Restart Chrome, or reload the extension.
4. Read the log: every message in both directions, in `junto-mock-host.log` in the temporary folder of the system, or in the file that `JUNTO_MOCK_HOST_LOG` names.

What it does: it answers `hello`, asks for the tabs (`list-tabs`), and sends `start` for each tab of an `invoked` message. It does not answer an `offer`: step 3 of `docs/plan.md` adds a test page that plays the client's part of the WebRTC connection.

Remove it: delete `junto.browser.json` from the folder of step 2 (on Windows, `reg delete "HKCU\Software\Google\Chrome\NativeMessagingHosts\junto.browser" /f`).
