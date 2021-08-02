$("#searchbar").on("keyup", function () {
    let text = $("#searchbar").val();
    let html = "";
    if (text.length == 0) {
        $("#searchbar").css('border', '1px solid red');
        return;
    } else {
        $("#searchbar").css('border', '');
    }
    $.ajax({
        url: url + "getEvents",
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
                        html += '<li role="presentation"><a role="menuitem" tabindex="-1" target="_blank" href="../eventProfileForAll?id='+value.event_id+'">' + value.title + '</a></li>';
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