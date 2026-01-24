const dropdownBtn = document.querySelector(".dropDown-btn");

const submenu = document.querySelector(".sub-menu");

const submenuArrow = document.querySelector(".dropDone-arrow");

dropdownBtn.addEventListener("click", () => {
  submenu.classList.toggle("show");
  submenuArrow.classList.toggle("rotate");
});
