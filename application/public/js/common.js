// contact us on home page

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