// Code goes here

(function() {
  var JSONData = [
  { "id": 3, "created_at": "Sun May 05 2013", "amount": 12000},
  { "id": 1, "created_at": "Mon May 13 2013", "amount": 2000},
  { "id": 2, "created_at": "Thu Jun 06 2013", "amount": 17000},
  { "id": 4, "created_at": "Thu May 09 2013", "amount": 15000},
  { "id": 5, "created_at": "Mon Jul 01 2013", "amount": 16000}
]
  var data = JSONData.slice()
  var format = d3.time.format("%a %b %d %Y")
  var amountFn = function(d) { return d.amount }
  var dateFn = function(d) { return format.parse(d.created_at) }

  var x = d3.time.scale()
    .range([10, 980])
    .domain(d3.extent(data, dateFn))

  var y = d3.scale.linear()
    .range([980, 10])
    .domain(d3.extent(data, amountFn))
  
  

  var svg = d3.select("#demo").append("svg:svg")
  .attr("width", 981)
  .attr("height", 510)

  var refreshGraph = function() {
    x.domain(d3.extent(data, dateFn))
    y.domain(d3.extent(data, amountFn))
  
    var circles = svg.selectAll("circle").data(data).enter()
   .append("svg:circle")
   .attr("r", 10)
   .attr("cx", function(d) { return x(dateFn(d)) })
   .attr("cy", function(d) { return y(amountFn(d)) })
   .attr("style", "cursor: pointer;")
   .on("click", function(d) {
      d3.select("#demo-footer .value").text("Date: " + d.created_at + " amount: " + d.amount)
   })
    
    
    circles.transition()
     .attr("cx", function(d) { return x(dateFn(d)) })
     .attr("cy", function(d) { return y(amountFn(d)) })
  
     circles.enter()
      .append("svg:circle")
      .attr("r", 10)
      .attr("cx", function(d) { return x(dateFn(d)) })
      .attr("cy", function(d) { return y(amountFn(d)) })
  }

   svg.selectAll("circle")
   .data(JSONData, function(d) {
     return d.created_at
   });
   
/*  d3.selectAll(".add-data")
   .on("click", function() {
     var start = d3.min(data, dateFn)
     var end = d3.max(data, dateFn)
     var time = start.getTime() + Math.random() * (end.getTime() - start.getTime())
     var date = new Date(time)

     obj = {
       'id': Math.floor(Math.random() * 70),
       'amount': Math.floor(1000 + Math.random() * 20001),
       'created_at': date.toDateString()
     }
     data.push(obj)
     refreshGraph()
  })
*/
	setInterval(function(){
	    var start = d3.min(data, dateFn)
	    var end = d3.max(data, dateFn)
	    var time = start.getTime() + Math.random() * (end.getTime() - start.getTime())
	    var date = new Date(time)

	    obj = {
	      'id': Math.floor(Math.random() * 70),
	      'amount': Math.floor(1000 + Math.random() * 20001),
	      'created_at': date.toDateString()
	    }
	    data.push(obj)
	    refreshGraph()
	},2000)	
  refreshGraph()

})();