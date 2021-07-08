
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
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

$.ajax(
  {
    type: "POST",
    url: "http://100.26.92.104:3000/registerUser",

    phone: req.body.phone,
    address: req.body.address,
    zip_code: req.body.zip_code,
    activity_type: req.body.activity_type,
    email_id: req.body.email_id,
    password: req.body.password,

  })
