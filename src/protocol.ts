export const HOST_NAME = "junto.browser";
export const PROTOCOL_VERSION = 1;

export interface TabItem {
  tabId: number;
  windowId: number;
  title: string;
  url: string;
  iconUrl: string | null;
  active: boolean;
  audible: boolean;
}

export type EndReason = "stopped" | "tab-closed" | "failed";
export type RefusalReason = "not-invoked" | "no-tab" | "capture-failed";

export type FromClient =
  | { kind: "hello"; version: number }
  | { kind: "list-tabs"; request: number }
  | { kind: "start"; request: number; tabId: number; sound: boolean }
  | { kind: "answer"; share: string; sdp: string }
  | { kind: "candidate"; share: string; candidate: string; mid: string | null }
  | { kind: "stop"; share: string };

export type FromExtension =
  | { kind: "hello"; version: number }
  | { kind: "tabs"; request: number; tabs: TabItem[] }
  | { kind: "invoked"; tab: TabItem }
  | { kind: "offer"; request: number | null; share: string; tabId: number; sdp: string }
  | { kind: "candidate"; share: string; candidate: string; mid: string | null }
  | { kind: "ended"; share: string; reason: EndReason }
  | { kind: "refused"; request: number; reason: RefusalReason };

type Fields = Record<string, unknown>;

function isFields(value: unknown): value is Fields {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function readFromClient(value: unknown): FromClient | null {
  if (!isFields(value)) {
    return null;
  }
  switch (value.kind) {
    case "hello":
      return isCount(value.version) ? { kind: "hello", version: value.version } : null;
    case "list-tabs":
      return isCount(value.request) ? { kind: "list-tabs", request: value.request } : null;
    case "start":
      return isCount(value.request) && isCount(value.tabId) && typeof value.sound === "boolean"
        ? { kind: "start", request: value.request, tabId: value.tabId, sound: value.sound }
        : null;
    case "answer":
      return isText(value.share) && isText(value.sdp)
        ? { kind: "answer", share: value.share, sdp: value.sdp }
        : null;
    case "candidate":
      return isText(value.share) &&
        typeof value.candidate === "string" &&
        (value.mid === null || typeof value.mid === "string")
        ? { kind: "candidate", share: value.share, candidate: value.candidate, mid: value.mid }
        : null;
    case "stop":
      return isText(value.share) ? { kind: "stop", share: value.share } : null;
    default:
      return null;
  }
}

export function tabItem(tab: chrome.tabs.Tab): TabItem | null {
  if (tab.id === undefined || tab.id === chrome.tabs.TAB_ID_NONE) {
    return null;
  }
  return {
    tabId: tab.id,
    windowId: tab.windowId,
    title: tab.title ?? "",
    url: tab.url ?? "",
    iconUrl: tab.favIconUrl ?? null,
    active: tab.active,
    audible: tab.audible ?? false,
  };
}
