import { on } from "mvdom";


document.addEventListener("DOMContentLoaded", function (event) {

	on(document, "click", ".switch", function (evt: any) {
		var switchEl = evt.selectTarget;
		toggle(switchEl);
	});

	on(document, "keyup", ".switch", function (evt: any) {
		if (evt.code === "Space") {
			toggle(evt.selectTarget);
		}
	});

});


function toggle(switchEl: HTMLElement) {
	switchEl.classList.toggle("on");
}

