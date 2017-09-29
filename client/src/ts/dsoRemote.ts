import { hub } from 'mvdom';
import { Dso, BaseEntity } from './ds';
import { Criteria } from 'common/criteria';
import { get, post, delet } from './ajax';
import { entityMemManager } from './mem-store';

/**
 * InMemory (browser) implementation of the DataService ("ds"). 
 * 
 * - Use this during initial development or proof of concepts that cannot have server persistence.
 * 
 * - All APIs respect the "ds" async contract (return Promise) so that changing 
 * 		to the dsAjax.js would be completely transparent.
 **/

export class DsoRemote<E extends BaseEntity> implements Dso<E>{
	private _type: string;

	constructor(type: string) {
		this._type = type;
	}

	create(entity: E): Promise<E> {
		return post(`api/crud/${this._type}`, { data: entity }).then((result) => {
			console.log("result", result);
			return result.data as E;
		});
	}

	update(id: number, entity: E): Promise<E> {
		return entityMemManager.update(this._type, id, entity).then((updatedEntity) => {
			hub('dataHub').pub(this._type, 'update', updatedEntity);

			return updatedEntity as E;
		});
	}

	get(id: number): Promise<E> {
		return entityMemManager.get(this._type, id) as Promise<E>;
	};

	list(criteria: Criteria): Promise<E[]> {
		return entityMemManager.list(this._type, criteria) as Promise<E[]>;
	};

	first(criteria: Criteria): Promise<E | null> {
		return entityMemManager.first(this._type, criteria) as Promise<E | null>;
	};

	remove(id: number): Promise<boolean> {
		return entityMemManager.remove(this._type, id).then((result) => {
			hub("dataHub").pub(this._type, "delete", id);
			return result;
		})
	};
}


