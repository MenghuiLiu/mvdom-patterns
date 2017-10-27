import { entityStore } from 'store/file-store';
import { join } from 'path';
import { remove, readJson } from 'fs-extra';
import { dataDir } from 'conf'; // in test, this will resolve to _test/mock/conf.ts
import { resolve } from 'path';
import { createTestDataSet } from './utils';
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

		await createTestDataSet(entityStore);
	})


	it('file-store-create', async function () {
		let entityData = { name: 'test-name-01', lastName: 'test-lastName-01' };
		let entityCreated = (await entityStore.create('User', entityData)).data;

		let entityFromStore = (await entityStore.get('User', entityCreated.id)).data;

		// both object should have the same properties
		assert.deepStrictEqual(entityFromStore, entityCreated);

		// but instance should not be equal
		assert.notEqual(entityFromStore, entityCreated);
	});

});


