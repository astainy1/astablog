// Testing connection
// alert("Connection established")

const imageSlider = document.imageSlider;
console.log("Image slider", imageSlider);

// Set the idexes to every image
const sliderTime = 3500;
let i = 0;
let images = [];

// Set the values for the iamges to be slided

images[0] = "../img/pic1.png";
images[1] = "../img/pic2.png";
images[2] = "../img/pic3.png";
images[3] = "../img/pic4.jpg";
images[4] = "../img/header-bg.jpeg";
images[5] = "../img/header-bg2.avif";

// Function to change the image
function changeImage() {
  if (i < images.length - 1) {
    // Increment i by 1 every time

    i++;
    // console.log(`I is now: ${i}`);
    // console.log("Image slider", imageSlider);

    /*  Set the image source attribute to the image path 
    for every time i increment to one based on the image index */

    imageSlider.src = images[i];
  } else {
    // reset i to zero if i is not less than images.length
    i = 0;
    // console.log(`I is being reset to: ${i}`);
  }
  // Change image after a specific set time
  setTimeout(changeImage, sliderTime);
}
// Invoke function when window load
window.onload = changeImage();
