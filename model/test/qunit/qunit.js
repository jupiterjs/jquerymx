//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/model","jquery/dom/fixture")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("model_test","associations_test")
 .plugins(
	"jquery/model/backup/qunit",
	"jquery/model/list/test/qunit"
	).then("//jquery/model/validations/qunit/validations_test")
