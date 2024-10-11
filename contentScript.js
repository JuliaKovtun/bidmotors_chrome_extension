(() => {
  // TODO: Refactor into classes using polymorphism
  function sanitize(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/\n/g, '').trim();
  }

  async function extractTitle(url) {
    let title;
    if (url.startsWith('https://www.auto1.com/')) {
      title = document.querySelector('.car-info-title')?.children[0]?.textContent;
    } else {
      title = document.querySelector('h1')?.textContent.split(' ').slice(1).join(' ') || document.querySelector('.ListingTitle__title')?.textContent.split(' ').slice(1).join(' ')
    }
    return title;
  }

  async function extractYear(url) {
    let year;
    if (url.startsWith('https://www.auto1.com/')) {
      year = [...document.querySelectorAll('td')].find(td => td.textContent.includes('Build year'))?.nextElementSibling?.textContent.trim();
    } else {
      year = document.querySelector('h1')?.textContent.split(' ', 2)[0] ||
              document.querySelector('h1')?.textContent.split(' ', 2)[1] ||
              document.querySelector('.ListingTitle__title')?.textContent.split(' ', 2)[0]
    }
    return year;
  }

  async function extractVincode(url, lotDetailsArray) {
    let vincode;
    if (url.startsWith('https://www.copart.com/lot/')) {
      vincode = document.querySelector('[ng-if="unmaskingDisabled"] span')?.textContent;
      if (!vincode) {
        const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('VIN:'));
        vincode = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
      }
    } else if (url.startsWith('https://www.iaai.com/')) {
      vincode = document.querySelector('#VIN_vehicleStats1')?.nextElementSibling?.textContent?.split(' ')[0] || null
    } else if (url.startsWith('https://www.auto1.com/')) {
      vincode = [...document.querySelectorAll('td')].find(td => td.textContent.includes('VIN'))?.nextElementSibling?.textContent;
    } else {
      vincode = document.querySelector('.Vin__container')?.textContent || null;
    }
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
    }  else if (url.startsWith('https://www.iaai.com/')) {
      // TODO: if this array is needed in other methods, use them as lotDetailsArray, just depending on the url
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Stock #:'))
      lotnumber = lotDetail?.nextElementSibling?.textContent || null;
    } else if (url.startsWith('https://www.auto1.com/')) {
      lotnumber = document.querySelector('.stock-number-value')?.textContent;
    } else {
      lotnumber = null;
    }
    return lotnumber;
  }

  async function extractBuyNowPrice(url) {
    let buyNowPrice;
    if (url.startsWith('https://www.copart.com/lot/')) {
      buyNowPrice = document.querySelector('.buyitnow-text span')?.textContent ||
                      document.querySelector('#buyItNowBtn')?.textContent.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})? USD/)[0]
    } else if (url.startsWith('https://www.iaai.com/')) {
      // TODO: if this array is needed in other methods, use them as lotDetailsArray, just depending on the url
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Buy Now Price:'))
      buyNowPrice = lotDetail?.nextElementSibling?.textContent.split(' ')[0] || null;
    } else if (url.startsWith('https://www.auto1.com/')) {
      buyNowPrice = document.querySelector('.buy-now-block__price-value')?.childNodes[0]?.textContent?.trim() ||
        document.querySelector("div[data-qa-id='ip_price_value']")?.textContent || null;
    } else {
      buyNowPrice = document.querySelector('.bid-buy__amount')?.textContent || null;
    }
    return buyNowPrice;
  }

  async function extractBidPrice(url) {
    let bidPrice;

    if (url.startsWith('https://www.auto1.com/')) {
      bidPrice = document.querySelector('.money-value')?.firstChild?.textContent
    } else {
      bidPrice = document.querySelector('.bid-price')?.textContent ||
        document.querySelector('[tool-tip-pop-over] .panel-content.clearfix .clearfix.pt-5.border-top-gray:nth-child(2) span')?.textContent ||
        document.querySelector('.bid-buy__amount')?.textContent
    }
    return bidPrice;
  }

  // TODO: No state on AUTO1 ?
  async function extractState(url) {
    let state;
    if (url.startsWith('https://www.copart.com/lot/')) {
      state = document.querySelector('.highlights-popover-cntnt span')?.textContent
    } else if (url.startsWith('https://www.iaai.com/')) {
      state = document.querySelector('#hdnrunAndDrive_Ind').nextElementSibling.children[0].textContent
    } else {
      state = null;
    }
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
    } else if (url.startsWith('https://www.iaai.com/'))  {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Odometer:'))
      odometerValue = lotDetail?.nextElementSibling?.textContent || null;
    } else if (url.startsWith('https://www.auto1.com/')) {
      odometerValue = [...document.querySelectorAll('td')].find(td => td.textContent.includes('Odometer reading'))?.nextElementSibling?.textContent.replace(/\D/g, '');

      return odometerValue;
    } else {
      odometerValue = document.querySelector('.OdometerInfo__container')?.textContent || null;
    }

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
    } else if (url.startsWith('https://www.iaai.com/')) {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Fuel Type:'))
      fuelType = lotDetail?.nextElementSibling?.textContent || null;
    } else if (url.startsWith('https://www.auto1.com/')) {
      fuelType = [...document.querySelectorAll('td')].find(td => td.textContent.includes('Fuel type'))?.nextElementSibling?.textContent;
    } else {
      fuelType = document.querySelector('.EngineInfo__fuel-type')?.textContent
    }
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
    } else if (url.startsWith('https://www.iaai.com/')) {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Transmission:'))
      gearbox = lotDetail?.nextElementSibling?.textContent
      gearbox = sanitize(gearbox).split(' ')[0] || null;
    } else if (url.startsWith('https://www.auto1.com/')) {
      gearbox = [...document.querySelectorAll('td')].find(td => td.textContent.includes('Gear box'))?.nextElementSibling?.textContent;
    } else {
      let shortGearbox =  document.querySelector('.EngineInfo__transmission')?.textContent || null;
      gearbox = (shortGearbox && shortGearbox == 'Auto') ? 'Automatic' : 'Manual'
    }
    return gearbox;
  }

  async function extractKeys(url) {
    let keys;
    if (url.startsWith('https://www.copart.com/lot/')) {
      keys = document.querySelector('[data-uname="lotdetailKeyvalue"]')?.textContent || null;
    } else if (url.startsWith('https://www.iaai.com/')) {
      keys = document.querySelector('#hdnkeysPresent_Ind')?.nextElementSibling.children[0].textContent || null;
    } else if (url.startsWith('https://www.auto1.com/')) {
      keysNumber = [...document.querySelectorAll('td')].find(td => td.textContent.includes('Keys'))?.nextElementSibling?.textContent;
      keys = keysNumber == '0' ? null : 'YES'
    } else {
      keysNumber = document.querySelector('.dashboard-icon__label')?.textContent.split('')[3]
      keys = keysNumber == '0' ? null : 'YES'
    }
    return keys;
  }

  // TODO: No drive on AUTO1 ?
  async function extractDrive(url, lotDetailsArray) {
    let drive;
    if (url.startsWith('https://www.copart.com/lot/')) {
      drive = document.querySelector('[data-uname="DriverValue"]')?.textContent;
      if (!drive) {
        const lotDetail = lotDetailsArray.find(element => element.querySelector('.lot-details-label').textContent.includes('Drive:'));
        drive = lotDetail ? lotDetail.querySelector('.lot-details-value')?.textContent : null;
      }
    } else if (url.startsWith('https://www.iaai.com/')) {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Drive Line Type:'))
      drive = lotDetail?.nextElementSibling?.textContent || null;
    } else {
      let shortDrive = document.querySelector('.DriveTrain__container')?.textContent.replace('•', '')
      switch (shortDrive) {
        case '2WD':
          drive = "Two-Wheel Drive";
          break;
        case '4WD':
          drive = "Four-Wheel Drive";
          break;
        case 'AWD':
          drive = "All-Wheel Drive";
          break;
        case 'FWD':
          drive = "Front-Wheel Drive";
          break;
        case 'RWD':
          drive = "Rear-Wheel Drive";
          break;
        default:
          drive = null;
      }
    }
    return drive;
  }

  async function extractDamage(url) {
    let carDamage;
    if (url.startsWith('https://www.copart.com/lot/')) {
      carDamage = document.querySelector('[data-uname="lotdetailPrimarydamagevalue"]')?.textContent || null
    } else if (url.startsWith('https://www.iaai.com/')) {
      // TODO: use selector labels or items?
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Primary Damage:')).parentElement
      // const lotDetail = Array.from(document.querySelectorAll('.data-list__item')).find(element => element.querySelector('.data-list__label')?.textContent.includes('Primary Damage:'))
      carDamage = lotDetail?.querySelector('.data-list__value')?.textContent
    } else if (url.startsWith('https://www.auto1.com/')) {
      table = document.querySelector('div[data-testid="area-table"]');
      if (table) {
        carDamage = Array.from(table?.children).map(row => row.firstElementChild?.textContent.trim()).filter(part => part);
        carDamage.shift();
        carDamage = carDamage.join(', ');
      } else {
        carDamage = null;
      }
    } else {
      carDamage = null;
    }
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
    } else if (url.startsWith('https://www.iaai.com/')) {
      engineType = document.querySelector('#hdnEngine_Ind').nextElementSibling?.textContent
    } else if (url.startsWith('https://www.auto1.com/')) {
      engineType = [...document.querySelectorAll('td')].find(td => td.textContent.includes('Cylinder capacity'))?.nextElementSibling?.textContent;
    } else {
      engineType = document.querySelector('.EngineInfo__displacement')?.textContent + ' ' + document.querySelector('.EngineInfo__engine')?.textContent;
    }
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
    } else if (url.startsWith('https://www.iaai.com/')) {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Vehicle:')).parentElement
      vehicleType = lotDetail?.querySelector('.data-list__value')?.textContent
    } else {
      vehicleType = null;
    }

    return vehicleType;
  }

  async function extractLocation(url) {
    let location;
    if (url.startsWith('https://www.copart.com/lot/')) {
      location = `USA, ${sanitize(document.querySelector('[data-uname="lotdetailSaleinformationlocationvalue"]')?.textContent ||
                    document.querySelector('span[locationinfo]')?.textContent ) }` ||
                    null
    } else if (url.startsWith('https://www.iaai.com/')) {
      // TODO: use selector labels or items?
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Selling Branch:')).parentElement
      // const lotDetail = Array.from(document.querySelectorAll('.data-list__item')).find(element => element.querySelector('.data-list__label')?.textContent.includes('Primary Damage:'))
      location = lotDetail?.querySelector('.data-list__value')?.textContent
    } else if (url.startsWith('https://www.auto1.com/')) {
      let location_title = Array.from(document.querySelectorAll('*')).find(element => element.textContent.trim() === 'Car location');
      location = location_title?.nextElementSibling?.textContent.trim();
    } else {
      location = document.querySelector('[data-test-id="pickup-location-container"]')?.textContent || null;
    }
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
    } else if (url.startsWith('https://www.iaai.com/')) {
      let imgElements = document.querySelector('#spacedthumbs1strow').querySelectorAll('img');
      urls = Array.from(imgElements).map(img => {
        let src = img.src.replace('&width=161&height=120', '&width=845&height=633');
        if (img.className.includes('vehicle-image__thumb--engine') || img.className.includes('vehicle-image__thumb--360')) {
          return;
        } else {
          return src;
        }
      });
    } else if (url.startsWith('https://www.auto1.com/')) {
      // to get bigger image add 'max-' before the image name
      urls = Array.from(document.querySelector('.image-gallery-thumbnails-container')
                  .querySelectorAll('img'))
                  .map(element => element.getAttribute('src'));

    } else {
      let imgElements = Array.from(document.getElementsByClassName('svfy_scroller')[0]?.children)

      urls = imgElements.map(element => {
        img_url = element.querySelector('img').src
        if (img_url?.includes('images.cdn.manheim')) {
          return img_url?.replace('?size=w86h64', '');
        } else if (img_url?.includes('_thumb')) {
          return img_url?.replace('_thumb', '');
        } else {
          return img_url;
        }
      });
    }
    return urls;
  }

  async function extractThreeSixtyUrl(url) {
    if (url.startsWith('https://www.iaai.com/') && document.querySelector('.vehicle-image__thumb--360')) {
      return document.getElementById('360imagesModal')?.querySelector('iframe')?.src
    }
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
    let notificationBanner = document.getElementById('notificationBannerBidmotors');

    if (!notificationBanner) {
      notificationBanner = document.createElement('div');
      notificationBanner.id = 'notificationBannerBidmotors';
      notificationBanner.className = 'notification-banner-bidmotors';
      window.location.href.startsWith('https://www.copart.com/lot/') || window.location.href.startsWith('https://www.auto1.com/') ? document.body.insertBefore(notificationBanner, document.body.firstChild) : document.getElementsByTagName('header')[0].appendChild(notificationBanner)      
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
      if (window.location.href.startsWith('https://www.auto1.com/')) {
        copyBtn.className = "send-to-bidmotors-btn auto1-button";
      }
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
    if (!(url.startsWith('https://www.copart.com/lot/') || url.startsWith('https://www.iaai.com/') || url.startsWith('https://search.manheim.com/') || url.startsWith('https://www.auto1.com/'))) {
      return { error: 'This is not a Copart, IAAI or Manheim lot page.' };
    }

    const lotDetailsArray = Array.from(document.querySelectorAll('.lot-details-info'));

    const data = {
      title: sanitize(await extractTitle(url)),
      year: parseInt(sanitize(await extractYear(url)))|| null,
      vin_code: sanitize(await extractVincode(url, lotDetailsArray)),
      // TODO: no lot_number on manheim website
      lot_number: sanitize(await extractLotnumber(url, lotDetailsArray)),
      // TODO: have not found bid_price on iaai page and on manheim
      bid_price: sanitize(await extractBidPrice(url)),
      buy_now_price: sanitize(await extractBuyNowPrice(url)),
      // TODO: have not found state on manheim
      state: sanitize(await extractState(url)),
      millage: sanitize(await extractOdometerValue(url, lotDetailsArray)),
      fuel_type: sanitize(await extractFuelType(url, lotDetailsArray)),
      gearbox: sanitize(await extractGearbox(url, lotDetailsArray)),
      keys: sanitize(await extractKeys(url)),
      drive_state: sanitize(await extractDrive(url, lotDetailsArray)),
      // TODO: have not found damage
      damage: sanitize(await extractDamage(url)),
      engine: sanitize(await extractEngineType(url, lotDetailsArray)),
      // TODO: Add Date parse on Bidmotors website
      auction_date: calculateAuctionDate(url),
      auction_date_label: sanitize(parsedTextDate(url)),
      location: sanitize(await extractLocation(url)),
      image_urls: await extractImages(url),
      website_url: (url.startsWith('https://www.auto1.com/') ? window.location.href.split('?')[0] : window.location.href),
      vehicle_type: url.startsWith('https://www.auto1.com/') ? 'car' : sanitize(await extractVehicleType(url)),
      video_url: await extractVideoUrl(url),
      three_sixty_view_url: await extractThreeSixtyUrl(url)
    };

    return data;
  }

  async function extractVideoUrl(url) {
    if (url.startsWith('https://www.iaai.com/')) {
      const vlink = $("#hdnVRDUrl").val();
      return vlink || null;
    } else {
      null;
    }
  };

  function parsedTextDate(url) {
    let date;
    if (url.startsWith('https://www.copart.com/lot/')) {
      const dateElement = document.querySelector('[data-uname="lotdetailSaleinformationsaledatevalue"]') ||
                            document.querySelector('[data-uname="lotdetailUpcomingLotlink"]') ||
                            document.querySelector('[data-uname="lotdetailFuturelink"]') ||
                            document.querySelector('.text-blue.font_family_lato_bold.p-border-bottom-light-blue.p-cursor-pointer.p-text-nowrap');
      date = dateElement?.textContent || null;
    } else if (url.startsWith('https://www.iaai.com/')) {
      const lotDetail = Array.from(document.querySelectorAll('.data-list__label')).find(element => element.textContent.includes('Auction Date and Time:'))
      date = lotDetail?.nextElementSibling?.textContent || null;
    } else if (url.startsWith('https://www.auto1.com/')) {
      date = calculateAuctionDate(url);
    } else {
      date = document.querySelector('[data-test-id="auction-start-date"]').nextElementSibling?.textContent || null;
    }
    return date;
  }

  function parseDateString(dateString) {
    const parts = dateString.split(/\s+/).filter(Boolean);
    const [day, month, date, time, timezone] = parts;
    const currentYear = new Date().getFullYear();
    const combinedString = `${month} ${date} ${currentYear} ${time} ${timezone}`;

    return combinedString;
  }

  function calculateAuctionDate(url) {

    if (url.startsWith('https://www.copart.com/lot/')) {
      const timeLeftToAuction = document.querySelector('[data-uname="lotdetailSaleinformationtimeleftvalue"]')?.textContent;
      if (!timeLeftToAuction) return null;

      const matches = timeLeftToAuction.match(/(\d+)D (\d+)H (\d+)min/);
      if (!matches) return null;

      const [days, hours, minutes] = matches.slice(1, 4).map(Number);
      return new Date(Date.now() + days * 86400000 + hours * 3600000 + minutes * 60000).toISOString();
    } else if (url.startsWith('https://www.iaai.com/')) {
      const textDate = parsedTextDate(url);
      if (['Future', 'Upcoming Lot', null, 'Not Ready for Sale'].includes(textDate)) return null;

      // console.log(parseDateString(textDate));
      return parseDateString(textDate);
    } else if (url.startsWith('https://www.auto1.com/')) {
      
      const dayElement = document.querySelector('.countdown__days');
      const days = dayElement ? parseInt(dayElement.textContent.trim(), 10) : 0;

      const digits = Array.from(document.querySelectorAll('.countdown__clock .countdown__digit'))
      .map(span => span.textContent.trim().charAt(0));

      const hours = parseInt(digits[0] + digits[1], 10);
      const minutes = parseInt(digits[2] + digits[3], 10);
      const now = new Date();
      let targetDate = new Date(now);

      targetDate.setDate(now.getDate() + days);
      targetDate.setHours(now.getHours() + hours);
      targetDate.setMinutes(now.getMinutes() + minutes);
      return targetDate;
    } else {
      const textDate = parsedTextDate(url);
      if (['Future', 'Upcoming Lot', null, 'Not Ready for Sale'].includes(textDate)) return null;

      const timeLeftToAuction = document.querySelector('.bboEndStartTime')?.textContent
      if (!timeLeftToAuction) return null;
      
      let matches = textDate.match(/(\d{2})\/(\d{2})\s*-\s*(\d{1,2}):(\d{2})(am|pm)/);

      if (matches) {
        let month = parseInt(matches[1], 10);
        let day = parseInt(matches[2], 10);
        let hour = parseInt(matches[3], 10);
        let minute = parseInt(matches[4], 10);
        let period = matches[5];

        if (period === "pm" && hour < 12) {
            hour += 12;
        } else if (period === "am" && hour === 12) {
            hour = 0;
        }

        let year = new Date().getFullYear();
        return new Date(year, month - 1, day, hour, minute);
      }
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

  var isButtonAdded = false;

  const findWhereToInsertButton = async () => {
    if (window.location.href.startsWith('https://www.copart.com/lot/')) {
      return document.querySelector(".share-button.btn-white.dropdown-toggle") || document.querySelector('.lot-details-header-sprite.calendar-sprite-icon.p-position-relative.p-cursor-pointer');
    } else if (window.location.href.startsWith('https://www.iaai.com/')) {
      return document.querySelector('.vehicle-header__actions');
    } else if (window.location.href.startsWith('https://search.manheim.com/results#/details')) {
      return document.querySelector('.ListingTitle__container');
    } else if (window.location.href.startsWith('https://www.auto1.com/')) {
      return document.querySelector('.car-next-prev-links');
    } else {
      return null;
    }
  };

  const addBidmotorsButton = async () => {

    if (isButtonAdded && document.querySelector(".send-to-bidmotors-btn")) {
      console.log('Button already added, skipping');
      return;
    }

    let targetElement = await findWhereToInsertButton();
    if (targetElement) {
      const sendRequestBtnExists = document.querySelector(".send-to-bidmotors-btn");

      if (!sendRequestBtnExists) {
        const sendRequestBtn = document.createElement("button");
        sendRequestBtn.className = "send-to-bidmotors-btn";
        if (window.location.href.startsWith('https://www.auto1.com/')) {
          sendRequestBtn.className = "send-to-bidmotors-btn auto1-button";
        }
        sendRequestBtn.title = "Click to send data to Bidmotors";
        sendRequestBtn.innerText = 'Добавете в Bidmotors!';
        sendRequestBtn.id = 'extractData';

        targetElement.insertAdjacentElement('beforebegin', sendRequestBtn);
        sendRequestBtn.addEventListener("click", sendData);
        if (document.querySelector(".send-to-bidmotors-btn")){
          console.log('Button added by newTabLoaded');
          isButtonAdded = true;
        }
      } else {
        console.log('Button already exists in the DOM');
      }
    } else {
      console.log('Target element not found, button not added');
    }
  };

  const observePageLoad = () => {
    const observer = new MutationObserver(async (mutations, observer) => {
      if (isButtonAdded) {
        console.log("isButtonAdded true")
        observer.disconnect();
        return;
      }

      const targetElement = await findWhereToInsertButton();
      if (targetElement) {
        await addBidmotorsButton();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    addBidmotorsButton();
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    // console.log('Message from background');
    isButtonAdded = false;
    if (window.location.href.startsWith('https://www.copart.com/') || window.location.href.startsWith('https://www.iaai.com/')) {
      window.addEventListener('load', addBidmotorsButton);
      // console.log("window.addEventListener('load', addBidmotorsButton);");
      observePageLoad();
    } else {
      window.addEventListener('load', addBidmotorsButton);
      observePageLoad();
    }
  });

  injectStyles();
})();
