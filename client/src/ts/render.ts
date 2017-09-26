import { templates } from "handlebars";

import { frag } from "mvdom";

export function render(templateName: string, data?: any) {
	var tmpl = templates[templateName];

	// if not found, throw an error
	if (!tmpl) {
		throw "Not template found in pre-compiled and in DOM for " + templateName;
	}

	// call the function and return the result
	return frag(tmpl(data));
}