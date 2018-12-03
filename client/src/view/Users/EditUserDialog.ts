import { BaseView, addDomEvents, addHubEvents } from 'ts/base';
import { first, remove } from "mvdom";
import { dso } from 'ts/ds';

var usersDso = dso('Users');
export class EditUserDialog extends BaseView {
	_editId: any;
	postDisplay() {
		refreshList.call(this);
	}

	constructor(editId: string) {
		super();
		this._editId = editId;
	}

	events = addDomEvents(this.events, {
		'click; .save': (evt: KeyboardEvent) => {
			const editId = this._editId;
			const addUserEl = first(this.el, '.form')!;
			const name = <HTMLInputElement>first(addUserEl, '.dx.name')!;
			const age = <HTMLInputElement>first(addUserEl, '.dx.age')!;
			if (name.value && age.value) {
				usersDso.update(editId, { name: name.value, age: age.value });
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
		'click; .do-close': () => {
			this.doClose();
		}
	});

	hubEvents = addHubEvents(this.hubEvents, {
	});

	protected doClose() {
		remove(this.el);
	}
}

function refreshList(this: EditUserDialog) {
	const editId = this._editId;
	usersDso.get(editId).then((user: any) => {
		const addUserEl = first(this.el, '.form')!;
		const name = <HTMLInputElement>first(addUserEl, '.dx.name')!;
		const age = <HTMLInputElement>first(addUserEl, '.dx.age')!;
		name.value = user.name;
		age.value = user.age;
	});
}