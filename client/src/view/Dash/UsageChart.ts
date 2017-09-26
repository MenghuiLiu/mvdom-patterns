import * as d3 from "d3";


export class UsageChart {

	_opts?: any;
	_width?: number;
	_height?: number;
	_x?: any;
	_y?: any;
	_leftAxis?: any;
	_userLine?: any;
	_userArea?: any;
	_sysLine?: any;
	_sysArea?: any;
	_firstUpdateDone = false;
	_g?: any;

	init(el: HTMLElement, opts: any) {
		this._opts = opts; // TODO: need to have some default

		// margin.right negative to compensite the clip path below
		var margin = { top: 10, right: -50, bottom: 10, left: 20 };

		this._width = el.clientWidth - margin.left - margin.right;
		this._height = el.clientHeight - margin.top - margin.bottom;

		// Define the x/y scale range (pixel ranges)
		this._x = d3.scaleLinear().range([0, this._width]);
		this._y = d3.scaleLinear().range([this._height, 0]);

		// set the X domain scale (will be fixed)
		// When transitioning a transform on a path using basis interpolation, 
		// you must clip the path by two additional control points so that the change in tangent is not visible while the path slides left
		// see https://bl.ocks.org/mbostock/1642989 for tutorial
		var xDomain = [1, opts.xMax - 1]; // so, here we start at 1 and end before last
		this._x.domain(xDomain);


		// Define the axis
		this._leftAxis = d3.axisLeft(this._y)
			.ticks(3) // We want ticks every three
			.tickSizeInner(0) // not tick line for inner ticks
			.tickSizeOuter(0); // and ticck line for the outer (end) tick

		// curve function used for all lines and areas.
		var curve = d3.curveMonotoneX;

		//// Define the userLine and userArea

		this._userLine = d3.line()
			.curve(curve)
			.x((d, i) => { return this._x(i); }) // for each data passed, we get the x coordinate for the item index in the array
			.y((d: any) => { return this._y(d.user); }); // for userLIne, we return the user value

		this._userArea = d3.area()
			.curve(curve)
			.x((d, i) => { return this._x(i); })
			.y0(this._y(0)) // the area always end at the buttom (y0)
			.y1((d: any) => { return this._y(d.user); });	// this is like the .y in line, will be the top line of the area


		//// Define the sysLine and sysArea
		this._sysLine = d3.line()
			.curve(curve)
			.x((d, i) => { return this._x(i); })
			.y((d: any) => { return this._y(d.sys); });

		this._sysArea = d3.area()
			.curve(curve)
			.x((d, i) => { return this._x(i); })
			.y0(this._y(0))
			.y1((d: any) => { return this._y(d.sys); });

		// appends a 'group' element to 'svg'
		// moves the 'group' element to the top left margin
		this._g = d3.select(el).append("svg")
			.attr("class", "UsageChart")
			.attr("width", this._width + margin.left + margin.right)
			.attr("height", this._height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");


		this._g.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("transform", "translate(1, 0)") // move one pixel to the right to see axis
			.attr("width", this._width - this._x(3)) // we remove two x unit (clip the path by two additional control points)
			.attr("height", this._height);

		return this;
	};

	update(data: any) {
		var self = this;
		var opts = self._opts;

		if (self._firstUpdateDone) {
			var newData = self._g.select(".user-line").datum().slice();

			// remove the first data
			newData.shift();

			// Add the new data
			// TODO: later we might look at what is new. 
			newData.push(data[data.length - 1]);
			data = newData;
		}

		// Set the Y domain scale
		// d3.extent return the [min, max] for a give array and optional accessor, here
		self._y.domain([0, d3.max(data, (d: any) => { return d.sys + d.user; })]);


		if (!self._firstUpdateDone) {

			// draw the y axis
			self._g.append("g")
				.attr("class", "y axis")
				.call(self._leftAxis)
				.append("text")
				.attr("class", "y-label")
				// .attr("transform", "rotate(-90)")
				.attr("y", 0)
				.attr("x", 50)
				.attr("dy", "0.71em")
				.attr("text-anchor", "end")
				.text("CPU (%)");

			// draw the user-line
			self._g.append("g")
				.attr("clip-path", "url(#clip)")
				.append("path")
				.attr("class", "line user-line")
				.datum(data)
				.attr("d", self._userLine);

			// draw the user-area
			self._g.append("g")
				.attr("clip-path", "url(#clip)")
				.append("path")
				.attr("class", "area user-area")
				.datum(data)
				.attr("d", self._userArea);

			// draw the sys-line
			self._g.append("g")
				.attr("clip-path", "url(#clip)")
				.append("path")
				.attr("class", "line sys-line")
				.datum(data)
				.attr("d", self._sysLine);

			// draw the sys-area
			self._g.append("g")
				.attr("clip-path", "url(#clip)")
				.append("path")
				.attr("class", "area sys-area")
				.datum(data)
				.attr("d", self._sysArea);

			self._firstUpdateDone = true;
		}

		// Redraw the user line
		self._g.select(".user-line")
			.datum(data) // attach the data
			.attr("transform", null) // we remove the previous transform
			.attr("d", self._userLine); // the line (could have done self._line(data) if data was not bound)

		// Redraw the sys area
		self._g.select(".user-area")
			.datum(data)
			.attr("transform", null)
			.attr("d", self._userArea);


		// Redraw the sys line
		self._g.select(".sys-line")
			.datum(data)
			.attr("transform", null)
			.attr("d", self._sysLine);


		// Redraw the sys area
		self._g.select(".sys-area")
			.datum(data)
			.attr("transform", null)
			.attr("d", self._sysArea);

		// Transition back the two lines and two areas
		self._g.selectAll(".line, .area").transition()
			.ease(d3.easeLinear)
			.duration(opts.delay)
			.attr("transform", "translate(" + self._x(0) + ")");

		// Make the changes to the x.axis if needed
		self._g.transition().select(".y.axis") // change the y axis
			.duration(300)
			.call(self._leftAxis);

		return self;
	};
}