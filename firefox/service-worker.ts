// let lastTabGroupId = -1; // Not applicable for Firefox as tabGroups are not used

const SYNC_ALARM = "sync-tabs";
const SYNC_PERIOD_MIN = 0.5;

function createSyncTabAlarm() {
  browser.alarms.create(SYNC_ALARM, {
    periodInMinutes: SYNC_PERIOD_MIN,
  });
}

browser.runtime.onInstalled.addListener(createSyncTabAlarm);
// browser.runtime.onStartup.addListener(createSyncTabAlarm); // onStartup is not available in MV3 for Firefox like it is for Chrome.
// Alarms are persistent across browser restarts in Firefox MV3 if created with browser.alarms.create.
// So, onInstalled is usually sufficient. If you need it on every startup for some reason,
// you might need to check if the alarm exists.

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== SYNC_ALARM) return; // Corrected to use SYNC_ALARM
  // Add sync logic here if needed for the alarm
  console.log("Sync alarm triggered:", alarm.name);
});

browser.action.onClicked.addListener(async (tab) => {
  if (tab?.id === undefined) return;

  // In Firefox, we operate on current window tabs as tabGroups are not available
  const tabsInWindow = await browser.tabs.query({
    currentWindow: true,
    // Optionally filter out pinned tabs or other specific tabs if needed
  });

  browser.tabs.sendMessage(tab.id, {
    action: "toggleOverlay",
    payload: {
      tabs: tabsInWindow,
      // tabGroups and groupId are omitted
    },
  });
});

browser.runtime.onMessage.addListener(
  async (message, _sender, _sendResponse) => {
    if (message.action === "setActiveWorkspace") {
      // This action is related to tabGroups, which are not used in this Firefox version.
      // You might want to log or ignore this message.
      console.log(
        "setActiveWorkspace message received, but not applicable in Firefox version.",
      );
      // lastTabGroupId = message.payload; // lastTabGroupId is removed
      // Logic to switch to a group's first tab is not applicable.
    }

    if (message.action === "activateTab") {
      const tabId = message.payload;
      if (typeof tabId === "number") {
        await browser.tabs.update(tabId, { active: true });
        // Also bring the window containing the tab to the front
        const activatedTab = await browser.tabs.get(tabId);
        if (activatedTab.windowId) {
          await browser.windows.update(activatedTab.windowId, {
            focused: true,
          });
        }
      }
    }
  },
);

type TabData = {
  tabs: browser.tabs.Tab[];
  tabGroups: any[]; // Sending empty or handling server's tabGroups if any
};

// This function is a stub in the original code.
// If implemented, it should handle browser.tabGroups potentially being empty.
function syncTabData(browserState: TabData, serverState: TabData) {
  console.log("Syncing tab data (Firefox version):", {
    browserState,
    serverState,
  });
  const tabsToCreate: { url: string }[] = [];

  // Example: Find tabs on server not in browser
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

  // This is a very basic sync logic example.
  // A real sync would be more complex (handling updates, deletions, conflicts).
  console.log("Tabs to create based on server state:", tabsToCreate);
  // for (const tabToCreate of tabsToCreate) {
  //   browser.tabs.create({ url: tabToCreate.url });
  // }
}

browser.commands.onCommand.addListener(async (command) => {
  if (command === "manual-sync") {
    const tabs = await browser.tabs.query({});
    const tabGroups: any[] = []; // Firefox: no tab groups API

    const browserState: TabData = { tabs, tabGroups };

    try {
      const res = await fetch(
        "https://sync-api-production.up.railway.app/sync",
        {
          method: "GET",
        },
      );
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const serverState: TabData = await res.json();

      syncTabData(browserState, serverState);
      console.log("Manual sync completed.");
      // Optionally, send a notification or update UI
    } catch (error) {
      console.error("Manual sync failed:", error);
    }
  }

  if (command === "toggle-overlay") {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id === undefined) return;

    const tabsInWindow = await browser.tabs.query({
      currentWindow: true,
    });

    browser.tabs.sendMessage(tab.id, {
      action: "toggleOverlay",
      payload: {
        tabs: tabsInWindow,
        // tabGroups and groupId are omitted
      },
    });
  }
});

// The concept of 'lastTabGroupId' is removed as tabGroups are not used.
// browser.tabs.onActivated is kept if other per-tab activation logic is needed in the future.
browser.tabs.onActivated.addListener(async (activeInfo) => {
  // const tab = await browser.tabs.get(activeInfo.tabId);
  // Original logic related to tab.groupId is removed.
  // If you need to do something when a tab is activated, do it here.
  console.log("Tab activated:", activeInfo.tabId);
});
