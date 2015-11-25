define(['vis','jqueryui'], function() {

		var app = angular.module('app', ['ngRoute']);
		var socket;	
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
		 	app.directive("ngHeader",function(){
		 		return{
		 			restrict:'E',
					templateUrl:'views/ng-header.html',
					controller:function($rootScope){
						$rootScope.$on('$routeChangeStart', function(event, next, current) {
							$rootScope.showLoader= true;
						});
						$rootScope.$on('$routeChangeSuccess', function(event, next, current) {
							$rootScope.showLoader= false;
						});			
					}
		 		};
		 	});
		app.controller('homeController', function($scope,$rootScope,$location,$http){
			if(socket){
				socket.emit('disconnect',$rootScope.testphrase);
			}
			$scope.appname = '< Tweebbles >';
			$rootScope.search = {
				'option': 'user'
			}
			$scope.PHtext = {
				'user':'Enter a twitter handle',
				'trend':'Enter a place',
				'sentiment':'Enter a phrase'
			}

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
					$rootScope.showLoader=true;
					init()
				}
			};
			function init(){
				var display, key, plot, text, url_base;
				if($rootScope.search.option=='user')
					url_base = 'timeline/'
				else if($rootScope.search.option=='sentiment')
					url_base = 'sentiment/'

				$http.get(url_base+$rootScope.testphrase).
				then(function(res){
					if(res.data.constructor == Array){
						res.data.sort(function(a, b) {
						    return parseFloat(b.count) - parseFloat(a.count);
						});
						$rootScope.bubbleData = res.data.slice(0,50);						
					}

					$location.path("/monitor");						
				},function(err){
					console.log(err);
				});
			}
		});

		app.controller('bubbleController', function($scope,$rootScope,$timeout,$interval,$location,$http){
			if(!$rootScope.testphrase)
				$location.path('/');
			else{
				$rootScope.showLoader= false;
				$scope.feeds=[];
		
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

				$timeout(function(){
					if($rootScope.search.option=='user'){
						window.plot = Bubbles();
						display($rootScope.bubbleData)
					}
					if($rootScope.search.option=='sentiment'){
						var obj = new bubbleStream();
						socket = io.connect(window.location.hostname);
						socket.emit('monitor',$rootScope.testphrase);
						var counter = 0
						socket.on('feedsupdate',function(res){
							$('#numberOfTweets').text(counter++);
							res.verticalPos = Math.floor(10 + Math.random() * obj.customHeight);
							res.horizontalPos = Math.floor(10 + Math.random() * obj.customWidth);
							obj.data.push(res)
							obj.refreshGraph()
						})

						$scope.pauseMonitoring = function(){
							socket.emit('pauseStreaming',$rootScope.testphrase);
						}

						$scope.resumeMonitoring = function(){
							socket.emit('monitor',$rootScope.testphrase);
						}
						$scope.reset = function(){
							socket.emit('pauseStreaming',$rootScope.testphrase);
							$location.path('/');
						}				
						$scope.changeState = function(){
							if($scope.monitoringPhase=='pause'){
								$scope.monitoringPhase='resume'
								$scope.pauseMonitoring();
							}
							else{
								$scope.monitoringPhase='pause'
								$scope.resumeMonitoring();
							}
						}
					}
				})
			}
		});

		return app; 
	}
);