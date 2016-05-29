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
    distance:{code:"distance",type:"flt",
        avail:false,unit:'MPc'},
    redshift:{code:"redshift",type:"flt",avail:false},
    date:{code:"date",type:"date",avail:false},
    far:{code:"far",type:"flt",avail:false},
    fap:{code:"fap",type:"flt",avail:false},
    dtHL:{code:"dtHL",type:"flt",avail:false},
    sigma:{code:"sigma",type:"flt",avail:false},
    skyarea:{code:"skyarea",type:"flt",avail:false},
}
columns.distanceLy = {
    'type':'fn',
    'fn':function(d){return(Math.round(d['distance']*3.26))},
    'unit':'Mly'
};
columns.datestr = {
    'type':'fn',
    'fn':function(d){return(d['date'].split('T')[0])},
    'unit':''
};
columns.timestr = {
    'type':'fn',
    'fn':function(d){return(d['date'].split('T')[1])},
    'unit':''
};
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
//
// Create sketch panel
//
 // add title
var sketchName="None";
// d3.select("div#sketchcontainer").append("span")
//     .attr("id","sketchtitle")
//     .attr("fill","rgba(255,0,0,1)")
//     .html(sketchName);

var marginSketch = {top: 0, right: 0, bottom: 0, left: 0}
var widthSketch = document.getElementById("sketchcontainer").offsetWidth -
    marginSketch.left - marginSketch.right;
var heightSketch = document.getElementById("sketchcontainer").offsetHeight //-
    // document.getElementById("sketchtitle").offsetHeight -
    //  marginSketch.top - marginSketch.bottom;
var aspectSketch = heightSketch/widthSketch

// Add svg to sketch container
var svgSketch = d3.select("div#sketchcontainer").append("svg")
    .attr("width", widthSketch + marginSketch.left + marginSketch.right)
    .attr("height", heightSketch + marginSketch.top + marginSketch.bottom)
    .append("g")
    .attr("transform", "translate(" + marginSketch.left + "," + marginSketch.top + ")");

// set scaleing functions for sketch
scaleRadius = function(mass,ref){return(0.2*widthSketch*(mass/100.))}
var xScaleSk = function(x){return(x*widthSketch)}
var xScaleSkAspect = function(x){return(x*widthSketch*aspectSketch)}
var yScaleSk = function(y){return(y*heightSketch)}
// set colours
var colBH = ["rgba(0,0,0,1)","rgba(0,0,0,0)"];
var colShadow = ["rgba(128,128,128,1)","rgba(255,255,255,1)"];
var gradBH = svgSketch.append("defs")
  .append("radialGradient")
    .attr("id", "gradBH");
gradBH.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colBH[0]);
gradBH.append("stop")
    .attr("offset", "80%")
    .attr("stop-color", colBH[0]);
gradBH.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colBH[1]);
var gradShadow = svgSketch.append("defs")
  .append("radialGradient")
    .attr("id", "gradShadow");
gradShadow.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colShadow[0]);
gradShadow.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colShadow[1]);

// set positions
var bhpos = {
    pri:{cx:0.25,cy:0.3,xicon:0.1,yicon:0.15,xtxt:0.1,ytxt:0.25,scx:0.25,scy:0.3},
    sec:{cx:0.25,cy:0.6,xicon:0.1,yicon:0.45,xtxt:0.1,ytxt:0.55,scx:0.25,scy:0.6},
    final:{cx:0.6,cy:0.45,xicon:0.85,yicon:0.3,xtxt:0.85,ytxt:0.4,scx:0.6,scy:0.45},
    time:{xicon:0.1,yicon:0.7,xtxt:0.2,ytxt:0.76},
    datestr:{xicon:0.1,yicon:0.7,xtxt:0.2,ytxt:0.75},
    timestr:{xicon:0.1,yicon:0.7,xtxt:0.2,ytxt:0.775},
    dist:{xicon:0.1,yicon:0.85,xtxt:0.2,ytxt:0.9},
    distly:{xicon:0.1,yicon:0.85,xtxt:0.2,ytxt:0.925}};
var micon = {w:0.1,h:0.1};
var icons = {
    mass:"img/mass-msun.svg",
    timestr:"img/mass.svg",
    dist:"img/mass.svg"};
var cols={
    pri:["initmass1"],sec:["initmass2"],final:["finalmass"],
    time:["date"],timestr:["timestr"],datestr:["datestr"],
    dist:["distance"],distly:["distanceLy"]};
var yout = -0.3;
var labBlank="--";
var sketchTitle = svgSketch.append("text")
    .attr("x",xScaleSk(0.5))
    .attr("y",yScaleSk(0.1))
    .attr("text-anchor","middle")
    .attr("font-size","2em")
    .html("Information Panel");
var skMasses = function(bh){
    // add mass text
    svgSketch.append("ellipse")
        .attr("class","sketch shadow-"+bh)
        .attr("cx",xScaleSk(bhpos[bh].cx))
        .attr("cy",yScaleSk(bhpos[bh].scy))
        // .attr("cy",yScaleSk(yout))
        .attr("rx",scaleRadius(1,1))
        .attr("rx",scaleRadius(1,1))
        .attr("fill","url(#gradShadow)");
    svgSketch.append("circle")
        .attr("class","sketch bh-"+bh)
        .attr("cx",xScaleSk(bhpos[bh].cx))
        // .attr("cy",yScaleSk(bhpos[bh].cy))
        .attr("cy",yScaleSk(yout))
        .attr("r",scaleRadius(1,1))
        .attr("fill","url(#gradBH)");
    svgSketch.append("text")
        .attr("class","sketchlab mtxt-"+bh)
        .attr("font-size","1.5em")
        .attr("x",xScaleSk(bhpos[bh].xtxt))
        .attr("y",yScaleSk(bhpos[bh].ytxt))
        .attr("dy",yScaleSk(micon.h/2.))
        .attr("text-anchor","middle")
        // .append("span")
        // .attr("class","mtxt")
        .html(labBlank);
    // add solar mass icon
    // svgSketch.append("image")
    //     .attr("xlink:href","img/msun.svg")
    //     .attr("class","msun"+bh)
    //     .attr("width",xScaleSk(micon.w/2)*aspectSketch)
    //     .attr("height",yScaleSk(micon.h/2))
    //     .attr("x",xScaleSk(bhpos[bh].xtxt)+xScaleSk(micon.gap))
    //     .attr("y",yScaleSk(bhpos[bh].ytxt)+yScaleSk(micon.h/8))
    //     .attr("type","image/svg+xml");
    // add mass icon
    svgSketch.append("image")
        .attr("xlink:href",icons.mass)
        .attr("class","icon mass"+bh)
        .attr("width",xScaleSkAspect(micon.w))
        .attr("height",yScaleSk(micon.h))
        .attr("x",xScaleSk(bhpos[bh].xicon)-xScaleSkAspect(micon.w)/2)
        .attr("y",yScaleSk(bhpos[bh].yicon))
        .attr("type","image/svg+xml");
}
// append other icons
addLab = function(lab){
    svgSketch.append("image")
        .attr("xlink:href",icons[lab])
        .attr("class","icon "+lab)
        .attr("width",xScaleSkAspect(micon.w))
        .attr("height",yScaleSk(micon.h))
        .attr("x",xScaleSk(bhpos[lab].xicon)-xScaleSkAspect(micon.w)/2)
        .attr("y",yScaleSk(bhpos[lab].yicon)-yScaleSk(micon.h)/2)
        .attr("type","image/svg+xml");
    svgSketch.append("text")
        .attr("class","sketchlab "+lab+"txt")
        .attr("font-size","1.5em")
        .attr("x",xScaleSk(bhpos[lab].xtxt))
        .attr("y",yScaleSk(bhpos[lab].ytxt)-yScaleSk(micon.h)/2)
        .html(labBlank);
}

//labels to add and keep updated
var labels={"datestr":0,"timestr":0,"dist":0,"distly":0};
for (lab in labels){
    addLab(lab);
}

// define fly-in & fly-out
var flySp=1000;
var flyOutMasses = function(bh){
    // fly out masses
    if (bh=="final"){xout=1.3}else{xout=-0.3};
    svgSketch.select('circle.bh-'+bh)
        .transition().duration(flySp)
        .attr("cy",yScaleSk(yout));
    svgSketch.select('ellipse.shadow-'+bh)
        .transition().duration(flySp)
        .attr("rx",scaleRadius(1,1))
        .attr("ry",scaleRadius(1,1));
    svgSketch.select(".mtxt-"+bh).html(labBlank);
    svgSketch.select("timetxt").html(labBlank);
};
var flyInMasses = function(d,bh,resize){
    if (bh=="final"){xout=1.5}else{xout=-0.5};
    if (resize){
        // only resize circle & shadow
        svgSketch.select('circle.bh-'+bh)
            .transition().duration(flySp)
            .attr("r",scaleRadius(d[cols[bh][0]],d["finalmass"]))
            .attr("cy",yScaleSk(bhpos[bh].cy)-scaleRadius(d[cols[bh]],d["finalmass"]));
        svgSketch.select('ellipse.shadow-'+bh)
            .transition().duration(flySp)
            .attr("rx",scaleRadius(d[cols[bh][0]],d["finalmass"]))
            .attr("ry",scaleRadius(0.2*d[cols[bh][0]],d["finalmass"]));
    }else{
        // resize & fly in
        svgSketch.select('circle.bh-'+bh)
            .attr("r",scaleRadius(d[cols[bh][0]],d["finalmass"]));
        svgSketch.select('circle.bh-'+bh)
            .transition().duration(flySp).ease("bounce")
            .attr("cx",xScaleSk(bhpos[bh].cx))
            .attr("cy",yScaleSk(bhpos[bh].cy)-scaleRadius(d[cols[bh][0]],d["finalmass"]));
        svgSketch.select('ellipse.shadow-'+bh)
            .transition().duration(flySp).ease("bounce")
            .attr("rx",scaleRadius(d[cols[bh][0]],d["finalmass"]))
            .attr("ry",scaleRadius(0.2*d[cols[bh][0]],d["finalmass"]));
    };
    // set labels
    svgSketch.select("text.mtxt-"+bh).html(d[cols[bh][0]]);
};
skMasses("pri");
skMasses("sec");
skMasses("final");

updateSketch = function(d){
    // if ((document.getElementById("sketchcontainer").classList.contains("nothidden"))&&
    // (sketchName==d["name"])){
    if (sketchName==d["name"]){
        flyOutMasses("pri");
        flyOutMasses("sec");
        flyOutMasses("final");
        // replace title
        sketchName="None";
        sketchTitle.html("Information Panel");
        for (lab in labels){
            svgSketch.select("text."+lab+"txt").html(labBlank);
        }
    }else{
        if ((sketchName=="None")||(sketchName=="")) {
            flyInMasses(d,"pri",false);
            flyInMasses(d,"sec",false);
            flyInMasses(d,"final",false);
        }else{
            flyInMasses(d,"pri",true);
            flyInMasses(d,"sec",true);
            flyInMasses(d,"final",true);
        }
        // replace title
        sketchName = d["name"];
        sketchTitle.html("Information: "+sketchName);
        for (lab in labels){
            svgSketch.select("text."+lab+"txt").html('');
            for (i in cols[lab]){
                svgSketch.select("text."+lab+"txt").html(
                    svgSketch.select("text."+lab+"txt").html()+
                        " "+d[cols[lab][i]]);
                if (columns[cols[lab][i]].unit){
                    svgSketch.select("text."+lab+"txt")
                        .html(svgSketch.select("text."+lab+"txt").html()+
                            " "+columns[cols[lab][i]].unit);
                }
                if (i<cols[lab].length-1){
                    svgSketch.select("text."+lab+"txt")
                        .html(svgSketch.select("text."+lab+"txt").html()+
                            "<br>");
                }
            }
        }
    }
}

//
// Make graph
//
//set global variable for later use
var data;

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

//
// load data and plot graph
//

d3.csv("csv/gwcat.csv", function(error, data) {

    // change string (from CSV) into number format
    var dataIn=data;
    dataIn.forEach(function(d) {
        for (col in columns){
            if (columns[col].type=="flt"){d[col] = +d[col]};
            if (columns[col].type=="fn"){d[col]=columns[col].fn(d)};
            console.log(col,d[col]);
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
      .on("click", function(d) {updateSketch(d)});

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
