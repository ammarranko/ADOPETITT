function getCurrentDate() {
    var date = new Date();
    let dateInString = "";
    const daysOfTheWeek = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    const monthsOfYear = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    let currentDate = "";
    currentDate += daysOfTheWeek[date.getDay()] + ", " + monthsOfYear[date.getMonth()] + ", " + date.getDate() + ", " + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    return currentDate;
}

function updateTime() {
    document.getElementById("time").innerHTML = getCurrentDate();
}

//https://www.shecodes.io/athena/127613-how-to-update-time-in-milliseconds-in-real-time-and-in-utc-using-javascript#:~:text=You%20can%20use%20the%20setInterval,the%20toUTCString()%20method%20respectively.
setInterval(updateTime, 1000);

// check form 