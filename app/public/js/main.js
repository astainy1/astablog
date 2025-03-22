// Scroll to top
const scrollTopContainer = document.querySelector(".scroll-top");
const scrollTop = document.querySelector("#scroll-top-btn");

// Mobile menu btns
const closeMenuBtn = document.querySelector("#close-menu-btn");
const openMenuBtn = document.querySelector("#open-menu-btn");

let newYear = new Date();
let thisYear = newYear.getFullYear();
document.getElementById("update-year").innerHTML = thisYear;

let isDisplaying = false;

// Menu open and close
closeMenuBtn.addEventListener("click", () => {
  document.querySelector(".mobile-menu-container").style.right = "-50%";
});
openMenuBtn.addEventListener("click", () => {
  document.querySelector(".mobile-menu-container").style.right = 0;
});

window.addEventListener("resize", () => {
  // console.log('Window is resize');
  menu.style.display = "none";
  isDisplaying = false;
});

window.addEventListener("scroll", () => {
  // console.log("User is scrolling the page.");
  // console.log(window.scrollbars);
  // console.log(body.scro);

  scrollTop.addEventListener("click", () => {
    document.body.scrollTop = 0; //Safari
    document.documentElement.scrollTop = 0; //Chrome
  });

  if (
    document.body.scrollTop > 1500 ||
    document.documentElement.scrollTop > 1500
  ) {
    scrollTopContainer.style.display = "block";
    // console.log("Scroll is greater than 40");
  } else {
    scrollTopContainer.style.display = "none";
    // console.log("Scroll is lesser than 40");
  }
});

const menuBtn = document.getElementById("show-menu-btn");
menuBtn.addEventListener("click", () => {
  const menu = document.getElementById("menu");
  if (!isDisplaying) {
    // console.log("Displaying: " + isDisplaying);
    menu.style.display = "flex";
    isDisplaying = true;
    document.onscroll = () => {
      // console.log("User is scrolling is taking effect");
      menu.style.display = "none";
      isDisplaying = false;
    };
  } else {
    // console.log("It's not Displaying: " + isDisplaying);
    menu.style.display = "none";
    isDisplaying = false;
  }
});
