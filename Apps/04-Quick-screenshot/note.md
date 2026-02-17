# 4. Quick Screenshot + Annotate (Lightweight)

* Feature: Capture visible tab + basic drawing tools
* Teaches: `chrome.tabs.captureVisibleTab`, canvas
* Monetization: Cloud export

## Plan: Quick Screenshot & Annotate Extension

We will build a Chrome Extension (Manifest V3) that captures the visible tab, opens it in an editor for annotation, and offers export options.

**Key Technical Concepts**

* `activeTab` permission for secure, one-click access.
* `chrome.tabs.captureVisibleTab` for taking the screenshot.
* HTML5 `<canvas>` for image rendering and drawing.
* `chrome.storage.local` to pass the image data between the capture and the editor.

**Steps**

1. **Manifest Setup**
    * Create manifest.json.
    * Permissions: `activeTab`, `storage`, `downloads` (for saving locally).
    * Action: Popup to trigger the capture.

2. **Popup (Trigger)**
    * Create `src/popup/popup.html` & `src/popup/popup.js`.
    * Add a simple "Capture Visible Area" button.
    * Implementation: On click, capture the visible tab as a data URL, save it to `chrome.storage.local`, and open `src/editor/editor.html`.

3. **Editor (Canvas & Annotation)**
    * Create `src/editor/editor.html`, `src/editor/editor.css`, and `src/editor/editor.js`.
    * [HTML] Canvas element and a toolbar (Pen, Color Picker, Undo, Clear, Save).
    * [JS] Load image from `chrome.storage`.
    * [JS] Implement basic drawing logic (mousedown, mousemove, mouseup) on the canvas context.

4. **Export Features**
    * **Local Save**: Implement "Download" button using `canvas.toDataURL()` and a dynamic link download.
    * **Cloud Export (Monetization)**: Add a "Upload to Cloud ☁️" button.
    * *Mock Implementation*: Display a purely simulated "Uploading..." toast notification or alert "Premium Feature" to demonstrate the monetization hook.

**Verification**

* Load extension unpacked.
* Open a webpage, click extension icon -> "Capture".
* Verify a new tab opens with the screenshot.
* Draw on the image (check colors/lines).
* Click "Download" to verify local file save.
* Click "Cloud Export" to verify the placeholder interaction.

**Decisions**

* **Storage**: Using `chrome.storage.local` instead of URL parameters to pass the image data, as base64 strings can be too long for URL limits.
* **UI**: Separate Editor tab instead of an injected content script overlay. This is more robust (won't break if the user navigates) and provides a dedicated workspace for the `canvas` logic.

### Summary of Implementation

1. **Manifest & Permissions**:
    * Configured manifest.json with `activeTab` for secure capturing, `storage` for passing image data, `unlimitedStorage` for handling high-res screenshots, and `downloads` for exporting.

2. **Popup (Capture Trigger)**:
    * Created `src/popup/popup.html` and `src/popup/popup.js`.
    * Clicking "Capture Visible Area" captures the current tab using `chrome.tabs.captureVisibleTab`.
    * Saves the image data URL to `chrome.storage.local`.
    * Opens the editor in a new tab.

3. **Editor (Annotation & Export)**:
    * Created `src/editor/editor.html`, `src/editor/editor.css`, and editor.js.
    * **Canvas Drawing**: Implemented freehand drawing capability with customizable color and line width.
    * **History**: Added Undo functionality to remove the last stroke.
    * **Export**:
        * **Download**: Saves the annotated image as a PNG file.
        * **Cloud Upload**: A mock implementation that simulates an upload process (Monetization hook).

### How to Test

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select 04-Quick-screenshot.
4. Open any webpage.
5. Click the extension icon in the toolbar.
6. Click **"Capture Visible Area"**.
7. A new tab will open with your screenshot.
    * Draw on it.
    * Change colors/sizes.
    * Try "Undo" and "Clear".
    * Click "Download" to save the result.
    * Click "Upload to Cloud" to see the premium feature prompt.

### File Structure

The extension is ready in 04-Quick-screenshot:

* manifest.json
* `src/popup/` (Capture logic)
* `src/editor/` (Canvas & Annotation logic)
* `icons/` (Placeholders)
