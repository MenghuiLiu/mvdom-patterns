import { addDomEvents } from 'ts/base';
import { first, append } from 'mvdom';
import { render } from 'ts/render';
import { BaseDialog } from './BaseDialog';

export class SimpleDialog extends BaseDialog {

	// --------- Lifecycle Methods --------- //
	// update the component this.el before it get added to the DOM
	init() {
		this.title = "Simple Dialog";
		this.content = render("SimpleDialog-content");
	}
	// --------- /Lifecycle Methods --------- //

	// --------- Dom Event Bindings --------- //
	events = addDomEvents(this.events, {
		'click; .base-dialog > header': () => {
			console.log('SimpleDialog click header');
		}
	});
	// --------- /Dom Event Bindings --------- //

	doClose() {
		console.log('Simple Dialog delaying close....');
		first(this.el, 'header > .title')!.innerText = '... closing ....';
		setTimeout(() => {
			super.doClose();
		}, 2000);
	}

}


