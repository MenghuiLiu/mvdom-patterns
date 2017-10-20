import { entityStore } from 'common/mem-store'; // in test file, for now, those this need be relative
import { join } from 'path';
import { remove, readJson } from 'fs-extra';
import { dataDir } from 'conf'; // works before mocked
import { resolve } from 'path';
import * as assert from 'assert';

describe('test-entity-join', function () {

	before(async () => {
		// prepare the data
		const project0 = await entityStore.create('project', { name: 'project 0' });
		const ticketA = await entityStore.create('ticket', { name: 'ticket A', projectId: project0.id });
		const ticketB = await entityStore.create('ticket', { name: 'ticket B', projectId: project0.id });

		const project1 = await entityStore.create('project', { name: 'project 1' });
		const ticketC = await entityStore.create('ticket', { name: 'ticket A', projectId: project1.id });
		const ticketD = await entityStore.create('ticket', { name: 'ticket B', projectId: project1.id });
	})

	it('simple-entity-join', async function () {

		// get all of the ticket with projectId
		const all = await entityStore.list('ticket', { filter: { projectId: 1 }, entityJoin: ['project'] });
		assert.equal('project 1', all[0].project.name);
		assert.equal('project 1', all[1].project.name);
		// console.log(JSON.stringify(all, null, '  '));
	});

	it('simple-property-join', async function () {

		// get all of the ticket with projectId
		const all = await entityStore.list('ticket', {
			filter: { projectId: 1 },
			propertyJoin: {
				'project': ['name']
			}
		});


		assert.equal('project 1', all[0].projectName);
		assert.equal('project 1', all[1].projectName);
		// console.log(JSON.stringify(all, null, '  '))
	});

});