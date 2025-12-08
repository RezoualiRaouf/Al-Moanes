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

playBtn.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
});

const progressBar = document.getElementById("progressBar");
const surahCurrentTime = document.getElementById("surahCurrentTime");
const surahDuration = document.getElementById("surahDuration");

audioPlayer.addEventListener("timeupdate", () => {
  let percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = percentage;
  surahCurrentTime.innerText = formatTime(audioPlayer.currentTime);
  surahDuration.innerText = formatTime(audioPlayer.duration);
});
