// popup.ts
document.getElementById("save").addEventListener("click", async () => {
  const tabGroups = await chrome.tabGroups.query({});
  const tabs = await chrome.tabs.query({});
  const browser = { tabs, tabGroups };
  const res = await fetch("https://sync-api-production.up.railway.app/sync", {
    method: "POST",
    body: JSON.stringify(browser)
  });
  const server = await res.json();
  document.getElementById("status").textContent = JSON.stringify(server, null, 2);
});
document.getElementById("update").addEventListener("click", async () => {
  const res = await fetch("https://sync-api-production.up.railway.app/sync", {
    method: "GET"
  });
  const server = await res.json();
  const serverTabs = server.tabs;
  const tabGroups = await chrome.tabGroups.query({});
  const tabs = await chrome.tabs.query({});
  chrome.tabs.remove(tabs.map((t) => t.id).filter((id) => id !== undefined));
  for (const t of serverTabs) {
    chrome.tabs.create({ url: t.url });
  }
});
