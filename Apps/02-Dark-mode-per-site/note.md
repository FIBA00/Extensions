# 2. Dark Mode Per Site

* Feature: Enable custom CSS per domain
* Teaches: Content scripts + CSS injection
* Monetization: Paid theme packs

## Plan: Implement "Dark Mode Per Site" Extension

We will build a Chrome extension that allows users to toggle a dark theme for specific websites. The preference is saved per domain.

**Steps**

1. **Project Setup**: Create the file structure and `manifest.json`.
   * Permissions: `storage`, `activeTab`, `scripting`.
   * Content Scripts: Inject `src/content.js` and `src/styles/dark-mode.css` into all pages.
   * Background: `src/background.js` (service worker).

2. **Core Logic (`src/content.js` & `src/styles/dark-mode.css`)**
   * **Style**: Define a global dark mode using `html.dm-active { filter: invert(1) hue-rotate(180deg); }` which intelligently inverses colors while preserving hues.
   * **Logic**: `content.js` checks `chrome.storage` on load. If enabled for the current domain, it adds the `dm-active` class to `<html>`.

3. **User Interface (`src/popup/`)**
   * **UI**: A simple toggle switch in `popup.html`.
   * **Logic**: `popup.js` reads the current tab's domain, gets the storage state, updates the UI, and sends a message to `content.js` to toggle the class instantly without reloading.

**Verification**

1. Load the extension in Chrome (`chrome://extensions` > "Load unpacked").
2. Open a website (e.g., example.com) and click the extension icon.
3. Toggle the switch -> The site should instantly invert colors (Dark Mode).
4. Reload the page -> The site should remain in Dark Mode.
5. Open a different site -> It should remain in Light Mode.

**Decisions**

* **CSS Strategy**: We chose a CSS-class toggle (`html.dm-active`) over programmatic CSS injection. This ensures zero "flash of white light" on page load because the style is always present but only active when the class is added.
* **Monetization Ready**: The underlying storage structure (`{ "domain.com": "theme-name" }`) can be easily expanded later to support multiple theme packs as requested.

## Plan: Implement "Dark Mode Per Site" Extension

We will build a Chrome extension that allows users to toggle a dark theme for specific websites. The preference is saved per domain.

**Steps**

1. **Project Setup**: Create the file structure and `manifest.json`.
   * Permissions: `storage`, `activeTab`, `scripting`.
   * Content Scripts: Inject `src/content.js` and `src/styles/dark-mode.css` into all pages.
   * Background: `src/background.js` (service worker).

2. **Core Logic (`src/content.js` & `src/styles/dark-mode.css`)**
   * **Style**: Define a global dark mode using `html.dm-active { filter: invert(1) hue-rotate(180deg); }` which intelligently inverses colors while preserving hues.
   * **Logic**: `content.js` checks `chrome.storage` on load. If enabled for the current domain, it adds the `dm-active` class to `<html>`.

3. **User Interface (`src/popup/`)**
   * **UI**: A simple toggle switch in `popup.html`.
   * **Logic**: `popup.js` reads the current tab's domain, gets the storage state, updates the UI, and sends a message to `content.js` to toggle the class instantly without reloading.

**Verification**

1. Load the extension in Chrome (`chrome://extensions` > "Load unpacked").
2. Open a website (e.g., example.com) and click the extension icon.
3. Toggle the switch -> The site should instantly invert colors (Dark Mode).
4. Reload the page -> The site should remain in Dark Mode.
5. Open a different site -> It should remain in Light Mode.

**Decisions**

* **CSS Strategy**: We chose a CSS-class toggle (`html.dm-active`) over programmatic CSS injection. This ensures zero "flash of white light" on page load because the style is always present but only active when the class is added.
* **Monetization Ready**: The underlying storage structure (`{ "domain.com": "theme-name" }`) can be easily expanded later to support multiple theme packs as requested.
