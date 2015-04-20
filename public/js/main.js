/*
 * BRS JS File
 *
 * Written by Paul Rudolf Seebacher, Jörg Simon and Jürgen Brüder
 * 
 * Copyright © 2015 by the contributing authors
 *
 * This file is part of the BarCamp Registration System.
 * 
 * The BarCamp Registration System is free software: you can redistribute
 * it and/or modify it under the terms of the GNU Affero General Public
 * License as published by the Free Software Foundation, either version
 * 3 of the License, or (at your option) any later version.
 *
 * The BarCamp Registration System is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with the BarCamp Registration System.
 * If not, see <http://www.gnu.org/licenses/>.
 */

/*jslint unparam:true*/
/*global debug:true*/
require(['jquery', 'vendor/jquery.validate.min', 'vendor/bootstrap', 'vendor/jquery.tagcloud.min'], function ($) {
  'use strict';

  $(document).ready(function () {

    jQuery.validator.addMethod("lettersonly", function (value, element) {
      return this.optional(element) || /^[a-z0-9_\-]+$/i.test(value);
    }, "Please use only a-z0-9_-");

    jQuery.validator.addMethod("tag", function (value, element) {
      return this.optional(element) || /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð0-9_\-]+$/i.test(value);
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
          lettersonly: false
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
          minlength: 2,
          maxlength: 36,
          required: true,
          tag: true
        },
        tag2: {
          minlength: 2,
          maxlength: 36,
          required: true,
          tag: true
        },
        tag3: {
          minlength: 2,
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
          required: false,
          maxlength: 768
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
        cancel_email: {
          required: true,
          email: true
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
        },
        accept: {
          required: true
        },
        help: {
          required: true
        }
      },
      messages: {
        firstName: "Bitte gib deinen Vornamen an (min. 3 Zeichen, max. 36 Zeichen)",
        tag1: "Bitte gib alle drei Tags an (min. 3 Zeichen, max. 36 Zeichen)",
        tag2: "Bitte gib alle drei Tags an (min. 3 Zeichen, max. 36 Zeichen)",
        tag3: "Bitte gib alle drei Tags an (min. 3 Zeichen, max. 36 Zeichen)",
        accept: "Du musst die BarCamp Graz Charta akzeptieren um teilnehmen zu können",
        help: "Du musst das BarCamp Prinzip akzeptieren um teilnehmen zu können",
        email: {
          required: "Bitte gib deine E-Mail Adresse an",
          email: "Deine E-Mail Adresse muss in folgenden Format sein: name@domain.com",
          remote: "Diese E-Mail Adresse wurde bereits verwendet"
        },
        cancel_email: {
          required: "Bitte gib deine E-Mail Adresse an",
          email: "Deine E-Mail Adresse muss in folgenden Format sein: name@domain.com"
        }
      }
    });

    // Only enable Submit button if required fields are filled out
    $('input').on('keyup', function () {
      if ($("form").valid()) {
        $('input[type="submit"]').removeAttr('disabled');
      } else {
        $('input[type="submit"]').attr('disabled', 'disabled');
      }
    });

    $('input').change(function () {
      if ($("form").valid()) {
        $('input[type="submit"]').removeAttr('disabled');
      } else {
        $('input[type="submit"]').attr('disabled', 'disabled');
      }
    });

    // TODO Still breaks JQuery
    $("#tagcloud").width($(window).width() - 100);

    $("#tagcloud").tagcloud({
      height: $(window).height() - 100,
      sizemax: 35,
      sizemin: 15,
      type: 'sphere',
      colormax: "00f",
      colormin: "8fa6ca",
      power: 0.35
    });

    $("#reminder-form").validate({
      rules: {
        text: {
          required: true
        },
        links: {
          required: false
        }
      }
    });

  });
});
/*jslint unparam: false*/
