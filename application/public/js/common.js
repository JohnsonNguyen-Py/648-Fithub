

//VIDHI - CHECK USER SESSION
function checkUserLoggedIn() {
    $.ajax({
        url: "http://100.26.92.104:3000/checkUserLoggedIn",
        type: "POST",
        crossDomain: true,
        success: function (response) {
            if (response.status == "success") {
                $("#header").load("html/headerlogin.html");
            } else {
                $("#header").load("html/header.html");
            }
            $("#footer").load("html/footer.html");
        },
        error: function () {
            $("#header").load("html/header.html");
            $("#footer").load("html/footer.html");
        }
    });
}

//Vidhi- LOGIN API
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
        url: "http://100.26.92.104:3000/loginAPI",
        type: "POST",
        crossDomain: true,
        data: {
            email: email,
            password: password
        },
        success: function (response) {
            if (response.status == "success") {
                window.location.href = 'html/myProfile.html';
            } else {
                alert(response.message);
            }
        },
        error: function () {
            alert("Something went wrong. Please try again!!!");
        }

    });
});

//VIDHI - CONTACT US PAGE
$("#submitQuery").on("click", function () {
    let name = $("#contactName").val();
    if (name.length == 0) {
        $("#contactName").css('border', '1px solid red');
        return;
    } else {
        $("#contactName").css('border', '');
    }
    let email = $("#contactEmail").val();
    if (!validateEmail(email)) {
        $("#contactEmail").css('border', '1px solid red');
        return;
    } else {
        $("#contactEmail").css('border', '');
    }
    let text = $("#contacttext").val();
    if (text.length < 10) {
        $("#contacttext").css('border', '1px solid red');
        return;
    } else {
        $("#contacttext").css('border', '');
    }

    $.ajax({
        url: "http://100.26.92.104:3000/saveContactUs",
        type: "POST",
        crossDomain: true,
        data: {
            name: name,
            email: email,
            query: text
        },
        success: function (response) {
            if (response.status == "success") {
                alert("Thank you for query/feedback!!!");
                $("#contactName").val('');
                $("#contactEmail").val('');
                $("#contacttext").val('');
            } else {
                alert("Something went wrong. Please try again!!!");
            }
        },
        error: function () {
            alert("Something went wrong. Please try again!!!");
        }

    });

});

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// checkUserLoggedIn();

$("#searchbarbt").on("click", function () {
    let text = $("#searchbar").val();
    let html = "";
    if (text.length == 0) {
        $("#searchbar").css('border', '1px solid red');
        return;
    } else {
        $("#searchbar").css('border', '');
    }
    $.ajax({
        url: "http://100.26.92.104:3000/getEvents",
        type: "POST",
        crossDomain: true,
        data: {
            keyword: text
        },
        success: function (response) {
            if (response.status == "success") {
                if (response.data.length > 0) {
                    let data = response.data;
                    $.each(data, function (key, value) {
                        console.log(value);
                        html += '<li role="presentation"><a role="menuitem" tabindex="-1" href="">' + value.title + '</a></li>';
                    });
                } else {
                    html += '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">No result found</a></li>';
                }
                $("#displist").html(html);
                $("#displist").css("display", "block");
            } else {
                alert("Something went wrong. Please try again!!!");
            }
        },
        error: function () {
            alert("Something went wrong. Please try again!!!");
        }
    });
})

$("#resetPassword").on("click", function () {
    let email = $("#email_idreset").val();
    console.log(email);
    if (!validateEmail(email)) {
        $("#email_idreset").css('border', '1px solid red');
        return;
    } else {
        $("#email_idreset").css('border', '');
    }
    alert("Reset password link has been sent to your registered email");
    window.location.href="../index.html";
});

$(document).bind('click', function (e) {
    var par = $(e.target).parent();
    if (!$('#displist').is(e.target)) {
        $('#displist').css("display", "none");
    };
});
