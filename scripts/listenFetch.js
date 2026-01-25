const playIconUtl = new URL("../assets/play-audio.svg", import.meta.url);
const pauseIconUrl = new URL("../assets/pause-audio.svg", import.meta.url);

const muteIconUrl = new URL("../assets/mute.svg", import.meta.url);
const unmuteIconUrl = new URL("../assets/unmute.svg", import.meta.url);

async function fetchReciter() {}
async function fetchSurah() {}
async function fetchNarration() {}

function formatTime(seconds) {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return (
      `${h.toString().padStart(2, "0")}:` +
      `${m.toString().padStart(2, "0")}:` +
      `${s.toString().padStart(2, "0")}`
    );
  } else {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
}

const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const muteBtn = document.getElementById("muteBtn");
const muteBtnIcon = document.getElementById("muteBtnIcon");
const skipSecBtn = document.getElementById("skipSecBtn");
const prevSecBtn = document.getElementById("prevSecBtn");
const progressBar = document.getElementById("progressBar");
const surahCurrentTime = document.getElementById("surahCurrentTime");
const surahDuration = document.getElementById("surahDuration");

// Play/Pause Button
playBtn.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playIcon.src = pauseIconUrl.href;
  } else {
    audioPlayer.pause();
    playIcon.src = playIconUtl.href;
  }
});

// Mute/Unmute Button
muteBtn.addEventListener("click", () => {
  audioPlayer.muted = !audioPlayer.muted;
  muteBtnIcon.src = audioPlayer.muted ? unmuteIconUrl.href : muteIconUrl.href;
});

// Update Progress Bar and Time Display
audioPlayer.addEventListener("timeupdate", () => {
  let percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = percentage;
  surahCurrentTime.innerText = formatTime(audioPlayer.currentTime);
  surahDuration.innerText = formatTime(audioPlayer.duration);
});

// Skip Forward 10 Seconds
skipSecBtn.addEventListener("click", () => {
  audioPlayer.currentTime = Math.min(
    (audioPlayer.currentTime || 0) + 10,
    audioPlayer.duration || Infinity,
  );
});

// Rewind 10 Seconds
prevSecBtn.addEventListener("click", () => {
  audioPlayer.currentTime = Math.max(0, (audioPlayer.currentTime || 0) - 10);
});

// Progress Bar - Seek by Dragging
progressBar.addEventListener("input", () => {
  audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
});

// Progress Bar - Seek by Clicking
progressBar.addEventListener("click", (e) => {
  const rect = progressBar.getBoundingClientRect();
  const clickPosition = (e.clientX - rect.left) / rect.width;
  const clickedTime = clickPosition * audioPlayer.duration;
  audioPlayer.currentTime = Math.max(
    0,
    Math.min(clickedTime, audioPlayer.duration),
  );
});

// Reset play button when audio ends
audioPlayer.addEventListener("ended", () => {
  playIcon.src = playIconUtl.href;
});
