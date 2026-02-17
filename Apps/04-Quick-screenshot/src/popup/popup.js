document.getElementById('captureBtn').addEventListener('click', () => {
    // Capture visible tab of the *current window*
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            alert('Failed to capture screenshot: ' + chrome.runtime.lastError.message);
            return;
        }

        // Store the image data (dataUrl) in local storage
        chrome.storage.local.set({ screenshot: dataUrl }, () => {
            // Then open the editor page
            chrome.tabs.create({ url: chrome.runtime.getURL('src/editor/editor.html') });
        });
    });
});
