async function save(workspace: string) {
  const tabs = await browser.tabs.query({});
  const syncData = {
    tabs: tabs.map((t) => ({
      url: t.url,
      pinned: t.pinned,
    })),
    workspace,
  };

  try {
    const res = await fetch(
      `https://sync-api-production.up.railway.app/sync/${workspace}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(syncData),
      },
    );
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
}

async function update(workspace: string) {
  try {
    const res = await fetch(
      `https://sync-api-production.up.railway.app/sync/${workspace}`,
      {
        method: "GET",
      },
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const syncData: {
      tabs: { url: string; pinned: boolean }[];
      workspace: string;
    } = await res.json();
    const syncTabs = syncData.tabs.toReversed() || [];
    const syncWorkspace = syncData.workspace || "personal";

    const currentTabs = await browser.tabs.query({});
    const currentTabIds = currentTabs
      .map((t) => t.id)
      .filter((id): id is number => id !== undefined);

    if (currentTabIds.length > 0) {
      await browser.tabs.remove(currentTabIds);
    }

    for (const t of syncTabs) {
      if (t.url) {
        await browser.tabs.create({ url: t.url, pinned: t.pinned });
      }
    }
    document.getElementById("status")!.textContent =
      "Session updated from server.";
  } catch (error) {
    console.error("Error updating session:", error);
    document.getElementById("status")!.textContent =
      `Error updating: ${error instanceof Error ? error.message : String(error)}`;
  }
}

document
  .getElementById("save-personal")!
  .addEventListener("click", async () => await save("personal"));
document
  .getElementById("save-work")!
  .addEventListener("click", async () => await save("work"));
document
  .getElementById("save-other")!
  .addEventListener("click", async () => await save("other"));

document
  .getElementById("update-personal")!
  .addEventListener("click", async () => await update("personal"));
document
  .getElementById("update-work")!
  .addEventListener("click", async () => await update("work"));
document
  .getElementById("update-other")!
  .addEventListener("click", async () => await update("other"));
