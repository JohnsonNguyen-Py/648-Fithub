var url = "http://100.26.92.104:3000/";
// var url = "http://localhost:3000/";
var sessionInfo = {};

//reuse from common with adjustment with ../html/myprofile.html
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
                window.location.href = "../html/myProfile.html";
            } else {
                alert(response.message);
            }
        },
        error: function () {
            alert("Something went wrong. Please try again!!!");
        }

    });



});

checkUserLoggedIn();

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};


$("#approveButton").on("click", function () {
    $.ajax({
        url: url + "eventProfileForAdmin",
        type: "POST",
        crossDomain: true,
        data: {
            id: sessionInfo.user_id,
            showevents: 0
        },
        success: function (response) {
            if (response.status === "success") {
                alert(response.message);
                console.log("testing here");
            }
        },
    });
});

