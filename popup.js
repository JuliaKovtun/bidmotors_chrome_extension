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

function extractVincode(lotDetailsArray) {
  let vincode = document.querySelector('[ng-if="unmaskingDisabled"] span')?.textContent;

  if (!vincode) {
    vincode = lotDetailsArray.find(element => element.querySelector('.lot-details-label')
                             .textContent.includes('VIN:')).querySelector('.lot-details-value')?.textContent
  }
  return vincode;
}

function extractLotnumber(lotDetailsArray) {
  let lotnumber = document.getElementById('LotNumber')?.textContent;

  if (!lotnumber) {
    lotnumber = lotDetailsArray.find(element => element.querySelector('.lot-details-label')
                             .textContent.includes('Lot Number:')).querySelector('.lot-details-value')?.textContent
  }
  return lotnumber;
}

function extractOdometerValue(lotDetailsArray) {
  let odometerValue = document.querySelector('.odometer-value .j-c_s-b:nth-child(1) span')?.textContent;

  if (!odometerValue) {
    odometerValue = lotDetailsArray.find(element => element.querySelector('.lot-details-label')
                                   .textContent.includes('Odometer:')).querySelector('.lot-details-value')?.textContent;
  }

  if (odometerValue) {
    return odometerValue.replace(/\D/g, '') * 1.6;
  } else {
    return null;
  }
}

function extractFuelType(lotDetailsArray) {
  let fuelType = document.querySelector('[data-uname="lotdetailFuelvalue"]')?.textContent;

  if (!fuelType) {
    fuelType = lotDetailsArray.find(element => element.querySelector('.lot-details-label')
                              .textContent.includes('Fuel:')).querySelector('.lot-details-value')?.textContent
  }
  return fuelType;
}

function extractGearbox(lotDetailsArray) {
  let gearbox = document.querySelector('[ng-if="lotDetails.tmtp || lotDetails.htsmn==\'Y\'"] span')?.textContent

  if (!gearbox) {
    gearbox = lotDetailsArray.find(element => element.querySelector('.lot-details-label')
                             .textContent.includes('Transmission:')).querySelector('.lot-details-value')?.textContent
  }
  return gearbox;
}

function extractDrive(lotDetailsArray) {
  let drive = document.querySelector('[data-uname="DriverValue"]')?.textContent

  if (!drive) {
    drive = lotDetailsArray.find(element => element.querySelector('.lot-details-label')
                             .textContent.includes('Drive:')).querySelector('.lot-details-value')?.textContent
  }
  return drive;
}

function extractEngineType(lotDetailsArray) {
  let engineType = document.querySelector('[data-uname="lotdetailEnginetype"]')?.textContent

  if (!engineType) {
    engineType = lotDetailsArray.find(element => element.querySelector('.lot-details-label')
                                .textContent.includes('Engine Type:')).querySelector('.lot-details-value')?.textContent
  }
  return engineType;
}

function extractImages() {
  let urls = Array.from(document.querySelectorAll('#small-img-roll .img-responsive.cursor-pointer.thumbnailImg')).map(img => sanitize(img.src.replace('_thb.jpg', '_ful.jpg')))

  if (urls.length === 0){
    let imagesParentElement = document.querySelector('.p-galleria-thumbnail-items')
    const imageElements = imagesParentElement.querySelectorAll('.p-galleria-thumbnail-item-content');

    imageElements.forEach(img => {
      const url = img.querySelector('img').getAttribute('src').replace('_thb.jpg', '_ful.jpg');
      if (url) {
        urls.push(url);
      }
    });
  }

  return urls;
}

debugger;
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

  const lotDetailsArray = Array.from(document.querySelectorAll('.lot-details-info'))
  // debugger;
  const data = {
    title: sanitize(document.querySelector('h1')?.textContent.split(' ').slice(1).join(' ')),
    year: parseInt(sanitize(document.querySelector('h1')?.textContent.split(' ', 2)[0] || document.querySelector('h1')?.textContent.split(' ', 2)[1])) || null,
    vin_code: sanitize(extractVincode(lotDetailsArray)),
    lot_number: sanitize(extractLotnumber(lotDetailsArray)),
    bid_price: sanitize(document.querySelector('.bid-price')?.textContent) || 
               sanitize(document.querySelector('[tool-tip-pop-over] .panel-content.clearfix .clearfix.pt-5.border-top-gray:nth-child(2) span')?.textContent),
    buy_now_price: sanitize(document.querySelector('.buyitnow-text span')?.textContent) ||
                   sanitize(document.querySelector('#buyItNowBtn')?.textContent.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})? USD/)[0]),
    state: sanitize(document.querySelector('.highlights-popover-cntnt span')?.textContent),
    millage: sanitize(extractOdometerValue(lotDetailsArray)),
    fuel_type: sanitize(extractFuelType(lotDetailsArray)),
    gearbox: sanitize(extractGearbox(lotDetailsArray)),
    keys: sanitize(document.querySelector('[data-uname="lotdetailKeyvalue"]')?.textContent),
    drive_state: sanitize(extractDrive(lotDetailsArray)),
    damage: sanitize(document.querySelector('[data-uname="lotdetailPrimarydamagevalue"]')?.textContent),
    engine: sanitize(extractEngineType(lotDetailsArray)),
    auction_date: calculateAuctionDate(),
    auction_date_label: sanitize(parsedTextDate()),
    location: `USA, ${sanitize(document.querySelector('[data-uname="lotdetailSaleinformationlocationvalue"]')?.textContent || document.querySelector('span[locationinfo]')?.textContent ) }` || null,
    image_urls: extractImages(),
    website_url: window.location.href,
  };

  return data;
}

function parsedTextDate() {
  const dateElement = document.querySelector('[data-uname="lotdetailSaleinformationsaledatevalue"]') ||
                      document.querySelector('[data-uname="lotdetailUpcomingLotlink"]') ||
                      document.querySelector('[data-uname="lotdetailFuturelink"]') ||
                      document.querySelector('.text-blue.font_family_lato_bold.p-border-bottom-light-blue.p-cursor-pointer.p-text-nowrap');
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

// No data on new interface: state(highlights), keys, damage
