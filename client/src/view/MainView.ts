import { BaseView, addHubEvents } from 'ts/base';
import { display, all, first, empty } from 'mvdom';
import { HomeView } from './HomeView';
import { TodoMainView } from './Todo/TodoMainView';
import { DashMainView } from './Dash/DashMainView';
import { PostrMainView } from './Postr/PostrMainView';
import { NotificationView } from './NotificationView';
import { DialogDemoView } from './Dialog/DialogDemoView';

type BaseViewClass = { new(): BaseView; }

var pathToView: { [name: string]: BaseViewClass } = {
	'': HomeView,
	'todo': TodoMainView,
	'dash': DashMainView,
	'postr': PostrMainView,
	'dialog': DialogDemoView
};


export class MainView extends BaseView {
	path0?: string;

	postDisplay() {
		display(NotificationView, this.el!);
	}

	// --------- HubEvents Binding --------- //
	hubEvents = addHubEvents(this.hubEvents, {
		'routeHub; CHANGE': (routeInfo: any) => {
			displayView.call(this, routeInfo);
		}
	});
	// --------- /HubEvents Binding --------- //
}

// --------- Private Methods --------- //
function displayView(this: MainView, routeInfo: any) {
	var view = this;

	var path0 = routeInfo.pathAt(0);

	// if null or undefined, make it empty string.
	path0 = (!path0) ? "" : path0;

	// We change the subView only if the path0 is different
	if (view.path0 !== path0) {
		// Remove the eventual active
		for (let itemEl of all(view.el, '.main-nav a.active')) {
			itemEl.classList.remove("active");
		}

		// activate the main-nav a link
		var activeEl = first(view.el, '.main-nav a[href="#' + path0 + '"]');
		if (activeEl) {
			activeEl.classList.add('active');
		}

		// change the subview
		var subViewClass = pathToView[path0];

		// display the view (empty first)
		var contentEl = first(view.el, '.main-content');
		empty(contentEl);
		display(subViewClass, contentEl!);

		// change the current path0
		view.path0 = path0;
	}

}
// --------- /Private Methods --------- //