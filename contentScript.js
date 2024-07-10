(() => {
  function sanitize(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/\n/g, '').trim();
  }

  async function extractVincode(lotDetailsArray) {
    let vincode = document.querySelector('[ng-if="unmaskingDisabled"] span')?.textContent;

    if (!vincode) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('VIN:'));
      vincode = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return vincode;
  }

  async function extractLotnumber(lotDetailsArray) {
    let lotnumber = document.querySelector('#LotNumber')?.textContent;

    if (!lotnumber) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Lot Number:'));
      lotnumber = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return lotnumber;
  }

  async function extractOdometerValue(lotDetailsArray) {
    let odometerValue = document.querySelector('.odometer-value .j-c_s-b:nth-child(1) span')?.textContent;

    if (!odometerValue) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Odometer:'));
      odometerValue = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }

    return odometerValue ? odometerValue.replace(/\D/g, '') * 1.6 : null;
  }

  async function extractFuelType(lotDetailsArray) {
    let fuelType = document.querySelector('[data-uname="lotdetailFuelvalue"]')?.textContent;

    if (!fuelType) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Fuel:'));
      fuelType = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return fuelType;
  }

  async function extractGearbox(lotDetailsArray) {
    let gearbox = document.querySelector('[ng-if="lotDetails.tmtp || lotDetails.htsmn==\'Y\'"] span')?.textContent;

    if (!gearbox) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Transmission:'));
      gearbox = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return gearbox;
  }

  async function extractDrive(lotDetailsArray) {
    let drive = document.querySelector('[data-uname="DriverValue"]')?.textContent;

    if (!drive) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Drive:'));
      drive = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return drive;
  }

  async function extractEngineType(lotDetailsArray) {
    let engineType = document.querySelector('[data-uname="lotdetailEnginetype"]')?.textContent;

    if (!engineType) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Engine Type:'));
      engineType = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return engineType;
  }

  async function extractImages() {
    let urls = Array.from(document.querySelectorAll('#small-img-roll .img-responsive.cursor-pointer.thumbnailImg'))
      .map(img => sanitize(img.src.replace('_thb.jpg', '_ful.jpg')));

    if (urls.length === 0) {
      const imagesParentElement = document.querySelector('.p-galleria-thumbnail-items');
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

  async function getPhoneNumber() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['phoneNumber'], function(result) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.phoneNumber || '');
        }
      });
    });
  }

  async function sendData() {
    let data = await extractData();
    // console.log(data);

    // chrome.storage.local.get(['phoneNumber'], function(result) {
    //   data.phone_number = result.phoneNumber || '';
    // });

    const phoneNumber = await getPhoneNumber();
    data.phone_number = phoneNumber;

    // debugger;
    console.log('Data: ' + data)
    fetch('https://bidmotors.bg/admin/create_from_copart_website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Server response:', data);
      const formattedData = data.data.replace(/\\n/g, '\n').replace(/^\s+/gm, '').trim();
      navigator.clipboard.writeText(formattedData).then(() => {
        console.log('Отговорът е копиран!');
        showNotification('Отговорът е копиран!');
      }).catch(err => {
        console.error('Копирането на отговора не бе успешно: ', err);
        showNotification('Копирането на отговора не бе успешно.');
        displayCopyButton(formattedData);
      });
      // sendResponse({ status: 'ok', data: data });
    })
    .catch(error => {
      console.log('Server response:', error);
      showNotification('Server response:', error);
      // sendResponse({ status: 'error', error: error });
    });
  }

  function showNotification(message) {
    let notificationBanner = document.getElementById('notificationBanner');
    
    if (!notificationBanner) {
      notificationBanner = document.createElement('div');
      notificationBanner.id = 'notificationBanner';
      notificationBanner.className = 'notification-banner';
      document.body.appendChild(notificationBanner);
    }

    notificationBanner.textContent = message;
    notificationBanner.style.display = 'block';
    
    setTimeout(() => {
      notificationBanner.style.display = 'none';
    }, 3000);
  }

  function displayCopyButton(responseText) {
    const copyBtnExists = document.getElementById("copy-response-btn");
    
    if (!copyBtnExists) {
      const copyBtn = document.createElement("button");
      copyBtn.id = "copy-response-btn";
      copyBtn.className = "send-to-bidmotors-btn";
      copyBtn.innerText = "Копиране на отговор!";

      // Insert after sendRequestBtn
      const sendRequestBtn = document.getElementsByClassName("send-to-bidmotors-btn")[0];
      sendRequestBtn.parentNode.insertBefore(copyBtn, sendRequestBtn.nextSibling);

      // Add click event listener to copy button
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(responseText)
        .then(() => {
          console.log('Отговорът е копиран!');
          showNotification('Отговорът е копиран!');
        })
        .catch(err => {
          console.error('Копирането на отговора не бе успешно: ', err);
          showNotification('Копирането на отговора не бе успешно.');
        });
      });
    }
  }

  const extractData = async () => {
    if (!window.location.href.startsWith('https://www.copart.com/lot/')) {
      return { error: 'This is not a Copart lot page.' };
    }

    const lotDetailsArray = Array.from(document.querySelectorAll('.lot-details-info'));

    const data = {
      title: sanitize(document.querySelector('h1')?.textContent.split(' ').slice(1).join(' ')),
      year: parseInt(sanitize(document.querySelector('h1')?.textContent.split(' ', 2)[0] || document.querySelector('h1')?.textContent.split(' ', 2)[1])) || null,
      vin_code: sanitize(await extractVincode(lotDetailsArray)),
      lot_number: sanitize(await extractLotnumber(lotDetailsArray)),
      bid_price: sanitize(document.querySelector('.bid-price')?.textContent) || 
                 sanitize(document.querySelector('[tool-tip-pop-over] .panel-content.clearfix .clearfix.pt-5.border-top-gray:nth-child(2) span')?.textContent),
      buy_now_price: sanitize(document.querySelector('.buyitnow-text span')?.textContent) ||
                     sanitize(document.querySelector('#buyItNowBtn')?.textContent.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})? USD/)[0]),
      state: sanitize(document.querySelector('.highlights-popover-cntnt span')?.textContent),
      millage: sanitize(await extractOdometerValue(lotDetailsArray)),
      fuel_type: sanitize(await extractFuelType(lotDetailsArray)),
      gearbox: sanitize(await extractGearbox(lotDetailsArray)),
      keys: sanitize(document.querySelector('[data-uname="lotdetailKeyvalue"]')?.textContent),
      drive_state: sanitize(await extractDrive(lotDetailsArray)),
      damage: sanitize(document.querySelector('[data-uname="lotdetailPrimarydamagevalue"]')?.textContent),
      engine: sanitize(await extractEngineType(lotDetailsArray)),
      auction_date: calculateAuctionDate(),
      auction_date_label: sanitize(parsedTextDate()),
      location: `USA, ${sanitize(document.querySelector('[data-uname="lotdetailSaleinformationlocationvalue"]')?.textContent || document.querySelector('span[locationinfo]')?.textContent ) }` || null,
      image_urls: await extractImages(),
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

  // No data on new interface: state(highlights), keys, damage

  function injectStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('styles.css');
    document.head.appendChild(link);
  }

  const newCopartTabLoaded = async () => {
    const sendRequestBtnExists = document.getElementsByClassName("send-to-bidmotors-btn")[0];

    if (!sendRequestBtnExists) {
      const sendRequestBtn = document.createElement("button");

      sendRequestBtn.className = "send-to-bidmotors-btn";
      sendRequestBtn.title = "Click to send data to Bidmotors";
      sendRequestBtn.innerText = 'Добавете в Bidmotors!';
      sendRequestBtn.id = 'extractData';

      let titleAndHighlights = document.querySelector(".share-button.btn-white.dropdown-toggle");
      if (!titleAndHighlights) {
        titleAndHighlights = document.querySelector('.lot-details-header-sprite.calendar-sprite-icon.p-position-relative.p-cursor-pointer');
      }
      titleAndHighlights.insertAdjacentElement('beforebegin', sendRequestBtn)
      sendRequestBtn.addEventListener("click", sendData);
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    if (document.readyState === 'complete') {
      newCopartTabLoaded();
    } else {
      window.addEventListener('load', newCopartTabLoaded);
    }
  });
  injectStyles();
})();
