var audioContext = new AudioContext();
var audioInput = null;
var audioRecorder = null;

function getMediaSuccess(stream) {
  console.log("Get Audio source success")

  audioInput = audioContext.createMediaStreamSource(stream);

  audioRecorder = new Recorder(audioInput);
}

function getMediaFail(error) {
  console.log("Error: Unable to get audio");
  console.log(error);
}

function initRecorder() {
  console.log("initial Audio");

  try {
    window.Audio.Context = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    navigator.getUserMedia({audio: true}, getMediaSuccess, getMediaFail);
  } catch (e) {
    console.log("No web audio support in this browser");
  }
}

function startRecording(btn) {
  console.log("start log");
  if (!audioRecorder) {
    return;
  }
  audioRecorder.clear();
  audioRecorder.record();
}

function stopRecording(btn) {
  console.log("stop log");
  audioRecorder.stop();
}

window.onload = initRecorder();
