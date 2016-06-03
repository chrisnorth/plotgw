var diameter = 800 //max size of the bubbles
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
function comparitor(a,b){
    return a.value * Math.random()- b.value*Math.random();
}
var dorandom=false;
if (dorandom){
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
    console.log('2',d.name,tooltip);
    tooltip.transition()
       .duration(200)
       .style("opacity", .9);
    tooltip.html(tttext(d))
       .style("left", (d3.event.pageX + 10) + "px")
       .style("top", (d3.event.pageY-10) + "px")
       .style("width","auto")
       .style("height","auto");
    svg.select('#hl'+d.id)
        .attr("stroke-opacity",1);
}
var hideTooltip = function(d) {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    svg.select('#hl'+d.id)
        .attr("stroke-opacity",0);
}

var data;

d3.json("json/bhcat.json", function(error, data){

    //convert numerical values from strings to numbers
    data = data.map(function(d){ d.value = +d["massBH"]; return d; });
    data.forEach(function(d){
        d.id = ('hl'+d.name).replace('+','').replace('(','').replace(')','').replace('-','')
        console.log(d.name,d.id);
    });
    //bubbles needs very specific format, convert data to this.
    var nodes = bubble.nodes({children:data}).filter(function(d) { return !d.children; });
    // var nodes = bubble.nodes({children:data}).filter(function(d) { return d.method=="Xray"; });

    //setup the chart
    var bubbles = svg.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".bubble")
        .data(nodes)
        .enter();

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
        .on("mouseover", function(d) {showTooltip(d);})
        .on("mouseout", function(d) {hideTooltip(d);});

    //format the text for each bubble
    bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d["name"]; })
        .style({
            "fill":function(d){return textcolor2(cValue(d));},
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 8) + "px"; }
        })
        .on("mouseover", function(d) {showTooltip(d);})
        .on("mouseout", function(d) {hideTooltip(d);;});

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