// load('steal/compress/test/run.js')

/**
 * Tests compressing a very basic page and one that is using steal
 */

load('steal/rhino/steal.js')
steal('//steal/test/test', function(s){
	
	new steal.File("jquery/view/test/compression/absolute.ejs").save("<h1>Absolute</h1>");
	new steal.File("jquery/view/test/compression/relative.ejs").save("<h1>Relative</h1>");
	new steal.File("jquery/view/test/compression/tmplTest.tmpl").save("<h1>${message}</h1>");
	s.test.clear();
	
	load("steal/rhino/steal.js");
	steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
		steal.build('jquery/view/test/compression/compression.html',{to: 'jquery/view/test/compression'});
	});
	
	s.test.clear();
	s.test.remove("jquery/view/test/compression/absolute.ejs")
	s.test.remove("jquery/view/test/compression/relative.ejs")
	s.test.remove("jquery/view/test/compression/tmplTest.tmpl")
	
	
	steal = {env: "production"};
	
	s.test.open('jquery/view/test/compression/compression.html')
	s.test.ok(  /Relative/i.test( $(document.body).text() ), "Relative not in page!" );
	s.test.ok(  /Absolute/i.test( $(document.body).text() ), "Absolute not in page!" );
	s.test.ok(  /Jquery Tmpl/i.test( $(document.body).text() ), "Jquery Tmpl not in page!" );
	
	s.test.clear();
	s.test.remove("jquery/view/test/compression/production.js")
	
});