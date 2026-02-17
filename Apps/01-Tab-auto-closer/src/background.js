// Default settings
const DEFAULT_SETTINGS = {
    inactivityLimit: 60, // minutes
    whitelist: ["google.com", "music.youtube.com"],
    notifications: true
};

// Initialize settings and alarms on install/startup
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
        chrome.storage.sync.set(settings);
        refreshAllAlarms();
    });
});

chrome.runtime.onStartup.addListener(() => {
    refreshAllAlarms();
});

// Listen for storage changes to update alarms instantly
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && (changes.inactivityLimit || changes.whitelist)) {
        refreshAllAlarms();
    }
});

// Helper: Refresh alarms for all tabs based on new settings
function refreshAllAlarms() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            if (tab.active) {
                chrome.alarms.clear(`tab-${tab.id}`);
            } else {
                // Reset alarm with new time limit
                setupTabAlarm(tab.id);
            }
        });
    });
}

// Helper: Check if a URL matches the whitelist
function isWhitelisted(url, whitelist) {
    if (!url) return false;
    try {
        const hostname = new URL(url).hostname;
        return whitelist.some(domain => hostname.includes(domain));
    } catch (e) {
        return false; // Invalid URL
    }
}

// Helper: Setup alarm for a specific tab
function setupTabAlarm(tabId) {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
        // Clear existing alarm for this tab first to reset timer
        chrome.alarms.clear(`tab-${tabId}`, (wasCleared) => {
            chrome.tabs.get(tabId, (tab) => {
                if (chrome.runtime.lastError || !tab) return;

                // Don't close pinned tabs, audible tabs, or whitelisted tabs
                if (tab.pinned || tab.audible || isWhitelisted(tab.url, settings.whitelist)) {
                    return;
                }

                // Create new alarm
                chrome.alarms.create(`tab-${tabId}`, {
                    delayInMinutes: parseFloat(settings.inactivityLimit)
                });
            });
        });
    });
}

// 1. When a tab becomes active, clear its alarm and start alarms for others
chrome.tabs.onActivated.addListener((activeInfo) => {
    const tabId = activeInfo.tabId;
    const windowId = activeInfo.windowId;

    // Clear alarm for the active tab
    chrome.alarms.clear(`tab-${tabId}`);

    // Fetch all tabs in this window to ensure inactive ones have alarms running
    chrome.tabs.query({ windowId: windowId }, (tabs) => {
        tabs.forEach((tab) => {
            if (tab.id !== tabId && !tab.active) {
                // Check if alarm exists, if not, create it
                chrome.alarms.get(`tab-${tab.id}`, (alarm) => {
                    if (!alarm) {
                        setupTabAlarm(tab.id);
                    }
                });
            }
        });
    });
});

// 2. When a tab is updated (e.g. finished loading), ensure logic holds
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        if (tab.active) {
            chrome.alarms.clear(`tab-${tabId}`);
        } else {
            // If it finished loading in background, start the timer
            chrome.alarms.get(`tab-${tabId}`, (alarm) => {
                if (!alarm) setupTabAlarm(tabId);
            });
        }
    }
});

// 3. When alarm fires, close the tab
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith("tab-")) {
        const tabId = parseInt(alarm.name.replace("tab-", ""));

        chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError || !tab) {
                // Tab likely already closed manually
                return;
            }

            // Final safety check (active, audible, pinned)
            if (tab.active || tab.pinned || tab.audible) {
                // If it's active/pinned/audible, we don't close it.
                // But we should restart the timer in case it *becomes* inactive later 
                // without a full tab switch event.
                // E.g. Audio stops playing while in background.
                setupTabAlarm(tabId);
                return;
            }

            chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
                if (isWhitelisted(tab.url, settings.whitelist)) {
                    return;
                }
                // Close it
                chrome.tabs.remove(tabId);
            });
        });
    }
});

// 4. Handle audio state changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // If audio stops, we might need to start a timer if it was prevented before
    if (changeInfo.audible === false && !tab.active) {
        setupTabAlarm(tabId);
    }
    // If audio starts, we might want to clear the timer (optional, as onAlarm handles it)
    if (changeInfo.audible === true) {
        chrome.alarms.clear(`tab-${tabId}`);
    }
});
