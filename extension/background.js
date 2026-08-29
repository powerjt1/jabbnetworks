// JABB Networks · SENTINEL — background service worker (MV3)
// Opens the SENTINEL side panel when the toolbar icon is clicked.

chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  } catch (e) {}
});

// Fallback for browsers where setPanelBehavior isn't honored.
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (e) {
    // Some Chrome builds require windowId
    try { await chrome.sidePanel.open({ windowId: tab.windowId }); } catch (_) {}
  }
});
