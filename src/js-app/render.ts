import { mvdom as d, View, Handlebars } from "../lib";

export function render(templateName: string, data?: any) {
	var tmpl = Handlebars.templates[templateName];

	// if not found, throw an error
	if (!tmpl) {
		throw "Not template found in pre-compiled and in DOM for " + templateName;
	}

	// call the function and return the result
	return d.frag(tmpl(data));
}

// --------- Render --------- //
// Just a little indirection to render a template using handlebars.
// This simple indirection allows much flexibility later one, 
// when using pre-compiling or other templating engine are needed.

// The node.js hbsp process will put the precompileß function in the Handlebars.templates
Handlebars.templates = Handlebars.templates || {};


document.addEventListener("DOMContentLoaded", function (event) {
	// Make all templates partials (no reason why they should not)
	// Note: We put this in a DOMContentLoaded to make sure the Handlebars.templates where loaded (assuming the "templates.js" 
	//       is loaded in the <head></head> (which is the case in our best practice)
	Handlebars.partials = Handlebars.templates;
});
// --------- /Render --------- //


// --------- Render mvdom Hook --------- //
// Use the mvdom hook mechanism to set the default create behavior for any view that does not have a .create method
d.hook("willCreate", function (view: View) {
	if (!view.create) {
		view.create = defaultCreate;
	}
});

function defaultCreate(this: View, data?: any) {
	return render(this.name, data);
}
// --------- /Render mvdom Hook --------- //