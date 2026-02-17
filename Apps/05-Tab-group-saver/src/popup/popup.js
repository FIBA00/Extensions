document.addEventListener('DOMContentLoaded', () => {
    loadActiveGroups();
    loadSavedGroups();
});

// --- Active Groups Logic ---

async function loadActiveGroups() {
    const container = document.getElementById('active-groups-list');
    container.innerHTML = '<div class="empty-state">Loading...</div>';

    try {
        // query current window for groups
        const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });

        if (groups.length === 0) {
            container.innerHTML = '<div class="empty-state">No active groups in this window.</div>';
            return;
        }

        container.innerHTML = '';

        for (const group of groups) {
            // Get tabs for this group to count them / save them
            const tabs = await chrome.tabs.query({ groupId: group.id });

            const groupElement = createGroupElement(group, tabs.length, false);

            // Add Save Logic
            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn-primary';
            saveBtn.textContent = 'Save';
            saveBtn.onclick = (e) => saveGroup(group, tabs, e);

            groupElement.querySelector('.actions').appendChild(saveBtn);
            container.appendChild(groupElement);
        }
    } catch (error) {
        console.error('Error loading active groups:', error);
        container.innerHTML = '<div class="empty-state">Error loading groups.</div>';
    }
}

// --- Saved Groups Logic ---

async function loadSavedGroups() {
    const container = document.getElementById('saved-groups-list');
    container.innerHTML = '<div class="empty-state">Loading...</div>';

    try {
        const result = await chrome.storage.local.get('savedGroups');
        const savedGroups = result.savedGroups || [];

        if (savedGroups.length === 0) {
            container.innerHTML = '<div class="empty-state">No saved groups yet.</div>';
            return;
        }

        container.innerHTML = '';

        // Sort by newest first
        savedGroups.sort((a, b) => b.savedAt - a.savedAt);

        savedGroups.forEach(groupData => {
            const groupElement = createGroupElement(groupData, groupData.tabs.length, true);

            const actionsDiv = groupElement.querySelector('.actions');

            // Restore Button
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'btn-secondary';
            restoreBtn.textContent = 'Restore';
            restoreBtn.onclick = () => restoreGroup(groupData);

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon';
            deleteBtn.innerHTML = '&times;'; // Simple X icon
            deleteBtn.title = 'Delete saved group';
            deleteBtn.onclick = () => deleteGroup(groupData.id);

            actionsDiv.appendChild(restoreBtn);
            actionsDiv.appendChild(deleteBtn);

            container.appendChild(groupElement);
        });
    } catch (error) {
        console.error('Error loading saved groups:', error);
        container.innerHTML = '<div class="empty-state">Error loading library.</div>';
    }
}

async function saveGroup(group, tabs, event) {
    try {
        const groupData = {
            id: Date.now().toString(), // Unique ID for storage
            title: group.title || 'Untitled Group',
            color: group.color,
            savedAt: Date.now(),
            tabs: tabs.map(tab => ({
                url: tab.url,
                title: tab.title,
                pinned: tab.pinned,
                favIconUrl: tab.favIconUrl
            }))
        };

        const result = await chrome.storage.local.get('savedGroups');
        const savedGroups = result.savedGroups || [];

        savedGroups.push(groupData);

        await chrome.storage.local.set({ savedGroups });

        // Refresh the list
        loadSavedGroups();

        // Optional: Visual feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Saved!';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Error saving group:', error);
        alert('Failed to save group.');
    }
}

async function deleteGroup(id) {
    try {
        const result = await chrome.storage.local.get('savedGroups');
        let savedGroups = result.savedGroups || [];

        savedGroups = savedGroups.filter(g => g.id !== id);

        await chrome.storage.local.set({ savedGroups });
        loadSavedGroups();
    } catch (error) {
        console.error('Error deleting group:', error);
    }
}

async function restoreGroup(groupData) {
    try {
        // 1. Create the tabs
        // We need to keep track of the created tab IDs
        const tabIds = [];

        for (const tabData of groupData.tabs) {
            const createdTab = await chrome.tabs.create({
                url: tabData.url,
                active: false // Create in background
            });
            tabIds.push(createdTab.id);
        }

        // 2. Group the tabs
        // chrome.tabs.group takes an array of tabIds and returns the groupId
        const groupId = await chrome.tabs.group({ tabIds });

        // 3. Update the group metadata (title, color)
        await chrome.tabGroups.update(groupId, {
            title: groupData.title,
            color: groupData.color
        });

        // Optional: Activate the first tab of the restored group
        if (tabIds.length > 0) {
            await chrome.tabs.update(tabIds[0], { active: true });
        }

    } catch (error) {
        console.error('Error restoring group:', error);
        alert('Failed to restore group.');
    }
}

// --- UI Helper ---

function createGroupElement(data, tabCount, isSaved) {
    const div = document.createElement('div');
    div.className = 'group-item';

    const dateStr = isSaved && data.savedAt
        ? new Date(data.savedAt).toLocaleDateString()
        : `${tabCount} tabs`;

    div.innerHTML = `
    <div class="group-info">
      <div class="group-color-dot color-${data.color}"></div>
      <div class="group-details">
        <span class="group-title" title="${data.title || 'Untitled'}">${data.title || 'Untitled'}</span>
        <span class="group-meta">${dateStr}</span>
      </div>
    </div>
    <div class="actions"></div>
  `;

    return div;
}
