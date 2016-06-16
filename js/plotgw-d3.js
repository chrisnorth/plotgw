var columns = {
    name:{code:"name",type:"str"},
    type:{code:"type",type:"str"},
    totalmass:{code:"totalmass",errcode:"totalmasserr",
        type:"flt",label:"Total Mass",
        avail:true,unit:'solar masses'},
    chirpmass:{code:"chirpmass",errcode:"chirpmasserr",
        type:"flt",label:"Chirp Mass",
        avail:true,unit:'solar masses'},
    initmass1:{code:"initmass1",errcode:"initmass1err",
        type:"flt",label:"Primary Mass",
        avail:true,unit:'solar masses'},
    initmass2:{code:"initmass2",errcode:"initmass2err",
        type:"flt",label:"Secondary Mass",
        avail:true,unit:'solar masses'},
    finalmass:{code:"finalmass",errcode:"finalmasserr",
        type:"flt",label:"Final Mass",
        avail:true,unit:'solar masses'},
    massratio:{code:"massratio",errcode:"massratioerr",
        type:"flt",label:"Mass Ratio",
        avail:true,unit:'',border:0.01},
    initspineff:{code:"initspineff",errcode:"initspinefferr",
        type:"flt",avail:true,border:0.01,
        label:"Effective inspiral spin magnitude",unit:""},
    initspin1:{code:"initspin1",errcode:"initspin1err",
        type:"flt",avail:false},
    initspin2:{code:"initspin2",errcode:"initspin2err",
        type:"flt",avail:false},
    finalspin:{code:"finalspin",errcode:"finalspinerr",
        type:"flt",avail:true,border:0.01,
        label:"Final spin magnitude",unit:""},
    distance:{code:"distance",errcode:"distanceerr",
        type:"flt",label:'Distance',border:20,
        avail:true,unit:'MPc'},
    redshift:{code:"redshift",errcode:"redshifterr",
        type:"flt",label:"Redshift",avail:true,border:0.01},
    date:{code:"date",
        type:"date",avail:false},
    far:{code:"far",
        type:"flt",avail:false},
    fap:{code:"fap",
        type:"flt",},
    dtHL:{code:"dtHL",
        type:"flt",avail:false},
    sigma:{code:"sigma",
        type:"flt",avail:false},
    SNR:{code:"SNR",errcode:"",
        type:"flt",avail:true,label:"SNR"},
    skyarea:{code:"skyarea",
        type:"flt",avail:false},
    energy:{code:"energy",avail:true,label:"Energy released",
        errcode:"energyerr",border:0.1,
        type:"flt",unit:"solar mass equiv."},
    peaklum:{code:"peaklum",avail:true,label:"Peak luminosity",
        errcode:"peaklumerr",type:"flt",
        unit:"solar mass equiv. per second"},
    peakstrain:{code:"peakstrain",avail:true,label:"Peak strain",
        errcode:"",type:"flt",border:0.1,
        unit:"x 1e-21"},
    data:{code:"data",avail:false,type:'str',label:"Data"}
}
// var svgLabs=false;
// for (col in columns){
//     console.log(col);
//     if (columns[col]['errcode']){
//         columns[col+'Str'] = {
//             'type':'fn',
//             'fn':function(d){return parseFloat(d[col+'minus'].toPrecision(3))+'-'+
//                     parseFloat(d[col+'plus'].toPrecision(3))},
//             'unit':columns[col].unit
//         }
//     }
// }
columns.distanceLy = {
    'type':'fn',
    'fn':function(d){return(Math.round(d['distance']*3.26))},
    'unit':'Mly',
    avail:false,label:'DistanceLy',errcode:"DistanceLyErr"
}
columns.distanceLyErr = {
    'type':'fn',
    'fn':function(d){return(Math.round(d['distance']*3.26))},
    'unit':'Mly',
    avail:false,label:'DistanceLy'
};
// columns.distanceStr = {
//     'type':'fn',
//     'fn':function(d){return parseFloat(d['distanceminus'].toPrecision(3))+'-'+
//             parseFloat(d['distanceplus'].toPrecision(3))},
//     'unit':'Mly'
// };
columns.distanceLyStr = {
    'type':'fn',
    'fn':function(d){return parseFloat((d['distanceminus']*3.26).toPrecision(3))+' - '+
            parseFloat((d['distanceplus']*3.26).toPrecision(3))},
    'unit':'Mly'
}
columns.datestr = {
    'type':'fn',
    'fn':function(d){return(d['date'].split('T')[0])},
    'unit':''
};
columns.timestr = {
    'type':'fn',
    'fn':function(d){return(d['date'].split('T')[1]+" GMT")},
    'unit':''
};
columns.peaklumtxt = {
    'type':'fn',
    'fn':function(d){return(d['peaklumminus'].toPrecision(2)+' - '+d['peaklumplus'].toPrecision(2)+" x10<sup>56</sup> erg/s")},
    'unit':''
};
columns.peaklumMsuntxt = {
    'type':'fn',
    'fn':function(d){return(parseFloat((d['peaklumminus']*55.956).toPrecision(2))+' - '+parseFloat((d['peaklumplus']*55.956).toPrecision(2))+" M<sub>&#x2609;</sub>/s")},
    'unit':''
};
columns.energytxt = {
    'type':'fn',
    'fn':function(d){return(d['energyminus'].toPrecision(2)+' - '+d['energyplus'].toPrecision(2)+" M<sub>&#x2609;</sub>")},
    'unit':''
};
columns.energyErgtxt = {
    'type':'fn',
    'fn':function(d){return(parseFloat((d['energyminus']*1.787).toPrecision(2))+' - '+parseFloat((d['energyplus']*1.787).toPrecision(2))+" x10<sup>54</sup> erg/s")},
    'unit':''
};
columns.typedesc = {
    'type':'fn',
    'fn':function(d){return(gwcat.typedescs[d['type']])},
    'unit':''
}
columns.fappercent = {
    'type':'fn',
    'fn':function(d){return (100.*d.fap).toFixed(6);},
    'unit':'%'
}
columns.faptxt = {
    'type':'fn',
    'fn':function(d){return d.fap.toFixed(8);},
    'unit':'%'
}
columns.fartxt = {
    type:'fn',
    fn:function(d){
        // return Math.round(1./d.far);
        if (1/d.far<100){return "1 per "+(1./d.far).toFixed(1)+" yrs";}
        else if (1/d.far<1000){return "1 per "+(1./d.far).toFixed(0)+" yrs";}
        else if (1/d.far<1e6){
            return "1 per "+((Math.round((1./d.far)/100)*100)/1e3).toFixed(1)+" kyr";}
        else{
            return "1 per "+((Math.round((1./d.far)/1e5)*1e5)/1.e6).toFixed(1)+" Myr";}
    },
    'unit':''
}
columns.datalink = {
    'type':'fn',
    fn:function(d){return "<a href='"+d.data+"' title='Data link'>LOSC</a>"}
}
num2Errstr = function(col){
    return parseFloat((d[col+'plus']*3.26).toPrecision(3))+'-'+
            parseFloat((d[col+'plus']*3.26).toPrecision(3))
};

var getLabel = function(col){
    return(columns[col].label);
}
var getLabelUnit = function(col){
    if (columns[col].unit){
        return(columns[col].label+' ('+columns[col].unit+')');
    }else{
        return(columns[col].label);
    }
}

// Define GWCatalogue class
function GWCatalogue(){
    // set initial axes
    // this.init()
    return this;
}
GWCatalogue.prototype.init = function(){
    this.flySp=1000;
    this.xvar = "initmass1";
    this.yvar = "initmass2";
    this.legenddescs = {GW:'Detections',
        LVT:'Candidates'}
    this.typedescs = {GW:'Detection',
        LVT:'Candidate'}
    this.setStyles();
    this.sketchName="None";
    this.setScales();

}
GWCatalogue.prototype.scaleWindow = function(){
    this.winFullWidth=document.getElementById("full").offsetWidth;
    this.winFullHeight=document.getElementById("full").offsetHeight;
    this.winAspect = this.winFullWidth/this.winFullHeight;
    // console.log(this.winFullWidth,this.winFullHeight,this.winAspect);

    info=document.getElementById("infoouter");
    skcont=document.getElementById("sketchcontainer");
    labcont=document.getElementById("labcontainer");
    graph=document.getElementById("graphcontainer");
    if (this.winAspect<1){
        // portrait
        console.log('portrait');
        this.portrait=true;
        this.sketchFullWidth = 0.9*this.winFullWidth;
        this.sketchFullHeight = 0.5*this.sketchFullWidth;
        this.fullGraphWidth = 0.95*this.winFullWidth;
        this.fullGraphHeight =
            0.8*(this.winFullHeight-this.sketchFullHeight);
        info.style["margin-left"]="5%";
        this.sketchWidth = 0.45*this.sketchFullWidth;
        this.sketchHeight = this.sketchFullHeight;
        console.log(this.sketchHeight,this.sketchFullHeight);
        this.labWidth = 0.5*this.sketchFullWidth;
        this.labHeight = this.sketchFullHight;
        //this.labcontWidth="45%";
        this.labcontHeight="20%";
        // info.style.top = "50%";
        // info.style.left = "0%";
    }else{
        // landscape window
        console.log('landscape')
        this.portrait=false;
        this.sketchFullHeight = 0.85*this.winFullHeight;
        this.sketchFullWidth = 0.5*this.sketchFullHeight;
        this.fullGraphWidth =
            0.95*(this.winFullWidth-this.sketchFullWidth);
        this.fullGraphHeight = 0.9*this.winFullHeight;
        info.style["margin-left"]=0;
        this.sketchWidth = this.sketchFullWidth;
        this.sketchHeight = 0.5*this.sketchFullHeight;
        // console.log(this.sketchHeight,this.sketchFullHeight);
        this.sketchAspect = this.sketchFullWidth/this.sketchFullHeight;
        this.labWidth = this.sketchFullWidth;
        this.labHeight = 0.5*this.sketchFullHight;
        //this.labcontWidth="45%";
        this.labcontHeight="10%";
        // info.style.top = "";
        // info.style.left = "";
    }
    info.style.width = this.sketchFullWidth;
    info.style.height = this.sketchFullHeight;
    graph.style.width = this.fullGraphWidth;
    graph.style.height = this.fullGraphHeight;
    // console.log(this.sketchHeight,this.sketchFullHeight);
    skcont.style.height = this.sketchHeight;
    skcont.style.width = this.sketchWidth;
    // console.log(skcont);
    labcont.style.height = this.labHeight;
    labcont.style.width = this.labWidth;
    this.svgHeight = this.fullGraphHeight;
    this.svgWidth = this.fullGraphWidth;
    // console.log('window',this.winFullWidth,this.winFullHeight);
    // console.log('sketchfull',this.sketchFullWidth,this.sketchFullHeight);
        // .attr("height",this.sketchFullHeight);
    // console.log('infoouter',
    //     document.getElementById("infoouter").offsetHeight,
    //     document.getElementById("infoouter").offsetWidth);

}
GWCatalogue.prototype.setScales = function(){
    this.scaleWindow();
    var gw=this;

    this.margin = {top: 40, right: 20, bottom: 20, left: 60}
    this.graphWidth =
        this.fullGraphWidth - this.margin.left - this.margin.right;
    this.graphHeight =
        0.9*this.fullGraphHeight - this.margin.top - this.margin.bottom;

    // set errorbar marker width
    // this.relh = [0.0,1.0];
    // this.relw = [0,1.0];
    this.xyAspect = this.graphWidth/this.graphHeight;
    // this.errh = 0.01*(this.relh[1]-this.relh[0]);
    // this.errw = 0.01*(this.relw[1]-this.relw[0]);//*xyAspect;
    this.errh = 0.01;
    this.errw = 0.01;//*xyAspect;
    this.xValue = function(d) {return d[gw.xvar];} // data -> value
    // value -> display
    this.xScale = d3.scale.linear().domain([0,100])
        .range([0, this.graphWidth])
        // data -> display
    this.xMap = function(d) { return gw.xScale(gw.xValue(d));}
    // x error bars
    this.xErrP = function(d) {return d[gw.xvar+'plus'];} //error+ -> value
    this.xErrM = function(d) {return d[gw.xvar+'minus'];} //error- -> value
    // x error+ -> display
    this.xMapErrP = function(d) { return gw.xScale(gw.xErrP(d))}
    // x error- -> display
    this.xMapErrM = function(d) { return gw.xScale(gw.xErrM(d));}
    // x error caps -> display
    this.xMapErrY0 = function(d) { return gw.yScale(gw.yValue(d)) - (gw.errh*gw.graphHeight);}
    this.xMapErrY1 = function(d) { return gw.yScale(gw.yValue(d)) + (gw.errh*gw.graphHeight);}

    // x axis
    this.xAxis = d3.svg.axis()
            .scale(this.xScale)
            .orient("bottom")
            .innerTickSize(-this.graphHeight);
    // setup y
    //data -> value
    this.yValue = function(d) {return d[gw.yvar];}
    // value -> display
    // this.yScale = d3.scale.linear().
    //     range([this.relh[1]*this.graphHeight, this.relh[0]*this.graphHeight])
    this.yScale = d3.scale.linear().range([this.graphHeight,0])
    // data -> display
    this.yMap = function(d) { return gw.yScale(gw.yValue(d));}
    // y error bars
    this.yErrP = function(d) {return d[gw.yvar+'plus'];} //error+ -> value
    this.yErrM = function(d) {return d[gw.yvar+'minus'];} //error- -> value
    // y error+ -> display
    this.yMapErrP = function(d) { return gw.yScale(gw.yErrP(d));}
    // y error- -> display
    this.yMapErrM = function(d) { return gw.yScale(gw.yErrM(d));}
    // y error caps -< display
    this.yMapErrX0 = function(d) { return gw.xScale(gw.xValue(d)) - (gw.errw*gw.graphWidth);}
    this.yMapErrX1 = function(d) { return gw.xScale(gw.xValue(d)) + (gw.errw*gw.graphWidth);}

    // y axis
    this.yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient("left")
            // .innerTickSize(-(this.relw[1]-this.relw[0])*this.graphWidth);
            .innerTickSize(-this.graphWidth);

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    this.marginSketch = {top: 0, right: 0, bottom: 0, left: 0}
    //-
        // document.getElementById("sketchtitle").offsetHeight -
        //  marginSketch.top - marginSketch.bottom;
    this.sketchWidth =
        document.getElementById("sketchcontainer").offsetWidth -
        this.marginSketch.left - this.marginSketch.right;
    this.sketchHeight =
        document.getElementById("sketchcontainer").offsetHeight -
        this.marginSketch.top - this.marginSketch.bottom;
    this.aspectSketch = this.sketchHeight/this.sketchWidth
    // console.log('sketchcont',this.sketchHeight,this.sketchWidth);

    // labContainer = document.createElement("div")
    // labContainer.setAttribute("id","labcontainer");
    // document.getElementById("sketchcontainer").appendChild(labContainer)
    //
    // set scaleing functions for sketch
    this.scaleRadius = function(mass,ref){
        return(0.2*this.sketchWidth*(mass/100.))}
    this.xScaleSk = function(x){return(x*this.sketchWidth)}
    this.xScaleSkAspect = function(x){
        return(x*this.sketchWidth*this.aspectSketch)}
    this.yScaleSk = function(y){return(y*this.sketchHeight)}

    // set positions
    this.bhpos = {
        pri:{cx:0.3,cy:0.5,xicon:"5%",yicon:"40%",xtxt:0.1,ytxt:0.25,scx:0.25,scy:0.5},
        sec:{cx:0.3,cy:0.8,xicon:"5%",yicon:"70%",xtxt:0.1,ytxt:0.55,scx:0.25,scy:0.8},
        final:{cx:0.7,cy:0.7,xicon:"80%",yicon:"60%",xtxt:0.85,ytxt:0.4,scx:0.6,scy:0.7},
        date:{xicon:0.1,yicon:0.7,xtxt:0.2,ytxt:0.725},
        dist:{xicon:0.1,yicon:0.85,xtxt:0.2,ytxt:0.875},
        typedesc:{xicon:0.6,yicon:0.7,xtxt:0.7,ytxt:0.75},
        far:{xicon:0.6,yicon:0.85,xtxt:0.7,ytxt:0.9}};
    //icon size and files
    this.micon = {w:"20%",h:"20%",file:"img/mass-msun.svg",
        pri:{lab:["initmass1"],ttlab:"Primary Black Hole Mass"},
        sec:{lab:["initmass2"],ttlab:"Seconary Black Hole Mass"},
        final:{lab:["finalmass"],ttlab:"Final Black Hole Mass"},
    }; //mass icons
    // this.iicon = {w:"10%",h:"10%"}; //info icons
    // columns to show
    this.yout = -0.3;
    this.labels={
        "date":{icon:"img/time.svg",lab:["datestr","timestr"],
            ttlab:"Date of detection"},
        "dist":{icon:"img/ruler.svg",lab:["distanceStr","distanceLyStr"],
            ttlab:"Distance",varname:"distance"},
        "typedesc":{icon:"img/blank.svg",lab:["typedesc"],
            ttlab:"Category of detection"},
        'far':{icon:"img/dice.svg",lab:["fappercent","fartxt"],
            ttlab:"False alarm probability and rate",varname:"SNR"},
        'peaklum':{icon:"img/blank.svg",lab:["peaklumMsuntxt"],
            ttlab:"Peak Luminosity",varname:"peaklum"},
        "energy":{icon:"img/blank.svg",lab:["energytxt"],
            ttlab:"Radiated energy",varname:"energy"},
        "initspineff":{icon:"img/blank.svg",lab:["initspineffStr"],
            ttlab:"Initial Effective Spin Magnitude",varname:"initspineff"},
        "finalspin":{icon:"img/blank.svg",lab:["finalspinStr"],
            ttlab:"Final Spin Magnitude",varname:"finalspin"},
        "data":{icon:"img/blank.svg",lab:["datalink"],ttlab:"Link to data"}
    }
    // this.icons = {
    //     mass:"img/mass-msun.svg",
    //     date:"img/time.svg",
    //     dist:"img/ruler.svg",
    //     typedesc:"img/blank.svg",
    //     far:"img/dice.svg"};
    // data columns to read from for labels
    // this.cols={
    //     pri:["initmass1"],sec:["initmass2"],final:["finalmass"],
    //     date:["datestr","timestr"],
    //     dist:["distanceStr","distanceLyStr"],
    //     typedesc:["typedesc"],
    //     far:["fappercent","fartxt"]};
    // // y-location of BH when they fly out
    // this.yout = -0.3;
    // // tooltip labels
    this.ttlabels = {
        pri:"Primary Black Hole Mass",
        sec:"Secondary Black Hole Mass",
        final:"Final Black Hole Mass",
        date:"Date of detection",
        typedesc:"Category of detection",
        far:"False alarm probability and rate",
        dist:"Distance",
        peaklum:"Peak Luminosity",
        energy:"Energy radiated",
        initspineff:"Initial Effective Spin Magnitude",
        finalspin:"Final Spin Magnitude",
        data:"LIGO Open Science Center"};
    this.labBlank="--";
}
GWCatalogue.prototype.drawSketch = function(){
    // Create sketch panel
    // console.log("svg scale",this.sketchWidth,this.sketchHeight);
    // Add svg to sketch container
    this.svgSketch = d3.select("div#sketchcontainer").append("svg")
        .attr("preserveAspectRatio", "none")
        .attr("id","svgSketch")
        // .attr("viewBox","0 0 "+this.sketchWidth+" " +this.sketchHeight)
        .attr("width", this.sketchWidth + this.marginSketch.left + this.marginSketch.right)
        .attr("height", (this.sketchHeight + this.marginSketch.top + this.marginSketch.bottom))
        .append("g")
        .attr("transform", "translate(" + this.marginSketch.left + "," + this.marginSketch.top + ")");
    // make gradients
    this.gradBH = this.svgSketch.append("defs")
      .append("radialGradient")
        .attr("id", "gradBH");
    this.gradBH.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", this.colBH[0]);
    this.gradBH.append("stop")
        .attr("offset", "80%")
        .attr("stop-color", this.colBH[0]);
    this.gradBH.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", this.colBH[1]);
    this.gradShadow = this.svgSketch.append("defs")
      .append("radialGradient")
        .attr("id", "gradShadow");
    this.gradShadow.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", this.colShadow[0]);
    this.gradShadow.append("stop")
        .attr("offset", "25%")
        .attr("stop-color", this.colShadow[0]);
    this.gradShadow.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", this.colShadow[1]);

    if (this.redraw){
        console.log('redrawing masses');
        for (lab in this.labels){console.log('lab',lab);this.addLab(lab)};
        this.addMasses("pri",true);
        this.addMasses("sec",true);
        this.addMasses("final",true);
    }else{
        for (lab in this.labels){console.log('lab',lab);this.addLab(lab)};
        this.addMasses("pri",false);
        this.addMasses("sec",false);
        this.addMasses("final",false);
    }
    // add title
    this.sketchTitle = this.svgSketch.append("text")
        .attr("x",this.xScaleSk(0.5))
        .attr("y",this.yScaleSk(0.1))
        .attr("text-anchor","middle")
        .attr("font-size","1.5em")
        .html("Information Panel");

    // this.tooltipSk = document.createElement('div');
    // this.tooltipSk.className = "tooltip";
    // this.tooltipSk.setAttribute("id","tooltipSk");
    // this.tooltipSk.style.opacity = 0;
    // document.getElementById('infoouter').appendChild(this.tooltipSk);
}
GWCatalogue.prototype.addMasses = function(bh,redraw){
    // add ellipse for shadow
    gw=this;
    var redraw;
    // console.log(bh,redraw);
    this.svgSketch.append("ellipse")
        .attr("class","sketch shadow-"+bh)
        .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
        .attr("cy",this.yScaleSk(this.bhpos[bh].scy))
        .attr("rx",this.scaleRadius(0,1))
        .attr("ry",this.scaleRadius(0,1))
        // .attr("rx",function(){
        //     if (redraw){
        //         return gw.scaleRadius(
        //             d[gw.cols[bh][0]],d["finalmass"]);
        //     }else{return gw.scaleRadius(0,1);}})
        // .attr("ry",function(){
        //     if (redraw){
        //         return gw.scaleRadius(
        //             0.2*d[gw.cols[bh][0]],d["finalmass"]);
        //     }else{return gw.scaleRadius(0,1);}})
        .attr("fill","url(#gradShadow)");
    // add circle for black hole
    this.svgSketch.append("circle")
        .attr("class","sketch bh-"+bh)
        .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
        .attr("cy",this.yScaleSk(this.yout))
        .attr("r",this.scaleRadius(1,1))
        // .attr("cy",function(){
        //     if (redraw){
        //         gw.yScaleSk(gw.bhpos[bh].cy)-
        //             gw.scaleRadius(d[gw.cols[bh][0]],d["finalmass"]);
        //     }
        //     else{return gw.yScaleSk(gw.yout);}})
        // .attr("r",function(){
        //     if (redraw){return gw.scaleRadius(d[gw.cols[bh][0]],d["finalmass"]);}
        //     else{return gw.scaleRadius(1,1);}})
        .attr("fill","url(#gradBH)");
    // add mass icon
    if (!redraw){
        massicondiv = document.createElement('div');
        massicondiv.className = 'icon massicon';
        massicondiv.setAttribute("id",'icon'+bh);
        massicondiv.style.width = this.micon.w;
        massicondiv.style.height = this.micon.h;
        massicondiv.style.left = this.bhpos[bh].xicon;
            // xScaleSk(bhpos[bh].xicon)-xScaleSkAspect(micon.w)/2;
        massicondiv.style.top = this.bhpos[bh].yicon;
        massicondiv.style.position = "absolute";
        massicondiv.innerHTML =
            "<img src='"+this.micon.file+"'>"
        massicondiv.onmouseover = function(e){
            console.log(this.id)
            gw.showTooltip(e,this.id.split("icon")[1])}
        massicondiv.onmouseout = function(){gw.hideTooltip()};
        // add mass text
        masstxtdiv = document.createElement('div');
        masstxtdiv.className = 'sketchlab mtxt';
        masstxtdiv.setAttribute('id','mtxt-'+bh);
        masstxtdiv.innerHTML = this.labBlank;
        massicondiv.appendChild(masstxtdiv);
        document.getElementById('sketchcontainer').appendChild(massicondiv);
        // document.getElementById('sketchcontainer').appendChild(masstxtdiv);
        // masstxtdiv.onmouseover = function(e){
        //     showTooltip(e,this.id.split("mtxt-")[1])}
        // masstxtdiv.onmouseout = function(){hideTooltip()};
    }
}
GWCatalogue.prototype.addLab = function(lab){
    // add labels as html elements
    var gw=this;
    labimgdiv = document.createElement('div');
    labimgdiv.className = 'icon labcont';
    labimgdiv.setAttribute("id",lab+'icon');
    labimgdiv.style.width = this.labcontWidth;
    labimgdiv.style.height = this.labcontHeight;
    // console.log(labimgdiv.classList);
    // labimgdiv.style.width = "40%";
    // labimgdiv.style.height = this.iicon.h;
    // labimgdiv.style.left =
    //     xScaleSk(bhpos[lab].xicon)-xScaleSkAspect(micon.w)/2;
    // labimgdiv.style.top = yScaleSk(bhpos[lab].yicon)-yScaleSk(micon.h)/2;
    // labimgdiv.style.position = "absolute";
    labimgdiv.style.display = "inline-block";
    if (this.labels[lab].icon){
        labimgdiv.innerHTML ="<img src='"+this.labels[lab].icon+"'>"
    }
    labimgdiv.onmouseover = function(e){
        gw.showTooltip(e,this.id.split("icon")[0])}
    labimgdiv.onmouseout = function(){gw.hideTooltip()};
    var labtxtdiv = document.createElement('div');
    labtxtdiv.className = 'sketchlab info';
    labtxtdiv.setAttribute("id",lab+'txt');
    // labtxtdiv.style.left = xScaleSk(bhpos[lab].xtxt);
    // labtxtdiv.style.top = yScaleSk(bhpos[lab].ytxt)-yScaleSk(micon.h)/2;
    // labtxtdiv.style.display = "inline-block";
    labtxtdiv.style.height = "100%";
    labtxtdiv.innerHTML = '--';
    // console.log(labtxtdiv);
    labimgdiv.appendChild(labtxtdiv);
    labtxtdiv.onmouseover = function(e){
        gw.showTooltip(e,this.id.split("txt")[0])}
    labtxtdiv.onmouseout = function(){gw.hideTooltip()};
    document.getElementById('labcontainer').appendChild(labimgdiv);
}
GWCatalogue.prototype.flyOutMasses = function(bh){
    // fly out masses
    // if (bh=="final"){this.xout=1.3}else{this.xout=-0.3};
    this.svgSketch.select('circle.bh-'+bh)
        .transition().duration(this.flySp)
        .attr("cy",this.yScaleSk(this.yout));
    this.svgSketch.select('ellipse.shadow-'+bh)
        .transition().duration(this.flySp)
        .attr("rx",this.scaleRadius(1,1))
        .attr("ry",this.scaleRadius(1,1));
    // if (svgLabs){
    //     svgSketch.select(".mtxt-"+bh).html(labBlank);
    // }else{
        document.getElementById("mtxt-"+bh).innerHTML = this.labBlank;
    // }
};
GWCatalogue.prototype.flyInMasses = function(d,bh,resize){
    // if (bh=="final"){this.xout=1.5}else{this.xout=-0.5};
    if (resize=="smooth"){
        // only resize circle & shadow
        this.svgSketch.select('circle.bh-'+bh)
            .transition().duration(this.flySp)
            .attr("r",this.scaleRadius(
                d[this.micon[bh].lab[0]],d["finalmass"]))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-
                this.scaleRadius(d[this.micon[bh].lab[0]],d["finalmass"]));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .transition().duration(this.flySp)
            .attr("rx",this.scaleRadius(
                d[this.micon[bh].lab[0]],d["finalmass"]))
            .attr("ry",this.scaleRadius(
                0.2*d[this.micon[bh].lab[0]],d["finalmass"]));
    }else if(resize=="fly"){
        // resize & fly in
        this.svgSketch.select('circle.bh-'+bh)
            .attr("r",this.scaleRadius(
                d[this.micon[bh].lab[0]],d["finalmass"]));
        this.svgSketch.select('circle.bh-'+bh)
            .transition().duration(this.flySp).ease("bounce")
            .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-
                this.scaleRadius(d[this.micon[bh].lab[0]],d["finalmass"]));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .transition().duration(this.flySp).ease("bounce")
            .attr("rx",this.scaleRadius(
                d[this.micon[bh].lab[0]],d["finalmass"]))
            .attr("ry",this.scaleRadius(
                0.2*d[this.micon[bh].lab[0]],d["finalmass"]));
    }else if(resize=="snap"){
        this.svgSketch.select('circle.bh-'+bh)
            .attr("r",this.scaleRadius(
                d[this.micon[bh].lab[0]],d["finalmass"]))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-
                this.scaleRadius(d[this.micon[bh].lab[0]],d["finalmass"]));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .attr("rx",this.scaleRadius(
                d[this.micon[bh].lab[0]],d["finalmass"]))
            .attr("ry",this.scaleRadius(
                0.2*d[this.micon[bh].lab[0]],d["finalmass"]));
    };
    // set labels
    // if (svgLabs){
    // OBSOLETE
    //     svgSketch.select("text.mtxt-"+bh).html(d[cols[bh][0]]);
    // }else{
        document.getElementById("mtxt-"+bh).innerHTML =
            d[this.micon[bh].lab[0]+'Str'];
    // }
};
GWCatalogue.prototype.updateSketch = function(d){
    // if ((document.getElementById("sketchcontainer").classList.contains("nothidden"))&&
    // (sketchName==d["name"])){
    if (this.redraw){
        console.log('redrawing');
        console.log('resizing');
        this.flyInMasses(d,"pri","snap");
        this.flyInMasses(d,"sec","snap");
        this.flyInMasses(d,"final","snap");
        this.sketchTitle.html("Information: "+this.sketchName);
        for (lab in this.labels){
            console.log(this.labels[lab])
                labTxt=''
                for (i in this.labels[lab].lab){
                    labTxt += " "+d[this.labels[lab].lab[i]];
                    if (columns[this.labels[lab].lab[i]].unit){
                        labTxt += " "+columns[this.labels[lab].lab[i]].unit;
                    }
                    if (i<this.labels[lab].lab.length-1){
                        labTxt += "<br>";
                    }
                }
            // if(svgLabs){
            // OBSOLETE
            //     svgSketch.select("text."+lab+"txt").html(labTxt);
            // }else{
                document.getElementById(lab+"txt").innerHTML = labTxt;
            // }
        }
    }else if ((this.sketchName==d["name"])){
        console.log('flying out');
        this.flyOutMasses("pri");
        this.flyOutMasses("sec");
        this.flyOutMasses("final");
        // replace title
        this.sketchName="None";
        this.sketchTitle.html("Information Panel");
        for (lab in this.labels){
            // if(svgLabs){
            //     svgSketch.select("text."+lab+"txt").html(labBlank);
            // }else{
                document.getElementById(lab+"txt").innerHTML = this.labBlank;
            // }
        }
    }else{
        if ((this.sketchName=="None")||(this.sketchName=="")) {
            console.log('flying in');
            this.flyInMasses(d,"pri","fly");
            this.flyInMasses(d,"sec","fly");
            this.flyInMasses(d,"final","fly");
        }else{
            console.log('resizing');
            this.flyInMasses(d,"pri","smooth");
            this.flyInMasses(d,"sec","smooth");
            this.flyInMasses(d,"final","smooth");
        }
        // replace title
        this.sketchName = d["name"];
        this.sketchTitle.html("Information: "+this.sketchName);
        for (lab in this.labels){
            labTxt=''
            for (i in this.labels[lab].lab){
                console.log('lab',this.labels[lab].lab[i],d[this.labels[lab].lab[i]])
                labTxt += " "+d[this.labels[lab].lab[i]];
                if (columns[this.labels[lab].lab[i]].unit){
                    labTxt += " "+columns[this.labels[lab].lab[i]].unit;
                }
                if (i<this.labels[lab].lab.length-1){
                    labTxt += "<br>";
                }
            }
            document.getElementById(lab+"txt").innerHTML = labTxt;
        }
    }
}
GWCatalogue.prototype.redrawSketch = function(){
    wWidth = document.getElementById("graphcontainer").offsetWidth;
    wHeight = document.getElementById("graphcontainer").offsetHeight;
    wAspect = wWidth/wHeight;
    console.log(wAspect,this.svgSketch);
    if (wAspect>0){
        //landscape
    }
}

// ****************************************************************************
// ****************************************************************************
// ****************************************************************************

GWCatalogue.prototype.setStyles = function(){
    // setup colours and linestyles
    this.cValue = function(d) {return d.type;};
    this.color = d3.scale.category10();
    this.linestyles = {GW:"#000",LVT:"#999"}
    this.colorErr = "#555";
    this.swErr = 2;
    this.opErr = 0.7;

    // set colours
    this.colBH = ["rgba(0,0,0,1)","rgba(0,0,0,0)"];
    this.colShadow = ["rgba(128,128,128,1)","rgba(192,192,192,0)"];

}
GWCatalogue.prototype.tttext = function(d){
    // tooltip text
    return "<span class='ttname'>"+d["name"]+"</span>"+
    "<span class='ttpri'>"+d[this.xvar]+"</span>"+"<span class='ttsec'>"+d[this.yvar]+"</span>";
}

GWCatalogue.prototype.formatData = function(d){
    console.log('formatData',d.name);
    for (col in columns){
        if (columns[col].type=="fn"){d[col]=columns[col].fn(d);console.log('new column',col,d[col])};
        if (columns[col].type=="flt"){
            d[col] = +d[col];
            if (columns[col]['errcode']){
                errcode=d[columns[col]['errcode']].split('e')[1]
                errcode=errcode.split('-')
                d[col+'plus'] = +errcode[0] + d[col];
                d[col+'minus'] = -errcode[1] + d[col];
                d[col+'Str'] = parseFloat(d[col+'minus'].toPrecision(3))+' - '+
                        parseFloat(d[col+'plus'].toPrecision(3))
                columns[col+'Str']={'type':'str','unit':columns[col].unit}
            }
        }
        // console.log(col,d[col])
        // console.log(col,d[col]);
    }
}
GWCatalogue.prototype.makeGraph = function(){
    // this.setSvgScales();
    console.log('makeGraph');
    svgcont = d3.select("div#graphcontainer").append("div")
        .attr("id","svg-container")
        .attr("width",this.svgWidth)
        .attr("height",this.svgHeight)
        .classed("svg-container",true);
    this.svg = d3.select(".svg-container").append("svg")
        // .attr("preserveAspectRatio", "xMidYMid meet")
        // .attr("viewBox","0 0 "+this.graphWidth+" " +1.2*this.graphHeight)
        .attr("width",this.svgWidth)
        .attr("height",this.svgHeight)
        // .classed("svg-content-responsive",true);
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom);

    this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," +
            this.margin.top + ")")

// add the tooltip area to the webpage
    if (!this.redraw){
        this.tooltip = d3.select("div#graphcontainer").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
}
GWCatalogue.prototype.drawGraphInit = function(){
    var gw = this;
    console.log('drawGraphInit')
    d3.csv("csv/gwcat.csv", function(error, data) {
        console.log('d3.csv');
        // console.log(gw);
        // change string (from CSV) into number format
        // var data=data;

        // var formatData = this.formatData(d)
        // console.log(this.formatData,formatData(d));
        data.forEach(gw.formatData);
        gw.data = data;
        // console.log(data);

        gw.makePlot();

        // console.log('gw.data',gw.data);
    });

}

GWCatalogue.prototype.drawGraph = function(){
    var gw = this;
    // gw.setSvgScales();
    gw.makeGraph();
    data = this.data;
    // console.log(this.graphHeight);
    console.log('drawGraph');
    // console.log('this.data',this.data);

    // don't want dots overlapping axis, so add in buffer to data domain
    // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    // yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    xBorder = (columns[gw.xvar].border) ? columns[gw.xvar].border : 2;
    xMin = (d3.min(data, gw.xErrM)<0) ? d3.min(data, gw.xErrM) - xBorder : 0;
    xMax = d3.max(data, gw.xErrP)+xBorder;
    gw.xScale.domain([xMin, xMax]);
    yBorder = (columns[gw.yvar].border) ? columns[gw.yvar].border : 2;
    yMin = (d3.min(data, gw.yErrM)<0) ? d3.min(data, gw.yErrM) - yBorder : 0;
    yMax = d3.max(data, gw.yErrP)+yBorder;
    xAxLineOp = (yMin < 0) ? 1 : 0;
    yAxLineOp = (xMin < 0) ? 1 : 0;
    gw.yScale.domain([yMin, yMax]);


    // x-axis
    gw.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate("+gw.margin.left+"," +
            (gw.margin.top + gw.graphHeight) + ")");
    gw.svg.select(".x-axis.axis")
        .append("line")
        .attr("class","x-axis axis-line")
        .attr("x1",0).attr("x2",gw.graphWidth)
        .attr("y1",0).attr("y2",0)
        .style("stroke","rgb(200,200,200)").attr("stroke-width",5)
        .attr("opacity",xAxLineOp);
    gw.svg.select(".x-axis.axis").call(gw.xAxis)
    gw.svg.select(".x-axis.axis").append("text")
        .attr("class", "x-axis axis-label")
        // .attr("x", (gw.relw[0]+gw.relw[1])*gw.graphWidth/2)
        .attr("x", gw.graphWidth/2)
        .attr("y", "2em")
        .style("text-anchor", "middle")
        .text(getLabelUnit(gw.xvar));
    gw.svg.select(".x-axis.axis").append("line")
        .attr("class","x-axis axis-line")
        .attr("x1",0).attr("x2",gw.graphWidth)
        .attr("y1",0).attr("y2",0)
        .style("stroke","rgb(200,200,200)").attr("stroke-width",5)
        .attr("opacity",xAxLineOp);

    // y-axis
    gw.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")");
    gw.svg.select(".y-axis.axis").append("line")
        .attr("class","y-axis axis-line")
        .attr("x1",0).attr("x2",0)
        .attr("y1",0).attr("y2",gw.graphHeight)
        .style("stroke","rgb(200,200,200)").attr("stroke-width",5)
        .attr("opacity",yAxLineOp);
    gw.svg.select(".y-axis.axis").call(gw.yAxis)
    gw.svg.select(".y-axis.axis").append("text")
        .attr("class", "y-axis axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x",-gw.graphHeight/2)
        .attr("dy", "-30px")
        .style("text-anchor", "middle")
        .text(getLabelUnit(gw.yvar));

    // add x error bar
    errorGroup = gw.svg.append("g").attr("class","g-errors")
    errorGroup.selectAll(".errorX")
        .data(data)
    .enter().append("line")
        .attr("class","error errorX")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("x1",gw.xMapErrP).attr("x2",gw.xMapErrM)
        .attr("y1",gw.yMap).attr("y2",gw.yMap)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    // add top of y error bar
    errorGroup.selectAll(".errorXp")
        .data(data)
    .enter().append("line")
        .attr("class","error errorXp")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("x1",gw.xMapErrP).attr("x2",gw.xMapErrP)
        .attr("y1",gw.xMapErrY0).attr("y2",gw.xMapErrY1)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    // add bottom of y error bar
    errorGroup.selectAll(".errorXm")
        .data(data)
    .enter().append("line")
        .attr("class","error errorXm")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("x1",gw.xMapErrM).attr("x2",gw.xMapErrM)
        .attr("y1",gw.xMapErrY0).attr("y2",gw.xMapErrY1)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);

    // add y error bar
    errorGroup.selectAll(".errorY")
        .data(data)
    .enter().append("line")
        .attr("class","error errorY")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("x1",gw.xMap).attr("x2",gw.xMap)
        .attr("y1",gw.yMapErrP).attr("y2",gw.yMapErrM)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    // add top of y error bar
    errorGroup.selectAll(".errorYp")
        .data(data)
    .enter().append("line")
        .attr("class","error errorYp")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("x1",gw.yMapErrX0).attr("x2",gw.yMapErrX1)
        .attr("y1",gw.yMapErrP).attr("y2",gw.yMapErrP)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    // add bottom of y error bar
    errorGroup.selectAll(".errorYm")
        .data(data)
    .enter().append("line")
        .attr("class","error errorYm")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("x1",gw.yMapErrX0).attr("x2",gw.yMapErrX1)
        .attr("y1",gw.yMapErrM).attr("y2",gw.yMapErrM)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);

    gw.svg.append("g")
        .attr("class","g-highlight")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .style("fill","white")
        .style("fill-opacity",0)
        .style("stroke","red")
        .style("stroke-width",3)
    .append("circle")
        .attr("id","highlight")
        .attr("class","dot-hl")
        .attr("opacity",0)
        .attr("cx",gw.xScale(0))
        .attr("cy",gw.yScale(0))
        .attr("r",15)
    // draw dots
    gw.svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("transform", "translate("+gw.margin.left+","+
        gw.margin.top+")")
      .attr("r", 7)
      .attr("cx", gw.xMap)
      .attr("cy", gw.yMap)
      .attr("cursor","pointer")
    //   .style("fill", function(d) { return color(cValue(d));})
      .style("fill", function(d){return gw.color(gw.cValue(d));})
      .style("stroke",function(d){return gw.linestyles[d.type];})
      .on("mouseover", function(d) {
            gw.tooltip.transition()
               .duration(200)
               .style("opacity", .9);
            gw.tooltip.html(gw.tttext(d))
               .style("left", (d3.event.pageX + 10) + "px")
               .style("top", (d3.event.pageY-10) + "px")
               .style("width","auto")
               .style("height","auto");
      })
      .on("mouseout", function(d) {
          gw.tooltip.transition()
               .duration(500)
               .style("opacity", 0);
        //   document.getElementById("sketchcontainer").style.opacity=0.;
      })
      .on("click", function(d) {
          gw.moveHighlight(d);
          gw.updateSketch(d);
        //   add highlight to selected circle
        });
    // draw legend
    gw.legend = gw.svg.selectAll(".legend")
      .data(gw.color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," +
        (i * 24) + ")"; });

    // draw legend colored rectangles
    gw.legend.append("rect")
      .attr("x", gw.margin.left + 12)
      .attr("y", gw.margin.top + 12)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", gw.color)
      .style("stroke",function(d){return gw.linestyles[d.type];})
      .style("stroke","#000");

    // draw legend text
    gw.legend.append("text")
      .attr("x", gw.margin.left + 36)
      .attr("y", gw.margin.top + 21)
      .attr("dy", ".35em")
      .attr("font-size","1.2em")
      .style("text-anchor", "start")
      .text(function(d) { return gw.legenddescs[d];})

    //add options icon
    this.optionsbg = d3.select('#options-bg');
    this.optionsouter = d3.select('#options-outer')
    //add options icon
    d3.select("#svg-container").append("div")
      .attr("id","options-icon")
      .style({"right":gw.margin.right,"top":0,"width":40,"height":40})
    .append("img")
      .attr("src","img/settings.svg")
      .on("click",function(){gw.showOptions();});
    this.optionsbg.on("click",function(){gw.hideOptions();});
    this.optionsouter
      .style("top","200%");
    this.optionsouter
      .append("div")
      .attr("id","options-close")
      .html("<img src='img/close.png' title='close'>")
      .on("click",function(){gw.hideOptions();});

}
GWCatalogue.prototype.moveHighlight = function(d){
    var gw=this;
    if ((this.sketchName==d["name"])){
        // fade out
        gw.svg.select("#highlight")
            .transition().duration(500)
            .style("opacity",0);
    }else{
        // fade in and move
        gw.svg.select("#highlight")
            .transition().duration(500)
            .attr("cx",gw.xMap(d)).attr("cy",gw.yMap(d))
            .style("opacity",1);
    }

}
GWCatalogue.prototype.updateErrors = function(){
    // svg = d3.select("body").transition();
    if (columns[this.xvar]["errcode"]==""){
        this.svg.selectAll(".errorX")
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",0);
        this.svg.selectAll(".errorXp")
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",0);
        this.svg.selectAll(".errorXm")
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",0);
    }else{
        this.svg.selectAll(".errorX")
            .transition()
            .duration(750)
            .attr("x1",this.xMapErrP).attr("x2",this.xMapErrM)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",1);
        this.svg.selectAll(".errorXp")
            .transition()
            .duration(750)
            .attr("x1",this.xMapErrP).attr("x2",this.xMapErrP)
            .attr("y1",this.xMapErrY0).attr("y2",this.xMapErrY1)
            .attr("opacity",1);
        this.svg.selectAll(".errorXm")
            .transition()
            .duration(750)
            .attr("x1",this.xMapErrM).attr("x2",this.xMapErrM)
            .attr("y1",this.xMapErrY0).attr("y2",this.xMapErrY1)
            .attr("opacity",1);
    }
    if (columns[this.yvar]["errcode"]==""){
        this.svg.selectAll(".errorY")
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",0);
        this.svg.selectAll(".errorYp")
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",0);
        this.svg.selectAll(".errorYm")
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",0);
    }else{
        this.svg.selectAll(".errorY")
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMapErrP).attr("y2",this.yMapErrM)
            .attr("opacity",1);
        this.svg.selectAll(".errorYp")
            .transition()
            .duration(750)
            .attr("x1",this.yMapErrX0).attr("x2",this.yMapErrX1)
            .attr("y1",this.yMapErrP).attr("y2",this.yMapErrP)
            .attr("opacity",1);
        this.svg.selectAll(".errorYm")
            .transition()
            .duration(750)
            .attr("x1",this.yMapErrX0).attr("x2",this.yMapErrX1)
            .attr("y1",this.yMapErrM).attr("y2",this.yMapErrM)
            .attr("opacity",1);
    }
}

GWCatalogue.prototype.updateXaxis = function(xvarNew) {
    // set global variable
    this.xvar = xvarNew;
    var gw=this;
    var data=gw.data;
    // d3.csv("csv/gwcat.csv", function(error, data) {

        // change string (from CSV) into number format
        // data.forEach(gw.formatData);

        // don't want dots overlapping axis, so add in buffer to data domain
        // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
        xBorder= (columns[gw.xvar].border) ? columns[gw.xvar].border : 2
        if (columns[gw.xvar].errcode==""){
            xMin = (d3.min(data, gw.xValue)<0) ? d3.min(data, gw.xValue) - xBorder : 0;
            xMax = d3.max(data, gw.xValue)+xBorder;
            gw.xScale.domain([xMin, xMax]);
        }else{
            xMin = (d3.min(data, gw.xErrM)<0) ? d3.min(data, gw.xErrM) - xBorder : 0;
            xMax = d3.max(data, gw.xErrP)+xBorder;
            gw.xScale.domain([xMin, xMax]);
        }
        yAxLineOp = (xMin < 0) ? 1 : 0;

        // Select the section we want to apply our changes to
        var svg = d3.select("body").transition();

        // Make the changes
        gw.svg.selectAll(".dot")   // change the line
            .transition()
            .duration(750)
            .attr("cx", gw.xMap)
        // gw.svg.select(".dot-hl")
        //     .transition()
        //     .duration(750)
        //     .attr("cx", gw.xMap)
        gw.svg.select(".x-axis.axis") // change the x axis
            .transition()
            .duration(750)
            .call(gw.xAxis);
            //   .forceX([0]);
        gw.svg.select(".x-axis.axis-label")
            .transition()
            .duration(750)
            .text(getLabelUnit(gw.xvar));
        gw.svg.select(".y-axis.axis-line")
            .transition()
            .duration(750)
            .attr("x1",gw.xScale(0)).attr("x2",gw.xScale(0))
            .attr("opacity",yAxLineOp);
        // Update error bars
        data.forEach(function(d){
            if (d.name==gw.sketchName){
                gw.svg.select("#highlight")
                    .transition()
                    .duration(750)
                    .attr("cx", gw.xMap(d));
            }
        });
        gw.updateErrors();
    // });

}

GWCatalogue.prototype.updateYaxis = function(yvarNew) {
    // set global variable
    var gw=this;
    var data=gw.data;
    this.yvar = yvarNew;

    // d3.csv("csv/gwcat.csv", function(error, data) {

        // change string (from CSV) into number format
        // data.forEach(gw.formatData);
        // don't want dots overlapping axis, so add in buffer to data domain
        // yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
        yBorder= (columns[gw.yvar].border) ? columns[gw.yvar].border : 2
        if (columns[gw.yvar].errcode==""){
            yMin = (d3.min(data, gw.yValue)<0) ? d3.min(data, gw.yValue) - yBorder : 0;
            gw.yScale.domain([yMin, d3.max(data, gw.yValue)+yBorder]);
        }else{
            yMin = (d3.min(data, gw.yErrM)<0) ? d3.min(data, gw.yErrM) - yBorder : 0;
            gw.yScale.domain([yMin, d3.max(data, gw.yErrP)+yBorder]);
        }
        xAxLineOp = (yMin < 0) ? 1 : 0;
        console.log("xAxLineOp",xAxLineOp)
        // Select the section we want to apply our changes to
        // var svg = d3.select("body").transition();

        // Make the changes
        gw.svg.selectAll(".dot")   // change the line
            .transition()
            .duration(750)
            .attr("cy", gw.yMap)
        gw.svg.select(".y-axis.axis") // change the y axis
            .transition()
            .duration(750)
            .call(gw.yAxis);
        gw.svg.selectAll(".y-axis.axis-label")
            .transition()
            .duration(750)
            .text(getLabelUnit(gw.yvar));
        gw.svg.select(".x-axis.axis-line")
            .transition()
            .duration(750)
            .attr("y1",-gw.yScale(0)/2).attr("y2",-gw.yScale(0)/2)
            .attr("opacity",xAxLineOp);
        data.forEach(function(d){
            if (d.name==gw.sketchName){
                gw.svg.select("#highlight")
                    .transition()
                    .duration(750)
                    .attr("cy", gw.yMap(d));
            }
        });
        gw.updateErrors();
    // });
}
GWCatalogue.prototype.addOptions = function(){
    console.log("add options");
    var gw=this;
    // add buttons
    for (col in columns){
        if (columns[col].avail){
            var divx = document.getElementById('x-buttons');
            var newoptdivx = document.createElement('div');
            newoptdivx.classNm = 'option '+col;
            newoptdivx.style.display = 'inline-block';
            divx.appendChild(newoptdivx);
            var newoptinputx = document.createElement('input');
            newoptinputx.type = 'button';
            newoptinputx.name = col;
            newoptinputx.value = getLabel(col);
            newoptinputx.setAttribute("id","buttonx-"+col);
            if (col==this.xvar){newoptinputx.classList.add("down")};
            newoptinputx.addEventListener('click',function(){
                oldXvar = gw.xvar;
                document.getElementById("buttonx-"+oldXvar).classList.remove("down")
                this.classList.add("down");
                gw.updateXaxis(this.name);
            });
            newoptdivx.appendChild(newoptinputx);

            var divy= document.getElementById('y-buttons');
            var newoptdivy = document.createElement('div');
            newoptdivy.class = 'option '+col;
            newoptdivy.style.display = 'inline-block';
            divy.appendChild(newoptdivy);
            var newoptinputy = document.createElement('input');
            newoptinputy.type = 'button';
            newoptinputy.name = col;
            newoptinputy.value = getLabel(col);
            newoptinputy.setAttribute("id","buttony-"+col);
            if (col==this.yvar){newoptinputy.classList.add("down")};
            newoptinputy.addEventListener('click',function(){
                oldYvar = gw.yvar;
                document.getElementById("buttony-"+oldYvar).classList.remove("down")
                this.classList.add("down");
                gw.updateYaxis(this.name);
            });
            newoptdivy.appendChild(newoptinputy);
        }
    }
}
GWCatalogue.prototype.showOptions = function(){
    // fade in semi-transparent background layer (greys out image)
    this.optionsbg.transition()
      .duration(500)
      .style({"opacity":0.5});
    this.optionsbg.style("height","100%");
    //fade in infopanel
    this.optionsouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    // this.infopanel.html(this.iptext(d));
    this.optionsouter.style("left", "25%").style("top", "25%")
       .style("width","50%").style("height","auto");

}
GWCatalogue.prototype.hideOptions = function(d) {
    // fade out infopanel
    this.optionsouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.optionsouter.style("top","200%");
    // fade out semi-transparent background
    this.optionsbg.transition()
      .duration(500)
      .style("opacity",0);
    this.optionsbg.style("height",0);
    // d3.selectAll(".info").attr("opacity",0);
}
GWCatalogue.prototype.addButtons = function(){
    console.log("add buttons");
    // Add buttons to top of page
    var gw=this;
    for (col in columns){
        if (columns[col].avail){
            var divx = document.getElementById('xoptions');
            var newoptdivx = document.createElement('div');
            newoptdivx.classNm = 'option '+col;
            newoptdivx.style.display = 'inline-block';
            divx.appendChild(newoptdivx);
            var newoptinputx = document.createElement('input');
            newoptinputx.type = 'button';
            newoptinputx.name = col;
            newoptinputx.value = getLabel(col);
            newoptinputx.setAttribute("id","buttonx-"+col);
            if (col==this.xvar){newoptinputx.classList.add("down")};
            newoptinputx.addEventListener('click',function(){
                oldXvar = gw.xvar;
                document.getElementById("buttonx-"+oldXvar).classList.remove("down")
                this.classList.add("down");
                gw.updateXaxis(this.name);
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
            newoptinputy.setAttribute("id","buttony-"+col);
            if (col==this.yvar){newoptinputy.classList.add("down")};
            newoptinputy.addEventListener('click',function(){
                oldYvar = gw.yvar;
                document.getElementById("buttony-"+oldYvar).classList.remove("down")
                this.classList.add("down");
                gw.updateYaxis(this.name);
            });
            newoptdivy.appendChild(newoptinputy);
        }
    }
}
//
GWCatalogue.prototype.showTooltip = function(e,tttxt){
    ttSk = document.getElementById("tooltipSk")
    ttSk.style.transitionDuration = "200ms";
    ttSk.style.opacity = 0.9;
    ttSk.style.left = e.pageX + 10 ;
    ttSk.style.top = e.pageY - 10 ;
    ttSk.style.width = "auto";
    ttSk.style.height = "auto";
    ttSk.innerHTML = this.ttlabels[tttxt];
}
GWCatalogue.prototype.hideTooltip = function(){
    ttSk = document.getElementById("tooltipSk");
    ttSk.style.transitionDuration = "500ms";
    ttSk.style.opacity = 0.;
}
GWCatalogue.prototype.makePlot = function(){
    this.drawGraph()
    this.drawSketch()
    // this.addButtons()
    this.addOptions()
}
GWCatalogue.prototype.replot = function(){
    var gw=this;
    // console.log(gw.sketchName);
    d3.select("svg#svgSketch").remove()
    d3.select("div#svg-container").remove()
    d3.selectAll("div.labcont").remove()
    // d3.selectAll("div.massicon").remove()
    this.redraw=true;
    this.setScales();
    this.drawGraph();
    this.drawSketch();
    // this.addOptions();
    this.data.forEach(function(d){
        // gwcat.formatData;
        if (d.name==gw.sketchName){
            // console.log('resize:',d.name,gw.sketchName);
            gw.updateSketch(d);
        }
    });
    gwcat.redraw=false;
}
// define fly-in & fly-out

//labels to add and keep updated
var gwcat = new GWCatalogue
gwcat.init();
gwcat.drawGraphInit();

window.addEventListener("resize",function(){
    gwcat.replot();

});