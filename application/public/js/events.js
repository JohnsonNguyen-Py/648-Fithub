//VIDHI - Event us PAGE
// var url = "http://localhost:3000/";
// var url = "http://100.26.92.104:3000/";
// var sessionInfo = {};

// function checkUserLoggedIn() {
//     $.ajax({
//         url: url + "checkUserLoggedIn",
//         type: "POST",
//         crossDomain: true,
//         success: function (response) {
//             console.log(response);
//             if(response.status == "failure") {
//                 alert('Log in first');
//                 window.location.href = '../index.html';
//             } else {
//                 sessionInfo = response.data.data;
//                 $("#accessUserInfo").attr('data-userid', sessionInfo.reg_id);
//                 console.log(sessionInfo);
//             }
//         },
//         error: function () {
//         }
//     });
// }

// checkUserLoggedIn();

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