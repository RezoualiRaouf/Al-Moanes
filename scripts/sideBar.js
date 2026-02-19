(function () {
  const sideBar = document.getElementById("sideBar");
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const mainEl = document.querySelector("main");
  const dropdownBtns = document.querySelectorAll(
    ".dropDown-btn, .dropDown-lang-btn",
  );
  const backToTop = document.querySelector(".back_to_top");

  function setSubMenuTabIndex(subMenu, reachable) {
    const focusables = subMenu.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables.forEach((el) => {
      el.setAttribute("tabindex", reachable ? "0" : "-1");
    });
  }

  function openSubMenu(btn, subMenu, arrow) {
    subMenu.classList.add("show");
    if (arrow) arrow.classList.add("rotate");
    btn.setAttribute("aria-expanded", "true");
    setSubMenuTabIndex(subMenu, true);
  }

  function closeSubMenu(btn, subMenu, arrow) {
    subMenu.classList.remove("show");
    if (arrow) arrow.classList.remove("rotate");
    btn.setAttribute("aria-expanded", "false");
    setSubMenuTabIndex(subMenu, false);
  }

  document.querySelectorAll(".sub-menu").forEach((subMenu) => {
    setSubMenuTabIndex(subMenu, false);
  });

  dropdownBtns.forEach((btn) => {
    const subMenu =
      btn.closest("li")?.querySelector(".sub-menu") ?? btn.nextElementSibling;
    const arrow = btn.querySelector(".dropDone-arrow");

    if (!subMenu) return;

    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");

    btn.addEventListener("click", () => {
      const isOpen = subMenu.classList.contains("show");
      if (isOpen) {
        closeSubMenu(btn, subMenu, arrow);
      } else {
        dropdownBtns.forEach((otherBtn) => {
          if (otherBtn === btn) return;
          const otherSub =
            otherBtn.closest("li")?.querySelector(".sub-menu") ??
            otherBtn.nextElementSibling;
          const otherArrow = otherBtn.querySelector(".dropDone-arrow");
          if (otherSub?.classList.contains("show")) {
            closeSubMenu(otherBtn, otherSub, otherArrow);
          }
        });
        openSubMenu(btn, subMenu, arrow);
      }
    });

    subMenu.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSubMenu(btn, subMenu, arrow);
        btn.focus();
      }
    });
  });

  if (sidebarToggle && sideBar && mainEl) {
    // Restore last state from localStorage
    const savedHidden = localStorage.getItem("sidebarHidden") === "true";
    if (savedHidden) {
      sideBar.classList.add("hidden");
      mainEl.classList.add("sidebar-hidden");
      sidebarToggle.classList.add("collapsed");
    }

    sidebarToggle.addEventListener("click", () => {
      const isHidden = sideBar.classList.contains("hidden");

      if (isHidden) {
        // Show sidebar
        sideBar.classList.remove("hidden");
        mainEl.classList.remove("sidebar-hidden");
        sidebarToggle.classList.remove("collapsed");
        localStorage.setItem("sidebarHidden", "false");
      } else {
        // Hide sidebar
        sideBar.classList.add("hidden");
        mainEl.classList.add("sidebar-hidden");
        sidebarToggle.classList.add("collapsed");
        localStorage.setItem("sidebarHidden", "true");
      }
    });
  }

  if (backToTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTop.classList.add("show");
      } else {
        backToTop.classList.remove("show");
      }
    });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Keyboard support for the back-to-top button
    backToTop.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (sideBar && !sideBar.contains(e.target)) {
      dropdownBtns.forEach((btn) => {
        const subMenu =
          btn.closest("li")?.querySelector(".sub-menu") ??
          btn.nextElementSibling;
        const arrow = btn.querySelector(".dropDone-arrow");
        if (subMenu?.classList.contains("show")) {
          closeSubMenu(btn, subMenu, arrow);
        }
      });
    }
  });
})();
