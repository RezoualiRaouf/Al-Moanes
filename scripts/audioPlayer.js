const playIconUrl = new URL("../assets/play-audio.svg", import.meta.url);
const pauseIconUrl = new URL("../assets/pause-audio.svg", import.meta.url);
const muteIconUrl = new URL("../assets/mute.svg", import.meta.url);
const unmuteIconUrl = new URL("../assets/unmute.svg", import.meta.url);

const prevSurahBtn = document.getElementById("prevSurahBtn");
const downloadBtn = document.getElementById("downloadBtn");
const loopBtn = document.getElementById("loopBtn");
const nextSurahBtn = document.getElementById("nextSurahBtn");
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

function formatTime(seconds) {
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

// ── Play/Pause Button ──
playBtn.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playIcon.src = pauseIconUrl.href;
  } else {
    audioPlayer.pause();
    playIcon.src = playIconUrl.href;
  }
});

// ── Mute/Unmute Button ──
muteBtn.addEventListener("click", () => {
  audioPlayer.muted = !audioPlayer.muted;
  muteBtnIcon.src = audioPlayer.muted ? muteIconUrl.href : unmuteIconUrl.href;
});

// ── Update Progress Bar and Time Display ──
audioPlayer.addEventListener("timeupdate", () => {
  if (isFinite(audioPlayer.duration)) {
    let percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = percentage;
    surahCurrentTime.innerText = formatTime(audioPlayer.currentTime);
    surahDuration.innerText = formatTime(audioPlayer.duration);
  }
});

// ── Reset when new audio starts loading ──
audioPlayer.addEventListener("loadstart", () => {
  resetPlayer();
});

// ── Update duration when metadata is loaded ──
audioPlayer.addEventListener("loadedmetadata", () => {
  surahDuration.innerText = formatTime(audioPlayer.duration);
  progressBar.value = 0;
});

// ── Skip Forward 10 Seconds ──
skipSecBtn.addEventListener("click", () => {
  if (isRTL()) {
    audioPlayer.currentTime = Math.max(0, (audioPlayer.currentTime || 0) - 10);
  } else {
    audioPlayer.currentTime = Math.min(
      (audioPlayer.currentTime || 0) + 10,
      audioPlayer.duration || Infinity,
    );
  }
});

// ── Rewind 10 Seconds ──
prevSecBtn.addEventListener("click", () => {
  if (isRTL()) {
    audioPlayer.currentTime = Math.min(
      (audioPlayer.currentTime || 0) + 10,
      audioPlayer.duration || Infinity,
    );
  } else {
    audioPlayer.currentTime = Math.max(0, (audioPlayer.currentTime || 0) - 10);
  }
});

// ── Progress Bar - Seek by Dragging ──
progressBar.addEventListener("input", () => {
  if (isFinite(audioPlayer.duration)) {
    audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
  }
});

// ── Progress Bar - Seek by Clicking ──
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

// ── Download the current surah ──
audioPlayer.addEventListener("loadedmetadata", () => {
  downloadBtn.disabled = false;
});

audioPlayer.addEventListener("loadstart", () => {
  downloadBtn.disabled = true;
});

downloadBtn.addEventListener("click", async () => {
  const src = audioPlayer.src;
  if (!src || src === window.location.href) return;

  const surahSelect = document.getElementById("surah");
  const selectedSurah = surahSelect.options[surahSelect.selectedIndex];
  const surahName = selectedSurah.text;
  const reciterName = selectedSurah.dataset.reciter;
  const filename = `${reciterName}_${surahName}.mp3`;

  try {
    downloadBtn.disabled = true;
    downloadBtn.classList.add("player__btn--downloading");

    const response = await fetch(src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.classList.remove("player__btn--downloading");
  }
});

// ── Loop Toggle ──
loopBtn.addEventListener("click", () => {
  audioPlayer.loop = !audioPlayer.loop;
  const isLooping = audioPlayer.loop;
  loopBtn.setAttribute("aria-pressed", isLooping);
  loopBtn.setAttribute("aria-label", isLooping ? "Loop on" : "Loop off");
});

// ── Next Surah ──
nextSurahBtn.addEventListener("click", () => {
  const surahSelect = document.getElementById("surah");
  if (surahSelect.selectedIndex < surahSelect.options.length - 1) {
    surahSelect.selectedIndex++;
    surahSelect.dispatchEvent(new Event("change"));
  }
});

// ── Prev Surah ──
prevSurahBtn.addEventListener("click", () => {
  const surahSelect = document.getElementById("surah");
  if (surahSelect.selectedIndex > 0) {
    surahSelect.selectedIndex--;
    surahSelect.dispatchEvent(new Event("change"));
  }
});

// ── Surah Nav Button State ──
function updateSurahNavBtns() {
  const surahSelect = document.getElementById("surah");
  const hasOptions = surahSelect.options.length > 1;
  prevSurahBtn.disabled = !hasOptions || surahSelect.selectedIndex <= 0;
  nextSurahBtn.disabled =
    !hasOptions || surahSelect.selectedIndex >= surahSelect.options.length - 1;
}

// Update nav buttons when the user picks a surah from the dropdown
document.getElementById("surah").addEventListener("change", updateSurahNavBtns);

window.addEventListener("surahListUpdated", updateSurahNavBtns);

audioPlayer.addEventListener("ended", () => {
  playIcon.src = playIconUrl.href;

  const surahSelect = document.getElementById("surah");
  if (
    !audioPlayer.loop &&
    surahSelect.selectedIndex < surahSelect.options.length - 1
  ) {
    surahSelect.selectedIndex++;
    surahSelect.dispatchEvent(new Event("change"));
  }

  updateSurahNavBtns();
});
