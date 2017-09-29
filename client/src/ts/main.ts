import { on, display, first } from 'mvdom';
import { route } from './route';
import { MainView } from 'view/MainView';

import { DsoRemote } from './dsoRemote';


on(document, 'APP_LOADED', function () {

	// then add this new MainView
	display(MainView, first('body')!).then(function () {
		// initialize the route, which will trigger a "CHANGE" on the routeHub hub. 
		// Note: we do that once the MainView has been added to the DOM so that it can react accordingly
		route.init();

		var todoDso = new DsoRemote('todo');
		todoDso.create({ subject: "from client" }).then((todoCreated) => {
			console.log("main.ts todo created", todoCreated);
		})
	});

});
