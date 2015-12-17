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
    }
  }

  var bufferSize = 4096;
  var numOfInputChannels = 2;
  var numOfOutputChannels = 2;
  this.context = source.context;

  this.node = (this.context.createScriptProcessor ||
      this.context.createJavaScriptNode).call(
      this.context, bufferSize, numOfInputChannels, numOfOutputChannels);

  var worker = new Worker("js/recorderWorker.js");
  worker.postMessage({
    command: 'init',
    payload: {
      sampleRate: this.context.sampleRate,
    }
  });

  this.node.onaudioprocess = function(e) {
    if (!recording) {
      return;
    }
    worker.postMessage({
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
    worker.postMessage({
      command: 'clear'
    })
  }

  this.prepareDownload = function() {
    worker.postMessage({ command: 'getBuffers' })
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

  worker.onmessage = function(e) {
    switch (e.data.command) {
      case 'getBuffers':
        document.getElementById("download").disabled = false;
        document.getElementById("upload").disabled = false;
        worker.postMessage({command: 'exportWAV'});
        break;
      case 'exportWAV':
        blob = e.data.payload;

        var url = (window.URL || window.webkitURL).createObjectURL(blob);
        var link = document.getElementById("download");
        link.href = url;
        link.download = 'output.wav';
    }
  }

  source.connect(this.node);
  this.node.connect(this.context.destination);
}
