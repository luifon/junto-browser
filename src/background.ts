import {
  HOST_NAME,
  PROTOCOL_VERSION,
  readFromClient,
  tabItem,
  type FromClient,
  type FromExtension,
  type TabItem,
} from "./protocol";

let port: chrome.runtime.Port | null = null;
const invoked = new Set<number>();

function connect(): chrome.runtime.Port {
  if (port !== null) {
    return port;
  }
  const opened = chrome.runtime.connectNative(HOST_NAME);
  opened.onMessage.addListener((message: unknown) => {
    void receive(message);
  });
  opened.onDisconnect.addListener(() => {
    port = null;
  });
  port = opened;
  send({ kind: "hello", version: PROTOCOL_VERSION });
  return opened;
}

function send(message: FromExtension): void {
  connect().postMessage(message);
}

async function listTabs(): Promise<TabItem[]> {
  const tabs = await chrome.tabs.query({});
  return tabs.flatMap((tab) => {
    const item = tabItem(tab);
    return item === null ? [] : [item];
  });
}

async function receive(value: unknown): Promise<void> {
  const message = readFromClient(value);
  if (message === null) {
    return;
  }
  switch (message.kind) {
    case "hello":
      return;
    case "list-tabs":
      send({ kind: "tabs", request: message.request, tabs: await listTabs() });
      return;
    case "start":
      await start(message);
      return;
    case "answer":
    case "candidate":
    case "stop":
      return;
  }
}

async function start(message: Extract<FromClient, { kind: "start" }>): Promise<void> {
  if (!invoked.has(message.tabId)) {
    send({ kind: "refused", request: message.request, reason: "not-invoked" });
    return;
  }
  send({ kind: "refused", request: message.request, reason: "capture-failed" });
}

chrome.action.onClicked.addListener((tab) => {
  const item = tabItem(tab);
  if (item === null) {
    return;
  }
  invoked.add(item.tabId);
  send({ kind: "invoked", tab: item });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  invoked.delete(tabId);
});

chrome.runtime.onStartup.addListener(() => {
  connect();
});
