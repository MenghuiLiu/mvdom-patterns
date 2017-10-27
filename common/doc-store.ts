import { ensureArray } from './utils';
import { EntityStore, AnyEntity, ResultEntity, ResultList, ResultMaybeEntity, Rel, EntityDic } from './entity-store';
import { QueryOptions, JoinOptions, Filter, PropertyJoin, EntityJoin } from './query-options';

/**
 * This module expose the DocEntityStore class which implement the common (i.e. 90%) of the EntityStore 
 * logic for document (i.e. EntityDoc) based EntityStore. 
 * When implemented by a Memory Entity Store, the "document" will be in memory, and when implemented by 
 * a FileEntityStore, there will be one .json file per EntityDoc (per entity type)
 */

const defaultResultFormat = 'graph';

export type EntityDoc = {
	seq: number;
	entities: { [id: number]: AnyEntity }
};

/** Interface that read and write a EntityDictionary to storage. 
 * A file-store will read/write to file, a mem-store will get/set to a js object.
 */
export interface StoreRW {
	read(entityTypeName: string): Promise<EntityDoc>;
	readWrite(entityTypeName: string, beforeWrite: BeforeWrite): Promise<any>;
}

/** Interface of the methods to be called by StoreRW implement  */
export type BeforeWrite = (entityStore: EntityDoc) => Promise<any>;


export class DocEntityStore implements EntityStore {
	private storeProvider: StoreRW;

	constructor(storeProvider: StoreRW) {
		this.storeProvider = storeProvider;
	}

	static newEntityDoc(): EntityDoc {
		return {
			seq: -1,
			entities: {}
		}
	}

	// --------- EntityStore Interface Implementation --------- //
	async create(type: string, entityData: object): Promise<ResultEntity> {
		// Here we need to have a readWrite lock, to make it atomic (prevent other concurrent access because of nio to intermingle)
		return this.storeProvider.readWrite(type, async (entityStore: EntityDoc) => {
			// get the next sequence id
			const id = nextSeq(entityStore);

			// make a shallow copy of
			const newEntity = { ...entityData, ...{ id } };

			// add it to the store. 
			entityStore.entities[id] = newEntity;

			const data = { ...newEntity };
			return { data };
		});
	}

	async update(type: string, id: number, entityData: object): Promise<ResultEntity> {
		// Here we need to have a readWrite lock, to make it atomic (prevent other concurrent access because of nio to intermingle)
		return this.storeProvider.readWrite(type, async (entityStore: EntityDoc) => {
			let entity = entityStore.entities[id];
			if (entity == null) {
				throw new Error(`Can't update entity of type ${type} with id ${id} because it was not found`);
			}
			let updatedEntity = { ...entity, ...entityData } as AnyEntity;

			entityStore.entities[id] = updatedEntity;

			const data = { ...updatedEntity };

			return { data };
		});
	}

	// TODO: add the joinOptions
	async get(type: string, id: number, joinOptions?: JoinOptions): Promise<ResultEntity> {
		// TODO: needs to do the joins
		const format = 'graph';

		// Get the entity store for this entity type
		let entityStore = await this.storeProvider.read(type);

		// get and shallow clone the entity
		const entity: AnyEntity | null = (entityStore) ? entityStore.entities[id] as AnyEntity : null;

		if (entity == null) {
			throw new Error(`Cannot find entity ${type}.${id}`);
		} else {
			const data = { ...entity };
			return { format, data };
		}
	}

	async first(type: string, opts?: QueryOptions): Promise<ResultMaybeEntity> {
		const format = (opts && opts.resultFormat) ? opts.resultFormat : defaultResultFormat;

		opts = Object.assign({}, opts, { limit: 1 });
		const list = (await this.list(type, opts)).data;

		const data = (list && list.length > 0) ? list[0] : null;

		return { format, data };
	}

	async list(type: string, opts?: QueryOptions): Promise<ResultList> {
		const format = (opts && opts.resultFormat) ? opts.resultFormat : defaultResultFormat;

		let tmpList: AnyEntity[] = [], list: AnyEntity[];

		let entityStore = await this.storeProvider.read(type);

		let item;

		// get the eventual filters
		let filters = (opts && opts.filter) ? opts.filter : null;
		if (filters) {
			// make sure it is an array of filter
			filters = (filters instanceof Array) ? filters : [filters];
		}


		// first, we go through the store to build the first list
		// NOTE: Here we do the filter here because we have to build the list anyway. 
		//       If we had the list as storage, we will sort first, and then, filter
		for (let k in entityStore.entities) {
			item = entityStore.entities[k] as AnyEntity;
			// add it to the list if no filters or it passes the filters
			if (!filters || passFilter(item, filters)) {
				tmpList.push(item);
			}
		}

		// TODO: implement the sorting
		// get the eventual orgerBy
		// let orderBy = (opts && opts.orderBy)?opts.orderBy:null;
		// tmpList.sort...

		// extract the eventual offset, limit from the opts, or set the default
		let offset = (opts && opts.offset) ? opts.offset : 0;
		let limit = (opts && opts.limit) ? opts.limit : -1; // -1 means no limit

		// Set the "lastIndex + 1" for the for loop
		let l = (limit !== -1) ? (offset + limit) : tmpList.length;
		// make sure the l is maxed out by the tmpList.length
		l = (l > tmpList.length) ? tmpList.length : l;

		// we build the final list (clone each object)
		list = [];
		for (let i = offset; i < l; i++) {
			list.push(Object.assign({}, tmpList[i]));
		}

		// --------- Entity Join --------- //
		// do the eventual join
		const entityJoinProcessed = (opts != null && opts.entityJoin) ? processEntityJoin(opts.entityJoin) : null;

		const rel: Rel | null = (format === 'rel') ? {} : null;
		if (entityJoinProcessed) { // array of entityTypeName to join

			for (const entityTypeToJoin in entityJoinProcessed) {
				// get the entity store for the enityToJoin
				const entityToJoinStore = await this.storeProvider.read(entityTypeToJoin);

				// get the properties to join	(those are the name without the 'Id' suffix)
				const entityProperties = entityJoinProcessed[entityTypeToJoin];

				let entityDic: EntityDic | null = null;

				if (rel) {
					rel[entityTypeToJoin] = entityDic = {};
				}

				// for all entity in the result list, we check if we have a 'entitytojoinId` property
				for (const entity of list) {
					for (const propName of entityProperties) {
						const propNameId = propName + 'Id';
						const joinId: number = entity[propNameId];
						if (joinId != null) {
							const joinedEntity: AnyEntity = entityToJoinStore.entities[joinId];

							if (entityDic) {
								entityDic['' + joinedEntity.id] = joinedEntity;
							} else {
								entity[propName] = { ...joinedEntity }; // we clone to be safe (TODO: will need to do deep clone)
							}
						}
					}

				}
			}
		}
		// --------- /Entity Join --------- //

		// --------- Property Join --------- //
		// do the eventual join
		const propertyJoinProcessed = (opts != null && opts.propertyJoin) ? processPropertyJoin(opts.propertyJoin) : null;

		if (propertyJoinProcessed) { // { [entityType: string]: propertyNames[] }

			for (const entityTypeToJoin in propertyJoinProcessed) {

				// get the entity store for the enityToJoin
				const entityToJoinStore = await this.storeProvider.read(entityTypeToJoin);

				// this make sure the entity name is lower case, e.g., Project' -> 'project'
				const entityToJoinPropertyPrefix = lowerCaseFirst(entityTypeToJoin);

				// list all of the property names to join, and make the corresponding array of the names that will be added to each entity. 
				// e.g., ['name'] and ['projectName']
				const joinInfos = propertyJoinProcessed[entityTypeToJoin]; // this is the 'name'

				for (const joinInfo of joinInfos) {
					const entityPropertyIdName = joinInfo.propBase + 'Id';
					const entityPropertyName = joinInfo.propBase + upperCaseFirst(joinInfo.joinProp);

					// now that we prepared the data, we can go through the list of items and add the joined properties
					for (const entity of list) {
						const joinId: number = entity[entityPropertyIdName];
						if (joinId != null) {
							const joinedEntity: any = entityToJoinStore.entities[joinId];
							entity[entityPropertyName] = joinedEntity[joinInfo.joinProp];
						}
					}
				}
			}
		}
		// --------- /Property Join --------- //

		const data = list;
		const resultList: any = { format, data };

		if (rel) {
			resultList.rel = rel
		}

		return resultList;
	}

	async remove(type: string, id: number): Promise<boolean> {
		// Here we need to have a readWrite lock, to make it atomic (prevent other concurrent access because of nio to intermingle)
		return this.storeProvider.readWrite(type, async (entityStore: EntityDoc) => {
			if (id != null && entityStore.entities[id] != null) {
				delete entityStore.entities[id];
				return true;
			} else {
				return true;
			}
		});
	}

	// --------- /EntityStore Interface Implementation --------- //
}



// --------- Join utils --------- //

type EntityJoinProcessed = { [entityType: string]: string | string[] };

/** Restructure the join instruction by Joined EntityType to faciliate join operations */
function processEntityJoin(entityJoin: EntityJoin): EntityJoinProcessed {
	const entityJoinProcessed: any = {};

	for (const propName in entityJoin) {
		const entityType = entityJoin[propName];
		let propNames = entityJoinProcessed[entityType];
		if (propNames == null) {
			propNames = [];
			entityJoinProcessed[entityType] = propNames;
		}
		propNames.push(propName);
	}

	return entityJoinProcessed;
}

type PropertyJoinProcessed = { [entityType: string]: { propBase: string, joinProp: string, joinEntity: string }[] };

/** Restructure join instruction by entity type */
function processPropertyJoin(propertyJoin: PropertyJoin): PropertyJoinProcessed {
	const propertyJoinProcessed: any = {};

	for (const propBase in propertyJoin) {
		const vals = ensureArray(propertyJoin[propBase]);
		for (const val of vals) {
			const [joinEntity, joinProp] = val.split('.');
			let joinInfos = propertyJoinProcessed[joinEntity];
			if (joinInfos == null) {
				joinInfos = [];
				propertyJoinProcessed[joinEntity] = joinInfos;
			}
			joinInfos.push({ propBase, joinProp, joinEntity });
		}
	}

	return propertyJoinProcessed;
}

// --------- /Join utils --------- //

// --------- Utils --------- //

/** Upper case the property name ('projectMain' becomes 'ProjectMain') */
function upperCaseFirst(s: string) {
	return s[0].toUpperCase() + s.slice(1);
}

/** Lower case first char ('ProjectMain' becomes 'projectMain') */
function lowerCaseFirst(s: string) {
	return s[0].toLowerCase() + s.slice(1);
}


/** Return the next sequence number (+1 of the max) */
// TODO: Will need to make it more efficient by caching the max the first time, and then, just increment it (since everything go through the same code)
//       For now, we do it save. 
function nextSeq(entityDoc: EntityDoc) {
	return ++entityDoc.seq;
}

function ensureObject(root: any, name: string) {
	let obj = root[name];
	if (!obj) {
		obj = new Map();
		root[name] = obj;
	}
	return obj;
}


let filterDefaultOp = "=";

// Important: filters must be an array
function passFilter(item: any, filters: Filter[]) {

	let pass;

	// each condition in a filter are OR, so, first match we can break out.
	// A condition item is a js object, and each property is a AND
	let i = 0, l = filters.length, cond, k, v, propName, op, itemV;
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
// --------- /Utils --------- //