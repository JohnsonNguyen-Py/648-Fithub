

var sessionInfo = {};

function checkUserLoggedIn() {
    $.ajax({
        url: url + "checkUserLoggedIn",
        type: "POST",
        crossDomain: true,
        success: function (response) {
            if(response.status == "failure") {
                alert('Log in first');
                window.location.href = '../index.html';
            } else {
                sessionInfo = response.data.data;
                $("#accessUserInfo").attr('data-userid', sessionInfo.reg_id);
                console.log(sessionInfo);
            }
        },
        error: function () {
        }
    });
}

checkUserLoggedIn();

$("#changePassword").on("click", function () {
    $('#modal3').modal('hide');
});

$("#editProfile").on("click", function () {
    $('#modal4').modal('hide');
});

$("#delaccount").on("click", function () {
    $('#modaldel').modal('hide');
});