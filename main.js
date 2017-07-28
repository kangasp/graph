var spacing = 18;
var grid_on = 1;
var stage;
var ctx;
var line;
var actions;
var dist;
var coord;


function initialize() {
	/* Main Elements  */
	dist = document.getElementById('dist');
	stage = document.getElementById('stage');
	e_tools = document.getElementById('tools');
	e_tools_show = document.getElementById('tools-show');
	coord = document.getElementById('coord');
	ctx = stage.getContext('2d');
	stage.width = window.innerWidth;
	stage.height = window.innerHeight;
	stage.mousedown = false;

	touchdata = {
		start:{ x:0, y:0 },
		end:{ x:0, y:0 }
	};

	/* Utility Actions  */
	actions = {
		data: [],
		save: function() {
			if( line.x1 !== line.x2 || line.y1 !== line.y2 ) {
				this.data[this.data.length] = {
					x1: line.x1,
					y1: line.y1,
					x2: line.x2,
					y2: line.y2,
					type: 'line',
					color: line.color,
					width: line.width
				};
			}
		},
		restore: function() {
			for(var i=0;i<this.data.length;i++)
				line.draw(this.data[i].x1, this.data[i].y1, this.data[i].x2, this.data[i].y2, 'restore', this.data[i].color, this.data[i].width);
		},
		undo: function() {
			this.data.splice(this.data.length-1,1);
			stage.redraw();
			this.restore();
		},
		find_index: function(x,y) {
			var grace = 10;
			get_y_value = function(i, x, y) {
				if(actions.data[i].y2 === actions.data[i].y1) {
					return(actions.data[i].y1);
				}
				else if(actions.data[i].x2 === actions.data[i].x1) {
					return(y);
				}
				else {
    			return (((actions.data[i].y2 - actions.data[i].y1) / 
				  	       (actions.data[i].x2 - actions.data[i].x1)) * 
									 	(x - actions.data[i].x1) + actions.data[i].y1);
				}
			};
			get_x_value = function(i, x, y) {
				if(actions.data[i].x2 === actions.data[i].x1) {
					return(actions.data[i].x1);
				}
				else if(actions.data[i].y2 === actions.data[i].y1) {
					return(x);
				}
				else {
					return ( (y - actions.data[i].y1) / 
				           ((actions.data[i].y2 - actions.data[i].y1) / (actions.data[i].x2 - actions.data[i].x1)) + 
						    		 actions.data[i].x1 ); 
				}
			};
			between_values = function(grace, i, x, y) {
				return((( x >= (actions.data[i].x1-grace) && x <= (actions.data[i].x2+grace) ) || (x <= (actions.data[i].x1+grace) && x >= (actions.data[i].x2-grace) ))
 					  && (( y >= actions.data[i].y1-grace && y <= actions.data[i].y2+grace ) || (y <= actions.data[i].y1+grace && y >= actions.data[i].y2-grace ))); 
			};

		for( var i = 0; i < actions.data.length; i++ ) {
			if( between_values(grace, i, x, y) ) {
				new_x = get_x_value(i, x, y);
				new_y = get_y_value(i, x, y);
				if( ( (x + grace) > new_x && (x - grace) < new_x )
				&& ( (y + grace) > new_y && (y - grace) < new_y ) ) {
					alert(i);
					actions.data[i].highlight = true;
				}
				// alert( get_x_value(i, x, y) + ', ' + get_y_value(i, x, y));

			}
		}

			/* find the index - need to find the line  */ 
		},
		delete: function(index) {
			this.data.splice(this.data.length-1,1);
			stage.redraw();
			this.restore();
		},
		purge: function() {
			for(var i=0;i<this.data.length;i++)
				this.undo();
		},
		png: function() {
			//alert('This will open the image in a new window. Right-click and choose Save As to download the image.');
			window.open(stage.toDataURL('image/png'), 'Save as PNG');
		},
		png_nogrid: function() {
			//alert('This will open the image in a new window. Right-click and choose Save As to download the image.');
			stage.redraw_nogrid();
			window.open(stage.toDataURL('image/png'), 'Save as PNG');
			stage.redraw();
		}
	};

	/*******  Line object  ********/
	line = {
		color: 'black',
		width: 1,
		x1: 0, y1: 0, x2: 0, y2: 0,
		start: function(x,y) {
			this.x1 = this.snap_to_grid(x);
			this.y1 = this.snap_to_grid(y);
		},
		stop: function(x,y) {
			this.x2 = this.snap_to_grid(x);
			this.y2 = this.snap_to_grid(y);
			this.draw(this.x1,this.y1,this.x2,this.y2,'line');
		},
		draw: function(x1,y1,x2,y2,type,color,width) {
			if(type==undefined)
				type = 'line';
			if(type=='line')
				this.update_options();
			if(color==undefined)
				ctx.strokeStyle = this.color;
			else
				ctx.strokeStyle = color;
			if(this.col)
			if(width==undefined)
				ctx.lineWidth = this.width;
			else
				ctx.lineWidth = width;
			ctx.beginPath();
			ctx.moveTo(x1,y1);
			ctx.lineTo(x2,y2);
			ctx.closePath();
			ctx.stroke();
			if(type=='line') {
				actions.save();
				stage.redraw();
				actions.restore();
			}
		},
		guide: function(x,y) {
			this.update_options();
			stage.redraw();
			actions.restore();
			this.draw(this.x1,this.y1,this.snap_to_grid(x),this.snap_to_grid(y),'guide');
		},
		snap_to_grid: function(p) {
			var p2 = 0;
			for(var i=p-(spacing/2);i<p+(spacing/2);i++)
				if(i%spacing==0)
					p2 = i;
			return p2;
		},
		update_options: function() {
			if(stage.in_restore)
				return false;
			this.color = document.getElementById('line_color').value;
			this.width = document.getElementById('line_width').value;
		}
	};  /*******  Line object  ********/


	coord.update = function(x,y) {
		this.innerHTML = x + ',' + y;
	};

	/******** Stage Draw Helpers  ********/
	draw_onmousemove = function(ev) {
		if(!ev) ev = window.event;
		var x = ev.clientX;
		var y = ev.clientY;
		coord.update(x,y);
		dist.show(x,y);
		if(stage.mousedown)
			line.guide(x,y);
	};
	draw_touchmove = function(ev) {
		var touch = ev.touches[0];
		touchdata.end.x = touch.clientX;
		touchdata.end.y = touch.clientY;
		coord.update(touchdata.end.x,touchdata.end.y);
		dist.show(touchdata.end.x,touchdata.end.y);
		if(stage.mousedown)
			line.guide(touchdata.end.x,touchdata.end.y);
		ev.preventDefault();
	};
	draw_onmousedown = function(ev) {
		if(!ev) ev = window.event;
		stage.mousedown = true;
		var x = ev.clientX;
		var y = ev.clientY;
		line.start(x,y);
		dist.show(x,y);
	};
	draw_touchstart = function(ev) {
		var touch = ev.touches[0];
		touchdata.start.x = touch.clientX;
		touchdata.start.y = touch.clientY;
		stage.mousedown = true;
		line.start(touchdata.start.x,touchdata.start.y);
		dist.show(touchdata.start.x,touchdata.start.y);
		ev.preventDefault();
	};
	draw_onmouseup = function(ev) {
		if(!ev) ev = window.event;
		stage.mousedown = false;
		var x = ev.clientX;
		var y = ev.clientY;
		line.stop(x,y);
		dist.hide();
	};
	draw_touchend = function(ev) {
		stage.mousedown = false;
		line.stop(touchdata.end.x,touchdata.end.y);
		dist.hide();
		ev.preventDefault();
	};


	/******** Stage Delete Helpers  ********/
	delete_onmousemove = function(ev) {
		if(!ev) ev = window.event;
		var x = ev.clientX;
		var y = ev.clientY;
	};
	delete_touchmove = function(ev) {
		var touch = ev.touches[0];
		touchdata.end.x = touch.clientX;
		touchdata.end.y = touch.clientY;
	};
	delete_onmousedown = function(ev) {
		if(!ev) ev = window.event;
		var x = ev.clientX;
		var y = ev.clientY;
		actions.find_index(x,y);
	};
	delete_touchstart = function(ev) {
		var touch = ev.touches[0];
		touchdata.start.x = touch.clientX;
		touchdata.start.y = touch.clientY;
	};
	delete_onmouseup = function(ev) {
		if(!ev) ev = window.event;
		var x = ev.clientX;
		var y = ev.clientY;
	};
	delete_touchend = function(ev) {
	};



	stage.clear = function() {
		ctx.clearRect(0,0,this.width,this.height);
	};
	stage.redraw = function() {		
		this.clear();
		
		if( grid_on == 1 )
		{
			ctx.beginPath();
			ctx.strokeStyle = '#aaaaff';
			ctx.lineWidth = .5;
			for(var y=spacing;y<this.height;y=y+spacing) {
				ctx.moveTo(0,y);
				ctx.lineTo(this.width,y);
			}
			for(var x=spacing;x<this.width;x=x+spacing) {
				ctx.moveTo(x,0);
				ctx.lineTo(x,this.height);
			}
			ctx.closePath();
		}
		ctx.stroke();
		actions.restore();
	};
	stage.redraw_nogrid = function() {		
		this.clear();
		ctx.beginPath();
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = .5;
		for(var y=spacing;y<this.height;y=y+spacing) {
			ctx.moveTo(0,y);
			ctx.lineTo(this.width,y);
		}
		for(var x=spacing;x<this.width;x=x+spacing) {
			ctx.moveTo(x,0);
			ctx.lineTo(x,this.height);
		}
		ctx.closePath();
		ctx.stroke();
		actions.restore();
	};

	mode_update = function(m) {
		if( m === 'Draw') {
			stage.onmousemove = draw_onmousemove;
			stage.touchmove = draw_touchmove;
			stage.onmousedown = draw_onmousedown;
			stage.touchstart = draw_touchstart;
			stage.onmouseup = draw_onmouseup;
			stage.touchend = draw_touchend;
		}
		else if( m === 'Delete') {
			stage.onmousemove = delete_onmousemove;
			stage.touchmove 	= delete_touchmove;
			stage.onmousedown = delete_onmousedown;
			stage.touchstart 	= delete_touchstart;
			stage.onmouseup 	= delete_onmouseup;
			stage.touchend 		= delete_touchend;
		}
	};

	tools = {
		show: function() {
			e_tools.style.display = 'block';
			e_tools_show.style.display = 'none';
		},
		hide: function() {
			e_tools.style.display = 'none';
			e_tools_show.style.display = 'block';
		}
	};

	
	dist.show = function (x,y) {
		if(!stage.mousedown)
			return false;
		this.style.left = (x+30)+'px';
		this.style.top = (y+30)+'px';
		this.innerHTML = x+', '+y;
		this.innerHTML += ', '+this.distance(line.x1,line.y1,line.snap_to_grid(x),line.snap_to_grid(y));
		this.style.display = 'block';
	};
	dist.distance = function(x1,y1,x2,y2) {
		var scale_in = document.getElementById('scale_in').value;
		var scale_frac = document.getElementById('scale_frac').value;	
		var scale = parseFloat(scale_in)+parseFloat(scale_frac);
		var a = x1-x2;
		var b = y1-y2;
		if(a<0) a *= -1;
		if(b<0) b *= -1;
		var retval = Math.sqrt(Math.pow(a,2)+Math.pow(b,2));
		retval = Math.round(parseFloat(retval*scale/spacing)*100)/100;
		return retval;
	};
	dist.hide = function() {
		this.style.display = 'none';
	};
  
	mode_update('Draw');
	stage.redraw();
};


window.onload = function() {
	initialize();
	stage.addEventListener('touchstart', stage.touchstart);
	stage.addEventListener('touchmove', stage.touchmove);
	stage.addEventListener('touchend', stage.touchend);
};