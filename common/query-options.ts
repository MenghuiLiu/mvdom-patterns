/** 
 * A filter describe a set of considition that needs to be met where the
 * name is the "propName[;operation]" and the value is the value to be compared. 
 * All name:value in a Filter need to be met. For example
 *  - `{"projectId": 123} will select entities with projectId == 123 (default operation is =)
 *  - `{"stage;>": 1}` will select entity with stage > 1
 *  - `{"stage;>": 1, "projectId": 123}: will select entities from projectId 123 AND stage > 1
 *  - `[{"projectId", 123}, {""}]
 **/
export type Filter = { [name: string]: string | number | boolean | null };

/**
 * The property name to join, by entity type name. 
 * For example, `propertyJoin: {project: ['name']}` will create the appropriate `.projectName` for any entity that have the corresponding
 * `.projectId`
 */
type PropertyJoin = { [entityType: string]: string[] };

/** QueryOptions used to select and order an entity query. Used dso.first and dso.list */
export interface QueryOptions {
	/** The offset where  */
	offset?: number,
	/** The limit of element to be returned */
	limit?: number,

	/** See type Filter and Filters */
	filter?: Filter | Filter[] | null,


	/** 
	 * NOT IMPLEMENTED YET: a comma delimited of properties to be sorted by. For example: 
	 * - "title": order by .title asc
	 * - "!title": order by .title desc
	 * - "projectId, !id": order by projectId asc and id desc
	 */
	orderBy?: string;

	entityJoin?: string[];

	propertyJoin?: PropertyJoin;
}