import { all } from "mvdom";

var _validators: { [ruleName: string]: ValidationFn } = {};

var _failers: FailerFn[] = [];
var _successes: SuccessFn[] = [];

type FailerFn = (validationErrors: ValidationError[]) => void;
type SuccessFn = (validationSuccesses: ValidationSuccess[]) => void;

type ValidationFn = (name: string | null, value: any, rule: any) => void;

type ValidationSuccess = {
	el: HTMLElement, // The input DOM element that cause the errors
	name?: string | null, // The eventual name of the input field
	value?: any | null,// The value that caused the validation error  
}


type ValidationError = ValidationSuccess & {
	ruleErrors: RuleError[], // Array of ruleError that triggered this validationError	
}

type RuleError = {
	error: Error, // the error object thrown by the validate method
	rule: Rule // the rule options
}

type Rule = {
	name: string;
	args?: string[] | null;
}

type ValidateOptions = {
	fail: FailerFn,
	success: SuccessFn
}

export module validator {

	export function validate(el: HTMLElement, selector: string, opts?: ValidateOptions) {

		let inputs = all(el, selector);
		let validationErrors: ValidationError[] = [];
		let validationSuccesses: ValidationSuccess[] = [];

		if (inputs) {
			for (let node of inputs) {
				let input = <HTMLInputElement>node;
				let value = input.value;
				let name = input.getAttribute("name");
				let rules = extractRules(input);
				let ruleErrors: RuleError[] = [];

				for (let rule of rules) {
					let validationFn = _validators[rule.name];

					try {
						if (!validationFn) {
							throw "no validation rule for " + rule.name;
						}
						validationFn(name, value, rule);
					} catch (error) {
						ruleErrors.push({
							error: error,
							rule: rule
						});
					}
				}
				// if we have rule errors, we  
				if (ruleErrors.length > 0) {
					validationErrors.push({
						el: input,
						name: name,
						value: value,
						ruleErrors: ruleErrors,
					});
				} else {
					validationSuccesses.push({
						el: input,
						name: name,
						value: value
					});
				}
			}

			if (validationErrors.length > 0) {
				// if we have a opts.fail, add it to the list of failers (.concat will make a new array, so, safe)
				var failers = (opts && opts.fail) ? _failers.concat([opts.fail]) : _failers;

				for (let failer of failers) {
					failer(validationErrors);
				}
			}

			if (validationSuccesses.length > 0) {
				// if we have a opts.successe, add it to the list of successes (.concat will make a new array, so, safe)
				var successes = (opts && opts.success) ? _successes.concat([opts.success]) : _successes;
				for (let success of successes) {
					success(validationSuccesses)
				}
			}
		} // if inputs	

		return {
			validationErrors: validationErrors,
			validationSuccesses: validationSuccesses
		};
	}

	export function add(name: string, validationFn: ValidationFn) {
		_validators[name] = validationFn;
	}


	export function fail(failer: FailerFn) {
		_failers.push(failer);
	}

	export function success(success: SuccessFn) {
		_successes.push(success);
	}
}


// extract and parse the rules for this dom element (in data-valid attribute)
var regxNameArgs = /(\w*)\s*\((.*)\)/;


function extractRules(el: HTMLElement) {
	var rules: Rule[] = [];
	// e.g., "required ; email;min( 4);max(20)"
	var rulesString = el.getAttribute("data-valid");
	if (rulesString) {
		// first we extract each raw rules in an array 
		// e.g. ["required "," email","min( 4)","max(20)"]
		var rawRules = rulesString.split(";");

		// second, for each rules, 
		rules = rawRules.map((rawRule) => {
			var name: string | null | undefined;
			var args: string[] | null | undefined;
			// if we have a named function and args
			if (rawRule.indexOf("(") !== -1) {
				var nameAndArgs = regxNameArgs.exec(rawRule);
				if (nameAndArgs != null) {
					name = nameAndArgs[1].trim();
					args = nameAndArgs[2].split(",").map(function (arg) {
						return arg.trim();
					});
				}
			}
			// if itis a simple rule
			else {
				name = rawRule.trim();
			}
			if (name == null) {
				throw new Error("Rule not found for element " + el);
			}
			// e.g., "min( 4)"
			return { name, args };
		});
	}
	return rules;
}


