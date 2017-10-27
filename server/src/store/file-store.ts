import { DocEntityStore, EntityDoc } from "common/doc-store";
import * as fs from 'fs-extra-plus';
import * as path from 'path';
import { dataDir } from 'conf';


class FileEntityStore extends DocEntityStore {
	constructor() {
		super({ read, readWrite });
	}
}


/**
 * The file-entity-store is a simple file based entity store. 
 * It store each enity type in its own json, and assume `.id: number` as identifier. 
 */
export const entityStore = new FileEntityStore();


async function readWrite(entityType: string, beforeWrite: (entityStore: EntityDoc) => Promise<any>) {

	// TODO: need to do a filelock or queue

	let entityStore = await read(entityType);
	let r = await beforeWrite(entityStore);
	await writeEntityStore(entityType, entityStore);

	return r;
}

// --------- FileStore Load & Write --------- //
/** Load the json of an entity file. 
 * @returns resolve to the js object of the json file (if exists), or empty object.
 */
async function read(entityType: string): Promise<EntityDoc> {
	const file = entityFile(entityType);
	let jsonObj = null;

	if (await fs.pathExists(file)) {
		return await fs.readJson(file);
	} else {
		return DocEntityStore.newEntityDoc();
	}
}

/** Save the entity store for a given entity type */
async function writeEntityStore(entityType: string, entityStore: EntityDoc) {
	const file = entityFile(entityType);
	const dir = path.dirname(file);

	if (!(await fs.pathExists(dir))) {
		await fs.mkdirs(dir);
	}
	await fs.writeJson(file, entityStore, { spaces: 2 });
}

/** Return the entity file path for an entityName */
function entityFile(entityTypeName: string) {
	return path.join(dataDir, entityTypeName + ".json");
}
// --------- /FileStore Load & Write --------- //