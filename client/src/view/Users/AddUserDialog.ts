import { BaseView, addDomEvents, addHubEvents } from 'ts/base';
import { first, remove, closest } from "mvdom";
import { dso } from 'ts/ds';

var usersDso = dso('Users');
export class AddUserDialog extends BaseView {
	modal = false;
	_startEvent: any;
	_isDrag: boolean = false;
	_dragEl: any;
	_lastPos: any;
	_lastDeg?: number;
	initData?: any;
	postDisplay() {
		//refreshList.call(this);
	}

	events = addDomEvents(this.events, {
		'click; .save': (evt: KeyboardEvent) => {
			const addUserEl = first(this.el, '.form')!;
			const name = <HTMLInputElement>first(addUserEl, '.dx.name')!;
			const age = <HTMLInputElement>first(addUserEl, '.dx.age')!;
			if (name.value && age.value) {
				usersDso.create({ name: name.value, age: age.value });
				this.doClose();
			}
		},
		'click; .cancel': (evt: KeyboardEvent) => {
			const addUserEl = first(this.el, '.form')!;
			const name = <HTMLInputElement>first(addUserEl, '.dx.name')!;
			const age = <HTMLInputElement>first(addUserEl, '.dx.age')!;
			name.value = '';
			age.value = '';
		},
		"mousedown; header": (evt: any) => {
			this._startEvent = evt;
			if (!this._dragEl) {
				this._dragEl = closest(evt.selectTarget, ".AddUserDialog");
				console.log(this._dragEl.classList)
				this._lastPos = {
					x: evt.pageX,
					y: evt.pageY
				};
				this._isDrag = true;
			}
		},
		"mousedown; .resizer": (evt: any) => {
			this._startEvent = evt;
			this._dragEl = evt.selectTarget;
			this._lastPos = {
				x: evt.pageX,
				y: evt.pageY
			};
			this._isDrag = true;
		},
		'click; .do-close': () => {
			this.doClose();
		}
	});

	docEvents = addDomEvents({}, {
		"mousemove": (evt: any) => {

			if (this._isDrag) {
				if (this._dragEl.classList.contains("resizer")) {
					const deltaX = evt.pageX - this._lastPos.x;
					const deltaY = evt.pageY - this._lastPos.y;
					const dialogEl = closest(this._dragEl, ".AddUserDialog")!;
					const ow = actualWidth(dialogEl);
					const oh = actualHeight(dialogEl);

					const width = ow + deltaX;
					const height = oh + deltaY;
					dialogEl.style.width = width + "px";
					dialogEl.style.height = height + "px";

				} else {
					first(document, "body")!.style.userSelect = "none";
					const deltaX = evt.pageX - this._lastPos.x;
					const deltaY = evt.pageY - this._lastPos.y;
					const dialogEl = this._dragEl;
					const ox = actualLeft(dialogEl);
					const oy = actualTop(dialogEl);

					const left = ox + deltaX;
					const top = oy + deltaY;
					dialogEl.style.left = left + "px";
					dialogEl.style.top = top + "px";
				}
			}
			this._lastPos = {
				x: evt.pageX,
				y: evt.pageY
			};
		},
		"mouseup": (evt: any) => {
			if (this._isDrag) {
				first(document, "body")!.style.userSelect = "";
			}
			this._dragEl = null;
			this._lastPos = null;
			this._isDrag = false;
			this._startEvent = null;
		},
	});

	hubEvents = addHubEvents(this.hubEvents, {
	});

	protected doClose() {
		remove(this.el);
	}
}

function refreshList(this: AddUserDialog) { }

export function actualLeft(el: HTMLElement) {
	let val = fixed(window.getComputedStyle(el).left!);
	if (isNaN(val)) {
		val = el.offsetLeft;
	}
	return val;
}

export function actualTop(el: HTMLElement) {
	let val = fixed(window.getComputedStyle(el).top!);
	if (isNaN(val)) {
		val = el.offsetTop;
	}
	return val;
}

export function actualWidth(el: HTMLElement) {
	let val = fixed(window.getComputedStyle(el).width!);
	if (isNaN(val)) {
		val = el.offsetWidth;
	}
	return val;
}

export function actualHeight(el: HTMLElement) {
	let val = fixed(window.getComputedStyle(el).height!);
	if (isNaN(val)) {
		val = el.offsetHeight;
	}
	return val;
}

function fixed(value: string) {
	let val = parseFloat(value.replace("px", ""));
	val = val * 1000 / 1000;
	return val;
}