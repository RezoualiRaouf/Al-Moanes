const playIconUrl = new URL("../assets/play-audio.svg", import.meta.url);
const playIcon = document.getElementById("playIcon");
const narrationSelect = document.getElementById("narration");
const surahSelect = document.getElementById("surah");
const audioPlayer = document.getElementById("audioPlayer");

// Custom reciter search elements
const reciterSearchInput = document.getElementById("reciterSearchInput");
const reciterList = document.getElementById("reciterList");
const reciterSearchWrapper = document.getElementById("reciterSearchWrapper");

window.currentUserSelect = {
  reciterID: "",
  narrationID: "",
  surahID: "",
  surahServer: "",
};

const defaultOptions = {
  en: {
    narration: `<option value="">Select narration</option>`,
    surah: `<option value="">Select surah</option>`,
  },
  ar: {
    narration: `<option value="">إختر المصحف</option>`,
    surah: `<option value="">إختر السورة</option>`,
  },
};

const searchPlaceholders = {
  en: "Search reciter...",
  ar: "ابحث عن قارئ...",
};

const emptyMessages = {
  en: "No results found",
  ar: "لا يوجد نتائج",
};

let allReciters = [];
let surahData = null;
let lang = localStorage.getItem("language") || "en";

function isEmptyValue(v) {
  return (
    v === null || v === undefined || (typeof v === "string" && v.trim() === "")
  );
}

// ── Custom Reciter Search Dropdown ──────────────────────────────────────────

function buildReciterList(reciters) {
  reciterList.innerHTML = "";

  if (reciters.length === 0) {
    const li = document.createElement("li");
    li.className = "reciter-search__item reciter-search__item--empty";
    li.textContent = emptyMessages[lang] || emptyMessages.en;
    reciterList.appendChild(li);
    return;
  }

  reciters.forEach((reciter) => {
    const li = document.createElement("li");
    li.className = "reciter-search__item";

    // Highlight matching text
    const query = reciterSearchInput.value.trim();
    if (query) {
      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      li.innerHTML = reciter.name.replace(
        regex,
        `<mark class="reciter-search__highlight">$1</mark>`,
      );
    } else {
      li.textContent = reciter.name;
    }

    li.dataset.id = reciter.id;
    li.dataset.name = reciter.name;

    // Use mousedown so it fires before blur closes the list
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectReciter(reciter);
    });

    reciterList.appendChild(li);
  });
}

function showReciterList(reciters) {
  buildReciterList(reciters);
  reciterList.hidden = false;
}

function hideReciterList() {
  reciterList.hidden = true;
}

function selectReciter(reciter) {
  reciterSearchInput.value = reciter.name;
  reciterSearchInput.dataset.selectedId = reciter.id;
  hideReciterList();
  currentUserSelect.reciterID = reciter.id;
  onReciterSelected(reciter.id);
  // Auto-focus narration after a tick so the DOM has updated
  setTimeout(() => narrationSelect.focus(), 50);
}

function filterReciters() {
  const query = reciterSearchInput.value.trim().toLowerCase();
  // Clear selection if user edits after selecting
  reciterSearchInput.dataset.selectedId = "";

  const filtered = query
    ? allReciters.filter((r) => r.name.toLowerCase().includes(query))
    : allReciters;

  showReciterList(filtered);
}

reciterSearchInput.addEventListener("input", filterReciters);

reciterSearchInput.addEventListener("focus", () => {
  const query = reciterSearchInput.value.trim().toLowerCase();
  const filtered = query
    ? allReciters.filter((r) => r.name.toLowerCase().includes(query))
    : allReciters;
  showReciterList(filtered);
});

reciterSearchInput.addEventListener("blur", () => {
  // Delay to allow mousedown on list items to fire first
  setTimeout(hideReciterList, 160);
});

// Close dropdown when clicking outside the wrapper
document.addEventListener("click", (e) => {
  if (!e.target.closest("#reciterSearchWrapper")) {
    hideReciterList();
  }
});

// Keyboard navigation
reciterSearchInput.addEventListener("keydown", (e) => {
  if (reciterList.hidden) return;

  const items = reciterList.querySelectorAll(
    ".reciter-search__item:not(.reciter-search__item--empty)",
  );
  const active = reciterList.querySelector(".reciter-search__item--active");
  let idx = Array.from(items).indexOf(active);

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (active) active.classList.remove("reciter-search__item--active");
    idx = (idx + 1) % items.length;
    items[idx]?.classList.add("reciter-search__item--active");
    items[idx]?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (active) active.classList.remove("reciter-search__item--active");
    idx = (idx - 1 + items.length) % items.length;
    items[idx]?.classList.add("reciter-search__item--active");
    items[idx]?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (active) {
      const id = active.dataset.id;
      const name = active.dataset.name;
      selectReciter({ id, name });
    }
  } else if (e.key === "Escape") {
    hideReciterList();
    reciterSearchInput.blur();
  }
});

// ── Helpers ─────────────────────────────────────────────────────────────────

const setDefaults = (dropDown, key) => {
  dropDown.innerHTML = defaultOptions[lang][key];
};

const resetReciterSearch = (clearInput = true) => {
  if (clearInput) {
    reciterSearchInput.value = "";
    reciterSearchInput.dataset.selectedId = "";
  }
  hideReciterList();
};

// ── Fetch Data ───────────────────────────────────────────────────────────────

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

async function fetchReciters() {
  try {
    const res = await fetch(
      `https://www.mp3quran.net/api/v3/reciters?language=${lang}`,
    );
    const data = await res.json();
    allReciters = data.reciters;
  } catch (error) {
    console.error("Error fetching reciters:", error);
  }
}

// ── Reciter Selected ─────────────────────────────────────────────────────────

function onReciterSelected(reciterId) {
  if (!reciterId) {
    setDefaults(narrationSelect, "narration");
    setDefaults(surahSelect, "surah");
    return;
  }

  const selectedReciter = allReciters.find((r) => r.id == reciterId);
  if (!selectedReciter) return;

  if (selectedReciter.moshaf.length > 1) {
    narrationSelect.innerHTML =
      defaultOptions[lang]["narration"] +
      selectedReciter.moshaf
        .map(
          (m) =>
            `<option value="${m.id}" data-server="${m.server}" data-surahlist="${m.surah_list}">${m.name}</option>`,
        )
        .join("");
    setDefaults(surahSelect, "surah");
    // narration already focused by selectReciter(); nothing extra needed
  } else {
    narrationSelect.innerHTML = selectedReciter.moshaf
      .map(
        (m) =>
          `<option value="${m.id}" data-server="${m.server}" data-surahlist="${m.surah_list}">${m.name}</option>`,
      )
      .join("");
    setDefaults(surahSelect, "surah");
    // Only one narration — populate surahs and jump straight to surah select
    onNarrationChange({ autoFocus: true });
  }
}

// ── Narration Change ─────────────────────────────────────────────────────────

function onNarrationChange({ autoFocus = false } = {}) {
  setDefaults(surahSelect, "surah");

  const selectedNarration =
    narrationSelect.options[narrationSelect.selectedIndex];

  if (!selectedNarration || !selectedNarration.value) return;

  currentUserSelect.narrationID = selectedNarration.value;

  const surahServer = selectedNarration.dataset.server;
  let surahList = selectedNarration.dataset.surahlist;

  if (!surahData || !surahData.suwar) {
    console.error("Surah data not loaded");
    return;
  }

  const surahNames = surahData.suwar;
  surahList = surahList.split(",");
  const reciterName = reciterSearchInput.value;

  surahList.forEach((surah) => {
    surahNames.forEach((surahName) => {
      if (surahName.id == surah) {
        const paddedId = String(surahName.id).padStart(3, "0");
        surahSelect.innerHTML += `<option value="${surahServer}${paddedId}.mp3" data-reciter="${reciterName}" id="${surahName.id}">${surahName.name}</option>`;
      }
    });
  });

  window.dispatchEvent(new CustomEvent("surahListUpdated"));

  // Auto-focus surah: always when narration changes or when called with autoFocus flag
  setTimeout(() => surahSelect.focus(), 50);
}

// ── Surah Change ─────────────────────────────────────────────────────────────

function fetchSurah() {
  const selectedSurah = surahSelect.options[surahSelect.selectedIndex];

  if (!selectedSurah || !selectedSurah.value || selectedSurah.value === "") {
    return;
  }

  audioPlayer.pause();
  audioPlayer.src = selectedSurah.value;
  audioPlayer.load();

  currentUserSelect.surahServer = selectedSurah.value;
  currentUserSelect.surahID = selectedSurah.id;
  localStorage.setItem("quranSelections", JSON.stringify(currentUserSelect));
}

// ── Initialize ───────────────────────────────────────────────────────────────

async function initializeData() {
  lang = localStorage.getItem("language") || "en";

  reciterSearchInput.placeholder =
    searchPlaceholders[lang] || searchPlaceholders.en;
  resetReciterSearch(true);
  setDefaults(narrationSelect, "narration");
  setDefaults(surahSelect, "surah");

  surahData = await fetchSurahNames();
  await fetchReciters();

  const saved = localStorage.getItem("quranSelections");
  if (saved) {
    Object.assign(currentUserSelect, JSON.parse(saved));
    await loadPrevSelect();
  }
}

async function loadPrevSelect() {
  if (!currentUserSelect.reciterID) return;

  try {
    const api = `https://www.mp3quran.net/api/v3/reciters?language=${lang}&reciter=${currentUserSelect.reciterID}`;
    const res = await fetch(api);
    const data = await res.json();
    if (!data.reciters || !data.reciters[0]) return;
    const reciter = data.reciters[0];

    // Restore search input with reciter name
    reciterSearchInput.value = reciter.name;
    reciterSearchInput.dataset.selectedId = reciter.id;

    // Populate narration dropdown
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
          surahSelect.innerHTML += `<option value="${surahServer}${paddedId}.mp3" data-reciter="${reciter.name}" id="${surahName.id}">${surahName.name}</option>`;
        }
      });
    });

    surahSelect.value = currentUserSelect.surahServer;
    audioPlayer.src = currentUserSelect.surahServer;

    window.dispatchEvent(new CustomEvent("surahListUpdated"));
  } catch (error) {
    console.error("Error loading previous selections:", error);
  }
}

// ── Language Change ───────────────────────────────────────────────────────────

async function onLanguageChange(event) {
  lang = event.detail.lang;

  // Update placeholder for the new language
  reciterSearchInput.placeholder =
    searchPlaceholders[lang] || searchPlaceholders.en;

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

// ── Event Listeners ──────────────────────────────────────────────────────────

narrationSelect.addEventListener("change", onNarrationChange);
surahSelect.addEventListener("change", fetchSurah);
window.addEventListener("languageChanged", onLanguageChange);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeData);
} else {
  initializeData();
}
