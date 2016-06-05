// var diameter = Math.min(document.getElementById("bubble-container").offsetWidth,document.getElementById("bubble-container").offsetHeight);
// // document.getElementById("hdr").setAttribute("width",diameter);
// document.getElementById("bubble-container").setAttribute("width",diameter);
// console.log(document.getElementById("hdr"));
var pgWidth = document.getElementById("bubble-container").offsetWidth;
var diameter = 800 //max size of the bubbles
    // color    = d3.scale.category10(); //color category
var fillcolor2 = d3.scale.linear().domain([1,2,3])
        .range([d3.rgb("#ccccFF"), d3.rgb("#0000FF"), d3.rgb('#FFFFFF')])
var textcolor2 = d3.scale.linear().domain([1,2,3])
        .range([d3.rgb("#000000"), d3.rgb("#ffffff"),d3.rgb('#000000')])
var cVals={LVT:1,GW:2,Xray:3};
// var cValue = function(d){if(d.method=="GW"){return 1;}else{return 2;};};
var cValue = function(d){return cVals[d.method]}
var legenddescs = {1:'Gravitational Wave Candidate',2:'Gravitational Wave Detection',3:'X-ray Measurement'}


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
    .append("svg").attr("class", "bubble")
    .attr("width", diameter).attr("height", diameter);

var tooltip = d3.select("div#bubble-container").append("div")
    .attr("class", "tooltip");
    // .style("opacity", 0);

var infopanelbg = d3.select("div#bubble-container").append("div")
    .attr("class","infopanelbg")
    .on("click",function(){hideInfopanel();});
var infopanelouter = d3.select("div#bubble-container").append("div")
    .attr("class","infopanelouter").attr("id","infopanel-outer");
var infopanel = d3.select("div#infopanel-outer").append("div")
        .attr("class","infopanel");
infopanelouter.append("div").attr("class","infoclose").html("<img src='img/close.png' title='close'>").on("click",function(){hideInfopanel();});

//define tooltip text
var tttext = function(d){
    text =  "<span class='name'>"+d["name"]+"</span>"+
    "<span class='info'>Mass: "+d["massBH"]+" M<sub>&#x2609;</sub></span>";
    if(d["method"]=='Xray'){
        // text = text+ "<span class='info'>X-ray detection</span>";
        text = text + "<span class='info'>"+d.binType+"</span>";
        text = text+ "<span class='info'>Companion: "+d.compType+"</span>";
    }else{
        text = text+ "<span class='info'>"+d.binType+
            " ("+d.BHtype+")</span>";
    }
    text = text+ "<span class='info'>Location: "+d.location+"</span>";
    return text;
}
//set tooltip functions
var showTooltip = function(d){
    // console.log('2',d.name,tooltip);
    getLeft = function(d){
        if (d.x > diameter/2){return (d3.event.pageX - 0.25*pgWidth - 10) + "px";}
        else{return (d3.event.pageX + 10) + "px";};
    }
    getTop = function(d){
        if (d.y > diameter/2){return (d3.event.pageY - 0.1*diameter - 10) + "px";}
        else{return (d3.event.pageY + 10) + "px";};
    }
    tooltip.transition()
       .duration(200)
       .style("opacity", .9);
    tooltip.html(tttext(d))
       .style("left", getLeft(d)).style("top", getTop(d))
       .style("width","25%").style("height","auto");
    svg.select('#hl'+d.id)
        .transition(500)
        .attr("stroke-opacity",1);
}
var hideTooltip = function(d) {
    tooltip.transition()
        .duration(500).style("opacity", 0);
    svg.select('#hl'+d.id)
        .transition(500).attr("stroke-opacity",0);
}

var iptext = function(d){
    //initialise reference number
    rx=1;
    text =  "<span class='name'>"+d["name"]+"</span>"+
    //BH mass
    "<span class='info'><b>Mass</b>: "+d["massBH"]+" M<sub>&#x2609;</sub>";
    if (d.ref3!='-'){text = text +
        " <sup>["+rx+"]</sup></span>";rbhm=rx;rx++;}
    else{text = text+"</span>"}
    text = text + "<span class='info'><b>Type</b>: "+d.binType+"</span>";
    if(d["method"]=='Xray'){
        // text = text+ "<span class='info'>X-ray detection</span>";
        //companion
        text = text+ "<span class='info'><b>Companion</b>: "+d.compType;
        if (d.ref2!="-"){text = text +
            " <sup>["+rx+"]</sup></span>";rct=rx;rx++;}
        else{text = text+"</span>"}
        //companion mass
        text = text+ "<span class='info'><b>Companion mass</b>: "+d.compMass+
        " M<sub>&#x2609;</sub>";
        if (d.ref1!="-"){text = text +
            " <sup>["+rx+"]</sup></span>";rcm=rx;rx++;}
        else{text = text+"</span>"}
        //period mass
        text = text+ "<span class='info'><b>Orbital period</b>: "+d.period+
        " days</sub>";
        if (d.ref4!="-"){text = text +
            " <sup>["+rx+"]</sup></span>";rper=rx;rx++;}
        else{text = text+"</span>"}
        text = text+ "<span class='info'><b>Location</b>: "+d.location+"</span>";
        if (rbhm){text = text + "<span class='ref'>["+rbhm+"] "+d.ref3+"</span>"}
        if (rct){text = text + "<span class='ref'>["+rct+"] "+d.ref2+"</span>"}
        if (rcm){text = text + "<span class='ref'>["+rcm+"] "+d.ref1+"</span>"}
        if (rcm){text = text + "<span class='ref'>["+rper+"] "+d.ref4+"</span>"}
    }else{
        text = text+ "<span class='info'>"+d.binType+
            " ("+d.BHtype+")</span>";
    }
    return text;
}
var showInfopanel = function(d){
    // fade in semi-transparent background layer (greys out image)
    infopanelbg.transition()
      .duration(500)
      .style({"opacity":0.5});
    infopanelbg.style("height","100%");
    //fade in infopanel
    infopanelouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    infopanel.html(iptext(d));
    infopanelouter.style("left", "25%").style("top", "25%")
       .style("width","50%").style("height","auto");

}
var hideInfopanel = function(d) {
    // fade out infopanel
    infopanelouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    infopanelouter.style("top","200%");
    // fade out semi-transparent background
    infopanelbg.transition()
      .duration(500)
      .style("opacity",0);
    infopanelbg.style("height",0);
    // d3.selectAll(".info").attr("opacity",0);
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
    var name2id=function(name){
        return name.replace('+','').replace('(','').replace(')','').replace('-','');
    };
    data.forEach(function(d){
        d.id = name2id(d.name)
        // console.log(d.name,d.id);
        if ((d.method=="GW")||(d.method=="LVT")){
            arrowpos[d.id]={x:d.x,y:d.y,r:d.r,c:fillcolor2(cValue(d))};
        }
        if (d.compType=="Black hole"){
            arrows.push([d.id,name2id(d.parentName)]);
        }
    });
    //setup the chart
    var bubbles = svg.append("g")
        .attr("transform", "translate(0,0)")
    // console.log(arrows);
    // console.log(arrowpos);
    addcurve = function(i){
        r1=arrowpos[arrows[i][0]].r;
        r2=arrowpos[arrows[i][1]].r;
        x1=arrowpos[arrows[i][0]].x;
        x2=arrowpos[arrows[i][1]].x;
        y1=arrowpos[arrows[i][0]].y;
        y2=arrowpos[arrows[i][1]].y;
        //   console.log(col);
        ang = Math.atan2((y2-y1),(x2-x1));
        r1s=r1*Math.sin(ang);
        r1c=r1*Math.cos(ang);
        r2s=r2*Math.sin(ang);
        r2c=r2*Math.cos(ang);
        x1r1 = x1 + r1s/2;
        x1r2 = x1 - r1s/2;
        y1r1 = y1 - r1c/2;
        y1r2 = y1 + r1c/2;
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
        col=arrowpos[arrows[i][0]].c;
        lineFunc = d3.svg.line()
            .x(function(d){return d.x;})
            .y(function(d){return d.y;})
            .interpolate("cardinal-closed")
    //   console.log(points);
      svg.append("path")
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


    var bubbles = svg.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".bubble")
        .data(nodes)
        .enter();

    svg.selectAll("path.merger")
        .attr("opacity",0.5);
    //create highlight circles
    bubbles.append("circle")
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .attr("id",function(d){return 'hl'+d.id;})
        .attr("class","bh-circle-highlight")
        .attr("fill-opacity",0)
        .attr("stroke-opacity",0)
        .style({"stroke":"red","stroke-width":10})

    //create the bubbles
    bubbles.append("circle")
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .attr("id",function(d){return d.id;})
        .attr("class","bh-circle")
        .style("fill", function(d){return fillcolor2(cValue(d))})
        .on("mouseover", function(d) {showTooltip(d);})
        .on("mouseout", function(d) {hideTooltip(d);})
        .on("click",function(d){showInfopanel(d);});

    //format the text for each bubble
    getText = function(d){
        if ((d.BHtype=="primary")||(d.BHtype=="secondary")){return "";}else{return d.name}
    }
    bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d){ return getText(d); })
        .attr("class","bh-circle-text")
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
      .attr("opacity",1)
      .attr("transform", function(d, i) { return "translate(0," +(i * 24) + ")"; });

    // draw legend colored rectangles
    legend.append("circle")
      .attr("x", 12)
      .attr("y",12)
      .attr("r", 9)
      .attr("transform","translate(21,21)")
    //   .attr("height", 18)
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