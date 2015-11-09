require.config({
	paths:{
		'jQuery':'libs/jquery-1.7.2.min',
		'd3':'libs/d3.min',
        'angular': 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular',
        'angular-route': 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular-route',
        'app':'app',
		'vis':'vis',
		'jqueryui':'https://code.jquery.com/ui/1.11.4/jquery-ui.min'
	},
	shim:{
		'd3':{
			deps:['jQuery'],
			exports: 'd3'
		},
		'jqueryui':{
			deps:['jQuery'],
		},
		'vis':{
			deps:['d3'],
		},
		'app':{
			deps:['angular','angular-route'],
			exports: 'app'
		},
		'angular-route':{
			deps:['angular'],
		}
	}
});

require(['app','jQuery','d3'], function (app) {

    'use strict';

	angular.bootstrap(document, ['app']);
});

