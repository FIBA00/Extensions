document.addEventListener('DOMContentLoaded', () => {
    // Load current settings
    chrome.storage.sync.get({
        inactivityLimit: 60,
        whitelist: ["google.com", "music.youtube.com"]
    }, (items) => {
        document.getElementById('limit').value = items.inactivityLimit;
        document.getElementById('whitelist').value = items.whitelist.join('\n');
    });

    // Save settings
    document.getElementById('save').addEventListener('click', () => {
        const limit = parseFloat(document.getElementById('limit').value);
        const whitelistText = document.getElementById('whitelist').value;

        // Parse whitelist: split by newline, trim, remove empty
        const whitelist = whitelistText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (limit < 0.1) {
            showStatus('Limit must be at least 0.1 minutes', 'error');
            return;
        }

        chrome.storage.sync.set({
            inactivityLimit: limit,
            whitelist: whitelist
        }, () => {
            showStatus('Settings saved!', 'success');

            // Optional: Tell background to refresh all alarms immediately
            // chrome.runtime.sendMessage({ action: 'refreshAlarms' });
        });
    });
});

function showStatus(text, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = text;
    statusEl.style.color = type === 'error' ? '#c0392b' : '#27ae60';
    setTimeout(() => {
        statusEl.textContent = '';
    }, 2000);
}
