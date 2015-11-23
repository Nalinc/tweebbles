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

		app.controller('bubbleController', function($scope,$rootScope,$timeout,$interval,$location,$http){
			if(!$rootScope.testphrase)
				$location.path('/');
			else{
				$rootScope.showLoader= false;
				$scope.feeds=[];
				console.log($rootScope.bubbleData)
				window.plot = Bubbles();
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
		
/*	            var obj={
	                'user':data.user,
	                'text':data.text,
	                'created_at':data['created_at'],
	                'url':'http://www.twitter.com/'+data.user['screen_name']+'/status/'+data['id_str'],
	                'score':result.score,
	                'positive_count':result.positive.length,
	                'negative_count':result.negative.length,
	                'comparative':result.comparative,
	                'type':(parseInt(result.score)>0)?'positive':(((parseInt(result.score)<0)?'negative':'neutral'))
	            }*/

				$timeout(function(){
					console.log('now')
					//display(obj)

					if($rootScope.search.option=='user'){
						display($rootScope.bubbleData)
					}
					if($rootScope.search.option=='sentiment'){
						var obj = new bubbleStream();
						$interval(function(){
							var start = d3.min(obj.data, obj.dateFn)
							var end = d3.max(obj.data, obj.dateFn)
							var time = start.getTime() + Math.random() * (end.getTime() - start.getTime())
							var date = new Date(time)
	    					var sentiment_type = Math.floor(Math.random() * 3) 	
							objData = {
								'user': Math.floor(Math.random() * 70),
								'text':'Lorem ipsum dolor sit amet',
							    'created_at': date.toDateString(),
							    'url':'http://www.twitter.com/',
							    'score':'7',
								'positive_count':'3',
								'negative_count':'1',
								'comparative':'1',
								'horizontalPos': Math.floor(10 + Math.random() * obj.customWidth),
								'verticalPos': Math.floor(10 + Math.random() * obj.customHeight),
								'type': (sentiment_type>1)? 'positive':((sentiment_type<1)?'negative':'neutral')
							}
							console.log(objData.type)
							obj.data.push(objData)
							obj.refreshGraph()
						},1000) 
					}
				})
			}
		});

		return app; 
	}
);