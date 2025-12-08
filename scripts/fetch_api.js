async function fetchReciter() {}

async function fetchSurah() {}

async function fetchNarration() {}

const audioEl = document.getElementById("audio_surah");

audioEl.addEventListener("click", () => {
  audioEl.play();
});
