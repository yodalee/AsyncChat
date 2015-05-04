var audioContext = new AudioContext();
var audioInput = null;
var audioRecorder = null;

// analyser
var analyserContext = null;
var canvasWidth, canvasHeight;

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
    var canvas = document.getElementById("analyser");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    analyserContext = canvas.getContext('2d');
  }
  {
    var SPACING = 3;
    var BAR_WIDTH = 1;
    var numBars = Math.round(canvasWidth / SPACING);
    var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

    analyserNode.getByteFrequencyData(freqByteData);

    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    var multiplier = analyserNode.frequencyBinCount / numBars;

    // Draw rectangle for each frequency bin.
    for (var i = 0; i < numBars; ++i) {
      var magnitude = 0;
      var maxMag = 0;
      var offset = Math.floor( i * multiplier );
      // gotta sum/average the block, or we miss narrow-bandwidth spikes
      for (var j = 0; j< multiplier; j++)
        magnitude += freqByteData[offset + j];
      magnitude = magnitude / multiplier;
      analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
      analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude / 4);
    }
  }

  rafID = window.requestAnimationFrame( updateAnalysers );
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
  audioRecorder.prepareDownload();
}

function initAudio() {
  console.log("ask audio permission");
  initRecorder();
}

function downloadAudio() {
  console.log("download audio");
}

window.onload = initAudio();
