$(function () {
 
/********* Validation for Registration Starts *********/

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
      username: "required",
      registercheckbox: "required",
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 8,
        strongPassword: true,
      },
    },

    // Specify validation error messages
    messages: {

      username: "This field is required.",
      registercheckbox: "Agree to terms.",
      
      password: {
        required: "This field is required.",
        minlength: "Password must be at least 8 characters long.",
        strongPassword: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      },

      email: {
        required: "This field is required.",
        email: "Enter a valid email."
      },

    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function (form) {
      form.submit();
    },
  });


/********* Validation for Registration Ends *********/


  /********** Validation for Login Starts **********/

  $("form[name ='login']").validate({
    // Validate on key press action
   
    onkeyup: function(element) {
      let validator = this;
      setTimeout(function() {
        validator.element(element);
      }, 300); // Debounce input validation
    },

    // Set validation rules 
    rules: {
      email: {
        required: true,
        email: true,
      },

      password: {
        required: true,
      },
    },
    // Validation error messages
    messages: {
      password: {
        require: "This field is required.",
      },
      email: {
        required: "This field is required.",
        email: "Enter a valid email.",
      } 
    },

    // Submit the form to the destination endpoint upon successful
    // Validation of input fields.
    submitHandler: function (form) {
      form.submit();
    },
  });

/********** Validation for Login Ends **********/

/******** Validation for  Recover Password Start  **********/ 

  $("form[name ='recoverPassword']").validate({
    // Validate on key press action
   
    onkeyup: function(element) {
      var validator = this;
      setTimeout(function() {
        validator.element(element);
      }, 300); // Debounce input validation
    },

    // Set validation rules
    rules: {
      email: {
        required: true,
        email: true,
      },
    },
    // Validation error messages
    messages: {
      email: {
        required: "This field is required.",
        email: "Enter a valid email.",
      } 
    },

    // Submit the form to the destination endpoint upon successful
    // Validation of input fields.
    submitHandler: function (form) {
      form.submit();
    },
  });


/******** Validation for  Recover Password Ends  **********/ 

/******* Validation for Reset password Starts *********/ 

$("form[name='resetPassword']").validate({
  // Validate on key press action with debounce
  onkeyup: function(element) {
    var validator = this;
    setTimeout(function() {
      validator.element(element);
    }, 300); // Debounce input validation
  },

  // Set validation rules
  rules: {
    password: {
      required: true,
      minlength: 8,
      strongPassword: true, // Custom method for stronger passwords declared below
    },
    confirm_password: {
      required: true,
      minlength: 8,
      equalTo: "#reset-password", // Match the first password field
    },
  },

  // Validation error messages
  messages: {
    password: {
      required: "This field is required.",
      minlength: "Password must be at least 8 characters long.",
      strongPassword: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
    confirm_password: {
      required: "This field is required.",
      minlength: "Password must be at least 8 characters long.",
      equalTo: "Please enter the same password as above.",
    },
  },

  // Handle form submission after successful validation
  submitHandler: function(validatedForm) {
    $("form[name='resetPassword']").find(":submit").prop("disabled", true); // Disable submit button
    validatedForm.submit();
  },

  /******* Validation for Reset password Ends *********/

});

// Custom method for strong password validation
$.validator.addMethod("strongPassword", function(value, element) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
}, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");

});
