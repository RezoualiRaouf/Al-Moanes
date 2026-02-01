const playIconUrl = new URL("../assets/play-audio.svg", import.meta.url);
const playIcon = document.getElementById("playIcon");
const reciterSelect = document.getElementById("reciter");
const narrationSelect = document.getElementById("narration");
const surahSelect = document.getElementById("surah");
const audioPlayer = document.getElementById("audioPlayer");

window.currentUserSelect = {
  reciterID: "",
  narrationID: "",
  surahID: "",
  surahServer: "",
};

const defaultOptions = {
  en: {
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

let allReciters = [];
let surahData = null;
let lang = localStorage.getItem("language") || "en";

function isEmptyValue(v) {
  return (
    v === null || v === undefined || (typeof v === "string" && v.trim() === "")
  );
}

// Inserts default options in dropdowns
const setDefaults = (dropDown, key) => {
  dropDown.innerHTML = defaultOptions[lang][key];
};

// Fetch Surah Names from API
async function fetchSurahNames() {
  try {
    const surahAPI = `https://mp3quran.net/api/v3/suwar?language=${lang}`;
    const res = await fetch(surahAPI);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching surah names:", error);
    return null;
  }
}

// Fetch Reciters from API
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
    console.error("Error fetching reciters:", error);
  }
}

// Handle reciter selection change
function onReciterChange(e) {
  const reciterId = e.target.value;

  // Catch if user chooses a default value
  if (!reciterId) {
    narrationSelect.innerHTML = defaultOptions[lang]["narration"];
    surahSelect.innerHTML = defaultOptions[lang]["surah"];
    return;
  }

  // Find selected reciter
  const selectedReciter = allReciters.find((r) => r.id == reciterId);

  if (!selectedReciter) return;

  // store user selected reciter id
  currentUserSelect.reciterID = selectedReciter.id;

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
    // Set surah options to default when the reciter is changed
    surahSelect.innerHTML = defaultOptions[lang]["surah"];
  } else {
    // Fill narration dropdown with the only narration available
    narrationSelect.innerHTML = selectedReciter.moshaf
      .map(
        (m) =>
          `<option value="${m.id}" data-server="${m.server}" data-surahlist="${m.surah_list}">${m.name}</option>`,
      )
      .join("");
    // Set surah options to default when the reciter is changed
    surahSelect.innerHTML = defaultOptions[lang]["surah"];
    onNarrationChange();
  }
}

// Handle narration selection change
function onNarrationChange() {
  // Set surah options to default when the narration is changed
  surahSelect.innerHTML = defaultOptions[lang]["surah"];

  // Get selected narration element
  const selectedNarration =
    narrationSelect.options[narrationSelect.selectedIndex];

  if (!selectedNarration || !selectedNarration.value) return;

  // store user selected narration id
  currentUserSelect.narrationID = selectedNarration.value;

  // Get data from that option
  const surahServer = selectedNarration.dataset.server;
  let surahList = selectedNarration.dataset.surahlist;

  // Get suwar names from the fetchSurahNames()
  if (!surahData || !surahData.suwar) {
    console.error("Surah data not loaded");
    return;
  }

  const surahNames = surahData.suwar;
  surahList = surahList.split(",");

  // Load surahs with server id and name
  surahList.forEach((surah) => {
    surahNames.forEach((surahName) => {
      if (surahName.id == surah) {
        const paddedId = String(surahName.id).padStart(3, "0");
        surahSelect.innerHTML += `<option value="${surahServer}${paddedId}.mp3" id="${surahName.id}">${surahName.name}</option>`;
      }
    });
  });
}

// Load selected surah audio
function fetchSurah(e) {
  const selectedSurah = surahSelect.options[surahSelect.selectedIndex];

  if (!selectedSurah || !selectedSurah.value || selectedSurah.value === "") {
    return;
  }

  audioPlayer.pause();
  audioPlayer.src = selectedSurah.value;
  audioPlayer.load();

  // store user selected surah server after loading
  currentUserSelect.surahServer = selectedSurah.value;
  currentUserSelect.surahID = selectedSurah.id;
  // store user selections to load next time
  localStorage.setItem("quranSelections", JSON.stringify(currentUserSelect));
}

// Initialize data - fetch surah names and reciters
async function initializeData() {
  // Update lang variable from current language
  lang = localStorage.getItem("language") || "en";

  // Set default options in dropdowns
  setDefaults(reciterSelect, "reciter");
  setDefaults(narrationSelect, "narration");
  setDefaults(surahSelect, "surah");

  // Fetch data
  surahData = await fetchSurahNames();
  await fetchReciters();
  const saved = localStorage.getItem("quranSelections");
  if (saved) {
    Object.assign(currentUserSelect, JSON.parse(saved));
    await loadPrevSelect();
  }
}

async function loadPrevSelect() {
  // Only restore if user has made selections
  if (!currentUserSelect.reciterID) return;

  try {
    const api = `https://www.mp3quran.net/api/v3/reciters?language=${lang}&reciter=${currentUserSelect.reciterID}`;
    const res = await fetch(api);
    const data = await res.json();
    const reciter = data.reciters[0];
    if (!data.reciters || !data.reciters[0]) return;

    // Set reciter dropdown value
    reciterSelect.value = currentUserSelect.reciterID;

    // Populate and set narration dropdown
    if (reciter.moshaf.length > 1) {
      narrationSelect.innerHTML =
        defaultOptions[lang]["narration"] +
        reciter.moshaf
          .map(
            (m) =>
              `<option value="${m.id}" data-server="${m.server}" data-surahlist="${m.surah_list}">${m.name}</option>`,
          )
          .join("");
    } else {
      narrationSelect.innerHTML = reciter.moshaf
        .map(
          (m) =>
            `<option value="${m.id}" data-server="${m.server}" data-surahlist="${m.surah_list}">${m.name}</option>`,
        )
        .join("");
    }
    narrationSelect.value = currentUserSelect.narrationID;

    // Populate surah dropdown
    const selectedNarration =
      narrationSelect.options[narrationSelect.selectedIndex];
    const surahServer = selectedNarration.dataset.server;
    const surahList = selectedNarration.dataset.surahlist.split(",");

    surahSelect.innerHTML = defaultOptions[lang]["surah"];

    surahList.forEach((surah) => {
      surahData.suwar.forEach((surahName) => {
        if (surahName.id == surah) {
          const paddedId = String(surahName.id).padStart(3, "0");
          surahSelect.innerHTML += `<option value="${surahServer}${paddedId}.mp3" id="${surahName.id}">${surahName.name}</option>`;
        }
      });
    });
    /**
     * todo : load the new surah when switching
     */

    // Set surah dropdown value
    surahSelect.value = currentUserSelect.surahServer;
  } catch (error) {
    console.error("Error loading previous selections:", error);
  }
}

// Refresh data when language changes
async function onLanguageChange(event) {
  // Update lang variable
  lang = event.detail.lang;

  // Pause audio if playing
  if (audioPlayer) {
    audioPlayer.pause();
    playIcon.src = playIconUrl.href;
  }

  await initializeData();
  let anyEmpty = Object.values(currentUserSelect).some(isEmptyValue);
  if (!anyEmpty) {
    loadPrevSelect();
  }
}

// Event listeners for dropdowns
reciterSelect.addEventListener("change", onReciterChange);
narrationSelect.addEventListener("change", onNarrationChange);
surahSelect.addEventListener("change", fetchSurah);

// Listen for language change events from languageSwitcher.js
window.addEventListener("languageChanged", onLanguageChange);

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeData();
});

// initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeData);
} else {
  initializeData();
}
