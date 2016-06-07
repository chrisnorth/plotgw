// var diameter = Math.min(document.getElementById("bubble-container").offsetWidth,document.getElementById("bubble-container").offsetHeight);
// // document.getElementById("hdr").setAttribute("width",diameter);
// document.getElementById("bubble-container").setAttribute("width",diameter);
// console.log(document.getElementById("hdr"));
function BHBubble(){
    return this;
}
BHBubble.prototype.init = function(){
    this.pgWidth = document.getElementById("bubble-container").offsetWidth;
    this.pgHeight = document.getElementById("bubble-container").offsetHeight;
    this.diameter = 800 //max size of the bubbles
        // color    = d3.scale.category10(); //color category
    this.fillcolor2 = d3.scale.linear().domain([1,2,3])
            .range([d3.rgb("#48c7e9"), d3.rgb("#67c18d"), d3.rgb('#f68d69')])
    this.textcolor2 = d3.scale.linear().domain([1,2,3])
            .range([d3.rgb("#000000"), d3.rgb("#000000"),d3.rgb('#000000')])
    this.cVals={LVT:1,GW:2,Xray:3};
    // var cValue = function(d){if(d.method=="GW"){return 1;}else{return 2;};};
    this.cValue = function(d){return this.cVals[d.method]};
    this.legenddescs = {1:'Gravitational Wave Candidate',2:'Gravitational Wave Detection',3:'X-ray Measurement'};
    //define comparitor sort function(blank for null)
    this.sort = "";
    this.valueCol='massBHsq';
    this.filterType="all";
}

// random comparitor
BHBubble.prototype.comparitor = function(){
    if (this.sort=="random"){
        return function(a,b){
            return a.value * Math.random()- b.value*Math.random();};
    }else if(this.sort="reverse"){
        return function(a,b){return b.value - a.value;};
    }else{
        return null;
    }
}
// BHBubble.prototype.filter = function(d){
//     if (this.filterType=="nofin"){
//         return !d.children;
//     }else{
//         console.log(d.name,d.children);
//         return function(d){return !d.children;};
//     }
// }
BHBubble.prototype.filterFn = function(filterType){
    // console.log(filterType);
    if (filterType=="nofin"){
        return function(d){
            // console.log(d.name,(d.BHtype!="final"),(!d.children),((d.BHtype!="final")&&(!d.children)));
            return ((d.BHtype!="final")&&(!d.children));};
    }else if(filterType=="noinit"){
        return function(d){
            // console.log(d.name,(d.BHtype!="final"),(!d.children),((d.BHtype!="final")&&(!d.children)));
            return ((d.BHtype!="primary")&&(d.BHtype!='secondary')&&(!d.children));};
    }else{
        // console.log('filter',d.name,d.children);
        return function(d){
            // console.log(d.name,(!d.children));
            return !d.children;};
    }
}
BHBubble.prototype.makeSvg = function(){
    var bh=this;

    this.tooltip = d3.select("div#bubble-container").append("div")
        .attr("class", "tooltip");
    // .style("opacity", 0);

    this.infopanelbg = d3.select("div#bubble-container").append("div")
        .attr("class","infopanelbg")
        .on("click",function(){bh.hideInfopanel();});
    this.infopanelouter = d3.select("div#bubble-container").append("div")
        .attr("class","infopanelouter").attr("id","infopanel-outer");
    this.infopanel = d3.select("div#infopanel-outer").append("div")
            .attr("class","infopanel");
    this.infopanelouter.append("div").attr("class","infoclose")
        .html("<img src='img/close.png' title='close'>")
        .on("click",function(){bh.hideInfopanel();});
    this.bubble = d3.layout.pack()
        .sort(this.comparitor)
        .size([this.diameter, this.diameter])
        .padding(15);
}
//define tooltip text
BHBubble.prototype.tttext = function(d){
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
BHBubble.prototype.showTooltip = function(d){
    // console.log('2',d.name,tooltip);
    getLeft = function(d){
        if (d.x > this.diameter/2){return (d3.event.pageX - 0.25*this.pgWidth - 10) + "px";}
        else{return (d3.event.pageX + 10) + "px";};
    }
    getTop = function(d){
        if (d.y > this.diameter/2){return (d3.event.pageY - 0.1*this.diameter - 10) + "px";}
        else{return (d3.event.pageY + 10) + "px";};
    }
    this.tooltip.transition()
       .duration(200)
       .style("opacity", .9);
    this.tooltip.html(this.tttext(d))
       .style("left", getLeft(d)).style("top", getTop(d))
       .style("width","25%").style("height","auto");
    this.svg.select('#hl'+d.id)
        .transition(500)
        .attr("stroke-opacity",1);
}
BHBubble.prototype.hideTooltip = function(d) {
    this.tooltip.transition()
        .duration(500).style("opacity", 0);
    this.svg.select('#hl'+d.id)
        .transition(500).attr("stroke-opacity",0);
}

BHBubble.prototype.iptext = function(d){
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
BHBubble.prototype.showInfopanel = function(d){
    // fade in semi-transparent background layer (greys out image)
    this.infopanelbg.transition()
      .duration(500)
      .style({"opacity":0.5});
    this.infopanelbg.style("height","100%");
    //fade in infopanel
    this.infopanelouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    this.infopanel.html(this.iptext(d));
    this.infopanelouter.style("left", "25%").style("top", "25%")
       .style("width","50%").style("height","auto");

}
BHBubble.prototype.hideInfopanel = function(d) {
    // fade out infopanel
    this.infopanelouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.infopanelouter.style("top","200%");
    // fade out semi-transparent background
    this.infopanelbg.transition()
      .duration(500)
      .style("opacity",0);
    this.infopanelbg.style("height",0);
    // d3.selectAll(".info").attr("opacity",0);
}
BHBubble.prototype.filterData = function(data,filterType){
    var idxRem=[];
    if (filterType=="nofin"){
        data.forEach(function(d){
            if(d.BHtype=="final"){
                // console.log('nofin removing',d.name);
                idxRem.push(data.indexOf(d));
            }
        });
    }else if (filterType=="noinit"){
        data.forEach(function(d){
            if((d.BHtype=="primary")||(d.BHtype=="secondary")){
                // console.log('noinit removing',d.name,d.BHtype);
                idxRem.push(data.indexOf(d));
            }
        });
    }
    idxRem.reverse()
    // console.log(idxRem);
    for (i in idxRem){
        data.splice(idxRem[i],1)
    }

    return data;
}

BHBubble.prototype.loadData = function(){
    // console.log("loadData");
    var bh=this;
    d3.csv("csv/bhcat.csv", function(error, data){
        data.forEach(function(d){
            d.massBH = +d.massBH;
            d.massBHsq = Math.pow(d.massBH,2);});
        // data.forEach(function(d){
        //     if (bh.filterFn(bh)){d=null}});
        // console.log(data.length);
        // console.log(data.length);
        data= bh.filterData(data,bh.filterType);
        // console.log(data.length);
        data = data.map(function(d){d.value=+d[bh.valueCol];return d;})
        // data = data.map(function(d){
        //     if(!bh.filterFn(bh.filterType)){d="";return d;}else{d.value = +(d["massBH"]); return d; }});
        bh.nodes = bh.bubble.nodes({children:data})
            .filter(bh.filterFn(bh.filterType));
        bh.data = data;
        // console.log(data[0].r)
        bh.formatData()
        bh.drawBubbles();
    })
}

BHBubble.prototype.formatData = function(){
    // console.log("formatData",this.data[0].r);
    var bh=this;
    //convert numerical values from strings to numbers
    //bubbles needs very specific format, convert data to this.

    this.arrows=[];
    this.arrowpos = {};
    this.name2id=function(name){
        return name.replace('+','').replace('(','').replace(')','').replace('-','');
    };
    this.data.forEach(function(d){
        // console.log(d);
        d.id = bh.name2id(d.name)
        // console.log(d.name,d.id);
        if ((d.method=="GW")||(d.method=="LVT")){
            bh.arrowpos[d.id]={x:d.x,y:d.y,r:d.r,c:bh.fillcolor2(bh.cValue(d))};
        }
        if (d.compType=="Black hole"){
            bh.arrows.push([d.id,bh.name2id(d.parentName)]);
        }
    });
    //setup the chart
}
BHBubble.prototype.drawBubbles = function(){
    this.svg = d3.select("div#bubble-container")
        .append("svg").attr("class", "bubble")
        .attr("width", this.diameter).attr("height", this.diameter);

    // console.log("drawBubbles",this.data[0].r);
    var bh=this;
    this.bubbles = this.svg.append("g")
        .attr("transform", "translate(0,0)")
    // console.log(arrows);
    // console.log(arrowpos);
    this.addcurve = function(i){
        r1=bh.arrowpos[bh.arrows[i][0]].r;
        r2=bh.arrowpos[bh.arrows[i][1]].r;
        x1=bh.arrowpos[bh.arrows[i][0]].x;
        x2=bh.arrowpos[bh.arrows[i][1]].x;
        y1=bh.arrowpos[bh.arrows[i][0]].y;
        y2=bh.arrowpos[bh.arrows[i][1]].y;
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
        bh.lineData = [{"x":x1r1,"y":y1r1},{"x":x2r1,"y":y2r1},{"x":x3r1,"y":y3r1},
            {"x":x3r2,"y":y3r2},{"x":x2r2,"y":y2r2},{"x":x1r2,"y":y1r2}];
        col=bh.arrowpos[bh.arrows[i][0]].c;
        bh.lineFunc = d3.svg.line()
            .x(function(d){return d.x;})
            .y(function(d){return d.y;})
            .interpolate("cardinal-closed")
    //   console.log(points);
        bh.svg.append("path")
          .attr("d",bh.lineFunc(bh.lineData))
          .attr("class","merger")
          .attr("fill",col);
        //   .attr("opacity",0.5)
        //   .style({"stroke":"red","stroke-width":2,"opacity":0.5});
    }
    if ((this.filterType!="nofin")&&(this.filterType!="noinit")){
        for (i in this.arrows){
            // addtriangle(i);
            // addpolygon(i);
            this.addcurve(i);
    }}


    this.bubbles = this.svg.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".bubble")
        .data(this.nodes)
        .enter();

    this.svg.selectAll("path.merger")
        .attr("opacity",0.5);
    //create highlight circles
    this.bubbles.append("circle")
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .attr("id",function(d){return 'hl'+d.id;})
        .attr("class","bh-circle-highlight")
        .attr("fill-opacity",0)
        .attr("stroke-opacity",0)
        .style({"stroke":"red","stroke-width":10})

    //create the bubbles
    this.bubbles.append("circle")
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .attr("id",function(d){return d.id;})
        .attr("class","bh-circle")
        .style("fill", function(d){return bh.fillcolor2(bh.cValue(d))})
        .on("mouseover", function(d) {bh.showTooltip(d);})
        .on("mouseout", function(d) {bh.hideTooltip(d);})
        .on("click",function(d){bh.showInfopanel(d);});

    //format the text for each bubble
    this.getText = function(d){
        if (((d.BHtype=="primary")||(d.BHtype=="secondary"))&&(bh.filterType=="noinit")){
            return "";}else{return d.name}
    }
    this.bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d){ return bh.getText(d); })
        .attr("class","bh-circle-text")
        .style({
            "fill":function(d){return bh.textcolor2(bh.cValue(d));},
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 8) + "px"; }
        })
        .on("mouseover", function(d) {bh.showTooltip(d);})
        .on("mouseout", function(d) {bh.hideTooltip(d);;});
    // for (i in arrows){
    //     // addtriangle(i);
    //     addcurve(i);
    // }

    this.legend = this.svg.selectAll(".legend")
      .data(this.fillcolor2.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("opacity",1)
      .attr("transform", function(d, i) { return "translate(0," +(i * 24) + ")"; });

    // draw legend colored rectangles
    this.legend.append("circle")
      .attr("x", 12)
      .attr("y",12)
      .attr("r", 9)
      .attr("transform","translate(21,21)")
    //   .attr("height", 18)
      .style("fill", this.fillcolor2)
    //   .style("stroke",function(d){return linestyles[d.method];})
      .style("stroke","#000");

    // draw legend text
    this.legend.append("text")
      .attr("x", 36)
      .attr("y", 21)
      .attr("dy", ".35em")
      .attr("font-size","1.2em")
      .style("fill","#fff")
      .style("text-anchor", "start")
      .text(function(d){return bh.legenddescs[d];});

}
BHBubble.prototype.addButtons = function(){
    var bh=this;
    this.options = {'all':{name:'All',filterType:'all'},
        'nofin':{name:'Initial only',filterType:'nofin'},
        'noinit':{name:'Final only',filterType:'noinit'}};
    for (o in this.options){
        opt=this.options[o];
        var divcont = document.getElementById('controls');
        // console.log(divcont,opt);
        var newcont = document.createElement('div');
        newcont.className = 'control '+opt.filterType;
        newcont.style.display = 'inline-block';
        divcont.appendChild(newcont);
        var newcontinput = document.createElement('input');
        newcontinput.setAttribute("id","button-"+opt.filterType);
        newcontinput.type = 'button';
        newcontinput.name = opt.filterType;
        newcontinput.value = opt.name;
        if (opt.filterType==bh.filterType){newcontinput.classList.add("down")};
        newcontinput.addEventListener('click',function(){
            oldFilterType = bh.filterType;
            document.getElementById("button-"+oldFilterType).classList.remove("down")
            this.classList.add("down");
            // bh.filterType=bh.options[o].filterType
            bh.replot(this.name);
        });
        newcont.appendChild(newcontinput);
    }
}
BHBubble.prototype.makeDownload = function(){
    //make SVG download button
    d3.select("#generate")
        .on("click", this.writeDownloadLink);
}

BHBubble.prototype.writeDownloadLink = function(){
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

BHBubble.prototype.replot = function(filterType){
    // console.log('replotting',filterType)
    this.filterType = filterType;
    // this.makeSvg();
    d3.select("svg").remove()
    this.loadData();
    this.makeDownload();
}
bub = new BHBubble
bub.init();
bub.makeSvg();
bub.loadData();
bub.makeDownload();
bub.addButtons();