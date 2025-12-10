document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn');
  const noteInput = document.getElementById('noteInput');
  const statusEl = document.getElementById('status');

  // Pre-fill with current tab info
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url) {
      noteInput.value = `${tab.title}\n${tab.url}`;
    }
  });

  saveBtn.addEventListener('click', () => {
    const content = noteInput.value;
    if (!content) return;

    statusEl.textContent = "Saving...";
    saveBtn.disabled = true;

    // Simulate saving (in production, use chrome.runtime.sendMessage to background)
    // Here we simulate the action by opening the app
    const appUrl = "http://localhost:5173"; 
    
    // We open the app with the content to trigger the "Capture" flow
    chrome.tabs.create({ 
      url: `${appUrl}?capture=${encodeURIComponent(content)}` 
    }, () => {
        window.close();
    });
  });
});