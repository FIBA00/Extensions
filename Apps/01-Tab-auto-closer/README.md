# Tab Auto-Closer Extension

Automatically closes inactive tabs after a specified duration to save memory and reduce clutter.

## Features

- **Auto-Close**: Tabs are closed after X minutes of inactivity (default: 60 mins).
- **Whitelist**: Specify domains that should never be closed.
- **Smart Checks**: Never closes the active tab, pinned tabs, or tabs playing audio.
- **Configurable**: Set your preferred timeout limit (minimum 0.5 minutes).

## Installation (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode" (toggle in top right).
3. Click "Load unpacked".
4. Select the folder `Apps/01-Tab-auto-closer`.

## Usage

- Click the extension icon to set the inactivity limit and manage the whitelist.
- The extension works silently in the background.

## Development Notes

- **Manifest V3**: Uses Alarms API for efficient background scheduling.
- **Minimum Limit**: Chrome Alarms have a minimum delay of ~30 seconds for packed extensions. For development (unpacked), it can be shorter, but we enforce 0.5 min in the UI.
