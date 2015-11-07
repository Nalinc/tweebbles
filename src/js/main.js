require.config({
	paths:{
		'jQuery':'lib/jquery-1.11.1.min',
        'angular': 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular',
        'angular-route': 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular-route',
        'app':'app'		
	},
	shim:{
		'client':{
			deps:['jQuery'],
			exports: 'client'
		},
		'app':{
			deps:['angular','angular-route'],
			exports: 'app'
		},
		'angular-route':{
			deps:['angular'],
		},
		'events':{
			deps:['jQuery','client']
		}
	}
});

require(['app'], function (app) {

    'use strict';

	angular.bootstrap(document, ['app']);
});

