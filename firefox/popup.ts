document.getElementById("save")!.addEventListener("click", async () => {
  // TabGroups are not supported in Firefox in the same way as Chrome.
  // We'll send an empty array for tabGroups.
  const tabGroups: any[] = []; // Firefox doesn't have browser.tabGroups.query
  const tabs = await browser.tabs.query({});

  const browserState = { tabs, tabGroups }; // Changed variable name for clarity

  try {
    const res = await fetch("https://sync-api-production.up.railway.app/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(browserState),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const serverResponse = await res.json();
    document.getElementById("status")!.textContent =
      `Saved! Server response: ${JSON.stringify(serverResponse, null, 2)}`;
  } catch (error) {
    console.error("Error saving session:", error);
    document.getElementById("status")!.textContent =
      `Error saving: ${error instanceof Error ? error.message : String(error)}`;
  }
});

document.getElementById("update")!.addEventListener("click", async () => {
  try {
    const res = await fetch("https://sync-api-production.up.railway.app/sync", {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const serverState = await res.json();
    const serverTabs = serverState.tabs || []; // Ensure serverTabs is an array

    const currentTabs = await browser.tabs.query({});
    const currentTabIds = currentTabs
      .map((t) => t.id)
      .filter((id): id is number => id !== undefined);

    if (currentTabIds.length > 0) {
      await browser.tabs.remove(currentTabIds);
    }

    for (const t of serverTabs) {
      if (t.url) {
        // Ensure URL exists
        await browser.tabs.create({ url: t.url });
      }
    }
    document.getElementById("status")!.textContent =
      "Session updated from server.";
  } catch (error) {
    console.error("Error updating session:", error);
    document.getElementById("status")!.textContent =
      `Error updating: ${error instanceof Error ? error.message : String(error)}`;
  }
});
