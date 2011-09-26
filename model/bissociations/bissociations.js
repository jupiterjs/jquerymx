steal.plugins(
		'jquery/model',
		'jquery/model/associations'
	).then(function($){
/**
@page jquery.model.bissociations Bi-directional hasMany Associations
@parent jQuery.Model
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/model/bissociations/bissociations.js
@test jquery/model/bissociations/qunit.html
@plugin jquery/model/bissociations

Enables bi-directional support to hasMany

@codestart
$.Model.extend("Task",{
  convert : {
    date : function(date){ ... }
  },
  attributes : {
    due : 'date'
  }
},{
  weeksPastDue : function(){
    return Math.round( (new Date() - this.due) /
          (1000*60*60*24*7 ) );
  }
})
@codeend

Then create a Contact model that 'hasMany' tasks:

@codestart
$.Model.extend("Contact",{
  this.bidirectional = true;
  associations : {
    hasMany : "Task"
  },
  ...
},{
  ...
});
@codeend

Here's a demo of this in action:

@demo jquery/model/bissociations/bissociations.html

 */

	$.Model.
	/**
	 * @function jQuery.Model.static.hasMany
	 * @parent jquery.model.associations
	 * @plugin jquery/model/associations
	 * Converts values on attribute <i>name</i> to
	 * instances of model <i>type</i>.
	*  @codestart
	 * $.Model.extend("Task",{
	 *   init : function(){
	 *     this.bidirectional = true;
	 *     this.hasMany("Person","people");
	 *   }
	 * },{})
	 * @codeend
	 * 
	 * @param {String} type The string name of the model.
	 * @param {String} [name] The name of the property.  
	 * Defaults to the shortName of the model with an "s" at the end.
	 * @param {String} [biname] The name of the parent reference property
	 * Default to parent
	 */
	hasMany = function(type, name, biname){
		name = name || $.String.camelize( type.match(/\w+$/)[0] )+"s";
		
		var cap = $.String.capitalize(name);
		biname = biname || "parent";
		if(!this.prototype["set"+cap]){
			var self = this;
			this.prototype["set"+cap] = function(v){
				// should probably check instanceof
				var value = (v == v.Class ? v : $.Class.getObject(type).wrapMany(v));
				var obj = {};
				if (self.bidirectional) {
					obj[biname] = this;
				}
				if (value instanceof Array) {
					for (var i=0;i<value.length;i++) {
						$.extend(value[i], obj);
					}
				}
				else {
					$.extend(value, obj);
				}
				return this[name] = value;
			};
		}
		if(!this.prototype["get"+cap]){
			this.prototype["get"+cap] = function(){
				return this[name] || $.Class.getObject(type).wrapMany([]);
			};
		}
		this.associations[name] = {
			hasMany: type
		};
		return this;
	};
});