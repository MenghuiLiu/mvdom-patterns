import { empty, trigger, first } from "mvdom";
import { ds } from "./ds";
import { DsoMem } from "./dsoMem";
import { ajax } from "./ajax"

/**
 * This module finish loading all of the assets (i.e. svg symbols) and triggers as "APP_LOADED". The APP_LOADED event will be listened in the 
 * main.js (or test-main.js) to start the application.
 *
 * We put it on DOMContentLoader (i.e. $.ready for modern browsers) to make sure it is run after all js are loaded.
 **/


// --------- DataService Initialization --------- //
// For the demo, we will have the Memory Dso fallback for any type the application might use. 	
ds.fallback(function (type) {
	return new DsoMem(type);
});

// For production, you might want to have some Entity DSO object that you would register as follow
// ds.register("Task", new TaskDso());
// --------- /DataService Initialization --------- //


// --------- Load svg icons --------- //
// NOTE: We start the loading as soon as possible (before the DOMContentLoaded)
var svgSymbolsPromise = ajax.get("/svg/sprite.svg", null, { contentType: "application/xml" });
// --------- /Load svg icons --------- //	


document.addEventListener("DOMContentLoaded", function (event) {
	// we make sure the the ajax for the svg/sprites.svg returns
	svgSymbolsPromise.then(function (xmlDoc) {
		// add the symbols to the head (external linking works but has issues - styling, and caching -)
		var firstChildElement = xmlDoc.firstChildElement || xmlDoc.childNodes[0]; // edge does not seem to have .firstChildElement, at least for xlmDoc
		var h = document.querySelector("head");
		if (h != null)
			h.appendChild(firstChildElement);

		//// We can display the MainView now
		var bodyEl = first("body");
		// first make sure we empty eventual body.
		empty(bodyEl);

		// trigger an event that the application has been loaded
		trigger(document, "APP_LOADED");

	});
});
