<template>
  <div class="shadow-2xl flex flex-col gap-5 border-2 py-5 rounded-lg md:px-52">

    <h1 class="font-Zeyada text-[50px] text-center">NightCore Studio</h1>

    <div class="flex items-center justify-center">
      <NuxtImg src="/anime_girl.gif" height="150" />
    </div>

    <NuxtLink target="_blank" to="https://t.me/nightcore_is_my_life" class="btn btn-accent" @click="play">
      Telegram Channel
      <telegramIcon />
    </NuxtLink>

    <button class="btn btn-secondary" @click="play">
      Play NightCore
      <playIcon />
    </button>

    <button class="btn btn-info" @click="reset">
      Reset

    </button>


    <input @change.prevent="changeFile" type="file" accept="audio/*"
      class="file-input file-input-bordered w-full max-w-xs" />

    <label for="tempoSlider">Tempo: {{ tempo }}</label>
    <!-- min="0.5" max="2.0" step="0.01" -->
    <input @input="updateTempo" type="range" min="0.5" max="2.0" step="0.01" v-model="tempo" class="range" />
    <label for="pitchSlider">Pitch: {{ pitch }}</label>
    <!-- min="-1200" max="1200" step="1" -->
    <input @input="updatePitch" type="range" min="-500" max="500" step="1" v-model="pitch" class="range" />


  </div>
</template>

<script lang="ts" setup>
import playIcon from "@/components/icons/play.vue";
import telegramIcon from "@/components/icons/telegram.vue";
const tempo = ref(1);
const pitch = ref(0);

function reset() {
  tempo.value = 1
  pitch.value = 0
}

const audioContext = new window.AudioContext;
let audioBuffer: AudioBuffer, sourceNode: any;


function changeFile(event: Event) {
  const file = (event.target as HTMLInputElement).files

  if (file == null) {
    return
  }

  const reader = new FileReader();
  reader.readAsArrayBuffer(file[0]);



  reader.onloadend = function () {
    audioContext.decodeAudioData((reader.result as ArrayBuffer), function (buffer) {
      audioBuffer = buffer;
    });
  };

}

function play() {
  if (!audioBuffer) return;

  if (sourceNode) {
    sourceNode.stop();
  }

  sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;

  const tempoSlider = document.getElementById('tempoSlider');
  const pitchSlider = document.getElementById('pitchSlider');

  // Set playbackRate for tempo control
  sourceNode.playbackRate.value = tempo.value;

  // Connect the source to a gain node for pitch shifting
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1; // Default gain

  // Apply detune for pitch control
  sourceNode.detune.value = pitch.value;

  sourceNode.connect(gainNode).connect(audioContext.destination);
  sourceNode.start();
}

function updateTempo() {
  if (sourceNode) {
    sourceNode.playbackRate.value = tempo.value;
  }
}
function updatePitch() {
  if (sourceNode) {
    sourceNode.detune.value = pitch.value;
  }
}
</script>