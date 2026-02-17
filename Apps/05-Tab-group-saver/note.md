# 5. Tab Group Saver

* Feature: Save & restore tab groups
* Teaches: Chrome session management
* Monetization: Sync across devices

## Plan: Tab Group Saver MPV

We will build a Chrome Extension to save active tab groups (including their tabs, titles, and colors) to local storage and restore them later. This MVP uses `chrome.storage.local` to avoid sync quota limits, with "Cloud Sync" reserved for a future update/backend.

**Steps**

1. **Project Setup & Manifest**
    * Create `manifest.json` with permissions: `tabGroups`, `tabs`, `storage`.
    * Set up icons directory (placeholders).
    * Define `action` pointing to `src/popup/popup.html`.

2. **Popup UI Implementation**
    * Create src/popup/popup.html with two main sections:
        * **Current Groups**: List of active windows/groups with a "Save" button.
        * **Saved Library**: List of saved groups with "Restore" and "Delete" buttons.
    * Create src/popup/popup.css for clean, compact styling (matching Chrome's native look).

3. **Core Logic (Storage Service)**
    * Create a helper in src/popup/popup.js to manage `chrome.storage.local`:
        * `saveGroup(groupData)`: Appends new group to the stored list.
        * `getSavedGroups()`: Retrieves the list.
        * `removeGroup(id)`: Deletes a specific group.

4. **Core Logic (Tab & Group Management)**
    * Implement `loadActiveGroups()` in `popup.js`:
        * Query `chrome.tabGroups.query({})` to find active groups.
        * For each group, query `chrome.tabs.query({ groupId })` to get its tabs.
    * Implement `restoreGroup(savedGroup)`:
        * Create tabs using `chrome.tabs.create({ url, active: false })`.
        * Collect the new tab IDs.
        * Group them using `chrome.tabs.group({ tabIds })`.
        * Update the new group's metadata (title, color) using `chrome.tabGroups.update()`.

5. **User Interaction**
    * Wire up "Save", "Restore", and "Delete" buttons in `popup.js`.
    * Add basic feedback (e.g., "Group Saved!" toast or button text change).

**Verification**

* **Save Test**: Open 3 tabs, group them "Research" (Blue). Click "Save" in extension. Verify it appears in "Saved Library". Close the group manually.
* **Restore Test**: Click "Restore" on the saved "Research" group. detailed checks:
  * Verify a new group "Research" (Blue) is created.
  * Verify all 3 tabs are opened within it.
* **Persistence**: Restart Chrome -> Open extension -> Verify "Saved Library" still shows the group.

**Decisions**

* **Storage**: Using `chrome.storage.local` instead of `sync`. `sync` has a 100KB total quota (8KB per item), which is too small for saving multiple groups with many URLs. "Sync across devices" will be a future paid/backend feature.
* **Context**: Restoration will happen in the *current* window to maintain flow, rather than opening a new window.

1. **Structure**:
    * `manifest.json`: Configured with `tabGroups`, `tabs`, and `storage` permissions.
    * `src/popup/popup.html`: The UI for listing Active and Saved groups.
    * `src/popup/popup.js`: The logic for saving, restoring, and deleting groups.
    * `src/popup/popup.css`: Styling that mimics Chrome's native look and feel.

2. **Features**:
    * **Save Groups**: Detects active tab groups in the current window and lets you save them with one click.
    * **Restore Groups**: Re-creates the group (tabs + title + color) in your current window.
    * **Persistence**: Uses `chrome.storage.local` so your saved groups persist across browser restarts (without hitting the small sync quota).
    * **UI Feedback**: Shows tab counts, colors, and saved dates.

You can now load this extension in Chrome:

1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right).
3. Click "Load unpacked" (top left).
4. Select the folder: 05-Tab-group-saver.

Try creating a few tab groups in your browser, open the extension popup, and save them!
