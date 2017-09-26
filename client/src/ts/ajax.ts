
// --------- AJAX Wrapper --------- //
// Very simple AJAX wrapper that allow us to simply normalize request/response accross the application code.
// 
// Note: We start with just a minimalistic implementation, if more is needed, we can use some AJAX library while keeping the same
// application APIs. 

export module ajax {
	// use for get and list
	export function get(path: string, data?: any, opts?: any) {
		return _ajax('GET', path, data, opts);
	}

	// use for create 
	export function post(path: string, data?: any, opts?: any) {
		return _ajax('POST', path, data, opts);
	}

	// use for update
	export function put(path: string, data?: any, opts?: any) {
		return _ajax('PUT', path, data, opts);
	}

	// use for delete
	export function _delete(path: string, data?: any) {
		return _ajax('DELETE', path, data, null);
	}
}


var defaultOpts = {
	contentType: "application/json"
};

function _ajax(type: string, path: string, data?: any, opts?: any): Promise<any> {
	opts = Object.assign({}, defaultOpts, opts);

	// if asBody is not defined
	var asBody = (opts.asBody == null && (type === 'POST' || type === 'PUT'));

	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();

		var url = path;

		if (data && !asBody) {
			url += "?" + param(data);
		}

		xhr.open(type, url);
		xhr.setRequestHeader("Content-Type", opts.contentType);

		xhr.onload = function () {
			if (xhr.status === 200) {
				try {
					var response = xhr.responseText;
					var result: any;

					// if the content type was application/json, then, just parse it
					if (opts.contentType === "application/json") {
						result = JSON.parse(response);
					}
					// parse the XML as well
					else if (opts.contentType === "application/xml") {
						result = new DOMParser().parseFromString(response, "application/xml");
					}

					resolve(result);
				} catch (ex) {
					reject("Cannot do ajax request to '" + url + "' because \n\t" + ex);
				}
			} else {
				console.log("xhr.status '" + xhr.status + "' for ajax " + url, xhr);
				reject("xhr.status '" + xhr.status + "' for ajax " + url);
			}
		};

		// pass body
		if (asBody) {
			xhr.send(JSON.stringify(data));
		} else {
			xhr.send();
		}

	});
}

function param(object: any) {
	var encodedString = '';
	for (var prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (encodedString.length > 0) {
				encodedString += '&';
			}
			encodedString += prop + '=' + encodeURIComponent(object[prop]);
		}
	}
	return encodedString;
}
