var recorder = null;

const onAccessApproved = (stream) => {
  recorder = new MediaRecorder(stream);

  recorder.start();

  recorder.onstop = () => {
    stream.getTracks().forEach(track => {
        if(track.readyState === "live"){
          track.stop()
        }
    })
  }

  recorder.ondataavailable = event => {
      let recordedBlob  = event.data;
      let url = URL.createObjectURL(recordedBlob);

      console.log(event)
      console.log(url)

      // let a = document.createElement("a");

      // a.style.display = "none";
      // a.href = url;
      // a.download = "screen-recording.webm"

      // document.body.appendChild(a);
      // a.click();

      // document.body.removeChild(a);

      // URL.revokeObjectURL(url);
  }
}

chrome.runtime.onMessage.addListener( (message, sender, sendResponse)=>{

  if(message.action === "request_recording"){
    console.log("requesting recording")

    sendResponse(`processed: ${message.action}`);

    navigator.mediaDevices.getDisplayMedia({
      audio:true,
      video: {
          width:9999999999,
          height: 9999999999
      }
    }).then((stream)=>{
        onAccessApproved(stream)
    })  
  }
})