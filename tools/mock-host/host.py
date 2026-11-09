#!/usr/bin/env python3
"""A stand-in for the Junto native messaging host, for work on the extension without the client.

Chrome starts it when the extension connects. It answers the hello, asks for the list of tabs,
asks to start a share of each tab on which the person pressed the extension button, and writes
every message to the log file named by JUNTO_MOCK_HOST_LOG (default: junto-mock-host.log in the
temporary folder of the system).
"""

import json
import os
import struct
import sys
import tempfile
import time

PROTOCOL_VERSION = 1


def read_message(stream):
    header = stream.read(4)
    if len(header) < 4:
        return None
    (length,) = struct.unpack("<I", header)
    body = stream.read(length)
    if len(body) < length:
        return None
    return json.loads(body.decode("utf-8"))


def write_message(stream, message):
    body = json.dumps(message).encode("utf-8")
    stream.write(struct.pack("<I", len(body)) + body)
    stream.flush()


class Host:
    def __init__(self, send, log):
        self.send = send
        self.log = log
        self.request = 0

    def next_request(self):
        self.request += 1
        return self.request

    def receive(self, message):
        self.log("from extension", message)
        kind = message.get("kind") if isinstance(message, dict) else None
        if kind == "hello":
            self.out({"kind": "hello", "version": PROTOCOL_VERSION})
            self.out({"kind": "list-tabs", "request": self.next_request()})
        elif kind == "invoked":
            tab = message.get("tab") or {}
            if isinstance(tab.get("tabId"), int):
                self.out(
                    {"kind": "start", "request": self.next_request(), "tabId": tab["tabId"], "sound": True}
                )

    def out(self, message):
        self.log("to extension", message)
        self.send(message)


def main():
    path = os.environ.get("JUNTO_MOCK_HOST_LOG") or os.path.join(tempfile.gettempdir(), "junto-mock-host.log")
    with open(path, "a", encoding="utf-8") as log_file:

        def log(direction, message):
            log_file.write(f"{time.strftime('%H:%M:%S')} {direction}: {json.dumps(message)}\n")
            log_file.flush()

        host = Host(lambda message: write_message(sys.stdout.buffer, message), log)
        log("host", {"started": sys.argv[1:]})
        while True:
            message = read_message(sys.stdin.buffer)
            if message is None:
                log("host", {"ended": "the extension closed the connection"})
                return
            host.receive(message)


if __name__ == "__main__":
    main()
