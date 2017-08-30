// Define Localisation class
function Localisation(inp){
    // set initial axes
    // this.init()
    var loc=this;
    this.getUrlVars();
    this.holderid = (inp)&&(inp.holderid) ? inp.holderid : "plotloc-cont";
    if(this.debug){console.log('creating plot in #'+this.holderid)}
    if ((inp)&&(inp.clearhtml)){
        if(this.debug){console.log('clearing current html')}
        d3.select('#'+this.holderid).html()
    }

    //set default language from browser
    this.langIn = (navigator) ? (navigator.userLanguage||navigator.systemLanguage||navigator.language||browser.language) : "";
    //set lang from query (if present)
    if((inp)&&(inp.lang)&&(typeof inp.lang=="string")) this.langIn = inp.lang;
    // set language from urlVars (if present)
    this.langIn = ((this.urlVars.lang)&&(typeof this.urlVars.lang=="string")) ? this.urlVars.lang : this.langIn
    this.init();
    if(this.debug){console.log('initialised');}
    this.drawSkyInit();
    if(this.debug){console.log('plotted');}
    window.addEventListener("resize",function(){
        loc.replot();
    });
    return this;
}
Localisation.prototype.init = function(){
    // created HTML of not included
    if (d3.select("#hdr").empty()){
        if(this.debug){console.log('adding hdr')}
        d3.select("#"+this.holderid).insert("div",":first-child")
            .attr("id","hdr")
            .html('<h1 id="page-title"></h1>')
    }
    if (d3.select("#skycontainer").empty()){
        if(this.debug){console.log('adding graphcontainer')}
        d3.select("#"+this.holderid).insert("div","#hdr + *")
            .attr("id","skycontainer")
    }
    if (d3.select("#infoouter").empty()){
        if(this.debug){console.log('adding infoouter')}
        d3.select("#"+this.holderid).insert("div","#skycontainer + *")
            .attr("id","infoouter")
            .html('<div id="effcontainer"></div><div id="wfcontainer"></div>')
    }
    if (d3.select("#help-outer").empty()){
        if(this.debug){console.log('adding help-outer')}
        d3.select('#'+this.holderid).insert("div","#options-outer + *")
            .attr("id","help-outer").attr("class","panel-outer")
        d3.select("#help-outer").append("div")
            .attr("id","help-title").attr("class","panel-title")
        d3.select("#help-outer").append("div")
            .attr("id","help-block-icons").attr("class","panel-block")
        d3.select("#help-block-icons").append("div")
            .attr("id","help-help-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/help.svg"><div class="panel-cont-text" id="help-help-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-info-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/info.svg"><div class="panel-cont-text" id="help-info-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-lang-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/lang.svg"><div class="panel-cont-text" id="help-lang-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-share-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/share.svg"><div class="panel-cont-text" id="help-share-text"></div>')
        d3.select("#help-outer").append("div")
            .attr("id","help-close").attr("class","panel-close")
        d3.select("#help-outer").append("div")
            .attr("id","help-block-text").attr("class","panel-text")
            .html('<div class="panel-text" id="help-text"></div>')
    }
    if (d3.select('#lang-outer').empty()){
        if(this.debug){console.log('adding lang-outer')}
        d3.select('#'+this.holderid).insert("div","#help-outer + *")
            .attr("id","lang-outer").attr("class","panel-outer")
        d3.select("#lang-outer").append("div")
            .attr("id","lang-title").attr("class","panel-title")
        d3.select("#lang-outer").append("div")
            .attr("id","lang-block-icons").attr("class","panel-block panel-block-full")
        // d3.select("#lang-outer").append("div")
        //     .attr("id","lang-block-credit").attr("class","panel-block panel-block-full")
        d3.select("#lang-outer").append("div")
            .attr("id","lang-close").attr("class","panel-close")
    }

    //initialyse common values
    this.flySp=1000;
    this.defaults = {
        lang:"en",
        ra:0,
        dec:0,
        posang:0,
    }
    this.ra = (this.urlVars.ra) ? this.urlVars.ra : this.defaults.ra;
    this.dec = (this.urlVars.dec) ? this.urlVars.dec : this.defaults.dec;
    this.posang = (this.urlVars.posang) ? this.urlVars.posang : this.defaults.posang;
    this.setStyles();
    this.setScales();
    this.langs = {
        // "de":{code:"de",name:"Deutsch"},
        "en":{code:"en",name:"English"},
        // "es":{code:"es",name:"Español"},
        // "fr":{code:"fr",name:"Français"},
        // "pl":{code:"pl",name:"Polski"},
        // "en-GB":{code:"en-GB",name:"English"},
        // "de2":{code:"de",name:"Deutsch (de)"},
        // "en2":{code:"en",name:"English (en)"},
        // "fr2":{code:"fr",name:"Francais (fr)"},
    }
}
Localisation.prototype.getUrlVars = function(){
    // Get URL and query variables
    var vars = {},hash;
    var url = window.location.href;
    if (window.location.href.indexOf('?')!=-1){
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        url = window.location.href.slice(0,window.location.href.indexOf('?'));
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            // vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
    }
    // console.log("input:",vars);
    this.urlVars = vars;
    this.url = url;
    this.debug = (this.urlVars.debug) ? true : false;
    if(this.debug){console.log('debug',this.debug)}
}
Localisation.prototype.makeUrl = function(newKeys,full){
    // construct new URL with replacement queries if necessary
    newUrlVars = this.urlVars;
    allKeys = {"ra":[this.ra,this.defaults.ra],
        "y":[this.dec,this.defaults.dec],
        "lang":[this.lang,this.defaults.lang],
        "err":[this.showerrors,this.defaults.showerrors],
    }
    for (key in allKeys){
        if (this.debug){console.log(key,allKeys[key]);}
        if ((allKeys[key][0]!=allKeys[key][1])){
            newUrlVars[key]=allKeys[key][0]
        }else{
            delete newUrlVars[(key)]
        }
    }
    if(this.debug){console.log('new urlvars',newUrlVars);}
    for (key in newKeys){
        if (!newKeys[key]){
            delete newUrlVars[key];
        }else{
            newUrlVars[key]=newKeys[key];
        }
    }
    newUrl = this.url+'?';
    for (key in newUrlVars){
        newUrl=newUrl + key+'='+newUrlVars[key]+'&';
    }
    newUrl = newUrl.slice(0,newUrl.length-1);
    return newUrl;
}
Localisation.prototype.updateUrl = function(vars){
    window.history.pushState({},null,this.makeUrl((vars) ? vars : {}));
}
Localisation.prototype.getPanel = function(){
    if(this.helpOn){return "help";}
    else if(this.langOn){return "lang";}
    else{return "info"}
}
Localisation.prototype.setPanel = function(panel){
    if (panel=="options"){this.showOptions();}
    else if(panel=="help"){this.showHelp();}
    else if(panel=="lang"){this.showLang();}
}
Localisation.prototype.tl = function(textIn,plaintext){
    // translate text given dict
    // plaintext = plaintext || false;
    // search textIn for %...%\
    re=/\%(.+?)\%/g;
    matches=[]
    var match=re.exec(textIn);
    while (match!=null){
        matches.push(match[1])
        match=re.exec(textIn)
    }
    textOut=(textIn) ? textIn : "";
    if (matches){
        nmatch=matches.length
        for (n in matches){
            mx0='%'+matches[n]+'%';
            mx1=matches[n];
            if (this.langdict[mx1]){
                textOut=textOut.replace(mx0,this.langdict[mx1]);
            }else{
                textOut=textOut;
                if(this.debug){console.log('ERROR: "'+mx1+'" not found in dictionary');}
                if(this.debug){console.log(textOut,typeof(textOut),typeof(textIn));}
            }
        }
    }
    if (!plaintext){
        // replace superscripts
        reSup=/\^(-?[0-9]*)(?=[\s/]|$)/g
        textOut=textOut.replace(reSup,"<sup>$1</sup> ");
        // replace Msun
        textOut=textOut.replace(this.tl('%data.mass.unit.msun%',true),'M<sub>☉</sub>')
    }
    // else{
    //     textOut=textOut.replace(this.tl('%data.mass.unit.msun%',true),'M☉')
    // }
    return(textOut);
}
Localisation.prototype.scaleWindow = function(){
    //set window scales (protrait/landscape etc.)
    this.winFullWidth=document.getElementById(this.holderid).offsetWidth;
    this.winFullHeight=document.getElementById(this.holderid).offsetHeight;
    this.winAspect = this.winFullWidth/this.winFullHeight;
    // console.log(this.winFullWidth,this.winFullHeight,this.winAspect);

    info=document.getElementById("infoouter");
    effcont=document.getElementById("effcontainer");
    wfcont=document.getElementById("wfcontainer");
    sky=document.getElementById("skycontainer");
    if (this.winAspect<1){
        // portrait
        // console.log('portrait');
        this.portrait=true;
        this.effFullWidth = 0.9*this.winFullWidth;
        this.effFullHeight = 0.5*this.effFullWidth;
        this.fullSkyWidth = 0.95*this.winFullWidth;
        this.fullSkyHeight =
            0.8*(this.winFullHeight-this.effFullHeight);
        info.style["margin-left"]="5%";
        this.effWidth = 0.45*this.effFullWidth;
        this.effhHeight = this.effFullHeight;
        if(this.debug){console.log('portrait:',this.effHeight,this.effFullHeight);}
        this.wfWidth = 0.5*this.effFullWidth;
        this.wfHeight = this.effFullHight;
    }else{
        // landscape window
        // console.log('landscape')
        this.portrait=false;
        this.effFullHeight = 0.85*this.winFullHeight;
        this.effFullWidth = 0.5*this.effFullHeight;
        this.fullSkyWidth =
            0.95*(this.winFullWidth-this.effFullWidth);
        this.fullSkyHeight = 0.9*this.winFullHeight;
        info.style["margin-left"]=0;
        this.effWidth = this.effFullWidth;
        this.effHeight = 0.5*this.effFullHeight;
        if(this.debug){console.log('landscape:',this.effHeight,this.effFullHeight);}
        this.effAspect = this.effFullWidth/this.effFullHeight;
        this.wfWidth = this.effFullWidth;
        this.wfHeight = 0.5*this.effFullHight;
    }
    info.style.width = this.effFullWidth;
    info.style.height = this.effhFullHeight;
    sky.style.width = this.fullSkyWidth;
    sky.style.height = this.fullSkyHeight;

    effcont.style.height = this.effHeight;
    effcont.style.width = this.effWidth;

    wfcont.style.height = this.wfHeight;
    wfcont.style.width = this.wfWidth;
    this.svgHeight = this.fullSkyHeight;
    this.svgWidth = this.fullSkyWidth;


}
Localisation.prototype.setScales = function(){
    //define scales
    this.scaleWindow();
    var loc=this;
    //set scale factor(s)
    this.xsc = Math.min(1.0,document.getElementById(this.holderid).offsetWidth/1400.)
    this.ysc = Math.min(1.0,document.getElementById(this.holderid).offsetHeight/900.)
    this.scl = Math.min(this.xsc,this.ysc)
    //eff scale
    if (this.winAspect<1){
        // portrait
        this.sksc=Math.min(1.0,this.xsc*2.)
        d3.selectAll(".panel-title")
            .attr("class","panel-title portrait");
        d3.selectAll(".panel-text")
            .attr("class","panel-text portrait");
        d3.selectAll(".panel-cont-text")
            .attr("class","panel-cont-text portrait");
    }else{
        // landscape
        this.sksc=Math.min(1.0,this.ysc)
        d3.selectAll(".panel-title")
            .attr("class","panel-title landscape");
        d3.selectAll(".panel-text")
            .attr("class","panel-text landscape");
        d3.selectAll(".panel-cont-text")
            .attr("class","panel-cont-text landscape");
    }
    // this.sksc=this.scl

    //graph size & position
    this.margin = {top: 40*this.ysc, right: 20*this.xsc, bottom: 15*(1+this.ysc), left:45*(1+this.xsc)}
    this.skyWidth =
        this.fullSkyWidth - this.margin.left - this.margin.right;
    this.skyHeight =
        0.9*this.fullSkyHeight - this.margin.top - this.margin.bottom;
    this.xyAspect = this.skyWidth/this.skyHeight;

    // set axis scales
    this.errh = 0.01;
    this.errw = 0.01;//*xyAspect;
    this.raValue = function(d) {return d.ra;} // data -> value
    // value -> display
    this.raScale = d3.scale.linear().domain([180,-180])
        .range([0, this.skyWidth])
        // data -> display
    this.raMap = function(d) {return loc.raScale(loc.raValue(d));}

    // RA axis
    this.raAxis = d3.svg.axis()
            .scale(this.raScale)
            .orient("bottom")
            .innerTickSize(-this.skyHeight)
            .tickValues(d3.range(-180,180+30,30))
            .tickFormat(function(d){if (d<0){return -d+"E"}else if(d>0){return d+"W"}else{return d}});

    //data -> value
    this.decValue = function(d) {return d.dec;}
    // value -> display
    this.decScale = d3.scale.linear().domain([-90,90]).range([this.skyHeight,0])
    // data -> display
    this.decMap = function(d) { return loc.decScale(loc.decValue(d));}

    // Dec axis
    this.decAxis = d3.svg.axis()
            .scale(this.decScale)
            .orient("left")
            // .innerTickSize(-(this.relw[1]-this.relw[0])*this.graphWidth);
            .innerTickSize(-this.skyWidth)
            .tickValues(d3.range(-90,90+30,30))
            .tickFormat(function(d){if (d<0){return (-d)+"S"}else if(d>0){return d+"N"}else{return d}});

    ///////////////////////////////////////////////////////////////////////////
    // Set eff scales
    ///////////////////////////////////////////////////////////////////////////
    this.marginEff = {top: 0*this.scl, right: 0*this.scl, bottom: 0*this.scl, left: 0*this.scl}
    //-
        // document.getElementById("efftitle").offsetHeight -
        //  marginEff.top - marginEff.bottom;
    this.effWidth =
        document.getElementById("effcontainer").offsetWidth -
        this.marginEff.left - this.marginEff.right;
    this.effHeight =
        document.getElementById("effcontainer").offsetHeight -
        this.marginEff.top - this.marginEff.bottom;
    this.aspectEff = this.effHeight/this.effWidth
    // console.log('effcont',this.effHeight,this.effWidth);

    // set scaleing functions for eff
    this.scaleRadius = function(hEff,ref){
        return(0.2*this.effWidth*(mass/100.))}
    this.xScaleEff = function(hx){return(hx*this.effWidth)}
    this.xScaleEffAspect = function(x){
        return(x*this.effWidth*this.aspectEff)}
    this.yScaleEff = function(hy){return(hy*this.effHeight)}

}
Localisation.prototype.adjCss = function(){
    // adjust css of some elements
    // duplicates content of @media in css file
    if(this.debug){console.log('this.winFullWidth:',this.winFullWidth)}
    css={};
    if(this.winFullWidth < 1200){
        css[".panel-title.landscape"]={"font-size":"2.5em"},
        css[".panel-text.landscape"]={"font-size":"1.0em"},
        css[".panel-cont-text.landscape"]={"font-size":"1.0em"}
    }
    if (this.winFullWidth < 1000){
        css[".panel-title.landscape"]={"font-size":"2.0em"}
        css[".panel-text.landscape"]={"font-size":"1.0em"}
        css[".panel-cont-text.landscape"]={"font-size":"1.0em"}
        css[".panel-text.potrait"]={"font-size":"0.8em"},
        css[".panel-cont-text.potrait"]={"font-size":"0.8em"}
    }
    if (this.winFullWidth < 750){
        css[".panel-title.landscape"]={"font-size":"1.5em"}
        css[".panel-title.portrait"]={"font-size":"2.0em"}
        css[".panel-text.portrait"]={"font-size":"0.8em"}
        css[".panel-cont-text.portrait"]={"font-size":"0.8em"}
    }
    if (this.winFullWidth < 550){
        css[".panel-title.landscape"]={"font-size":"1.2em"}
        css[".panel-title.portrait"]={"font-size":"1.5em"}
    }
    if (this.winFullWidth < 350){
        css[".panel-title.landscape"]={"font-size":"1.0em"}
        css[".panel-title.portrait"]={"font-size":"1.2em"}
    }
    if(this.debug){console.log('new css:',css)}
    if (css){
        for (k in css){
            if(this.debug){console.log(k,d3.selectAll(k),css[k])}
                d3.selectAll(k).style(css[k])
        }
    }
}
Localisation.prototype.drawEff = function(){
    // Create eff panel
    // Add svg to eff container
    this.svgEff = d3.select("div#effcontainer").append("svg")
        .attr("preserveAspectRatio", "none")
        .attr("id","svgEff")
        // .attr("viewBox","0 0 "+this.effWidth+" " +this.effHeight)
        .attr("width", this.effWidth + this.marginEff.left + this.marginEff.right)
        .attr("height", (this.effHeight + this.marginEff.top + this.marginEff.bottom))
        .append("g")
        .attr("transform", "translate(" + this.marginEff.left + "," + this.marginEff.top + ")");

    if (this.redraw){
        // console.log('redrawing masses');
        this.addEffLines("L",true);
        this.addEffLines("H",true);
        this.addEffLines("V",true);
    }else{
        this.addEffLines("L",false);
        this.addEffLines("H",false);
        this.addEffLines("V",false);
    }

}
Localisation.prototype.addEffLines = function(det,redraw){
    // add ellipse for shadow
    loc=this;
    var redraw;
    detCols={"H":"#f00","L":"#0f0","V":"#00f"}
    svgEffGroup=this.svgEff.append("g")
        .attr("class","heff heff-"+det)
    svgEffGroup.append("line")
        .attr("class","heff heff-x-"+det)
        .attr("x1",0)
        .attr("y1",0)
        .attr("x2",0)
        .attr("y2",0)
        .attr("stroke",detCols[det]);
    svgEffGroup.append("line")
        .attr("class","heff heff-y-"+det)
        .attr("x1",0)
        .attr("y1",0)
        .attr("x2",0)
        .attr("y2",0)
        .attr("stroke",detCols[det]);
}
Localisation.prototype.addWaveform = function(lab){
    // add waveforms as html elements
    return
}
Localisation.prototype.fadeOutLines = function(det){
    // fly out mass (set by "bh")
    this.svgEff.select('g.heff-'+det)
        .transition().duration(this.fadeSp)
        .attr("opacity",0);
};
Localisation.prototype.fadeInLines = function(d,det,resize){
    // fly in mass
    // bh = BH to fly in
    // resize= type of resizing animation
    if (resize=="smooth"){
        // rotate lines to new position
        this.svgEff.select('g.heff-'+det)
            .transition().duration(this.fadeSp)
            .attr("transform","rotate("+d.angeff[det]+")")
        this.svgEff.select('g.heff-x-'+det)
            .transition().duration(this.fadeSp)
            .attr("x1",this.xScaleEff(-1*d.heff[det]))
            .attr("x2",this.xScaleEff(1*d.heff[det]));
        this.svgEff.select('g.heff-y-'+det)
            .transition().duration(this.fadeSp)
            .attr("y1",this.yScaleEff(-1*d.heff[det]))
            .attr("y2",this.yScaleEff(1*d.heff[det]))
    }else if(resize=="fly"){
        // resize & fly in
        this.svgEff.select('g.heff-'+det)
            .transition().duration(this.fadeSp).ease("bounce")
            .attr("transform","rotate("+d.angeff[det]+")")
        this.svgEff.select('g.heff-x-'+det)
            .transition().duration(this.fadeSp)
            .attr("x1",this.xScaleEff(-1*d.heff[det]))
            .attr("x2",this.xScaleEff(1*d.heff[det]))
        this.svgEff.select('g.heff-y-'+det)
            .transition().duration(this.fadeSp)
            .attr("y1",this.yScaleEff(-1*d.heff[det]))
            .attr("y2",this.yScaleEff(1*d.heff[det]))
    }else if(resize=="snap"){
        // snap resize (when redrawing eff)
        this.svgEff.select('g.heff-'+det)
            .attr("transform","rotate("+d.angeff[det]+")")
        this.svgEff.select('g.heff-x-'+det)
            .attr("x1",this.xScaleEff(-1*d.heff[det]))
            .attr("x2",this.xScaleEff(1*d.heff[det]))
        this.svgEff.select('g.heff-y-'+det)
            .attr("y1",this.yScaleEff(-1*d.heff[det]))
            .attr("y2",this.yScaleEff(1*d.heff[det]))
    };

};
Localisation.prototype.updateEff = function(d){
    // update eff based on data clicks or resize
    if (this.redraw){
        // resize eff
        this.fadeInLines(d,"H","snap");
        this.fadeInLines(d,"L","snap");
        this.fadeInLines(d,"V","snap");

    }else{
        // clicked on un-selelected datapoint
        this.fadeInLines(d,"H","smooth");
        this.fadeInLines(d,"L","smooth");
        this.fadeInLines(d,"V","smooth");
    }
}

// ****************************************************************************
// ****************************************************************************
// ****************************************************************************

Localisation.prototype.setStyles = function(){
    // setup colours and linestyles
    var loc=this
    this.cValue = function(d) {return d.id;};
    this.styleDomains = ['H','L','V'];
    this.color = d3.scale.ordinal().range(["#ff0000", "#009600","#0000ff"]).domain(this.styleDomains);
    this.getOpacity = function(d) {return 1}


}
Localisation.prototype.tttext = function(d){
    // graph tooltip text
    if (this.debug){console.log(d["name"],this.columns[this.xvar].name,d[this.xvar].strnoerr,this.columns[this.yvar].name,d[this.yvar].strnoerr)}
    return "<span class='ttname'>"+d["name"]+"</span>"+
    "<span class='ttpri'>"+this.tl(this.columns[this.xvar].name)+
        ": "+this.tl(this.oneline(d[this.xvar].strnoerr))+"</span>"+
    "<span class='ttsec'>"+this.tl(this.columns[this.yvar].name) +
        ": "+this.tl(this.oneline(d[this.yvar].strnoerr))+"</span>";
}
Localisation.prototype.tttextXray = function(d){
    // graph tooltip text
    if (this.debug){console.log(d["name"],this.columns[this.xvar].name,d[this.xvar].strnoerr,this.columns[this.yvar].name,d[this.yvar].strnoerr)}
    return "<span class='ttname'>"+d["name"]+"</span>"+
    "<span class='ttpri'>"+this.tl(this.oneline(d[this.xvar].strnoerr))+"</span>"+
    "<span class='ttsec'>"+this.tl(this.oneline(d[this.yvar].strnoerr))+"</span>";
}
Localisation.prototype.orderData = function(order='GPS'){
    this.data=this.data.sort(function(a,b){
        return b[order].best - a[order].best
    });
    var dataOrder=[];
    this.data.forEach(function(d){dataOrder.push(d.name);});
    this.dataOrder=dataOrder;
}
Localisation.prototype.makeSky = function(){
    // create graph
    // console.log('makeSky');
    this.skycont=d3.select("div#skycontainer")
    this.svgcont = this.skycont.append("div")
        .attr("id","svg-container")
        .attr("width",this.svgWidth)
        .attr("height",this.svgHeight)
        .classed("svg-container",true);
    this.svg = d3.select(".svg-container").append("svg")
        // .attr("preserveAspectRatio", "xMidYMid meet")
        // .attr("viewBox","0 0 "+this.graphWidth+" " +1.2*this.graphHeight)
        .attr("class","graph")
        .attr("width",this.svgWidth)
        .attr("height",this.svgHeight)
        // .classed("svg-content-responsive",true);
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom);

    // this.svg.append("g")
    //     .attr("transform", "translate(" + this.margin.left + "," +
    //         this.margin.top + ")")

    // add the tooltip area to the webpage
    if (!this.redraw){
        this.tooltip = d3.select("#"+this.holderid).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
}

Localisation.prototype.drawSkyInit = function(){
    // initialise graph drawing from data
    var loc = this;
    loc.loaded=0;
    loc.toLoad=3;
    loc.data=[];
    loc.optionsOn=false;
    loc.helpOn=false;
    loc.lengOn=false;

    loc.fileInDetDefault="json/detectors.json";
    loc.fileInDet = (loc.urlVars.detFile) ? loc.urlVars.detFile : loc.fileInDetDefault

    // if (loc.urlVars.lang){
    //     lang=loc.urlVars.lang;
    // }else{lang=loc.defaults.lang}

    loc.loadLangDefault()
    loc.loadLang(this.langIn)
    // loc.langdict_default = loc.loadLang(loc.langDefault,true);

    // read in Detector data
    d3.json(loc.fileInDet, function(error, dataIn){
        if (error){alert("Fatal error loading input file: '"+loc.fileInDet+"'. Sorry!")}
        loc.dataDet = [];
        for (d in dataIn){
            loc.dataDet.push(dataIn[d])
        }
        loc.loaded++;
        if (loc.debug){console.log('loaded: '+loc.fileInDet)}
        //call next functions
        if (loc.loaded==loc.toLoad){
            loc.whenLoaded();
        }else{
            if (loc.debug){console.log('not ready yet')}
        }
    })
}
Localisation.prototype.whenLoaded = function(){
    var loc=this;
    // order Data
    loc.makePlot();
    if(loc.debug){console.log('plotted');}
    // select a default event
}
Localisation.prototype.loadLang = function(lang){
    var loc=this;
    if (this.debug){console.log('new language:',lang,'; stored language',loc.lang)}
    var reload = (!loc.lang)||(loc.lang=="") ? false:true;
    loc.lang=lang;
    loc.langshort = (loc.lang.indexOf('-') > 0 ? loc.lang.substring(0,loc.lang.indexOf('-')) : loc.lang.substring(0,2));
    loc.fileInLang="lang/lang_"+lang+".json";
    d3.json(loc.fileInLang, function(error, dataIn) {
        if (error){
            if (loc.lang==loc.defaults.lang){
                console.log(error);
                alert("Fatal error loading input file: '"+loc.fileInLang+"'. Sorry!")
            }else if (loc.langshort!=loc.lang){
                if(loc.debug){console.log('Error loading language '+loc.lang+'. Displaying '+loc.langshort+' instead');}
                if (loc.urlVars.lang){
                    alert('Error loading language '+loc.lang+'. Displaying '+loc.langshort+' instead');
                    window.history.pushState({},null,loc.makeUrl({'lang':loc.defaults.lang}));
                }
                window.location.replace(loc.makeUrl({'lang':loc.langshort}));
            }else{
                if(loc.debug){console.log('Error loading language '+loc.lang+'. Reverting to '+loc.defaults.lang+' as default');}
                if (loc.urlVars.lang){
                    alert('Error loading language '+loc.lang+'. Reverting to '+loc.defaults.lang+' as default');
                }
                // console.log('error loading',loc.lang,error);
                // window.history.pushState({},null,loc.makeUrl({'lang':loc.defaults.lang}));
                // loc.loaded-=1;
                // loc.lang=null;
                // loc.loadLang(loc.defaults.lang);
                window.location.replace(loc.makeUrl({'lang':loc.defaults.lang}));
            }
        }
        if(loc.debug){console.log('loaded:',loc.fileInLang);}
        for (ld in dataIn){
            if ((ld!="metadata")&(typeof dataIn[ld]!="string")){
                dataIn[ld]=dataIn[ld].text;
            }
        }
        loc.langdict=dataIn;
        if (reload){
            if (loc.debug){console.log('reloaded language',loc.lang);}
            // loc.setLang();
            loc.data.forEach(function(d){loc.formatData(d,loc.columns)});
            loc.replot();
            d3.select(".lang-cont.current").classed("current",false);
            d3.select("#lang_"+loc.lang+"_cont").classed("current",true);
        }else{
            if (loc.debug){console.log('loaded language',loc.lang,loc.langdict);}
            loc.loaded++;
            // loc.setLang();
            if (loc.loaded==loc.toLoad){
                loc.whenLoaded();
                // loc.setColumns(loc.datadict);
                // loc.data.forEach(function(d){loc.formatData(d,loc.columns)});
                // loc.makePlot();
                // if(loc.debug){console.log('plotted');}
            }
        }
    });
}
Localisation.prototype.loadLangDefault = function(){
    var loc=this;
    var reload = (loc.lang) ? true:false;
    loc.fileInLangDefault="lang/lang_"+loc.defaults.lang+".json";
    d3.json(loc.fileInLangDefault, function(error, dataIn) {
        if (error){
            console.log(error);
            alert("Fatal error loading input file: '"+loc.fileInLang+"'. Sorry!")
        }
        if(loc.debug){console.log('loaded:',loc.fileInLangDefault);}
        for (ld in dataIn){
            if ((ld!="metadata")&(typeof dataIn[ld]!="string")){
                dataIn[ld]=dataIn[ld].text;
            }
        }
        loc.langdictDefault=dataIn;
        loc.loaded++;
        if (loc.loaded==loc.toLoad){
            loc.whenLoaded();
            // loc.setColumns(loc.datadict);
            // loc.data.forEach(function(d){loc.formatData(d,loc.columns)});
            // loc.makePlot();
            // if(loc.debug){console.log('plotted');}
        }
    });
}
Localisation.prototype.setLang = function(){
    // should be run before graph is made
    if (this.debug){console.log('setting',this.lang);}
    for (k in this.langdictDefault){
        if (!this.langdict.hasOwnProperty(k)){
            if (this.debug){console.log('TRANSLATION WARNING: using default for '+k+' ('+this.lang+')');}
            this.langdict[k]=this.langdictDefault[k];
        }
    }
    this.legenddescs = {H:this.tl('%text.plotloc.legend.Hanford%'),
        L:this.tl('%text.plotloc.legend.Livingston%'),
        V:this.tl('%text.plotlov.legend.Virgo%')}
    // d3.select('#lang-title')
    //     .html(this.tl('%text.plotloc.lang.title%'))
    // d3.select('#lang-text')
    //     .html(this.tl('%text.plotloc.lang.text%'))
    d3.select('#page-title')
        .html(this.tl('%text.plotloc.page.title%'))
    if (this.langdict['meta.translator'] && this.langdict['meta.translator']!=''){
        d3.select('#lang-credit')
            .html(this.tl('%text.gen.langcredit% (%meta.name%): %meta.translator%'));
    }else{
        d3.select('#lang-credit')
            .html('');
    }
    d3.select('#copy-button').attr('title',this.tl('%text.gen.share.copylink%'))
    d3.select('#facebook-share-button').attr('title',this.tl('%text.gen.share.fb%'))
    d3.select('#twitter-share-button').attr('title',this.tl('%text.gen.share.twitter%'))
}
Localisation.prototype.drawSky = function(){
    // draw graph
    var loc = this;
    // loc.setSvgScales();
    loc.makeSky();
    data = loc.dataDet;
    // x-axis
    loc.svg.append("g")
        .attr("class", "ra-axis axis")
        .attr("transform", "translate("+loc.margin.left+"," +
            (loc.margin.top + loc.skyHeight) + ")");
    loc.svg.select(".ra-axis.axis").call(loc.raAxis)
    loc.svg.select(".ra-axis.axis").append("text")
        .attr("class", "ra-axis axis-label")
        // .attr("x", (loc.relw[0]+loc.relw[1])*loc.graphWidth/2)
        .attr("x", loc.skyWidth/2)
        .attr("y", 1.2*(1+loc.scl)+"em")
        .style("text-anchor", "middle")
        .style("font-size",(1+loc.scl)+"em")
        .text(loc.tl('%text.plotloc.rightasc%'));

    //scale tick font-size
    d3.selectAll(".x-axis > .tick > text")
        .style("font-size",(0.8*(1+loc.scl))+"em");

    // y-axis
    loc.svg.append("g")
        .attr("class", "dec-axis axis")
        .attr("transform", "translate("+loc.margin.left+","+
            loc.margin.top+")");
    loc.svg.select(".dec-axis.axis").call(loc.decAxis)
    loc.svg.select(".dec-axis.axis").append("text")
        .attr("class", "dec-axis axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x",-loc.skyHeight/2)
        .attr("dy", (-30*(1+loc.scl))+"px")
        .style("text-anchor", "middle")
        .style("font-size",(1+loc.scl)+"em")
        .text(loc.tl('%text.plotloc.declination%'));

    d3.selectAll('.tick > line')
            .style('stroke','#ccc')
            .style('opacity',1)

    // draw x-ray dots
    detGroup = loc.svg.append("g").attr("class","g-dets")
    loc.detMarkers=detGroup.selectAll(".detline")
        .data(loc.dataDet)
    .enter().append("g")
        .attr("class", "detmarker")
        .attr("id", function(d){return "detmarker-"+d.id;})
        .attr("transform", function(d){return "translate("+(loc.margin.left+loc.raScale(d.lon))+","+
            (loc.margin.top+loc.decScale(d.lat))+") rotate("+d.ang+")";})
        // .attr("transform", "translate("+loc.margin.left+","+
            // loc.margin.top+")")


            // .on("mouseover", function(d) {
        //     loc.tooltip.transition()
        //        .duration(200)
        //        .style("opacity", .9);
        //     loc.tooltip.html(loc.tttextDet(d))
        //        .style("left", (d3.event.pageX + 10) + "px")
        //        .style("top", (d3.event.pageY-10) + "px")
        //        .style("width","auto")
        //        .style("height","auto");
        // })
        // .on("mouseout", function(d) {
        //     loc.tooltip.transition()
        //        .duration(500)
        //        .style("opacity", 0);
        // })
    loc.detMarkers.append("line")
        .attr("class","detline detline-x")
        .attr("id", function(d){return "detline detline-x-"+d.id;})
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", -10)
        .attr("y2", 0)
        .attr("cursor","default")
        .style("opacity",1)
        .style("stroke", function(d){return loc.color(d.id)})
        .style("stroke-width",Math.min(5,2./loc.sksc))
    loc.detMarkers.append("line")
        .attr("class","detline detline-y")
        .attr("id",function(d){return "detline detline-y-"+d.id;})
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -10)
        .attr("cursor","default")
        .attr("opacity",1)
        .style("stroke", function(d){return loc.color(d.id)})
        .style("stroke-width",Math.min(5,2./loc.sksc))

    // add source circle
    loc.svg.append("g")
        .attr("class","g-source")
        .attr("transform", "translate("+loc.margin.left+","+
            loc.margin.top+")")
        .style("fill","white")
        .style("fill-opacity",0)
        .style("stroke","red")
        .style("stroke-width",3)
    .append("circle")
        .attr("id","source")
        .attr("class","dot-src")
        .attr("opacity",1)
        .attr("cx",loc.raScale(0))
        .attr("cy",loc.decScale(0))
        .attr("r",5)

    // draw legend
    loc.legend = loc.svg.selectAll(".legend")
      .data(loc.color.domain())
    .enter().append("g")
      .attr("class", function(d,i){return "legend "+d;})
      .attr("transform", function(d, i) { return "translate(0," +
        (i * 24) + ")"; });

    // draw legend colored circles
    loc.legend.append("line")
        .attr("x1", loc.margin.left+12)
        .attr("y1", loc.margin.top+24)
        .attr("x2", loc.margin.left+24)
        .attr("y2", loc.margin.top+24)
        .style("stroke-width",Math.min(5,2./loc.sksc))
        .style("stroke",function(d){return loc.color(d);})
        .attr("opacity",1);
    loc.legend.append("line")
        .attr("x1", loc.margin.left+12)
        .attr("y1", loc.margin.top+24)
        .attr("x2", loc.margin.left+12)
        .attr("y2", loc.margin.top+12)
        .style("stroke-width",Math.min(5,2./loc.sksc))
        .style("stroke",function(d){return loc.color(d);})
        .attr("opacity",1);

    // draw legend text
    loc.legend.append("text")
      .attr("x", loc.margin.left + 36)
      .attr("y", loc.margin.top + 21)
      .attr("dy", ".35em")
      .attr("font-size","1.2em")
      .style("text-anchor", "start")
      .text(function(d) { if (loc.legenddescs[d]){return loc.legenddescs[d];}else{return d}})

    // add info icon
    infoClass = ((!this.optionsOn)&(!this.helpOn)&(!this.langOn)) ? "graph-icon" : "graph-icon hidden";
    this.skycont.append("div")
        .attr("id","info-icon")
        .attr("class",infoClass)
        .style({"right":loc.margin.right,"top":0,"width":loc.margin.top,"height":loc.margin.top})
        .on("mouseover", function(d) {
              loc.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              loc.tooltip.html(loc.tl('%tooltip.plotloc.showinfo%'))
                 .style("left", (d3.event.pageX + 10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .style("width","auto")
                 .style("height","auto");
        })
        .on("mouseout", function(d) {
            loc.tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
          //   document.getElementById("effcontainer").style.opacity=0.;
        })
    .append("img")
        .attr("src","img/info.svg")
        .on("click",function(){loc.hideOptions();loc.hideHelp();loc.hideLang();});

    //add help icon
    helpClass = (this.helpOn) ? "graph-icon" : "graph-icon hidden";
    this.helpouter = d3.select('#help-outer')
    this.skycont.append("div")
        .attr("id","help-icon")
        .attr("class",helpClass)
        .style({"right":loc.margin.right+2*(loc.margin.top+10),"top":0,"width":40*loc.ysc,"height":40*loc.ysc})
        .on("mouseover", function(d) {
              loc.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              loc.tooltip.html(loc.tl('%tooltip.plotloc.showhelp%'))
                 .style("left", (d3.event.pageX + 10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .style("width","auto")
                 .style("height","auto");
        })
        .on("mouseout", function(d) {
            loc.tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
          //   document.getElementById("effcontainer").style.opacity=0.;
        }).append("img")
        .attr("src","img/help.svg")
        .on("click",function(){loc.showHelp();});
    this.helpouter
        .style("top","200%");
    this.helpouter.select("#help-close")
        .on("click",function(){loc.hideHelp();});

    // add language button
    langClass = (this.langOn) ? "graph-icon" : "graph-icon hidden";
    this.langouter = d3.select('#lang-outer')
    this.skycont.append("div")
        .attr("id","lang-icon")
        .attr("class",langClass)
        .style({"right":loc.margin.right+3*(loc.margin.top+10),"top":0,"width":40*loc.ysc,"height":40*loc.ysc})
        .on("mouseover", function(d) {
              loc.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              loc.tooltip.html(loc.tl('%tooltip.plotloc.showlang%'))
                 .style("left", (d3.event.pageX + 10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .style("width","auto")
                 .style("height","auto");
        })
        .on("mouseout", function(d) {
            loc.tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
          //   document.getElementById("effcontainer").style.opacity=0.;
        }).append("img")
        .attr("src","img/lang.svg")
        .on("click",function(){console.log('showing lang panel');loc.showLang();});
    // this.langbg.on("click",function(){loc.hideLang();});
    this.langouter
        .style("top","200%");
    this.langouter.select("#lang-close")
        .on("click",function(){loc.hideLang();});

}

Localisation.prototype.moveHighlight = function(ra,dec){
    // move highlight circle
    var loc=this;
    loc.svg.select("#source")
        .transition().duration(500)
        .attr("cx",loc.raScale(ra)).attr("cy",loc.decScale(dec))
        .style("opacity",1);
}
Localisation.prototype.addHelp = function(){
    // add help to panel
    d3.select("#help-title")
        .html(this.tl("%text.plotloc.help.title%"))
    d3.select("#help-text")
        .html(this.tl("%text.plotloc.help.text%%text.plotloc.help.about%%text.plotloc.help.tech%"));
    // d3.select("#help-tech")
    //     .html(this.tl("%text.plotloc.help.about%%text.plotloc.help.tech%"));
    d3.select("#help-help-text")
        .html(this.tl("%text.plotloc.help.help%"));
    d3.select("#help-info-text")
        .html(this.tl("%text.plotloc.help.info%"));
    d3.select("#help-lang-text")
        .html(this.tl("%text.plotloc.help.lang%"));
    d3.select("#help-share-text")
        .html(this.tl("%text.plotloc.help.share%"));
    if (this.portrait){
        d3.select('.help-title')
            .style("font-size",(5.0*this.xsc)+"em")
        d3.selectAll('.help-cont-text')
            .style("font-size",(2.0*this.xsc)+"em")
        d3.selectAll('.help-text')
            .style("font-size",(2.0*this.xsc)+"em")
    }else{
        d3.select('.help-title')
            .style("font-size",(2.5*this.ysc)+"em")
        d3.selectAll('.help-cont-text')
            .style("font-size",(1.2*this.ysc)+"em")
        d3.selectAll('.help-text')
            .style("font-size",(1.2*this.ysc)+"em")
    }
}
Localisation.prototype.showHelp = function(){
    //show options
    if (this.optionsOn){this.hideOptions();}
    if (this.langOn){this.hideLang();}
    this.helpOn=true;
    // fade in semi-transparent background layer (greys out image)
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style({"opacity":0.5});
    // this.helpbg.style("height","100%");
    //fade in infopanel
    this.helpouter = d3.select('#help-outer')
    this.helpouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    // this.infopanel.html(this.iptext(d));
    this.helpouter.style("left", document.getElementById('infoouter').offsetLeft-1)
        .style("top", document.getElementById('infoouter').offsetTop-1)
        .style("width",document.getElementById('infoouter').offsetWidth-2)
        .style("height",document.getElementById('infoouter').offsetHeight-22);
    if (this.portrait){
        document.getElementById('help-block-text').classList.add('bottom')
        document.getElementById('help-block-icons').classList.add('bottom')
    }else{
        document.getElementById('help-block-text').classList.remove('bottom')
        document.getElementById('help-block-icons').classList.remove('bottom')
    }
    document.getElementById("help-icon").classList.remove("hidden");
    document.getElementById("info-icon").classList.add("hidden");
    this.updateUrl();
}
Localisation.prototype.hideHelp = function(d) {
    // hide options box
    this.helpOn=false;
    // fade out infopanel
    this.helpouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.helpouter.style("top","200%");
    // fade out semi-transparent background
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style("opacity",0);
    // this.helpbg.style("height",0);
    // d3.selectAll(".info").attr("opacity",0);
    document.getElementById("info-icon").classList.remove("hidden");
    document.getElementById("help-icon").classList.add("hidden");
    this.updateUrl();
}

Localisation.prototype.addLang = function(replot){
    // add help to panel
    var loc=this;

    d3.select("#lang-title")
        .html(this.tl("%text.plotloc.lang.title%"))
        d3.select("#lang-text")
            .html(this.tl("%text.plotloc.lang.text%"));
    if (this.portrait){
        d3.select('#lang-title')
            .style("font-size",(5.0*this.xsc)+"em")
    }else{
        d3.select('#lang-title')
            .style("font-size",(2.5*this.ysc)+"em")
    }
    if (replot){
        d3.selectAll('.lang-cont').remove()
    }
    for (lang in this.langs){
        langdiv = document.createElement('div');
        langdiv.className = 'panel-cont lang-cont';
        if (lang==loc.lang){
            langdiv.classList.add('current')
        }
        langdiv.style.height = loc.langcontHeight;
        langdiv.setAttribute("id",'lang_'+lang+'_cont');
        langicondiv = document.createElement('div');
        langicondiv.className='panel-cont-icon'
        langicondiv.setAttribute("id",'lang_'+lang+'_icon');
        langicondiv.innerHTML =lang;
        langicondiv.addEventListener('click',function(){
            newlang = this.id.split('_')[1];
            oldlang = loc.lang;
            if (newlang!=oldlang){
                window.history.pushState({},null,loc.makeUrl({'lang':newlang}));
                loc.loadLang(newlang);
            }

        });
        langdiv.appendChild(langicondiv);
        // langdiv.onmouseover = function(e){
        //     loc.showTooltip(e,this.id.split("icon")[0])}
        // labimgdiv.onmouseout = function(){loc.hideTooltip()};
        langtxtdiv = document.createElement('div');
        langtxtdiv.className = 'panel-cont-text panel-lang';
        langtxtdiv.setAttribute("id",'lang-'+lang+'-txt');
        langtxtdiv.style.height = "100%";
        langtxtdiv.style["font-size"] = (1.3*loc.sksc)+"em";
        langtxtdiv.innerHTML = loc.langs[lang].name;
        // langtxtdiv.onmouseover = function(e){
        //     loc.showTooltip(e,"%meta.translator%","manual")}
        // langtxtdiv.onmouseout = function(){loc.hideTooltip()};
        langdiv.appendChild(langtxtdiv);
        document.getElementById('lang-block-icons').appendChild(langdiv);
        // document.getElementById('lang_'+lang+'_icon').style.lineHeight =
        //     parseInt(document.getElementById('lang_'+lang+'_cont').offsetHeight)+"px";
    }
    langtransdiv = document.createElement('div');
    langtransdiv.className = 'panel-text';
    langtransdiv.setAttribute("id",'lang-credit');
    if (this.langdict['meta.translator'] && this.langdict['meta.translator']!=''){
        langtransdiv.innerHTML = this.tl('%text.gen.langcredit% (%meta.name%): %meta.translator%');
    }else{
        langtransdiv.innerHTML = '';
    }
    document.getElementById('lang-block-icons').appendChild(langtransdiv);
}

Localisation.prototype.showLang = function(){
    //show options
    if (this.optionsOn){this.hideOptions();}
    if (this.helpOn){this.hideHelp();}
    this.langOn=true;
    // fade in semi-transparent background layer (greys out image)
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style({"opacity":0.5});
    // this.langbg.style("height","100%");
    //fade in infopanel
    this.langouter = d3.select('#lang-outer')
    this.langouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    // this.infopanel.html(this.iptext(d));
    this.langouter.style("left", document.getElementById('infoouter').offsetLeft-1)
        .style("top", document.getElementById('infoouter').offsetTop-1)
        .style("width",document.getElementById('infoouter').offsetWidth-2)
        .style("height",document.getElementById('infoouter').offsetHeight-22);
    if (this.portrait){
        document.getElementById('lang-block-icons').classList.add('bottom')
    }else{
        document.getElementById('lang-block-icons').classList.remove('bottom')
    }
    document.getElementById("lang-icon").classList.remove("hidden");
    document.getElementById("info-icon").classList.add("hidden");
    this.updateUrl();
}
Localisation.prototype.hideLang = function(d) {
    // hide options box
    this.langOn=false;
    // fade out infopanel
    this.langouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.langouter.style("top","200%");
    // fade out semi-transparent background
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style("opacity",0);
    // this.langbg.style("height",0);
    // d3.selectAll(".info").attr("opacity",0);
    document.getElementById("info-icon").classList.remove("hidden");
    document.getElementById("lang-icon").classList.add("hidden");
    this.updateUrl();
}
Localisation.prototype.showShare = function(){
    //show share pot
    var loc=this;
    d3.select("#share-bg").style("height","100%").style("display","block");
    shareouter=d3.select('#share-outer')
    shareouter.transition()
       .duration(500)
       .style("opacity",1)
       .style("max-height",document.getElementById('svg-container').offsetHeight);;
    shareouter.style("top",
            document.getElementById('svg-container').offsetTop+
            document.getElementById('share-icon').offsetTop +
            document.getElementById('share-icon').offsetHeight + 10)
        .style("left",
            document.getElementById('share-icon').offsetLeft +
            document.getElementById('share-icon').offsetWidth/2 -
            document.getElementById('share-outer').offsetWidth/2)
    d3.select("#twitter-share-button")
        .attr("href",
            loc.tl("https://twitter.com/intent/tweet?text=%share.plotloc.twitter.text%&url=")+
                loc.url.replace("file:///Users/chrisnorth/Cardiff/GravWaves/Outreach/","http%3A%2F%2Fchrisnorth.github.io/").replace(/:/g,'%3A').replace(/\//g,'%2F')+
                loc.tl("&hashtags=%share.plotloc.twitter.hashtag%"));
            // loc.tl("https://twitter.com/intent/tweet?text=%share.plotloc.twitter.text%&url=").replace(/\s/g,"%20")+
            // loc.makeUrl().replace("file:///","http%3A%2F%2F").replace(/&/g,'%26').replace(/:/g,'%3A').replace(/\//g,'%2F').replace(/\?/g,'%3F').replace(/=/g,'%3D')+
            // loc.tl("&hashtags=%share.plotloc.twitter.hashtag%"));
}
Localisation.prototype.hideShare = function(){
    //show share pot
    d3.select('#share-bg').style("height",0).style("display","none");
    d3.select('#share-outer').transition()
       .duration(500)
       .style("opacity",0)
       .style("max-height",0);

}
Localisation.prototype.showTooltip = function(e,tttxt,type){
    // add tooltip to eff
    ttSk = document.getElementById("tooltipSk")
    ttSk.style.transitionDuration = "200ms";
    ttSk.style.opacity = 0.9;
    ttSk.style.left = e.pageX + 10 ;
    ttSk.style.top = e.pageY - 10 ;
    ttSk.style.width = "auto";
    ttSk.style.height = "auto";
    ttSk.innerHTML = this.tl(tttxt);
}
Localisation.prototype.hideTooltip = function(){
    // hide tooltip to skwtch
    ttSk = document.getElementById("tooltipSk");
    ttSk.style.transitionDuration = "500ms";
    ttSk.style.opacity = 0.;
}
Localisation.prototype.showTooltipManual = function(txt){
    var loc=this;
    loc.tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    loc.tooltip.html(loc.tl(txt))
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY-10) + "px")
        .style("width","auto")
        .style("height","auto");
}
Localisation.prototype.hideTooltipManual = function(){
    loc.tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

Localisation.prototype.makePlot = function(){
    // make plot (calls other function)
    this.setLang();
    this.drawSky();
    this.drawEff();
    // this.addButtons();
    this.addHelp();
    this.addLang(false);
    panel = (this.urlVars.panel) ? this.urlVars.panel : this.getPanel();
    this.setPanel(panel);
    this.adjCss();
}
Localisation.prototype.replot = function(){
    // remove plots and redraw (e.g. on window resize)
    var loc=this;
    // console.log(loc.effName);
    // remove elements
    d3.select("svg#svgEff").remove()
    d3.select("div#svg-container").remove()
    // d3.selectAll("div.labcont").remove()
    // redraw graph and eff
    this.redraw=true;
    this.setScales();
    this.setLang();
    this.drawSky();
    this.drawEff();
    this.addHelp();
    this.adjCss();
    // this.redrawLabels();
    this.setPanel(this.getPanel());
    gwcat.redraw=false;
    // gwcat.initButtons();
}
// define fly-in & fly-out

//labels to add and keep updated
