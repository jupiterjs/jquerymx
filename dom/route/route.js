steal('jquery/lang/observe', 'jquery/event/hashchange', 'jquery/lang/string/deparam', 'jquery/lang/observe/delegate', function($) {
	var
		globalDefaults, matcher = /\:([\w\.]+)/g,
		escapeHTML = function(content) {
			return content.replace(/"/g, '&#34;').replace(/'/g, "&#39;");
		},
		makeProps = function(props) {
			var
				html = [],
				name, val;

			for (name in props) {
				val = props[name];
				if (name === 'className') {
					name = 'class';
				}
				val && html.push(name, "=\"", escapeHTML(val), "\" ");
			}
			return html.join("");
		},
	// if a route matches the data provided
		matchesData = function(route, data) {
			var i, count = 0;
			for (i = 0; i < route.names.length; i++) {
				if (!data.hasOwnProperty(route.names[i])) {
					return 0;
				}
				count++;
			}
			return count;
		},
		onready = true,

	/**
	 * @class jQuery.route
	 * @inherits jQuery.Observe
	 * @plugin jquery/dom/route
	 * @parent dom
	 * @tag 3.2
	 * @test jquery/dom/route/qunit.html
	 *
	 * jQuery.route helps manage browser history (and
	 * client state) by
	 * synchronizing the window.location.hash with
	 * an [jQuery.Observe].
	 *
	 * ## Background Information
	 *
	 * To support the browser's back button and bookmarking
	 * in an Ajax application, most applications use
	 * the <code>window.location.hash</code>.  By
	 * changing the hash (via a link or JavaScript),
	 * one is able to add to the browser's history
	 * without changing the page.  The [jQuery.event.special.hashchange event] allows
	 * you to listen to when the hash is changed.
	 *
	 * Combined, this provides the basics needed to
	 * create history enabled Ajax websites.  However,
	 * jQuery.Route addresses several other needs such as:
	 *
	 *   - Pretty Routes
	 *   - Keeping routes independent of application code
	 *   - Listening to specific parts of the history changing
	 *   - Setup / Teardown of widgets.
	 *
	 * ## How it works
	 *
	 * <code>$.route</code> is a [jQuery.Observe $.Observe] that represents the
	 * <code>window.location.hash</code> as an
	 * object.  For example, if the hash looks like:
	 *
	 *	 #!type=videos&id=5
	 *
	 * the data in <code>$.route</code> would look like:
	 *
	 *	 { type: 'videos', id: 5 }
	 *
	 *
	 * $.route keeps the state of the hash in-sync with the data in
	 * $.route.
	 *
	 * ## $.Observe
	 *
	 * $.route is a [jQuery.Observe $.Observe]. Understanding
	 * $.Observe is essential for using $.route correctly.
	 *
	 * You can
	 * listen to changes in an Observe with bind and
	 * delegate and change $.route's properties with
	 * attr and attrs.
	 *
	 * ### Listening to changes in an Observable
	 *
	 * Listen to changes in history
	 * by [jQuery.Observe.prototype.bind bind]ing to
	 * changes in <code>$.route</code> like:
	 *
	 *	 $.route.bind('change', function(ev, attr, how, newVal, oldVal){
	 *
	 *	 })
	 *
	 * You can also listen to specific changes
	 * with [jQuery.Observe.prototype.delegate delegate]:
	 *
	 *	 $.route.delegate('id','change', function(){ ... })
	 *
	 * Observe lets you listen to the following events:
	 *
	 *  - change - any change to the object
	 *  - add - a property is added
	 *  - set - a property value is added or changed
	 *  - remove - a property is removed
	 *
	 * Listening for <code>add</code> is useful for widget setup
	 * behavior, <code>remove</code> is useful for teardown.
	 *
	 * ### Updating an observable
	 *
	 * Create changes in the route data like:
	 *
	 *	 $.route.attr('type','images');
	 *
	 * Or change multiple properties at once with
	 * [jQuery.Observe.prototype.attrs attrs]:
	 *
	 *	 $.route.attrs({type: 'pages', id: 5}, true)
	 *
	 * When you make changes to $.route, they will automatically
	 * change the <code>hash</code>.
	 *
	 * ## Creating a Route
	 *
	 *
	 *
	 *	 $.route("", {type: "videos"});
	 *	 $.route(":type",{type: "videos"});
	 *
	 * @param {String} url
	 * @param {Object} [defaults]
	 * @return {$.route}
	 */

		$route = $.route = function(url, defaults) {
			// add route in a form that can be easily figured out
			//
			var names = [],
				test = url.replace(matcher, function(whole, name) {
					names.push(name);
					return "([\\w\\.]*)";
				});

			// need a regexp to match
			$route.routes[url] = {
				test: new RegExp("^" + test),
				route: url,
				names: names,
				defaults: defaults || {},
				length: url.split('/').length
			};
			return $route;
		},
		throttle = function(func, time) {
			var timer;
			return function() {
				clearTimeout(timer);
				timer = setTimeout(func, time || 1);
			};
		},
		curParams,
		setState = function() {
			var
				hash = window.location.hash.slice(1, 2) === '!' ? window.location.hash.slice(2) : window.location.hash.slice(1), // everything after #!
				//deparam it
				props = $route.deparam(hash);

			curParams = props;
			$route.attrs(props, true);
		};


	$.extend($route, {
		/**
		 * Parameterizes the raw JS object representation of
		 * $.route.data.
		 *
		 *
		 * @param {Object} data
		 */
		param: function(data) {
			// see what data is provided ...
			// check if it matches the names in any routes ...
			// get the one with the most matches
			var
				after,
				route,
				matches = -1,
				cpy,
				res,
				temp,
				name,
				matchCount;

			for (name in $route.routes) {
				temp = $route.routes[name];
				matchCount = matchesData(temp, data);
				if (matchCount > matches) {
					route = temp;
					matches = matchCount;
				}
			}
			if (route) {
				// create url ...
				cpy = $.extend({}, data);
				res = route.route.replace(matcher, function(whole, name) {
					delete cpy[name];
					return data[name] === route.defaults[name] ? "" : data[name];
				});
				after = $.param(cpy);
				return res + (after ? "&" + after : "");
			}
			return $.param(data);
		},
		/**
		 *
		 * @param {Object} url
		 */
		deparam: function(url) {
			// see if there are any matches ...
			var
				name,
				temp,
				parts,
				start,
				remainder,
				obj,
				p,
				route = {
					length: -1
				};
			for (name in $route.routes) {
				temp = $route.routes[name];
				if (temp.test.test(url) && temp.length > route.length) {
					route = temp;
				}
			}
			if (route.length > -1) {
				parts = url.match(route.test);
				start = parts.shift();
				remainder = url.substr(start.length + 1);
				obj = $.extend(true, remainder ? $.String.deparam(remainder) : {}, route.defaults);

				for (p = 0; p < parts.length; p++) {
					if (parts[p]) {
						obj[route.names[p]] = parts[p];
					}
				}
				return obj;
			}
			return $.String.deparam(url);
		},
		/**
		 * @hide
		 * A $.Observe that represents the state of the
		 * history.
		 */
		data: new $.Observe({}),
		routes: {},
		/**
		 * Indicates that all routes have been added
		 * and sets $.route.data based upon the routes.
		 * @param {Boolean} [start]
		 * @return
		 */
		ready: function(val) {
			if (val === false) {
				onready = false;
			}
			if (val === true || onready === true) {
				setState();
			}
			return $route;
		},
		/**
		 * Returns a url from the options
		 * @param {Object} options
		 * @param {Boolean} merge true if the options should be merged with the current options
		 * @return {String}
		 */
		url: function(options, merge) {
			//merges
			if (!merge) {
				return "#!" + $route.param(options);
			} else {
				return "#!" + $route.param($.extend({}, curParams, options));
			}
		},
		/**
		 * Returns a link
		 * @param {Object} name
		 * @param {Object} options
		 * @param {Object} props
		 */
		link: function(name, options, props) {
			return "<a " + makeProps(
				$.extend({
					href: $route.url(options)
				}, props)
			) + ">" + name + "</a>";
		},
		/**
		 * Returns if the options represent the current page.
		 * @param {Object} options
		 */
		current: function(options) {
			return window.location.hash === "#!" + $route.param(options);
		}
	});
	// onready
	$(function() {
		$.route.ready();
	});


	$.each(['bind', 'unbind', 'delegate', 'undelegate', 'attr', 'attrs', 'removeAttr'], function(i, name) {
		$route[name] = function() {
			return $route.data[name].apply($route.data, arguments);
		};
	});

	// update the state object
	$(window).bind('hashchange', setState);


	// update the page
	$route.data.bind("change", throttle(function() {
		// param and change the hash if necessary
		// throttle
		window.location.hash = "#!" + $route.param($route.data.serialize());
	}));
});