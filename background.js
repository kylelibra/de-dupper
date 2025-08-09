// Background script for the Duplicate Tab Closer extension
// This runs in the background and handles extension lifecycle events

chrome.runtime.onInstalled.addListener(() => {
    console.log('Duplicate Tab Closer extension installed');
});

// Optional: Add keyboard shortcut support
chrome.commands.onCommand.addListener((command) => {
    if (command === 'close-duplicates') {
        closeDuplicateTabs();
    }
});

async function closeDuplicateTabs() {
    try {
        // Get all tabs
        const tabs = await chrome.tabs.query({});
        
        // Group tabs by URL
        const urlGroups = {};
        tabs.forEach(tab => {
            if (!urlGroups[tab.url]) {
                urlGroups[tab.url] = [];
            }
            urlGroups[tab.url].push(tab);
        });
        
        // Find duplicates and close them
        const tabsToClose = [];
        
        Object.values(urlGroups).forEach(group => {
            if (group.length > 1) {
                // Keep the first tab (usually the oldest) and close the rest
                group.sort((a, b) => a.id - b.id);
                
                for (let i = 1; i < group.length; i++) {
                    tabsToClose.push(group[i].id);
                }
            }
        });
        
        // Close duplicate tabs
        if (tabsToClose.length > 0) {
            await chrome.tabs.remove(tabsToClose);
            console.log(`Closed ${tabsToClose.length} duplicate tabs`);
        }
        
    } catch (error) {
        console.error('Error closing duplicate tabs:', error);
    }
}
