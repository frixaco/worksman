// firefox/service-worker.ts
var SYNC_ALARM = "sync-tabs";
var SYNC_PERIOD_MIN = 0.5;
function createSyncTabAlarm() {
  browser.alarms.create(SYNC_ALARM, {
    periodInMinutes: SYNC_PERIOD_MIN
  });
}
browser.runtime.onInstalled.addListener(createSyncTabAlarm);
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== SYNC_ALARM)
    return;
  console.log("Sync alarm triggered:", alarm.name);
});
browser.action.onClicked.addListener(async (tab) => {
  if (tab?.id === undefined)
    return;
  const tabsInWindow = await browser.tabs.query({
    currentWindow: true
  });
  browser.tabs.sendMessage(tab.id, {
    action: "toggleOverlay",
    payload: {
      tabs: tabsInWindow
    }
  });
});
browser.runtime.onMessage.addListener(async (message, _sender, _sendResponse) => {
  if (message.action === "activateTab") {
    const tabId = message.payload;
    if (typeof tabId === "number") {
      await browser.tabs.update(tabId, { active: true });
      const activatedTab = await browser.tabs.get(tabId);
      if (activatedTab.windowId) {
        await browser.windows.update(activatedTab.windowId, {
          focused: true
        });
      }
    }
  }
});
function syncTabData(browserState, serverState) {
  console.log("Syncing tab data (Firefox version):", {
    browserState,
    serverState
  });
  const tabsToCreate = [];
  for (const st of serverState.tabs) {
    let existsInBrowser = false;
    for (const bt of browserState.tabs) {
      if (bt.url === st.url) {
        existsInBrowser = true;
        break;
      }
    }
    if (!existsInBrowser && st.url) {
      tabsToCreate.push({ url: st.url });
    }
  }
  console.log("Tabs to create based on server state:", tabsToCreate);
}
browser.commands.onCommand.addListener(async (command) => {
  if (command === "manual-sync") {
    const tabs = await browser.tabs.query({});
    const browserState = { tabs };
    try {
      const res = await fetch("https://sync-api-production.up.railway.app/sync", {
        method: "GET"
      });
      if (!res.ok)
        throw new Error(`HTTP error ${res.status}`);
      const serverState = await res.json();
      syncTabData(browserState, serverState);
      console.log("Manual sync completed.");
    } catch (error) {
      console.error("Manual sync failed:", error);
    }
  }
  if (command === "toggle-overlay") {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true
    });
    if (tab?.id === undefined)
      return;
    const tabsInWindow = await browser.tabs.query({
      currentWindow: true
    });
    browser.tabs.sendMessage(tab.id, {
      action: "toggleOverlay",
      payload: {
        tabs: tabsInWindow
      }
    });
  }
});
