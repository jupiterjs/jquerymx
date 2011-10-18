steal("jquery/dom/fixture", "jquery/model",'funcunit/qunit',function(){

module("jquery/dom/fixture");


test("static fixtures", function(){
	stop(3000);
	
	$.fixture("GET something", "//jquery/dom/fixture/fixtures/test.json");
	$.fixture("POST something", "//jquery/dom/fixture/fixtures/test.json");
	
	
	$.get("something",function(data){
		equals(data.sweet,"ness","$.get works");
		
		$.post("something",function(data){
			equals(data.sweet,"ness","$.post works");
			
			
			start();
		},'json');
		
	},'json');
})

test("static model fixtures where findAll and create have the same URL", function(){
    $.Model('Fixture.Test.Model', {
        findAll : "/fixture/test/model",
        create  : "/fixture/test/model",
        // Since these methods usually specify the id and thus differ the error does not occur:
        findOne : "/fixture/test/model/id/{id}", 
        update  : "/fixture/test/model/id/{id}",
        destroy : "/fixture/test/model/id/{id}"
    }, 
    {});

	$.fixture("/fixture/test/model", "//jquery/dom/fixture/fixtures/test.json");

	stop();
    Fixture.Test.Model.findAll({}, function(models) {
        ok(models.length);
        equals(models[0].sweet,"ness","findAll works");
        start();
    });

    var testModel = new Fixture.Test.Model();
    testModel.sweet = "ness";
    stop();
    testModel.save(function(savedModel) {
        ok(savedModel,"A model instance was returned")
        ok(savedModel.id,"Model id was assigned")
        equals(savedModel.sweet,"ness","Model attributed saved.")
        start();
    });
})

test("dynamic fixtures",function(){
	stop();
	$.fixture.delay = 10;
	$.fixture("something", function(){
		return [{sweet: "ness"}]
	})
	
	$.get("something",function(data){
		equals(data.sweet,"ness","$.get works");
		start();
		
	},'json');
});

test("fixture function", 3, function(){
	
	stop();
	var url = steal.root.join("jquery/dom/fixture/fixtures/foo.json");
	$.fixture(url,"//jquery/dom/fixture/fixtures/foobar.json" );
	
	$.get(url,function(data){
		equals(data.sweet,"ner","url passed works");
		
		$.fixture(url,"//jquery/dom/fixture/fixtures/test.json" );
		
		$.get(url,function(data){ 
		
			equals(data.sweet,"ness","replaced");
			
			$.fixture(url, null );
		
			$.get(url,function(data){ 
			
				equals(data.a,"b","removed");
				
				start();
				
			},'json')
			
			
		},'json')
		
		
		
	},"json");

});


test("fixtures with converters", function(){
	
	stop();
	$.ajax( {
	  url : steal.root.join("jquery/dom/fixture/fixtures/foobar.json"),
	  dataType: "json fooBar",
	  converters: {
	    "json fooBar": function( data ) {
	      // Extract relevant text from the xml document
	      return "Mr. "+data.name;
	    }
	  },
	  fixture : function(){
	  	return {
			name : "Justin"
		}
	  },
	  success : function(prettyName){
	  	start();
		equals(prettyName, "Mr. Justin")
	  }
	});
})

test("$.fixture.make fixtures",function(){
	stop();
	$.fixture.make('thing', 1000, function(i){
		return {
			id: i,
			name: "thing "+i
		}
	}, 
	function(item, settings){
		if(settings.data.searchText){
			var regex = new RegExp("^"+settings.data.searchText)
			return regex.test(item.name);
		}
	})
	$.ajax({
		url: "things",
		type: "json",
		data: {
			offset: 100,
			limit: 200,
			order: ["name ASC"],
			searchText: "thing 2"
		},
		fixture: "-things",
		success: function(things){
			equals(things.data[0].name, "thing 29", "first item is correct")
			equals(things.data.length, 11, "there are 11 items")
			start();
		}
	})
});

test("simulating an error", function(){
	var st = '{type: "unauthorized"}';
	
	$.fixture("/foo", function(){
		return [401,st]
	});
	stop();
	
	$.ajax({
		url : "/foo",
		success : function(){
			ok(false, "success called");
			start();
		},
		error : function(jqXHR, status, statusText){
			ok(true, "error called");
			equals(statusText, st);
			start();
		}
	})
})

test("rand", function(){
	var rand = $.fixture.rand;
	var num = rand(5);
	equals(typeof num, "number");
	ok(num >= 0 && num < 5, "gets a number" );
	
	stop();
	var zero, three, between, next = function(){
		start()
	}
	// make sure rand can be everything we need
	setTimeout(function(){
		var res = rand([1,2,3]);
		if(res.length == 0 ){
			zero = true;
		} else if(res.length == 3){
			three = true;
		} else {
			between  = true;
		}
		if(zero && three && between){
			ok(true, "got zero, three, between")
			next();
		} else {
			setTimeout(arguments.callee, 10)
		}
	}, 10)
	
});


test("_getData", function(){
	var data = $.fixture._getData("/thingers/{id}", "/thingers/5");
	equals(data.id, 5, "gets data");
})

test("_compare", function(){
	var same = $.Object.same(
		{url : "/thingers/5"},
		{url : "/thingers/{id}"}, $.fixture._compare)
	
	ok(same, "they are similar");
	
	same = $.Object.same(
		{url : "/thingers/5"},
		{url : "/thingers"}, $.fixture._compare);
		
	ok(!same, "they are not the same");
})

test("_similar", function(){
	
	var same = $.fixture._similar(
		{url : "/thingers/5"},
		{url : "/thingers/{id}"});
		
	ok(same, "similar");
	
	same = $.fixture._similar(
		{url : "/thingers/5", type: "get"},
		{url : "/thingers/{id}"});
		
	ok(same, "similar with extra pops on settings");
	
	var exact = $.fixture._similar(
		{url : "/thingers/5", type: "get"},
		{url : "/thingers/{id}"}, true);
	
	ok(!exact, "not exact" )
	
	var exact = $.fixture._similar(
		{url : "/thingers/5"},
		{url : "/thingers/5"}, true);
		
	ok(exact, "exact" )
})

test("fixture function gets id", function(){
	$.fixture("/thingers/{id}", function(settings){
		return {
			id: settings.data.id,
			name: "justin"
		}
	})
	stop(3000);
	$.get("/thingers/5", {}, function(data){
		start();
		ok(data.id)
	},'json')
});

test("replacing and removing a fixture", function(){
	var url = steal.root.join("jquery/dom/fixture/fixtures/remove.json")
	$.fixture("GET "+url, function(){
		return {weird: "ness!"}
	})
	stop();
	$.get(url,{}, function(json){
		equals(json.weird,"ness!","fixture set right")
		
		$.fixture("GET "+url, function(){
			return {weird: "ness?"}
		})
		
		$.get(url,{}, function(json){
			equals(json.weird,"ness?","fixture set right");
			
			$.fixture("GET "+url, null )
			
			$.get(url,{}, function(json){
				equals(json.weird,"ness","fixture set right");

				start();
			});
			
			
		},'json')
		
		
		
	},'json')
})






});
