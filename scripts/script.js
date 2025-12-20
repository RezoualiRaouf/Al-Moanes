const sideBar = document.querySelector(".dropDown-btn");
const submenu = document.querySelector(".sub-menu");

sideBar.addEventListener("click", () => {
  submenu.classList.toggle("show");
});
