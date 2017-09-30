import * as fs from 'fs-extra-plus';
import * as path from 'path';
import { dataDir } from 'conf';
import { Criteria } from 'common/criteria';
import { makeEntityStore, EntityStore, EntityDictionary } from '../../../common/entity-store';

/**
 * The file-entity-store is a simple file based entity store. 
 * It store each enity type in its own json, and assume `.id: number` as identifier. 
 */
export const entityStore: EntityStore = makeEntityStore({

	read: readEntityStore,

	readWrite: async (entityType: string, beforeWrite: (entityStore: EntityDictionary) => Promise<any>) => {
		// TODO: need to do a filelock or queue
		let entityStore = await readEntityStore(entityType);
		let r = await beforeWrite(entityStore);
		await writeEntityStore(entityType, entityStore);

		return r;
	}
});


// --------- FileStore Load & Write --------- //
/** Load the json of an entity file. 
 * @returns resolve to the js object of the json file (if exists), or empty object.
 */
async function readEntityStore(entityType: string): Promise<EntityDictionary> {
	const file = entityFile(entityType);
	let jsonObj = null;

	if (await fs.pathExists(file)) {
		return await fs.readJson(file);
	} else {
		return {};
	}
}

/** Save the entity store for a given entity type */
async function writeEntityStore(entityType: string, entityStore: EntityDictionary) {
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