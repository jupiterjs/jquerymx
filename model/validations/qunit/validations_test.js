steal.plugins('funcunit/qunit','jquery/model/validations').then(function(){

module("jquery/model/validations",{
	setup : function(){
		jQuery.Model.extend("Person",{
		},{});
	}
})

test("models can validate, events, callbacks", 11,function(){
	
	Person.validate("age", {message : "it's a date type"},function(val){
					return ! ( this.date instanceof Date )
				})
	
	
	var task = new Person({age: "bad"}),
		errors = task.errors()
		
	
	ok(errors, "There are errors");
	equals(errors.age.length, 1, "there is one error");
	equals(errors.age[0], "it's a date type", "error message is right");
	
	task.bind("error.age", function(ev, errs){
		ok(this === task, "we get task back");
		
		ok(errs, "There are errors");
		equals(errs.age.length, 1, "there is one error");
		equals(errs.age[0], "it's a date type", "error message is right");
	})
	
	task.attr("age","blah")
	
	task.unbind("error.age");
	task.attr("age", "blaher", function(){}, function(errs){
		ok(this === task, "we get task back");
		
		ok(errs, "There are errors");
		equals(errs.age.length, 1, "there is one error");
		equals(errs.age[0], "it's a date type", "error message is right");
	})
})

test("validatesFormatOf", function(){
	Person.validateFormatOf("thing",/\d-\d/)
	
	ok(!new Person({thing: "1-2"}).errors(),"no errors");
	
	var errors = new Person({thing: "foobar"}).errors();
	
	ok(errors, "there are errors")
	equals(errors.thing.length,1,"one error on thing");
	
	equals(errors.thing[0],"is invalid","basic message");
	
	Person.validateFormatOf("otherThing",/\d/,{message: "not a digit"})
	
	var errors2 = new Person({thing: "1-2", otherThing: "a"}).errors();
	
	equals(errors2.otherThing[0],"not a digit", "can supply a custom message")
});

test("validatesInclusionOf", function(){

	Person.validateInclusionOf("thing",["value1","value2","value3"]);
	
	ok(!new Person({thing: "value2"}).errors(),"no errors");
	
	var errors = new Person({thing: "foobar"}).errors();
	
	ok(errors, "there are errors")
	equals(errors.thing.length,1,"one error on thing");
	
	equals(errors.thing[0],"is not a valid option (perhaps out of range)","basic message");
	
	Person.validateInclusionOf("otherThing",["value1","value2","value3"],{message: "not in array"})
	
	var errors2 = new Person({thing: "1-2", otherThing: "a"}).errors();
	
	equals(errors2.otherThing[0],"not in array", "can supply a custom message")
	
	
})

test("validatesLengthOf", function(){
	
})

test("validatesPresenceOf", function(){
	$.Model.extend("Task",{
		init : function(){
			this.validatePresenceOf("dueDate")
		}
	},{});
	
	var task = new Task(),
		errors = task.errors();
	
	ok(errors)
	ok(errors.dueDate)
	equals(errors.dueDate[0], "can't be empty" , "right message");
	
	task = new Task({dueDate : "yes"});
	errors = task.errors();;
	
	ok(!errors, "no errors "+typeof errors);
	
	$.Model.extend("Task",{
		init : function(){
			this.validatePresenceOf("dueDate",{message : "You must have a dueDate"})
		}
	},{});
	
	task = new Task({dueDate : "yes"});
	errors = task.errors();;
	
	ok(!errors, "no errors "+typeof errors);
	
})

test("validatesRangeOf", function(){
  
  jQuery.Model.extend("ValidatesRangeOfMock1",{},{});
		
	ValidatesRangeOfMock1.validateRangeOf("thing",2,3);
	
	ok(!new ValidatesRangeOfMock1({thing: 2.5}).errors(),"no errors");
	
	var errors = new ValidatesRangeOfMock1({thing: 4}).errors();
	
	ok(errors, "there are errors")
	
	equals(errors.thing.length,1,"one error on thing");
	
	equals(errors.thing[0],"is out of range [2,3]","basic message");
	
  jQuery.Model.extend("ValidatesRangeOfMock2",{},{});
	
	ValidatesRangeOfMock2.validateRangeOf("otherThing",-100,-10,{message: "not in range"})
	
	ok(!new ValidatesRangeOfMock2({otherThing: -50}).errors(),"no errors, with custom message");
	
	var errors2 = new ValidatesRangeOfMock2({thing: 2.5, otherThing: 3}).errors();
	
	equals(errors2.otherThing[0],"not in range", "can supply a custom message")
	
})

})
