var blob;
var xmlhttp;

var Recorder = function(source) {
  // initial ajax request
  // it's weird it puts here
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      document.getElementById("testDiv").innerHTML=
        '<a href=play?key=' + xmlhttp.responseText + '>Sound Link</a>';
      console.log(xmlhttp.responseText);
      updateLog("Upload success");
    }
  }

  var bufferSize = 4096;
  var numOfInputChannels = 2;
  var numOfOutputChannels = 2;
  this.context = source.context;

  this.node = (this.context.createScriptProcessor ||
      this.context.createJavaScriptNode).call(
      this.context, bufferSize, numOfInputChannels, numOfOutputChannels);

  var recorderWorker = new Worker("js/recorderWorker.js");
  var encoderWorker = new Worker("js/encoderWorker.js");

  recorderWorker.postMessage({
    command: 'init',
    payload: {
      sampleRate: this.context.sampleRate,
    }
  });

  encoderWorker.postMessage({
    command: 'init',
    payload: {},
  });

  this.node.onaudioprocess = function(e) {
    if (!recording) {
      return;
    }
    recorderWorker.postMessage({
      command: 'record',
      payload: [
        e.inputBuffer.getChannelData(0),
        e.inputBuffer.getChannelData(1),
      ]
    })
  }

  var recording = false;

  this.record = function() {
    recording = true;
  }

  this.stop = function() {
    recording = false;
  }

  this.clear = function() {
    recorderWorker.postMessage({
      command: 'clear'
    })
  }

  this.prepareDownload = function() {
    recorderWorker.postMessage({ command: 'getBuffers' })
  }

  this.upload = function() {
    // prepare base64 string
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
      //TODO: find a better way to get the base64 string
      //this method only work if header is contant: data:audio/wav;base64,
      xmlhttp.open("POST", "upload", true);
      xmlhttp.send(reader.result.slice(22));
    }
  }

  recorderWorker.onmessage = function(e) {
    switch (e.data.command) {
      case 'getBuffers':
        recorderWorker.postMessage({command: 'exportWAV'});
        break;
      case 'exportWAV':
        blob = e.data.payload;
        encoderWorker.postMessage({command: 'encodeMP3', payload: e.data.payload})
    }
  }

  encoderWorker.onmessage = function(e) {
    switch (e.data.command) {
      case 'encodeMP3':
        console('encode done');
        blob = new Blob([new Uint8Array(e.data.payload)], {type: 'audio/mp3'});

        var url = (window.URL || window.webkitURL).createObjectURL(blob);
        var link = document.getElementById("download");
        link.href = url;
        link.download = 'output.wav';
        break;
    }
  }

  this.convertToMP3 = function() {
  }

  source.connect(this.node);
  this.node.connect(this.context.destination);
}
