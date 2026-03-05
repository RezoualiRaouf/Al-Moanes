const playIconUrl = new URL("../assets/play-audio.svg", import.meta.url);
const playIcon = document.getElementById("playIcon");
const audioPlayer = document.getElementById("audioPlayer");

// Reciter search elements
const reciterSearchInput = document.getElementById("reciterSearchInput");
const reciterList = document.getElementById("reciterList");

// Narration search elements
const narrationSearchInput = document.getElementById("narrationSearchInput");
const narrationList = document.getElementById("narrationList");

// Surah search elements
const surahSearchInput = document.getElementById("surahSearchInput");
const surahList = document.getElementById("surahList");

window.currentUserSelect = {
  reciterID: "",
  narrationID: "",
  surahID: "",
  surahServer: "",
};

const searchPlaceholders = {
  en: {
    reciter: "Search reciter...",
    narration: "Search narration...",
    surah: "Search surah...",
  },
  ar: {
    reciter: "ابحث عن قارئ...",
    narration: "ابحث عن المصحف...",
    surah: "ابحث عن سورة...",
  },
};

const emptyMessages = {
  en: "No results found",
  ar: "لا يوجد نتائج",
};

let allReciters = [];
let allNarrations = [];
let allSurahs = [];
let surahData = null;
let lang = localStorage.getItem("language") || "en";

function isEmptyValue(v) {
  return (
    v === null || v === undefined || (typeof v === "string" && v.trim() === "")
  );
}

// -- Shared keyboard navigation --

function handleDropdownKeydown(e, listEl, onEnter, inputEl) {
  if (listEl.hidden) return;

  const items = listEl.querySelectorAll(
    ".reciter-search__item:not(.reciter-search__item--empty)",
  );
  const active = listEl.querySelector(".reciter-search__item--active");
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
    if (active) onEnter(active);
  } else if (e.key === "Escape") {
    listEl.hidden = true;
    inputEl.blur();
  }
}

// -- Reciter search --

function buildReciterList(reciters) {
  reciterList.innerHTML = "";

  if (reciters.length === 0) {
    const li = document.createElement("li");
    li.className = "reciter-search__item reciter-search__item--empty";
    li.textContent = emptyMessages[lang] || emptyMessages.en;
    reciterList.appendChild(li);
    return;
  }

  const query = reciterSearchInput.value.trim();
  reciters.forEach((reciter) => {
    const li = document.createElement("li");
    li.className = "reciter-search__item";

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
  setTimeout(() => narrationSearchInput.focus(), 50);
}

const resetReciterSearch = (clearInput = true) => {
  if (clearInput) {
    reciterSearchInput.value = "";
    reciterSearchInput.dataset.selectedId = "";
  }
  hideReciterList();
};

reciterSearchInput.addEventListener("input", () => {
  reciterSearchInput.dataset.selectedId = "";
  const query = reciterSearchInput.value.trim().toLowerCase();
  const filtered = query
    ? allReciters.filter((r) => r.name.toLowerCase().includes(query))
    : allReciters;
  showReciterList(filtered);
});
reciterSearchInput.addEventListener("focus", () => {
  const query = reciterSearchInput.value.trim().toLowerCase();
  const filtered = query
    ? allReciters.filter((r) => r.name.toLowerCase().includes(query))
    : allReciters;
  showReciterList(filtered);
});
reciterSearchInput.addEventListener("blur", () =>
  setTimeout(hideReciterList, 160),
);
reciterSearchInput.addEventListener("keydown", (e) =>
  handleDropdownKeydown(
    e,
    reciterList,
    (active) => {
      selectReciter({ id: active.dataset.id, name: active.dataset.name });
    },
    reciterSearchInput,
  ),
);

// -- Narration search --

function buildNarrationList(narrations) {
  narrationList.innerHTML = "";

  if (narrations.length === 0) {
    const li = document.createElement("li");
    li.className = "reciter-search__item reciter-search__item--empty";
    li.textContent = emptyMessages[lang] || emptyMessages.en;
    narrationList.appendChild(li);
    return;
  }

  const query = narrationSearchInput.value.trim();
  narrations.forEach((narration) => {
    const li = document.createElement("li");
    li.className = "reciter-search__item";

    if (query) {
      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      li.innerHTML = narration.name.replace(
        regex,
        `<mark class="reciter-search__highlight">$1</mark>`,
      );
    } else {
      li.textContent = narration.name;
    }

    li.dataset.id = narration.id;
    li.dataset.name = narration.name;
    li.dataset.server = narration.server;
    li.dataset.surahlist = narration.surahList;
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectNarration(narration);
    });

    narrationList.appendChild(li);
  });
}

function showNarrationList(narrations) {
  buildNarrationList(narrations);
  narrationList.hidden = false;
}

function hideNarrationList() {
  narrationList.hidden = true;
}

function selectNarration(narration) {
  narrationSearchInput.value = narration.name;
  narrationSearchInput.dataset.selectedId = narration.id;
  hideNarrationList();
  currentUserSelect.narrationID = narration.id;
  onNarrationSelected(narration);
  setTimeout(() => surahSearchInput.focus(), 50);
}

const resetNarrationSearch = (clearInput = true) => {
  if (clearInput) {
    narrationSearchInput.value = "";
    narrationSearchInput.dataset.selectedId = "";
  }
  hideNarrationList();
  allNarrations = [];
};

narrationSearchInput.addEventListener("input", () => {
  narrationSearchInput.dataset.selectedId = "";
  const query = narrationSearchInput.value.trim().toLowerCase();
  const filtered = query
    ? allNarrations.filter((n) => n.name.toLowerCase().includes(query))
    : allNarrations;
  showNarrationList(filtered);
});
narrationSearchInput.addEventListener("focus", () => {
  const query = narrationSearchInput.value.trim().toLowerCase();
  const filtered = query
    ? allNarrations.filter((n) => n.name.toLowerCase().includes(query))
    : allNarrations;
  showNarrationList(filtered);
});
narrationSearchInput.addEventListener("blur", () =>
  setTimeout(hideNarrationList, 160),
);
narrationSearchInput.addEventListener("keydown", (e) =>
  handleDropdownKeydown(
    e,
    narrationList,
    (active) => {
      selectNarration({
        id: active.dataset.id,
        name: active.dataset.name,
        server: active.dataset.server,
        surahList: active.dataset.surahlist,
      });
    },
    narrationSearchInput,
  ),
);

// -- Surah search --

function buildSurahList(surahs) {
  surahList.innerHTML = "";

  if (surahs.length === 0) {
    const li = document.createElement("li");
    li.className = "reciter-search__item reciter-search__item--empty";
    li.textContent = emptyMessages[lang] || emptyMessages.en;
    surahList.appendChild(li);
    return;
  }

  const query = surahSearchInput.value.trim();
  surahs.forEach((surah) => {
    const li = document.createElement("li");
    li.className = "reciter-search__item";

    if (query) {
      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      li.innerHTML = surah.name.replace(
        regex,
        `<mark class="reciter-search__highlight">$1</mark>`,
      );
    } else {
      li.textContent = surah.name;
    }

    li.dataset.value = surah.value;
    li.dataset.id = surah.id;
    li.dataset.name = surah.name;
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectSurah(surah);
    });

    surahList.appendChild(li);
  });
}

function showSurahList(surahs) {
  buildSurahList(surahs);
  surahList.hidden = false;
}

function hideSurahList() {
  surahList.hidden = true;
}

function selectSurah(surah) {
  surahSearchInput.value = surah.name;
  surahSearchInput.dataset.selectedValue = surah.value;
  hideSurahList();

  // Load selected surah audio
  audioPlayer.pause();
  audioPlayer.src = surah.value;
  audioPlayer.load();

  currentUserSelect.surahServer = surah.value;
  currentUserSelect.surahID = surah.id;
  localStorage.setItem("quranSelections", JSON.stringify(currentUserSelect));
}

const resetSurahSearch = (clearInput = true) => {
  if (clearInput) {
    surahSearchInput.value = "";
    surahSearchInput.dataset.selectedValue = "";
  }
  hideSurahList();
  allSurahs = [];
};

surahSearchInput.addEventListener("input", () => {
  surahSearchInput.dataset.selectedValue = "";
  const query = surahSearchInput.value.trim().toLowerCase();
  const filtered = query
    ? allSurahs.filter((s) => s.name.toLowerCase().includes(query))
    : allSurahs;
  showSurahList(filtered);
});
surahSearchInput.addEventListener("focus", () => {
  const query = surahSearchInput.value.trim().toLowerCase();
  const filtered = query
    ? allSurahs.filter((s) => s.name.toLowerCase().includes(query))
    : allSurahs;
  showSurahList(filtered);
});
surahSearchInput.addEventListener("blur", () => setTimeout(hideSurahList, 160));
surahSearchInput.addEventListener("keydown", (e) =>
  handleDropdownKeydown(
    e,
    surahList,
    (active) => {
      selectSurah({
        value: active.dataset.value,
        id: active.dataset.id,
        name: active.dataset.name,
      });
    },
    surahSearchInput,
  ),
);

// Close all dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest("#reciterSearchWrapper")) hideReciterList();
  if (!e.target.closest("#narrationSearchWrapper")) hideNarrationList();
  if (!e.target.closest("#surahSearchWrapper")) hideSurahList();
});

// -- API calls --

async function fetchSurahNames() {
  try {
    const res = await fetch(
      `https://mp3quran.net/api/v3/suwar?language=${lang}`,
    );
    return await res.json();
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

// -- Reciter selected: populate narration list --

function onReciterSelected(reciterId) {
  if (!reciterId) {
    resetNarrationSearch(true);
    resetSurahSearch(true);
    return;
  }

  const selectedReciter = allReciters.find((r) => r.id == reciterId);
  if (!selectedReciter) return;

  // Build narration list from reciter's moshaf array
  allNarrations = selectedReciter.moshaf.map((m) => ({
    id: String(m.id),
    name: m.name,
    server: m.server,
    surahList: m.surah_list,
  }));

  resetNarrationSearch(true);
  resetSurahSearch(true);

  // If only one narration, select it automatically
  if (allNarrations.length === 1) {
    selectNarration(allNarrations[0]);
  }
}

// -- Narration selected: rebuild surah list --

function onNarrationSelected(narration) {
  resetSurahSearch(true);

  if (!surahData?.suwar) {
    console.error("Surah data not loaded");
    return;
  }

  const surahIds = narration.surahList.split(",");
  const reciterName = reciterSearchInput.value;

  // Build surah list for the chosen narration
  allSurahs = [];
  surahIds.forEach((surahId) => {
    surahData.suwar.forEach((surahName) => {
      if (surahName.id == surahId) {
        const paddedId = String(surahName.id).padStart(3, "0");
        allSurahs.push({
          value: `${narration.server}${paddedId}.mp3`,
          id: String(surahName.id),
          name: surahName.name,
          reciter: reciterName,
        });
      }
    });
  });

  window.dispatchEvent(new CustomEvent("surahListUpdated"));
}

// -- Init --

async function initializeData() {
  lang = localStorage.getItem("language") || "en";
  const p = searchPlaceholders[lang] || searchPlaceholders.en;

  reciterSearchInput.placeholder = p.reciter;
  narrationSearchInput.placeholder = p.narration;
  surahSearchInput.placeholder = p.surah;

  resetReciterSearch(true);
  resetNarrationSearch(true);
  resetSurahSearch(true);

  surahData = await fetchSurahNames();
  await fetchReciters();

  // Restore last user selection if available
  const saved = localStorage.getItem("quranSelections");
  if (saved) {
    Object.assign(currentUserSelect, JSON.parse(saved));
    await loadPrevSelect();
  }
}

async function loadPrevSelect() {
  if (!currentUserSelect.reciterID) return;

  try {
    const res = await fetch(
      `https://www.mp3quran.net/api/v3/reciters?language=${lang}&reciter=${currentUserSelect.reciterID}`,
    );
    const data = await res.json();
    if (!data.reciters?.[0]) return;
    const reciter = data.reciters[0];

    // Restore reciter input
    reciterSearchInput.value = reciter.name;
    reciterSearchInput.dataset.selectedId = reciter.id;

    // Rebuild narration list
    allNarrations = reciter.moshaf.map((m) => ({
      id: String(m.id),
      name: m.name,
      server: m.server,
      surahList: m.surah_list,
    }));

    // Restore selected narration input
    const savedNarration = allNarrations.find(
      (n) => n.id === String(currentUserSelect.narrationID),
    );
    if (savedNarration) {
      narrationSearchInput.value = savedNarration.name;
      narrationSearchInput.dataset.selectedId = savedNarration.id;

      // Rebuild surah list for the saved narration
      const surahIds = savedNarration.surahList.split(",");
      allSurahs = [];
      surahIds.forEach((surahId) => {
        surahData.suwar.forEach((surahName) => {
          if (surahName.id == surahId) {
            const paddedId = String(surahName.id).padStart(3, "0");
            allSurahs.push({
              value: `${savedNarration.server}${paddedId}.mp3`,
              id: String(surahName.id),
              name: surahName.name,
              reciter: reciter.name,
            });
          }
        });
      });

      // Restore selected surah input
      const savedSurah = allSurahs.find(
        (s) => s.value === currentUserSelect.surahServer,
      );
      if (savedSurah) {
        surahSearchInput.value = savedSurah.name;
        surahSearchInput.dataset.selectedValue = savedSurah.value;
      }
    }

    audioPlayer.src = currentUserSelect.surahServer;
    window.dispatchEvent(new CustomEvent("surahListUpdated"));
  } catch (error) {
    console.error("Error loading previous selections:", error);
  }
}

// -- Language change: re-init everything --

async function onLanguageChange(event) {
  lang = event.detail.lang;
  const p = searchPlaceholders[lang] || searchPlaceholders.en;

  reciterSearchInput.placeholder = p.reciter;
  narrationSearchInput.placeholder = p.narration;
  surahSearchInput.placeholder = p.surah;

  if (audioPlayer) {
    audioPlayer.pause();
    playIcon.src = playIconUrl.href;
  }

  await initializeData();

  const anyEmpty = Object.values(currentUserSelect).some(isEmptyValue);
  if (!anyEmpty) loadPrevSelect();
}

// -- Event listeners --

window.addEventListener("languageChanged", onLanguageChange);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeData);
} else {
  initializeData();
}
