import { BaseView, addDomEvents } from 'ts/base';
import { display, first } from 'mvdom';
import { BaseDialog } from './BaseDialog';
import { SimpleDialog } from './SimpleDialog';

export class DialogDemoView extends BaseView {


	// --------- Dom Event Bindings --------- //
	events = addDomEvents(this.events, {
		"click; .show.basic": () => {
			display(new BaseDialog(), first('body')!);
		},

		"click; .show.simple": () => {
			display(new SimpleDialog(), first('body')!);
		}
	});
	// --------- /Dom Event Bindings --------- //
}