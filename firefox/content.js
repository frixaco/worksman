// firefox/content.ts
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
  let tabsContainer = cg("div", "worksman-tabs");
  tabsContainer.innerHTML = "";
  for (const t of ts) {
    if (t.id === undefined)
      continue;
    let tabElement = document.createElement("div");
    tabElement.className = "worksman-tab";
    tabElement.title = t.url || "";
    tabElement.innerText = t.title || "Untitled Tab";
    tabElement.addEventListener("click", () => {
      browser.runtime.sendMessage({
        action: "activateTab",
        payload: t.id
      });
    });
    tabsContainer.appendChild(tabElement);
  }
  if (!tabsContainer.parentNode) {
    overlay.appendChild(tabsContainer);
  }
}
function toggleOverlay({ tabs }) {
  console.log({ tabs });
  let overlay = document.querySelector("div#worksman-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.setAttribute("id", "worksman-overlay");
    document.body.appendChild(overlay);
  }
  const existingTabs = overlay.querySelector("#worksman-tabs");
  if (existingTabs)
    existingTabs.remove();
  const existingWorkspaces = overlay.querySelector("#worksman-workspaces");
  if (existingWorkspaces)
    existingWorkspaces.remove();
  overlay.style.display = overlay.style.display === "flex" ? "none" : "flex";
  if (overlay.style.display === "flex") {
    displayTabs(overlay, tabs);
    let workspacesDiv = document.getElementById("worksman-workspaces");
    if (workspacesDiv && workspacesDiv.parentNode) {
      workspacesDiv.parentNode.removeChild(workspacesDiv);
    }
  }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleOverlay") {
    console.log("content.js received toggleOverlay", message.payload);
    toggleOverlay(message.payload);
  }
});
