const sideBar = document.querySelector(".dropDown-btn");
const submenu = document.querySelector(".sub-menu");

console.log(sideBar);
console.log(submenu);

sideBar.addEventListener("click", () => {
  submenu.classList.toggle("show");
});
