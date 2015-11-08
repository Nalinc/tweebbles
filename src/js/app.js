define(['vis'], function() {

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

		app.controller('homeController', function($scope,$rootScope,$location,$http){
			$scope.appname = 'Tweebbles';
			$scope.analyzePhrase = function(){
				$rootScope.testphrase=$scope.phrase;
				if($scope.phrase){
					$location.path("/monitor");
				}
			};

		});

		app.controller('monitorController', function($scope,$rootScope,$timeout,$location,$http){
			if(!$rootScope.testphrase)
				$location.path('/');
			else{
				$rootScope.showLoader= false;
				$scope.feeds=[];
				init();
			}

			function init(){
				  var display, key, plot, text;
				  plot = Bubbles();
				  display = function(data) {
				    return plotData("#vis", data, plot);
				  };
				  key = decodeURIComponent(location.search).replace("?", "");
				  text = texts.filter(function(t) {
				    return t.key === key;
				  })[0];
				  if (!text) {
				    text = texts[0];
				  }
				  $("#text-select").val(key);
				  d3.select("#jitter").on("input", function() {
				    return plot.jitter(parseFloat(this.output.value));
				  });
				  d3.select("#text-select").on("change", function(e) {
				    key = $(this).val();
				    location.replace("#");
				    return location.search = encodeURIComponent(key);
				  });
				  d3.select("#book-title").html(text.name);

					$http.get('timeline/'+$rootScope.testphrase).
					then(function(res){
						display(res.data)
						console.log(res);
					},function(err){
						console.log(err);
					});

//				  d3.json("data/" + text.file, display);

			}
		});

		return app; 
	}
);