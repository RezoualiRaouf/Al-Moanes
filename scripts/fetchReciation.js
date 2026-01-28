const reciterSelect = document.getElementById("reciter");
const narrationSelect = document.getElementById("narration");
const surahSelect = document.getElementById("surah");
const audioPlayer = document.getElementById("audioPlayer");

let allReciters = [];

const lang = "ar";
const defaultOptions = {
  eng: {
    reciter: `<option value="">Select reciter</option>`,
    narration: `<option value="">Select narration</option>`,
    surah: `<option value="">Select surah</option>`,
  },
  ar: {
    reciter: `<option value="">إختر قارئ</option>`,
    narration: `<option value="">إختر المصحف</option>`,
    surah: `<option value="">إختر السورة</option>`,
  },
};

// Inserts default options in dropdowns
const setDefaults = (dropDown, key) => {
  dropDown.innerHTML = defaultOptions[lang][key];
};

async function fetchSurahNames() {
  try {
    const surahAPI = `https://mp3quran.net/api/v3/suwar?language=${lang}`;
    const res = await fetch(surahAPI);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

let surahData = null;

(async () => {
  surahData = await fetchSurahNames();
  await fetchReciters();
})();

async function fetchReciters() {
  try {
    const res = await fetch(
      `https://www.mp3quran.net/api/v3/reciters?language=${lang}`,
    );
    const data = await res.json();

    // Save data
    allReciters = data.reciters;

    // Fill reciter dropdown
    reciterSelect.innerHTML =
      defaultOptions[lang]["reciter"] +
      data.reciters
        .map((r) => `<option value="${r.id}">${r.name}</option>`)
        .join("");
  } catch (error) {
    console.error(error);
  }
}

function onReciterChange(e) {
  const reciterId = e.target.value;
  // catch if user choses a default value
  if (!reciterId) {
    narrationSelect.innerHTML = defaultOptions[lang]["narration"];
    surahSelect.innerHTML = defaultOptions[lang]["surah"];
    return;
  }

  // Find selected reciter
  const selectedReciter = allReciters.find((r) => r.id == reciterId);

  if (!selectedReciter) return;
  if (selectedReciter.moshaf.length > 1) {
    // Fill narration dropdown with default value + narrations
    narrationSelect.innerHTML =
      defaultOptions[lang]["narration"] +
      selectedReciter.moshaf
        .map(
          (m) =>
            `<option value="${m.id}" data-server="${m.server}" data-surahlist="${m.surah_list}">${m.name}</option>`,
        )
        .join("");
    // set surah options to defalt when the reciter is changed
    surahSelect.innerHTML = defaultOptions[lang]["surah"];
  } else {
    // Fill narration dropdown with the only narration available
    narrationSelect.innerHTML = selectedReciter.moshaf
      .map(
        (m) =>
          `<option value="${m.id}" data-server="${m.server}" data-surahlist="${m.surah_list}">${m.name}</option>`,
      )
      .join("");
    // set surah options to defalt when the reciter is changed
    surahSelect.innerHTML = defaultOptions[lang]["surah"];
    onNarrationChange();
  }
}

function onNarrationChange() {
  // set surah options to defalt when the narration is changed
  surahSelect.innerHTML = defaultOptions[lang]["surah"];

  // Get selected narration element
  const selectedNarration =
    narrationSelect.options[narrationSelect.selectedIndex];

  if (!selectedNarration || !selectedNarration.value) return;

  // Get data from that option
  const surahServer = selectedNarration.dataset.server;
  let surahList = selectedNarration.dataset.surahlist;

  // Get suwar names form the fetchSurahName()
  if (!surahData || !surahData.suwar) console.error("Surah data not loaded");

  const surahNames = surahData.suwar;
  surahList = surahList.split(",");

  surahList.forEach((surah) => {
    surahNames.forEach((surahName) => {
      if (surahName.id == surah) {
        const paddedId = String(surahName.id).padStart(3, "0");
        surahSelect.innerHTML += `<option value="${surahServer}${paddedId}.mp3">${surahName.name}</option>`;
      }
    });
  });
}

function fetchSurah(e) {
  const selectedSurah = surahSelect.options[surahSelect.selectedIndex];

  if (!selectedSurah || !selectedSurah.value || selectedSurah.value === "") {
    return;
  }

  audioPlayer.pause();
  audioPlayer.src = selectedSurah.value;
  audioPlayer.load();
}

setDefaults(reciterSelect, "reciter");
setDefaults(narrationSelect, "narration");
setDefaults(surahSelect, "surah");

reciterSelect.addEventListener("change", onReciterChange);
narrationSelect.addEventListener("change", onNarrationChange);
surahSelect.addEventListener("change", fetchSurah);
fetchReciters();
