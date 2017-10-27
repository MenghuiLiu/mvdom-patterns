
import { EntityStore } from 'common/entity-store';

export async function createTestDataSet(entityStore: EntityStore) {
	const user0 = (await entityStore.create('User', { name: 'user 0', email: 'user.0@mail.com' })).data;
	const user1 = (await entityStore.create('User', { name: 'user 1', email: 'user.1@mail.com' })).data;

	// prepare the data
	const project0 = (await entityStore.create('Project', { name: 'project 0' })).data;
	const ticketA = await entityStore.create('Ticket', { name: 'ticket A', assigneeId: user0.id, projectId: project0.id });
	const ticketB = await entityStore.create('Ticket', { name: 'ticket B', assigneeId: user0.id, projectId: project0.id });

	const project1 = (await entityStore.create('Project', { name: 'project 1' })).data;
	const ticketC = await entityStore.create('Ticket', { name: 'ticket C', assigneeId: user1.id, projectId: project1.id });
	const ticketD = await entityStore.create('Ticket', { name: 'ticket D', assigneeId: user1.id, projectId: project1.id });
}