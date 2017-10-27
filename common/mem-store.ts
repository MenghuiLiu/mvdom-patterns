import { DocEntityStore, EntityDoc } from "common/doc-store";

const stores: { [type: string]: EntityDoc } = {};


class MemEntityStore extends DocEntityStore {
	constructor() {
		super({ read, readWrite })
	}
}

// export one instance (effectively, a "singleton")
export const entityStore = new MemEntityStore();


async function readWrite(entityType: string, beforeWrite: (entityStore: EntityDoc) => Promise<any>) {
	let entityStore = await read(entityType);
	let r = await beforeWrite(entityStore);
	stores[entityType] = entityStore;
	return r;
}

function read(entityType: string): Promise<EntityDoc> {
	return new Promise(function (resolve) {
		var store = stores[entityType];
		resolve(store || DocEntityStore.newEntityDoc());
	})
}