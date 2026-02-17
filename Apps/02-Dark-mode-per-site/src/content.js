// content.js
(function () {
    const hostname = window.location.hostname;
    const STORAGE_KEY = `dm_site_${hostname}`;

    // 1. Initial Check: Apply dark mode if enabled for this site
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
        const isEnabled = result[STORAGE_KEY] === true;
        if (isEnabled) {
            document.documentElement.classList.add('dm-active');
        } else {
            document.documentElement.classList.remove('dm-active');
        }
    });
})();
