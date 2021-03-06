var Bubbles, root, texts;

root = typeof exports !== "undefined" && exports !== null ? exports : this;

Bubbles = function() {
  var chart, clear, click, collide, collisionPadding, connectEvents, data, force, gravity, hashchange, height, idValue, jitter, label, margin, maxRadius, minCollisionRadius, mouseout, mouseover, node, rScale, rValue, textValue, tick, transformData, update, updateActive, updateLabels, updateNodes, width;
  width = 980;
  height = 510;
  data = [];
  node = null;
  label = null;
  margin = {
    top: 5,
    right: 0,
    bottom: 0,
    left: 0
  };
  maxRadius = 65;
  rScale = d3.scale.sqrt().range([0, maxRadius]);
  rValue = function(d) {
    return parseInt(d.count);
  };
  idValue = function(d) {
    return d.name;
  };
  textValue = function(d) {
    return d.name;
  };
  collisionPadding = 4;
  minCollisionRadius = 12;
  jitter = 0.5;
  transformData = function(rawData) {
    rawData.forEach(function(d) {
      d.count = parseInt(d.count);
      return rawData.sort(function() {
        return 0.5 - Math.random();
      });
    });
    return rawData;
  };
  tick = function(e) {
    var dampenedAlpha;
    dampenedAlpha = e.alpha * 0.1;
    node.each(gravity(dampenedAlpha)).each(collide(jitter)).attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
    return label.style("left", function(d) {
      return ((margin.left + d.x) - d.dx / 2) + "px";
    }).style("top", function(d) {
      return ((margin.top + d.y) - d.dy / 2) + "px";
    });
  };
  force = d3.layout.force().gravity(0).charge(0).size([width, height]).on("tick", tick);
  chart = function(selection) {
    return selection.each(function(rawData) {
      var maxDomainValue, svg, svgEnter;
      data = transformData(rawData);
      maxDomainValue = d3.max(data, function(d) {
        return rValue(d);
      });
      rScale.domain([0, maxDomainValue]);
      svg = d3.select(this).selectAll("svg").data([data]);
      svgEnter = svg.enter().append("svg");
      svg.attr("width", "100%");
      svg.attr("height", height + margin.top + margin.bottom);
      node = svgEnter.append("g").attr("id", "bubble-nodes").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      node.append("rect").attr("id", "bubble-background").attr("width", width).attr("height", height).on("click", clear);
      label = d3.select(this).selectAll("#bubble-labels").data([data]).enter().append("div").attr("id", "bubble-labels");
      update();
      hashchange();
      return d3.select(window).on("hashchange", hashchange);
    });
  };
  update = function() {
    data.forEach(function(d, i) {
      return d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)));
    });
    force.nodes(data).start();
    updateNodes();
    return updateLabels();
  };
  updateNodes = function() {
    node = node.selectAll(".bubble-node").data(data, function(d) {
      return idValue(d);
    });
    node.exit().remove();
    return node.enter().append("a").attr("class", "bubble-node").attr("xlink:href", function(d) {
      return "#" + (encodeURIComponent(idValue(d)));
    }).call(force.drag).call(connectEvents).append("circle").attr("r", function(d) {
      return rScale(rValue(d));
    });
  };
  updateLabels = function() {
    var labelEnter;
    label = label.selectAll(".bubble-label").data(data, function(d) {
      return idValue(d);
    });
    label.exit().remove();
    labelEnter = label.enter().append("a").attr("class", "bubble-label").attr("href", function(d) {
      return "#" + (encodeURIComponent(idValue(d)));
    }).call(force.drag).call(connectEvents);
    labelEnter.append("div").attr("class", "bubble-label-name").text(function(d) {
      return textValue(d);
    });
    labelEnter.append("div").attr("class", "bubble-label-value").text(function(d) {
      return rValue(d);
    });
    label.style("font-size", function(d) {
      return Math.max(8, rScale(rValue(d) / 2)) + "px";
    }).style("width", function(d) {
      return 2.5 * rScale(rValue(d)) + "px";
    });
    label.append("span").text(function(d) {
      return textValue(d);
    }).each(function(d) {
      return d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width);
    }).remove();
    label.style("width", function(d) {
      return d.dx + "px";
    });
    return label.each(function(d) {
      return d.dy = this.getBoundingClientRect().height;
    });
  };
  gravity = function(alpha) {
    var ax, ay, cx, cy;
    cx = width / 2;
    cy = height / 2;
    ax = alpha / 8;
    ay = alpha;
    return function(d) {
      d.x += (cx - d.x) * ax;
      return d.y += (cy - d.y) * ay;
    };
  };
  collide = function(jitter) {
    return function(d) {
      return data.forEach(function(d2) {
        var distance, minDistance, moveX, moveY, x, y;
        if (d !== d2) {
          x = d.x - d2.x;
          y = d.y - d2.y;
          distance = Math.sqrt(x * x + y * y);
          minDistance = d.forceR + d2.forceR + collisionPadding;
          if (distance < minDistance) {
            distance = (distance - minDistance) / distance * jitter;
            moveX = x * distance;
            moveY = y * distance;
            d.x -= moveX;
            d.y -= moveY;
            d2.x += moveX;
            return d2.y += moveY;
          }
        }
      });
    };
  };
  connectEvents = function(d) {
    d.on("click", click);
    d.on("mouseover", mouseover);
    return d.on("mouseout", mouseout);
  };
  clear = function() {
    updateActive("")
    return location.replace("#" + decodeURIComponent(location.hash.substring(1)).trim());
  };
  click = function(d) {
    updateActive(encodeURIComponent(idValue(d)))
//    location.replace("#" + encodeURIComponent(idValue(d)));
    return d3.event.preventDefault();
  };
  hashchange = function() {
    return updateActive("");
  };
  updateActive = function(id) {
    node.classed("bubble-selected", function(d) {
      return id === idValue(d);
    });
    if (id.length > 0) {
      return d3.select("#status").html("<h3>The word <span class=\"active\">" + decodeURIComponent(id) + "</span> is now active</h3>");
    } else {
      return d3.select("#status").html("<h3>No word is active</h3>");
    }
  };
  mouseover = function(d) {
    return node.classed("bubble-hover", function(p) {
      return p === d;
    });
  };
  mouseout = function(d) {
    return node.classed("bubble-hover", false);
  };
  chart.jitter = function(_) {
    if (!arguments.length) {
      return jitter;
    }
    jitter = _;
    force.start();
    return chart;
  };
  chart.height = function(_) {
    if (!arguments.length) {
      return height;
    }
    height = _;
    return chart;
  };
  chart.width = function(_) {
    if (!arguments.length) {
      return width;
    }
    width = _;
    return chart;
  };
  chart.r = function(_) {
    if (!arguments.length) {
      return rValue;
    }
    rValue = _;
    return chart;
  };
  return chart;
};

root.plotData = function(selector, data, plot) {
  return d3.select(selector).datum(data).call(plot);
};

texts = [
  {
    key: "sherlock",
    file: "top_sherlock.json",
    name: "The Adventures of Sherlock Holmes"
  }
];

/*------------------------------------------------------------
 *dynamic bubbles
------------------------------------------------------------*/
function bubbleStream(){

  this.customHeight = window.innerHeight - 300;
  this.customWidth = window.innerWidth - 300;  

  this.JSONData = []

  this.data = this.JSONData.slice()
  this.format = d3.time.format("%a %b %d %Y")
  var that = this;

  this.verticalPosFn = function(d) { return d.verticalPos }
  this.dateFn = function(d) { return that.format.parse(d.created_at) }

  this.x = d3.time.scale().range([10, this.customWidth]).domain(d3.extent(this.data, this.dateFn))

  this.y = d3.scale.linear().range([this.customWidth, 10]).domain(d3.extent(this.data, this.verticalPosFn))
  
  
  this.svg = d3.select("#demo").append("svg:svg").attr("width", this.customWidth).attr("height", this.customHeight);
  $('#demo svg').attr("class", ' stream ')

  this.refreshGraph = function() {
    that.x.domain(d3.extent(that.data, that.dateFn))
    that.y.domain(d3.extent(that.data, that.verticalPosFn))
  
    this.circles = that.svg.selectAll("circle").data(that.data).enter()
     .append("svg:circle")
     .attr("r", function(d){ return 10+2*Math.abs(d.score) })
     .attr("cx", function(d) { return d.horizontalPos })
     .attr("cy", function(d) { return d.verticalPos })
     .attr("style", "cursor: pointer;")
     .attr('class', function(d) { return d.type })
     .on("click", function(d) {

        $('#userprofileurl').attr('src',d.user['profile_image_url']);
        console.log(d)
        that.openOverlay('#overlay-inAbox');

        if(d.type=='positive')
          $('#overlay-shade').css({'background-color':'darkseagreen'})
        else if(d.type=='negative')
          $('#overlay-shade').css({'background-color':'lightcoral'})
        else
          $('#overlay-shade').css({'background-color':'lightblue'})
          
        d3.select('#twitteruser').text(d.user['name']);
        d3.select('#twitterusername').text('@'+d.user['screen_name']);
        d3.select('#usertweet').text(d.text);
        d3.select('#tweeturl').attr('href',d.url);

        event.stopPropagation();
      })
    
    this.circles.transition()
     .attr("cx", function(d) { return d.horizontalPos })
     .attr("cy", function(d) { return d.verticalPos })
   
  }

  this.svg.selectAll("circle")
   .data(this.JSONData, function(d) {
     return d.created_at
   });
  
  that.refreshGraph();
  
  $(document).on('click',function(){
    $('#demo-footer').hide();
    $('#meta-stats').show();
  });

  $('#overlay-shade, .overlay a').live('click', function(e) {
    that.closeOverlay();
    if ($(this).attr('href') == '#') e.preventDefault();
  });
  this.closeOverlay = function() {
    $('.overlay').animate({
        top : '-=300',
        opacity : 0
    }, 400, function() {
        $('#overlay-shade').fadeOut(300);
        $(this).css('display','none');
    });
  }

  this.openOverlay =function (olEl){
        $oLay = $(olEl);
        
        if ($('#overlay-shade').length == 0)
            $('body').prepend('<div id="overlay-shade"></div>');

        $('#overlay-shade').fadeTo(300, 0.6, function() {
            var props = {
                oLayWidth       : $oLay.width(),
                scrTop          : $(window).scrollTop(),
                viewPortWidth   : $(window).width()
            };

            var leftPos = (props.viewPortWidth - props.oLayWidth) / 2;

            $oLay
                .css({
                    display : 'block',
                    'border-radius': '10px',
                    opacity : 0,
                    top : '-=300',
                    left : leftPos+'px'
                })
                .animate({
                    top : props.scrTop + 60,
                    opacity : 1
                }, 300);
        });
    }


}

$(function() {

});