var url = "http://100.26.92.104:3000/";
// var url = "http://localhost:3000/";
var sessionInfo = {};

//reuse from common with adjustment with ../html/myprofile.html
function checkUserLoggedIn() {
    $.ajax({
        url: url + "checkUserLoggedIn",
        type: "POST",
        crossDomain: true,
        success: function (response) {
            if (response.status == "failure") {
                alert("Log in first");
                window.location.href = "adminLogin.html";
            } else {
                sessionInfo = response.data.data;
                getUnapprovedEvents();
            }
        },
        error: function () { },
    });
}

$("#userlogin").on("click", function () {
    let email = $("#validationCustom01").val();
    if (!validateEmail(email)) {
        $("#validationCustom01").css('border', '1px solid red');
        return;
    } else {
        $("#validationCustom01").css('border', '');
    }
    let password = $("#validationCustom02").val();
    if (password.length == 0) {
        $("#validationCustom02").css('border', '1px solid red');
        return;
    } else {
        $("#validationCustom02").css('border', '');
    }

    $.ajax({
        url: url + "loginAPI",
        type: "POST",
        crossDomain: true,
        data: {
            email: email,
            password: password
        },
        success: function (response) {
            if (response.status == "success") {
                //console.log("testing");
                window.location.href = "../html/adminEvents.html";
            } else {
                alert(response.message);
            }
        },
        error: function () {
            alert("Something went wrong. Please try again!!!");
        }

    });
});

if(window.location.pathname == "/html/adminEvents.html") {
    checkUserLoggedIn();
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

function getUnapprovedEvents() {
    $.ajax({
        url: url + "getEventsDataAdmin",
        type: "POST",
        crossDomain: true,
        data: {
            id: sessionInfo.user_id,
            showevents: 0
        },
        success: function (response) {
            var html = '';

            if (response.status === "success") {
                var data = response.data;
                if (data.length > 0) {
                    for (var id in data) { 
                        html += '<div class="row"><div class="event-card"> <a href="#" class="eventBoxDel  list-group-item list-group-item-action flex-column align-items-start">    <div class="d-flex w-100 justify-content-between">        <h5 class="mb-1">' + data[id].title + '</h5>    </div>    <div class="row">        <div class="col-lg-6">' + data[id].address + ' ' + data[id].zipcode + '</div>    </div>    <div class="row">        <div class="col-lg-6">From: ' + formatDate(data[id].from_date) + '</div>        <div class="col-lg-6">To: ' + formatDate(data[id].to_date) + '</div>    </div>    <div class="row">        <div class="col-lg-6">Starting at: ' + data[id].start_time + '</div>        <div class="col-lg-6">Ending at: ' + data[id].end_time + '</div>    </div>    <div class="row">        <div class="col-lg-12">Description: ' + data[id].description + '</div>    </div>    <div class="row">        <div class="col-lg-6 event-organizer" style="text-align: start;">            <div class="col-lg-12">                &nbsp;            </div>            <div class="col-lg-12">                <button type="button" class="btn btn-danger deleteCurrentEvent" eveid = '+data[id].event_id+'>                    Delete Event                </button>            </div></div> <div class="col-lg-6 event-organizer" style="text-align: end;"><small>Event                creator</small> <img class="event-creator-image"                src="../images/user_picture/' + data[id].user_id + '.jpeg">        </div>    </div> </a></div></div>'; 
                    }
                } else {
                    html = '<div class="row"><div class="event-card"><a href="#" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">No Events found</h5></div></a></div></div>';
                }
            } else {
                html = '<div class="row"><div class="event-card"><a href="#" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">No Events found</h5></div></a></div></div>';
            }
            $(".viewingAllEventsUser").html(html);
        },
        error: function () {
            alert("Please try again!!!")
        },
    });
}

$("#approveButton").on("click", function () {
    var obj = $(this);
    event_id = obj.attr("eveid");
    $.ajax({
        url: url + "eventProfileForAdmin",
        type: "POST",
        crossDomain: true,
        data: {
            event_id: event_id
        },
        success: function (response) {
            if (response.status === "success") {
                alert("Event Approved!!!");
                obj.remove();
            } else {
                alert(response.message);
            }
        },
    });
});


