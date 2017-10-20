import { makeEntityStore, EntityStore, EntityDictionary } from "common/entity-store";

const stores: { [type: string]: EntityDictionary } = {};


/** Make and export the entityStore */
export const entityStore: EntityStore = makeEntityStore({

	read: readEntityStore,

	readWrite: async function (entityType: string, beforeWrite: (entityStore: EntityDictionary) => Promise<any>) {
		let entityStore = await readEntityStore(entityType);
		let r = await beforeWrite(entityStore);
		stores[entityType] = entityStore;
		return r;
	}

});

function readEntityStore(entityType: string): Promise<EntityDictionary> {
	return new Promise(function (resolve) {
		var store = stores[entityType];
		resolve(store || {});
	})
}