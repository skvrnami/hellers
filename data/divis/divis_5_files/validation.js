/*
 validation.js
 Javascript funkcionalita pro klientské validace

 @version
 ${project.version}

 @author
 tpinos@csob.cz Tomas Pinos (JD71691)
 */

window.Npw = window.Npw || {};

(function (ns, $, undefined) {

    var warn = function (message) {
        console.warn("[Validations] " + message);
    };
    var error = function (message) {
        console.error("[Validations] " + message);
    };

    var Utils = ns.Utils;

    /**
     * Map of Java date time formats to JQuery Datepicker's date time formats
     */
    var javaToDatepickerFormat = {
        "dd.MM.yyyy": "d.m.yy",
        "dd.MM.": "d.m."
    };

    /**
     * Pattern to set letter to accept as "only letter string" with whitespaces.
     * Idea get from http://stackoverflow.com/questions/7258375/latin-charcters-included-in-javascript-regex
     * @type {RegExp}
     */
    var letterPattern = /^[a-zA-Z\sÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏàáâãäåæçèéêëìíîïÐÑÒÓÔÕÖØÙÚÛÜÝÞßðñòóôõöøùúûüýþÿěščřžůĚŠČŘŽŮďĎňŇťŤŕŔĺĹľĽ-]*$/i;

    var numeralPattern = /^[0-9]*$/;

    var letterNumeralPattern = /^[0-9a-zA-Z\sÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏàáâãäåæçèéêëìíîïÐÑÒÓÔÕÖØÙÚÛÜÝÞßðñòóôõöøùúûüýþÿěščřžůĚŠČŘŽŮďĎňŇťŤŕŔĺĹľĽ\-.,]*$/i;

    var letterNumeralNotLetterPattern = /^[\\/0-9a-zA-Z\sÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏàáâãäåæçèéêëìíîïÐÑÒÓÔÕÖØÙÚÛÜÝÞßðñòóôõöøùúûüýþÿěščřžůĚŠČŘŽŮďĎňŇťŤŕŔĺĹľĽ-]*$/i;

    var notSharpBracketsPattern = /^[^<>]*$/gm;

    ns.assertTrue = function (value, element, param) {
        var result = Boolean(value);
        return result;
    };

    ns.regexp = function (value, element, regexp) {
        var re = new RegExp(regexp);
        var result = (value === undefined || value === null || value === "" ) || re.test(value);
        return result;
    };

    ns.nowhitespaceslength = function (value, element, param) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        var length = $.isArray(value) ? value.length : value.replace(/ /g, '').length;
        return ( length >= param[0] && length <= param[1] );
    };

    ns.nowhitespacesmax = function (value, element, param) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        value = value.replace(/ /g, '');
        value = value.replace(/,/g, '.');
        value = Number(value);
        return value <= param;
    };

    ns.validyearsinterval = function (value, element, param) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        var format = $(element).data("format");
        if (!format) {
            warn("[validyearsinterval] No date format is specified for element " + element);
            return false;
        }
        try {
            // Parsování data se provede ještě datepickerem
            var date = $.datepicker.parseDate(format, value);
            // Pro validaci se ale použije knihovna moment.js a reprezentace data přes moment()
            var mmnt = moment(date);
            // Zjistí rozdíl mezi dvěma momenty v letech. Zaokrouhluje dolů.
            var yearsDiff = moment().diff(mmnt, "years");
            // Test whether date is at least "min" and less than "max" years before now.
            return yearsDiff >= param[0] && yearsDiff < param[1];
        }
        catch (err) {
            warn("[validyearsinterval] Error while parsing date: " + value);
            return false;
        }
    };

    ns.nofuturelocaldate = function (value, element) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        var format = $(element).data("format");
        if (!format) {
            warn("[nofuturelocaldate] No date format is specified for element " + element);
            return false;
        }
        try {
            var date = $.datepicker.parseDate(format, value);
            var today = new Date();
            // Trim time
            today.setHours(0, 0, 0, 0);
            // no future
            return date <= today;
        }
        catch (err) {
            warn("[nofuturelocaldate] Error while parsing date: " + value);
            return false;
        }
    };

    ns.nopastlocaldate = function (value, element) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        var format = $(element).data("format");
        if (!format) {
            warn("[nopastlocaldate] No date format is specified for element " + element);
            return false;
        }
        try {
            var date = $.datepicker.parseDate(format, value);
            var today = new Date();
            // Trim time
            today.setHours(0, 0, 0, 0);
            // no future
            return date >= today;
        }
        catch (err) {
            warn("[nopastlocaldate] Error while parsing date: " + value);
            return false;
        }
    };

    ns.datetimeformat = function (value, element, javaFormat) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        var datepickerFormat = javaToDatepickerFormat[javaFormat];
        if (!datepickerFormat) {
            warn("[datetimeformat] Couldn't map java datetime format '" + javaFormat + "' to datepicker datetime format => datetime cannot be validated");
            return true;
        }
        try {
            var date = $.datepicker.parseDate(datepickerFormat, value);
            // No exception occurred => value is a valid datetime
            return true;
        }
        catch (err) {
            // Exception occurred => value is NOT a valid datetime
            return false;
        }
    };

    ns.identificationNumber = function (value, element) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        var pattern = /^([0-9]{8})$/;
        if (!pattern.test(value)) {
            return false;
        }
        var sum = 0;
        for (var i = 0; i < 7; i++) {
            sum += parseInt(value[i]) * (8 - i);
        }
        var modulo = sum % 11;
        var controlDigit = parseInt(value[7]);
        if (modulo <= 1) {
            return controlDigit === 1 - modulo;
        }
        return controlDigit === 11 - modulo;
    };

    ns.futureMeetingDay = function (value, element) {
        if (value === undefined || value === null || value === "") {
            return true;
        }

        var format = $(element).data("format");
        if (!format) {
            warn("[futureMeetingDay] No date format is specified for element " + element);
            return false;
        }
        try {
            let date = $.datepicker.parseDate(format, value);
            let today = new Date(), min = new Date(), max = new Date();
            // Trim time
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);

            min.setDate(today.getDate() + 2);
            max.setDate(today.getDate() + 30);

            min.setHours(0, 0, 0, 0);
            max.setHours(0, 0, 0, 0);

            return date >= min && date <= max;
        }
        catch (err) {
            warn("[futureMeetingDay] Error while parsing date: " + value);
            return false;
        }


    };

    ns.validStringOnlyLetters = function (value, element) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        var reg = new RegExp(letterPattern);
        return reg.test(value);
    };

    ns.validStringOnlyNumeral = function (value, element) {
        if (value === undefined || value === null || value === "") {
            return true;
        }

        var reg = new RegExp(numeralPattern);
        return reg.test(value);
    };

    ns.validStringLettersNumeralsNotOnlyLetters = function (value, element) {
        if (value === undefined || value === null || value === "") {
            return true;
        }

        var reg = new RegExp(letterNumeralNotLetterPattern);

        //find some sort of special chars
        if (reg.test(value)) {
            //only letter = false
            reg = new RegExp(letterPattern);
            return !reg.test(value);
        } else {
            return false;
        }
    };

    ns.validStringLettersNumeralsNotOnlyNumerals = function (value, element) {
        if (value === undefined || value === null || value === "") {
            return true;
        }

        //numeral pattern must have whitespaces
        var pattern = /^[0-9\s\-.,]*$/g;
        var reg = new RegExp(letterNumeralPattern);

        //find some sort of special chars
        if (reg.test(value)) {
            //only numbers = false
            reg = new RegExp(pattern);
            return !reg.test(value);
        } else {
            return false;
        }
    };

    ns.validStringLettersNumerals = function (value, element) {
        var reg = new RegExp(notSharpBracketsPattern);
        return reg.test(value);
    };

    ns.personalNumber = function (value, element) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        if (!(/^[0-9]{6}[\/]?[0-9]{3,4}$/.test(value))) {
            return false;
        }
        var personalNumber = value.replace(/\//g, '');
        if (personalNumber.length === 10) {
            return personalNumber % 11 === 0;
        }
        return personalNumber.length === 9;
    };

    ns.isYoungerDate = function (value, element, params) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        try {
            var date = undefined;
            if (!Utils.isObjectJsDate(value)) {
                var format = $(element).data("format");
                if (!format) {
                    warn("[isYoungerDate] No date format is specified for element " + element);
                    return false;
                }
                date = $.datepicker.parseDate(format, value);
            } else {
                date = value;
            }
            var mmnt = moment(date);
            mmnt.add(params[1], 'months');
            var age = Utils.getAgeFromMoment(mmnt);
            return age < params[0];
        }
        catch (err) {
            warn("[isYounger] Error while parsing date: " + value);
            return false;
        }
    };

    ns.isOlderDate = function (value, element, params) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        try {
            var date = undefined;
            if (!Utils.isObjectJsDate(value)) {
                var format = $(element).data("format");
                if (!format) {
                    warn("[isOlderDate] No date format is specified for element " + element);
                    return false;
                }
                date = $.datepicker.parseDate(format, value);
            } else {
                date = value;
            }
            var mmnt = moment(date);
            mmnt.add(params[1], 'months');
            var age = Utils.getAgeFromMoment(mmnt);

            return age >= params[0];
        }
        catch (err) {
            warn("[isOlder] Error while parsing date: " + value);
            return false;
        }
    };

    ns.isYoungerPersonalNumber = function (value, element, params) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        var date = Utils.getBirthDayFromBirthNumber(value);
        if (date === undefined) {

            return false;
        }
        return ns.isYoungerDate(date, element, params);
    };

    ns.isOlderPersonalNumber = function (value, element, params) {
        if (value === undefined || value === null || value === "") {
            return true;
        }
        var date = Utils.getBirthDayFromBirthNumber(value);
        if (date === undefined) {

            return false;
        }
        return ns.isOlderDate(date, element, params);
    };

}(Npw.ValidationMethods = Npw.ValidationMethods || {}, jQuery));

(function (ns, $, undefined) {

    /**
     * Pomocné funkce pro logování na JS konzoli.
     */
    var warn = function (message) {
        console.warn("[Validations] " + message);
    };
    var error = function (message) {
        console.error("[Validations] " + message);
    };

    var isUndefined = function (obj) {
        return (typeof obj === "undefined");
    };

    var isNotUndefined = function (obj) {
        return !isUndefined(obj);
    };

    var isBlank = function (str) {
        return isUndefined(str) || (str.trim().length == 0);
    };

    var isNotBlank = function (str) {
        return !isBlank(str);
    };

    /**
     * Default nastavení pro jquery validation.
     * Portlety mohou nastavení změnit voláním funkce setValidationOptions.
     */
    var defaultOptions = {
        onkeyup: false,
        errorPlacement: function (label, $element) {
            displayErrorTooltip($element, $(label));
        },
        success: function (label, element) {
            hideErrorTooltip($(element));
        }
    };

    /**
     * Strategie pro zpracování jednotlivých constrainů.
     * Úkolem strategie je zavolat API jquery validation a zaregistrovat validaci pro daný input.
     *
     * Map <constraintClass: String, strategy: (function (constraint) -> (function ($input)).
     *
     * constraintClass - Kvalifikované jméno třídy Java anotace.
     * strategy - Funkce pro zaregistrování validace pro daný $input (např. nastavení validace required na input name).
     */
    var constraintStrategies = {};

    /**
     * Custom validation rules, independent on constraint annotations.
     * Useful for crossfield validations definition.
     * Is expected to be a function without parameter, defining the custom validation rules when executed.
     */
    var customRules;

    /**
     * Přidá do mapy constraintStrategies novou strategii.
     *
     * @param constraintClass
     * @param strategy - function (constraint, $input).
     */
    ns.addConstraintStrategy = function (constraintClass, strategy) {
        constraintStrategies[constraintClass] = function (constraint) {
            return function ($input) {

                strategy(constraint, $input);
            };
        }
    };

    /**
     * Přidání custom metody pro jquery validation
     * (např. validace "email nebo telefon", "telefonní číslo", "číslo konta" atd.).
     *
     * Viz http://jqueryvalidation.org/jQuery.validator.addMethod
     *
     * @param name - Jméno metody (např. emailOrPhone, phone, accountNumber)
     * @param method - function(value, element)
     */
    ns.addCustomMethod = function (name, method) {

        $.validator.addMethod(name, method);
    };

    /**
     * Nastavení options pro jquery validation. Je možné přepsat všechny podporované parametry.
     * Viz http://jqueryvalidation.org/validate
     *
     * @param $form
     * @param options
     */
    ns.setValidationOptions = function ($form, options) {

        $form.data("validation-options", options);
    };

    /**
     * Sets the custom validation rule, independent on constraint annotations.
     * Useful for crossfield validations definition.
     * @param rules Function defining the custom validation rules when executed. Requires no parameter.
     */
    ns.setCustomRules = function (rules) {
        customRules = rules;
    };

    /**
     * Vytvoření default strategií pro zpracování constraintů.
     */
    var registerDefaultStrategies = function () {
        ns.addConstraintStrategy("javax.validation.constraints.DecimalMax", function (constraint, $input) {
            $input.rules("add", {
                max: constraint.max(),
                messages: {
                    max: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("javax.validation.constraints.DecimalMin", function (constraint, $input) {
            $input.rules("add", {
                min: constraint.value(),
                messages: {
                    min: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("javax.validation.constraints.Digits", function (constraint, $input) {
            $input.rules("add", {
                number: true,
                messages: {
                    number: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("org.hibernate.validator.constraints.Email", function (constraint, $input) {
            $input.rules("add", {
                email: true,
                messages: {
                    email: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("org.hibernate.validator.constraints.Length", function (constraint, $input) {
            $input.rules("add", {
                rangelength: [constraint.min(), constraint.max()],
                messages: {
                    rangelength: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("javax.validation.constraints.Min", function (constraint, $input) {
            $input.rules("add", {
                min: constraint.value(),
                messages: {
                    min: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("javax.validation.constraints.Max", function (constraint, $input) {
            $input.rules("add", {
                max: constraint.value(),
                messages: {
                    max: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("org.hibernate.validator.constraints.Range", function (constraint, $input) {
            $input.rules("add", {
                min: constraint.min(),
                max: constraint.max(),
                messages: {
                    min: constraint.message(),
                    max: constraint.message()
                }
            });
        });
        var notNullStrategy = function (constraint, $input) {
            $input.rules("add", {
                required: true,
                messages: {
                    required: constraint.message()
                }
            });
        };
        ns.addConstraintStrategy("javax.validation.constraints.NotNull", notNullStrategy);
        ns.addConstraintStrategy("org.hibernate.validator.constraints.NotBlank", notNullStrategy);
        ns.addConstraintStrategy("org.hibernate.validator.constraints.NotEmpty", notNullStrategy);
        ns.addConstraintStrategy("javax.validation.constraints.Pattern", function (constraint, $input) {
            $input.rules("add", {
                regexp: constraint.regexp(),
                messages: {
                    regexp: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("javax.validation.constraints.Size", function (constraint, $input) {
            $input.rules("add", {
                rangelength: [constraint.min(), constraint.max()],
                messages: {
                    rangelength: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("javax.validation.constraints.AssertTrue", function (constraint, $input) {
            $input.rules("add", {
                asserttrue: [],
                messages: {
                    asserttrue: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.NoWhitespacesLength", function (constraint, $input) {
            $input.rules("add", {
                nowhitespaceslength: [constraint.min(), constraint.max()],
                messages: {
                    nowhitespaceslength: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.NoWhitespacesMax", function (constraint, $input) {
            $input.rules("add", {
                nowhitespacesmax: constraint.value(),
                messages: {
                    nowhitespacesmax: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.ValidYearsInterval", function (constraint, $input) {
            $input.rules("add", {
                validyearsinterval: [constraint.min(), constraint.max()],
                messages: {
                    validyearsinterval: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.Phone", function (constraint, $input) {
            $input.rules("add", {
                regexp: {
                    param: "^((\\+[0-9]{12})|([0-9]{9}))$",
                    depends: function (element) {
                        var val = $(element).val();
                        $(element).val(val.replace(/\s/g, ''));
                        return true;
                    }
                },
                messages: {
                    regexp: constraint.message()
                }
            });
        });
        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.PhoneCZSK", function (constraint, $input) {
            $input.rules("add", {
                regexp: {
                    param: "^(\\+(420|421)[0-9]{9})$",
                    depends: function (element) {
                        var val = $(element).val();
                        $(element).val(val.replace(/\s/g, ''));
                        return true;
                    }
                },
                messages: {
                    regexp: constraint.message()
                }
            });

        });
        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.NoFutureLocalDate", function (constraint, $input) {
            $input.rules("add", {
                nofuturelocaldate: true,
                messages: {
                    nofuturelocaldate: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.NoPastLocalDate", function (constraint, $input) {
            $input.rules("add", {
                nopastlocaldate: true,
                messages: {
                    nopastlocaldate: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("org.springframework.format.annotation.DateTimeFormat", function (constraint, $input) {
            $input.rules("add", {
                datetimeformat: constraint.pattern(),
                messages: {
                    datetimeformat: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.IdentificationNumber", function (constraint, $input) {
            $input.rules("add", {
                identificationNumber: {
                    depends: function (element) {
                        var val = $(element).val();
                        $(element).val(val.trim());
                        return true;
                    }
                },
                messages: {
                    identificationNumber: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.FutureMeetingDay", function (constraint, $input) {
            $input.rules("add", {
                futureMeetingDay: true,
                messages: {
                    futureMeetingDay: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.ValidStringOnlyLetters", function (constraint, $input) {
            $input.rules("add", {
                validStringOnlyLetters: true,
                messages: {
                    validStringOnlyLetters: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.ValidStringOnlyNumeral", function (constraint, $input) {
            $input.rules("add", {
                validStringOnlyNumeral: true,
                messages: {
                    validStringOnlyNumeral: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.ValidStringLettersNumeralsNotOnlyLetters", function (constraint, $input) {
            $input.rules("add", {
                validStringLettersNumeralsNotOnlyLetters: true,
                messages: {
                    validStringLettersNumeralsNotOnlyLetters: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.ValidStringLettersNumeralsNotOnlyNumerals", function (constraint, $input) {
            $input.rules("add", {
                validStringLettersNumeralsNotOnlyNumerals: true,
                messages: {
                    validStringLettersNumeralsNotOnlyNumerals: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.PersonalNumber", function (constraint, $input) {
            $input.rules("add", {
                personalNumber: true,
                messages: {
                    personalNumber: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.IsOlderDate", function (constraint, $input) {
            $input.rules("add", {
                isOlderDate: [constraint.min(), constraint.value()],
                messages: {
                    isOlderDate: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.IsOlderPersonalNumber", function (constraint, $input) {
            $input.rules("add", {
                isOlderPersonalNumber: [constraint.min(), constraint.value()],
                messages: {
                    isOlderPersonalNumber: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.IsYoungerDate", function (constraint, $input) {
            $input.rules("add", {
                isYoungerDate: [constraint.max(), constraint.value()],
                messages: {
                    isYoungerDate: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.IsYoungerPersonalNumber", function (constraint, $input) {
            $input.rules("add", {
                isYoungerPersonalNumber: [constraint.max(), constraint.value()],
                messages: {
                    isYoungerPersonalNumber: constraint.message()
                }
            });
        });

        ns.addConstraintStrategy("cz.csob.et.npw.common.view.validation.constraints.ValidStringLettersNumerals", function (constraint, $input) {
            $input.rules("add", {
                validStringLettersNumerals: true,
                messages: {
                    validStringLettersNumerals: constraint.message()
                }
            });
        });
    };

    /**
     * Vytvoří custom metody pro jquery validation používané napříč portlety.
     * Seznam:
     * <ul>
     *     <li>regexp - Validace podle regulárního výrazu.
     *     Používá se pro zpracování anotace javax.validation.constraints.Pattern.</li>
     * </ul>
     */
    var registerCustomMethods = function () {
        $.validator.addMethod("asserttrue", Npw.ValidationMethods.assertTrue);
        $.validator.addMethod("regexp", Npw.ValidationMethods.regexp);
        $.validator.addMethod("nowhitespaceslength", Npw.ValidationMethods.nowhitespaceslength);
        $.validator.addMethod("nowhitespacesmax", Npw.ValidationMethods.nowhitespacesmax);
        $.validator.addMethod("validyearsinterval", Npw.ValidationMethods.validyearsinterval);
        $.validator.addMethod("nofuturelocaldate", Npw.ValidationMethods.nofuturelocaldate);
        $.validator.addMethod("nopastlocaldate", Npw.ValidationMethods.nopastlocaldate);
        $.validator.addMethod("datetimeformat", Npw.ValidationMethods.datetimeformat);
        $.validator.addMethod("identificationNumber", Npw.ValidationMethods.identificationNumber);
        $.validator.addMethod("futureMeetingDay", Npw.ValidationMethods.futureMeetingDay);
        $.validator.addMethod("validStringOnlyLetters", Npw.ValidationMethods.validStringOnlyLetters);
        $.validator.addMethod("validStringOnlyNumeral", Npw.ValidationMethods.validStringOnlyNumeral);
        $.validator.addMethod("validStringLettersNumeralsNotOnlyLetters", Npw.ValidationMethods.validStringLettersNumeralsNotOnlyLetters);
        $.validator.addMethod("validStringLettersNumeralsNotOnlyNumerals", Npw.ValidationMethods.validStringLettersNumeralsNotOnlyNumerals);
        $.validator.addMethod("personalNumber", Npw.ValidationMethods.personalNumber);
        $.validator.addMethod("isYoungerDate", Npw.ValidationMethods.isYoungerDate);
        $.validator.addMethod("isYoungerPersonalNumber", Npw.ValidationMethods.isYoungerPersonalNumber);
        $.validator.addMethod("isOlderDate", Npw.ValidationMethods.isOlderDate);
        $.validator.addMethod("isOlderPersonalNumber", Npw.ValidationMethods.isOlderPersonalNumber);
        $.validator.addMethod("validStringLettersNumerals", Npw.ValidationMethods.validStringLettersNumerals);
    };

    /**
     * Vytvoření funkční "obálky" nad divem s definicí constraintu.
     *
     * @param $element Odpovídající div (typ jQuery)
     */
    var constraint = function ($element) {
        return {
            field: function () {
                return $element.data("field");
            },
            constraintClass: function () {
                return $element.data("constraint-class");
            },
            message: function () {
                return $element.data("message");
            },
            value: function () {
                return $element.data("value");
            },
            min: function () {
                return $element.data("min");
            },
            max: function () {
                return $element.data("max");
            },
            regexp: function () {
                return $element.data("regexp");
            },
            pattern: function () {
                return $element.data("pattern");
            }
        };
    };

    /**
     * Vrátí strategii zpracování pro daný constraint nebo prázdnou funkci.
     * Pokud neexistuje strategie pro daný constraint, zaloguje se do konzole warning.
     */
    var getConstraintStrategy = function (constraint) {
        var strategy = constraintStrategies[constraint.constraintClass()];
        if (strategy) {
            return strategy(constraint);
        } else {
            warn("No strategy for constraint: " + constraint.constraintClass());
            return function () {
            };
        }
    };

    /**
     * Inicializace jquery validation. Od tohoto volání se nad formulářem provádí validace.
     */
    var validate = function () {
        $(".npw-form-validations").parents("form").each(function (index, value) {
            var $form = $(value);
            var options = $.extend(true, {}, defaultOptions, $form.data("validation-options") || {});
            var validator = $form.validate(options);
            $form.data("jquery-validator", validator);

            // ETQC-1931 Workaround: NPW theme's "nice" checkboxes do not propagate "click" event => trigger "onclick" when "change" event occurs   
            $form.validateDelegate("[type='checkbox']", "change", function (event) {
                var eventType = "onclick";
                var settings = validator.settings;
                if (settings[eventType] && !this.is(settings.ignore)) {
                    settings[eventType].call(validator, this[0], event);
                }
            });

        });
    };

    /**
     * Aplikuje strategie na constrainty.
     */
    var applyConstraintStrategies = function () {
        $(".npw-form-validations .npw-form-validation").each(function (index, value) {
            var $value = $(value);

            var c = constraint($value);

            var $input = $value.parents("form").find("[name='" + c.field() + "']");

            if ($input.length >= 1) {
                var strategy = getConstraintStrategy(c);
                // Input does not have to be unique, e.g. in case of radio buttons
                strategy($($input[0]));
            }
        });
    };

    /**
     * If set, applies the custom validation rules.
     */
    var applyCustomRules = function () {
        if (customRules) {
            customRules();
        }
    };

    /**
     * Zobrazí chyby.
     * Chyba se aktuálně zobrazuje jako tooltip u input elementů.
     * Indikace zobrazení - existuje element pro selector .add-on.add-on-invalid.
     */
    var displayErrors = function () {
        $(".add-on.add-on-invalid").each(function (index, value) {
            var $element = $(value);

            var formerDisplay = $element.attr("display");

            if (isNotUndefined(formerDisplay)) {
                $element.data("validation-former-display", formerDisplay);
            }

            $element.css("display", "inline-block");
        });
    };

    /**
     * Zobrazí tooltip s chybou pro daný element.
     *
     * @param $element Validovaný element (typ jQuery)
     * @param $label Label s chybovou hláškou (typ jQuery)
     */
    var displayErrorTooltip = function ($element, $label) {
        if (isBlank($label.text())) {
            return;
        }

        var $a = $element.parent().find("a.add-on");

        if ($a.length === 0) {
            // tooltip not found => may be not directly under parent => try to find it under the closest add-on holder (if exists)
            $a = $element.closest(".add-on-container").find("a.add-on");
        }

        $a.attr("title", "");
        $a.attr("data-error", $label.text());
        $a.attr("class", "add-on add-on-invalid");
    };

    /**
     * Změní tooltip na variantu pro validní input.
     *
     * @param $element Validovaný element (typ jQuery)
     */
    var hideErrorTooltip = function ($element) {

        var $a = $element.parent().find("a.add-on");

        if ($a.length === 0) {
            // tooltip not found => may be not directly under parent => try to find it under the closest add-on holder (if exists)
            $a = $element.closest(".add-on-container").find("a.add-on");
        }

        $a.attr("title", $a.data("tooltip-info"));
        $a.attr("data-error", "");
        $a.attr("class", "add-on add-on-valid");

        // Workaround: ensure the element is submitted for correct behavior of validation tooltip icons
        $element.parents("form").each(function (index, value) {
            var $form = $(value);
            var validator = $form.data("jquery-validator");
            $(validator).each(function () {
                var elementName = $element.attr("name");
                if (!this.submitted[elementName]) {
                    // Assign any non-empty string
                    this.submitted[elementName] = "success";
                }
            });

        });
    };

    /**
     * Inicializace frameworku, kterou je možné provést ihned.
     */
    (function () {
        registerCustomMethods();
        registerDefaultStrategies();
    })();

    /**
     * Inicializace validací.
     * Od tohoto volání se nad formulářem provádí validace.
     */
    $(window).on('load', function () {
        validate();
        applyConstraintStrategies();
        applyCustomRules();

        displayErrors();
    });

}(Npw.Validation = Npw.Validation || {}, jQuery));