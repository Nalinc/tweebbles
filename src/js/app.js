define([], function() {

		var app = angular.module('app', ['ngRoute']);

		app.config(function($routeProvider){

			$routeProvider
				.when('/', {
			  	templateUrl: '/views/home.html',
			  	controller: 'homeController',
			  })
				.when('/monitor', {
			    templateUrl: '/views/monitor.html',
			    controller: 'monitorController'
			  })
		});

		app.controller('homeController', function($scope,$rootScope,$location){
			$scope.appname = 'Tweebbles';
			$scope.analyzePhrase = function(){
				$rootScope.testphrase=$scope.phrase;
				if($scope.phrase)
					$location.path("/monitor");
			};

		});

		app.controller('monitorController', function($scope,$rootScope,$timeout,$location){
			if(!$rootScope.testphrase)
				$location.path('/');
			else{
				$rootScope.showLoader= false;
				$scope.feeds=[];
	
			}

		});

		return app;

	}
);