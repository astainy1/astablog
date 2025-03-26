document.addEventListener("DOMContentLoaded", function() {
  const imageSlider = document.querySelector("img#slider-image"); 

  const subTitle = document.querySelector("#slider-subtitle"); 
  const mainTitle = document.querySelector("#slider-maintitle"); 

//   console.log(subTitle, mainTitle);


  // this ID is set in HTML
  let images = [];
  let i = 0;
  const sliderTime = 3500;



  // Fetch images from backend
  fetch('/api/sliders')
      .then(response => response.json())
      .then(data => {
          images = data.images;
          // console.log("Fetched images:", images); // Debugging
          if (images.length > 0) {
              changeImage(); // Start slider

          }
      })
      .catch(error => console.error("Error loading slider images:", error));

  // Function to change the image
  function changeImage() {
    // console.log("Fetched images:", images);
      if (images.length === 0) return;

      if (i < images.length - 1) {
          i++;
      } else {
          i = 0;
      }

      // Setting image source
      imageSlider.src = images[i].imagePath;

      // Setting image title
      mainTitle.innerHTML = images[i].maintitle;
      subTitle.innerHTML = images[i].subtitle;
    //   console.log(subTitle);
      setTimeout(changeImage, sliderTime);
  }
});
