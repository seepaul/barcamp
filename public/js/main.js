/*jslint unparam:true*/
/*global debug:true*/
require(['jquery', 'vendor/jquery.validate.min', 'vendor/bootstrap', 'vendor/jquery.tagcloud.min'], function ($) {
  'use strict';

  $(document).ready(function () {

    jQuery.validator.addMethod("lettersonly", function (value, element) {
      return this.optional(element) || /^[a-z0-9_\-]+$/i.test(value);
    }, "Please use only a-z0-9_-");

    jQuery.validator.addMethod("tag", function (value, element) {
      return this.optional(element) || /^[a-zA-Z0-9_\- ]+$/i.test(value);
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

    $("#tagcloud").width($(window).width() - 100);
    $("#tagcloud").tagcloud({
      height: $(window).height() - 100,
      sizemax: 100,
      type: 'sphere'
    });

    $("body#register form").validate({
      rules: {
        firstName: {
          minlength: 2,
          maxlength: 36,
          required: true,
          validName: true
        },
        lastName: {
          minlength: 2,
          maxlength: 36,
          required: true,
          validName: true
        },
        email: {
          email: true,
          required: true
        },
        tag1: {
          required: true,
          tag: true
        },
        tag2: {
          required: true,
          tag: true
        },
        tag3: {
          required: true,
          tag: true
        }
      }
    });

  });
});
/*jslint unparam: false*/
