# Worksman Chrome Extension

- AN ATTEMPT AT SWITCHING TO BRAVE FROM ARC
- FOR PERSONAL USE

## Overview

Worksman is a Chrome extension that tries to bring Arc-like tab and workspace management to any Chromium browser.

**Note**: No sessions/profiles support so you have different logins for each workspace, this only solves tab and workspace management side (which is all I personally need).

- `cmd+t` - creating a new tab will assign it to the last "used" workspace
- `cmd+s` - to toggle the overlay that looks like Arc's sidebar, except the layout can be actually customized (e.g. left/right sidebar, popup, ...)
- `cmd+[ and cmd+]` - to switch between workspaces
- (potentiall) 3-finger swipes to switch between workspaces (also check chrome.webNavigation)
- create workspaces, set icons and title
- pin tabs and have them appear in a grid using action input
- overlay can look (and behave?) like right/left sidebar or a popup
- workspaces are synced to tab groups and pinned tabs are synced to native ones
- search history and ask questions about history using AI
- use Chrome's `storage.sync` for cross-device synchronization of settings

## Components

1. Background Script (`background.js`) - handles Chrome API interactions, synchronizes extension actions with the browser

2. Content Script (`content.js`) - handles logic for the extension UI

3. Styles (`styles.css`) - provides styling for the tab overlay

4. Options Page (`options.html`, `options.js`) - handles settings

5. Manifest (`manifest.json`) - permissions, shortcuts, icons, etc.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
