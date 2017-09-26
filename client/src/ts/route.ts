import { hub, on } from "mvdom";
import { asNum } from "./utils";

// Global routeHub to trigger the events
var routeHub = hub("routeHub");

export module route {

	export function getInfo() {
		return parseHash();
	}

	export function init() {
		triggerRouteChange(getInfo());
	}
}

class RouteInfo {
	private _data: any;

	constructor(data: any) {
		this._data = data;
	}

	pathAt(idx: number): string | null {
		return (this._data.paths.length > idx) ? this._data.paths[idx] : null;
	};

	pathAsNum(idx: number): number | null {
		var num = this.pathAt(idx);
		return asNum(num);
	};

	paths(): string[] {
		return this._data.paths;
	}
}

document.addEventListener("DOMContentLoaded", function (event) {
	on(window, "hashchange", function () {
		var r = route.getInfo();
		triggerRouteChange(route.getInfo());
	});
});

// --------- utilities --------- //
function triggerRouteChange(routeInfo: RouteInfo) {
	routeHub.pub("CHANGE", routeInfo);
}

function parseHash(): RouteInfo {
	var hash = window.location.hash;
	var paths: string[];
	if (hash) {
		hash = hash.substring(1);

		var pathAndParam = hash.split("!"); // should get the first "!" as we should allow for param values to have "!"

		paths = pathAndParam[0].split("/");

		// TODO: need to add support for params
	} else {
		paths = [];
	}

	return new RouteInfo({ paths });
}
// --------- /utilities --------- //