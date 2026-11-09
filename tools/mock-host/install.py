#!/usr/bin/env python3
"""Installs the manifest of the mock host for Chrome of the current user.

Usage: python3 tools/mock-host/install.py <extension identifier>

The identifier is on the card of the unpacked extension in chrome://extensions. On macOS and
Linux the manifest is written to the folder that Chrome reads. On Windows the manifest is written
next to this script, and the script prints the registry command that names it.
"""

import json
import os
import pathlib
import stat
import sys

HOST_NAME = "junto.browser"


def manifest(host_path, extension_id):
    return {
        "name": HOST_NAME,
        "description": "Stand-in for the Junto native messaging host",
        "path": str(host_path),
        "type": "stdio",
        "allowed_origins": [f"chrome-extension://{extension_id}/"],
    }


def chrome_folder(platform, home):
    if platform == "darwin":
        return home / "Library" / "Application Support" / "Google" / "Chrome" / "NativeMessagingHosts"
    if platform.startswith("linux"):
        return home / ".config" / "google-chrome" / "NativeMessagingHosts"
    return None


def main():
    if len(sys.argv) != 2 or not sys.argv[1].isalpha() or len(sys.argv[1]) != 32:
        print(__doc__)
        sys.exit(2)
    extension_id = sys.argv[1]
    here = pathlib.Path(__file__).resolve().parent
    host = here / "host.py"
    if sys.platform == "win32":
        wrapper = here / "host.bat"
        wrapper.write_text(f'@echo off\r\npython "{host}" %*\r\n', encoding="utf-8")
        target = here / f"{HOST_NAME}.json"
        target.write_text(json.dumps(manifest(wrapper, extension_id), indent=2), encoding="utf-8")
        print("Run:")
        print(f'  reg add "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\{HOST_NAME}" /ve /t REG_SZ /d "{target}" /f')
        return
    host.chmod(host.stat().st_mode | stat.S_IXUSR)
    folder = chrome_folder(sys.platform, pathlib.Path.home())
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / f"{HOST_NAME}.json"
    target.write_text(json.dumps(manifest(host, extension_id), indent=2), encoding="utf-8")
    print(f"Wrote {target}")


if __name__ == "__main__":
    main()
