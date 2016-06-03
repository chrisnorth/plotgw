var diameter = Math.min(document.getElementById("bubble-container").offsetWidth,document.getElementById("bubble-container").offsetHeight);
// document.getElementById("hdr").setAttribute("width",diameter);
document.getElementById("bubble-container").setAttribute("width",diameter);
console.log(document.getElementById("hdr"));
// var diameter = 800 //max size of the bubbles
    // color    = d3.scale.category10(); //color category
var fillcolor2 = d3.scale.linear().domain([1,2,3])
        .range([d3.rgb("#ccccFF"), d3.rgb("#0000FF"), d3.rgb('#FFFFFF')])
var textcolor2 = d3.scale.linear().domain([1,2,3])
        .range([d3.rgb("#000000"), d3.rgb("#00ff00"),d3.rgb('#000000')])
var cVals={GWinit:1,GWfin:2,Xray:3};
// var cValue = function(d){if(d.method=="GW"){return 1;}else{return 2;};};
var cValue = function(d){return cVals[d.method]}
var legenddescs = {3:'X-rays',1:'Gravitaional Waves'}


// random comparitor
function randomcomparitor(a,b){
    return a.value * Math.random()- b.value*Math.random();
}
function reversemasscomparitor(a,b){
    return b.value - a.value;
}
var sort="";
if (sort=="random"){
    var bubble = d3.layout.pack()
        .sort(comparitor)
        .size([diameter, diameter])
        .padding(15);
}else{
    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(15);
}

var svg = d3.select("div#bubble-container")
    .append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");


var tooltip = d3.select("div#bubble-container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//define tooltip text
var tttext = function(d){
    text =  "<span class='ttname'>"+d["name"]+"</span>"+
    "<span class='mass'>Mass= "+d["massBH"]+" Msun</span>";
    if (d["method"]=="GWinit"){
        text = text+ "<span class='mass'>Merging black hole</span>";
    }else if(d["method"]=='GWfin'){
        text = text+ "<span class='mass'>Merged black hole</span>";
    }else if(d["method"]=='Xray'){
        text = text+ "<span class='mass'>X-ray detection</span>";
    }
    // "<span class='mass'>"+d["compName"]+"</span>"+
    // "<span class='mass'>"+d["initmass2"]+"</span>";
    return text;
}
//set tooltip functions
var showTooltip = function(d){
    // console.log('2',d.name,tooltip);
    tooltip.transition()
       .duration(200)
       .style("opacity", .9);
    tooltip.html(tttext(d))
       .style("left", (d3.event.pageX + 10) + "px")
       .style("top", (d3.event.pageY-10) + "px")
       .style("width","auto")
       .style("height","auto");
    svg.select('#hl'+d.id)
        .transition(500)
        .attr("stroke-opacity",1);
}
var hideTooltip = function(d) {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    svg.select('#hl'+d.id)
        .transition(500)
        .attr("stroke-opacity",0);
}

var data;

d3.csv("csv/bhcat.csv", function(error, data){

    //convert numerical values from strings to numbers
    data = data.map(function(d){ d.value = +d["massBH"]; return d; });

    //bubbles needs very specific format, convert data to this.
    var nodes = bubble.nodes({children:data}).filter(function(d) { return !d.children; });
    // var nodes = bubble.nodes({children:data}).filter(function(d) { return d.method=="Xray"; });
    var arrows=[];
    var arrowpos = {};
    data.forEach(function(d){
        d.id = ('hl'+d.name).replace('+','').replace('(','').replace(')','').replace('-','')
        // console.log(d.name,d.id);
        if ((d.method=="GWinit")||(d.method=="GWfin")){
            arrowpos[d.name]={x:d.x,y:d.y,r:d.r,c:fillcolor2(cValue(d))};
        }
        if (d.compType=="Black hole"){
            arrows.push([d.name,d.compName]);
        }
    });
    // console.log(arrows);
    //setup the chart
    var bubbles = svg.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".bubble")
        .data(nodes)
        .enter();

    addline = function(i){
      x1=arrowpos[arrows[i][0]].x;
      x2=arrowpos[arrows[i][1]].x;
      y1=arrowpos[arrows[i][0]].y;
      y2=arrowpos[arrows[i][1]].y;
      svg.append("line")
          .attr("x1",x1).attr("x2",x2).attr("y1",y1).attr("y2",y2)
          .style({"stroke":"red","stroke-width":2});
    }
    addtriangle = function(i){
      r1=arrowpos[arrows[i][0]].r;
      r2=arrowpos[arrows[i][1]].r;
      x1=arrowpos[arrows[i][0]].x;
      x2=arrowpos[arrows[i][1]].x;
      y1=arrowpos[arrows[i][0]].y;
      y2=arrowpos[arrows[i][1]].y;
      col=arrowpos[arrows[i][0]].c;
    //   console.log(col);
      ang = Math.atan2((y2-y1),(x2-x1));
      x1r1 = x1 + r1*Math.sin(ang);
      x1r2 = x1 - r1*Math.sin(ang);
      y1r1 = y1 - r1*Math.cos(ang);
      y1r2 = y1 + r1*Math.cos(ang);;
      points = x1r1+","+y1r1+" "+x1r2+","+y1r2+" "+x2+","+y2;
      bubbles.append("polygon")
          .attr("points",points)
          .attr("fill",col);
        //   .style({"stroke":"red","stroke-width":2});
    }
    addpolygon = function(i){
      r1=arrowpos[arrows[i][0]].r;
      r2=arrowpos[arrows[i][1]].r;
      x1=arrowpos[arrows[i][0]].x;
      x2=arrowpos[arrows[i][1]].x;
      y1=arrowpos[arrows[i][0]].y;
      y2=arrowpos[arrows[i][1]].y;
      col=arrowpos[arrows[i][0]].c;
    //   console.log(col);
      ang = Math.atan2((y2-y1),(x2-x1));
      x1r1 = x1 + r1*Math.sin(ang);
      x1r2 = x1 - r1*Math.sin(ang);
      y1r1 = y1 - r1*Math.cos(ang);
      y1r2 = y1 + r1*Math.cos(ang);
      x2r1 = (r1*x2+r2*x1)/(r1+r2) + r1*Math.sin(ang)/2;
      x2r2 = (r1*x2+r2*x1)/(r1+r2) - r1*Math.sin(ang)/2;
      y2r1 = (r1*y2+r2*y1)/(r1+r2) - r1*Math.cos(ang)/2;
      y2r2 = (r1*y2+r2*y1)/(r1+r2) + r1*Math.cos(ang)/2;
      x3r1 = x2 + r2*Math.sin(ang);
      x3r2 = x2 - r2*Math.sin(ang);
      y3r1 = y2 - r2*Math.cos(ang);
      y3r2 = y2 + r2*Math.cos(ang);
      points = x1r1+","+y1r1+" "+x2r1+","+y2r1+" "+x3r1+","+y3r1+
        " "+x3r2+","+y3r2+" "+x2r2+","+y2r2+" "+x1r2+","+y1r2;
    //   linedata = [{"x":x1r1,"y":y1r1},]
    //   console.log(points);
      bubbles.append("polygon")
          .attr("points",points)
          .attr("fill",col);
        //   .style({"stroke":"red","stroke-width":2});
    }
    addcurve = function(i){
        r1=arrowpos[arrows[i][0]].r;
        r2=arrowpos[arrows[i][1]].r;
        x1=arrowpos[arrows[i][0]].x;
        x2=arrowpos[arrows[i][1]].x;
        y1=arrowpos[arrows[i][0]].y;
        y2=arrowpos[arrows[i][1]].y;
        col=arrowpos[arrows[i][0]].c;
        //   console.log(col);
        ang = Math.atan2((y2-y1),(x2-x1));
        r1s=r1*Math.sin(ang);
        r1c=r1*Math.cos(ang);
        r2s=r2*Math.sin(ang);
        r2c=r2*Math.cos(ang);
        x1r1 = x1 + r1s;
        x1r2 = x1 - r1s;
        y1r1 = y1 - r1c;
        y1r2 = y1 + r1c;
        x2r1 = (r1*x2+r2*x1)/(r1+r2) + r1s/2;
        x2r2 = (r1*x2+r2*x1)/(r1+r2) - r1s/2;
        y2r1 = (r1*y2+r2*y1)/(r1+r2) - r1c/2;
        y2r2 = (r1*y2+r2*y1)/(r1+r2) + r1c/2;
        x3r1 = x2 + r2s*.75;
        x3r2 = x2 - r2s*.75;
        y3r1 = y2 - r2c*.75;
        y3r2 = y2 + r2c*.75;
        // points = "M"+x1r1+","+y1r1+" L"+x2r1+","+y2r1+" L"+x3r1+","+y3r1+
        // " L"+x3r2+","+y3r2+" L"+x2r2+","+y2r2+" L"+x1r2+","+y1r2;
        lineData = [{"x":x1r1,"y":y1r1},{"x":x2r1,"y":y2r1},{"x":x3r1,"y":y3r1},
            {"x":x3r2,"y":y3r2},{"x":x2r2,"y":y2r2},{"x":x1r2,"y":y1r2}];
        lineFunc = d3.svg.line()
            .x(function(d){return d.x;})
            .y(function(d){return d.y;})
            .interpolate("cardinal")
    //   console.log(points);
      bubbles.append("path")
          .attr("d",lineFunc(lineData))
          .attr("class","merger")
          .attr("fill",col);
        //   .attr("opacity",0.5)
        //   .style({"stroke":"red","stroke-width":2,"opacity":0.5});
    }
    for (i in arrows){
        // addtriangle(i);
        // addpolygon(i);
        addcurve(i);
    }
    svg.selectAll("path.merger")
        .attr("opacity",0.5);
    //create highlight circles
    bubbles.append("circle")
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .attr("id",function(d){return 'hl'+d.id;})
        .attr("fill-opacity",0)
        .attr("stroke-opacity",0)
        .style({"stroke":"red","stroke-width":10})

    //create the bubbles
    bubbles.append("circle")
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .attr("id",function(d){return d.id;})
        .style("fill", function(d){return fillcolor2(cValue(d))})
        .style({"stroke":"#000000","stoke-width":1})
        .on("mouseover", function(d) {showTooltip(d);})
        .on("mouseout", function(d) {hideTooltip(d);});

    //format the text for each bubble
    getText = function(d){
        if (d.method=="GWinit"){return "";}else{return d.name}
    }
    bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d){ return getText(d); })
        .style({
            "fill":function(d){return textcolor2(cValue(d));},
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 8) + "px"; }
        })
        .on("mouseover", function(d) {showTooltip(d);})
        .on("mouseout", function(d) {hideTooltip(d);;});
    // for (i in arrows){
    //     // addtriangle(i);
    //     addcurve(i);
    // }

    var legend = svg.selectAll(".legend")
      .data(fillcolor2.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("opacity",0)
      .attr("transform", function(d, i) { return "translate(0," +(i * 24) + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
      .attr("x", 12)
      .attr("y",12)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", fillcolor2)
    //   .style("stroke",function(d){return linestyles[d.method];})
      .style("stroke","#000");

    // draw legend text
    legend.append("text")
      .attr("x", 36)
      .attr("y", 21)
      .attr("dy", ".35em")
      .attr("font-size","1.2em")
      .style("fill","#fff")
      .style("text-anchor", "start")
      .text(function(d){return legenddescs[d];});

    // console.log(data);
        // console.log(d.name,d.method,cValue(d),legenddescs[d.method],fillcolor2(cValue(d)),textcolor2(cValue(d)));
    // });
})

//make SVG download button
d3.select("#generate")
    .on("click", writeDownloadLink);

function writeDownloadLink(){
    try {
        var isFileSaverSupported = !!new Blob();
    } catch (e) {
        alert("blob not supported");
    }

    var html = d3.select("svg.bubble")
        .attr("title", "test2")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    var blob = new Blob([html], {type: "image/svg+xml"});
    saveAs(blob, "Black-holes.svg");
};