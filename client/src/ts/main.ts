import { on, display, first } from 'mvdom';
import { route } from './route';
import { MainView } from 'view/MainView';

import { DsoRemote } from './dsoRemote';


on(document, 'APP_LOADED', async function () {

	// then add this new MainView
	display(MainView, first('body')!).then(async function () {
		// initialize the route, which will trigger a "CHANGE" on the routeHub hub. 
		// Note: we do that once the MainView has been added to the DOM so that it can react accordingly
		route.init();


		// // DEV TEST
		// const todoDso = new DsoRemote('todo');
		// const todoCreated = await todoDso.create({ subject: "from client" });
		// console.log("main.ts todo created", todoCreated.id, todoCreated);

		// const list = await todoDso.list();
		// console.log('main.ts todo list', list.length, list[list.length - 1].id);

		// const todoUpdated = await todoDso.update(todoCreated.id, { done: true });
		// console.log('main.ts todo updated', todoUpdated);

		// const totoGet = await todoDso.get(todoCreated.id);
		// console.log('main.ts todo get', totoGet);

		// const todoRemove = await todoDso.remove(todoCreated.id);
		// console.log(`main.ts remove ${todoCreated.id}`, todoRemove);

	});

});
