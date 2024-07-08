(() => {
  function sanitize(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/\n/g, '').trim();
  }

  function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsedTime = 0;
      
      const checkElement = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(checkElement);
          resolve(element);
        } else if (elapsedTime >= timeout) {
          clearInterval(checkElement);
          reject(new Error(`Element ${selector} not found within timeout`));
        }
        elapsedTime += interval;
      }, interval);
    });
  }

  async function extractVincode(lotDetailsArray) {
    let vincode = await waitForElement('[ng-if="unmaskingDisabled"] span')
      .then(element => element.textContent)
      .catch(() => null);
    
    if (!vincode) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('VIN:'));
      vincode = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return vincode;
  }

  async function extractLotnumber(lotDetailsArray) {
    let lotnumber = await waitForElement('#LotNumber')
      .then(element => element.textContent)
      .catch(() => null);

    if (!lotnumber) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Lot Number:'));
      lotnumber = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return lotnumber;
  }

  async function extractOdometerValue(lotDetailsArray) {
    let odometerValue = await waitForElement('.odometer-value .j-c_s-b:nth-child(1) span')
      .then(element => element.textContent)
      .catch(() => null);

    if (!odometerValue) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Odometer:'));
      odometerValue = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }

    return odometerValue ? odometerValue.replace(/\D/g, '') * 1.6 : null;
  }

  async function extractFuelType(lotDetailsArray) {
    let fuelType = await waitForElement('[data-uname="lotdetailFuelvalue"]')
      .then(element => element.textContent)
      .catch(() => null);

    if (!fuelType) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Fuel:'));
      fuelType = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return fuelType;
  }

  async function extractGearbox(lotDetailsArray) {
    let gearbox = await waitForElement('[ng-if="lotDetails.tmtp || lotDetails.htsmn==\'Y\'"] span')
      .then(element => element.textContent)
      .catch(() => null);

    if (!gearbox) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Transmission:'));
      gearbox = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return gearbox;
  }

  async function extractDrive(lotDetailsArray) {
    let drive = await waitForElement('[data-uname="DriverValue"]')
      .then(element => element.textContent)
      .catch(() => null);

    if (!drive) {
      const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Drive:'));
      drive = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
    }
    return drive;
  }

  async function extractEngineType(lotDetailsArray) {
    let engineType = await waitForElement('[data-uname="lotdetailEnginetype"]')
      .then(element => element.textContent)
      .catch(() => null);

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
      const imagesParentElement = await waitForElement('.p-galleria-thumbnail-items');
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

  async function sendData() {
    const data = await extractData();
    console.log(data);

    chrome.storage.local.get(['phoneNumber'], function(result) {
      data.phone_number = result.phoneNumber || '';
    });

    fetch('http://localhost:3000/admin/create_from_copart_website', {
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
        console.log('Response copied to clipboard');
      }).catch(err => {
        console.error('Could not copy text: ', err);
        displayCopyButton(formattedData);
      });
      // sendResponse({ status: 'ok', data: data });
    })
    .catch(error => {
      console.log('Server response:', error);
      // sendResponse({ status: 'error', error: error });
    });
  }

  function displayCopyButton(responseText) {
    const copyBtnExists = document.getElementById("copy-response-btn");
    
    if (!copyBtnExists) {
      const copyBtn = document.createElement("button");
      copyBtn.id = "copy-response-btn";
      copyBtn.innerText = "Copy Response";
      
      // Insert after bookmarkBtn
      const bookmarkBtn = document.getElementsByClassName("bookmark-btn")[0];
      bookmarkBtn.parentNode.insertBefore(copyBtn, bookmarkBtn.nextSibling);
  
      // Add click event listener to copy button
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(responseText)
        .then(() => {
          console.log('Response copied to clipboard');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
      });
    }
  }
  // function copyToClipboard(text) {
  //   navigator.clipboard.writeText(text).then(() => {
  //     console.log('Response copied to clipboard');
  //   }).catch(err => {
  //     console.error('Could not copy text: ', err);
  //   });
  // }

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

  const newVideoLoaded = async () => {
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("button");

      bookmarkBtn.className = "bookmark-btn";
      bookmarkBtn.title = "Click to send data to Bidmotors";
      bookmarkBtn.innerText = 'Send to Bidmotors!';
      bookmarkBtn.id = 'extractData';

      let youtubeLeftControls = document.getElementsByClassName("title-and-highlights")[0];
      if (!youtubeLeftControls) {
        youtubeLeftControls = document.querySelector('.lot-details-header-block').querySelector('h1.p-m-0');
        
      }
      console.log('youtubeLeftControls' + youtubeLeftControls);

      youtubeLeftControls.appendChild(bookmarkBtn);
      bookmarkBtn.addEventListener("click", sendData);
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    if (document.readyState === 'complete') {
      newVideoLoaded();
    } else {
      window.addEventListener('load', newVideoLoaded);
    }
  });
})();
