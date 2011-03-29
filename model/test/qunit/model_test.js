module("jquery/model", { 
	setup: function() {
        var ids = 0;
	    $.Model.extend("Person",{
			findAll: function( params, success, error ) {
				success("findAll");
			},
			findOne: function( params, success, error ) {
				success("findOne");
			},
			create: function( params, success, error ) {
				success({zoo: "zed", id: (++ids)},"create");
			},
			destroy: function( id, success, error ) {
				success("destroy");
			},
			update: function( id, attrs, success, error ) {
				success({zoo: "monkeys"},"update");
			}
		},{
			prettyName: function() {
				return "Mr. "+this.name;
			}
		})
	}
})


test("CRUD", function(){
   
	Person.findAll({}, function(response){
		equals("findAll", response)
	})
	Person.findOne({}, function(response){
		equals("findOne", response)
	})
    var person;
	new Person({foo: "bar"}).save(function(inst, attrs, create){
		equals(create, "create")
		equals("bar", inst.foo)
		equals("zed", inst.zoo)
		ok(inst.save, "has save function");
		person = inst;
	});
    person.update({zoo: "monkey"},function(inst, attrs, update){
		equals(inst, person, "we get back the same instance");
		equals(person.zoo, "monkeys", "updated to monkeys zoo!  This tests that you callback with the attrs")
	})
})
test("hookup and model", function(){
	var div = $("<div/>")
	var p = new Person({foo: "bar2", id: 5});
	p.hookup( div[0] );
	ok(div.hasClass("person"), "has person");
	ok(div.hasClass("person_5"), "has person_5");
	equals(p, div.model(),"gets model" )
})
// test that models returns an array of unique instances
test("unique models", function(){
	var div1 = $("<div/>")
	var div2 = $("<div/>")
	var div3 = $("<div/>")
	var p = new Person({foo: "bar2", id: 5});
	var p2 = new Person({foo: "bar3", id: 4});
	p.hookup( div1[0] );
	p.hookup( div2[0] );
	p2.hookup( div3[0] );
	var models = div1.add(div2).add(div3).models();
	equals(p, models[0], "gets models" )
	equals(p2, models[1], "gets models" )
	equals(2, models.length, "gets models" )
})


test("wrapMany", function(){
	var people = Person.wrapMany([
		{id: 1, name: "Justin"}
	])
	equals(people[0].prettyName(),"Mr. Justin","wraps wrapping works")
});

test("binding", 2,function(){
	var inst = new Person({foo: "bar"});
	
	inst.bind("foo", function(ev, val){
		ok(true,"updated")	
		equals(val, "baz", "values match")
	});
	
	inst.attr("foo","baz");
	
});

test("error binding", 1, function(){
	$.Model.extend("School",{
	   setName : function(name, success, error){
	     if(!name){
	        error("no name");
	     }
	     return error;
	   }
	})
	var school = new School();
	school.bind("error.name", function(ev, error){
		equals(error, "no name", "error message provided")
	})
	school.attr("name","");
	
	
})

test("auto methods",function(){
	//turn off fixtures
	$.fixture.on = false;
	var School = $.Model.extend("Jquery.Model.Models.School",{
	   findAll : steal.root.join("jquery/model/test")+"/{type}.json",
	   findOne : steal.root.join("jquery/model/test")+"/{id}.json",
	   create : steal.root.join("jquery/model/test")+"/create.json",
	   update : "POST "+steal.root.join("jquery/model/test")+"/update{id}.json"
	},{})
	stop(5000);
	School.findAll({type:"schools"}, function(schools){
		ok(schools,"findAll Got some data back");
		equals(schools[0].Class.shortName,"School","there are schools")
		
		School.findOne({id : "4"}, function(school){
			ok(school,"findOne Got some data back");
			equals(school.Class.shortName,"School","a single school");
			
			
			new School({name: "Highland"}).save(function(){
				equals(this.name,"Highland","create gets the right name")
				this.update({name: "LHS"}, function(){
					start();
					equals(this.name,"LHS","create gets the right name")
					
					$.fixture.on = true;
				})
			})
			
		})
		
	})
})

test("isNew", function(){
	var p = new Person();
	ok(p.isNew(), "nothing provided is new");
	var p2 = new Person({id: null})
	ok(p2.isNew(), "null id is new");
	var p3 = new Person({id: 0})
	ok(!p3.isNew(), "0 is not new");
});
test("findAll string", function(){
	$.fixture.on = false;
	$.Model("Test.Thing",{
		findAll : steal.root.join("jquery/model/test/qunit/findAll.json")
	},{});
	stop();
	Test.Thing.findAll({},function(things){
		equals(things.length, 1, "got an array");
		equals(things[0].id, 1, "an array of things");
		start();
		$.fixture.on = true;
	})
})
test("Empty uses fixtures", function(){
	$.Model("Test.Things");
	$.fixture.make("thing", 10, function(i){
		return {
			id: i
		}
	});
	stop();
	Test.Thing.findAll({}, function(things){
		start();
		equals(things.length, 10,"got 10 things")
	})
})

test("Inherits base attributes & defaults", function(){
	$.Model.extend("Test.Parent", {
		attributes: {
			parent: 'string',
			override_default: 'string'
		},

		defaults: {
			parent: 'parent',
			override_default: 'parent'
		}
	}, {
		access_parent: function(name) {
			equals(this.parent, 'parent', name + ' instance can access Parent attr');
		}
	});	

	Test.Parent.extend("Test.Derived", {
		attributes: {
			derived: 'string'
		},

		defaults: {
			derived: 'derived',
			override_default: 'derived'
		}
	}, {
	});

	var parent = new Test.Parent();
	equals(parent.parent, 'parent', 'Parent attr is initialized from default');
	parent.access_parent('Parent');

	var derived = new Test.Derived();
	equals(derived.derived, 'derived', 'Derived explicitly defined attr is initialized from default')
	ok(derived.parent !== undefined, 'Derived inherits Parent attr')
	equals(derived.parent, 'parent', 'Derived inherited attr is initialized from inherited default');
	equals(derived.override_default, 'derived', 'Derived inherited attr is initialized from overrided default');
	derived.access_parent('Derived');
})