var columns = {
    name:{code:"name",type:"str"},
    type:{code:"type",type:"str"},
    totalmass:{code:"totalmass",type:"flt",label:"Total Mass",
        avail:true,unit:'solar masses'},
    chirpmass:{code:"chirpmass",type:"flt",label:"Chirp Mass",
        avail:true,unit:'solar masses'},
    initmass1:{code:"initmass1",type:"flt",label:"Primary Mass",
        avail:true,unit:'solar masses'},
    initmass2:{code:"initmass2",type:"flt",label:"Secondary Mass",
        avail:true,unit:'solar masses'},
    finalmass:{code:"finalmass",type:"flt",label:"Final Mass",
        avail:true,unit:'solar masses'},
    massratio:{code:"massratio",type:"flt",label:"Mass Ratio",
        avail:true,unit:''},
    initspineff:{code:"initspineff",type:"flt",avail:false},
    initspin1:{code:"initspin1",type:"flt",avail:false},
    initspin2:{code:"initspin2",type:"flt",avail:false},
    finalspin:{code:"finalspin",type:"flt",avail:false},
    distance:{code:"distance",type:"flt",avail:false},
    redshift:{code:"redshift",type:"flt",avail:false},
    date:{code:"date",type:"date",avail:false},
    far:{code:"far",type:"flt",avail:false},
    fap:{code:"fap",type:"flt",avail:false},
    dtHL:{code:"dtHL",type:"flt",avail:false},
    sigma:{code:"sigma",type:"flt",avail:false},
    skyarea:{code:"skyarea",type:"flt",avail:false},
}

getLabel = function(col){
    return(columns[col].label);
}
getLabelUnit = function(col){
    if (columns[col].unit){
        return(columns[col].label+' ('+columns[col].unit+')');
    }else{
        return(columns[col].label);
    }
}

resizeGraph = function(){
    pageWidth = $(window).width()
    pageHeight = $(window).width()

}

// Add buttons to top of page
for (col in columns){
    if (columns[col].avail){
        var divx = document.getElementById('xoptions');
        var newoptdivx = document.createElement('div');
        newoptdivx.class = 'option '+col;
        newoptdivx.style.display = 'inline-block';
        divx.appendChild(newoptdivx);
        var newoptinputx = document.createElement('input');
        newoptinputx.type = 'button';
        newoptinputx.name = col;
        newoptinputx.value = getLabel(col);
        newoptinputx.addEventListener('click',function(){
            updateXaxis(this.name);
        });
        newoptdivx.appendChild(newoptinputx);

        var divy= document.getElementById('yoptions');
        var newoptdivy = document.createElement('div');
        newoptdivy.class = 'option '+col;
        newoptdivy.style.display = 'inline-block';
        divy.appendChild(newoptdivy);
        var newoptinputy = document.createElement('input');
        newoptinputy.type = 'button';
        newoptinputy.name = col;
        newoptinputy.value = getLabel(col);
        newoptinputy.addEventListener('click',function(){
            updateYaxis(this.name);
        });
        newoptdivy.appendChild(newoptinputy);
    }
}


// var margin = {top: 20, right: 60, bottom: 50, left: 60}
var margin = {top: 20, right: 60, bottom: 50, left: 60}
var marginSketch = {top: 0, right: 0, bottom: 0, left: 0}
var width = document.getElementById("graphcontainer").offsetWidth - margin.left - margin.right;
var height = document.getElementById("graphcontainer").offsetHeight - margin.top - margin.bottom;

var marginSketch = {top: 0, right: 0, bottom: 0, left: 0}
var widthSketch = document.getElementById("sketchcontainer").offsetWidth - marginSketch.left - marginSketch.right;
var heightSketch = document.getElementById("sketchcontainer").offsetHeight - marginSketch.top - marginSketch.bottom;

//set axes
var xvar = "initmass1", yvar = "initmass2"

// setup x
var xValue = function(d) { return d[xvar];} // data -> value
var xScale = d3.scale.linear().range([0, width]) // value -> display
var xMap = function(d) { return xScale(xValue(d));} // data -> display
var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .innerTickSize(-height);

// setup y
var yValue = function(d) { return d[yvar];} // data -> value
var yScale = d3.scale.linear().range([height, 0]) // value -> display
var yMap = function(d) { return yScale(yValue(d));} // data -> display
var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .innerTickSize(-width);

// setup fill color
var cValue = function(d) {return d.type;},
    color = d3.scale.category10();

var tttext = function(d){
  return("<span class='ttname'>"+d["name"]+"</span>"+
  "<span class='ttx'>"+columns[xvar].label+": "+xValue(d)+
  " "+columns[xvar].unit+"</span>"+
  "<span class='tty'>"+columns[yvar].label+": "+yValue(d)+
  " "+columns[yvar].unit+"</span>");
}

// var svg = d3.select("div.svg-container").append("svg")
var svg = d3.select("div#graphcontainer").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// add the tooltip area to the webpage
var tooltip = d3.select("div#graphcontainer").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var svgSketch = d3.select("div#sketchcontainer").append("svg")
    .attr("width", widthSketch + marginSketch.left + marginSketch.right)
    .attr("height", heightSketch + marginSketch.top + marginSketch.bottom)
    .append("g")
    .attr("transform", "translate(" + marginSketch.left + "," + marginSketch.top + ")");
var sketchName;
var skPri = svgSketch.append("circle")
    .attr("class","sketch pri")
    .attr("cx",30)
    .attr("cy",30)
    .attr("r",20);

var skSec = svgSketch.append("circle")
    .attr("class","sketch sec")
    .attr("cx",120)
    .attr("cy",30)
    .attr("r",10);

var skFin = svgSketch.append("circle")
    .attr("class","sketch final")
    .attr("cx",60)
    .attr("cy",120)
    .attr("r",30);

//set global variable for later use
var data;

// load data
d3.csv("csv/gwcat.csv", function(error, data) {

    // change string (from CSV) into number format
    var dataIn=data;
    dataIn.forEach(function(d) {
        for (col in columns){
            if (columns[col].type=="flt"){d[col] = +d[col]}
        }
    });

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    // x-axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "x label")
      .attr("x", width)
      .attr("y", "2em")
      .style("text-anchor", "end")
      .text(getLabelUnit(xvar));

    // y-axis
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "y label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-30px")
      .style("text-anchor", "end")
      .text(getLabelUnit(yvar));

    // draw dots
    svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 7)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));})
      .on("mouseover", function(d) {
        tooltip.transition()
           .duration(200)
           .style("opacity", .9);
        tooltip.html(tttext(d))
           .style("left", (d3.event.pageX + 10) + "px")
           .style("top", (d3.event.pageY - 28) + "px")
           .style("width","auto")
           .style("height","auto");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
        //   document.getElementById("sketchcontainer").style.opacity=0.;
      })
      .on("click", function(d) {
          if ((document.getElementById("sketchcontainer").classList.contains("nothidden"))&&(sketchName==d["name"])){
              document.getElementById("sketchcontainer").classList.remove("nothidden");
              document.getElementById("sketchcontainer").classList.add("hidden");
          }else{
              svgSketch.select('circle.pri')
               .transition().duration(200)
               .attr("r",d["initmass1"]);
              svgSketch.select('circle.sec')
               .transition().duration(200)
               .attr("r",d["initmass2"]);
              svgSketch.select('circle.final')
               .transition().duration(200)
               .attr("r",d["finalmass"]);
              document.getElementById("sketchcontainer").classList.remove("hidden");
              document.getElementById("sketchcontainer").classList.add("nothidden");
            //   document.getElementById("sketchcontainer").style.opacity = 1.;
              sketchName=d["name"];
          }
      });

    // draw legend
    var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
      .attr("x", width + 24)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    // draw legend text
    legend.append("text")
      .attr("x", width + 18)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})
});



function updateXaxis(xvarNew) {
    // set global variable
    xvar = xvarNew;

    d3.csv("csv/gwcat.csv", function(error, data) {

        // change string (from CSV) into number format
        data.forEach(function(d) {
            for (col in columns){
                if (columns[col].type=="flt"){d[col] = +d[col]}
            }
        });
        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([d3.min(data, xValue)-2, d3.max(data, xValue)+2]);

        // Select the section we want to apply our changes to
        var svg = d3.select("body").transition();

        // Make the changes
        svg.selectAll(".dot")   // change the line
          .duration(750)
          .attr("cx", xMap)
        svg.select(".x.axis") // change the x axis
          .duration(750)
          .call(xAxis);
        svg.select(".x.label")
            .duration(750)
            .text(getLabelUnit(xvar));
    });

}

function updateYaxis(yvarNew) {
    // set global variable
    yvar = yvarNew;

    d3.csv("csv/gwcat.csv", function(error, data) {

        // change string (from CSV) into number format
        data.forEach(function(d) {
            for (col in columns){
                if (columns[col].type=="flt"){d[col] = +d[col]}
            }
        });
        // don't want dots overlapping axis, so add in buffer to data domain
        yScale.domain([d3.min(data, yValue)-2, d3.max(data, yValue)+2]);

        // Select the section we want to apply our changes to
        var svg = d3.select("body").transition();

        // Make the changes
        svg.selectAll(".dot")   // change the line
          .duration(750)
          .attr("cy", yMap)
        svg.select(".y.axis") // change the y axis
          .duration(750)
          .call(yAxis);
        svg.select(".y.label")
            .duration(750)
            .text(getLabelUnit(yvar));
    });

}
