# Worksman - browser extension that tries to bring Arc-like tab and workspace management to any Chromium browser

## Go Sync API

### TODO

- [ ] Create new project and PostgeSQL database at railway.com
- [ ] Create Go REST API
    - [ ] POST `/sync` accepts tab & tab group data and saves it database as JSON
    - [ ] GET `/sync` returns that JSON as is

**Why?** I just want to switch from Arc to Brave
**Status**:

- WIP, but MVP is DONE
- extension overlay can be toggled via a shortcut
- auto add tab to a workspace
- view tabs, workspaces and switch between them

**Note**: No sessions/profiles support so you have different logins for each workspace, this only solves tab and workspace management side (which is all I personally need).

**TODO**:

- Try implementing workspace switching via 3-finger swipe
- Add pinned tabs and make it look like Arc's
- New tab should go to the top of tab list in the overlay
- Add drag'n'drop for tabs
- Add buttons to create tabs and workspaces (aka tab groups) in the extension overlay (low priority since can do this in the browser natively)
- See if I can do something for better split tab experience
- Check `storage.sync` for cross-device synchronization of settings
- History search (fun feature: AI search)
- Tab search

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
