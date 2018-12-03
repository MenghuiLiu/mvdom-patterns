import { BaseView, addDomEvents, addHubEvents } from 'ts/base';
import { append, first, display } from "mvdom";
import { render } from 'ts/render';
import { AddUserDialog } from './AddUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { dso } from 'ts/ds';

var usersDso = dso('Users');
export class UsersMainView extends BaseView {

	postDisplay() {
		refreshList.call(this);
	}

	events = addDomEvents(this.events, {
		'click; .add': (evt: KeyboardEvent) => {
			display(new AddUserDialog(), first('body')!);
		},
		'click; .edit': (evt: KeyboardEvent) => {
			const editEl = <HTMLDivElement>evt.target!;
			const editId = editEl.getAttribute('data-entity-id')!;
			display(new EditUserDialog(editId), first('body')!);
		},
		'click; .delete': (evt: KeyboardEvent) => {
			const deleteEl = <HTMLDivElement>evt.target!;
			const deleteId = deleteEl.getAttribute('data-entity-id')!;
			usersDso.remove(parseInt(deleteId));
		},
	});

	hubEvents = addHubEvents(this.hubEvents, {
		'dataHub; Users': (data: any, info: any) => {
			refreshList.call(this);
		},
	});
}

function refreshList(this: UsersMainView) {
	usersDso.list().then((users: any[]) => {
		const listEl = first(this.el, '.users-list')!;
		append(listEl, render("UsersMainView-users-list", { users: users }), 'empty');
	});
}
