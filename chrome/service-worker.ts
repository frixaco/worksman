let lastTabGroupId = -1;

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

  const tabGroups = await chrome.tabGroups.query({});

  lastTabGroupId = tab?.groupId;
  const groupId = lastTabGroupId;
  const tabs = await chrome.tabs.query({
    groupId,
  });

  chrome.tabs.sendMessage(tab.id, {
    action: "toggleOverlay",
    payload: {
      tabs,
      tabGroups,
      groupId,
    },
  });
});

chrome.runtime.onMessage.addListener(
  async (message, _sender, _sendResponse) => {
    if (message.action === "setActiveWorkspace") {
      lastTabGroupId = message.payload;
      // TODO: collapse other groups

      const [firstTab] = await chrome.tabs.query({
        groupId: lastTabGroupId,
      });
      if (!firstTab) return;

      await chrome.tabs.update(firstTab.id!, {
        active: true,
      });
    }

    if (message.action === "activateTab") {
      const tabId = message.payload;
      chrome.tabs.update(tabId, { active: true });
    }
  },
);

type TabData = {
  tabs: chrome.tabs.Tab[];
  tabGroups: chrome.tabGroups.TabGroup[];
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
    const tabGroups = await chrome.tabGroups.query({});
    const tabs = await chrome.tabs.query({});

    const browser = { tabs, tabGroups };

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

    const tabGroups = await chrome.tabGroups.query({});

    if (tab?.id === undefined) return;

    lastTabGroupId = tab?.groupId;
    const groupId = lastTabGroupId;
    const tabs = await chrome.tabs.query({
      groupId,
    });

    chrome.tabs.sendMessage(tab.id, {
      action: "toggleOverlay",
      payload: {
        tabs,
        tabGroups,
        groupId,
      },
    });
  }
});

chrome.tabs.onActivated.addListener(async (activeTabInfo) => {
  const tab = await chrome.tabs.get(activeTabInfo.tabId);
  if (tab.groupId !== -1) {
    lastTabGroupId = tab.groupId;
  }
});
