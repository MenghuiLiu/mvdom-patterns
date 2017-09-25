// This still use the "./lib" module to load the required library, making "./lib" the single point for external libraries.
import { View } from 'mvdom'
import { render } from 'ts/render';

export type EventBindings = { [selector: string]: (evt?: Event) => void };
export type HubBindings = { [selector: string]: (data?: any, info?: any) => void };

export class BaseView implements View {
	/** Unique id of the view. Used in namespace binding and such.  */
	id: string;

	/** The view name or "class name". */
	name: string;

	/** The htmlElement created */
	el?: HTMLElement;

	// Here we use the object type, as we do not want to have two same bindings for the same event in the same class hierarchy
	events: EventBindings = {};

	// Here we use the array way, because, we want to allow subclass to also listen to the same hubEvents 
	//   as the base class (might be useful in some circumstances)
	hubEvents: HubBindings[] = [];

	create(data?: any) {
		return render(this.name, data);
	}
}

export function addDomEvents(target: EventBindings, source: EventBindings) {
	return Object.assign(target, source) as typeof target;
}

export function addHubEvents(target: HubBindings[], source: HubBindings) {
	target.push(source);
	return target;
}


// export function assign<T>(target: T, source: T): T {
// 	return Object.assign(target, source);
// }

// export function add<T>(target: T[], source: T): T[] {
// 	target.push(source);
// 	return target;
// }

