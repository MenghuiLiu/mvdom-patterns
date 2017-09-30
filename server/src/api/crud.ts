import { RouteConfiguration, Request, ReplyNoContinue } from 'hapi';

import { entityStore } from '../store/file-store';

const baseURI = "/api";



// --------- Usage APIs --------- //
export const routes: RouteConfiguration[] = [];

// list all entities
routes.push({
	method: 'GET',
	path: baseURI + "/crud/{type}",
	handler: async function (request: Request, reply: ReplyNoContinue) {
		const type = request.params.type;

		// TODO: need to support filters. 

		const list = await entityStore.list(type);
		reply({ data: list });
	}
});

// get an entity
routes.push({
	method: 'GET',
	path: baseURI + "/crud/{type}/{id}",
	handler: async function (request: Request, reply: ReplyNoContinue) {
		const type = request.params.type;
		const id = parseInt(request.params.id);

		const entity = await entityStore.get(type, id);

		if (entity == null) {
			throw new Error(`Cannot get entity ${type} of id ${id}`);
		}

		reply({ data: entity });
	}
});


// create new entity
routes.push({
	method: 'POST',
	path: baseURI + "/crud/{type}",
	handler: async function (request: Request, reply: ReplyNoContinue) {

		// get the values from the request
		const type = request.params.type;
		const requestData = (request.payload) ? request.payload.data : null;

		// asserts params
		if (requestData == null) {
			throw new Error(`request to POST ${request.path} does not have any payload or data`);
		}

		// create the entity
		const entityCreated = await entityStore.create(type, requestData);

		reply({ data: entityCreated });
	}
});

// update entity
routes.push({
	method: 'PATCH',
	path: baseURI + "/crud/{type}/{id}",
	handler: async function (request: Request, reply: ReplyNoContinue) {
		// get the values from the request
		const type = request.params.type;
		const requestData = (request.payload) ? request.payload.data : null;
		const id = parseInt(request.params.id);

		// asserts params
		if (requestData == null) {
			throw new Error(`request to PATCH ${request.path} does not have any payload or data`);
		}

		// remove the entity type
		const r = await entityStore.update(type, id, requestData);

		reply({ data: r });
	}
});

// delete an entity
routes.push({
	method: 'DELETE',
	path: baseURI + "/crud/{type}/{id}",
	handler: async function (request: Request, reply: ReplyNoContinue) {

		// get the values from the request
		const type = request.params.type;
		const id = parseInt(request.params.id);

		// remove the entity type
		const r = await entityStore.remove(type, id);

		reply({ data: r });
	}
});


// --------- /Usage APIs --------- //

