define(['vis','jqueryui'], function() {

		var app = angular.module('app', ['ngRoute']);

		app.config(function($routeProvider){

			$routeProvider
				.when('/', {
			  	templateUrl: '/views/home.html',
			  	controller: 'homeController',
			  })
				.when('/monitor', {
			    templateUrl: '/views/bubble.html',
			    controller: 'bubbleController'
			  })
		});

		app.controller('homeController', function($scope,$rootScope,$location,$http){
			$scope.appname = '< Tweebbles >';
            function update() {
                var tasks_time = $('#tasks_time').slider('value');
                var tasks_done = $('#tasks_done').slider('value');
                var total_cost = (tasks_time * 4 * tasks_done) / (tasks_done * 3);
                var credits_needed = Math.round((total_cost / 10)+1);
                $("#total_cost").text(total_cost.toFixed(2));
                $("#curr-tasks_time").text(tasks_time);
                $("#curr-tasks_done").text(tasks_done);
                $("#credits_needed").text(credits_needed.toFixed(0));
                
            }

		    $( document ).tooltip({
		      position: {
		        my: "center bottom-20",
		        at: "center top",
		        using: function( position, feedback ) {
		          $( this ).css( position );
		          $( "<div>" )
		            .addClass( "arrow" )
		            .addClass( feedback.vertical )
		            .addClass( feedback.horizontal )
		            .appendTo( this );
		        }
		      }
		    });
           	$( "#tasks_time" ).slider({
                range: "min",
                value: 100,
                min: 1,
                max: 1000,
                slide: function() {
                    update();
                }
            });


			$scope.analyzePhrase = function(){
				$rootScope.testphrase=$scope.phrase;
				if($scope.phrase){
					init()
				}
			};
			function init(){
				  var display, key, plot, text;

					$http.get('timeline/'+$rootScope.testphrase).
					then(function(res){

						res.data.sort(function(a, b) {
						    return parseFloat(b.count) - parseFloat(a.count);
						});

						$rootScope.bubbleData = res.data.slice(0,50);
						$location.path("/monitor");						
					},function(err){
						console.log(err);
					});
			}
		});

		app.controller('bubbleController', function($scope,$rootScope,$timeout,$location,$http){
			if(!$rootScope.testphrase)
				$location.path('/');
			else{
				$rootScope.showLoader= false;
				$scope.feeds=[];
				console.log($rootScope.bubbleData)
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

				display($rootScope.bubbleData)
			}
		});

		return app; 
	}
);