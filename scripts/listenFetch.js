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
const skipSecBtn = document.getElementById("skipSecBtn");
const prevSecBtn = document.getElementById("prevSecBtn");
const progressBar = document.getElementById("progressBar");
const surahCurrentTime = document.getElementById("surahCurrentTime");
const surahDuration = document.getElementById("surahDuration");

// Play/Pause Button
playBtn.addEventListener("click", () => {
  console.log("Play button clicked", audioPlayer.paused);
  console.log("playIcon element:", playIcon);

  if (audioPlayer.paused) {
    audioPlayer.play();
    playIcon.setAttribute("src", "assets/pause-audio.svg");
  } else {
    audioPlayer.pause();
    playIcon.setAttribute("src", "assets/play-audio.svg");
  }
});

// Mute/Unmute Button
muteBtn.addEventListener("click", () => {
  audioPlayer.muted = !audioPlayer.muted;
  muteBtn.innerText = audioPlayer.muted ? "🔇 Unmute" : "🔊 Mute";
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
    audioPlayer.duration || Infinity
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
    Math.min(clickedTime, audioPlayer.duration)
  );
});

// Reset play button when audio ends
audioPlayer.addEventListener("ended", () => {
  playIcon.src = "assets/play-audio.svg";
});
