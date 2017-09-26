/**
 * Simple "singleton" scheduler service that allows to add/remove some function to be called
 * periodically and have the data published. 
 **/

var nsSeq = 0;

// default options
var defaultOpts = {
	delay: 2 // delay in second
};

// Start with the default options
var opts = Object.assign({}, defaultOpts);

var schedulesByNs: { [name: string]: Schedule[] | null } = {};

export module scheduler {

	/** Add a new schedule */
	export function add(schedule: Schedule) {
		// make sure we copy the schedule (so that we do not change the original copy)
		schedule = Object.assign({}, schedule);

		// make sure we have a ns
		schedule.ns = (schedule.ns) ? schedule.ns : "sch_ns_" + (nsSeq++);

		var schedules = schedulesByNs[schedule.ns];
		if (!schedules) {
			schedulesByNs[schedule.ns] = schedules = [];
		}

		schedules.push(schedule);

		run(schedule);

		return schedule.ns;
	}

	/** Turn off and remove one of more schedule by their namespace.*/
	export function remove(ns: string) {
		var schedules = schedulesByNs[ns];

		if (schedules) {
			schedules.forEach(function (schedule) {
				schedule.off = true;
			});
		}

		delete schedulesByNs[ns];
	}

}


declare interface Schedule {
	/** Will be called with the optional "ctx". Must return a Promise. */
	performFn(): Promise<any>;
	/** Will be called on each processFun completion. */
	receiveFn(performData: any): void;
	/** Optional namespace to remove this (or more) schedule having the same name space. A unique ns will be returned if not provided. */
	ns?: string;
	/** The context (i.e. this) that processFun and receiveFun will be called. */
	ctx?: any;
	/** This get set to true to turn off a scheduler (by remove, or eventual stop/pause methods not implemented yet) */
	off?: boolean;
}


function run(schedule: Schedule) {
	if (!schedule.off) {
		setTimeout(function () {
			if (!schedule.off) {
				var ctx = schedule.ctx || null;

				//console.log("scheduler.run", schedule);
				schedule.performFn.call(ctx).then((data: any) => {
					schedule.receiveFn.call(ctx, data);
					run(schedule);
				});
			}
		}, opts.delay * 1000);
	}
}