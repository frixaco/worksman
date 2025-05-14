// Assuming @types/firefox-webext-browser is installed for `browser` global types
// Otherwise, you might need to declare types or use `any`.

function cg(tag: string, id: string): HTMLElement {
  let el = document.getElementById(id);
  if (el != null) {
    return el;
  }
  el = document.createElement(tag);
  el.id = id;
  return el;
}

function displayTabs(overlay: HTMLDivElement, ts: browser.tabs.Tab[]) {
  let tabsContainer = cg("div", "worksman-tabs") as HTMLDivElement;
  tabsContainer.innerHTML = ""; // Clear previous tabs
  for (const t of ts) {
    // Ensure tab id exists for messaging, though it should for actual tabs
    if (t.id === undefined) continue;

    let tabElement = document.createElement("div"); // Changed from p to div for consistency if needed
    tabElement.className = "worksman-tab"; // Apply class to the div itself
    tabElement.title = t.url || "";
    tabElement.innerText = t.title || "Untitled Tab";

    tabElement.addEventListener("click", () => {
      browser.runtime.sendMessage({
        action: "activateTab",
        payload: t.id,
      });
    });
    tabsContainer.appendChild(tabElement);
  }
  if (!tabsContainer.parentNode) {
    overlay.appendChild(tabsContainer);
  }
}

// Workspace display is removed/simplified as tabGroups API is not available in Firefox
function displayWorkspaces(overlay: HTMLDivElement) {
  let workspacesDiv = document.getElementById("worksman-workspaces");
  if (workspacesDiv) {
    workspacesDiv.innerHTML = ""; // Clear or hide
    // Optionally, display a message
    // workspacesDiv.textContent = "Workspace feature (Tab Groups) is not available in Firefox.";
    // Or simply remove it if it was appended before
    if (workspacesDiv.parentNode) {
      workspacesDiv.parentNode.removeChild(workspacesDiv);
    }
  }
  // The #worksman-workspaces div might be created if cg("div", "worksman-workspaces") was called
  // We ensure it's cleaned up or not displayed if not needed.
}

interface ToggleOverlayPayload {
  tabs: browser.tabs.Tab[];
  // tabGroups and groupId are removed as they are not applicable for Firefox in this context
}

function toggleOverlay({ tabs }: ToggleOverlayPayload) {
  console.log({ tabs });
  let overlay: HTMLDivElement | null = document.querySelector(
    "div#worksman-overlay",
  );
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.setAttribute("id", "worksman-overlay");
    document.body.appendChild(overlay);
  }

  // Clear previous content to prevent duplication if re-toggled
  const existingTabs = overlay.querySelector("#worksman-tabs");
  if (existingTabs) existingTabs.remove();
  const existingWorkspaces = overlay.querySelector("#worksman-workspaces");
  if (existingWorkspaces) existingWorkspaces.remove();

  overlay.style.display = overlay.style.display === "flex" ? "none" : "flex";

  if (overlay.style.display === "flex") {
    displayTabs(overlay, tabs);
    // displayWorkspaces(overlay); // Workspace display is not used for Firefox
    // Ensure the workspaces div is not added or is removed
    let workspacesDiv = document.getElementById("worksman-workspaces");
    if (workspacesDiv && workspacesDiv.parentNode) {
      workspacesDiv.parentNode.removeChild(workspacesDiv);
    }
  }

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

browser.runtime.onMessage.addListener(
  (message: { action: "toggleOverlay"; payload: ToggleOverlayPayload }) => {
    if (message.action === "toggleOverlay") {
      console.log("content.js received toggleOverlay", message.payload);
      toggleOverlay(message.payload);
    }
  },
);
