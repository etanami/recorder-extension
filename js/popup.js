document.addEventListener("DOMContentLoaded", () => {
  const startVideoButton = document.querySelector("button#start_recording");

  // add event listeners

  startVideoButton.addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "request_recording"}, response => {
            if(!chrome.runtime.lastError){
                console.log(response);
            } else{
                console.log(chrome.runtime.lastError, 'error starting recording')
            }
        })
    })
  })
})