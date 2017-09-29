import { RouteConfiguration, Request, ReplyNoContinue } from 'hapi';

import { entityStore } from '../store/file-store';

const baseURI = "/api";



// --------- Usage APIs --------- //
export const routes: RouteConfiguration[] = [];

routes.push({
	method: 'GET',
	path: baseURI + "/crud/{type}",
	handler: async function (request: Request, reply: ReplyNoContinue) {
		console.log(request.path, request.params['type'], request.params['data'])
		reply({ data: { id: 1, subject: 'fake one' } });
	}
});

routes.push({
	method: 'POST',
	path: baseURI + "/crud/{type}",
	handler: async function (request: Request, reply: ReplyNoContinue) {
		// get the values from the request
		const type = request.params.type;
		const requestData = (request.payload) ? request.payload.data : null;

		// assert that we have the right call
		if (requestData == null) {
			throw new Error(`request to POST ${request.path} does not have any payload or data`);
		}

		// ceate
		const entityCreated = await entityStore.create(type, requestData);

		console.log("crud POST on entity", type, 'with data', requestData, 'created', entityCreated, 'path', request.path);

		reply({ data: entityCreated });
	}
});
// --------- /Usage APIs --------- //

