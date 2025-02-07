// alert('Script connected successfully')
const toggleBtn = document.getElementById('toggle-btn');
const sidebar = document.querySelector('.sidebar-container');
const profileDetails = document.querySelector('.profile-details');
const profileImage = document.querySelector('#profile-img');
const logoutCancelBtn = document.querySelector('#logout-cancel-btn');
const profileLogout = document.querySelector('#profile-logout');	
const logoutBtn = document.querySelector('.logout-btn');
const mobileCloseMenuBtn = document.querySelector('#close-sidebar');
const body = document.querySelector('body');
const timesBtn = document.querySelector('#times-btn');
// console.log(body);



// console.log(toggleBtn);
// console.log(sidebar);
// console.log(profileDetails);
// console.log(profileImage);

//Set fleg to true
let toggle = true;
let profile = 1
document.addEventListener('DOMContentLoaded', () => {

        console.log(` Width: ${window.innerWidth} `);
           console.log(` Height: ${window.innerHeight}`);



// alert('Toggle button clicked');

    // Event to handle the toggling of the sidebar menu


    toggleBtn.addEventListener('click', () => {

        sidebar.classList.add('add-side-bar');
        // sidebar.style.width = 250;
        sidebar.style.transition = 'all 0.6s linear';
        console.log('Sidebar display is displayed');


    })


    // Close menu sidebar in mobile screen view

    mobileCloseMenuBtn.addEventListener('click', () => {
        sidebar.style.transition = 'display 0.6s linear';
        sidebar.classList.remove('add-side-bar');
    })

    // Event to hande profile details displaying
    // profileImage.addEventListener('click', () => {
    //         if(profile === 1){
    //             profile = 0;
    //         console.log('Profile details shows');
    //         profileDetails.classList.add('add-profile-details');
            
            
    //     }else{
    //         profile = 1;
    //             console.log('Profile details hides');
    //         profileDetails.classList.remove('add-profile-details');

    //         }
    //     });

        // Event to handle the canceling of the logout modal
        logoutCancelBtn.addEventListener('click', () => {
            document.querySelector('.logout-modal-backdrop').style.display = 'none';
            
        });
        
        // Event to handle the canceling of the modal using the times icon
        timesBtn.addEventListener('click', () => {
            document.querySelector('.logout-modal-backdrop').style.display = 'none';
        });

        // Event to handle the displaying of the modal
        profileLogout.addEventListener('click', () => {
            document.querySelector('.logout-modal-backdrop').style.display = 'flex';
        })

        // Redirect to the login page when logged out button is clicked
        logoutBtn.addEventListener('click', () => {
            window.location.href = './index.html';
        });





            const data = [
                { year: 2019, count: 304 },
                { year: 2020, count: 524 },
                { year: 2021, count: 67},
                { year: 2022, count: 320 },
                { year: 2023, count: 180 },
                { year: 2024, count: 204 },
                { year: 2025, count: 159 },
            ];

            // const result = data.map((data) => {
            //     console.log(data.count, data.year);
            // })

            // Charts

            // Chart HTML canvas
            const monthlyUploadChart = document.querySelector('#chart1');
            const weeklyUploadChart = document.querySelector('#chart2');
            const summaryData = document.querySelector('#chart3');
            const summaryData2 = document.querySelector('#chart4');

            // Month Uploads Data
            const monthlyData = [
                {month: 'Jan', upload: 282},
                {month: 'Feb', upload: 350},
                {month: 'Mar', upload: 411},
                {month: 'Apr', upload: 502},
                {month: 'May', upload: 635},
                {month: 'Jun', upload: 809},
                {month: 'Jul', upload: 947},
                {month: 'Aug', upload: 1402},
                {month: 'Sep', upload: 3700},
                {month: 'Oct', upload: 5267},
                {month: 'Nov', upload: 230},
                {month: 'Dec', upload: 431}
            ];

            // Weekly Upuload Data

            const weekly = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            const weeklyData = [
                {week: 'Sun', upload: 23},
                {week: 'Mon', upload: 87},
                {week: 'Tue', upload: 50},
                {week: 'Wed', upload: 10},
                {week: 'Thu', upload: 130},
                {week: 'Fri', upload: 43},
                {week: 'Sat', upload: 202}
            ];

            // Chart to display our data
            const myMonthlyChart = new Chart(monthlyUploadChart, {
                //Define type of chart
                type: 'line',
                options: {
                    aspectRatio: 2,
                },

                // Data to be place alone the x-axis and the y-axis
                data: {
                    labels: monthlyData.map((row) => row.upload),
                    datasets: [
                        {
                            data: monthlyData.map((row) => row.upload),
                            label: 'Total number of upload per month',
                            backgroundColor: '#58042f',
                            borderWidth: 2,

                        }
                    ]
                }
            });

            const myWeeklyChart = new Chart(weeklyUploadChart, {
                // Define type of chart
                type: 'bar',

                // Define data to be graphed
                data: {

                    labels: weeklyData.map((result) => result.week),
                    datasets: [
                        {
                            data: weeklyData.map((result) => result.upload),
                            label: 'Total number of upload per day',
                            backgroundColor: 'rgba(241, 59, 153, 0.5)',
                            borderColor: 'rgba(241, 59, 153, 0.2)',
                            borderWidth: 1
                        }
                    ]
                }
            });

            const mySummaryData = new Chart(summaryData, {
                type: 'radar',
                data: {
                    labels: data.map((results) => results.year),
                    datasets: [
                            
                            {
                                data: data.map((rows) => rows.count),
                                label: "Summary of yearly upload",
                                backgroundColor: "rgba(241, 59, 153, 0.5)"
                            }
                        ]
                    
                }
            });

            const mySummaryData2 = new Chart(summaryData2, {
                type: 'doughnut',
                data: {
                    labels: data.map((row) => row.year),
                    datasets: [
                        {
                            data: data.map((rows) => rows.count),
                        }
                    ]
                }
            })

})
    