import { BaseView, addHubEvents } from "ts/base";
import { on, remove } from "mvdom";
import { render } from "../ts/render";

export class NotificationView extends BaseView {
	postDisplay() {
		var view = this; // best practice, set the view variable first. 
	}

	// --------- Hub Event Bindings --------- //
	hubEvents = addHubEvents(this.hubEvents, {
		// On topic notify on notifHub, we show the message. 
		"notifHub; notify": (notifMessage: any, evtInfo: any) => {
			// For now, the scheme is to have the message being the content and the notification label be the event type
			addItem.call(this, notifMessage);
		}
	});
	// --------- /Hub Event Bindings --------- //

}

function addItem(this: NotificationView, notifMessage: any) {
	var view = this;

	// create the new element 
	var frag = render("NotificationView-item", notifMessage);

	// Make sure to get the firstEl before fragment is appended (appending a fragment empty its children)
	var notifCtnEl = <HTMLElement>(frag.firstElementChild || frag.childNodes[0]); // for edge, .firstElementChild is not supported
	view.el!.appendChild(frag);

	// Here we need to set explicitly the height so that it can be animated later
	// Note: this allows us to be dynamic about the height of the notification items and not harcode them in css
	notifCtnEl.style.height = notifCtnEl.offsetHeight + "px";

	// when the animation end, start the remove process
	on(notifCtnEl, "animationend", function (evt: any) {

		// once we finish shrinking the div, we can remove it from the DOM
		on(notifCtnEl, "transitionend", function (evt: any) {
			remove(notifCtnEl);
		});

		// we set the height to 0px so that it can shrink and moving the eventual other items below
		notifCtnEl.style.height = "0px";
	});
}
