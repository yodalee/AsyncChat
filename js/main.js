var audioContext = new AudioContext();
var audioInput = null;
var audioRecorder = null;

var analyserContext = null;

function getMediaSuccess(stream) {
  console.log("Get Audio source success")

  audioInput = audioContext.createMediaStreamSource(stream);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 2048;

  audioInput.connect(analyserNode);

  audioRecorder = new Recorder(audioInput);

  updateAnalysers();
}

function updateAnalysers(time) {
  if (!analyserContext) {
  }
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

function startRecording() {
  console.log("start log");
  if (!audioRecorder) {
    return;
  }
  audioRecorder.clear();
  audioRecorder.record();
}

function stopRecording() {
  console.log("stop log");
  audioRecorder.stop();
}

function initAudio() {
  console.log("ask audio permission");
  initRecorder();
}

window.onload = initAudio();
