(() => {
  function sanitize(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/\n/g, '').trim();
  }

  async function extractVincode(url, lotDetailsArray) {
    let vincode;
    if (url.startsWith('https://www.copart.com/lot/')) {
      vincode = document.querySelector('[ng-if="unmaskingDisabled"] span')?.textContent;
      if (!vincode) {
        const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('VIN:'));
        vincode = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
      }
    } else {
      vincode = document.querySelector('#VIN_vehicleStats1')?.nextElementSibling?.textContent?.split(' ')[0] || null
    }
    // console.log(vincode);
    return vincode;
  }

  async function extractLotnumber(url, lotDetailsArray) {
    let lotnumber;
    if (url.startsWith('https://www.copart.com/lot/')) {
      lotnumber = document.querySelector('#LotNumber')?.textContent;
      if (!lotnumber) {
        const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Lot Number:'));
        lotnumber = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
      }
    } else {
      // TODO: if this array is needed in other methods, use them as lotDetailsArray, just depending on the url
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Stock #:'))
      lotnumber = lotDetail.nextElementSibling?.textContent || null;
    }
    // console.log(lotnumber);
    return lotnumber;
  }

  async function extractBuyNowPrice(url) {
    let buyNowPrice;
    if (url.startsWith('https://www.copart.com/lot/')) {
      buyNowPrice = document.querySelector('.buyitnow-text span')?.textContent ||
                      document.querySelector('#buyItNowBtn')?.textContent.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})? USD/)[0]
    } else {
      // TODO: if this array is needed in other methods, use them as lotDetailsArray, just depending on the url
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Buy Now Price:'))
      buyNowPrice = lotDetail.nextElementSibling?.textContent.split(' ')[0] || null;
    }
    // console.log(buyNowPrice);
    return buyNowPrice;
  }

  async function extractState(url) {
    let state;
    if (url.startsWith('https://www.copart.com/lot/')) {
      state = document.querySelector('.highlights-popover-cntnt span')?.textContent
    } else {
      // TODO: if this array is needed in other methods, use them as lotDetailsArray, just depending on the url
      state = document.querySelector('#hdnrunAndDrive_Ind').nextElementSibling.children[0].textContent
    }
    // console.log(state);
    return state;
  }

  async function extractOdometerValue(url, lotDetailsArray) {
    let odometerValue;
    if (url.startsWith('https://www.copart.com/lot/')) {
      odometerValue = document.querySelector('.odometer-value .j-c_s-b:nth-child(1) span')?.textContent;
      if (!odometerValue) {
        const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Odometer:'));
        odometerValue = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
      }
    } else {
      // TODO: if this array is needed in other methods, use them as lotDetailsArray, just depending on the url
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Odometer:'))
      odometerValue = lotDetail.nextElementSibling?.textContent || null;
    }
    // console.log(odometerValue.replace(/\D/g, '') * 1.6)
    return odometerValue ? odometerValue.replace(/\D/g, '') * 1.6 : null;
  }

  async function extractFuelType(url, lotDetailsArray) {
    let fuelType;
    if (url.startsWith('https://www.copart.com/lot/')) {
      fuelType = document.querySelector('[data-uname="lotdetailFuelvalue"]')?.textContent;

      if (!fuelType) {
        const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Fuel:'));
        fuelType = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
      }
    } else {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Fuel Type:'))
      fuelType = lotDetail.nextElementSibling?.textContent || null;
    }
    // console.log(fuelType);
    return fuelType;
  }

  async function extractGearbox(url, lotDetailsArray) {
    let gearbox;
    if (url.startsWith('https://www.copart.com/lot/')) {
      gearbox = document.querySelector('[ng-if="lotDetails.tmtp || lotDetails.htsmn==\'Y\'"] span')?.textContent;

      if (!gearbox) {
        const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Transmission:'));
        gearbox = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
      }
    } else {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Transmission:'))
      gearbox = lotDetail.nextElementSibling?.textContent
      gearbox = sanitize(gearbox).split(' ')[0] || null;
    }
    // console.log(gearbox);
    return gearbox;
  }

  async function extractDrive(url, lotDetailsArray) {
    let drive;
    if (url.startsWith('https://www.copart.com/lot/')) {
      drive = document.querySelector('[data-uname="DriverValue"]')?.textContent;

      if (!drive) {
        const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Drive:'));
        drive = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
      }
    } else {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Drive Line Type:'))
      drive = lotDetail?.nextElementSibling?.textContent || null;
    }
    // console.log(drive);
    return drive;
  }

  async function extractDamage(url) {
    let carDamage;
    if (url.startsWith('https://www.copart.com/lot/')) {
      carDamage = document.querySelector('[data-uname="lotdetailPrimarydamagevalue"]')?.textContent || null
    } else {
      // TODO: use selector labels or items?
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Primary Damage:')).parentElement
      // const lotDetail = Array.from(document.querySelectorAll('.data-list__item')).find(element => element.querySelector('.data-list__label')?.textContent.includes('Primary Damage:'))
      carDamage = lotDetail.querySelector('.data-list__value')?.textContent
    }
    // console.log(carDamage);
    return carDamage;
  }

  async function extractEngineType(url, lotDetailsArray) {
    let engineType;
    if (url.startsWith('https://www.copart.com/lot/')) {
      engineType = document.querySelector('[data-uname="lotdetailEnginetype"]')?.textContent;
      if (!engineType) {
        const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Engine Type:'));
        engineType = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
      }
    } else {
      engineType = document.querySelector('#hdnEngine_Ind').nextElementSibling?.textContent
    }
    // console.log(engineType);
    return engineType;
  }

  async function extractVehicleType(url) {
    let vehicleType;
    if (url.startsWith('https://www.copart.com/lot/')) {
      vehicleType = document.querySelector('[data-uname="lotdetailvehicletype"]')?.nextElementSibling?.textContent;
      if (!vehicleType) {
        const lotDetail = Array.from(document.querySelectorAll('strong')).find(element => element.textContent.trim() === 'Vehicle Type:')
        vehicleType = lotDetail ? lotDetail.parentElement?.textContent.trim().replace('Vehicle Type:', '').trim() : null;
      }
    } else {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Vehicle:')).parentElement
      vehicleType = lotDetail.querySelector('.data-list__value')?.textContent
    }
    console.log(vehicleType);
    return vehicleType;
  }

  async function extractLocation(url) {
    let location;
    if (url.startsWith('https://www.copart.com/lot/')) {
      location = `USA, ${sanitize(document.querySelector('[data-uname="lotdetailSaleinformationlocationvalue"]')?.textContent ||
                    document.querySelector('span[locationinfo]')?.textContent ) }` ||
                    null
    } else {
      // TODO: use selector labels or items?
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Selling Branch:')).parentElement
      // const lotDetail = Array.from(document.querySelectorAll('.data-list__item')).find(element => element.querySelector('.data-list__label')?.textContent.includes('Primary Damage:'))
      location = lotDetail.querySelector('.data-list__value')?.textContent
    }
    console.log(location);
    return location;
  }

  async function extractImages(url) {
    let urls;

    if (url.startsWith('https://www.copart.com/lot/')) {
      urls = Array.from(document.querySelectorAll('#small-img-roll .img-responsive.cursor-pointer.thumbnailImg'))
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
    } else {
      let imgElements = document.querySelector('#spacedthumbs1strow').querySelectorAll('img');
      urls = Array.from(imgElements).map(img => {
        let src = img.src.replace('&width=161&height=120', '&width=845&height=633');
        if (img.className.includes('vehicle-image__thumb--engine') || img.className.includes('vehicle-image__thumb--360')) {
          return;
        } else {
          return src;
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

  function showNotification(message) {
    let notificationBanner = document.getElementById('notificationBanner');
    // debugger;
    if (!notificationBanner) {
      notificationBanner = document.createElement('div');
      notificationBanner.id = 'notificationBanner';
      notificationBanner.className = 'notification-banner';
      window.location.href.startsWith('https://www.copart.com/lot/') ? document.body.appendChild(notificationBanner) : document.getElementsByTagName('header')[0].appendChild(notificationBanner)      
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
    const url = window.location.href;
    if (!(url.startsWith('https://www.copart.com/lot/') || url.startsWith('https://www.iaai.com/'))) {
        return { error: 'This is not a Copart or IAAI lot page.' };
    }

    const lotDetailsArray = Array.from(document.querySelectorAll('.lot-details-info'));

    const data = {
      title: sanitize(document.querySelector('h1')?.textContent.split(' ').slice(1).join(' ')),
      year: parseInt(sanitize(document.querySelector('h1')?.textContent.split(' ', 2)[0] || document.querySelector('h1')?.textContent.split(' ', 2)[1])) || null,
      vin_code: sanitize(await extractVincode(url, lotDetailsArray)),
      lot_number: sanitize(await extractLotnumber(url, lotDetailsArray)),
      // TODO: have not found bid_price on iaai page
      bid_price: sanitize(document.querySelector('.bid-price')?.textContent) || 
                 sanitize(document.querySelector('[tool-tip-pop-over] .panel-content.clearfix .clearfix.pt-5.border-top-gray:nth-child(2) span')?.textContent),
      buy_now_price: sanitize(await extractBuyNowPrice(url)),
      state: sanitize(await extractState(url)),
      millage: sanitize(await extractOdometerValue(url, lotDetailsArray)),
      fuel_type: sanitize(await extractFuelType(url, lotDetailsArray)),
      gearbox: sanitize(await extractGearbox(url, lotDetailsArray)),
      keys: sanitize(document.querySelector('[data-uname="lotdetailKeyvalue"]')?.textContent || document.querySelector('#hdnkeysPresent_Ind')?.nextElementSibling.children[0].textContent || null),
      drive_state: sanitize(await extractDrive(url, lotDetailsArray)),
      damage: sanitize(await extractDamage(url)),
      engine: sanitize(await extractEngineType(url, lotDetailsArray)),
      // TODO: Add Date parse on Bidmotors website
      auction_date: calculateAuctionDate(url),
      auction_date_label: sanitize(parsedTextDate(url)),
      location: sanitize(await extractLocation(url)),
      image_urls: await extractImages(url),
      website_url: window.location.href,
      vehicle_type: sanitize(await extractVehicleType(url))
    };

    return data;
  }

  function parsedTextDate(url) {
    let date;
    if (url.startsWith('https://www.copart.com/lot/')) {
      const dateElement = document.querySelector('[data-uname="lotdetailSaleinformationsaledatevalue"]') ||
                            document.querySelector('[data-uname="lotdetailUpcomingLotlink"]') ||
                            document.querySelector('[data-uname="lotdetailFuturelink"]') ||
                            document.querySelector('.text-blue.font_family_lato_bold.p-border-bottom-light-blue.p-cursor-pointer.p-text-nowrap');
      date = dateElement?.textContent;
    } else {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Auction Date and Time:'))
      date = lotDetail.nextElementSibling?.textContent || null;
    }
    return date || null;
  }

  function parseDateString(dateString) {
    const parts = dateString.split(/\s+/).filter(Boolean);
    const [day, month, date, time, timezone] = parts;
    const currentYear = new Date().getFullYear();
    const combinedString = `${month} ${date} ${currentYear} ${time} ${timezone}`;

    return combinedString;
  }

  function calculateAuctionDate(url) {
    const textDate = parsedTextDate(url);
    if (['Future', 'Upcoming Lot', null].includes(textDate)) return null;

    if (url.startsWith('https://www.copart.com/lot/')) {
      const timeLeftToAuction = document.querySelector('[data-uname="lotdetailSaleinformationtimeleftvalue"]')?.textContent;
      if (!timeLeftToAuction) return null;

      const matches = timeLeftToAuction.match(/(\d+)D (\d+)H (\d+)min/);
      if (!matches) return null;

      const [days, hours, minutes] = matches.slice(1, 4).map(Number);
      return new Date(Date.now() + days * 86400000 + hours * 3600000 + minutes * 60000).toISOString();
    } else {
      // console.log(parseDateString(textDate));
      return parseDateString(textDate);
    }
  }

  // No data on new interface: state(highlights), keys, damage

  function injectStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('styles.css');
    document.head.appendChild(link);
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

  const findWhereToInsertButton = async () => {
    if (window.location.href.startsWith('https://www.copart.com/lot/')) {
      return document.querySelector(".share-button.btn-white.dropdown-toggle") || document.querySelector('.lot-details-header-sprite.calendar-sprite-icon.p-position-relative.p-cursor-pointer');
    } else if (window.location.href.startsWith('https://www.iaai.com/')) {
      return document.querySelector('.vehicle-header__actions');
    } else {
      return null;
    }
  }

  const newTabLoaded = async () => {
    const sendRequestBtnExists = document.getElementsByClassName("send-to-bidmotors-btn")[0];

    if (!sendRequestBtnExists) {
      const sendRequestBtn = document.createElement("button");

      sendRequestBtn.className = "send-to-bidmotors-btn";
      sendRequestBtn.title = "Click to send data to Bidmotors";
      sendRequestBtn.innerText = 'Добавете в Bidmotors!';
      sendRequestBtn.id = 'extractData';

      let titleAndHighlights = await findWhereToInsertButton();
      titleAndHighlights.insertAdjacentElement('beforebegin', sendRequestBtn)
      sendRequestBtn.addEventListener("click", sendData);
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    if (document.readyState === 'complete') {
      newTabLoaded();
    } else {
      window.addEventListener('load', newTabLoaded);
    }
  });
  injectStyles();
})();
