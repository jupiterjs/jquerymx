//we probably have to have this only describing where the tests are
steal
 .plugins("ngen/event_results/bissociations")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("bissociations_test");
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env');
}