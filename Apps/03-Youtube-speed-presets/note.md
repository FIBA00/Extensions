# YouTube Speed Presets

This creates a preset system, where you can set a specific playback speed (e.g., 2.0x, 1.5x) for an entire YouTube channel. The next time you watch a video from that channel, it will automatically apply your preferred speed.

## Features

- **Auto-Detect Channel**: Identifies the currently playing video's channel.
- **Save Presets**: Store a preferred speed for any channel.
- **Auto-Apply**: On navigation, checks if a preset exists and applies it to the video player.
- **Toast Notification**: Shows a small confirmation when speed is auto-applied.

## Technical Implementation

- **Manifest V3**: Uses modern extension architecture.
- **Content Script (`src/content.js`)**:
  - Monitors URL changes (SPA navigation).
  - Detects Channel ID via `<meta itemprop="channelId">`.
  - Manipulates `<video>` element `playbackRate`.
- **Storage**: Uses `chrome.storage.sync` to persist settings across devices.
- **Popup UI**: Simple interface to view current channel and save/reset speed.

## Setup Instructions

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in top right).
3. Click **Load unpacked**.
4. Select the `Apps/03-Youtube-speed-presets` folder.
5. Go to YouTube, open a video, and click the extension icon to set a speed.

### Implementation Summary

1. **Manifest V3 (manifest.json)**:
    - Configured with `storage` and host permissions for `youtube.com`.
    - Injects content.js automatically on YouTube pages.

2. **Content Script (content.js)**:
    - **Channel Detection**: Reads the channel ID from the page's meta tags (`itemprop="channelId"`).
    - **SPA Navigation**: Uses a `MutationObserver` to detect when you navigate between videos without reloading the page.
    - **Speed Control**: Automatically sets the `<video>` element's `playbackRate` if a saved preset matches the current channel.
    - **Feedback**: Shows a small non-intrusive toast notification when a speed is auto-applied.

3. **Popup UI (`src/popup/`)**:
    - Displays the current channel name.
    - Allows setting a custom speed (0.25x - 4.0x).
    - **Save**: Stores the preference in Chrome Sync storage.
    - **Reset**: Removes the preset for the current channel.

### How to Test

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the folder: 03-Youtube-speed-presets.
5. Open a YouTube video.
6. Click the extension icon to set a speed (e.g., 2.0x) and click **Save**.
7. Reload the page or click another video from the same channel to verify it auto-applies.

Made changes.
