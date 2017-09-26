import { hub } from "mvdom";
import { Dso, BaseEntity, Criteria } from "./ds";

/**
 * InMemory (browser) implementation of the DataService ("ds"). 
 * 
 * - Use this during initial development or proof of concepts that cannot have server persistence.
 * 
 * - All APIs respect the "ds" async contract (return Promise) so that changing 
 * 		to the dsAjax.js would be completely transparent.
 **/

export class DsoMem<E extends BaseEntity> implements Dso<E>{
	private _type: string;

	constructor(type: string) {
		this._type = type;
	}

	create(entity: E): Promise<E> {
		var type = this._type;
		return new Promise(function (resolve, reject) {
			// get the next seq and put the new object
			var id = store.nextSeq();
			entity.id = id;
			store.put(type, id, entity);

			// get the new entity from the store (will have the .id)
			entity = store.get(type, id);

			// we resolve first, to allow the caller to do something before the event happen
			resolve(entity);

			// we publish the dataservice event
			hub("dataHub").pub(type, "create", entity);
		});
	}

	update(id: number, entity: E): Promise<E> {
		var type = this._type;
		return new Promise(function (resolve, reject) {
			var dbEntity = store.get(type, id);
			if (dbEntity) {
				// make sure we do not change the .id (TODO: might want to throw an error if not match)
				delete entity.id;

				// put the new entity properties in the dbEntity
				Object.assign(dbEntity, entity);
				store.put(type, id, dbEntity);

				// we resolve 
				resolve(dbEntity);

				// we public the dataservice event
				hub("dataHub").pub(type, "update", dbEntity);

			} else {
				reject("Cannot update entity " + type + " because [" + id + "] not found");
			}
		});
	}

	get(id: number): Promise<E> {
		var type = this._type;

		return new Promise(function (resolve, reject) {
			var dbEntity = store.get(type, id) as E;
			if (dbEntity) {
				resolve(dbEntity);
			} else {
				reject("Entity " + type + " with id [" + id + "] not found");
			}
		});
	};

	list(criteria: Criteria): Promise<E[]> {
		var type = this._type;

		return new Promise(function (resolve, reject) {
			resolve(store.list(type, criteria));
		});
	};

	first(criteria: Criteria): Promise<E | null> {
		var type = this._type;

		return new Promise(function (resolve, reject) {
			resolve(store.first(type, criteria));
		});
	};

	remove(id: number): Promise<boolean> {
		var type = this._type;

		return new Promise(function (resolve, reject) {
			resolve(store.remove(type, id));
			// we publish the dataservice event
			hub("dataHub").pub(type, "delete", id);
		});
	};
}



// --------- Local Mock Store --------- //
/*
	A very simple in-memory local store. 
*/

// entityStores: Entity Store by entity type. Entity Store are {} of format {id : entity}
module store {

	var entityStores: { [name: string]: any } = {};

	var seq = 1; // global sequence

	export function nextSeq() {
		return seq++;
	}

	export function get(type: string, id: number) {
		var entityStore = entityStores[type];
		var entity = (entityStore) ? entityStore[id] : null;

		// make sure to return a copy (for now, shallow copy)
		return (entity) ? Object.assign({}, entity) : null;
	}

	export function put(type: string, id: number, entity: any) {
		var entityStore = ensureObject(entityStores, type);
		if (entityStore) {
			var dbEntity = Object.assign({}, entity);
			entityStore[id] = dbEntity;
			return true;
		}
		return false;
	}

	export function remove(type: string, id: number) {
		var entityStore = entityStores[type];
		if (entityStore && entityStore[id]) {
			delete entityStore[id];
			return true;
		}
		return false;
	}

	export function first(type: string, criteria: Criteria) {
		criteria = Object.assign({}, criteria, { limit: 1 });
		var ls = list(type, criteria);
		return (ls && ls.length > 0) ? ls[0] : null;
	}

	export function list(type: string, criteria: Criteria) {
		var tmpList = [], list;
		var entityStore = entityStores[type];

		if (entityStore) {
			var item;

			// get the eventual filters
			var filters = (criteria && criteria.filter) ? criteria.filter : null;
			if (filters) {
				// make sure it is an array of filter
				filters = (filters instanceof Array) ? filters : [filters];
			}


			// first, we go through the store to build the first list
			// NOTE: Here we do the filter here because we have to build the list anyway. 
			//       If we had the list as storage, we will sort first, and then, filter
			for (var k in entityStore) {
				item = entityStore[k];
				// add it to the list if no filters or it passes the filters
				if (!filters || passFilter(item, filters)) {
					tmpList.push(item);
				}
			}

			// TODO: implement the sorting
			// get the eventual orgerBy
			// var orderBy = (opts && opts.orderBy)?opts.orderBy:null;
			// tmpList.sort...

			// extract the eventual offset, limit from the opts, or set the default
			var offset = (criteria && criteria.offset) ? criteria.offset : 0;
			var limit = (criteria && criteria.limit) ? criteria.limit : -1; // -1 means no limit

			// Set the "lastIndex + 1" for the for loop
			var l = (limit !== -1) ? (offset + limit) : tmpList.length;
			// make sure the l is maxed out by the tmpList.length
			l = (l > tmpList.length) ? tmpList.length : l;

			list = [];
			for (var i = offset; i < l; i++) {
				list.push(Object.assign({}, tmpList[i]));
			}

		}
		return list;
	}

};
// --------- /Local Mock Store --------- //



function ensureObject(root: any, name: string) {
	var obj = root[name];
	if (!obj) {
		obj = new Map();
		root[name] = obj;
	}
	return obj;
}


var filterDefaultOp = "=";

// Important: filters must be an array
function passFilter(item: any, filters: any) {

	var pass;

	// each condition in a filter are OR, so, first match we can break out.
	// A condition item is a js object, and each property is a AND
	var i = 0, l = filters.length, cond, k, v, propName, op, itemV;
	for (; i < l; i++) {
		pass = true;

		cond = filters[i];
		for (k in cond) {
			// TODO: For now, just support the simple case where key is the property name
			//       Will need to add support for the operator in the key name
			propName = k;
			op = filterDefaultOp; // TODO: will need to get it for key

			// value to match
			v = cond[k];

			// item value
			itemV = item[propName];


			switch (op) {
				case "=":
					// special case if v is null (need to test undefined)
					if (v === null) {
						pass = pass && (itemV == null);
					} else {
						pass = pass && (v === itemV);
					}

					break;
			}

			// if one fail, break at false, since within an object, we have AND
			if (!pass) {
				break;
			}
		}

		// if one of those condition pass, we can return true since within the top filter array we have OR.
		if (pass) {
			break;
		}
	}

	return pass;
}
