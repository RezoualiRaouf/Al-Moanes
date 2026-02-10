const playIconUrl = new URL("../assets/play-audio.svg", import.meta.url);
const pauseIconUrl = new URL("../assets/pause-audio.svg", import.meta.url);
const muteIconUrl = new URL("../assets/mute.svg", import.meta.url);
const unmuteIconUrl = new URL("../assets/unmute.svg", import.meta.url);

function formatTime(seconds) {
  // check NaN and invalid values
  if (!isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

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

function resetPlayer() {
  progressBar.value = 0;
  surahCurrentTime.innerText = "00:00";
  surahDuration.innerText = "00:00";
  playIcon.src = playIconUrl.href;
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

export const isRTL = () => {
  return localStorage.getItem("language") === "ar";
};

// Play/Pause Button
playBtn.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playIcon.src = pauseIconUrl.href;
  } else {
    audioPlayer.pause();
    playIcon.src = playIconUrl.href;
  }
});

// Mute/Unmute Button
muteBtn.addEventListener("click", () => {
  audioPlayer.muted = !audioPlayer.muted;
  muteBtnIcon.src = audioPlayer.muted ? muteIconUrl.href : unmuteIconUrl.href;
});

// Update Progress Bar and Time Display
audioPlayer.addEventListener("timeupdate", () => {
  if (isFinite(audioPlayer.duration)) {
    let percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = percentage;
    surahCurrentTime.innerText = formatTime(audioPlayer.currentTime);
    surahDuration.innerText = formatTime(audioPlayer.duration);
  }
});

//  Reset when new audio starts loading
audioPlayer.addEventListener("loadstart", () => {
  resetPlayer();
});

//  Update duration when metadata is loaded
audioPlayer.addEventListener("loadedmetadata", () => {
  surahDuration.innerText = formatTime(audioPlayer.duration);
  progressBar.value = 0;
});

// Skip Forward 10 Seconds
skipSecBtn.addEventListener("click", () => {
  if (isRTL()) {
    // RTL skip button rewinds
    audioPlayer.currentTime = Math.max(0, (audioPlayer.currentTime || 0) - 10);
  } else {
    // LTR skip button skips
    audioPlayer.currentTime = Math.min(
      (audioPlayer.currentTime || 0) + 10,
      audioPlayer.duration || Infinity,
    );
  }
});

// Rewind 10 Seconds
prevSecBtn.addEventListener("click", () => {
  if (isRTL()) {
    // RTL prev button skips
    audioPlayer.currentTime = Math.min(
      (audioPlayer.currentTime || 0) + 10,
      audioPlayer.duration || Infinity,
    );
  } else {
    // LTR prev button rewinds
    audioPlayer.currentTime = Math.max(0, (audioPlayer.currentTime || 0) - 10);
  }
});

// Progress Bar - Seek by Dragging
progressBar.addEventListener("input", () => {
  if (isFinite(audioPlayer.duration)) {
    audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
  }
});

// Progress Bar - Seek by Clicking
progressBar.addEventListener("click", (e) => {
  if (isFinite(audioPlayer.duration)) {
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const clickedTime = clickPosition * audioPlayer.duration;
    audioPlayer.currentTime = Math.max(
      0,
      Math.min(clickedTime, audioPlayer.duration),
    );
  }
});

// Reset play button when audio ends
audioPlayer.addEventListener("ended", () => {
  playIcon.src = playIconUrl.href;
});
