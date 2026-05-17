const words = Array.from(document.querySelectorAll(".promise-list li"));
const wheel = document.querySelector(".no-wheel");
let activeIndex = words.findIndex((word) => word.classList.contains("active"));

if (activeIndex < 0) {
  activeIndex = 0;
}

function setActiveWord(index) {
  words.forEach((word, wordIndex) => {
    word.classList.toggle("active", wordIndex === index);
  });
  wheel.style.setProperty("--active-index", index);
}

setInterval(() => {
  activeIndex = (activeIndex + 1) % words.length;
  setActiveWord(activeIndex);
}, 1450);
