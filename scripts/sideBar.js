const sidebar = document.getElementById("sideBar");
const main = document.querySelector("main");
const toggleBtn = document.querySelector(".sidebar-toggle");

// Sidebar Toggle
document.addEventListener("DOMContentLoaded", function () {
  // Check if there's a saved state in localStorage
  const sidebarState = localStorage.getItem("sidebarState");
  if (sidebarState === "hidden") {
    sidebar.classList.add("hidden");
    main.classList.add("sidebar-hidden");
    toggleBtn.classList.add("collapsed");
  }

  // Toggle sidebar on button click
  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("hidden");
    main.classList.toggle("sidebar-hidden");
    toggleBtn.classList.toggle("collapsed");

    // Save state
    if (sidebar.classList.contains("hidden")) {
      localStorage.setItem("sidebarState", "hidden");
    } else {
      localStorage.setItem("sidebarState", "visible");
    }
  });
});

window.addEventListener("languagechange", () => {});

// Handle all dropdown buttons in the sidebar
const dropdownButtons = document.querySelectorAll(
  ".dropDown-btn, .dropDown-lang-btn",
);

// Open current dropDown and close the other if open
dropdownButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Find the submenu and arrow within the same parent li
    const parentLi = button.closest("li");
    const submenu = parentLi.querySelector(".sub-menu");
    const arrow = button.querySelector(".dropDone-arrow");

    // Toggle the current dropdown
    submenu.classList.toggle("show");
    arrow.classList.toggle("rotate");

    dropdownButtons.forEach((otherButton) => {
      if (otherButton !== button) {
        const otherParentLi = otherButton.closest("li");
        const otherSubmenu = otherParentLi.querySelector(".sub-menu");
        const otherArrow = otherButton.querySelector(".dropDone-arrow");

        otherSubmenu.classList.remove("show");
        otherArrow.classList.remove("rotate");
      }
    });
  });
});

// Close dropdowns when clicking outside
document.addEventListener("click", (event) => {
  const isDropdownButton = event.target.closest(
    ".dropDown-btn, .dropDown-lang-btn",
  );
  const isSubmenu = event.target.closest(".sub-menu");

  if (!isDropdownButton && !isSubmenu) {
    dropdownButtons.forEach((button) => {
      const parentLi = button.closest("li");
      const submenu = parentLi.querySelector(".sub-menu");
      const arrow = button.querySelector(".dropDone-arrow");

      submenu.classList.remove("show");
      arrow.classList.remove("rotate");
    });
  }
});
