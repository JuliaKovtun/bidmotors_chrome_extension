(() => {
  const newVideoLoaded = async () => {
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("button");

      bookmarkBtn.className = "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";
      bookmarkBtn.innerText = 'Send to Bidmotors!';
      let youtubeLeftControls = document.getElementsByClassName("title-and-highlights")[0];

      youtubeLeftControls.appendChild(bookmarkBtn);
      debugger;
      // bookmarkBtn.addEventListener("click", extractData());
    }
  };
  
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    newVideoLoaded();
  });

})();