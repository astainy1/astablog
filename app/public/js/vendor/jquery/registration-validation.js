// Wait for the DOM to be ready
$(function () {

  // Initialize data validation on the registration form.
  // It has the name attribute "registration"
  $("form[name='registration']").validate({

    onkeyup: function(element) {
        var validator = this;
        setTimeout(function() {
          validator.element(element);
        }, 300); // Debounce input validation
      },
    // Specify validation logic
    rules: {
      // The key name on the left side is the name attribute
      // of an input field. Validation logic are defined
      // on the right side
      username: "required",
      // checkbox:  "required",
      registercheckbox: "required",
      email: {
        required: true,
        // Specify that email should be validated
        // by the built-in "email" rule
        email: true,
      },
      password: {
        required: true,
        minlength: 5,
      },
    },
    // Specify validation error messages
    messages: {
      username: "This field is required!",
      registercheckbox: "Agree to terms.",
      password: {
        required: "This field is required!",
        minlength: "Password must be at least 5 characters long.",
      },
      email: "Enter a valid email.",
      // checkbox: 'You must agree to this terms and conditions.'
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function (form) {
      form.submit();
    },
  });
});
