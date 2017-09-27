import { entityManager } from 'store/file-store'; // in test file, for now, those this need be relative
import { join } from 'path';
import { remove, readJson } from 'fs-extra';
import { dataDir } from 'conf'; // works before mocked
import { resolve } from 'path';
import * as assert from 'assert';

describe('test-file-store', function () {

	before(async () => {
		let dir = resolve(dataDir);

		// always do a fail safe when calling remove, even if not full proof
		if (dir.includes("mvdom-patterns")) {
			await remove(dir);
		} else {
			throw new Error(`Directory not seems to be safe to remove: ${dir}`);
		}

	})

	it('create', async function () {
		// create the entity
		let entityData = { name: "test-name-01", lastName: "test-lastName-01" };
		let newEntity = await entityManager.create("user", entityData);

		// check that data != than new entity
		assert.notEqual(newEntity, entityData, "entity created should not be same instance as entityData");

		// read from the store
		let userStore = await readJson(join(dataDir, "user.json"));

		// both object properties should be equal
		assert.deepStrictEqual(userStore[newEntity.id!], newEntity);
		// but the object instance should be different
		assert.notEqual(userStore[newEntity.id!], newEntity);
	});

	it('create-and-get', async function () {
		let entityData = { name: "test-name-02", lastName: "test-lastName-02" };
		let entityCreated = await entityManager.create("user", entityData);
		let entityFromStore = await entityManager.get("user", entityCreated.id!);

		// both object should have the same properties
		assert.deepStrictEqual(entityFromStore, entityCreated);

		// but instance should not be equal
		assert.notEqual(entityFromStore, entityCreated);
	})

});