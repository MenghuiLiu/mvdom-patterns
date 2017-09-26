import { BaseView } from 'ts/base';

export class HomeView extends BaseView {

	postDisplay() {
		// do some stuf with this.el
	}
}


class Greeter {
	greeting = "stranger";
	constructor(message: string) {
		this.greeting = message || this.greeting;
	}
	greet() {
		return "Hello, " + this.greeting;
	}
}