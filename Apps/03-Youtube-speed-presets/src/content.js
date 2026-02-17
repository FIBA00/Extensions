// content.js
// Runs on youtube.com to manage playback speed based on channel.

let currentChannelId = null;
let currentVideo = null;
let currentSpeed = 1.0;
let lastUrl = location.href;

// Initialize
init();

// Use MutationObserver for robust SPA navigation detection
const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        handleNavigation();
    }

    const video = document.querySelector('video');
    if (video && video !== currentVideo) {
        currentVideo = video;
        console.log("[YT Speed] Video element changed");
        applySpeed(); // Re-apply if video element changed
    }
});
observer.observe(document.body, { childList: true, subtree: true });

function init() {
    handleNavigation();
}

function handleNavigation() {
    // Only care about watch pages
    if (!location.pathname.startsWith('/watch')) return;

    console.log("[YT Speed] Navigation detected");
    currentChannelId = null;

    // Channel info loads asynchronously. Retry a few times.
    waitForChannelInfo();
}

function waitForChannelInfo(attempts = 0) {
    if (attempts > 10) return; // Give up after ~5s

    const channelId = getChannelId();
    if (channelId) {
        currentChannelId = channelId;
        console.log(`[YT Speed] Channel identified: ${channelId}`);
        applySpeed();
    } else {
        setTimeout(() => waitForChannelInfo(attempts + 1), 500);
    }
}

function getChannelId() {
    // 1. Try meta tag (most reliable for ID)
    const meta = document.querySelector('meta[itemprop="channelId"]');
    if (meta) return meta.content;

    // 2. Try link in owner container
    const link = document.querySelector('#owner #channel-name a');
    if (link) {
        const href = link.getAttribute('href');
        return href ? href.split('/').pop() : null;
    }

    return null;
}

function getChannelName() {
    const link = document.querySelector('link[itemprop="name"]');
    if (link) return link.getAttribute('content');

    const text = document.querySelector('#owner #channel-name a');
    return text ? text.innerText : "Unknown Channel";
}

async function applySpeed() {
    if (!currentChannelId || !currentVideo) return;

    try {
        const data = await chrome.storage.sync.get(['channelSpeeds', 'defaultSpeed']);
        const channelSpeeds = data.channelSpeeds || {};

        let targetSpeed = 1.0;
        if (channelSpeeds[currentChannelId]) {
            targetSpeed = parseFloat(channelSpeeds[currentChannelId]);
        } else if (data.defaultSpeed) {
            targetSpeed = parseFloat(data.defaultSpeed);
        }

        if (!isNaN(targetSpeed) && currentVideo.playbackRate !== targetSpeed) {
            currentVideo.playbackRate = targetSpeed;
            currentSpeed = targetSpeed;
            console.log(`[YT Speed] Applied preset speed: ${targetSpeed}x`);
            showToast(`Speed set to ${targetSpeed}x`);
        }
    } catch (err) {
        console.error("Error fetching presets:", err);
    }
}

function showToast(msg) {
    let toast = document.getElementById('yt-speed-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'yt-speed-toast';
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '80px', // Just above player controls usually
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '4px',
            fontFamily: 'Roboto, Arial, sans-serif',
            fontSize: '14px',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s',
            pointerEvents: 'none'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';

    // Clear previous timeout if exists (simple debounce)
    if (toast.timeout) clearTimeout(toast.timeout);

    toast.timeout = setTimeout(() => {
        toast.style.opacity = '0';
    }, 2000);
}

// Listen for messages from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getChannelInfo") {
        sendResponse({
            id: currentChannelId || getChannelId(),
            name: getChannelName(),
            currentSpeed: currentVideo ? currentVideo.playbackRate : 1.0
        });
    } else if (request.action === "updateSpeed") {
        if (currentVideo) {
            currentVideo.playbackRate = parseFloat(request.speed);
            showToast(`Speed updated: ${request.speed}x`);
        }
    }
});
