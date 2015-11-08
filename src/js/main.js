require.config({
	paths:{
		'jQuery':'libs/jquery-1.7.2.min',
		'd3':'libs/d3.min',
        'angular': 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular',
        'angular-route': 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular-route',
        'app':'app',
		'vis':'vis'    
	},
	shim:{
		'd3':{
			deps:['jQuery'],
			exports: 'd3'
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

