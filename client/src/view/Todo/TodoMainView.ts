import { BaseView, addDomEvents, addHubEvents } from 'ts/base';
import { hub, append, all, first, prev, next, pull } from "mvdom";
import { guard, entityRef } from 'ts/utils';
import { dso } from 'ts/ds';
import { route } from 'ts/route';
import { render } from 'ts/render';

var todoDso = dso('Todo');

export class TodoMainView extends BaseView {
	itemsEl: HTMLElement;
	newTodoIpt: HTMLElement;
	path1?: string;
	show?: string;

	postDisplay() {
		this.itemsEl = first(this.el, '.items')!;
		this.newTodoIpt = first(this.el, 'header .new-todo')!;
		this.newTodoIpt.focus();

		refreshViewFromRoute.call(this);
	}

	// --------- HubEvents Binding --------- //
	hubEvents = addHubEvents(this.hubEvents, {
		'dataHub; Todo': (data: any, info: any) => {
			refreshList.call(this);
		},

		'routeHub; CHANGE': (routeInfo: any) => {
			refreshViewFromRoute.call(this);
		}
	});
	// --------- /HubEvents Binding --------- //

	// --------- Dom Event Bindings --------- //
	events = addDomEvents(this.events, {
		// all input - we disable the default Tab UI event handling, as it will be custom
		'keydown; input': (evt: KeyboardEvent) => {
			if (evt.key === "Tab") {
				evt.preventDefault();
			}
		},

		// --------- new todo UI Events --------- //
		// Handle the keyup on the input new-todo 
		// enter to create new, and tab to go to first item in the list.
		'keyup; input.new-todo': (evt: KeyboardEvent) => {
			var inputEl = <HTMLInputElement>evt.target;

			// press enter
			if (evt.key === 'Enter') {
				var val = inputEl.value.trim();
				if (val.length > 0) {
					todoDso.create({ subject: val }).then(function () {
						inputEl.value = "";
						// send to the notification
						hub('notifHub').pub('notify', { type: 'info', content: '<strong>New task created:</strong> ' + val });
					});
				} else {
					hub('notifHub').pub('notify', { type: 'error', content: '<strong>ERROR:</strong> An empty task is not a task.' });
				}
			}
			//press tab, make editable the first item in the list
			else if (evt.key === 'Tab') {
				var todoEntityRef = entityRef(first(this.el!, '.items .todo-item')!);
				if (todoEntityRef) {
					editTodo.call(this, todoEntityRef);
				}
			}
		},
		// --------- /new todo UI Events --------- //

		// --------- todo-item UI Events --------- //
		// toggle check status
		'click; .ctrl-check': (evt: MouseEvent) => {
			var eRef = entityRef(evt.target, 'Todo');
			eRef = guard(eRef, 'No entity reference found for ' + evt.target);

			// we toggle the done value (yes, from the UI state, as this is what the user intent)
			var done = !eRef.el.classList.contains("todo-done");

			// we update the todo vas the dataservice API. 
			todoDso.update(eRef.id, { done: done }).then(function (newEntity: any) {
				if (done) {
					hub('notifHub').pub('notify', { type: 'info', content: '<strong>Task done:</strong> ' + newEntity.subject });
				} else {
					hub('notifHub').pub('notify', { type: 'warning', content: '<strong>Task undone:</strong> ' + newEntity.subject });
				}
			});
		},

		// double clicking on a label makes it editable
		'dblclick; label': (evt: MouseEvent) => {
			editTodo.call(this, entityRef(evt.target, 'Todo'));
		},

		// when the todo-item input get focus out (we cancel by default)
		'focusout; .todo-item input': (evt: MouseEvent) => {
			var view = this;
			var eRef = entityRef(evt.target, 'Todo');
			eRef = guard(eRef, 'No entity reference found for ' + evt.target);

			// IMPORTANT: Here we check if the entityEl state is editing, if not we do nothing. 
			//            Ohterwise, we might do the remove inputEl twice with the blur event flow of this element.
			if (eRef.el.classList.contains('editing')) {
				cancelEditing.call(view, eRef);
			}
		},

		// when user type enter or tab in the todo-item input
		'keyup; .todo-item input': (evt: KeyboardEvent) => {
			var view = this;
			var inputEl = evt.target;
			var eRef = entityRef(inputEl, 'Todo');
			eRef = guard(eRef, 'No entity reference found for ' + evt.target);
			var s = ".items .todo-item[data-entity-id='" + eRef.id + "']";

			switch (evt.key) {
				case "Enter":
					commitEditing.call(view, eRef).then(() => {
						// focus the input on enter
						this.newTodoIpt.focus();
					});
					break;

				case "Tab":
					commitEditing.call(view, eRef).then(() => {
						var entityEl = first(view.el, s);
						var siblingTodoEl = (evt.shiftKey) ? prev(entityEl, ".todo-item") : next(entityEl, ".todo-item");
						if (siblingTodoEl) {
							var siblingTodoRef = entityRef(siblingTodoEl, "Todo");
							editTodo.call(this, siblingTodoRef);
						} else {
							// todo: need to focus on the first new-todo
							view.newTodoIpt.focus();
						}
					});
					break;
			}
		}
		// --------- /todo-item UI Events --------- //
	});
	// --------- /Dom Event Bindings --------- //

}

// --------- Private View Methods --------- //
// TODO: Needs to move to TypeScript class once MVDOM supports Class in Register. 

// private: commit the the .todo-item pointed by entityRef.el if needed and remove the editing steps
// @return: return a Promise of when it will be done. 
function commitEditing(this: TodoMainView, entityRef: any) {

	return new Promise((resolve, fail) => {
		// Get the name/value of the elements marked by class="dx"
		var data = pull(entityRef.el);

		// if the newSubject (in the input) is different, then, we update.
		if (data.subject !== data.newSubject) {
			todoDso.update(entityRef.id, { subject: data.newSubject }).then(function () {
				// NOTE: no need to remove the editing state as the list will be rebuilt. 
				resolve();
			});
		}
		// we cancel the editing (avoiding to do an uncessary update)
		else {
			cancelEditing.call(this, entityRef).then(function () {
				resolve();
			});
		}

	});
}

// Cancel an editing in process. 
// Note: This would not need to to return 
function cancelEditing(this: TodoMainView, entityRef: any) {
	return new Promise(function (resolve, fail) {
		// remove the editing class
		entityRef.el.classList.remove("editing");

		// we can remove the input element
		var inputEl = first(entityRef.el, "input");
		if (inputEl && inputEl.parentNode) {
			inputEl.parentNode.removeChild(inputEl);
		}
		return resolve();
	});
}


function editTodo(this: TodoMainView, entityRef: any) {
	var todoEl = entityRef.el;

	var labelEl = first(todoEl, "label");
	labelEl = guard(labelEl, "Cannot find label tag for " + todoEl);

	var currentSubject = labelEl.innerHTML;

	todoEl.classList.add("editing");

	// create the input HTML and add it to the entity element
	var inputHTML = render("TodoMainView-input-edit", { subject: currentSubject });
	todoEl.insertAdjacentHTML("beforeend", inputHTML);

	// set the focus and selection on the input element
	var inputEl = <HTMLInputElement>first(todoEl, "input");
	inputEl = guard(inputEl, "Cannot find label om[it] for " + todoEl);
	inputEl.focus();
	inputEl.setSelectionRange(0, inputEl.value.length);
}


// refresh the full view
function refreshViewFromRoute(this: TodoMainView) {
	// get the path1
	var routeInfo = route.getInfo();
	// get the path1
	var path1 = routeInfo.pathAt(1);
	path1 = (!path1) ? "" : path1;

	// if the path1 changed, we udpate the nav and refresh the list
	if (this.path1 !== path1) {
		this.show = (path1) ? path1 : "all";

		all(this.el, "footer .filter-bar .filter.active").forEach((filterEl: any) => {
			filterEl.classList.remove("active");
		});

		var href = (path1) ? '#todo/' + path1 : '#todo';
		var toActiveEl = first(this.el, "footer .filter-bar .filter[href='" + href + "']");
		if (toActiveEl) {
			toActiveEl.classList.add("active");
		}

		// refresh the list
		refreshList.call(this);

		this.path1 = path1;

	}
}


// private: refrensh the todo list of items
function refreshList(this: TodoMainView) {
	var filter = null;
	switch (this.show) {
		case "all":
			// not filter
			break;
		case "active":
			// done can be null/undefined or false
			filter = [{ done: null }, { done: false }];
			break;
		case "completed":
			filter = { done: true };
			break;
	}

	todoDso.list({ filter: filter }).then((todos: any) => {
		if (todos) {
			let newEl = render("TodoMainView-todo-items", { items: todos });
			if (newEl) {
				append(this.itemsEl, newEl, "empty");
			}

		}
	});
}
// --------- /Private View Methods --------- //
