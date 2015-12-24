importScripts('libmp3lame.js');

// mp3 lame instance
var mp3encoder;

this.onmessage = function(e) {
  switch (e.data.command) {
    case 'init':
      init(e.data.payload);
      break;
    case 'encodeMP3':
      encodeMP3(e.data.payload);
      break;
  }
}

function init() {
  mp3encoder = Lame.init();
  Lame.set_mode(mp3encoder, Lame.JOINT_STEREO);
  Lame.set_num_channels(mp3encoder, 2);
  Lame.set_num_samples(mp3encoder, -1);
  Lame.set_in_samplerate(mp3encoder, 44100);
  Lame.set_out_samplerate(mp3encoder, 44100);
  Lame.set_bitrate(mp3encoder, 128);

  Lame.init_params(mp3encoder);

  console.log('Version :', Lame.get_version() + ' / ',
  'Mode: '+Lame.get_mode(mp3encoder) + ' / ',
  'Samples: '+Lame.get_num_samples(mp3encoder) + ' / ',
  'Channels: '+Lame.get_num_channels(mp3encoder) + ' / ',
  'Input Samplate: '+ Lame.get_in_samplerate(mp3encoder) + ' / ',
  'Output Samplate: '+ Lame.get_in_samplerate(mp3encoder) + ' / ',
  'Bitlate :' +Lame.get_bitrate(mp3encoder));
}

function encodeMP3(data) {
  var arrayBuffer;
  var fileReader = new FileReader();

  fileReader.onload = function() {
    arrayBuffer = this.result;
    var buffer = new Uint8Array(arrayBuffer);
    var data = parseWav(buffer);

    var buf = Uint8ArrayToFloat32Array(data.samples);

    var mp3data = Lame.encode_buffer_ieee_float(mp3encoder, buf, buf);
    self.postMessage({cmd: 'encodeMP3', payload: mp3data.data});
  }

  fileReader.readAsArrayBuffer(data);
}

function parseWav(wav) {
  var readInt = function(readStart, readSize) {
    var ret = 0, shift = 0;

    while (readSize) {
      ret += wav[readStart] << shift;
      shift += 8;
      readStart++;
      readSize--;
    }
    return ret;
  };

  if (readInt(20, 2) != 1) throw 'Invalid compression code, not PCM';
  if (readInt(22, 2) != 1) throw 'Invalid number of channels, not 1';
  return {
    sampleRate: readInt(24, 4),
    bitsPerSample: readInt(34, 2),
    samples: wav.subarray(44)
  };
};

function Uint8ArrayToFloat32Array(u8a) {
  var f32Buffer = new Float32Array(u8a.length);
  for (var i = 0; i < u8a.length; i++) {
    var value = u8a[i << 1] + (u8a[(i << 1) + 1] << 8);
    if (value >= 0x8000) value |= ~0x7FFF;
    f32Buffer[i] = value / 0x8000;
  }
  return f32Buffer;
};
