let lastTabGroupId = -1;

chrome.action.onClicked.addListener((tab) => {
  if (tab?.id === undefined) return;
  chrome.tabs.sendMessage(tab.id, { action: "toggleOverlay" });
});

chrome.runtime.onMessage.addListener(
  async (message, _sender, _sendResponse) => {
    if (message.action === "setActiveWorkspace") {
      console.log("setActiveWorkspace");
      lastTabGroupId = message.payload;
      // TODO: collapse other groups
      const [firstTab] = await chrome.tabs.query({
        groupId: lastTabGroupId,
      });
      console.log(firstTab);
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

chrome.commands.onCommand.addListener(async (command) => {
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

    console.log({ tabs, tabGroups, groupId });

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

chrome.tabs.onCreated.addListener(async (tab) => {
  console.log("========== TAB CREATED ==========");

  if (!tab || !tab.id) {
    console.log("not a tab");
    return;
  }

  const tabGroups = await chrome.tabGroups.query({});
  console.log("tabGroups", tabGroups);

  if (tabGroups.length > 0 && lastTabGroupId === -1) {
    // TODO :ideally extension should remember last active workspace
    lastTabGroupId = tabGroups[0]!.id;
  }
  console.log("lastTabGroupId", lastTabGroupId);

  if (lastTabGroupId === -1) {
    return;
  }

  const tabs = await chrome.tabs.query({ groupId: lastTabGroupId });

  const allTabIds = [...tabs.map((tab) => tab.id!), tab.id];
  console.log("allTabIds", allTabIds);

  await chrome.tabs.group({
    tabIds: allTabIds,
    groupId: lastTabGroupId,
  });
});

chrome.tabs.onActivated.addListener(async (activeTabInfo) => {
  console.log("========== TAB ACTIVATED ==========");

  const tab = await chrome.tabs.get(activeTabInfo.tabId);
  if (tab.groupId !== -1) {
    lastTabGroupId = tab.groupId;
  }
  console.log("lastTabGroupId", lastTabGroupId);
});
