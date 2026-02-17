document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('status');
    const speedInput = document.getElementById('speed');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');

    let currentChannelId = null;
    let currentChannelName = null;

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes("youtube.com/watch")) {
        statusDiv.textContent = "Open a YouTube video first.";
        saveBtn.disabled = true;
        resetBtn.disabled = true;
        return;
    }

    // specific method to retry connection if content script is sleeping or not ready
    function getChannelInfo() {
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tab.id, { action: "getChannelInfo" }, (response) => {
                if (chrome.runtime.lastError) {
                    // Content script might not be injected or ready
                    resolve(null);
                } else {
                    resolve(response);
                }
            });
        });
    }

    const info = await getChannelInfo();

    if (info && info.id) {
        currentChannelId = info.id;
        currentChannelName = info.name;
        statusDiv.innerHTML = `<strong>${currentChannelName}</strong>`;

        // Load saved speed
        chrome.storage.sync.get(['channelSpeeds'], (data) => {
            const speeds = data.channelSpeeds || {};
            if (speeds[currentChannelId]) {
                speedInput.value = speeds[currentChannelId];
            } else {
                speedInput.value = info.currentSpeed || 1.0;
            }
        });
    } else {
        statusDiv.textContent = "Channel info not found.";
        saveBtn.disabled = true;
    }

    saveBtn.addEventListener('click', () => {
        const speed = parseFloat(speedInput.value);
        if (!currentChannelId || isNaN(speed)) return;

        chrome.storage.sync.get(['channelSpeeds'], (data) => {
            const speeds = data.channelSpeeds || {};
            speeds[currentChannelId] = speed;

            chrome.storage.sync.set({ channelSpeeds: speeds }, () => {
                statusDiv.textContent = "Saved!";
                setTimeout(() => statusDiv.innerHTML = `<strong>${currentChannelName}</strong>`, 1500);

                // Notify content script to apply immediately
                chrome.tabs.sendMessage(tab.id, { action: "updateSpeed", speed: speed });
            });
        });
    });

    resetBtn.addEventListener('click', () => {
        if (!currentChannelId) return;

        chrome.storage.sync.get(['channelSpeeds'], (data) => {
            const speeds = data.channelSpeeds || {};
            delete speeds[currentChannelId];

            chrome.storage.sync.set({ channelSpeeds: speeds }, () => {
                statusDiv.textContent = "Reset to default";
                speedInput.value = 1.0;

                // Reset video speed to 1.0 (or global default if implemented)
                chrome.tabs.sendMessage(tab.id, { action: "updateSpeed", speed: 1.0 });
            });
        });
    });
});
