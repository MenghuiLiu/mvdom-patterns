import { RouteConfiguration, Request, ReplyNoContinue } from 'hapi';

// This is just a fake os-top so that we can have it cross platform. This could be the mock of a real os-top
import { memStat, cpuStat, processes, CpuStat, MemStat, Process } from './fake-top';


const baseURI = "/api";


// --------- Usage APIs --------- //
export const routes: RouteConfiguration[] = [];

routes.push({
	method: 'GET',
	path: baseURI + "/cpuUsage",
	handler: async function (request: Request, reply: ReplyNoContinue) {
		touchLastRequested();
		reply(cpuStats);
	}
});

routes.push({
	method: 'GET',
	path: baseURI + "/topCpuProcs",
	handler: function (request: Request, reply: ReplyNoContinue) {
		touchLastRequested();
		reply(procs);
	}
});

routes.push({
	method: 'GET',
	path: baseURI + "/memUsage",
	handler: function (request: Request, reply: ReplyNoContinue) {
		touchLastRequested();
		reply(memStats);
	}
});

routes.push({
	method: 'GET',
	path: baseURI + "/topMemProcs",
	handler: function (request: Request, reply: ReplyNoContinue) {
		touchLastRequested();
		reply(procs);
	}
});
// --------- /Usage APIs --------- //


// --------- Data Capture --------- //
var lastRequestedMs: number | null = null;
var maxIdle = 3000; // time to stop the fetch if nobody is requesting the data

var arrayLimit = 10;
var delay = 1000; // delay in beteween top.fetch

var cpuStats: CpuStat[] = [];
var memStats: MemStat[] = [];
var procs: Process[] = [];

var on = false;


// the lastRequestedMs scheme allow to run the expensive Top command every delay only if it is being requested.
function touchLastRequested() {
	lastRequestedMs = new Date().getTime();

	// if it was not running, we run it
	if (!on) {
		on = true;
		console.log("os-usage.js - starting top.fetch every " + (delay / 1000) + "s");
		topFetch();
	}
}

async function topFetch() {
	var nowMs = new Date().getTime();

	// if the lastRequested was > than maxIdel, then, we pause the loop
	if (lastRequestedMs == null || (nowMs - lastRequestedMs) > maxIdle) {
		on = false;
		console.log("os-usage.js - stopping topFetch");
		return;
	}

	try {

		// we update the local data
		_addData(cpuStats, await cpuStat());
		_addData(memStats, await memStat());
		procs = await processes();

		// we wait
		await wait(delay);

		// we fetch again
		topFetch();

	} catch (ex) {
		console.log("FAIL - top.fetch - " + ex);
	}
}


// private function that add an new data item to its list, add time, max the list at usageLimit 
function _addData<T>(list: T[], data: T & { time?: number }) {
	const nowMs = new Date().getTime();

	data.time = nowMs;
	list.push(data);

	if (list.length > arrayLimit) {
		list.splice(0, 1);
	}
}


// --------- /Data Capture --------- //

async function wait(ms: number) {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), ms);
	})
}