document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggle-dark-mode');
    const siteNameEl = document.getElementById('site-name');
    const statusText = document.getElementById('status-text');

    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.url) return;

        // Extract hostname
        const url = new URL(activeTab.url);
        const hostname = url.hostname;
        siteNameEl.textContent = hostname;

        const STORAGE_KEY = `dm_site_${hostname}`;

        // Load saved state
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
            const isEnabled = result[STORAGE_KEY] === true;
            updateUI(isEnabled);
        });

        // Listen for changes
        toggleSwitch.addEventListener('change', () => {
            const isEnabled = toggleSwitch.checked;

            // Save state
            chrome.storage.sync.set({ [STORAGE_KEY]: isEnabled }, () => {
                updateUI(isEnabled);

                // Reload the active tab to apply changes cleanly
                chrome.tabs.reload(activeTab.id);
            });
        });
    });

    function updateUI(isEnabled) {
        toggleSwitch.checked = isEnabled;
        statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
    }
});
