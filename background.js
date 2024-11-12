chrome.runtime.onInstalled.addListener(() => {
  console.log('Bidmotors installed');
});

// chrome.action.onClicked.addListener((tab) => {
//   if (tab.url.includes('copart.com')) {
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       files: ['content.js']
//     });
//   }
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractData') {
    // https://bidmotors.bg/admin/create_from_copart_website       Production
    // http://104.248.243.255/admin/create_from_copart_website     Staging
    // http://localhost:3000/admin/create_from_copart_website      Development
    fetch('https://bidmotors.bg/admin/create_from_copart_website', {
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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && (tab.url.includes("copart") || tab.url.includes("iaai") || tab.url.includes("manheim") || tab.url.includes("auto1") || tab.url.includes("troostwijkauctions"))) {
    chrome.tabs.sendMessage(tabId, {});
  }
});
