import { RouteConfiguration, Request, ReplyNoContinue } from 'hapi';
import { jsonDecode } from 'utils';
import { QueryOptions } from 'common/query-options';

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

		let queryOptions = jsonDecode(request.query.queryOptions) as QueryOptions | null;

		const resultList = await entityStore.list(type, queryOptions);

		reply(resultList);
	}
});

// get an entity
routes.push({
	method: 'GET',
	path: baseURI + "/crud/{type}/{id}",
	handler: async function (request: Request, reply: ReplyNoContinue) {
		const type = request.params.type;
		const id = parseInt(request.params.id);

		const entityResult = await entityStore.get(type, id);

		reply(entityResult);
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
		const entityResult = await entityStore.create(type, requestData);
		reply(entityResult);
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

		reply(r);
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

		reply(r);
	}
});


// --------- /Usage APIs --------- //

