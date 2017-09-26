import { registerHelper } from "handlebars";

Handlebars.registerHelper("echo", function (cond: string, val: any) {
	return (cond) ? val : "";
});

Handlebars.registerHelper("symbol", function (name: string, options: any) {
	var html = ['<svg class="symbol">'];
	html.push('<use xlink:href="#' + name + '"></use>');
	html.push('</svg>');
	return html.join('\n');
});