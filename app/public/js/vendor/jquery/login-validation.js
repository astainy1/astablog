$(function () {
  $("form[name ='login']").validate({
    // Validate on key press action
    onkeyup: function (element) {
      const validator = this;
      setTimeout(function () {
        validator.element(element);
      }, 300);
    },

    // Set validation rules
    rules: {
      email: {
        require: true,
        email: true,
      },

      password: {
        require: true,
      },
    },
    // Validation error messages
    messages: {
      password: {
        require: "This field is required",
      },
      email: "Enter a valid email",
    },

    // Submit the form to the destination endpoint upon successful
    // Validation of input fields.
    submitHandler: function (form) {
      form.submit();
    },
  });
});
