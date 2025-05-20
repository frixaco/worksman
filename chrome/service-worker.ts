const SYNC_ALARM = "sync-tabs";
const SYNC_PERIOD_MIN = 0.5;

function createSyncTabAlarm() {
  chrome.alarms.create(SYNC_ALARM, {
    periodInMinutes: SYNC_PERIOD_MIN,
  });
}

chrome.runtime.onInstalled.addListener(createSyncTabAlarm);
chrome.runtime.onStartup.addListener(createSyncTabAlarm);

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "syncTabs") return;
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.id === undefined) return;

  const tabs = await chrome.tabs.query({
    currentWindow: true,
  });

  chrome.tabs.sendMessage(tab.id, {
    action: "toggleOverlay",
    payload: {
      tabs,
    },
  });
});

chrome.runtime.onMessage.addListener(
  async (message, _sender, _sendResponse) => {
    if (message.action === "activateTab") {
      const tabId = message.payload;
      chrome.tabs.update(tabId, { active: true });
    }
  },
);

type TabData = {
  tabs: chrome.tabs.Tab[];
};

function syncTabData(browser: TabData, server: TabData) {
  const tabs: chrome.tabs.Tab[] = [];

  for (const bt of browser.tabs) {
    let exists = false;
    for (const st of server.tabs) {
      if (bt.url === st.url) {
        exists = true;
      }
    }

    if (!exists) {
    }
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "manual-sync") {
    const tabs = await chrome.tabs.query({});

    const browser = { tabs };

    const res = await fetch("https://sync-api-production.up.railway.app/sync", {
      method: "GET",
    });
    const server = await res.json();

    syncTabData(browser, server);
  }

  if (command === "toggle-overlay") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id === undefined) return;

    const tabs = await chrome.tabs.query({
      currentWindow: true,
    });

    chrome.tabs.sendMessage(tab.id, {
      action: "toggleOverlay",
      payload: {
        tabs,
      },
    });
  }
});
