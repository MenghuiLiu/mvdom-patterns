/**
 * Here is where we would put all of the IE polyfill. Usually, starting at IE11. 
 */

// Some browsers (e.g., even Edge) do not have the forEach on the NodeList object. 
// make sure to add forEach to NodeList (most modern browser will not need this)

// TODO: We might want to do those polyfill/shim outside of typescript

// if (typeof NodeList.prototype.forEach === "undefined") {
// 	// For the assignement with <any>	
// 	NodeList.prototype.forEach = <any>Array.prototype.forEach;
// }


