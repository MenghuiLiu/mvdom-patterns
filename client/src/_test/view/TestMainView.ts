import { BaseView, addHubEvents } from 'ts/base';
import { all, first, display, empty } from 'mvdom';

export class TestMainView extends BaseView {
	path0?: string;

	// --------- hubEvents Binding --------- //
	hubEvents = addHubEvents(this.hubEvents, {
		"routeHub; CHANGE": (routeInfo: any) => {
			displayView.call(this, routeInfo);
		}
	});
	// --------- /hubEvents Binding --------- //

}


// --------- Private Methods --------- //

function displayView(this: TestMainView, routeInfo: any) {
	var view = this;

	var path0 = routeInfo.pathAt(0);

	// if null or undefined, make it empty string.
	path0 = (!path0) ? "" : path0;


	// We change the subView only if the path0 is different
	if (view.path0 !== path0) {
		// Remove the eventual active
		all(view.el, "nav.main a.active").forEach(function (itemEl: any) {
			itemEl.classList.remove("active");
		});

		// activate the nav a link
		let activeEl = first(view.el, "nav.main a[href='#" + path0 + "']");
		if (activeEl) {
			activeEl.classList.add("active");
		}

		// change the subview
		var subViewName = path0;

		if (subViewName) {
			// display the view (empty first)
			var contentEl = first(view.el, "section.main");
			display(subViewName, contentEl!, null, "empty");

			// change the current path0
			view.path0 = path0;
		} else {
			empty(first(view.el, "section.main"));
		}


	}

}

// --------- /Private Methods --------- //