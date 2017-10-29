
// cast "primitive" types
export function as(val: any, type: any) {
	return type(val);
}


/** Decode a base64 json string into an object or array. 
 * @returns Return the json object or arry, or null if the base64Json is null or undefined 
 **/
export function jsonDecode(base64Json: string | null | undefined): object | any[] | null {
	// null proof function
	if (base64Json == null) {
		return null;
	}

	const queryOptionsJsonString = Buffer.from(base64Json, 'base64').toString();
	const val = JSON.parse(queryOptionsJsonString);
	return val;
}

// --------- Object Utils --------- //
var UD = "undefined";
var STR = "string";
var OBJ = "object";


// return true if the value is null, undefined, empty array, empty object, or empty string
export function isEmpty(v: any) {
	if (v == null) {
		return true;
	}
	if (v instanceof Array || typeof v === STR) {
		return (v.length === 0) ? true : false;
	}

	if (typeof v === OBJ) {
		// apparently 10x faster than Object.keys
		for (var x in v) { return false; }
		return true;
	}

	return false;
}


// --------- /Object Utils --------- //

