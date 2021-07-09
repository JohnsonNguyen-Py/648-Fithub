
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict';
  window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          event.preventDefault();
          event.stopPropagation();
          registerUser();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

function registerUser() {
  let activity_type = "";
  $("#activities button").each(function (index) {
    if ($(this).hasClass("active") === true) {
      activity_type += "," + $(this).data('info');
    }
  });

  if (activity_type == "") {
    $("#actfeedback").css("display","block");
    return;
  } else {
    $("#actfeedback").css("display","none");
  }
  activity_type = activity_type.replace(/^,/, '');
  // console.log(activity_type);
  $.ajax(
    {
      url: "http://100.26.92.104:3000/registerUser",
      type: "POST",
      crossDomain: true,
      data: {
        phone: $("#phone").val(),
        zip_code: $("#zip_code").val(),
        activity_type: activity_type,
        address: $("#address").val(),
        email_id: $("#email_id").val(),
        password: $("#password").val()
      },
      success: function (response) {
        if(response.status == "success") {
          alert(response.message);
          window.location.href = 'http://100.26.92.104/';
        } else {
          alert("failure");
          console.log(response)
        }

      },
      error: function () {
        alert("Error!");
      }

    });
}

