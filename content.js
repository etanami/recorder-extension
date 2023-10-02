
// start button
const startButton = document.getElementById('#start_recording')

// Create the Stop button
const stopButton = document.createElement('button');
stopButton.id = 'stop-button';
stopButton.textContent = 'Stop';
stopButton.disabled = true;

// Create the Pause button
const pauseButton = document.createElement('button');
pauseButton.id = 'pause-button';
pauseButton.textContent = 'Pause';
pauseButton.disabled = true;

// Create the Resume button
const resumeButton = document.createElement('button');
resumeButton.id = 'resume-button';
resumeButton.textContent = 'Resume';
resumeButton.disabled = true;

// Append the buttons to the document body or any other container element
document.body.appendChild(stopButton);
document.body.appendChild(pauseButton);
document.body.appendChild(resumeButton);

// Declare global variables
let recorder;
let isRecording = false;
let isPaused = false;
let recordedChunks = [];
let videoId;

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
    }).then((stream) => {
      recorder = new MediaRecorder(stream);
      recordedChunks = [];

      // Set the desired time slice (chunk size) in milliseconds
      const timeSlice = 5000; // 5 seconds

      recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
              recordedChunks.push(event.data);
              console.log('recorded chunks', recordedChunks)
          }
      };

      recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });

          // Send the blob to your backend
          sendBlobToBackend(blob);

          // Clean up
          recordedChunks = [];
          stream.getTracks().forEach((track) => {
            if(track.readyState === "live"){
              track.stop()
            }
          });
        };

        recorder.start(timeSlice);
        isRecording = true;

        // Update UI
        stopButton.disabled = false;
        pauseButton.disabled = false;
        resumeButton.disabled = true;
    })
    .catch((error) => {
        console.error("Error starting recording:", error);
    }); 
  }
})

// Function to send the blob data to the backend
function sendBlobToBackend(blob) {
  const formData = new FormData();
  formData.append("video", blob, "screen-recording.webm");

  // from BE dev
  let url = "https://helpmeout-ext.onrender.com";

//   let get = fetch(url)
//   console.log(get)

  fetch(url, {
      method: "POST",
      body: formData,
  })
    .then((response) => {
        if (response.ok) {
            console.log("Recording data sent successfully.");
        } else {
            console.error("Failed to send video to the backend", response.status);
        }
    })
    .catch((error) => {
        console.error("Error sending blob data:", error);
    });
}


// Function to stop recording
function stopRecording() {
    if (isRecording) {
        // Stop recording logic
        recorder.stop();

        // Update UI
        // startButton.disabled = false;
        stopButton.disabled = true;
        pauseButton.disabled = true;
        resumeButton.disabled = true;
    }
}

// Function to pause recording
function pauseRecording() {
    if (isRecording && !isPaused) {
        // Pause recording logic
        recorder.pause();
        isPaused = true;

        // Update UI
        pauseButton.disabled = true;
        resumeButton.disabled = false;
    }
}

// Function to resume recording
function resumeRecording() {
    if (isRecording && isPaused) {
        // Resume recording logic
        recorder.resume();
        isPaused = false;

        // Update UI
        pauseButton.disabled = false;
        resumeButton.disabled = true;
    }
}


// Add event listeners to the buttons
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);
resumeButton.addEventListener("click", resumeRecording);
