window.addEventListener("scroll", () => {
  const nav = document.querySelector(".nav__section");

  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});
