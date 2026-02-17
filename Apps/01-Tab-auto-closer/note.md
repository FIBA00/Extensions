# 1. Tab Auto-Closer

* Feature: Close tabs after X minutes of inactivity
* Teaches: `chrome.tabs`, alarms API
* Monetization: Pro version with smart rules + domain exceptions

## Plan: Tab Auto-Closer Extension

We will build a Chrome Extension (MV3) that automatically closes inactive tabs after a set duration. This helps declutter the browser and save resources.

**Key Features**

* **Auto-Close**: Close tabs that haven't been viewed for X minutes.
* **Whitelist**: Prevent specific domains (e.g., `google.com`, `localhost`) from being closed.
* **Badge Counter**: Optional visual indicator of how many tabs are being tracked (future polish).

**Files Structure**

* `manifest.json`: Configuration and permissions (`tabs`, `alarms`, `storage`).
* `src/background.js`: Service worker logic. Tracks tab activity and manages alarms.
* `src/popup/popup.html`: User interface for settings.
* `src/popup/popup.js`: Logic to save/load settings.
* `src/popup/popup.css`: Styling.

**Implementation Steps**

1. **Scaffold Project**: Create folders and `manifest.json`.
2. **Popup UI**: Build the interface to set "Minutes to Inactivity" and "Whitelist Domains".
3. **Storage Logic**: Implement `popup.js` to save these settings to `chrome.storage.sync`.
4. **Background Logic**:
    * **Tracking**: Listen for `tabs.onActivated` and `tabs.onUpdated`.
    * **Alarms**: When a tab becomes inactive (user switches away), start an alarm.
    * **Cleanup**: When a tab is closed manually or becomes active again, clear its alarm.
    * **Execution**: When an alarm fires, check the whitelist one last time, then `chrome.tabs.remove`.
5. **Initialization**: On install/startup, iterate through existing tabs to start timers for currently inactive ones.

**Verification**

* **Load Unpacked**: Load the extension in `chrome://extensions`.
* **Test**: Open a tab, switch away. Wait for the timer (set to 0.5 min for testing). Ensure it closes.
* **Whitelist Test**: Add a domain to whitelist. Open a tab for that domain, switch away. Ensure it *doesn't* close.

**Decisions**

* **Inactivity Definition**: "Not the active tab in the current window". (Simplest, most robust for MVP).
* **Minimum Timer**: 30 seconds (Chrome API limit for Alarms).
* **Permissions**: `tabs` (to read URLs for whitelist), `alarms` (scheduling), `storage` (settings).

* **Core Logic (background.js)**: Uses `chrome.alarms` to track inactivity. It automatically resets timers when you switch tabs and cancels them if you return to a tab before the timer expires.
* **Smart Safety Checks**: The extension will **NOT** close tabs that are:
  * Currently active (focused).
  * Playing audio/video (e.g., YouTube).
  * Pinned tabs.
  * Whitelisted domains (configurable).
* **Settings UI (`popup.html/js`)**: A clean interface to set the inactivity timer (in minutes) and manage your domain whitelist.

### How to Test

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the folder: 01-Tab-auto-closer.
5. **Test Run**:
    * Click the extension icon.
    * Set the timer to **0.5** (30 seconds) for quick testing.
    * Open a new tab (e.g., a news site) and then switch back to another tab.
    * Wait 30 seconds, and the inactive tab should close automatically.

The project is fully set up in your workspace. Let me know if you want to tweak any logic (e.g., changing the default whitelist)!

Made changes.
