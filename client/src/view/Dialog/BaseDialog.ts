import { BaseView, addDomEvents } from 'ts/base';
import { remove, first, append } from 'mvdom';
import { render } from 'ts/render';


export class BaseDialog extends BaseView {
	modal = false;

	set title(title: string) {
		first(this.el, '.dialog > header > .title')!.innerText = title;
	}

	set content(content: HTMLElement | DocumentFragment) {
		append(first(this.el, '.dialog > section.content')!, content, "empty");
	}

	events = addDomEvents(this.events, {
		'click; .base-dialog > header': (evt: Event) => {
			console.log('BaseDialog click header', evt);
		},

		'click; .do-close': () => {
			this.doClose();
		}
	});

	// --------- Controller Methods --------- //
	create(data?: any) {
		// here we do not call super.create, because no matter what the base is BaseDialog.tmpl
		var frag = render("BaseDialog", data);

		frag.firstElementChild!.classList.add('base-dialog');

		return frag;
	}
	// --------- /Controller Methods --------- //

	protected doClose() {
		remove(this.el);
	}

}