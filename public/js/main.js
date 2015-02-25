/*jslint unparam:true*/
/*global debug:true*/
require(['jquery', 'vendor/jquery.validate.min', 'vendor/bootstrap', 'vendor/jquery.tagcloud.min'], function ($) {
  'use strict';

  $(document).ready(function () {

    jQuery.validator.addMethod("lettersonly", function (value, element) {
      return this.optional(element) || /^[a-z0-9_\-]+$/i.test(value);
    }, "Please use only a-z0-9_-");

    jQuery.validator.addMethod("tag", function (value, element) {
      return this.optional(element) || /^[a-zA-Z0-9_\-]+$/i.test(value);
    }, "Please use only a-zA-Z0-9_- ");

    jQuery.validator.addMethod("validName", function (value, element) {
      return this.optional(element) || /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'\-]+$/i.test(value);
    }, "String contains not supported characters");

    $('#form-signin').validate({
      rules: {
        username: {
          minlength: 3,
          maxlength: 15,
          required: true,
          lettersonly: true
        },
        password: {
          minlength: 3,
          maxlength: 15,
          required: true,
          lettersonly: true
        }
      },
      highlight: function (element) {
        $(element).closest('.control-group').addClass('has-error');
      },
      unhighlight: function (element) {
        $(element).closest('.control-group').removeClass('has-error');
      }
    });

    $('#form-add').validate({
      rules: {
        tag1: {
          minlength: 3,
          maxlength: 15,
          required: true
        },
        tag2: {
          minlength: 3,
          maxlength: 15
        },
        tag3: {
          minlength: 3,
          maxlength: 15
        }
      },
      highlight: function (element) {
        $(element).closest('.control-group').addClass('has-error');
      },
      unhighlight: function (element) {
        $(element).closest('.control-group').removeClass('has-error');
      }
    });

    $('body#register form').submit(function (e) {
      e.preventDefault();

      var inputs = $('input[value=""]');
      $.each(inputs, function (i, v) {
        if ($(v).val() === '') {
          $(v).attr('disabled', true);
        }
      });

      //$('input[value=""]').attr('name', null);
      e.target.submit();
    });

    $("body#register form").validate({
      rules: {
        firstName: {
          minlength: 3,
          maxlength: 36,
          required: true,
          validName: true
        },
        lastName: {
          minlength: 3,
          maxlength: 36,
          required: false,
          validName: true
        },
        tag1: {
          minlength: 3,
          maxlength: 36,
          required: true,
          tag: true
        },
        tag2: {
          minlength: 3,
          maxlength: 36,
          required: true,
          tag: true
        },
        tag3: {
          required: true,
          maxlength: 36,
          tag: true
        },
        preferredCamp: {
          required: false
        },
        shirtSize: {
          required: false
        },
        note: {
          required: false
          maxlength: 768,
        },
        children: {
          required: false
        },
        newcomer: {
          required: false
        },
        email: {
          required: true,
          email: true,
          remote: "/check_email"
        },
	session_title: {
	  maxlength: 256
	},
	session_desc: {
	  maxlength: 768
        },
	twitter: {
	  maxlength: 256
	},
	facebook: {
	  maxlength: 256
	},
	google_plus: {
	  maxlength: 256
	},
	website: {
	  url: true
	}
      },
      messages: {
        firstName: "Bitte gib deinen Vornamen an (min. 3 Zeichen)",
        tag1: "Bitte gib alle drei Tags an (min. 3 Zeichen)",
        tag2: "Bitte gib alle drei Tags an (min. 3 Zeichen)",
        tag3: "Bitte gib alle drei Tags an (min. 3 Zeichen)",
        accept: "Du musst die BarCamp Graz Charta akzeptieren um teilnehmen zu können",
        email: {
          required: "Bitte gib deine E-Mail Adresse an",
          email: "Deine E-Mail Adresse muss in folgenden Format sein: name@domain.com",
          remote: "Diese E-Mail Adresse wurde bereits verwendet"
        },
      },
    });

    // Only enable Submit button if required fields are filled out
    $('input').on('blur', function() {
      if ($("#register-form").valid()) {
        $('input[type="submit"]').removeAttr('disabled');
      } else {
        $('input[type="submit"]').attr('disabled','disabled');
      }
    });

    $('input:checkbox').change(function() {
      if ($("#register-form").valid()) {
        $('input[type="submit"]').removeAttr('disabled');
      } else {
        $('input[type="submit"]').attr('disabled','disabled');
      }
    });

    // TODO Still breaks JQuery
    $("#tagcloud").width($(window).width() - 100);
    $("#tagcloud").tagcloud({
      height: $(window).height() - 100,
      sizemax: 100,
      type: 'sphere'
    });

  });
});
/*jslint unparam: false*/
