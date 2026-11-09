import { describe, expect, it } from "vitest";
import { readFromClient } from "../src/protocol";

describe("readFromClient", () => {
  it("reads each message of the client", () => {
    expect(readFromClient({ kind: "hello", version: 1 })).toEqual({ kind: "hello", version: 1 });
    expect(readFromClient({ kind: "list-tabs", request: 4 })).toEqual({
      kind: "list-tabs",
      request: 4,
    });
    expect(readFromClient({ kind: "start", request: 5, tabId: 12, sound: true })).toEqual({
      kind: "start",
      request: 5,
      tabId: 12,
      sound: true,
    });
    expect(readFromClient({ kind: "answer", share: "a", sdp: "v=0" })).toEqual({
      kind: "answer",
      share: "a",
      sdp: "v=0",
    });
    expect(readFromClient({ kind: "candidate", share: "a", candidate: "", mid: null })).toEqual({
      kind: "candidate",
      share: "a",
      candidate: "",
      mid: null,
    });
    expect(readFromClient({ kind: "stop", share: "a" })).toEqual({ kind: "stop", share: "a" });
  });

  it("refuses a message of another form", () => {
    expect(readFromClient(null)).toBeNull();
    expect(readFromClient([])).toBeNull();
    expect(readFromClient({ kind: "unknown" })).toBeNull();
    expect(readFromClient({ kind: "list-tabs", request: -1 })).toBeNull();
    expect(readFromClient({ kind: "list-tabs", request: 1.5 })).toBeNull();
    expect(readFromClient({ kind: "start", request: 1, tabId: 2 })).toBeNull();
    expect(readFromClient({ kind: "answer", share: "", sdp: "v=0" })).toBeNull();
    expect(readFromClient({ kind: "candidate", share: "a", candidate: "", mid: 3 })).toBeNull();
  });
});
