import { entityStore } from 'common/mem-store'; // in test file, for now, those this need be relative
import { join } from 'path';
import { remove, readJson } from 'fs-extra';
import { dataDir } from 'conf'; // this will be mocked by _test/mock/_setup.js
import { resolve } from 'path';
import * as assert from 'assert';

describe("test-entity-join", function () {

	before(async () => {
		const user0 = (await entityStore.create('User', { name: 'user 0', email: 'user.0@mail.com' })).data;
		const user1 = (await entityStore.create('User', { name: 'user 1', email: 'user.1@mail.com' })).data;

		// prepare the data
		const project0 = (await entityStore.create('Project', { name: 'project 0' })).data;
		const ticketA = await entityStore.create('Ticket', { name: 'ticket A', assigneeId: user0.id, projectId: project0.id });
		const ticketB = await entityStore.create('Ticket', { name: 'ticket B', assigneeId: user0.id, projectId: project0.id });

		const project1 = (await entityStore.create('Project', { name: 'project 1' })).data;
		const ticketC = await entityStore.create('Ticket', { name: 'ticket C', assigneeId: user1.id, projectId: project1.id });
		const ticketD = await entityStore.create('Ticket', { name: 'ticket D', assigneeId: user1.id, projectId: project1.id });
	})

	it('entity-join-graph', async function () {

		// get all of the ticket with projectId
		const resultList = await entityStore.list('Ticket', {
			filter: { projectId: 1 },
			entityJoin: {
				project: 'Project',
				assignee: 'User'
			}
		});

		// console.log(JSON.stringify(resultList, null, '  '));

		const entities = resultList.data;
		assert.equal(entities[0].project.name, 'project 1');
		assert.equal(entities[1].project.name, 'project 1');
		assert.equal(entities[1].assignee.name, 'user 1');
	});


	it('entity-join-rel', async function () {

		// get all of the ticket with projectId
		const resultList: any = await entityStore.list('Ticket', {
			filter: { projectId: 1 },
			entityJoin: {
				project: 'Project',
				owner: 'User',
				assignee: 'User'
			},
			resultFormat: 'rel'
		});

		const entities = resultList.data;

		// console.log(JSON.stringify(resultList, null, '  '));

		// Check that first entities are correct
		assert.equal(2, entities.length);
		assert.equal(entities[0].name, 'ticket C');

		// Check the rel
		assert.equal(resultList.rel['Project']['1'].name, 'project 1');
		assert.equal(resultList.rel['User']['1'].name, 'user 1');
	});

	it('property-join', async function () {

		// get all of the ticket with projectId
		const listResult = await entityStore.list('Ticket', {
			filter: { projectId: 1 },
			propertyJoin: {
				'project': 'Project.name',
				'assignee': ['User.name', 'User.email']
			}
		});

		const entities = listResult.data;

		// console.log(JSON.stringify(listResult, null, '  '))

		assert.equal(entities[0].projectName, 'project 1');
		assert.equal(entities[1].projectName, 'project 1');
		assert.equal(entities[0].assigneeName, 'user 1');
		assert.equal(entities[0].assigneeEmail, 'user.1@mail.com');
	});

});