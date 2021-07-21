//VIDHI - Event us PAGE
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
        url: "http://100.26.92.104:3000/saveEvent",
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
                alert("Event created");
                window.location.href = "/events.html"
            } else {
                alert("Something went wrong. Please try again!!!");
            }
        },
        error: function () {
            alert("Something went wrong. Please try again!!!");
        }

    });

});