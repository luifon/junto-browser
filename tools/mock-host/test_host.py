import io
import pathlib
import unittest

import host
import install


class FramingTest(unittest.TestCase):
    def test_a_written_message_reads_back(self):
        stream = io.BytesIO()
        host.write_message(stream, {"kind": "hello", "version": 1})
        stream.seek(0)
        self.assertEqual(host.read_message(stream), {"kind": "hello", "version": 1})

    def test_a_short_stream_ends_the_reading(self):
        self.assertIsNone(host.read_message(io.BytesIO(b"\x05\x00")))
        self.assertIsNone(host.read_message(io.BytesIO(b"\x05\x00\x00\x00{}")))


class HostTest(unittest.TestCase):
    def setUp(self):
        self.sent = []
        self.host = host.Host(self.sent.append, lambda direction, message: None)

    def test_a_hello_is_answered_and_the_tabs_are_asked_for(self):
        self.host.receive({"kind": "hello", "version": 1})
        self.assertEqual(
            self.sent,
            [{"kind": "hello", "version": 1}, {"kind": "list-tabs", "request": 1}],
        )

    def test_an_invoked_tab_is_asked_to_start(self):
        self.host.receive({"kind": "invoked", "tab": {"tabId": 7}})
        self.assertEqual(self.sent, [{"kind": "start", "request": 1, "tabId": 7, "sound": True}])

    def test_other_messages_get_no_answer(self):
        self.host.receive({"kind": "tabs", "request": 1, "tabs": []})
        self.host.receive({"kind": "invoked", "tab": {}})
        self.host.receive("not an object")
        self.assertEqual(self.sent, [])


class InstallTest(unittest.TestCase):
    def test_the_manifest_names_the_host_and_the_extension(self):
        result = install.manifest(pathlib.Path("/opt/host.py"), "a" * 32)
        self.assertEqual(result["name"], "junto.browser")
        self.assertEqual(result["type"], "stdio")
        self.assertEqual(result["allowed_origins"], [f"chrome-extension://{'a' * 32}/"])

    def test_the_folder_of_chrome_on_each_system(self):
        home = pathlib.Path("/home/example")
        self.assertEqual(
            install.chrome_folder("linux", home),
            home / ".config" / "google-chrome" / "NativeMessagingHosts",
        )
        self.assertTrue(str(install.chrome_folder("darwin", home)).endswith("Chrome/NativeMessagingHosts"))
        self.assertIsNone(install.chrome_folder("win32", home))


if __name__ == "__main__":
    unittest.main()
