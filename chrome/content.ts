function cg(tag: string, id: string) {
  let el = document.getElementById(id);
  if (el != null) {
    return el;
  }
  el = document.createElement(tag);
  el.id = id;
  return el;
}

function displayTabs(overlay: HTMLDivElement, ts: chrome.tabs.Tab[]) {
  const tabs = cg("div", "worksman-tabs");
  tabs.innerHTML = "";
  for (const t of ts) {
    const btn = document.createElement("div");
    const p = document.createElement("p");
    btn.appendChild(p);

    p.className = "worksman-tab";
    p.title = t.url ?? "";
    p.innerText = t.title ?? "";
    p.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        action: "activateTab",
        payload: t.id,
      });
    });
    tabs.appendChild(p);
  }
  overlay.appendChild(tabs);
}

function toggleOverlay({
  tabs,
}: {
  tabs: chrome.tabs.Tab[];
}) {
  console.log({ tabs });
  let overlay: HTMLDivElement | null = document.querySelector(
    "div#worksman-overlay",
  );
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.setAttribute("id", "worksman-overlay");

    document.body.appendChild(overlay);
  }

  overlay.style.display = overlay.style.display === "flex" ? "none" : "flex";
  displayTabs(overlay, tabs);

  if (
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
  ) {
    document.documentElement.classList.add("dark");
  }
}

chrome.runtime.onMessage.addListener(
  (message: {
    action: "toggleOverlay";
    payload: {
      tabs: chrome.tabs.Tab[];
    };
  }) => {
    if (message.action === "toggleOverlay") {
      console.log("content.js", message.payload);
      toggleOverlay(message.payload);
    }
  },
);
