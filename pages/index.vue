<template>
  <div class="flex flex-col justify-center gap-5 px-3 py-5 text-2xl border-2 rounded-lg shadow-2xl md:px-52">

    <h1 class="font-Zeyada text-[50px] text-center">{{ $t('nc_studio') }}</h1>

    <NuxtLink target="_blank" to="https://t.me/nightcore_is_my_life" class="btn btn-accent">
      {{ $t('tg_channel') }}
      <telegramIcon />
    </NuxtLink>

    <NuxtLink target="_blank" to="https://github.com/alix1383/nightcore_studio" class="btn  bg-success-content">
      {{ $t('src_link') }}
      <githubIcon />
    </NuxtLink>

    <div class="flex flex-col items-center flex-1 gap-1 md:flex-row">
      <button class="w-full text-lg md:basis-1/2 btn btn-secondary" @click="play">
        {{ $t('play') }}
      </button>

      <button class="w-full text-lg btn md:basis-1/2 btn-error" @click="stop">
        {{ $t('stop') }}
      </button>
    </div>

    <input @change.prevent="changeFile" type="file" accept="audio/*" class="w-full file-input file-input-bordered" />

    <button class="w-full text-xl btn btn-warning" @click="reset">
      {{ $t('reset') }}
    </button>

    <label for="tempoSlider">Tempo: {{ tempo }}</label>
    <input @input="updateTempo" type="range" min="0.9" max="1.4" step="0.01" v-model="tempo" class="range" />

    <label for="pitchSlider">Pitch: {{ pitch }}</label>
    <input @input="updatePitch" type="range" min="0" max="150" step="1" v-model="pitch" class="range" />

    <!-- Button to download modified audio -->
    <button class="w-full text-xl btn btn-success" @click="downloadModifiedAudio">
      {{ $t('download') }}
    </button>

  </div>
</template>

<script lang="ts" setup>
// Importing the github and telegram icon
import githubIcon from "@/components/icons/github.vue";
import telegramIcon from "@/components/icons/telegram.vue";
import { ref } from 'vue';

// Reactive state for tempo and pitch values
const tempo = ref<number>(1);
const pitch = ref<number>(0);

let audioContext: AudioContext;
let audioBuffer: AudioBuffer | null = null;
let sourceNode: AudioBufferSourceNode | null = null;

// Function to reset tempo and pitch values
function reset(): void {
  tempo.value = 1;
  pitch.value = 0;
}

// Initialize AudioContext
audioContext = new window.AudioContext();

// Handle file upload and decode audio data
function changeFile(event: Event): void {
  const file = (event.target as HTMLInputElement).files;

  if (!file || file.length === 0) return;

  const reader = new FileReader();
  reader.readAsArrayBuffer(file[0]);

  reader.onloadend = function (): void {
    if (reader.result) {
      audioContext.decodeAudioData(reader.result as ArrayBuffer, function (buffer: AudioBuffer) {
        audioBuffer = buffer;
      });
    }
  };
}

// Play audio with applied tempo and pitch adjustments
function play(): void {
  if (!audioBuffer) return;

  if (sourceNode) {
    sourceNode.stop();
  }

  sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;

  // Set playback rate for tempo control
  sourceNode.playbackRate.value = tempo.value;

  // Apply pitch shift using detune
  sourceNode.detune.value = pitch.value;

  // Connect the source to the audio output
  sourceNode.connect(audioContext.destination);
  sourceNode.start();
}

// Stop the audio playback
function stop(): void {
  if (sourceNode) {
    sourceNode.stop();
    sourceNode = null;
  }
}

// Update the tempo in real-time during playback
function updateTempo(): void {
  if (sourceNode) {
    sourceNode.playbackRate.value = tempo.value;
  }
}

// Update the pitch in real-time during playback
function updatePitch(): void {
  if (sourceNode) {
    sourceNode.detune.value = pitch.value;
  }
}

// Download the modified audio with the current tempo and pitch settings
async function downloadModifiedAudio(): Promise<void> {
  if (!audioBuffer) return;

  // Create an offline audio context for rendering
  const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);

  // Create a buffer source for offline processing
  const offlineSource = offlineContext.createBufferSource();
  offlineSource.buffer = audioBuffer;

  // Apply tempo and pitch settings
  offlineSource.playbackRate.value = tempo.value;
  offlineSource.detune.value = pitch.value;

  // Connect the source to the destination (offline rendering)
  offlineSource.connect(offlineContext.destination);
  offlineSource.start();

  // Render the modified audio
  const renderedBuffer = await offlineContext.startRendering();

  // Convert the buffer to a Blob for downloading
  const audioBlob = bufferToWave(renderedBuffer);

  // Create a download link
  const downloadUrl = URL.createObjectURL(audioBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'modified_audio.wav';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Helper function to convert AudioBuffer to Blob (WAV format)
function bufferToWave(buffer: AudioBuffer): Blob {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numberOfChannels * 2 + 44;
  const result = new ArrayBuffer(length);
  const view = new DataView(result);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Write WAV file header
  function writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 32 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2 * numberOfChannels, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  pos = 44;
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numberOfChannels; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset]));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([result], { type: 'audio/wav' });
}
</script>
