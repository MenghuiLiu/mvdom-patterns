import { createTestDataSet } from './utils';
import { entityStore } from 'common/mem-store';
import * as assert from 'assert';

describe('test-mem-store', function () {

	before(async () => {
		await createTestDataSet(entityStore);
	});

	it('mem-store-get', async function () {
		// Simple test for the user and project

		const user0 = (await entityStore.get('User', 0)).data;
		assert.equal('user 0', user0.name);

		const project1 = (await entityStore.get('Project', 1)).data;
		assert.equal('project 1', project1.name);
	});

	it('mem-store-list', async function () {
		// test simple list with simple filter
		const list = (await entityStore.list('Ticket', { filter: { projectId: 1 } })).data;
		for (const ticket of list) {
			assert.equal(1, ticket.projectId);
		}
	});

	it('mem-store-update', async function () {
		const new_ticket_name = 'ticket A (updated)';

		// test simple upate
		const updatedTicket = (await entityStore.update('Ticket', 0, { name: new_ticket_name })).data;

		assert.equal(updatedTicket.name, new_ticket_name);
	});

	it('mem-store-first', async function () {

		// test simple upate
		const firstTicket = (await entityStore.first('Ticket', { filter: { projectId: 1 } })).data!;

		assert.equal(firstTicket.name, "ticket C");
	});

	it('mem-store-remove', async function () {

		// remove the first ticket
		const didRemove = await entityStore.remove('Ticket', 0);

		// list the tickets for project 0
		const tickets = (await entityStore.list('Ticket', { filter: { projectId: 0 } })).data!;

		// check that we have only one left
		assert.equal(tickets.length, 1);
		assert.equal(1, tickets[0].id);
	});


});
