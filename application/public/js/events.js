//VIDHI - Event us PAGE
var url = "http://localhost:3000/";
// var url = "http://100.26.92.104:3000/";
var sessionInfo = {};

function checkUserLoggedIn() {
    $.ajax({
        url: url + "checkUserLoggedIn",
        type: "POST",
        crossDomain: true,
        success: function (response) {
            console.log(response);
            if (response.status == "failure") {
                alert('Log in first');
                window.location.href = '../index.html';
            } else {
                sessionInfo = response.data.data;
                $("#avatarimguser").attr("src", "../images/user_picture/" + sessionInfo.user_id + ".jpeg");
                getEvents();
            }
        },
        error: function () {
        }
    });
}

checkUserLoggedIn();

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function getEvents() {
    $.ajax({
        url: url + "getEventsData",
        type: "POST",
        crossDomain: true,
        data: {
            id: sessionInfo.user_id,
        },
        success: function (response) {
            if (response.status === "success") {
                var html = '';
                var data = response.data;
                for (var id in data) {
                    html += '<div class="event-card"><a href="eventProfile.html?id='+data[id].event_id+'" class="list-group-item list-group-item-action flex-column align-items-start"> <div class="d-flex w-100 justify-content-between"><h5 class="mb-1">'+data[id].title+'</h5></div><div class="row"><div class="col-lg-6">'+data[id].address+' ' +data[id].zipcode +'</div></div><div class="row"> <div class="col-lg-6">From: '+formatDate(data[id].from_date)+'</div><div class="col-lg-6">To: '+formatDate(data[id].to_date)+'</div> </div><div class="row"> <div class="col-lg-6">Starting at: '+data[id].start_time+'</div><div class="col-lg-6">Ending at: '+data[id].end_time+'</div></div><div class="event-organizer" style="text-align: end;"><small>Event creator</small> <img class="event-creator-image" src="../images/user_picture/'+data[id].user_id+'.jpeg"></div><!-- <img class="event-image" src="../images/circle-cropped.png"> --></a></div>';
                }
                $(".viewingAllEventsUser").html(html);
                console.log(response);
            } else {
                alert("No events found")
            }
        },
        error: function () { 
            alert("Please try again!!!")
        },
    });
}

$("#saveEvent").on("click", function () {
    let title = $("#title").val();
    if (title.length == 0) {
        $("#title").css('border', '1px solid red');
        return;
    } else {
        $("#title").css('border', '');
    }
    let description = $("#eventdescription").val();
    if (description.length == 0) {
        $("#eventdescription").css('border', '1px solid red');
        return;
    } else {
        $("#eventdescription").css('border', '');
    }
    let address = $("#address").val();
    if (address.length == 0) {
        $("#address").css('border', '1px solid red');
        return;
    } else {
        $("#address").css('border', '');
    }
    let zipcode = $("#zipcode").val();
    if (zipcode.length == 0) {
        $("#zipcode").css('border', '1px solid red');
        return;
    } else {
        $("#zipcode").css('border', '');
    }
    let date = $("#date").val();
    if (date.length == 0) {
        $("#date").css('border', '1px solid red');
        return;
    } else {
        $("#date").css('border', '');
    }
    let startTime = $("#startTime").val();
    if (startTime.length == 0) {
        $("#startTime").css('border', '1px solid red');
        return;
    } else {
        $("#startTime").css('border', '');
    }
    let endTime = $("#endTime").val();
    if (endTime.length == 0) {
        $("#endTime").css('border', '1px solid red');
        return;
    } else {
        $("#endTime").css('border', '');
    }

    $.ajax({
        url: url + "saveEvent",
        type: "POST",
        crossDomain: true,
        data: {
            user_id: sessionInfo.user_id,
            title: title,
            description: description,
            address: address,
            zipcode: zipcode,
            date: date,
            startTime: startTime,
            endTime: endTime
        },
        success: function (response) {
            if (response.status == "success") {
                alert("Waiting for Admin's approval");
                window.location.href = "events.html"
            } else {
                alert("Something went wrong. Please try again!!!");
            }
        },
        error: function () {
            alert("Something went wrong. Please try again!!!");
        }

    });

});

$("#searchzipevent").on("click", function () {
    $('#modal6').modal('hide');
});

$("#searchdisevent").on("click", function () {
    $('#modal7').modal('hide');
});

$("#searchageevent").on("click", function () {
    $('#modal9').modal('hide');
});

$("#searchpassionevents").on("click", function () {
    $('#modal10').modal('hide');
});

//EDUARDO - still working on it

// $("#join-button").on("click", function (){

//     let is_joined = 0;//false
//     let date_joined = new Date();
//     let button_join = $("#join-button");

//     let sql = "SELECT * 'events' WHERE is_active = 1 ";

//     //will check if it's true 
//     if(sql){
//         let date_joined = new Date();
//         button_join.style.display = "none";
//         alert("hide button");

//     } else{
//         let date_joined = new Date();
//         button_join.style.display = "block";
//     }

//     $.ajax({
//         url: "http://100.26.92.104:3000/joinEvent",
//         type: "POST",
//         crossDomain: true,
//         data: {
//             is_joined: is_joined,

//             date_joined: date_joined
//         },
//         success: function (response) {
//             if (response.status == "success") {
//                 alert("Joined");
//                 window.location.href = "events.html"
//             } else {
//                 alert("Could not joined!");
//             }
//         },
//         error: function () {
//             alert("Could not joined!");
//         }

//     });
// });

// $("#leave-button").on("click", function (){
//     alert("Left!");
// });