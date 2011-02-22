steal.plugins('jquery/controller').then(function($){

/**
 * @core
 * @tag core
 * @class jQuery.Tie
 * @page jquery.tie Tie
 * @plugin jquery/tie
 * @test jquery/tie/qunit.html

 * The $.fn.tie plugin binds form elements, dom elements and controllers with 
 * models and vice versa.  The result is that a change in 
 * a model will automatically update the form element, dom elemnt, or controller
 * AND a change event on the element will update the model. 
 * 
 * ## Setup
 *
 * @codestart
 * $.Model("Person")
 * 
 * var person = new Person({age: 5});
 * @codeend
 *
 * ## Form elements
 * 
 * @codestart
 * $('input:first').tie(person,'age');
 * @codeend
 *
 * When this code is run, it will automatically set the input's value to 5.
 * If I do the following ...
 *
 * @codestart
 * person.attr('age',7);
 * @codeend
 *
 * ... It will update the input element.
 *
 * If I change the input element manually, it will effectively do a:
 * 
 * @codestart
 * person.attr('age',$('input:first').val());
 * @codeend
 *
 * ## Non-form elements
 * 
 * Tie will also call html on elements allowing you to link any html elements.
 * 
 * @codestart
 * $('p.age').tie(person,'age');
 * @codeend
 * 
 * This will link all paragraphs with a class of age. Initially it will set the 
 * text to 7 (as we have already changed the persons age to 7).
 * 
 * If I do the following ...
 *
 * @codestart
 * person.attr('age',2);
 * @codeend
 *
 * ... It will update all the paragraph elements.
 * 
 * ## Controllers
 * 
 * For form elements, tie uses $(el).val() to get and set values and listens
 * for change events to know when the input element has changed.  
 *
 * For controller, it's basically the same way.  Your controller only has to 
 * do 2 things:
 * 
 * 1. implement a val function that take an optional value.
 *    If a value is provided, it should update the UI appropriately;
 *    otherwise, it should return the value:
 * 
 * @codestart
 * $.Controller('Rating',{
 *   val : function(value){
 *     if(value !== undefined){
 *       //update the UI
 *     }else{
 *       //return the value
 *     }
 *   }
 * })
 * @codeend
 *
 * 2. When the model should be updated, trigger a change event
 *    with the new value:
 *
 * @codestart
 * this.element.trigger('change',7);
 * @codeend
 *
 * Here's a slider widget implemented this way:
 * https://github.com/jupiterjs/mxui/blob/master/slider/slider.js
 * Notice in dropend, it triggers a change with the value of the slider.
 *
 * You could tie a slider to a person's age like:
 *
 * @codestart
 * $('#slider').mxui_slider().tie(person,'age');
 * @codeend
 *
 * Reads pretty well doesn't it!
 *
 * ## Validation
 * 
 * Here's how we could setup our model to validate ages:  
 *
 * @codestart
 * $.Model.extend("Person",{
 *   setAge : function(age, success, error){
 *     age =  +(age);
 *     if(isNaN(age) || !isFinite(age) || age < 1 || age > 10){
 *        error()
 *     }else{
 *        return age;
 *     }
 *   }
 * });
 * @codeend
 *
 * This checks that age is a number between 1 and 10.  You could also 
 * use the validations plugin for this.
 * 
 * If setAge made an Ajax request to the server, you would call
 * success(finalAge) instead of returning the correct value.
 *
 */
$.Controller.extend("jQuery.Tie",{
  /**
    * @function jQuery.Tie
    * @parent jquery.tie
    * Initiate a link between an html element or controller and model.
    * @param {Object} inst A model instance to bind with.
    * @param {String} attr The model attribute to trigger changes on.
    * @param {Function} success (optional) A callback function if the element, controller, or model is successfully updated
    * @param {Function} failure (optional) A callback function if the element, controller, or model cannot be updated, for example if it fails the models validation.
    * @param {Object} type (optional) TODO I'm not entirely clear on what this does, something to do with you being able to give it a different controller to call value on I think.
    *
    */
	init : function(el, inst, attr, success, failure, type){
		// if there's a controller
		if(!type){
			//find the first one that implements val
			var controllers = this.element.data("controllers") || {};
			for(var name in controllers){
				var controller = controllers[name];
				if(typeof controller.val == 'function'){
					type = name;
					break;
				}
			}
		}
		
		this.type = type;
		this.attr = attr;
		this.inst = inst;
		this.success = success;
		this.failure = failure;
		this.bind(inst, attr, "attrChanged");
		
		//destroy this controller if the model instance is destroyed
		this.bind(inst, "destroyed", "destroy");
		
		var value = inst.attr(attr);
		//set the value
		this.lastValue = value;
		if(type){
			
			//destroy this controller if the controller is destroyed
			this.bind(this.element.data("controllers")[type],"destroyed","destroy");
			this.element[type]("val",value);
			
		}else{
			this.element.val(value);
			this.element.html(value);
		}
		if (typeof this.success == "function")
			this.success(this.element);
	},
	attrChanged : function(inst, ev, val){
		if (val !== this.lastValue) {
			this.setVal(val);
			if (typeof this.success == "function")
				this.success(this.element);
			this.lastValue = val;
		}
	},
	setVal : function(val){
		if (this.type) {
			this.element[this.type]("val", val)
		}
		else {
			this.element.val(val);
			this.element.html(val);
		}
	},
	change : function(el, ev, val){
		if(!this.type && val === undefined){
			val = this.element.val();
		}
		
		this.inst.attr(this.attr, val, null, this.callback('setBack'))
		
	},
	setBack : function(){
		this.failure(this.element);
		this.setVal(this.lastValue);
	},
	destroy : function(){
		this.inst = null;
		this._super();
	}
});


});