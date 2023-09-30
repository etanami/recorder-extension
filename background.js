chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
  if(changeInfo.status === "complete" && /^http/.test(tab.url)){
      chrome.scripting.executeScript({
          target: {tabId},
          files: ["./content.js"]
      }).then(()=>{
          console.log("we have injected the content script")
      }).catch(err=> console.log(err, "error in background script line 10"))
  }
})


// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "request_recording") {
    // Send a message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "request_recording" },
        response => {
          sendResponse(response);
        }
      );
    });
    // Return true to indicate that we will send a response asynchronously
    return true;
  }
});
