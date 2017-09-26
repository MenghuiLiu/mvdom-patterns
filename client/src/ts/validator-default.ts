import { first, closest } from "mvdom";
import { validator } from "./validator";

// --------- Default Fail / Pass Hanlers --------- //
// This default catcher will attempt to update the UI field element with the error information
validator.fail((validationErrors) => {

	validationErrors.forEach((validationError) => {

		// debug for now
		console.log("Error validating " + validationError.name + " " + validationError.ruleErrors[0].error);

		var fieldEl = closest(validationError.el, ".field");
		if (fieldEl) {
			fieldEl.classList.add("error");
			var messageEl = first(fieldEl, ".message");
			if (messageEl) {
				messageEl.innerText = validationError.name + " " + validationError.ruleErrors[0].error;
			} else {
				console.log("validator.fail no message element found, log to console", validationError);
			}
		}
	});
});


validator.success((validationSuccesses) => {

	validationSuccesses.forEach((validationSuccess) => {
		var fieldEl = closest(validationSuccess.el, ".field");
		if (fieldEl) {
			fieldEl.classList.remove("error");
			var messageEl = first(fieldEl, ".message");
			if (messageEl) {
				messageEl.innerText = "";
			}
		}
	});
});


// --------- /Default Fail / Pass Hanlers --------- //


// --------- Default Rules --------- //
// required
validator.add("required", (name, value, ruleOptions) => {
	if (value == null || value.trim().length === 0) {
		throw "is required, cannot be empty.";
	}
});

// email
validator.add("email", (name, value, ruleOptions) => {
	// for now, just checking if there is a @
	if (value != null && value.indexOf("@") === -1) {
		throw "is not a valid email address.";
	}
});

// noSpecialChar
var rgxNoSpecialChar = /^[a-zA-Z0-9\s]*$/;
validator.add("noSpecialChar", (name, value, ruleOptions) => {
	// for now, just checking if there is a @
	if (value != null && rgxNoSpecialChar.exec(value) === null) {
		throw "cannot have special characters.";
	}
});

validator.add("min", (name, value, ruleOptions) => {
	var minVal = extractArg1AsNum(ruleOptions);

	// for now, just checking if there is a @
	if (value != null && value.length < minVal) {
		throw "should have at least " + minVal + " characters.";
	}
});

validator.add("max", (name, value, ruleOptions) => {
	var maxVal = extractArg1AsNum(ruleOptions);

	// for now, just checking if there is a @
	if (value != null && value.length > maxVal) {
		throw "cannot have more than " + maxVal + " characters.";
	}
});
// --------- /Default Rules --------- //




// --------- Utils --------- //
function extractArg1AsNum(ruleOptions: any) {
	var numVal;
	if (!ruleOptions.args || ruleOptions.args.length < 1) {
		throw "" + ruleOptions.name + " rule invalid, does not have a argument. Make sure to put it min(12) for example.";
	} else {
		numVal = ruleOptions.args[0] * 1;
	}
	return numVal;
}
// --------- /Utils --------- //