chrome.runtime.onInstalled.addListener(() => {
  console.log('Copart Data Extractor installed');
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('copart.com')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractData') {
    // https://bidmotors.bg/admin/create_from_copart_website       Production
    // http://104.248.243.255/admin/create_from_copart_website     Staging
    // http://localhost:3000/admin/create_from_copart_website      Development
    fetch('http://104.248.243.255/admin/create_from_copart_website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message.data)
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ status: 'ok', data: data });
    })
    .catch(error => {
      sendResponse({ status: 'error', error: error });
    });
    return true;
  }
});
