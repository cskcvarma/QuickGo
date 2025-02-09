// background.js (runs as a service worker)

// Listen for omnibox input changes to provide suggestions
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  // Get saved shortcuts from storage
  chrome.storage.sync.get(null, (items) => {
    const suggestions = Object.entries(items)
      .filter(([key]) => 
        key.toLowerCase().includes(text.toLowerCase())
      )
      .slice(0, 5) // Limit to 5 suggestions
      .map(([key, url]) => ({
        content: key,
        description: `${key} - ${url}`
      }));
    
    suggest(suggestions);
  });
});

// Listen for omnibox input entered by the user
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  if (!text) return;
  if (text.toLowerCase() === 'go') {
    // Trigger options page when user enters "go" (i.e. "go/go" command)
    chrome.runtime.openOptionsPage();
    return;
  }
  // Treat the input as a shortcut key
  const key = text; 
  chrome.storage.sync.get(key, (result) => {
    const url = result[key];
    if (!url) {
      // Shortcut not found – do nothing
      return;
    }
    // Open the URL as per the user's desired disposition
    switch (disposition) {
      case 'currentTab':
      default:
        chrome.tabs.update({ url: url });
        break;
      case 'newForegroundTab':
        chrome.tabs.create({ url: url, active: true });
        break;
      case 'newBackgroundTab':
        chrome.tabs.create({ url: url, active: false });
        break;
    }
  });
}); 