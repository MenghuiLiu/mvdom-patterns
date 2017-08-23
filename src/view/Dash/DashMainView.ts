import { mvdom as d, BaseView } from "../../base";
import { ajax } from "../../js-app/ajax";
import { render } from "../../js-app/render";
import { scheduler } from "../../js-app/scheduler";
import { dic, guard } from "../../js-app/utils";
import { UsageChart } from "./UsageChart";
import { UsagePie } from "./UsagePie";


// --------- View Controller --------- //
class DashMainView extends BaseView{
	private _cpuPie?: UsagePie;
	private _memPie?: UsagePie;
	private _cpuChart?: UsageChart;
	private prevTopMemProcsDic: any;
	private prevTopCpuProcsDic: any;

	postDisplay(){
		// display the CPU PieChart
		var cpuPieCtnEl = d.first(this.el, ".cpu-card .metric .svg-ctn");
		cpuPieCtnEl = guard(cpuPieCtnEl, "Cannot find container HTMLElement for '.cpu-card .metric .svg-ctn'");
		this._cpuPie = new UsagePie(["sys", "user", "idle"], ["#F44336", "#2196F3", "#d9d9d9"])
			.init(cpuPieCtnEl)
			.update({ user: 50, sys: 50, idle: 50 });

		// diplays the CPUC Chart (lines)
		var cpuChartCtnEl = d.first(this.el, ".cpu-card .cpu-chart-ctn");
		cpuChartCtnEl = guard(cpuChartCtnEl, "Cannot find container HTMLElement for '.cpu-card .cpu-chart-ctn'")
		this._cpuChart = new UsageChart().init(cpuChartCtnEl, { xMax: 10, delay: 1900 });

		// displays the Mem PieChart
		var memPieCtnEl = d.first(this.el, ".mem-card .svg-ctn");
		memPieCtnEl = guard(memPieCtnEl, "Cannot find container HTMLElement for '.cpu-card .cpu-chart-ctn'")
		this._memPie = new UsagePie(["used", "unused"], ["#2196F3", "#4CAF50"])
			.init(memPieCtnEl)
			.update({ used: 50, unused: 50 });
	}

	destroy () {
		// For the manual scheduler, we must remove the schedule manually.
		// scheduler.remove(this.scheduleNs);
	}	

	// RECOMMENDED: Here we add the other schedule the view.schedules way which is managed by the scheduler-hook.js. 
	//              Those schedules will be added when the view get created and removed when the view is removed.
	schedules = [
		// memUsage 
		{
			performFn: () => {
				return ajax.get("/api/memUsage");
			},

			receiveFn: (data: any) => {
				if (data.length === 0) {
					return; // do nothing, next cycle we might have the data
				}
				var lastMeasure = data[data.length - 1];
				this._memPie!.update(lastMeasure);

				let cEl = d.first(this.el, ".mem-card.summary");
				cEl = guard(cEl, "can't find '.mem-card.summary'");
				d.push(cEl, {
					used: formatMb(lastMeasure.used),
					unused: formatMb(lastMeasure.unused)
				});
			}
		},

		// topMem
		{
			performFn: () => {
				return ajax.get("/api/topMemProcs");
			},

			// the performFn and receiveFn are added to the scheduler.js with this view instance as ctx (context)
			receiveFn: (data: any) => {
				var items = data;
				var tbodyEl = d.first(this.el, ".mem-card .ui-tbody");
				tbodyEl = guard(tbodyEl, "cannot find '.mem-card .ui-tbody'");

				// do nothing if empty data (still building it up on the server)
				if (items && items.length === 0) {
					return;
				}

				// mark the items changed if they did
				markChanges(this.prevTopMemProcsDic, items, "pid", "mem");

				// build the topMemrocs dictionary with the latest data and store it in this view for next update
				this.prevTopMemProcsDic = dic(items, "pid");

				// sort by name
				sortBy(items, "mem", "name");

				tbodyEl.innerHTML = "";
				d.append(tbodyEl, render("DashMainView-mem-trs", { items: data }));
			}
		},

		// cpuUsage 
		{
			performFn: () => {
				return ajax.get("/api/cpuUsage");
			},

			receiveFn: (data: any) => {
				if (data.length === 0) {
					return; // do nothing, next cycle we might have the data
				}

				// Update the chart
				this._cpuChart!.update(data);

				// update the pie
				var lastMeasure = data[data.length - 1];
				this._cpuPie!.update(lastMeasure);
				d.push(guard(d.first(this.el, ".cpu-card.summary"), "Cannot find '.cpu-card.summary'"), lastMeasure);
			}
		},

		// topCpu
		{
			performFn: () => {
				return ajax.get("/api/topCpuProcs");
			},

			receiveFn: (data: any) => {
				var items = data;
				var tbodyEl = d.first(this.el, ".cpu-card .ui-tbody");
				tbodyEl = guard(tbodyEl, "cannot find '.cpu-card .ui-tbody'");

				// do nothing if empty data (still building it up on the server)
				if (items && items.length === 0) {
					return;
				}

				// mark the items changed if they did
				markChanges(this.prevTopCpuProcsDic, items, "pid", "cpu");

				// build the topCpuProcs dictionary with the latest data and store it in this view for next update
				this.prevTopCpuProcsDic = dic(items, "pid");

				// sort by name
				sortBy(items, "cpu", "name");

				// render and update the HTML table
				tbodyEl.innerHTML = ""; // delete
				d.append(tbodyEl, render("DashMainView-cpu-trs", { items: items }));
			}
		}
	]
}

d.register(DashMainView);
// --------- /View Controller --------- //


// --------- Statics --------- //

// format a megabyte number as optimially as possible
function formatMb(num: number): string {
	var val = "" + num.toFixed(2);
	var unit = "M";
	if (num > 900) {
		val = (num / 1000).toFixed(2);
		unit = "Gb";
	}
	val = val.replace(".00", "");
	val = val + unit;
	return val;
}

// Mark the items if their value changed compared to the previous store
function markChanges(prevDic: any, items: any, keyName: any, valName: any) {

	// if no prevDic, nothing to do. 
	if (prevDic) {

		for (let item of items) {
			var keyVal = item[keyName];
			var prevItem = prevDic[keyVal];

			// if there is no prevItem, then, it is a new item.
			if (!prevItem) {
				item.changed = "changed-new";
			}
			// if we have a previous item, we compare the value to mark if it went up or down
			else {
				var val = item[valName];
				var prevVal = prevItem[valName];
				if (val != prevVal) {
					item.changed = (val > prevVal) ? "changed-up" : "changed-down";
				}
			}
		}
	}

	return items;
}
// --------- /Statics --------- //



// --------- Utils --------- //
// cheap num extractor pattern
var numRgx = /[0-9\.]+/g;

function asNum(str: string | null) {
	if (str) {
		var numStrs = str.match(numRgx);
		if (numStrs && numStrs.length > 0) {
			return parseFloat(numStrs[0]);
		}
	}

	return null;

}

function sortBy(arr: Array<any>, keyNum: any, keyName: string) {
	arr.sort((a, b) => {
		var anum = a[keyNum];
		var bnum = b[keyNum];
		// if they have the name num value, then, we compare the name
		if (anum === bnum) {
			return (a[keyName].toLowerCase() > b[keyName].toLowerCase()) ? 1 : -1;
		} else {
			return (anum < bnum) ? 1 : -1;
		}
	});
}
// --------- /Utils --------- //

