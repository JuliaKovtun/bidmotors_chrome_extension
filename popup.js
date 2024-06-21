document.getElementById('savePhoneButton').addEventListener('click', function() {
  const phoneNumber = document.getElementById('phoneInput').value;
  const messageElement = document.getElementById('message');

  if (phoneNumber) {
      chrome.storage.local.set({ phoneNumber: phoneNumber }, function() {
          console.log('Phone number saved:', phoneNumber);
          messageElement.textContent = 'Phone number saved successfully!';
          messageElement.style.color = 'green';
      });
  } else {
      messageElement.textContent = 'Please enter a phone number.';
      messageElement.style.color = 'red';
  }
});

document.getElementById('deletePhoneButton').addEventListener('click', function() {
  chrome.storage.local.remove('phoneNumber', function() {
      console.log('Phone number deleted');
      document.getElementById('phoneInput').value = '';
      const messageElement = document.getElementById('message');
      messageElement.textContent = 'Phone number deleted successfully!';
      messageElement.style.color = 'green';
  });
});

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['phoneNumber'], function(result) {
    if (result.phoneNumber) {
      document.getElementById('phoneInput').value = result.phoneNumber;
    }
  });
});

function sanitize(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/\n/g, '').trim();
}

document.getElementById('extractData').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: extractData
      }, (results) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            displayError(chrome.runtime.lastError.message);
            return;
        }

      const data = results[0].result;
      chrome.storage.local.get(['phoneNumber'], function(result) {
        data.phone_number = result.phoneNumber || '';

        chrome.runtime.sendMessage({ action: 'extractData', data: data }, (response) => {
            if (response.status === 'ok') {
                if (response.data.status === 'failed') {
                    displayError(response.data.error);
                } else {
                    displayResult(response.data);
                }
            } else {
                displayError(response.error);
            }
        });
      });
    });
  });
});

function extractData() {
  if (!window.location.href.startsWith('https://www.copart.com/lot/')) {
    return { error: 'This is not a Copart lot page.' };
  }

  const data = {
    title: sanitize(document.querySelector('h1')?.textContent.split(' ').slice(1).join(' ')),
    year: parseInt(sanitize(document.querySelector('h1')?.textContent.split(' ', 2)[0])) || null,
    vin_code: sanitize(document.querySelector('[ng-if="unmaskingDisabled"] span')?.textContent),
    lot_number: sanitize(document.getElementById('LotNumber')?.textContent),
    bid_price: sanitize(document.querySelector('.bid-price')?.textContent) || 
               sanitize(document.querySelector('[tool-tip-pop-over] .panel-content.clearfix .clearfix.pt-5.border-top-gray:nth-child(2) span')?.textContent),
    buy_now_price: sanitize(document.querySelector('.buyitnow-text span')?.textContent),
    state: sanitize(document.querySelector('.highlights-popover-cntnt span')?.textContent),
    millage: sanitize(document.querySelector('.odometer-value .j-c_s-b:nth-child(1) span')?.textContent.replace(/\D/g, '') * 1.6) || null,
    fuel_type: sanitize(document.querySelector('[data-uname="lotdetailFuelvalue"]')?.textContent),
    gearbox: sanitize(document.querySelector('[ng-if="lotDetails.tmtp || lotDetails.htsmn==\'Y\'"] span')?.textContent),
    keys: sanitize(document.querySelector('[data-uname="lotdetailKeyvalue"]')?.textContent),
    drive_state: sanitize(document.querySelector('[data-uname="DriverValue"]')?.textContent),
    damage: sanitize(document.querySelector('[data-uname="lotdetailPrimarydamagevalue"]')?.textContent),
    engine: sanitize(document.querySelector('[data-uname="lotdetailEnginetype"]')?.textContent),
    auction_date: calculateAuctionDate(),
    auction_date_label: sanitize(parsedTextDate()),
    location: `USA, ${sanitize(document.querySelector('[data-uname="lotdetailSaleinformationlocationvalue"]')?.textContent)}` || null,
    image_urls: Array.from(document.querySelectorAll('#small-img-roll .img-responsive.cursor-pointer.thumbnailImg')).map(img => sanitize(img.src.replace('_thb.jpg', '_ful.jpg'))),
    website_url: window.location.href
  };

  return data;
}

function parsedTextDate() {
  const dateElement = document.querySelector('[data-uname="lotdetailSaleinformationsaledatevalue"]') ||
                      document.querySelector('[data-uname="lotdetailUpcomingLotlink"]') ||
                      document.querySelector('[data-uname="lotdetailFuturelink"]');
  return dateElement ? dateElement.textContent : null;
}

function calculateAuctionDate() {
  const textDate = parsedTextDate();
  if (['Future', 'Upcoming Lot', null].includes(textDate)) return null;

  const timeLeftToAuction = document.querySelector('[data-uname="lotdetailSaleinformationtimeleftvalue"]')?.textContent;
  if (!timeLeftToAuction) return null;

  const matches = timeLeftToAuction.match(/(\d+)D (\d+)H (\d+)min/);
  if (!matches) return null;

  const [days, hours, minutes] = matches.slice(1, 4).map(Number);

  return new Date(Date.now() + days * 86400000 + hours * 3600000 + minutes * 60000).toISOString();
}

function displayResult(data) {
  const resultContainer = document.getElementById('result');
  const { status, data: resultData } = data;
  resultContainer.innerHTML = `<b>Status:</b> ${status}<br><b>Data:</b><br>${resultData.replace(/\n/g, '<br>').replace(/\t/g, '')}`;
  resultContainer.style.display = 'block';
}

function displayError(error) {
  const resultContainer = document.getElementById('result');
  resultContainer.textContent = `Error: ${error}`;
  resultContainer.style.display = 'block';
}
