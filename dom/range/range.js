steal.plugins('jquery','jquery/dom/compare').then(function($){
// TODOS ...
// Ad

/**
 * @function jQuery.fn.range
 * 
 * Returns a jQuery.Range.
 */
$.fn.range = function(){
	return $.Range(this[0])
}

var convertType = function(type){
	return  type.replace(/([a-z])([a-z]+)/gi, function(all,first,  next){
			  return first+next.toLowerCase()	
			}).replace(/_/g,"");
},
reverse = function(type){
	return type.replace(/^([a-z]+)_TO_([a-z]+)/i, function(all, first, last){
		return last+"_TO_"+first;
	});
},
getWindow = function( element ) {
	return element ? element.ownerDocument.defaultView || element.ownerDocument.parentWindow : window
},
bisect = function(el, start, end){
	//split the start and end ... figure out who is touching ...
	if(end-start == 1){
		return 
	}
}
/**
 * @Class jQuery.Range
 * @parent dom
 * @tag alpha
 * 
 * Provides text range helpers for creating, moving, and comparing ranges.
 * 
 * @constructor
 * 
 * Returns a jQuery range object.
 * 
 * @param {TextRange|Node|Point} [range] An object specifiying a 
 * range.  Depending on the object, the selected text will be different.  $.Range supports the
 * following types 
 * 
 *   - __undefined or null__ - returns a range with nothing selected
 *   - __Node__ - returns a range with the node's text selected
 *   - __Point__ - returns a range at the point on the screen.  The point can be specified like:
 *         
 *         //client coordinates
 *         {clientX: 200, clientY: 300}
 *         
 *         //page coordinates
 *         {pageX: 200, pageY: 300} 
 *         {top: 200, left: 300}
 *         
 *   - __TextRange__ a raw text range object.
 */
$.Range = function(range){
	if(this.constructor !== $.Range){
		return new $.Range(range);
	}
	if(range && range.jquery){
		range = range[0];
	}
	// create one
	if(!range || range.nodeType){
		this.win = getWindow(range)
		if(this.win.document.createRange){
			this.range = this.win.document.createRange()
		}else{
			this.range = this.win.document.body.createTextRange()
		}
		if(range){
			this.select(range)
		}
		
	} else if (range.clientX || range.pageX || range.left) {
		this.rangeFromPoint(range)
	} else {
		this.range = range;
	} 
};
/**
 * @static
 */
//
/**
 * Gets the current range.
 * 
 *     $.Range.current() //-> jquery.range
 * 
 * @param {HTMLElement} [el] an optional element used to get selection for a given window.
 * @return {jQuery.Range} a jQuery.Range wrapped range.
 */
$.Range.current = function(el){
	var win = getWindow(el),
		selection;
	if(win.getSelection){
		selection = win.getSelection()
		return new $.Range( selection.rangeCount ? selection.getRangeAt(0) : win.document.createRange())
	}else{
		return  new $.Range( win.document.selection.createRange() );
	}
};




$.extend($.Range.prototype,{
	rangeFromPoint : function(point){
		var clientX = point.clientX, clientY = point.clientY
		if(!clientX){
			var off = scrollOffset();
			clientX = (off.pageX || off.left || 0 ) - off.left;
			clientY = (off.pageY || off.top || 0 ) - off.top;
		}
		
		// it's some text node in this range ...
		var parent = document.elementFromPoint(clientX, clientY);
		
		//typically it will be 'on' text
		for(var n=0; n < parent.childNodes.length; n++){
			var node = parent.childNodes[n];
			if(node.nodeType === 3 || node.nodeType === 4){
				var range = $.Range(node),
					length = range.toString().length;
				
				
				// now lets start moving the end until the boundingRect is within our range
				
				for(var i = 1; i < length+1; i++){
					var rect = range.end(i).rect();
					if(rect.left <= clientX && rect.left+rect.width >= clientX &&
					  rect.top <= clientY && rect.top+rect.height >= clientY ){
						range.start(i-1); 
						this.range = range.range;
						return; 	
					}
				}
			}
		}
		
		// if not 'on' text, recursively go through and find out when we shift to next
		// 'line'
		var previous;
		iterate(parent.childNodes, function(textNode){
			var range = $.Range(textNode);
			if(range.rect().top > point.clientY){
				return false;
			}else{
				previous = range;
			}
		});
		if(previous){
			previous.start(previous.toString().length);
			this.range = previous.range;
		}else{
			this.range = $.Range(parent).range
		}
		
	},
	
	window : function(){
		return this.win || window;
	},
	/**
	 * Return true if any portion of these two ranges overlap.
	 * 
	 *     var foo = document.getElementById('foo');
	 *     
	 *     $.Range(foo.childNodes[0]).compare(foo.childNodes[1]) //-> false
	 * 
	 * @param {jQuery.Range} elRange
	 * @return {Boolean} true if part of the ranges overlap, false if otherwise.
	 */
	overlaps : function(elRange){
		if(elRange.nodeType){
			elRange = $.Range(elRange).select(elRange);
		}
		//if the start is within the element ...
		var startToStart = this.compare("START_TO_START", elRange),
			endToEnd = this.compare("END_TO_END", elRange)
		
		// if we wrap elRange
		if(startToStart <=0 && endToEnd >=0){
			return true;
		}
		// if our start is inside of it
		if( startToStart >= 0 &&
			this.compare("START_TO_END", elRange) <= 0 )	{
			return true;
		}
		// if our end is inside of elRange
		if(this.compare("END_TO_START", elRange) >= 0 &&
			endToEnd <= 0 )	{
			return true;
		}
		return false;
	},
	/**
	 * Collapses a range
	 * 
	 *     $('#foo').range().collapse()
	 * 
	 * @param {Boolean} [toStart] true if to the start of the range, false if to the
	 *  end.  Defaults to false.
	 * @return {Range} returns the range for chaining.
	 */
	collapse : function(toStart){
		this.range.collapse(toStart === undefined ? true : toStart);
		return this;
	},
	toString : function(){
		return typeof this.range.text == "string"  ? this.range.text : this.range.toString();
	},
	/**
	 * Gets or sets the start of the range.
	 * 
	 * If a value is not provided, start returns the range's starting container and offset like:
	 * 
	 *     $('#foo').range().start() //-> {container: fooElement, offset: 0 } 
	 * 
	 * If a set value is provided, it can set the range.  The start of the range is set differently
	 * depending on the type of set value:
	 * 
	 *   - __Object__ - an object with the new starting container and offset is provided like
	 *     
	 *         $.Range().start({container:  $('#foo')[0], offset: 20})
	 *   
	 *   - __Number__ - the new offset value.  The container is kept the same.
	 *   
	 *   - __String__ - adjusts the offset by converting the string offset to a number and adding it to the current
	 *     offset.  For example, the following moves the offset forward four characters:
	 *                  
	 *         $('#foo').range().start("+4")
	 * 
	 * 
	 * @param {Object|String|Number} [set] a set value if setting the start of the range or nothing if reading it.
	 * @return {jQuery.Range|Object} if setting the start, the range is returned for chaining, otherwise, the 
	 *   start offset and container are returned.
	 */
	start : function(set){
		if(set === undefined){
			if(this.range.startContainer){
				return {
					container : this.range.startContainer,
					offset : this.range.startOffset
				}
			}else{
				var start = this.clone().collapse().parent();
				var startRange = $.Range(start).select(start).collapse();
				startRange.move("END_TO_START", this);
				return {
					container : start,
					offset : startRange.toString().length
				}
			}
		} else {
			if (this.range.setStart) {
				if(typeof set == 'number'){
					this.range.setStart(this.range.startContainer, set)
				} else if(typeof set == 'string') {
					this.range.setStart(this.range.startContainer, this.range.startOffset+ parseInt(set,10) );
				} else {
					this.range.setStart(set.container, set.offset)
				}
			} else {
				throw 'todo'
			}
			return this;
		}
		
		
	},
	/**
	 * Sets or gets the end of the range.  It takes similar options as [jQuery.Range.prototype.get].
	 * @param {Object} [set]
	 */
	end : function(set){
		if (set === undefined) {
			if (this.range.startContainer) {
				return {
					container: this.range.endContainer,
					offset: this.range.endOffset
				}
			}
			else {
				var end = this.clone().collapse(false).parent();
				var endRange = $.Range(end).select(end).collapse();
				endRange.move("END_TO_END", this);
				return {
					container: end,
					offset: endRange.toString().length
				}
			}
		} else {
			if (this.range.setEnd) {
				if(typeof set == 'number'){
					this.range.setEnd(this.range.endContainer, set)
				} else {
					this.range.setEnd(set.container, set.offset)
				}
			} else {
				throw 'todo'
			}
			return this;
		}
	},
	/**
	 * returns the most common ancestor element of the endpoints in the range.
	 */
	parent : function(){
		return this.range.parentElement || this.range.commonAncestorContainer
	},
	/**
	 * Returns the bounding rectangle of this range.
	 * 
	 * @param {String} [from] - where the coordinates should be 
	 * positioned from.  By default, coordinates are given from the client viewport.
	 * But if 'page' is given, they are provided relative to the page.
	 * 
	 * @return {TextRectangle} - The client rects.
	 */
	rect : function(from){
		var rect = this.range.getBoundingClientRect()
		if(from === 'page'){
			var off = scrollOffset();
			rect = $.extend({}, rect);
			rect.top += off.top;
			rect.left += off.left;
		}
		return rect;
	},
	/**
	 * Returns client rects
	 * @param {String} [from] how the rects coordinates should be given (viewport or page).  Provide 'page' for 
	 * rect coordinates from the page.
	 */
	rects : function(from){
		var rects = $.makeArray( this.range.getClientRects() ).sort(function(rect1, rect2){
			return  rect2.width*rect2.height - rect1.width*rect1.height;
		}),
			i=0,j,
			len = rects.length;
		//return rects;
		//rects are sorted, largest to smallest	
		while(i < rects.length){
			var cur = rects[i],
				found = false;
			
			j = i+1;
			for(j = i+1; j < rects.length; j++){
				if( withinRect(cur, rects[j] ) ) {
					found = rects[j];
					break;
				}
			}
			if(found){
				rects.splice(i,1)
			}else{
				i++;
			}
			
			
		}
		// safari will be return overlapping ranges ...
		if(from == 'page'){
			var off = scrollOffset();
			return $.map(rects, function(item){
				var i = $.extend({}, item)
				i.top += off.top;
				i.left += off.left;
				return i;
			})
		}
		
		
		return rects;
	}
	
});
(function(){
	//method branching ....
	var fn = $.Range.prototype,
		range = $.Range().range;
	
	/**
	 * @function compare
	 * Compares one range to another range.  This is different from the spec b/c the spec is confusing.
	 * 
	 * source.compare("START_TO_END", toRange);
	 * 
	 * This returns -1 if source's start is before toRange's end.
	 * @param {Object} type
	 * @param {Object} range
	 */
	fn.compare = range.compareBoundaryPoints ? 
		function(type, range){
			return this.range.compareBoundaryPoints(this.window().Range[reverse( type )], range.range)
		}: 
		function(type, range){
			return this.range.compareEndPoints(convertType(type), range.range)
		}
	
	/**
	 * @function move
	 * Move the endpoints of a range
	 * @param {Object} type
	 * @param {Object} range
	 */
	fn.move = range.setStart ? 
		function(type, range){
	
			var rangesRange = range.range;
			switch(type){
				case "START_TO_END" : 
					this.range.setStart(rangesRange.endContainer, rangesRange.endOffset)
					break;
				case "START_TO_START" : 
					this.range.setStart(rangesRange.startContainer, rangesRange.startOffset)
					break;
				case "END_TO_END" : 
					this.range.setEnd(rangesRange.endContainer, rangesRange.endOffset)
					break;
				case "END_TO_START" : 
					this.range.setEnd(rangesRange.startContainer, rangesRange.startOffset)
					break;
			}
			
			return this;
		}:
		function(type, range){			
			this.range.setEndPoint(convertType(type), range.range)
			return this;
		};
	var cloneFunc = range.cloneRange ? "cloneRange" : "duplicate",
		selectFunc = range.selectNodeContents ? "selectNodeContents" : "moveToElementText";
	
	/**
	 * Clones the range and returns a new $.Range object.
	 */
	fn.clone = function(){
		return $.Range( this.range[cloneFunc]() );
	};
	
	/**
	 * Selects an element with this range
	 * @param {HTMLElement} el
	 */
	fn.select = function(el){
		this.range[selectFunc](el);
		return this;
	};
	
})();


// helpers  -----------------

// iterates through a list of elements, calls cb on every text node
// if cb returns false, exits the iteration
var iterate = function(elems, cb){
	var elem, start;
	for (var i = 0; elems[i]; i++) {
		elem = elems[i];
		// Get the text from text nodes and CDATA nodes
		if (elem.nodeType === 3 || elem.nodeType === 4) {
			if (cb(elem) === false) {
				return false;
			}
			// Traverse everything else, except comment nodes
		}
		else 
			if (elem.nodeType !== 8) {
				if (iterate(elem.childNodes, cb) === false) {
					return false;
				}
			}
	}
}, 
// if a point is within a rectangle
within = function(rect, point){

	return rect.left <= point.clientX && rect.left + rect.width >= point.clientX &&
	rect.top <= point.clientY &&
	rect.top + rect.height >= point.clientY
}, 
// if a rectangle is within another rectangle
withinRect = function(outer, inner){
	return within(outer, {
		clientX: inner.left,
		clientY: inner.top
	}) && //top left
	within(outer, {
		clientX: inner.left + inner.width,
		clientY: inner.top
	}) && //top right
	within(outer, {
		clientX: inner.left,
		clientY: inner.top + inner.height
	}) && //bottom left
	within(outer, {
		clientX: inner.left + inner.width,
		clientY: inner.top + inner.height
	}) //bottom right
}, 
// gets the scroll offset from a window
scrollOffset = function( win){
	var win = win ||window;
		doc = win.document.documentElement, body = win.document.body;
	
	return {
		left: (doc && doc.scrollLeft || body && body.scrollLeft || 0) + (doc.clientLeft || 0),
		top: (doc && doc.scrollTop || body && body.scrollTop || 0) + (doc.clientTop || 0)
	};
};



});