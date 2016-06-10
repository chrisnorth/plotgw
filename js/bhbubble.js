// var diameter = Math.min(document.getElementById("bubble-container").offsetWidth,document.getElementById("bubble-container").offsetHeight);
// // document.getElementById("hdr").setAttribute("width",diameter);
// document.getElementById("bubble-container").setAttribute("width",diameter);
// console.log(document.getElementById("hdr"));

function BHBubble(){
    return this;
}
BHBubble.prototype.getUrlVars = function(){
    var vars = {},hash;
    if (window.location.href.search!=-1){
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            // vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
    }
    console.log("input:",vars);
    this.urlVars = vars;
}
BHBubble.prototype.loadLang = function(lang){
    var _bh = this;
    if (!lang){lang="en"};
    var url=this.langdir+lang+'.json';
    console.log(url);
    // Bug fix for reading local JSON file in FF3
    $.ajaxSetup({async:true,'beforeSend': function(xhr){
        // console.log(this);
        if (xhr.overrideMimeType) xhr.overrideMimeType("text/plain"); },
        datatype:'json',
        success:function(json){console.log(json);}
    });
    // Get the JSON language file amd call "makePlot" on completion
    $.getJSON({url:url,
        beforeSend: function(xhr){
            if (xhr.overrideMimeType){
                xhr.overrideMimeType("application/json");
            }
        },
        dataType: 'json',
        success:function(data){
            console.log('success',data[0]);_bh.langdict=data[0];_bh.makePlot();}
    })
}
BHBubble.prototype.t = function(key,def){
    // console.log(this);
    if (this.langdict.hasOwnProperty(key)){return this.langdict[key];}
    else{console.log('not found:',key,def);return (def) ? def : key;}
}
BHBubble.prototype.init = function(){
    // _t=this.translate;
    this.pgWidth = document.getElementById("bubble-container").scrollWidth;
    this.pgHeight = document.getElementById("bubble-container").scrollHeight;
    this.diameter = 800 //max size of the bubbles
        // color    = d3.scale.category10(); //color category
    this.fillcolor2 = d3.scale.linear().domain([1,2,3])
            .range([d3.rgb("#48c7e9"), d3.rgb("#67c18d"), d3.rgb('#f68d69')])
    this.textcolor2 = d3.scale.linear().domain([1,2,3])
            .range([d3.rgb("#000000"), d3.rgb("#000000"),d3.rgb('#000000')])
    this.cVals={LVT:1,GW:2,Xray:3};
    // var cValue = function(d){if(d.method=="GW"){return 1;}else{return 2;};};
    this.cValue = function(d){return this.cVals[d.method]};
    this.legenddescs = {
        1:this.t("Gravitational Wave Candidate"),
        2:this.t("Gravitational Wave Detection"),
        3:this.t("X-ray Measurement")};
    //define comparitor sort function(blank for null)
    this.sort = "gwfirst";
    this.valueCol='massBHsq';
    this.filterType="";
    this.displayFilter="nofin";
    this.langdir = 'bhbubble-lang/';
    $('#hdr h1').html(this.t("title","Known Stellar-mass Black Holes"));
    this.mergeDuration = 1000;
}

// random comparitor
BHBubble.prototype.comparitor = function(sort){
    bh=this;
    // console.log(this,this.sort);
    if (sort=="random"){
        return function(a,b){
            return a.value * Math.random()- b.value*Math.random();};
    }else if(sort=="reverse"){
        return function(a,b){return b.value - a.value;};
    }else if(sort=="forward"){
        return function(a,b){return a.value - b.value;};
    }else if(sort=="gwfirst"){
        return function(a,b){
            if (a.method==b.method){return null;}
            else if((a.method=='GW')||(a.method=='LVT')){return 1000;}
            else{return -1000;}
        }
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

    this.tooltip = d3.select("div#full").append("div")
        .attr("class", "tooltip");
    // .style("opacity", 0);

    this.infopanelbg = d3.select("div#full").append("div")
        .attr("class","infopanelbg")
        .on("click",function(){bh.hideInfopanel();});
    this.infopanelouter = d3.select("div#full").append("div")
        .attr("class","infopanelouter").attr("id","infopanel-outer");
    this.infopanel = d3.select("div#infopanel-outer").append("div")
            .attr("class","infopanel");
    this.infopanelouter.append("div").attr("class","infoclose")
        .html("<img src='img/close.png' title='"+this.t("close")+"'>")
        .on("click",function(){bh.hideInfopanel();});
    this.bubble = d3.layout.pack()
        .sort(this.comparitor(this.sort))
        .size([this.pgWidth, this.pgHeight])
        // .size([this.diameter, this.diameter])
        .padding(15);
    //replace footer text for language
    footer=document.getElementById("footer-txt");
    footertxt = footer.innerHTML;
    footer.innerHTML = this.t("footer",footertxt);
    //replace svg button text for language
    document.getElementById("generate").innerHTML=this.t("Save as SVG");
}
//define tooltip text
BHBubble.prototype.tttext = function(d){
    text =  "<span class='name'>"+d["name"]+"</span>"+
    "<span class='info'>"+this.t("Mass")+": "+d["massBHstr"]+" M<sub>&#x2609;</sub></span>";
    if(d["method"]=='Xray'){
        // text = text+ "<span class='info'>X-ray detection</span>";
        text = text + "<span class='info'>"+d.binType+"</span>";
        // text = text+ "<span class='info'>"+this.t("Companion")+": "+this.t(d.compType)+"</span>";
    }else{
        text = text+ "<span class='info'>"+this.t(d.binType)+
            " ("+this.t(d.BHtype)+")</span>";
    }
    // text = text+ "<span class='info'>"+this.t("Location")+": "+this.t(d.location)+"</span>";
    return text;
}
//set tooltip functions
BHBubble.prototype.showTooltip = function(d){
    // console.log('2',d.name,tooltip);
    bh=this;
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
       .style("opacity",bh.getOpacity()(d)*0.9);
    this.tooltip.html(this.tttext(d))
       .style("left", getLeft(d)).style("top", getTop(d))
       .style("width","25%").style("height","auto");
    this.svg.select('#hl'+d.id)
        .transition(500)
        .attr("stroke-opacity",bh.getOpacity());
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
    text =  "<span class='name'>"+d["name"]+"</span>";
    if(d["method"]=='Xray'){
        text=text+"<span class='info'><b>"+this.t("Mass")+"</b>: "+d["massBHstr"]+" M<sub>&#x2609;</sub>";
        if (d.refbhmass!='-'){text = text +
            " <sup>["+rx+"]</sup></span>";rbhm=rx;rx++;}
        else{text = text+"</span>"}
        text = text + "<span class='info'><b>"+this.t("Type")+"</b>: "+this.t(d.binType)+"</span>";
        // text = text+ "<span class='info'>X-ray detection</span>";
        //companion
        text = text+ "<span class='info'><b>"+this.t("Companion")+"</b>: "+
            d.compMass+" M<sub>&#x2609;</sub> "+this.t(d.compType);
        if (d.refcomp!="-"){text = text +
            " <sup>["+rx+"]</sup>";rct=rx;rx++;}
        if (d.refcompmass!="-"){text = text +
            " <sup>["+rx+"]</sup>";rcm=rx;rx++;}
        text = text+"</span>";
        //period mass
        text = text+ "<span class='info'><b>"+this.t("Orbital period")+"</b>: "+d.period+
        " "+this.t("days")+"</sub>";
        if (d.refper!="-"){text = text +
            " <sup>["+rx+"]</sup></span>";rper=rx;rx++;}
        else{text = text+"</span>"}
        text = text+ "<span class='info'><b>"+this.t("Location")+"</b>: "+this.t(d.location)+"</span>";
        if (rbhm){text = text + "<span class='ref'>["+rbhm+"] "+d.refbhmass+"</span>"}
        if (rct){text = text + "<span class='ref'>["+rct+"] "+d.refcomp+"</span>"}
        if (rcm){text = text + "<span class='ref'>["+rcm+"] "+d.refcompmass+"</span>"}
        if (rcm){text = text + "<span class='ref'>["+rper+"] "+d.refper+"</span>"}
    }else{
        text = text + "<span class='info'><b>"+this.t("Mass")+"</b>: "+d["massBHstr"]+" M<sub>&#x2609;</sub>";
        if (d.refbhmass!='-'){text = text +
            " <sup>["+rx+"]</sup></span>";rbhm=rx;rx++;}
        else{text = text+"</span>"}
        text = text+ "<span class='info'><b>"+this.t("Type")+"</b>: "+this.t(d.binType)+
            " ("+this.t(d.BHtype)+")</span>";
        if (d.compType!="None"){
            text = text+ "<span class='info'><b>"+this.t("Companion")+"</b>: "+
                d.compMass+" M<sub>&#x2609;</sub> "+this.t(d.compType)+"</span>";
        }else{text = text+ "<span class='info'><b>"+this.t("Companion")+"</b>: "+this.t("None")+"</span>"}
        text = text+ "<span class='info'><b>"+this.t("Distance")+"</b>: "+this.t(d.distance)+
            " "+this.t("million light years")+"</span>";
        if (rbhm){text = text + "<span class='ref'>["+rbhm+"] "+d.refbhmass+"</span>"}

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
        // data.forEach(function(d){
        //     if (bh.filterFn(bh)){d=null}});
        // console.log(data.length);
        // console.log(data.length);
        data= bh.filterData(data,bh.filterType);
        // console.log(data.length);
        bh.data = data;
        // console.log(data[0].r)
        // bh.scaleData();
        bh.formatData(bh.valueCol)
        bh.drawBubbles();
    })
}
// BHBubble.prototype.scaleData = function(scale){
//     bh=this;
//
// }
BHBubble.prototype.formatData = function(valueCol){
    // console.log("formatData",this.data[0].r);
    var bh=this;
    //convert numerical values from strings to numbers
    //bubbles needs very specific format, convert data to this.
    this.data.forEach(function(d){
        d.massBH = +d.massBH;
        d.massBHsq = Math.pow(d.massBH,2);
        if (d.massBHerr[0]=='+'){
            errcode=d.massBHerr.split('-');
            d.massBHplus = +errcode[0] + d.massBH;
            d.massBHminus = -errcode[1] + d.massBH;
            d.massBHstr = parseFloat(d.massBHminus.toFixed(1))+' - '+
                                parseFloat(d.massBHplus.toFixed(1));
            // console.log('lim:',d.massBHerr,errcode,d.massBHstr);
        }else if(d.massBHerr[0]=='r'){
            errcode=d.massBHerr.split('r')[1];
            errcode=errcode.split('-');
            d.massBHplus = +errcode[1];
            d.massBHminus = +errcode[0];
            d.massBHstr = parseFloat(d.massBHminus.toFixed(1))+' - '+
                                parseFloat(d.massBHplus.toFixed(1));
            // console.log('range:',d.massBHerr,errcode,d.massBHstr);
        }else if(d.massBHerr[0]=='>'){
            errcode=d.massBHerr.split('>')[1]
            d.massBHplus = Infinity;
            d.massBHminus = +errcode;
            d.massBHstr = '>'+parseFloat(d.massBHminus.toFixed(1));
            // console.log('min:',d.massBHerr,errcode,d.massBHstr);
        }else if(d.massBHerr[0]=='<'){
            errcode=d.massBHerr.split('<')[1]
            d.massBHplus = +errcode;
            d.massBHminus = 0;
            d.massBHstr = '<'+parseFloat(d.massBHplus.toFixed(1));
            // console.log('max:',d.massBHerr,errcode,d.massBHstr);
        }else if(d.massBHerr[0]=='~'){
            errcode=d.massBHerr.split('~')[1];
            d.massBHplus = +errcode;
            d.massBHminus = +errcode;
            d.massBHstr = 'approx. '+parseFloat(d.massBHplus.toFixed(1));
        }
    });
    this.data = this.data.map(function(d){d.value=+d[valueCol];return d;})
    // data = data.map(function(d){
    //     if(!bh.filterFn(bh.filterType)){d="";return d;}else{d.value = +(d["massBH"]); return d; }});
    this.nodes = this.bubble.nodes({children:this.data})
        .filter(this.filterFn(this.filterType));
    // data.forEach(
    //     d.massBH = +d[col];
    //         if (columns[col]['errcode']){
    //             errcode=d[columns[col]['errcode']].split('-')
    //             d[col+'plus'] = +errcode[0] + d[col];
    //             d[col+'minus'] = -errcode[1] + d[col];
    //             d[col+'Str'] = parseFloat(d[col+'minus'].toPrecision(3))+'-'+
    //                     parseFloat(d[col+'plus'].toPrecision(3))
    //             columns[col+'Str']={'type':'str','unit':columns[col].unit}
    //         }
    //     }
    // )
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
BHBubble.prototype.getText = function(d){
    if (
        ((d.BHtype=="primary")||(d.BHtype=="secondary"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))||
        ((d.BHtype=="final"))&&((bh.filterType=="nofin")||(bh.displayFilter=="nofin"))
    ){
        return "";}else{return d.name}
}
BHBubble.prototype.getRadius = function(d){
    if (
        ((d.BHtype=="primary")||(d.BHtype=="secondary"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))||
        ((d.BHtype=="final"))&&((bh.filterType=="nofin")||(bh.displayFilter=="nofin"))
    ){
        return 0;}else{return d.r}
}
BHBubble.prototype.getOpacity = function(d){
    if (this.displayFilter=="nofin"){
        return function(d){
            // console.log('nofin',d.BHtype,d.BHtype=="final" ? 0 : 1);
            return d.BHtype=="final" ? 0 : 1;};
    }else if(this.displayFilter=="noinit"){
        return function(d){
            // console.log('noinit',d.BHtype,d.BHtype=="primary" ? 0 : d.BHtype=="secondary" ? 0 : 1);
            return d.BHtype=="primary" ? 0 : d.BHtype=="secondary" ? 0 : 1;};
    }else{return function(d){return 1;};}
}
BHBubble.prototype.drawBubbles = function(){
    this.svg = d3.select("div#bubble-container")
        .append("svg").attr("class", "bubble")
        .attr("width", this.pgWidth).attr("height", 0.9*this.pgHeight);

    // console.log("drawBubbles",this.data[0].r);
    var bh=this;

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
    if (
        ((this.filterType!="nofin")&&(this.filterType!="noinit"))&&
        ((this.displayFilter!="nofin")&&(this.displayFilter!="noinit"))){
        for (i in this.arrows){
            // addtriangle(i);
            // addpolygon(i);
            this.addcurve(i);
            this.svg.selectAll("path.merger")
                .attr("opacity",0.5);
    }}

    this.bubbles = this.svg.append("g")
        .attr("transform", "translate(0,0)")
        .attr("width", this.pgWidth).attr("height", 0.9*this.pgHeight)
        .selectAll(".bubble")
        .data(this.nodes)
        .enter();

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
        .attr("id",function(d){return 'bh-circle-'+d.id;})
        .attr("opacity",this.getOpacity())
        .attr("class","bh-circle")
        .style("fill", function(d){return bh.fillcolor2(bh.cValue(d))})
        .on("mouseover", function(d) {bh.showTooltip(d);})
        .on("mouseout", function(d) {bh.hideTooltip(d);})
        .on("click",function(d){bh.showInfopanel(d);});

    //format the text for each bubble

    this.bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d){return d.name;})
        .attr("class","bh-circle-text")
        .attr("opacity",this.getOpacity())
        .attr("id",function(d){return "bh-circle-text-"+d.id;})
        .style({
            "fill":function(d){return bh.textcolor2(bh.cValue(d));},
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": function(d) {
                return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 8) + "px"; }
        })
        .on("mouseover", function(d) {bh.showTooltip(d);})
        .on("mouseout", function(d) {bh.hideTooltip(d);;})
        .on("click",function(d){bh.showInfopanel(d);});;
    // for (i in arrows){
    //     // addtriangle(i);
    //     addcurve(i);
    // }

    // replace text and circles with display values
    d3.selectAll("text")
        .text(function(d){ return bh.getText(d); });
    d3.selectAll(".bh-circle")
        .attr("r",function(d){return bh.getRadius(d);})

    // add legend
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
    var divcont = document.getElementById('controls');
    spancont = document.createElement('span');
    spancont.className = "control-lab";
    spancont.innerHTML = this.t("Mergers");
    divcont.appendChild(spancont);
    // divcont.innerHTML('<span>Controls:</span>');
    this.animcont = document.createElement('div');
    this.animcont.className = 'control merge merger';
    if (this.displayFilter=="noinit"){this.animcont.classList.add("hide");}
    // animcont.style.display = 'inline-block';
    divcont.appendChild(this.animcont);

    animimg = document.createElement('img');
    animimg.setAttribute("id","button-merger");
    animimg.setAttribute("src","img/merger.svg");
    animimg.setAttribute("title",this.t("Merge binary black holes"));
    animimg.addEventListener("click",function(){
        bh.animateMerger();
    });
    this.animcont.appendChild(animimg);
    //
    //unmerger button
    this.animcontun = document.createElement('div');
    this.animcontun.className = 'control merge unmerger';
    if (this.displayFilter=="nofin"){this.animcontun.classList.add("hide");}
    // animcontun.style.display = 'inline-block';
    divcont.appendChild(this.animcontun);
    animimgun = document.createElement('img');
    animimgun.setAttribute("id","button-unmerger");
    animimgun.setAttribute("src","img/unmerger.svg");
    animimgun.setAttribute("title",this.t("Unmerge binary black holes"));
    animimgun.addEventListener("click",function(){
        bh.animateUnMerger();
    });
    this.animcontun.appendChild(animimgun);
    //
    spancontscale = document.createElement('span');
    spancontscale.className = "control-lab";
    spancontscale.innerHTML = this.t("Scale");
    divcont.appendChild(spancontscale);
    //
    //scale size button
    this.scalecontsize = document.createElement('div');
    this.scalecontsize.className = 'control scale scale-size';
    if (this.valueCol=="massBHsq"){this.scalecontsize.classList.add("current");}
    // animcontun.style.display = 'inline-block';
    divcont.appendChild(this.scalecontsize);
    scaleimgsize = document.createElement('img');
    scaleimgsize.setAttribute("id","button-scale-size");
    scaleimgsize.setAttribute("src","img/scalesize.svg");
    scaleimgsize.setAttribute("title",this.t("Scale by size"));
    if (this.valueCol!="massBHsq"){
        scaleimgsize.addEventListener("click",function(){bh.replot("massBHsq");}
    );}
    this.scalecontsize.appendChild(scaleimgsize);
    //
    //scale mass button
    this.scalecontmass = document.createElement('div');
    this.scalecontmass.className = 'control scale scale-mass';
    if (this.valueCol=="massBH"){this.scalecontmass.classList.add("current");}
    // animcontun.style.display = 'inline-block';
    divcont.appendChild(this.scalecontmass);
    scaleimgmass = document.createElement('img');
    scaleimgmass.setAttribute("id","button-scale-mass");
    scaleimgmass.setAttribute("src","img/scalemass.svg");
    scaleimgmass.setAttribute("title",this.t("Scale by mass"));
    if (this.valueCol!="massBH"){
        scaleimgmass.addEventListener("click",function(){bh.replot("massBH");}
    );}
    this.scalecontmass.appendChild(scaleimgmass);
    //
}
// BHBubble.prototype.addSvgButtons = function(){
//     this.svg.append("div")
//         .
// }
BHBubble.prototype.animateMerger = function(){
    // console.log(this.arrows);
    bh=this;
    this.displayFilter = "noinit";
    this.animcontun.classList.remove("hide");
    this.animcont.classList.add("hide");
    for (a in this.arrows){
        //move intialcircles
        d3.selectAll('#bh-circle-'+this.arrows[a][0])
            .transition().duration(this.mergeDuration)
            .attr("cx",this.arrowpos[this.arrows[a][1]].x)
            .attr("cy",this.arrowpos[this.arrows[a][1]].y)
            // .attr("stroke","black")
            .attr("r",function(d){return bh.getRadius(d);});
        //hide initial text
        d3.selectAll('#bh-circle-text-'+this.arrows[a][0])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("opacity",function(d){return bh.getOpacity();})
            .text(function(d){ return bh.getText(d); });
        //move final circles
        d3.selectAll('#bh-circle-'+this.arrows[a][1])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("r",function(d){return bh.getRadius(d)})
            // .attr("cy",this.arrowpos[this.arrows[a][1]].y)
            .attr("opacity",function(d){return bh.getOpacity(d);});
        //show final text
        d3.selectAll('#bh-circle-text-'+this.arrows[a][1])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("opacity",function(d){return bh.getOpacity()(d);})
            .text(function(d){ return bh.getText(d); });
    }
}
BHBubble.prototype.animateUnMerger = function(){
    // console.log(this.arrows);
    bh=this;
    this.displayFilter = "nofin";
    this.animcont.classList.remove("hide");
    this.animcontun.classList.add("hide");
    for (a in this.arrows){
        //move intialcircles
        d3.selectAll('#bh-circle-'+this.arrows[a][0])
            .transition().duration(this.mergeDuration)
            .attr("cx",this.arrowpos[this.arrows[a][0]].x)
            .attr("cy",this.arrowpos[this.arrows[a][0]].y)
            // .attr("stroke","black")
            .attr("r",function(d){return bh.getRadius(d);});
        //hide initial text
        d3.selectAll('#bh-circle-text-'+this.arrows[a][0])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("opacity",function(d){return bh.getOpacity();})
            .text(function(d){ return bh.getText(d); });
        //move final circles
        d3.selectAll('#bh-circle-'+this.arrows[a][1])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("r",function(d){return bh.getRadius(d)})
            // .attr("cy",this.arrowpos[this.arrows[a][1]].y)
            .attr("opacity",function(d){return bh.getOpacity(d);});
        //show final text
        d3.selectAll('#bh-circle-text-'+this.arrows[a][1])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("opacity",function(d){return bh.getOpacity()(d);})
            .text(function(d){ return bh.getText(d); });
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
BHBubble.prototype.replot = function(valueCol){
    var oldValueCol = this.valueCol;
    this.valueCol = valueCol;
    this.formatData(this.valueCol);
    // this.makeSvg();
    d3.select("svg").remove();
    d3.selectAll(".control").remove();
    d3.selectAll(".control-lab").remove();
    this.drawBubbles();
    this.makeDownload();
    this.addButtons();
}
BHBubble.prototype.makePlot = function(){
    console.log(this.langdict);
    this.init();
    this.makeSvg();
    this.loadData();
    this.makeDownload();
    this.addButtons();
}
bub = new BHBubble
bub.getUrlVars();
// console.log(bub.urlVars);
bub.langdir='bhbubble-lang/';
bub.loadLang(bub.urlVars.lang);
// console.log(bub.langdict);
