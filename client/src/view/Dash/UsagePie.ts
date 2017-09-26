import * as d3 from "d3";

export class UsagePie {

	private _g: any;
	private _antiClockwise: any;
	private _current: any;
	private _arcTweenIn: any;
	private _arcTweenOut: any;
	private _arc: any;
	private _makeDataSet: (data: any) => any[];
	private _color: any;
	private _pie: any;

	constructor(names: string[], colors: string[]) {
		var self = this;

		this._antiClockwise = {
			startAngle: Math.PI * 2,
			endAngle: Math.PI * 2
		};

		this._arcTweenIn = function (a: any) {
			var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function (t: any) {
				return self._arc(i(t));
			};
		};

		this._arcTweenOut = function (a: any) {
			var i = d3.interpolate(this._current, { startAngle: Math.PI * 2, endAngle: Math.PI * 2, value: 0 });
			this._current = i(0);
			return (t: any) => {
				return self._arc(i(t));
			};
		};

		this._makeDataSet = function (data: any) {
			var dataset: any[] = [];
			names.forEach(function (name) {
				dataset.push({ name: name, value: data[name] });
			});

			return dataset;
		}
		//self._color = d3.scaleOrdinal(d3.schemeCategory20b);	
		self._color = d3.scaleOrdinal().domain(names).range(colors);
	}

	init(el: HTMLElement) {
		var donutWidth = 20;

		var width = el.clientHeight;
		var height = width;
		var radius = Math.min(width, height) / 2;

		this._g = d3.select(el)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

		this._arc = d3.arc()
			.innerRadius(radius - donutWidth)
			.outerRadius(radius);

		this._pie = d3.pie().value((d: any) => {
			return d.value;
		}).sort(null);

		return this;
	}

	update(data: any) {
		var self = this;
		var dataset = this._makeDataSet(data);

		// SELECT EXISTING: This is the paths that exist already.
		var paths = this._g.selectAll('path')
			.data(this._pie(dataset));

		// ENTER: create and initialize new elements when needed
		var newPaths = paths.enter().append('path')
			.attr('d', function (d: any) {
				return self._arc(self._antiClockwise);
			})
			.attr('fill', (d: any, i: any) => {
				return self._color(d.data.name);
			}).each(function (this: any, d: any) {
				// store the data in this path element, which will be used in the tween interporlation
				this._current = {
					data: d.data,
					value: d.value,
					startAngle: self._antiClockwise.startAngle,
					endAngle: self._antiClockwise.endAngle
				};
			});


		// ENTER + UPDATE: for both exsting and new paths, we set the transition
		newPaths.merge(paths).transition().duration(750).attrTween("d", self._arcTweenIn);

		// EXIT: remove the data
		paths.exit()
			.transition()
			.duration(750)
			.attrTween('d', self._arcTweenOut)
			.remove();

		return this;
	};
}



