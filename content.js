// content.ts
function cg(tag, id) {
  let el = document.getElementById(id);
  if (el != null) {
    return el;
  }
  el = document.createElement(tag);
  el.id = id;
  return el;
}
function displayTabs(overlay, ts) {
  let tabs = cg("div", "worksman-tabs");
  tabs.innerHTML = "";
  for (const t of ts) {
    let btn = document.createElement("div");
    let p = document.createElement("p");
    btn.appendChild(p);
    p.className = "worksman-tab";
    p.title = t.url;
    p.innerText = t.title;
    p.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        action: "activateTab",
        payload: t.id
      });
    });
    tabs.appendChild(p);
  }
  overlay.appendChild(tabs);
}
function displayWorkspaces(overlay, tabGroups, groupId) {
  let workspaces = cg("div", "worksman-workspaces");
  workspaces.innerHTML = "";
  for (const tg of tabGroups) {
    let btn = document.createElement("button");
    btn.className = "worksman-workspace-button";
    if (tg.id === groupId) {
      btn.classList.add("worksman-workspace-active");
    }
    btn.title = String(tg?.title || tg.id);
    btn.textContent = String(tg?.title || tg.id)[0] || "x";
    btn.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        action: "setActiveWorkspace",
        payload: tg.id
      });
    });
    workspaces.append(btn);
  }
  overlay.appendChild(workspaces);
}
function toggleOverlay({
  tabs,
  tabGroups,
  groupId
}) {
  console.log({ tabs, tabGroups });
  let overlay = document.querySelector("div#worksman-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.setAttribute("id", "worksman-overlay");
    document.body.appendChild(overlay);
  }
  overlay.style.display = overlay.style.display === "flex" ? "none" : "flex";
  displayTabs(overlay, tabs);
  displayWorkspaces(overlay, tabGroups, groupId);
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  }
}
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleOverlay") {
    console.log("content.js", message.payload);
    toggleOverlay(message.payload);
  }
});
