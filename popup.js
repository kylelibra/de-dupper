document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('closeDuplicates');
    const status = document.getElementById('status');
    
    button.addEventListener('click', closeDuplicateTabs);
    
    async function closeDuplicateTabs() {
        try {
            button.disabled = true;
            button.textContent = 'Processing...';
            
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
            let closedCount = 0;
            const tabsToClose = [];
            
            Object.values(urlGroups).forEach(group => {
                if (group.length > 1) {
                    // Keep the first tab (usually the oldest) and close the rest
                    // Sort by id to keep the oldest tab
                    group.sort((a, b) => a.id - b.id);
                    
                    for (let i = 1; i < group.length; i++) {
                        tabsToClose.push(group[i].id);
                        closedCount++;
                    }
                }
            });
            
            // Close duplicate tabs
            if (tabsToClose.length > 0) {
                await chrome.tabs.remove(tabsToClose);
                showStatus(`Closed ${closedCount} duplicate tab${closedCount === 1 ? '' : 's'}`, 'success');
            } else {
                showStatus('No duplicate tabs found', 'info');
            }
            
        } catch (error) {
            console.error('Error closing duplicate tabs:', error);
            showStatus('Error occurred while closing tabs', 'error');
        } finally {
            button.disabled = false;
            button.textContent = 'Close Duplicate Tabs';
        }
    }
    
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        // Hide status after 3 seconds
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
});
