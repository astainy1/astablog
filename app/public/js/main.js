

let newYear = new Date();
    let thisYear = newYear.getFullYear();
    document.getElementById("update-year").innerHTML = thisYear;


let isDisplaying = false;
const menuBtn = document.getElementById("show-menu-btn");
menuBtn.addEventListener("click", () => {
    const menu = document.getElementById("menu");
    if(!isDisplaying) {
        console.log("Displaying: " + isDisplaying);
        menu.style.display = 'flex';
        isDisplaying = true;
        document.onscroll = () => {
            console.log("User is scrolling is taking effect");
            menu.style.display = 'none';
            isDisplaying = false;
        }
    }else{
        console.log("It's not Displaying: " + isDisplaying);
        menu.style.display = 'none';
        isDisplaying = false;
    }
});





   
