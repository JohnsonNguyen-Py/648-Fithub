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
            if (response.status == "failure") {
                alert('Log in first');
                window.location.href = '../index.html';
            } else {
                sessionInfo = response.data.data;
                $("#avatarimguser").attr("src", "../images/user_picture/" + sessionInfo.user_id + ".jpeg");
                if (window.location.pathname == "/html/events.html") {
                    getEvents();
                } else if(window.location.pathname == "/html/myEvents.html") {
                    getMyEvents();
                } else {
                    const urlParams = new URLSearchParams(window.location.search);
                    var eveid = urlParams.get('eventId');
                    if (eveid > 0) {
                        getEventsUserInfo(eveid);
                    }
                }
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

function getEvents() {
    var zip_code;
    if ($("#filterzipcode").val().length == 5) {
        zip_code = $("#filterzipcode").val();
    }
    $.ajax({
        url: url + "getEventsData",
        type: "POST",
        crossDomain: true,
        data: {
            id: sessionInfo.user_id,
            zip_code: zip_code,
            showevents: 1
        },
        success: function (response) {
            var html = '';
            if (response.status === "success") {
                var data = response.data;
                if (data.length > 0) {
                    for (var id in data) { html += '   <div class="event-card"><a href="EventProfile.html?eventId=' + data[id].event_id + '" class="list-group-item list-group-item-action flex-column align-items-start"> <div class="d-flex w-100 justify-content-between"><h5 class="mb-1">' + data[id].title + '</h5></div><div class="row"><div class="col-lg-6">' + data[id].address + ' ' + data[id].zipcode + '</div></div><div class="row"> <div class="col-lg-6">From: ' + formatDate(data[id].from_date) + '</div><div class="col-lg-6">To: ' + formatDate(data[id].to_date) + '</div> </div><div class="row"> <div class="col-lg-6">Starting at: ' + data[id].start_time + '</div><div class="col-lg-6">Ending at: ' + data[id].end_time + '</div></div><div class="event-organizer" style="text-align: end;"><small>Event creator</small> <img class="event-creator-image" src="../images/user_picture/' + data[id].user_id + '.jpeg"></div><!-- <img class="event-image" src="../images/circle-cropped.png"> --></a></div>'; }
                } else {
                    html = '<div class="event-card"><a href="#" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">No Events found</h5></div></a></div>';
                }

                console.log(response);
            } else {
                html = '<div class="event-card"><a href="#" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">No Events found</h5></div></a></div>';
            }
            $(".viewingAllEventsUser").html(html);
        },
        error: function () {
            alert("Please try again!!!")
        },
    });
}

function getMyEvents() {
    $.ajax({
        url: url + "getEventsData",
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
                        html += '<div class="event-card"> <a href="#" class="eventBoxDel  list-group-item list-group-item-action flex-column align-items-start">    <div class="d-flex w-100 justify-content-between">        <h5 class="mb-1">' + data[id].title + '</h5>    </div>    <div class="row">        <div class="col-lg-6">' + data[id].address + ' ' + data[id].zipcode + '</div>    </div>    <div class="row">        <div class="col-lg-6">From: ' + formatDate(data[id].from_date) + '</div>        <div class="col-lg-6">To: ' + formatDate(data[id].to_date) + '</div>    </div>    <div class="row">        <div class="col-lg-6">Starting at: ' + data[id].start_time + '</div>        <div class="col-lg-6">Ending at: ' + data[id].end_time + '</div>    </div>    <div class="row">        <div class="col-lg-12">Description: ' + data[id].description + '</div>    </div>    <div class="row">        <div class="col-lg-6 event-organizer" style="text-align: start;">            <div class="col-lg-12">                &nbsp;            </div>            <div class="col-lg-12">                <button type="button" class="btn btn-danger deleteCurrentEvent" eveid = '+data[id].event_id+'>                    Delete Event                </button>            </div></div> <div class="col-lg-6 event-organizer" style="text-align: end;"><small>Event                creator</small> <img class="event-creator-image"                src="../images/user_picture/' + data[id].user_id + '.jpeg">        </div>    </div> </a></div>'; 
                    }
                } else {
                    html = '<div class="event-card"><a href="#" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">No Events found</h5></div></a></div>';
                }
            } else {
                html = '<div class="event-card"><a href="#" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">No Events found</h5></div></a></div>';
            }
            $(".viewingAllEventsUser").html(html);
        },
        error: function () {
            alert("Please try again!!!")
        },
    });
}

function getEventsUserInfo(event_id) {
    $.ajax({
        url: url + "getEventsUserInfo",
        type: "POST",
        crossDomain: true,
        data: {
            user_id: sessionInfo.user_id,
            event_id: event_id
        },
        success: function (response) {
            var html = '';
            if (response.status === "success") {
                var data = response.data;
                console.log(data);
                if (data.eventInfo) {
                    html = '<table class="table table-bordered"><tr><th width="30%">Event</th>  <td width="2%">:</td><td>' + data.eventInfo.title + '</td></tr><tr>  <th width="30%">Location</th>  <td width="2%">:</td>  <td>' + data.eventInfo.address + ' ' + data.eventInfo.zipcode + '</td></tr><tr>  <th width="30%">Start Date</th>  <td width="2%">:</td>  <td>' + formatDate(data.eventInfo.from_date) + '</td></tr><tr>  <th width="30%">End Date</th>  <td width="2%">:</td>  <td>' + formatDate(data.eventInfo.to_date) + '</td></tr><tr>  <th width="30%">Start Time</th>  <td width="2%">:</td>  <td>' + data.eventInfo.start_time + '</td></tr><tr>  <th width="30%">End Time</th>  <td width="2%">:</td>  <td>' + data.eventInfo.end_time + '</td></tr><tr>  <th width="30%">Description</th>  <td width="2%">:</td>  <td>' + data.eventInfo.description + '</td></tr></table>';
                    if (data.userInfo) {
                        if (data.userInfo.is_joined == 0) {
                            html += '<div class="row event-buttons"><div class="col-lg-4">  <button class="btn btn-lg download-button" id="join-button" type="button" acttype="upd" userid=' + sessionInfo.user_id + ' eventid = ' + event_id + '>Rejoin</button> </br></div></div>';
                        } else {
                            html += '<div class="row event-buttons"><div class="col-lg-4">  <button class="btn btn-lg download-button" id="leave-button" type="button" acttype="upd" userid=' + sessionInfo.user_id + ' eventid = ' + event_id + '>Leave</button> </br></div></div>';
                        }
                    } else {
                        html += '<div class="row event-buttons"><div class="col-lg-4">  <button class="btn btn-lg download-button" id="join-button" type="button" acttype="ins" userid=' + sessionInfo.user_id + ' eventid = ' + event_id + '>Join</button> </br></div></div>';
                    }
                } else {
                    html = '<div class="event-card"><a href="#" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">No Event found</h5></div></a></div>';
                }
            } else {
                html = '<div class="event-card"><a href="#" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">No Event found</h5></div></a></div>';
            }
            $("#viewEventProfile").html(html);
        },
        error: function () {
            alert("Please try again!!!")
        },
    });
}

$("#searchzipevent").on("click", function () {
    $('#modal6').modal('hide');
});

$(document).on("click", ".deleteCurrentEvent", function () { 
    if (confirm("Sure DELETE event?") === true) {
        var obj  = $(this);
        var tabid = obj.attr("eveid");
        $.ajax({
            url: url + "deleteEvent",
            type: "POST",
            crossDomain: true,
            data: {
                user_id: sessionInfo.user_id,
                eveid: tabid
            },
            success: function (response) {
                if (response.status == "success") {
                    alert("Event Deleted!!");
                    obj.closest(".eventBoxDel").remove();
                } else {
                    alert(response.message);
                }
            },
            error: function () {
                alert("Error deleting event!!");
            }
    
        });
      }
});

$(document).on("click", "#filterSearch", function () {
    getEvents();
});

//EDUARDO - still working on it
$(document).on("click", "#join-button", function (e) {
    $.ajax({
        url: url + "joinDisjoinEvent",
        type: "POST",
        crossDomain: true,
        data: {
            user_id: $("#join-button").attr('userid'),
            event_id: $("#join-button").attr('eventid'),
            acttye: $("#join-button").attr('acttype'),
            is_joined: 1
        },
        success: function (response) {
            if (response.status == "success") {
                alert("Event Joined!!");
                $("#join-button").remove();
                window.location.reload();
            } else {
                alert("Could not joined!");
            }
        },
        error: function () {
            alert("Could not joined!");
        }

    });
});

$(document).on("click", "#leave-button", function (e) {
    $.ajax({
        url: url + "joinDisjoinEvent",
        type: "POST",
        crossDomain: true,
        data: {
            user_id: $("#leave-button").attr('userid'),
            event_id: $("#leave-button").attr('eventid'),
            acttye: $("#leave-button").attr('acttype'),
            is_joined: 0
        },
        success: function (response) {
            if (response.status == "success") {
                alert("Event Exited!!");
                $("#leave-button").remove();
                window.location.reload();
            } else {
                alert("Could not exit!");
            }
        },
        error: function () {
            alert("Could not exit!");
        }

    });
});

// $("#leave-button").on("click", function (){
//     alert("Left!");
// });