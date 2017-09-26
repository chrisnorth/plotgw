// Define Localisation class
var d2r = function(deg){return deg*Math.PI/180.;}
var r2d = function(rad){return rad*180./Math.PI;}
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
    console.log('init')
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
    var loc=this;
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
            .attr("id","infoouter").attr("class","panel-outer")
            .html('<div id="effcontainer"></div><div id="wfcontainer"></div>')
    }
    if (d3.select("#network-outer").empty()){
        if(this.debug){console.log('adding network-outer')}
        d3.select("#"+this.holderid).insert("div","#infoouter + *")
            .attr("id","network-outer").attr("class","panel-outer")
            .html('<div class="panel-cont"><div id="network-dets-cont"></div></div>')
    }
    if (d3.select("#source-outer").empty()){
        if(this.debug){console.log('adding source-outer')}
        d3.select("#"+this.holderid).insert("div","#netwoork-uter + *")
            .attr("id","source-outer").attr("class","panel-outer")
            .html('<div class="panel-cont"><div id="source-info-cont"></div></div>')
    }
    if (d3.select("#help-outer").empty()){
        if(this.debug){console.log('adding help-outer')}
        d3.select('#'+this.holderid).insert("div","#network-outer + *")
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
    // set list of panels (except default info panel)
    var loc=this;
    this.panels = {
        'info':{'status':true,
            'hide':function(){loc.hideInfo()},
            'show':function(){loc.showInfo()}},
        'settings':{'status':false,
            'hide':function(){loc.hideSettings()},
            'show':function(){loc.showSettings()}},
        'help':{'status':false,
            'hide':function(){loc.hideHelp()},
            'show':function(){loc.showHelp()}},
        // 'network':{'status':false,
        //     'hide':function(){loc.hideNetwork()},
        //     'show':function(){loc.showNetwork()}},
        'source':{'status':false,
            'hide':function(){loc.hideSource()},
            'show':function(){loc.showSource()}},
        'lang':{'status':false,
            'hide':function(){loc.hideLang()},
            'show':function(){loc.showLang()}}
    }
    //initialyse common values
    this.flySp=1000;
    this.defaults = {
        lang:"en",
        ra:0,
        dec:0,
        inc:0,
        dist:1,
        phase:0,
        posang:0,
        gmst:0,
        srcamp:1e-21,
        hmap:'FNet',
        res:2.5,
        world:false
    }
    this.src={}
    this.skyarr={}
    this.src.ra = (this.urlVars.ra) ? parseFloat(this.urlVars.ra) : this.defaults.ra;
    this.src.dec = (this.urlVars.dec) ? parseFloat(this.urlVars.dec) : this.defaults.dec;
    this.src.posang = (this.urlVars.posang) ? parseFloat(this.urlVars.posang) : this.defaults.posang;
    this.src.gmst = (this.urlVars.gmst) ? parseFloat(this.urlVars.gmst) : this.defaults.gmst;
    this.src.amp = (this.urlVars.srcamp) ? parseFloat(this.urlVars.srcamp) : this.defaults.srcamp;
    this.src.inc = (this.urlVars.inc) ? parseFloat(this.urlVars.inc) : this.defaults.inc;
    this.src.dist = (this.urlVars.dist) ? parseFloat(this.urlVars.dist) : this.defaults.dist;
    this.src.phase = (this.urlVars.phase) ? parseFloat(this.urlVars.phase) : this.defaults.phase;
    this.skyarr.res=(this.urlVars.res) ? parseFloat(this.urlVars.res) : this.defaults.res;
    this.hmap = (this.urlVars.hmap) ? this.urlVars.hmap : this.defaults.hmap;
    this.world = (this.urlVars.world) ? this.urlVars.world : this.defaults.world;

    this.world = ((this.world=="1")|(this.world=="true")) ? true : false;
    this.old={"src":{"ra":null,"dec":null},"Ndet":0};
    // set values for styles
    this.setStyles();
    this.setScales();
    this.setSkyarr();
    console.log(this.fullSkyWidth,getComputedStyle(document.getElementById("loading")).width,
        (this.fullSkyWidth -
        getComputedStyle(document.getElementById("loading")).width.split('px')[0])/2);
    console.log(this.fullSkyHeight,getComputedStyle(document.getElementById("loading")).height,
        (this.fullSkyHeight -
        getComputedStyle(document.getElementById("loading")).height.split('px')[0])/2);
    document.getElementById("loading").style.left = (this.fullSkyWidth -
        getComputedStyle(document.getElementById("loading")).width.split('px')[0])/2;
    document.getElementById("loading").style.top = (this.fullSkyHeight -
        getComputedStyle(document.getElementById("loading")).height.split('px')[0])/2;
    loc.showLoading();
    // languages
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
    this.src.lon=this.ra2lon(this.src.ra);
    this.src.lat=this.src.dec;
    // set arrays for sky
    this.rE = 6.3716e6;
    this.c = 3.e8
    // this.skyarr.arr={"RA":$M(raArr),"Dec":$M(decArr),"vec":vecArr}
}
Localisation.prototype.setSkyarr = function(){
    var loc=this;
    this.skyarr.dDec=this.skyarr.res;
    this.skyarr.dRA=this.skyarr.res;
    this.skyarr.nRA=Math.floor(360./this.skyarr.dRA);
    this.skyarr.nDec=Math.floor(180./this.skyarr.dDec);
    this.skyarr.nPix=this.skyarr.nRA*this.skyarr.nDec;
    this.skyarr.yList=d3.range(-90+this.skyarr.dDec/2.,90+this.skyarr.dDec/2.,this.skyarr.dDec);
    this.skyarr.dec2i = d3.scaleLinear().domain([-90,90]).range([-0.5,this.skyarr.nDec+0.5])
    // RA needs to run backwards to switch to longitude
    this.skyarr.xList=d3.range(180-this.skyarr.dRA/2.,-180-this.skyarr.dRA/2.,-this.skyarr.dRA);
    this.skyarr.ra2i = d3.scaleLinear().domain([-180,180]).range([this.skyarr.nRA+0.5,-0.5])
    this.skyarr.radec2p = function(ra,dec){
        ira=Math.max(Math.floor(loc.skyarr.ra2i(ra)),0)
        idec=Math.max(Math.floor(loc.skyarr.dec2i(dec)),0)
        console.log(ira,idec)
        return idec*loc.skyarr.nRA + ira
    }
    this.src.pix = this.skyarr.radec2p(this.src.ra,this.src.dec);
    this.skyarr.arr={'lon':[],'lat':[],'vec':[],'pix':[]};
    p=0;
    for (j in d3.range(0,this.skyarr.nDec)){
        for (i in d3.range(0,this.skyarr.nRA)){
            this.skyarr.arr.pix.push(p);
            this.skyarr.arr.lon.push(loc.mod360(this.skyarr.xList[i]));
            this.skyarr.arr.lat.push(-this.skyarr.yList[j]);
            this.skyarr.arr.vec.push($V(lb2vec(this.skyarr.arr.lon[p],this.skyarr.arr.lat[p])))
            p++;
        }
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
    allKeys = {"ra":[this.src.ra,this.defaults.ra],
        "dec":[this.src.dec,this.defaults.dec],
        "lst":[this.src.lst,this.defaults.lst],
        "posang":[this.src.posang,this.defaults.posang],
        "lang":[this.lang,this.defaults.lang],

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
    for (panel in this.panels){
        if (this.panels[panel].status){return(panel)}
    }
    // if(this.helpOn){return "help";}
    // else if(this.langOn){return "lang";}
    // else{return "info"}
}
Localisation.prototype.setPanel = function(panelSet){
    for (panel in this.panels){
        if (panel==panelSet){
            this.panels[panel].show();
        }
    }
    // if (panel=="options"){this.showOptions();}
    // else if(panel=="help"){this.showHelp();}
    // else if(panel=="lang"){this.showLang();}
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
    result=document.getElementById("resultouter");
    effcont=document.getElementById("effcontainer");
    wfcont=document.getElementById("wfcontainer");
    this.sky=document.getElementById("skycontainer");
    if (this.winAspect<1){
        // portrait
        // console.log('portrait');
        this.portrait=true;
        this.infoFullWidth = 0.9*this.winFullWidth;
        this.infoFullHeight = 0.5*this.infoFullWidth;
        this.fullSkyWidth = 0.95*this.winFullWidth;
        this.fullSkyHeight =
            0.8*(this.winFullHeight-this.infoFullHeight);
        info.style["margin-left"]="5%";
        this.effWidth = 0.45*this.infoFullWidth;
        this.effHeight = this.effWidth;
        if(this.debug){console.log('portrait:',this.effHeight,this.infoFullHeight);}
        this.wfWidth = 0.5*this.infoFullWidth;
        this.wfHeight = this.effFullHight;
        this.labcontHeight="20%";
        this.langcontHeight="10%";
    }else{
        // landscape window
        // console.log('landscape')
        this.portrait=false;
        this.infoFullHeight = 0.65*this.winFullHeight;
        this.infoFullWidth = 0.75*this.infoFullHeight;
        this.resultFullHeight = 0.2*this.winFullHeight;
        this.resultFullWidth = this.infoFullWidth;
        this.fullSkyWidth =
            0.95*(this.winFullWidth-this.infoFullWidth);
        this.fullSkyHeight = 0.9*this.winFullHeight;
        info.style["margin-left"]=0;
        this.effWidth = this.infoFullWidth;
        this.effHeight = this.effWidth;
        if(this.debug){console.log('landscape:',this.effHeight,this.infoFullHeight);}
        this.effAspect = this.infoFullWidth/this.infoFullHeight;
        this.wfWidth = this.infoFullWidth;
        this.wfHeight = 0.5*this.effFullHight;
        this.labcontHeight="10%";
        this.langcontHeight="5%";
    }
    result.style.width = this.resultFullWidth;
    result.style.height = this.resultFullHeight;
    info.style.width = this.infoFullWidth;
    info.style.height = this.infoFullHeight;
    this.sky.style.width = this.fullSkyWidth;
    this.sky.style.height = this.fullSkyHeight;

    effcont.style.height = this.effHeight;
    effcont.style.width = this.effWidth;

    // wfcont.style.height = this.wfHeight;
    // wfcont.style.width = this.wfWidth;
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
    this.skyHeight = this.skyWidth/2.
    this.fullSkyHeight=1.1*(this.skyHeight+this.margin.top+this.margin.bottom)
        // 0.9*this.fullSkyHeight - this.margin.top - this.margin.bottom;
    this.xyAspect = this.skyWidth/this.skyHeight;

    // set axis scales
    this.errh = 0.01;
    this.errw = 0.01;//*xyAspect;
    this.mod360 = function(ra){
        if(ra>180.){
            return(ra-360.)
        }else if(ra<-180.){
            return(ra+360.)
        }else{
            return(ra)
        }
    }
    this.ra2lon = function(ra){
        return (loc.src.gmst - loc.mod360(ra));
    }
    this.lon2ra  = function(lon){
        return (loc.src.gmst - loc.mod360(lon));
    }
    this.raValue = function(d) {return d.ra;} // data -> value
    // value -> display
    this.raScale = d3.scaleLinear().domain([180,-180])
        .range([0, this.skyWidth])
        // data -> display
    this.raMap = function(d) {return loc.raScale(loc.mod360(loc.raValue(d)));}
    sky=document.getElementById("skycontainer");
    this.x2raScale = d3.scaleLinear()
        .domain([this.sky.offsetLeft+this.margin.left,this.sky.offsetLeft+this.margin.left+this.skyWidth])
        .range([180,-180])
    // RA axis
    this.raAxis = d3.axisBottom(this.raScale)
            // .orient("bottom")
            .tickSizeInner(0)
            .tickValues(d3.range(-180,180+30,30))
            .tickFormat(function(d){
                if(loc.world){if (d<0){return -d+"E"}else if(d>0){return d+"W"}else{return d}}
                else{return d;}
            });

    this.lonValue = function(d){return d.lon}
    this.lonScale = d3.scaleLinear().domain([180,-180]).range([0,this.skyWidth])
    this.lonMap = function(d) {return loc.lonScale(loc.mod360(loc.lonValue(d)))}

    //data -> value
    this.decValue = function(d) {return d.dec;}
    // value -> display
    this.decScale = d3.scaleLinear().domain([-90,90]).range([this.skyHeight,0])
    this.y2decScale = d3.scaleLinear()
        .domain([this.sky.offsetTop+this.margin.top+this.skyHeight,this.sky.offsetTop+this.margin.top])
        .range([-90,90])
    // data -> display
    this.decMap = function(d) { return loc.decScale(loc.decValue(d));}

    this.latValue = function(d){return d.lat}
    this.latScale = this.decScale;
    this.latMap=function(d) { return loc.latScale(loc.latValue(d));}

    // Dec axis
    this.decAxis = d3.axisLeft(this.decScale)
            // .orient("left")
            // .innerTickSize(-(this.relw[1]-this.relw[0])*this.graphWidth);
            .tickSizeInner(0)
            .tickValues(d3.range(-90,90+30,30))
            .tickFormat(function(d){
                if(loc.world){if (d<0){return (-d)+"S"}else if(d>0){return d+"N"}else{return d}}
                else{return d}
            });

    // set length scale (normalised to 20px=4km)
    this.lenScale = function(len){return 20*this.scl * len/4.}

    // convert detector position to xy on sky

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
    this.rScaleEff = function(r){return(r*this.effWidth/2.)}
    this.rpsi2xEff = function(r,psi){return(loc.xScaleEff(r*Math.cos(d2r(psi))))}
    this.rpsi2yEff = function(r,psi){return(loc.yScaleEff(-r*Math.sin(d2r(psi))))}
    this.xScaleEff = d3.scaleLinear().domain([-1,1]).range([0,this.effWidth])
    this.xScaleEffAspect = function(x){
        return(x*this.effWidth*this.aspectEff)}
    this.yScaleEff = d3.scaleLinear().domain([-1,1]).range([0,this.effHeight])

}
Localisation.prototype.det2xy = function(d,pt){
    // convert detector position 2 xy on sky
    if (this.world){
        if (pt=='ctr'){
            x=loc.lonMap(d);
            y=loc.latMap(d);
        }else if(pt=='xarm'){
            x = loc.lonMap(d) - loc.lenScale(Math.max(d.length,2))*Math.cos(d2r(d.ang));
            y = loc.latMap(d) - loc.lenScale(Math.max(d.length,2))*Math.sin(d2r(d.ang));
        }else if(pt=='yarm'){
            x = loc.lonMap(d) + loc.lenScale(Math.max(d.length,2))*Math.sin(d2r(d.ang));
            y = loc.latMap(d) - loc.lenScale(Math.max(d.length,2))*Math.cos(d2r(d.ang));
        }else if(pt='middle'){
            x = loc.lonMap(d) + Math.sqrt(0.25) * loc.lenScale(Math.max(d.length,2)) *
                (-Math.cos(d2r(d.ang))+Math.sin(d2r(d.ang)));
            y = loc.latMap(d) + Math.sqrt(0.25) * loc.lenScale(Math.max(d.length,2)) *
                (-Math.sin(d2r(d.ang))-Math.cos(d2r(d.ang)));
        }else if(pt=='radius'){
            x = loc.lenScale(Math.max(d.length,2));
            y = loc.lenScale(Math.max(d.length,2));
        }
        return([x,y]);
    }else{
        if (pt=='ctr'){
            x=loc.raScale(loc.lon2ra(d.lon));
            y=loc.decScale(d.lat);
        }else if(pt=='xarm'){
            x = loc.raScale(loc.lon2ra(d.lon)) + loc.lenScale(Math.max(d.length,2))*Math.cos(d2r(d.ang));
            y = loc.decScale(d.lat) - loc.lenScale(Math.max(d.length,2))*Math.sin(d2r(d.ang));
        }else if(pt=='yarm'){
            x = loc.raScale(loc.lon2ra(d.lon)) - loc.lenScale(Math.max(d.length,2))*Math.sin(d2r(d.ang));
            y = loc.decScale(d.lat) - loc.lenScale(Math.max(d.length,2))*Math.cos(d2r(d.ang));
        }else if(pt='middle'){
            x = loc.raScale(loc.lon2ra(d.lon)) - Math.sqrt(0.25) * loc.lenScale(Math.max(d.length,2)) *
                (-Math.cos(d2r(d.ang))+Math.sin(d2r(d.ang)));
            y = loc.decScale(d.lat) + Math.sqrt(0.25) * loc.lenScale(Math.max(d.length,2)) *
                (-Math.sin(d2r(d.ang))-Math.cos(d2r(d.ang)));
        }else if(pt=='radius'){
            x = loc.lenScale(Math.max(d.length,2));
            y = loc.lenScale(Math.max(d.length,2));
        }
        return([x,y]);
    }
}
Localisation.prototype.rect2xy = function(p,pt){
    // convert rectangle position 2 xy on sky
    if (this.world){
        xy1=loc.skyarr.projEq([-(loc.skyarr.arr.lon[p]-loc.skyarr.dRA/2.),loc.skyarr.arr.lat[p]-loc.skyarr.dDec/2.])
        xy2=loc.skyarr.projEq([-(loc.skyarr.arr.lon[p]+loc.skyarr.dRA/2.),loc.skyarr.arr.lat[p]+loc.skyarr.dDec/2.])
        x1=xy1[0]
        y1=xy1[1]
        x2=xy2[0]
        y2=xy2[1]
        // x1=loc.lonScale(loc.skyarr.arr.lon[p]-loc.skyarr.dRA/2.);
        // y1=loc.latScale(loc.skyarr.arr.lat[p]-loc.skyarr.dDec/2.);
        // x2=loc.lonScale(loc.skyarr.arr.lon[p]+loc.skyarr.dRA/2.);
        // y2=loc.latScale(loc.skyarr.arr.lat[p]+loc.skyarr.dDec/2.);
        xout1=Math.min(x1,x2)
        xout2=Math.max(x1,x2)
        yout1=Math.min(y1,y2)
        yout2=Math.max(y1,y2)
        if (xout2-xout1>loc.svgWidth/2.){
            // rectangle wraps around edge
            xout1=Math.max(x1,x2);
            xout2=Math.min(x1,x2)+(loc.svgWidth-loc.margin.left-loc.margin.right);
        }
        return([xout1,yout1,xout2-xout1,yout2-yout1]);
    }else{
        xy1=loc.skyarr.projEq([-(loc.lon2ra(loc.skyarr.arr.lon[p]-loc.skyarr.dRA/2.)),loc.skyarr.arr.lat[p]-loc.skyarr.dDec/2.])
        xy2=loc.skyarr.projEq([-(loc.lon2ra(loc.skyarr.arr.lon[p]+loc.skyarr.dRA/2.)),loc.skyarr.arr.lat[p]+loc.skyarr.dDec/2.])
        x1=xy1[0]
        y1=xy1[1]
        x2=xy2[0]
        y2=xy2[1]
        // x1=loc.raScale(loc.lon2ra(loc.skyarr.arr.lon[p]-loc.skyarr.dRA/2.));
        // y1=loc.decScale(loc.skyarr.arr.lat[p]-loc.skyarr.dDec/2.);
        // x2=loc.raScale(loc.lon2ra(loc.skyarr.arr.lon[p]+loc.skyarr.dRA/2.));
        // y2=loc.decScale(loc.skyarr.arr.lat[p]+loc.skyarr.dDec/2.);
        xout1=Math.min(x1,x2)
        xout2=Math.max(x1,x2)
        yout1=Math.min(y1,y2)
        yout2=Math.max(y1,y2)
        if (xout2-xout1>loc.svgWidth/2.){
            // rectangle wraps around edge
            xout1=Math.max(x1,x2);
            xout2=Math.min(x1,x2)+(loc.svgWidth-loc.margin.left-loc.margin.right);
        }
        return([xout1,yout1,xout2-xout1,yout2-yout1]);
    }
}
Localisation.prototype.src2xy = function(pt){
    // convert source position 2 xy on sky
    if (this.world){
        console.log(loc.src.ra,loc.src.dec)
        if (pt=='ctr'){
            x=loc.lonScale(-loc.src.lon);
            y=loc.latMap(loc.src);
        }else if(pt=='x-'){
            x = loc.lonScale(-loc.src.lon) - 10*Math.cos(d2r(loc.src.posang));
            y = loc.latMap(loc.src) + 10*Math.sin(d2r(loc.src.posang));
        }else if(pt=='x+'){
            x = loc.lonScale(-loc.src.lon) + 10*Math.cos(d2r(loc.src.posang));
            y = loc.latMap(loc.src) - 10*Math.sin(d2r(loc.src.posang));
        }else if(pt=='y-'){
            x = loc.lonScale(-loc.src.lon) + 10*Math.sin(d2r(loc.src.posang));
            y = loc.latMap(loc.src) + 10*Math.cos(d2r(loc.src.posang));
        }else if(pt=='y+'){
            x = loc.lonScale(-loc.src.lon) - 10*Math.sin(d2r(loc.src.posang));
            y = loc.latMap(loc.src) - 10*Math.cos(d2r(loc.src.posang));
        }
        return([x,y]);
    }else{
        console.log(loc.src.ra,loc.src.dec)
        if (pt=='ctr'){
            x=loc.raMap(loc.src);
            y=loc.decMap(loc.src);
        }else if(pt=='x-'){
            x = loc.raMap(loc.src) - 10*Math.cos(d2r(loc.src.posang));
            y = loc.decMap(loc.src) - 10*Math.sin(d2r(loc.src.posang));
        }else if(pt=='x+'){
            x = loc.raMap(loc.src) + 10*Math.cos(d2r(loc.src.posang));
            y = loc.decMap(loc.src) + 10*Math.sin(d2r(loc.src.posang));
        }else if(pt=='y-'){
            x = loc.raMap(loc.src) - 10*Math.sin(d2r(loc.src.posang));
            y = loc.decMap(loc.src) + 10*Math.cos(d2r(loc.src.posang));
        }else if(pt=='y+'){
            x = loc.raMap(loc.src) + 10*Math.sin(d2r(loc.src.posang));
            y = loc.decMap(loc.src) - 10*Math.cos(d2r(loc.src.posang));
        }
        return([x,y]);
    }
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
    // this.panels.info.show=function(){this.showInfo()}
    // this.panels.info.show=function()(this.hideInfo())
    // Add svg to eff container
    this.svgEff = d3.select("div#effcontainer").append("svg")
        .attr("preserveAspectRatio", "none")
        .attr("id","svgEff")
        // .attr("viewBox","0 0 "+this.effWidth+" " +this.effHeight)
        .attr("width", this.effWidth + this.marginEff.left + this.marginEff.right)
        .attr("height", (this.effHeight + this.marginEff.top + this.marginEff.bottom))
        .append("g")
        .attr("transform", "translate(" + this.marginEff.left + "," + this.marginEff.top + ")");
    this.angs={}
    for (d in this.dataDet){
        this.angs[this.dataDet[d].id]=this.dataDet[d].ang
    }
    this.svgEff.append("circle")
        .attr("class","outer-circle")
        .attr("r",loc.rScaleEff(Math.sqrt(0.5)))
        .attr("cx",loc.xScaleEff(0))
        .attr("cy",loc.yScaleEff(0))
        .style("fill-opacity",0)
        .style("stroke","black")
        .style("stroke-width",1)
    this.svgEff.append("line")
        .attr("class","ref-x")
        .attr("x1",loc.xScaleEff(-Math.sqrt(0.5)))
        .attr("x2",loc.xScaleEff(Math.sqrt(0.5)))
        .attr("y1",loc.yScaleEff(0))
        .attr("y2",loc.yScaleEff(0))
        .style("stroke","black")
        .style("stroke-width",1)
        .style("stroke-dasharray","1,3")
    this.svgEff.append("line")
        .attr("class","ref-x")
        .attr("x1",loc.xScaleEff(0))
        .attr("x2",loc.xScaleEff(0))
        .attr("y1",loc.yScaleEff(-Math.sqrt(0.5)))
        .attr("y2",loc.yScaleEff(Math.sqrt(0.5)))
        .style("stroke","black")
        .style("stroke-width",1)
        .style("stroke-dasharray","1,3")

    this.updateLines();

    // add labels
    if (this.redraw){
        d3.selectAll('.labcont').style('height',this.labcontHeight);
        d3.selectAll('.lang-cont').style('height',this.langcontHeight);
    }

}
Localisation.prototype.addEffLines = function(){
    // add ellipse for shadow
    loc=this;
    // console.log('adding lines for',d,det);
    // svgEffGroup=this.svgEff.selectAll('.heff-g')
    //     .data(loc.dataDet)
    // .enter().append("g")
    //     .attr("class",function(d){return "heff-g heff-"+d.id})
    //     .attr("transform",function(d){
    //         return("translate("+(loc.effWidth/2)+","+(loc.effWidth/2)+") rotate("+d.psi+")")})
    // add x-line
    linesX=this.svgEff.selectAll('.heff-line-x')
        .data(loc.src.det).enter()
    linesX.append("line")
        // .attr("transform",function(d){
        //     return("translate("+(loc.effWidth/2)+","+(loc.effWidth/2)+") rotate("+d.psi+")")})
        .attr("class",function(d){return "heff-line heff-line-x heff-x-"+d.id})
        .attr("x1",function(d){console.log(d,loc.rpsi2xEff(-d.r,d.psi));return loc.rpsi2xEff(-d.r,d.psi)})
        .attr("y1",function(d){return loc.rpsi2yEff(-d.r,d.psi)})
        .attr("x2",function(d){return loc.rpsi2xEff(d.r,d.psi)})
        .attr("y2",function(d){return loc.rpsi2yEff(d.r,d.psi)})
        .attr("stroke",function(d){return loc.dataDetd.color})
        .attr("stroke-width","3px")
        .attr("stroke-opacity",0.7);
    // add y-line
    linesY=this.svgEff.selectAll('.heff-line-y')
        .data(loc.src.det).enter()
    linesY.append("line")
        // .attr("transform",function(d){
        //     return("translate("+(loc.effWidth/2)+","+(loc.effWidth/2)+") rotate("+d.psi+")")})
        .attr("class",function(d){return "heff-line heff-line-y heff-y-"+d.id})
        .attr("x1",function(d){return loc.rpsi2xEff(-d.r,d.psi+90)})
        .attr("y1",function(d){return loc.rpsi2yEff(-d.r,d.psi+90)})
        .attr("x2",function(d){return loc.rpsi2xEff(d.r,d.psi+90)})
        .attr("y2",function(d){return loc.rpsi2yEff(d.r,d.psi+90)})
        .attr("stroke",function(d){return d.color})
        .attr("stroke-width","3px")
        .attr("stroke-dasharray",5)
        .attr("stroke-opacity",0.7);

}
Localisation.prototype.updateDetResults = function(){
    console.log("UPDATING STATUS")
    var loc=this;

    netStatus=d3.select("#net-stat")
    if (netStatus.empty()){
        // add bars etc.
        netStatus=d3.select('#network-stats-cont').append("div")
            .attr("class","det-stat full")
            .attr("id","net-stat")
        netStatus.append("div")
            .attr("class","det-name")
            .html(function(d){return loc.net.name});
        netsnrbarouter=netStatus.append("div")
            .attr("class","det-bar-outer det-snr-bar-outer")
        netsnrbarouter.append("div").attr("class","bar-label bar-label-left")
            .html(this.tl('%text.loc.info.snr%'));
        netsnrbarouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
            .style("right","95%").html('0.01');
        netsnrbarouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
            .style("right","72%").html('0.1');
        netsnrbarouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
            .style("left","48%").html('1');
        netsnrbarouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-right")
            .style("left","72%").html('10');
        netsnrbarouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-right")
            .style("left","95%").html('100');
        netsnrbarouter.append("div").attr("class","det-snr-bar")
            .on("mouseover",function(){
                loc.showTooltipManual(loc.tl('%tooltip.loc.snr%: '+parseFloat(loc.src.pNet).toPrecision(2)))
            })
            .on("mouseout",function(){loc.hideTooltipManual();});
        netsnrbarouter.append("div").attr("class","bar-line")
            .style("left","25%");
        netsnrbarouter.append("div").attr("class","bar-line")
            .style("left","50%");
        netsnrbarouter.append("div").attr("class","bar-line")
            .style("left","75%");

        // netStatus.append("div")
        //     .attr("class","det-bar-outer det-mag-bar-outer")
        // .append("div").attr("class","det-mag-bar")
        netbarpolouter=netStatus.append("div")
            .attr("class","det-bar-outer det-pol-bar-outer")
        netbarpolouter.append("div").attr("class","bar-label bar-label-left").html('+');
        netbarpolouter.append("div").attr("class","bar-label bar-label-right").html('x');
        netbarpolouter.append("div").attr("class","det-pol-bar det-pol-bar-plus")
            .on("mouseover",function(){
                loc.showTooltipManual(loc.tl('%text.loc.info.pluspol%: '+parseFloat(100*loc.src['r+Net']).toPrecision(2))+'%')
            })
            .on("mouseout",function(){loc.hideTooltipManual();});
        netbarpolouter.append("div").attr("class","det-pol-bar det-pol-bar-cross")
            .on("mouseover",function(){
                loc.showTooltipManual(loc.tl('%text.loc.info.crosspol%: '+parseFloat(100*loc.src['rxNet']).toPrecision(2))+'%')
            })
            .on("mouseout",function(){loc.hideTooltipManual();});
        netbarpolouter.append("div").attr("class","bar-line")
            .style("left","25%");
        netbarpolouter.append("div").attr("class","bar-line zero-left")
            .style("left","50%");
        netbarpolouter.append("div").attr("class","bar-line zero-right")
            .style("right","50%");
        netbarpolouter.append("div").attr("class","bar-line")
            .style("left","75%");
        netbarpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
            .style("right","95%").html('100%');
        netbarpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
            .style("right","70%").html('50%');
        netbarpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
            .style("left","48%").html('0');
        netbarpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-right")
            .style("left","70%").html('50%');
        netbarpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-right")
            .style("left","95%").html('100%');

        netbarFouter=netStatus.append("div")
            .attr("class","det-bar-outer det-F-bar-outer")
        netbarFouter.append("div").attr("class","bar-label bar-label-left").html('+');
        netbarFouter.append("div").attr("class","bar-label bar-label-right").html('x');
        netbarFouter.append("div").attr("class","det-F-bar det-F-bar-plus")
        netbarFouter.append("div").attr("class","det-F-bar det-F-bar-cross")
    }
    netStatus.select(".det-snr-bar")
        .style("background-color","#a0a")
        .transition().duration(500)
        .style("width",function(){return loc.snrRange(Math.log10(loc.src.pNet))+'%'})
        .style("opacity","1");;
    // netStatus.select(".det-mag-bar")
    //     .transition().duration(500)
    //     .style("width",function(){return parseInt(100.*loc.src.rNet)+"%"})
    //     .style("opacity","1");
    netStatus.selectAll(".det-pol-bar-plus")
        .transition().duration(500)
        .style("margin-left",function(){return parseInt(Math.round(50.*(1-loc.src['r+Net'])))+"%"})
        .style("width",function(){return parseInt(Math.round(50.*loc.src['r+Net']))+"%"});
    netStatus.selectAll(".det-pol-bar-cross")
        .transition().duration(500)
        .style("margin-left","50%")
        .style("width",function(){return parseInt(Math.round(50.*loc.src['rxNet']))+"%"});

    netStatus.selectAll(".det-F-bar-plus")
        .transition().duration(500)
        .style("margin-left",function(){return parseInt(Math.round(50.*(1-1.4*Math.abs(loc.src['h+'])/loc.src.amp)))+"%"})
        .style("width",function(){return parseInt(Math.round(50.*1.4*Math.abs(loc.src['h+'])/loc.src.amp))+"%"});
    netStatus.selectAll(".det-F-bar-cross")
        .transition().duration(500)
        .style("margin-left","50%")
        .style("width",function(){return parseInt(Math.round(50.*1.4*Math.abs(loc.src['hx'])/loc.src.amp))+"%"});

    detStatuses=d3.select("#detector-stats-cont").selectAll(".det-stat")
        .data(loc.dataDet)
    detStatuses.selectAll(".det-icon")
        .style("border-color",function(d){console.log(d.id);return d.color});
    detStatuses.selectAll(".det-name")
        .html(function(d){return d.name});

    // detector SNR bar
    detStatuses.selectAll(".det-snr-bar")
        .transition().duration(500)
        .style("width",function(d){return loc.snrRange(Math.log10(loc.src.det[loc.di[d.id]].snr))+'%'})
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0"});;
        // .html(function(d){return d.id});

    // // detector magnitude bar
    // detStatuses.selectAll(".det-mag-bar")
    //     .transition().duration(500)
    //     .style("width",function(d){return parseInt(100.*loc.src.det[loc.di[d.id]].r*Math.sqrt(2))+"%"})
    //     .style("opacity",function(d){
    //         return (loc.dStatus[d.id]==true)?"1":"0"});;
        // .html(function(d){return d.id});

    // detector polarisation bar
    detStatuses.selectAll(".det-pol-bar-plus")
        .transition().duration(500)
        .style("margin-left",function(d){return parseInt(Math.round(50.*(1-loc.src.det[loc.di[d.id]]['r+'])))+"%"})
        .style("width",function(d){return parseInt(Math.round(50.*loc.src.det[loc.di[d.id]]['r+']))+"%"})
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0"});
    detStatuses.selectAll(".det-pol-bar-cross")
        .transition().duration(500)
        .style("margin-left","50%")
        .style("width",function(d){return parseInt(Math.round(50.*loc.src.det[loc.di[d.id]]['rx']))+"%"})
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0"});;

    detStatuses.selectAll(".det-F-bar-plus")
        .transition().duration(500)
        .style("margin-left",function(d){return parseInt(Math.round(50.*(1-loc.src.det[loc.di[d.id]]['F+'])))+"%"})
        .style("width",function(d){return parseInt(Math.round(50.*loc.src.det[loc.di[d.id]]['F+']))+"%"})
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0"});
    detStatuses.selectAll(".det-F-bar-cross")
        .transition().duration(500)
        .style("margin-left","50%")
        .style("width",function(d){return parseInt(Math.round(50.*loc.src.det[loc.di[d.id]]['Fx']))+"%"})
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0"});;

    // add new elements
    detStatusEnter=detStatuses.enter()
    detStatusDiv=detStatusEnter.append("div")
        .attr("id",function(d){return "det-stat-"+d.id})
        .attr("class","det-stat")
    detStatusDiv.append("label")
        .attr("class","det-switch")
        .attr("id",function(d){return "det-switch-"+d.id})
        .html(function(d){
                return "<input type='checkbox' "+((loc.dStatus[d.id]==true)?"checked":"")+">"+"<span class='det-slider round'></span>"})
        .on("mousedown",function(){
            console.log('toggling',this,this.id.split('-')[2],loc.dStatus);
            if(!loc.isLoading){
                loc.detectorToggle(this.id.split('-')[2])
            }
        });
    // icon & name
    detStatusDiv.append("div")
        .attr("class","det-icon")
        .style("border-color",function(d){console.log(d.id);return d.color});
    detStatusDiv.append("div")
        .attr("class","det-name")
        .html(function(d){return d.name});

    // SNR bar
    // detStatusDiv.append("div")
    //     .attr("class","det-snr-label")
    //     .html(this.tl('%text.plotloc.label.SNR%'))
    barsnrouter=detStatusDiv.append("div")
        .attr("class","det-bar-outer det-snr-bar-outer")
    barsnrouter.append("div").attr("class","bar-label bar-label-left").html(this.tl('%text.loc.info.snr%'));
    barsnrouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
        .style("right","95%").html('0.01');
    barsnrouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
        .style("right","72%").html('0.1');
    barsnrouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
        .style("left","48%").html('1');
    barsnrouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-right")
        .style("left","72%").html('10');
    barsnrouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-right")
        .style("left","95%").html('100');
    barsnrouter.append("div").attr("class","det-snr-bar")
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0.25"})
        .style("width",function(d){return loc.snrRange(Math.log10(loc.src.det[loc.di[d.id]].snr))+'%';})
        .on("mouseover",function(d){
            loc.showTooltipManual(loc.tl('%tooltip.loc.snr%: '+parseFloat(loc.src.det[loc.di[d.id]].snr).toPrecision(2)));
        })
        .on("mouseout",function(d){
            loc.hideTooltipManual()
        })
    barsnrouter.append("div").attr("class","bar-line")
        .style("left","25%");
    barsnrouter.append("div").attr("class","bar-line")
        .style("left","50%");
    barsnrouter.append("div").attr("class","bar-line")
        .style("left","75%");
    // magnitude bar
    // detStatusDiv.append("div")
    //     .attr("class","det-bar-outer det-mag-bar-outer")
    // .append("div").attr("class","det-mag-bar")
    //     .style("opacity",function(d){
    //         return (loc.dStatus[d.id]==true)?"1":"0"})
    //     .style("width",function(d){return parseInt(100.*loc.src.det[loc.di[d.id]].r*Math.sqrt(2))+"%"});

    // polarisation bar
    barpolouter=detStatusDiv.append("div")
        .attr("class","det-bar-outer det-pol-bar-outer");
    barpolouter.append("div").attr("class","bar-label bar-label-left").html('+');
    barpolouter.append("div").attr("class","bar-label bar-label-right").html('x');
    barpolouter.append("div").attr("class","det-pol-bar det-pol-bar-plus")
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0.25"})
        .style("margin-left",function(d){return parseInt(Math.round(50.*(1-loc.src.det[loc.di[d.id]]['r+'])))+"%"})
        .style("width",function(d){return parseInt(Math.round(50.*loc.src.det[loc.di[d.id]]['r+']))+"%"})
        .on("mouseover",function(d){
            loc.showTooltipManual(loc.tl('%text.loc.info.pluspol%: '+
                parseFloat(100*loc.src.det[loc.di[d.id]]['r+']).toPrecision(2))+'%')
        })
        .on("mouseout",function(){loc.hideTooltipManual();});;
    barpolouter.append("div").attr("class","det-pol-bar det-pol-bar-cross")
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0.25"})
        .style("margin-left","50%")
        .style("width",function(d){return parseInt(50.*loc.src.det[loc.di[d.id]]['rx'])+"%"})
        .on("mouseover",function(d){
            loc.showTooltipManual(loc.tl('%text.loc.info.crosspol%: '+
                parseFloat(100*loc.src.det[loc.di[d.id]]['rx']).toPrecision(2))+'%')
        })
        .on("mouseout",function(){loc.hideTooltipManual();});
    barpolouter.append("div").attr("class","bar-line")
        .style("left","25%");
    barpolouter.append("div").attr("class","bar-line zero-left")
        .style("left","50%");
    barpolouter.append("div").attr("class","bar-line zero-right")
        .style("right","50%");
    barpolouter.append("div").attr("class","bar-line")
        .style("left","75%");
    barpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
        .style("right","95%").html('100%');
    barpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
        .style("right","70%").html('50%');
    barpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-left")
        .style("left","48%").html('0');
    barpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-right")
        .style("left","70%").html('50%');
    barpolouter.append("div").attr("class","bar-label bar-label-axis bar-label-axis-right")
        .style("left","95%").html('100%');

    barFouter=detStatusDiv.append("div")
        .attr("class","det-bar-outer det-F-bar-outer");
    barFouter.append("div").attr("class","bar-label bar-label-left").html('+');
    barFouter.append("div").attr("class","bar-label bar-label-right").html('x');
    barFouter.append("div").attr("class","det-F-bar det-F-bar-plus")
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0"})
        .style("margin-left",function(d){return parseInt(Math.round(50.*(1-loc.src.det[loc.di[d.id]]['F+'])))+"%"})
        .style("width",function(d){return parseInt(Math.round(50.*loc.src.det[loc.di[d.id]]['F+']))+"%"});
    barFouter.append("div").attr("class","det-F-bar det-F-bar-cross")
        .style("opacity",function(d){
            return (loc.dStatus[d.id]==true)?"1":"0"})
        .style("margin-left","50%")
        .style("width",function(d){return parseInt(50.*loc.src.det[loc.di[d.id]]['Fx'])+"%"});
    console.log(detStatuses,detStatusEnter)
    detStatusEnter.merge(detStatuses);
    console.log(detStatuses,detStatusEnter)
    // update values
    detStatusEnter=detStatuses.enter()
    console.log(detStatuses,detStatusEnter)


}
Localisation.prototype.addLabel = function (lab,container) {
    labimgdiv = document.createElement('div');
    labimgdiv.className = 'icon labcont';
    // labimgdiv.style.width = this.labcontWidth;
    labimgdiv.style.height = this.labcontHeight;
    labimgdiv.style.display = "inline-block";
    if (this.labels[lab].hasOwnProperty('icon')){
        labimgdiv.setAttribute("id",lab+'icon');
        labimgdiv.innerHTML ="<img src='"+this.labels[lab].icon+"'>"
    }
    labtxtdiv = document.createElement('div');
    labtxtdiv.className = 'labtext info';
    labtxtdiv.setAttribute('id',lab+'txt');
    labtxtdiv.innerHTML = this.tl(loc.labels[lab].labstr());
    labimgdiv.appendChild(labtxtdiv);
    document.getElementById(container).appendChild(labimgdiv);
};
Localisation.prototype.addLabelDet = function (det,container) {
    labimgdiv = document.createElement('div');
    labimgdiv.className = 'icon labcont dettoggle';
    labimgdiv.setAttribute("id",'det-toggle-'+det);
    // labimgdiv.style.width = this.labcontWidth;
    labimgdiv.style.height = this.labcontHeight;
    labimgdiv.style.display = "inline-block";
    labimgdiv.innerHTML ="<span class='det'>"+this.dataDet[this.di[det]].id+"</span>"
    labimgdiv.addEventListener('click',function(){
        det=this.id.split('-')[2]
        console.log('id',det);
        loc.detectorToggle(det)
    })
    labtxtdiv = document.createElement('div');
    labtxtdiv.className='label info dettoggle-lab';
    labtxtdiv.setAttribute('id','det-toggle-lab-'+det);
    labtxtdiv.style.height = "100%";
    labtxtdiv.style["font-size"] = (1.3*loc.sksc)+"em";
    if (this.dStatus[det]==1){
        labtxtdiv.innerHTML = this.tl('%text.loc.network.on%');
    }else{
        labtxtdiv.innerHTML = this.tl('%text.loc.network.off%');
    }
    labimgdiv.appendChild(labtxtdiv);
    document.getElementById(container).appendChild(labimgdiv);
};
Localisation.prototype.addWaveform = function(lab){
    // add waveforms as html elements
    return
}
Localisation.prototype.updateLines = function(){
    // rotate lines to new position
    var loc=this;
    // this.svgEff.selectAll('.heff-g')
    //     .transition().duration(this.fadeSp)
    //     .attr("transform",function(d){
    //         return("translate("+(loc.effWidth/2)+","+(loc.effWidth/2)+") rotate("+d.psi+")")})
    linesX=loc.svgEff.selectAll('line.heff-line-x')
        .data(loc.src.det)
    linesX.exit().remove()
    linesX.transition().duration(loc.flySp)
        .attr("x1",function(d){return loc.rpsi2xEff(-d.r,d.psi)})
        .attr("y1",function(d){return loc.rpsi2yEff(-d.r,d.psi)})
        .attr("x2",function(d){return loc.rpsi2xEff(d.r,d.psi)})
        .attr("y2",function(d){return loc.rpsi2yEff(d.r,d.psi)})
        .attr("stroke-opacity",function(d){return 0.7*loc.dStatus[d.id]});
    linesX.enter().append("line")
        .attr("class",function(d){return "heff-line heff-line-x heff-x-"+d.id})
        .attr("x1",function(d){return loc.rpsi2xEff(-d.r,d.psi)})
        .attr("y1",function(d){return loc.rpsi2yEff(-d.r,d.psi)})
        .attr("x2",function(d){return loc.rpsi2xEff(d.r,d.psi)})
        .attr("y2",function(d){return loc.rpsi2yEff(d.r,d.psi)})
        .attr("stroke",function(d){return d.color})
        .attr("stroke-width","3px")
        .transition().duration(loc.flySp)
        .attr("stroke-opacity",function(d){return 0.7*loc.dStatus[d.id]});
    // loc.svgEff.selectAll('line.heff-line-y')
    //     .attr("transform",function(d){
    //         return("translate("+(loc.effWidth/2)+","+(loc.effWidth/2)+") rotate("+d.psi+")")})
    linesY=loc.svgEff.selectAll('line.heff-line-y')
        .data(loc.src.det)
    linesY.exit().remove()
    linesY.transition().duration(loc.flySp)
        .attr("x1",function(d){return loc.rpsi2xEff(-d.r,d.psi+90)})
        .attr("y1",function(d){return loc.rpsi2yEff(-d.r,d.psi+90)})
        .attr("x2",function(d){return loc.rpsi2xEff(d.r,d.psi+90)})
        .attr("y2",function(d){return loc.rpsi2yEff(d.r,d.psi+90)})
        .attr("stroke-opacity",function(d){return 0.7*loc.dStatus[d.id]});
    linesY.enter().append("line")
        .attr("class",function(d){return "heff-line heff-line-y heff-y-"+d.id})
        .attr("x1",function(d){return loc.rpsi2xEff(-d.r,d.psi+90)})
        .attr("y1",function(d){return loc.rpsi2yEff(-d.r,d.psi+90)})
        .attr("x2",function(d){return loc.rpsi2xEff(d.r,d.psi+90)})
        .attr("y2",function(d){return loc.rpsi2yEff(d.r,d.psi+90)})
        .attr("stroke",function(d){return d.color})
        .attr("stroke-width","3px")
        .attr("stroke-dasharray",5)
        .transition().duration(loc.flySp)
        .attr("stroke-opacity",function(d){return 0.7*loc.dStatus[d.id]});
    // }else if(resize=="fly"){
    //     // resize & fly in
    //     this.svgEff.select('g.heff-'+d)
    //         .transition().duration(this.fadeSp).ease("bounce")
    //         .attr("transform","rotate("+det.psi+")")
    //     this.svgEff.select('g.heff-x-'+d)
    //         .transition().duration(this.fadeSp)
    //         .attr("x1",this.xScaleEff(-det.r))
    //         .attr("x2",this.xScaleEff(det.r));
    //     this.svgEff.select('g.heff-y-'+d)
    //         .transition().duration(this.fadeSp)
    //         .attr("y1",this.yScaleEff(det.r))
    //         .attr("y2",this.yScaleEff(det.r))
    // }else if(resize=="snap"){
    //     // snap resize (when redrawing eff)
    //     this.svgEff.select('g.heff-'+d)
    //         .attr("transform","rotate("+det.psi+")")
    //     this.svgEff.select('g.heff-x-'+d)
    //         .attr("x1",this.xScaleEff(-det.r))
    //         .attr("x2",this.xScaleEff(det.r));
    //     this.svgEff.select('g.heff-y-'+d)
    //         .attr("y1",this.yScaleEff(det.r))
    //         .attr("y2",this.yScaleEff(det.r))
    // };

};
Localisation.prototype.updateSourceLabels = function(){
    d3.select('#lab-ra-txt')
        .html(this.tl(loc.labels.ra.labstr()));
    d3.select('#lab-dec-txt')
        .html(this.tl(loc.labels.dec.labstr()));
    d3.select('#lab-gmst-txt')
        .html(this.tl(loc.labels.gmst.labstr()));
    d3.select('#lab-posang-txt')
        .html(this.tl(loc.labels.posang.labstr()));
    d3.select('#lab-inc-txt')
        .html(this.tl(loc.labels.inc.labstr()));
    d3.select('#lab-amp-txt')
        .html(this.tl(loc.labels.amp.labstr()));
    // for (lab in this.labels){
    //     labTxt=this.tl(this.labels[lab].labstr());
    //     // console.log(lab,labTxt)
    //     document.getElementById(lab+"txt").innerHTML = this.tl(labTxt);
    // }
    return
}
Localisation.prototype.updateCalcs = function(newSrc,newDet){
    // update calculations and show results
    this.setDetOn();
    this.showLoading();
    console.log('calc args:',newSrc,newDet);
    // recalculate
    console.log('recalculating detectors');
    console.log(this.dStatus);
    this.processNetwork();
    if (newDet){
        this.calcDetTimes();
        this.calcAntFacsSky();
    }
    if (newSrc==true){
        // move source
        this.moveHighlight();
        // calculate results for source
        this.processSrcAmp();
    }
    this.calcAntFacs();
    //  update results
    if (this.overlays.contoursT.shown){this.updateContoursT();}
    // this.calcProbSky();
    // this.updateContoursPr();
    this.updateDetMarkers();
    this.updateDetResults();
    this.updateSourceLabels();
    this.updateLines();
    if ((newDet==true)|(this.hmap!='none')){
        this.updateHeatmap(this.hmap);
    }
    this.calcTimeRings()
    if (this.overlays.contoursTmatch.shown){this.updateContoursTmatch()}
    this.updateHeatmap('Tmatch');
    this.updateHeatmap('Tall',this.hideLoading());

    // this.uncloseContours();
}
Localisation.prototype.moveSrc = function(ra,dec){
    if ((ra>180)|(ra<-180)|(dec>90)|(dec<-90)){
        // out of limits; do nothing
        return
    }else{
        this.showLoading();
        if (this.world){
            this.old.src.ra=this.src.ra;
            this.old.src.dec=this.src.dec;
            this.src.lon=-ra;
            this.src.lat=dec;
            this.src.ra=this.lon2ra(ra);
            this.src.dec=this.src.lat;
        }else{
            this.old.src.ra=this.src.ra;
            this.old.src.dec=this.src.dec;
            this.src.ra=ra;
            this.src.dec=dec;
            this.src.lon=this.ra2lon(ra);
            this.src.lat=this.src.dec;
        }
        this.src.pix=this.skyarr.radec2p(this.src.ra,this.src.dec);
        this.updateCalcs(true,false);
        this.old.src.ra=this.src.ra;
        this.old.src.dec=this.src.dec;
        // this.processSrcAmp();
        // this.calcAntFacs();
        // this.updateSourceLabels();
        // this.updateLines();
        // this.calcProbSky();
        // this.moveHighlight();
        // this.updateHeatmap(this.hmap);
        // this.updateContoursT();
        // this.updateContoursPr();
        // this.updateDetResults();
        return
    }
}
Localisation.prototype.detectorOn = function(det){
    if (this.dStatus[det]==0){
        this.detectorToggle(det);
        return
    }else{
        return
    }
}
Localisation.prototype.detectorOff = function(det){
    if (this.dStatus[det]==1){
        this.detectorToggle(det);
        return
    }else{
        return
    }
}
Localisation.prototype.detectorToggle = function(det){
    // this.dStatus[det]=1-this.dStatus[det];
    var loc=this;
    loc.old.Ndet=loc.Ndet;
    console.log(loc.dStatus,det,loc.dStatus[det])
    if (loc.dStatus[det]==0){
        console.log('turning '+det+' ON')
        loc.dStatus[det]=1;
        loc.Ndet+=1;
        // document.getElementById('det-toggle-lab-'+det).innerHTML=this.tl("ON")
    }else{
        console.log('turning '+det+' OFF')
        loc.dStatus[det]=0;
        loc.Ndet-=1;
        // document.getElementById('det-toggle-lab-'+det).innerHTML=this.tl("OFF")
    }
    this.showLoading();
    loc.updateCalcs(false,true);
    // this.updateDet();
}
Localisation.prototype.setDetOn = function(){
    this.dOn={}
    for (d in this.di){
        console.log(d,this.dStatus[d]);
        this.dataDet[this.di[d]].on=this.dStatus[d]
        if (this.dStatus[d]==1){
            this.dOn[d]=this.di[d]
        }
    }
    console.log(this.dStatus,this.dOn);
}
// Localisation.prototype.updateDet = function(){
//     console.log(this.dStatus);
//     this.setDetOn();
//     console.log(this.dOn);
//     this.updateDetMarkers();
//     this.processNetwork();
//     this.processSrcAmp();
//     this.calcDetTimes();
//     this.calcAntFacs();
//     this.calcAntFacsSky();
//     this.updateSourceLabels();
//     this.updateLines();
//     this.calcProbSky();
//     this.moveHighlight();
//     this.updateHeatmap(this.hmap);
//     this.updateContoursT()
//     this.updateContoursPr();
//     return
// }
// ****************************************************************************
// ****************************************************************************
// ****************************************************************************

Localisation.prototype.setStyles = function(){
    // setup colours and linestyles
    var loc=this
    this.cValue = function(d) {return d.id;};
    this.styleDomains = ['H','L','V','K','I','G'];
    this.color = d3.scaleOrdinal().range(["#ff0000", "#009600","#0000ff","#ffb200","#b0dd8b","#222222"]).domain(this.styleDomains);
    this.getOpacity = function(d) {return 1}

    this.labels = {
        'ra':{'loc':'source','labstr':function(){return(loc.tl('%text.loc.source.ra%')+': '+
            parseInt(loc.src.ra)+'<sup>o</sup>')}},
        'dec':{'loc':'source','labstr':function(){return(loc.tl('%text.loc.source.dec%')+': '+
            parseInt(loc.src.dec)+'<sup>o</sup>')}},
        'lon':{'loc':'source','labstr':function(){return(loc.tl('%text.loc.source.lon%')+': '+
            parseInt(loc.src.lon)+'<sup>o</sup>')}},
        'lat':{'loc':'source','labstr':function(){return(loc.tl('%text.loc.source.lat%')+': '+
            parseInt(loc.src.lat)+'<sup>o</sup>')}},
        'posang':{'loc':'source','labstr':function(){return(loc.tl('%text.loc.source.posang%')+': '+
            parseInt(loc.src.posang)+'<sup>o</sup>')}},
        'inc':{'loc':'source','labstr':function(){return(loc.tl('%text.loc.source.inclination%')+': '+
            parseInt(loc.src.inc)+'<sup>o</sup>')}},
        'amp':{'loc':'source','labstr':function(){return(loc.tl('%text.loc.source.amplitude%')+': '+
            parseFloat(loc.src.amp).toPrecision(2))}},
        'gmst':{'loc':'source','labstr':function(){return(loc.tl('%text.loc.source.gmst%')+': '+
            parseInt(loc.src.gmst))},
            "icon":"img/time.svg"},
        // 'detr':{'type':'det','labstrdet':function(det){return det+' %text.loc.sensitivity%: '+loc.dataDet[loc.di[det]]['r+'].toPrecision(2)}}
    }
    // this.detCols={"H":"#e00","L":"#4ba6ff","V":"#9b59b6","K":"#ffb200"};
    this.legenddescs = {};
}
Localisation.prototype.tttextHmap = function(d){
    // var loc=this;// graph tooltip text
    if (this.debug){console.log(d)}
    return "<span class='ttCoord'>Lon/lat:"+this.skyarr.arr.lon[d]+","+this.skyarr.arr.lat[d]+"</span>"+
    // "<span class='ttPr'>Pr: "+this.skyarr.arr.Pr[d]+"</span>"+
    "<span class='ttpNet'>pNet: "+this.skyarr.arr.pNet[d]+"</span>"+
    "<span class='ttpNet'>FNet: "+this.skyarr.arr.FNet[d]+"</span>"+
    "<span class='ttpNet'>Tmatch: "+this.skyarr.arr.Tmatch[d]+"</span>";
}
Localisation.prototype.makeSky = function(){
    // create graph
    // console.log('makeSky');
    var loc=this;
    this.skycont=d3.select("div#skycontainer")
    this.svgcont = d3.select("div#skycontainer").append("div")
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
        .on("click",function(){
            raClick=loc.x2raScale(d3.event.pageX);
            decClick=loc.y2decScale(d3.event.pageY);
            loc.moveSrc(raClick,decClick);
            // console.log((d3.event.pageX)+"px",loc.x2raScale(d3.event.pageX));
            // console.log((d3.event.pageY)+"px",loc.y2decScale(d3.event.pageY));
        })
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
    loc.toLoad=7;
    loc.data=[];
    loc.optionsOn=false;
    loc.helpOn=false;
    loc.lengOn=false;

    loc.fileInDetDefault="json/detectors.json";
    loc.fileInDet = (loc.urlVars.detFile) ? loc.urlVars.detFile : loc.fileInDetDefault;
    loc.fileInWorld='json/world50m.json';
    loc.fileInSky='json/constellations.bounds.json';
    loc.fileInConst='json/constellations.json';
    loc.fileInConstLines='json/constellations.lines.json';
    // if (loc.urlVars.lang){
    //     lang=loc.urlVars.lang;
    // }else{lang=loc.defaults.lang}

    loc.loadLangDefault()
    loc.loadLang(this.langIn)
    // loc.langdict_default = loc.loadLang(loc.langDefault,true);

    d3.json(loc.fileInWorld, function(error, dataIn){
        if (error){alert("Fatal error loading input file: '"+loc.fileInWorld+"'. Sorry!")}
        loc.map=dataIn;
        loc.loaded++;
        if (loc.debug){console.log('loaded: '+loc.fileInWorld)}

        loc.skyarr.countries = topojson.feature(loc.map, loc.map.objects.countries),
        loc.skyarr.fullglobe={type:'Feature',geometry:{type:'Polygon',coordinates:[[[-179.999,0],[0,90],[179.999,0],[0,-90]]]}}
        loc.skyarr.land = topojson.feature(loc.map, loc.map.objects.land),
        // loc.skyarr.neighbors = topojson.neighbors(loc.map.objects.countries.geometries);
        loc.skyarr.projEq=d3.geoEquirectangular()
            .translate([0,loc.skyHeight/2])
            .fitExtent([[0,0],[loc.skyWidth,loc.skyHeight]],loc.skyarr.fullglobe)//.rotate([d2r(180),0,0])
        //call next functions
        if (loc.loaded==loc.toLoad){
            loc.whenLoaded();
        }else{
            if (loc.debug){console.log('not ready yet')}
        }
    });

    d3.json(loc.fileInSky, function(error, dataIn){
        if (error){alert("Fatal error loading input file: '"+loc.fileInSky+"'. Sorry!")}
        loc.skymap=dataIn;
        loc.loaded++;
        if (loc.debug){console.log('loaded: '+loc.fileInSky)}
        loc.skyarr.projEq=d3.geoEquirectangular()
            .translate([0,loc.skyHeight/2])
            .fitExtent([[0,0],[loc.skyWidth,loc.skyHeight]],loc.skymap)
        //call next functions
        if (loc.loaded==loc.toLoad){
            loc.whenLoaded();
        }else{
            if (loc.debug){console.log('not ready yet')}
        }
    });
    d3.json(loc.fileInConst, function(error, dataIn){
        if (error){alert("Fatal error loading input file: '"+loc.fileInConst+"'. Sorry!")}
        loc.constnames=dataIn;
        loc.loaded++;
        if (loc.debug){console.log('loaded: '+loc.fileInConst)}
        //call next functions
        if (loc.loaded==loc.toLoad){
            loc.constlist={}
            for (c in loc.constnames.features){
                loc.constlist[loc.constnames.features[c].id]=loc.constnames.features[c].properties.name;
            }
            loc.whenLoaded();
        }else{
            if (loc.debug){console.log('not ready yet')}
        }
    });
    d3.json(loc.fileInConstLines, function(error, dataIn){
        if (error){alert("Fatal error loading input file: '"+loc.fileInConstLines+"'. Sorry!")}
        loc.constLines=dataIn;
        loc.loaded++;
        if (loc.debug){console.log('loaded: '+loc.fileInConstLines)}
        //call next functions
        if (loc.loaded==loc.toLoad){
            loc.whenLoaded();
        }else{
            if (loc.debug){console.log('not ready yet')}
        }
    });

    // read in Detector data
    d3.json(loc.fileInDet, function(error, dataIn){
        if (error){alert("Fatal error loading input file: '"+loc.fileInDet+"'. Sorry!")}
        // sort data
        loc.dataDet = [];
        loc.di={};
        loc.dStatus={};
        loc.dOn={};
        loc.Ndet=0;
        i=0;
        for (d in dataIn){
            loc.processDet(dataIn[d])
            loc.dataDet.push(dataIn[d])
        }
        // loc.dataDet=loc.dataDet.sort(function(a,b){return a.id > b.id;});
        for (d in loc.dataDet){
            loc.di[loc.dataDet[d].id]=i;
            loc.dStatus[loc.dataDet[d].id]=parseFloat(loc.dataDet[d].on);
            if (loc.dStatus[loc.dataDet[d].id]==1){loc.Ndet+=1}
            loc.legenddescs[loc.dataDet[d].id]=loc.dataDet[d].name;
            i++;
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
Localisation.prototype.updateAxes = function(){
    // x-axis
    loc.svg.selectAll('.axis').remove()
    loc.svg.append("g")
        .attr("class", "ra-axis axis")
        .attr("transform", "translate("+loc.margin.left+"," +
            (loc.margin.top + loc.skyHeight) + ")");
    loc.svg.select(".ra-axis.axis").call(loc.raAxis)
    loc.svg.select(".ra-axis.axis").append("text")
        .attr("class", "ra-axis axis-label")
        .attr("fill","black")
        .attr("x", loc.skyWidth/2)
        .attr("y", 1.2*(1+loc.scl)+"em")
        .style("text-anchor", "middle")
        .style("font-size",(1+loc.scl)+"em")
        .text((loc.world)?loc.tl('%text.loc.map.lon%'):loc.tl('%text.loc.map.rightasc%'));

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
        .attr("fill","black")
        .attr("y", 6)
        .attr("x",-loc.skyHeight/2)
        .attr("dy", (-30*(1+loc.scl))+"px")
        .style("text-anchor", "middle")
        .style("font-size",(1+loc.scl)+"em")
        .text((loc.world)?loc.tl('%text.loc.map.lat%'):loc.tl('%text.loc.map.declination%'));

    d3.selectAll('.tick > line')
        .style('stroke','#ccc')
        .style('opacity',1)
}
Localisation.prototype.drawSky = function(){
    // draw graph
    var loc = this;
    // loc.setSvgScales();
    loc.makeSky();
    loc.svg.append("rect")
        .attr("id", "background")
        .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
        .attr("width",loc.skyWidth)
        .attr("height",loc.skyHeight)
        .attr("x",0)
        .attr("y",0);
    data = loc.dataDet;

    loc.updateAxes();

    // // draw legend
    // loc.legend = loc.svg.selectAll(".legend")
    //   .data(loc.dataDet)
    // .enter().append("g")
    //   .attr("class", function(d,i){return "legend "+d.id;})
    //   .attr("transform", function(d, i) { return "translate(0," +
    //     (i * 24) + ")"; });
    //
    // // draw legend colored circles
    // loc.legend.append("line")
    //     .attr("x1", loc.margin.left+12)
    //     .attr("y1", loc.margin.top+24)
    //     .attr("x2", loc.margin.left+24)
    //     .attr("y2", loc.margin.top+24)
    //     .style("stroke-width",Math.min(5,2./loc.sksc))
    //     .style("stroke",function(d){return d.color;})
    //     .attr("opacity",1);
    // loc.legend.append("line")
    //     .attr("x1", loc.margin.left+12)
    //     .attr("y1", loc.margin.top+24)
    //     .attr("x2", loc.margin.left+12)
    //     .attr("y2", loc.margin.top+12)
    //     .style("stroke-width",Math.min(5,2./loc.sksc))
    //     .style("stroke",function(d){return d.color;})
    //     .attr("opacity",1);
    //
    // // draw legend text
    // loc.legend.append("text")
    //   .attr("x", loc.margin.left + 36)
    //   .attr("y", loc.margin.top + 21)
    //   .attr("dy", ".35em")
    //   .attr("font-size","1.2em")
    //   .style("text-anchor", "start")
    //   .text(function(d) { return loc.tl(d.name);})

    loc.overlays = {
      'contoursT':{gid:"g-contoursT",shown:false,opacity:1},
      'contoursTmatch':{gid:"g-contoursTmatch",shown:false,opacity:1},
      'contoursPr':{gid:"g-contoursPr",shown:false,opacity:1},
      'heatmap-Pr':{gid:"g-heatmap-Pr",shown:false,opacity:1},
      'heatmap-pNet':{gid:"g-heatmap-pNet",shown:(this.hmap=='pNet'),opacity:1,cbar:false},
      'heatmap-FNet':{gid:"g-heatmap-FNet",shown:(this.hmap=='FNet'),opacity:0.9,
        cbar:true,min:0,max:1,tmin:'0%',tmax:'100%',name:'%text.loc.settings.FNet%'},
      'heatmap-aNet':{gid:"g-heatmap-FNet",shown:(this.hmap=='aNet'),opacity:0.9,
        cbar:true,min:-1,max:1,tmin:'+',tmax:'x',name:'%text.loc.settings.aNet%'},
      'heatmap-Tmatch':{gid:"g-heatmap-Tmatch",shown:true,opacity:1,cbar:false},
      'heatmap-Tall':{gid:"g-heatmap-Tall",shown:true,opacity:1,cbar:false},
      'overlay':{gid:"g-overlay",shown:false,opacity:0,cbar:false},
      'worldmap':{gid:"worldmap",shown:true,opacity:0.7,cbar:false},
      'bounds':{gid:"skymap-bounds",shown:true,opacity:0.7,cbar:false},
      'lines':{gid:"skymap-lines",shown:true,opacity:0.7,cbar:false},
      'names':{gid:"skymap-names",shown:true,opacity:0.7,cbar:false},
    }
    loc.cbarWidth=loc.skyWidth/2;
    loc.cbarHeight=20;
    loc.cbar=loc.svg.append("g")
        .attr("id","cbar-outer")
        .attr("transform","translate("+(loc.margin.left+loc.skyWidth/4)+","+(loc.margin.top+loc.skyHeight+80*loc.scl)+")")
        .style("opacity",1)
    loc.cbar.append("text")
        .attr("class","cbar-label cbar-label-left")
        .attr("id","cbar-label-left")
        .attr("x",-10)
        .attr("y",loc.cbarHeight)
        .attr("text-anchor","end")
        .text('')
    loc.cbar.append("text")
        .attr("class","cbar-label cbar-label-right")
        .attr("id","cbar-label-right")
        .attr("x",loc.cbarWidth + 10)
        .attr("y",loc.cbarHeight)
        .attr("text-anchor","start")
        .text('')
    loc.cbar.append("text")
        .attr("class","cbar-label cbar-label-title")
        .attr("id","cbar-label-title")
        .attr("x",loc.cbarWidth/2)
        .attr("y",loc.cbarHeight+30)
        .attr("text-anchor","middle")
        .text('')
    loc.cbar.append("rect")
        .attr("x",0).attr("y",0).attr("width",loc.cbarWidth).attr("height",loc.cbarHeight)
        .attr("stroke","black")
    // cbarCol=loc.skyarr[this.hmap].colHeatScale
    loc.cbarRes=100;
    loc.cbarRng=d3.range(0,1,1/loc.cbarRes)


    // draw Heatmap
    loc.skyarr.FNet={}
    loc.skyarr.FNet.gHeatmap=loc.svg.append("g")
        .attr("id",function(){return loc.overlays['heatmap-FNet'].gid})
        .attr("class","heatmap")
        .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
        .style("opacity",0)
    loc.skyarr.aNet=loc.skyarr.FNet;
    loc.updateHeatmap(this.hmap)
    loc.showOverlay('heatmap-'+this.hmap)

    // set projection
    loc.skyarr.contourScale=(loc.svgWidth-loc.margin.left-loc.margin.right)/loc.skyarr.nRA
    loc.skyarr.projI=d3.geoIdentity().scale(loc.skyarr.contourScale)

    // add world map
    worldmap = loc.svg.append("g")
	    .attr("id", "worldmap")
        .style("opacity",function(){return (loc.world)?1:0})
        .attr("transform", "translate("+loc.margin.left+","+(loc.margin.top)+")");
    worldmap.append("rect")
	    .attr("id", "ocean")
        .attr("width",loc.skyWidth)
        .attr("height",loc.skyHeight)
        .attr("x",0)
        .attr("y",0)
        .attr("opacity",loc.overlays.worldmap.opacity);
    worldmap.selectAll(".country")
	    .data(loc.skyarr.countries.features)
	    .enter().append("path")
	    .attr("class", "country")
	    .attr("d", d3.geoPath().projection(loc.skyarr.projEq))
        .attr("opacity",loc.overlays.worldmap.opacity);

    // add sky map
    skymap=loc.svg.append("g")
	    .attr("id", "skymap")
        .style("fill-opacity","0")
        .style("opacity",function(){return (loc.world)?0:1;})
        .attr("transform", "translate("+loc.margin.left+","+(loc.margin.top)+")")
    skymap.append("g")
	    .attr("id", "skymap-lines")
        .style("fill-opacity","0")
        .style("opacity",loc.overlays.lines.opacity)
    .selectAll(".constlines")
	    .data(loc.constLines.features)
	    .enter().append("path")
	    .attr("class", "constlines")
	    .attr("d", d3.geoPath().projection(loc.skyarr.projEq));
    skymap.append("g")
	    .attr("id", "skymap-names")
        .style("fill-opacity","0")
        .style("opacity",loc.overlays.names.opacity)
    .selectAll(".constname")
	    .data(loc.constnames.features)
	    .enter().append("text")
	    .attr("class", "constname")
        .attr("fill","black")
        .attr("x", function(d){x=loc.skyarr.projEq(d.geometry.coordinates)[0];console.log(d,x);return x;})
        .attr("y", function(d){y=loc.skyarr.projEq(d.geometry.coordinates)[1];console.log(d,y);return y;})
        .style("text-anchor", "middle")
        .style("font-size",(1*loc.scl)+"em")
        .text(function(d){return d.properties.desig})
    skymap.append("g")
	    .attr("id", "skymap-bounds")
        .style("fill-opacity","0")
        .style("opacity",loc.overlays.bounds.opacity)
    .selectAll(".constellation")
	    .data(loc.skymap.features)
	    .enter().append("path")
	    .attr("class", "constellation")
	    .attr("d", d3.geoPath().projection(loc.skyarr.projEq));

    // draw Heatmap for all rings
    loc.skyarr['Tall']={}
    loc.skyarr['Tall'].gHeatmap=loc.svg.append("g")
        .attr("id",function(){return loc.overlays['heatmap-Tall'].gid})
        .attr("class","heatmap")
        .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
        .style("opacity",0)
    loc.updateHeatmap('Tall')
    loc.showOverlay('heatmap-Tall')

    loc.skyarr['Tmatch']={}
    loc.skyarr['Tmatch'].gHeatmap=loc.svg.append("g")
        .attr("id",function(){return loc.overlays['heatmap-Tmatch'].gid})
        .attr("class","heatmap")
        .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
        .style("opacity",0)
    loc.updateHeatmap('Tmatch')
    loc.showOverlay('heatmap-Tmatch')

    // draw contours (dt)
    // loc.gContourT=loc.svg.append("g")
    //     .attr("id",function(){return loc.overlays.contoursT.gid})
    //     .attr("class","contoursT")
    //     .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
    //     .style("opacity",0)
    // loc.updateContoursT();
    // loc.showOverlay('contoursT');

    // loc.gContourTmatch=loc.svg.append("g")
    //     .attr("id",function(){return loc.overlays.contoursTmatch.gid})
    //     .attr("class","contoursTmatch")
    //     .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
    //     .style("opacity",0)
    // loc.updateContoursTmatch();

    // loc.showOverlay('contoursTmatch');

    // draw contours (Pr)
    // loc.gContourPr=loc.svg.append("g")
    //     .attr("id",function(){return loc.overlays.contoursPr.gid})
    //     .attr("class","contoursPr")
    //     .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
    //     .style("opacity",0)
    // loc.updateContoursPr();
    // loc.showOverlay('contoursPr')

    // loc.skyarr.overlay={};
    // loc.skyarr.overlay.gHeatmap=loc.svg.append("g")
    //     .attr("id",function(){return loc.overlays['overlay'].gid})
    //     .attr("class","heatmap")
    //     .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
    //     .style("opacity",0)
    // loc.updateHeatmap("overlay")
    // // loc.showOverlay("heatmap-overlay")

    // draw detectors
    detGroup = loc.svg.append("g").attr("class","g-dets")
    loc.updateDetMarkers();

    // add source circle
    loc.srcMarker=loc.svg.append("g")
        .attr("id","g-source")
        .attr("class","marker srcmarker")
        // .attr("transform","translate("+(loc.margin.left+loc.raScale(loc.mod360(loc.src.ra)))+","+
        //     (loc.margin.top+loc.decScale(loc.src.dec))+") rotate("+loc.src.posang+")")
        .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
    loc.srcMarker.append("circle")
        .attr("id","BG-src")
        .attr("class","BG-src")
        .attr("opacity",1)
        .attr("cx",function(){return loc.src2xy('ctr')[0]})
        .attr("cy",function(){return loc.src2xy('ctr')[1]})
        .attr("r",10)
        .style("fill","white")
        .style("fill-opacity",0.5)
        // .style("stroke","black")
        // .style("stroke-width",3)
    loc.srcMarker.append("circle")
        .attr("id","dot-src")
        .attr("class","dot-src")
        .attr("opacity",1)
        .attr("cx",function(){return loc.src2xy('ctr')[0]})
        .attr("cy",function(){return loc.src2xy('ctr')[1]})
        .attr("r",5)
        .style("fill","white")
        .style("fill-opacity",0)
        .style("stroke","black")
        .style("stroke-width",3)
    loc.srcMarker.append("line")
        .attr("id","line-x-src")
        .attr("class",'line-src')
        .attr("opacity","1")
        .style("stroke","black")
        .style("stroke-width",1)
        .attr("x1",function(){return loc.src2xy('x-')[0]})
        .attr("y1",function(){return loc.src2xy('x-')[1]})
        .attr("x2",function(){return loc.src2xy('x+')[0]})
        .attr("y2",function(){return loc.src2xy('x+')[1]})
    loc.srcMarker.append("line")
        .attr("id","line-y-src")
        .attr("class",'line-src')
        .attr("opacity","1")
        .style("stroke","black")
        .style("stroke-width",1)
        .attr("x1",function(){return loc.src2xy('y-')[0]})
        .attr("y1",function(){return loc.src2xy('y-')[1]})
        .attr("x2",function(){return loc.src2xy('y+')[0]})
        .attr("y2",function(){return loc.src2xy('y+')[1]})
    loc.srcMarker.append("circle")
        .attr("id","FG-src")
        .attr("class","FG-src")
        .attr("opacity",0)
        .attr("cx",function(){return loc.src2xy('ctr')[0]})
        .attr("cy",function(){return loc.src2xy('ctr')[1]})
        .attr("r",10)
        .style("fill","white")
        .on("mouseover",function(){
            loc.showTooltipManual(loc.tl('%tooltip.loc.sourceloc%'))
        })
        .on("mouseout",function(){loc.hideTooltipManual()})
        // .style("stroke","black")
        // .style("stroke-width",3)


    // add colour bar

    // add Detector status
    this.snrRange=d3.scaleLinear().range([0,100]).domain([-2,2]).clamp(true)
    d3.select("#info-network-title")
        .html(this.tl("%text.loc.info.network-title%"))
    d3.select("#info-det-title")
        .html(this.tl("%text.loc.info.detectors-title%"))

    loc.updateDetResults();

    // add info icon
    infoClass = (this.panels.info.status) ? "graph-icon" : "graph-icon hidden";
    d3.select("div#skycontainer").append("div")
        .attr("id","info-icon")
        .attr("class",infoClass)
        .style("right",loc.margin.right + (loc.margin.top+10)*(d3.selectAll('.graph-icon').nodes().length-1))
        .style("top",0)
        .style("width",loc.margin.top)
        .style("height",loc.margin.top);
    d3.select("div#skycontainer > #info-icon").on("mouseover", function() {
              loc.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              loc.tooltip.html(loc.tl('%tooltip.loc.showinfo%'))
                 .style("left", (d3.event.pageX + 10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .style("width","auto")
                 .style("height","auto");
        })
        .on("mouseout", function() {
            loc.tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
          //   document.getElementById("effcontainer").style.opacity=0.;
        })
    d3.select("div#skycontainer > #info-icon").append("img")
        .attr("src","img/info.svg")
        .on("click",function(){loc.showInfo()});

    // add settings icon
    settingsClass = (this.panels.settings.status) ? "graph-icon" : "graph-icon hidden";
    this.settingsouter = d3.select('#settings-outer');
    d3.select("div#skycontainer").append("div")
        .attr("id","settings-icon")
        .attr("class",settingsClass)
        .style("right",loc.margin.right + (loc.margin.top+10)*(d3.selectAll('.graph-icon').nodes().length-1))
        .style("top",0)
        .style("width",loc.margin.top)
        .style("height",loc.margin.top);
    d3.select("div#skycontainer > #settings-icon").on("mouseover", function() {
              loc.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              loc.tooltip.html(loc.tl('%tooltip.loc.showsettings%'))
                 .style("left", (d3.event.pageX + 10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .style("width","auto")
                 .style("height","auto");
        })
        .on("mouseout", function() {
            loc.tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
          //   document.getElementById("effcontainer").style.opacity=0.;
        })
    d3.select("div#skycontainer > #settings-icon").append("img")
        .attr("src","img/settings.svg")
        .on("click",function(){loc.showSettings()});
    this.settingsouter.select("#settings-close")
        .on("click",function(){loc.hideSettings();});

    //add help icon
    helpClass = (this.panels.help.status) ? "graph-icon" : "graph-icon hidden";
    this.helpouter = d3.select('#help-outer')
    d3.select("div#skycontainer").append("div")
        .attr("id","help-icon")
        .attr("class",helpClass)
        .style("right",loc.margin.right+(loc.margin.top+10)*(d3.selectAll('.graph-icon').nodes().length-1))
        .style("top",0)
        .style("width",40*loc.ysc)
        .style("height",40*loc.ysc);
    d3.select("div#skycontainer > #help-icon").on("mouseover", function(d) {
              loc.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              loc.tooltip.html(loc.tl('%tooltip.loc.showhelp%'))
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
    d3.select("div#skycontainer > #help-icon").append("img")
        .attr("src","img/help.svg")
        .on("click",function(){loc.showHelp();});
    this.helpouter
        .style("top","200%");
    this.helpouter.select("#help-close")
        .on("click",function(){loc.hideHelp();});

    //add network icon
    // networkClass = (this.panels.network.status) ? "graph-icon" : "graph-icon hidden";
    // this.networkouter = d3.select('#network-outer')
    // d3.select("div#skycontainer").append("div")
    //     .attr("id","network-icon")
    //     .attr("class",networkClass)
    //     .style("right",loc.margin.right+(loc.margin.top+10)*(d3.selectAll('.graph-icon').nodes().length-1))
    //     .style("top",0)
    //     .style("width",40*loc.ysc)
    //     .style("height",40*loc.ysc);
    // d3.select("div#skycontainer > #network-icon").on("mouseover", function(d) {
    //           loc.tooltip.transition()
    //              .duration(200)
    //              .style("opacity", .9);
    //           loc.tooltip.html(loc.tl('%tooltip.loc.shownetwork%'))
    //              .style("left", (d3.event.pageX + 10) + "px")
    //              .style("top", (d3.event.pageY-10) + "px")
    //              .style("width","auto")
    //              .style("height","auto");
    //     })
    //     .on("mouseout", function(d) {
    //         loc.tooltip.transition()
    //              .duration(500)
    //              .style("opacity", 0);
    //       //   document.getElementById("effcontainer").style.opacity=0.;
    //     })
    // d3.select("div#skycontainer > #network-icon").append("img")
    //     .attr("src","img/detector.svg")
    //     .on("click",function(){loc.showNetwork();});
    // this.networkouter
    //     .style("top","200%");
    // this.networkouter.select("#network-close")
    //     .on("click",function(){loc.hideNetwork();});

    //add source icon
    sourceClass = (this.panels.source.status) ? "graph-icon" : "graph-icon hidden";
    this.sourceouter = d3.select('#source-outer')
    d3.select("div#skycontainer").append("div")
        .attr("id","source-icon")
        .attr("class",sourceClass)
        .style("right",loc.margin.right+(loc.margin.top+10)*(d3.selectAll('.graph-icon').nodes().length-1))
        .style("top",0)
        .style("width",40*loc.ysc)
        .style("height",40*loc.ysc);
    d3.select("div#skycontainer > #source-icon").on("mouseover", function(d) {
              loc.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              loc.tooltip.html(loc.tl('%tooltip.loc.showsource%'))
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
    d3.select("div#skycontainer > #source-icon").append("img")
        .attr("src","img/source.svg")
        .on("click",function(){loc.showSource();});
    this.sourceouter
        .style("top","200%");
    this.sourceouter.select("#source-close")
        .on("click",function(){loc.hideSource();});


    // add language button
    langClass = (this.langOn) ? "graph-icon" : "graph-icon hidden";
    this.langouter = d3.select('#lang-outer')
    d3.select("div#skycontainer").append("div")
        .attr("id","lang-icon")
        .attr("class",langClass)
        .style("right",loc.margin.right+(loc.margin.top+10)*(d3.selectAll('.graph-icon').nodes().length-1))
        .style("top",0)
        .style("width",40*loc.ysc)
        .style("height",40*loc.ysc);
    d3.select("div#skycontainer > #lang-icon").on("mouseover", function(d) {
              loc.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              loc.tooltip.html(loc.tl('%tooltip.loc.showlang%'))
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
    d3.select("div#skycontainer > #lang-icon").append("img")
        .attr("src","img/lang.svg")
        .on("click",function(){console.log('showing lang panel');loc.showLang();});
    // this.langbg.on("click",function(){loc.hideLang();});
    this.langouter
        .style("top","200%");
    this.langouter.select("#lang-close")
        .on("click",function(){loc.hideLang();});
    //
    // // add loading icon
    // this.langouter = d3.select('#loading-outer')
    // d3.select("div#skycontainer").append("div")
    //     .attr("id","loading-icon")
    //     .attr("class","loading-icon isloading")
    //     .style("right",loc.margin.right+5*(loc.margin.top+10))
    //     .style("top",0)
    //     .style("height",40*loc.ysc);
    // d3.select("div#skycontainer > #loading-icon").append("div")
    //     .html(loc.tl("%text.plotloc.loading%"));
    // d3.select("div#skycontainer > #loading-icon").append("img")
    //     .attr("src","img/loading.gif");
    // this.langbg.on("click",function(){loc.hideLang();});

    // loc.uncloseContours();

}
Localisation.prototype.showLoading = function(){
    var loc=this;
    this.isLoading=true;
    d3.select('.loading')
        .style("visibility","visible")
        // .style("max-height","100%")
        // .transition().duration(500)
        // .style("opacity","1")

    // document.getElementById("loading").style.add("isLoading")
    // document.getElementById("loading").classList.remove("notLoading")
    // d3.select("#loading").className
    //     .style("max-height","100%")
    //     .style("left",function(){return ((loc.fullSkyWidth - this.offsetWidth)/2)})
    //     .style("top",function(){return ((loc.fullSkyHeight - this.offsetHeight)/2)})
    //     .transition().duration(500)
    //         .style("opacity",1);

    // d3.select("#svg-container")
    //     .transition().duration(500)
    //     .style("opacity",0.25);
    // console.log('callback',callback)
    // if(callback){callback}
}
Localisation.prototype.hideLoading = function(){
    this.isLoading=false;
    // d3.select('.loading')
    //     // .transition().delay(500).duration(500)
    //     .style("opacity","0")
    d3.select('.loading')
        .style("visibility","hidden")
    document.getElementById("loading").classList.remove("isLoading")
    // document.getElementById("loading").classList.add("notLoading")
    // d3.select("#loading")
    //     .transition().duration(500)
    //     .style("opacity",0)
    //     .style("max-height",0);

    // d3.select("#svg-container")
    //     .transition().duration(500)
    //     .style("opacity",1);
}
Localisation.prototype.colourWorldMap = function(){
    if (this.world){
        d3.select('#ocean').transition().duration(500).style('fill-opacity',1)
        d3.select('#worldmap').transition().duration(500).style('fill-opacity',1)
    }
}
Localisation.prototype.uncolourWorldMap = function(){
    if (this.world){
        d3.select('#ocean').transition().duration(500).style('fill-opacity',0)
        d3.select('#worldmap').transition().duration(500).style('fill-opacity',0)
    }
}
Localisation.prototype.updateDetMarkers = function(){
    var loc=this;
    this.detMarkers=detGroup.selectAll(".detmarker")
        .data(loc.dataDet)
    loc.detMarkers.selectAll("line.detline-x")
        .attr("x1", function(d){return loc.det2xy(d,'ctr')[0]})
        .attr("y1", function(d){return loc.det2xy(d,'ctr')[1]})
        .attr("x2", function(d){return loc.det2xy(d,'xarm')[0]})
        .attr("y2", function(d){return loc.det2xy(d,'xarm')[1]})
        .attr("cursor","default")
        .style("opacity",function(d){return ((loc.dStatus[d.id]==1)? 1 :0.5)})
        .attr("stroke-dasharray",function(d){console.log('updating '+d.id+':'+loc.dStatus[d.id]+' '+this);return ((loc.dStatus[d.id]==1)? 0 :0)})
        .style("stroke", function(d){return d.color})
        .style("stroke-width",Math.min(5,2./loc.sksc));
    loc.detMarkers.selectAll("line.detline-y")
        .attr("x1", function(d){return loc.det2xy(d,'ctr')[0]})
        .attr("y1", function(d){return loc.det2xy(d,'ctr')[1]})
        .attr("x2", function(d){return loc.det2xy(d,'yarm')[0]})
        .attr("y2", function(d){return loc.det2xy(d,'yarm')[1]})
        .attr("cursor","default")
        .attr("opacity",function(d){return ((loc.dStatus[d.id]==1)? 1 :0.5)})
        .attr("stroke-dasharray",function(d){return ((loc.dStatus[d.id]==1)? 0 :0)})
        .style("stroke", function(d){return d.color})
        .style("stroke-width",Math.min(5,2./loc.sksc));
    loc.detMarkers.selectAll("circle.detcircle")
        .attr("cx", function(d){return loc.det2xy(d,'middle')[0]})
        .attr("cy", function(d){return loc.det2xy(d,'middle')[1]})
        .attr("r", function(d){return loc.lenScale(Math.max(d.length,2))})
        .attr("cursor","default")
        .attr("opacity",function(d){return ((loc.dStatus[d.id]==1)? 1 :0.5)})
        .attr("stroke-opacity",0)
        .style("fill", "#fff");
    this.detGroups=this.detMarkers.enter().append("g")
        .attr("class", "detmarker marker")
        .attr("id", function(d){return "detmarker-"+d.id;})
        // .attr("transform", function(d){return "translate("+(loc.margin.left+loc.lonScale(loc.lonMod(d.lon)))+","+
        //     (loc.margin.top+loc.decScale(d.lat))+") rotate("+d.ang+")";})
        .attr("transform", "translate("+loc.margin.left+","+
            loc.margin.top+")")
    loc.detGroups.append("circle")
        .attr("class","detcircle")
        .attr("id",function(d){return "detcircle detcircle-"+d.id;})
        .attr("cx", function(d){return loc.det2xy(d,'middle')[0]})
        .attr("cy", function(d){return loc.det2xy(d,'middle')[1]})
        .attr("r", function(d){return loc.lenScale(Math.max(d.length,2))})
        .attr("cursor","default")
        .attr("opacity",function(d){return ((loc.dStatus[d.id]==1)? 1 :0.5)})
        .attr("stroke-opacity",0)
        .style("fill", "#fff");
    loc.detGroups.append("line")
        .attr("class","detline detline-x")
        .attr("id", function(d){return "detline detline-x-"+d.id;})
        .attr("x1", function(d){return loc.det2xy(d,'ctr')[0]})
        .attr("y1", function(d){return loc.det2xy(d,'ctr')[1]})
        .attr("x2", function(d){return loc.det2xy(d,'xarm')[0]})
        .attr("y2", function(d){return loc.det2xy(d,'xarm')[1]})
        .attr("cursor","default")
        .style("opacity",function(d){return ((loc.dStatus[d.id]==1)? 1 :0.5)})
        .attr("stroke-dasharray",function(d){console.log('updating '+d.id+':'+loc.dStatus[d.id]+' '+this);return ((loc.dStatus[d.id]==1)? 0 :1)})
        .style("stroke", function(d){return d.color})
        .style("stroke-width",Math.min(5,2./loc.sksc));
    loc.detGroups.append("line")
        .attr("class","detline detline-y")
        .attr("id",function(d){return "detline detline-y-"+d.id;})
        .attr("x1", function(d){return loc.det2xy(d,'ctr')[0]})
        .attr("y1", function(d){return loc.det2xy(d,'ctr')[1]})
        .attr("x2", function(d){return loc.det2xy(d,'yarm')[0]})
        .attr("y2", function(d){return loc.det2xy(d,'yarm')[1]})
        .attr("cursor","default")
        .attr("opacity",function(d){return ((loc.dStatus[d.id]==1)? 1 :0.5)})
        .attr("stroke-dasharray",function(d){return ((loc.dStatus[d.id]==1)? 0 :1)})
        .style("stroke", function(d){return d.color})
        .style("stroke-width",Math.min(5,2./loc.sksc));
    loc.detGroups.append("circle")
        .attr("class","detcircle-overlay")
        .attr("id",function(d){return "detcircle-overlay detcircle-overlay-"+d.id;})
        .attr("cx", function(d){return loc.det2xy(d,'middle')[0]})
        .attr("cy", function(d){return loc.det2xy(d,'middle')[1]})
        .attr("r", function(d){return loc.lenScale(Math.max(d.length,2))})
        .attr("cursor","default")
        .attr("opacity","0")
        .attr("stroke-opacity",0)
        .style("fill", "#fff")
        .on("mouseover",function(d){
            loc.showTooltipManual(loc.tl(d.name+' ('+((d.on)?'%text.loc.network.on%':'%text.loc.network.off%')+')'))
        })
        .on("mouseout",function(d){loc.hideTooltipManual();});
    // loc.detGroups.merge(loc.detMarkers);
    // loc.detGroups=this.detMarkers.enter()
}

Localisation.prototype.moveHighlight = function(){
    var loc=this;
    console.log(loc.src.ra,loc.src.dec)
    // move highlight circle
    this.svg.select("#dot-src")
        .transition().duration(500)
        .attr("cx",function(d){return loc.src2xy('ctr')[0]})
        .attr("cy",function(d){return loc.src2xy('ctr')[1]})
    this.svg.select("#bg-src")
        .transition().duration(500)
        .attr("cx",function(d){return loc.src2xy('ctr')[0]})
        .attr("cy",function(d){return loc.src2xy('ctr')[1]})
    this.svg.select("#line-x-src")
        .transition().duration(500)
        .attr("x1",function(){return loc.src2xy('x-')[0]})
        .attr("y1",function(){return loc.src2xy('x-')[1]})
        .attr("x2",function(){return loc.src2xy('x+')[0]})
        .attr("y2",function(){return loc.src2xy('x+')[1]})
    this.svg.select("#line-y-src")
        .transition().duration(500)
        .attr("x1",function(){return loc.src2xy('y-')[0]})
        .attr("y1",function(){return loc.src2xy('y-')[1]})
        .attr("x2",function(){return loc.src2xy('y+')[0]})
        .attr("y2",function(){return loc.src2xy('y+')[1]})
}
Localisation.prototype.updateHeatmap = function(dataIn){
    // update heatmap
    nearVals=[];
    nearValsRows=[]
    if (dataIn=="Pr"){
        for (i=-1;i<=1;i++){
            row=[];
            for (j=-1;j<=1;j++){
                row.push(loc.skyarr.arr.PrCumul[loc.skyarr.radec2p(loc.src.ra+i*loc.skyarr.dRA,loc.src.dec+j*loc.skyarr.dDec)]);
            }
            nearVals.push(row);
            nearValsRows.push(Math.max.apply(Math,row))
        }
        this.skyarr.Pr.srcThresh=Math.max.apply(Math,nearValsRows);
        loc.skyarr.Pr.hmapthreshold=Math.max(0.1,this.skyarr.Pr.srcThresh);
    }else if (dataIn=="pNet"){
        loc.skyarr.pNet.hmapthreshold=5;
        loc.skyarr[dataIn].opHeat=d3.scaleLinear().range([0,1])
            .domain([0,1])
    }else if (dataIn=="FNet"){
        loc.skyarr.FNet.hmapthreshold=5;
        loc.skyarr[dataIn].opHeat=function(d){return 1;};
        // loc.skyarr[dataIn].opHeat=d3.scaleLinear().range([0,1]).domain([0,1])
        loc.skyarr[dataIn].colHeatScale=d3.scaleSequential(d3.interpolateInferno).domain([0, 1]);
        loc.skyarr[dataIn].colHeat=function(p){
            val=loc.skyarr.arr[dataIn][p];
            return loc.skyarr[dataIn].colHeatScale(val);
        }
    }else if (dataIn=="aNet"){
        loc.skyarr.FNet.hmapthreshold=5;
        loc.skyarr[dataIn].opHeat=function(d){return 1;};
        // loc.skyarr[dataIn].opHeat=d3.scaleLinear().range([0,1]).domain([0,1])
        loc.skyarr[dataIn].colHeatScale=d3.scaleSequential(d3.interpolateRdBu).domain([-1,1]);
        loc.skyarr[dataIn].colHeat=function(p){
            val=Math.log10(loc.skyarr.arr[dataIn][p]);
            return loc.skyarr[dataIn].colHeatScale(val);
        }
    }else if (dataIn=="Tmatch"){
        loc.skyarr.Tmatch.hmapthreshold=0.5;
        loc.skyarr[dataIn].opHeat=function(d){
            if (loc.Ndet<=1){return 0}
            else{ return d3.scaleLinear().range([0,1])
            .domain([0.5,1]).clamp(true)(d)}
        }
        loc.skyarr[dataIn].colHeat=function(d){return "#fff";};
    }else if (dataIn=="Tall"){
        loc.skyarr.Tall.hmapthreshold=0.5;
        loc.skyarr.Tall.opHeat=function(d){
            if (loc.Ndet<=1){return 0}
            else{ return d3.scaleLinear().range([0,1])
            .domain([0.5,0.5*loc.Ndet*(loc.Ndet-1)]).clamp(true)(d)}
        }
        loc.skyarr.Tall.colHeat=function(d){return "#fff";};
    }else if (dataIn=="overlay"){
        loc.skyarr.overlay.opHeat=function(d){return 0;};
        loc.skyarr.overlay.colHeat=function(d){return "#fff";};
    }
    if (dataIn=="overlay"){
        loc.skyarr[dataIn].hmapfiltPix=loc.skyarr.arr.pix;
    }else if ((dataIn=="FNet")|(dataIn=="aNet")){
        if (loc.Ndet>0){loc.skyarr[dataIn].hmapfiltPix=loc.skyarr.arr.pix;}
        else{loc.skyarr[dataIn].hmapfiltPix=[]}
    }else if (dataIn!="none"){
        console.log(dataIn)
        loc.skyarr[dataIn].hmapfiltPix=loc.filterSky(dataIn,'hmap',loc.skyarr[dataIn].hmapthreshold);
        if (dataIn=='Pr'){
            loc.skyarr.Pr.opHeat=d3.scaleLinear().range([0,0.7])
                    .domain([(loc.skyarr.Pr.hmapfiltPix.length>1)?loc.skyarr.Pr.hmapminFilt:0,loc.skyarr.Pr.hmapmaxFilt])
        }
    }
    // if (dataIn=='Pr'){
    //     loc.skyarr.Pr.opHeat=d3.scaleLinear().range([0,0.7])
    //         .domain([(loc.skyarr.Pr.hmapfiltPix.length>1)?loc.skyarr.Pr.hmapminFilt:0,loc.skyarr.Pr.hmapmaxFilt])
    // }else{
    //     loc.skyarr[dataIn].opHeat=d3.scaleLinear().range([0,1])
    //         .domain([0,1])
    // }
    if (dataIn!="none"){
        console.log(dataIn,loc.skyarr[dataIn],loc.skyarr[dataIn].heatmap)
        loc.skyarr[dataIn].heatmap = loc.skyarr[dataIn].gHeatmap.selectAll(".hm-rect")
            .data(loc.skyarr[dataIn].hmapfiltPix)
        loc.skyarr[dataIn].heatmap.exit()
            .attr("class","hm-rect old")
            .transition().duration(500)
            .style("fill-opacity",0).remove()
        loc.skyarr[dataIn].heatmap.enter().append("rect")
            .attr("class","hm-rect new")
            // .on("mouseover",function(d){
            //     loc.tooltip
            //        .style("opacity", .9);
            //     loc.tooltip.html(loc.tttextHmap(d))
            //        .style("left", (d3.event.pageX + 10) + "px")
            //        .style("top", (d3.event.pageY-10) + "px")
            //        .style("width","auto")
            //        .style("height","auto");
            // })
            // .on("mouseout", function(d) {
            //     loc.tooltip.style("opacity", 0);
            // })
        .merge(loc.skyarr[dataIn].heatmap)
            .transition().duration(500)
            .attr("x",function(d){return loc.rect2xy(d)[0];})
            .attr("y",function(d){return loc.rect2xy(d)[1];})
            .attr("width",function(d){return loc.rect2xy(d)[2];})
            .attr("height",function(d){return loc.rect2xy(d)[3];})
            .style("fill",function(d){return loc.skyarr[dataIn].colHeat(d)})
            .style("fill-opacity",function(d){
                if (dataIn=="overlay"){
                    return 0
                }else{
                    return (loc.skyarr[dataIn].opHeat(loc.skyarr.arr[dataIn][d]));
                }
            })

        // update colour bar
        if (loc.overlays['heatmap-'+dataIn].cbar){
            loc.cbar.selectAll(".cbar-el")
                .data(loc.cbarRng)
            .enter().append("rect")
                .attr("class","cbar-el")
                .attr("x",function(d){return loc.cbarWidth*d})
                .attr("y",0)
                .attr("width",(loc.cbarWidth/loc.cbarRes))
                .attr("height",loc.cbarHeight)
            .merge(loc.cbar.selectAll(".cbar-el"))
                .attr("fill",function(d){
                    colDom=loc.skyarr[loc.hmap].colHeatScale.domain()
                    colx=colDom[0] + d*(colDom[1]-colDom[0]);
                    console.log(d,colx,loc.skyarr[loc.hmap].colHeatScale(colx))
                    return loc.skyarr[loc.hmap].colHeatScale(colx);
                })
            loc.cbar.select(".cbar-label-left")
                .text(loc.tl(loc.overlays['heatmap-'+dataIn].tmin))
            loc.cbar.select(".cbar-label-right")
                .text(loc.tl(loc.overlays['heatmap-'+dataIn].tmax))
            loc.cbar.select(".cbar-label-title")
                .text(loc.tl(loc.overlays['heatmap-'+dataIn].name))
        }
    }
}
Localisation.prototype.updateContoursT = function(){
    loc.skyarr.fullcontour={type:'Feature',
        geometry:{type:'Polygon',coordinates:[[
            [0,loc.skyarr.nDec/2],
            [loc.skyarr.nRA/2,0],
            [loc.skyarr.nRA,loc.skyarr.nDec/2],
            [loc.skyarr.nRA/2,loc.skyarr.nDec/2]
        ]]}}
    loc.skyarr.projCont=d3.geoEquirectangular()
        .translate([0,loc.skyHeight])
        .fitExtent([[0,0],[loc.skyWidth,loc.skyHeight]],loc.skyarr.fullcontour)//.rotate([d2r(180),0,0])
    console.log(loc.src.dt,loc.skyarr.arr.dt);
    for (dd in loc.src.dt){
        loc.skyarr[dd]={}
        // loc.skyarr.dtCont=[
        //     Math.min(loc.src.dt[dd]-5e-4,loc.skyarr.mindt[dd]),
        //     loc.src.dt[dd],
        //     Math.max(loc.src.dt[dd]+5e-4,loc.skyarr.maxdt[dd])]
        dii=loc.di[dd[0]];
        dij=loc.di[dd[1]];
        contWidth=this.contourWidth(dd)
        console.log('contour Width',dd,contWidth)
        loc.skyarr.dtCont=[
            Math.max(loc.src.dt[dd]-(contWidth),loc.skyarr.mindt[dd]+5.e-6),
            loc.src.dt[dd],
            Math.min(loc.src.dt[dd]+(contWidth),loc.skyarr.maxdt[dd]-5.e-6)]
        loc.skyarr.colCont = d3.scaleOrdinal().range([loc.dataDet[loc.di[dd[0]]].color,'#000',loc.dataDet[loc.di[dd[1]]].color])
        loc.skyarr.opCont = d3.scaleOrdinal().range([0.7,0,0.7])
        opMult=loc.dStatus[dd[0]]*loc.dStatus[dd[1]]
        // console.log(dd,loc.dStatus[dd[0]],loc.dStatus[dd[1]],opMult)

        // loc.gContour.selectAll(".contour-"+dd).remove()

        // loc.skyarr.contoursdt=loc.editContours(d3.contours()
        //     .size([loc.skyarr.nRA,loc.skyarr.nDec])
        //     // .size([360,180])
        //     .thresholds(loc.skyarr.dtCont)
        //     (loc.skyarr.arr.dt[dd]),true,dd)
        loc.skyarr[dd].contoursdt=loc.editContours2(d3.contours()
            .size([loc.skyarr.nRA,loc.skyarr.nDec])
            .thresholds(loc.skyarr.dtCont)
            (loc.skyarr.arr.dt[dd]),true,dd)
        for (c=0;c<loc.skyarr[dd].contoursdt.length;c++){
            path=d3.geoPath().projection(loc.skyarr.projI)(loc.skyarr[dd].contoursdt[c]);
            if (loc.skyarr[dd].contoursdt[c].hasEdge){
                loc.skyarr[dd].contoursdt[c].path=path.replace('Z','');
            }else{
                loc.skyarr[dd].contoursdt[c].path=path;
            }
        }
        loc.skyarr[dd].dtcontours = loc.gContourT.selectAll(".contourT-"+dd)
            .data(loc.skyarr[dd].contoursdt)
        loc.skyarr[dd].dtcontours.exit()
            .transition().duration(500)
            .style("opacity",0).remove()
        loc.skyarr[dd].dtcontours
            .transition().duration(500).ease(d3.easeExp)
            .attr("d", d3.geoPath().projection(loc.skyarr.projEq))
            .style("stroke-opacity",function(d){return (loc.skyarr.opCont(d.value)*opMult)})
        loc.skyarr[dd].dtcontours.enter().append("path")
            // .attr("d", d3.geoPath(d3.geoEquirectangular().scale(loc.skyarr.contourScale)))
            .style("fill-opacity",0)
            .style("stroke",function(d){return loc.skyarr.colCont(d.value)})
            .style("stroke-width","3")
            .attr("class","contourT contourT-"+dd)
            // .attr("d", function(d){return d.path})
            .attr("d",d3.geoPath().projection(loc.skyarr.projEq))
            // .on("mouseover",function(d){
            //     loc.tooltip
            //        .style("opacity", .9);
            //     loc.tooltip.html(loc.tttextHmap(d))
            //        .style("left", (d3.event.pageX + 10) + "px")
            //        .style("top", (d3.event.pageY-10) + "px")
            //        .style("width","auto")
            //        .style("height","auto");
            // })
            // .on("mouseout", function(d) {
            //     loc.tooltip.style("opacity", 0);
            // })
            .transition().duration(500).ease(d3.easeExp)
            .style("stroke-opacity",function(d){return (loc.skyarr.opCont(d.value)*opMult)})


        // .merge(loc.skyarr[dd].dtcontours)
        // loc.skyarr[dd].dtcontours.select("path")
        //     .attr("d",function(d){console.log(this);})
        // }
    }
}
Localisation.prototype.updateContoursPr = function(){
    var loc=this;
    console.log(loc.src.Pr,loc.skyarr.arr.Pr);
    loc.skyarr['Pr'].filtPix=loc.filterSky('Pr','cont',0.2);

    loc.skyarr.PrCumulCont=[0.1]
    loc.skyarr.PrCumulColCont = d3.scaleOrdinal().range(['#000'])
    loc.skyarr.PrCumulOpCont = d3.scaleOrdinal().range([1])
    // console.log(dd,loc.dStatus[dd[0]],loc.dStatus[dd[1]],opMult)

    // loc.gContour.selectAll(".contour-"+dd).remove()
    contoursPr=loc.editContours(d3.contours()
        .size([loc.skyarr.nRA,loc.skyarr.nDec])
        .thresholds(loc.skyarr.PrCumulCont)
        (loc.skyarr.arr.PrCumul),true,'Pr')
    for (c=0;c<contoursPr.length;c++){
        path=d3.geoPath().projection(loc.skyarr.projI)(contoursPr[c]);
        if (contoursPr[c].hasEdge){
            contoursPr[c].path=path.replace('Z','');
        }else{
            contoursPr[c].path=path;
        }
    }
    loc.skyarr.Pr.Prcontours = loc.gContourPr.selectAll(".contour-Pr")
        .data(contoursPr)
    loc.skyarr.Pr.Prcontours.exit()
        .transition().duration(500)
        .style("opacity",0).remove()
    loc.skyarr.Pr.Prcontours
        .transition().duration(500).ease(d3.easeExp)
        .attr("d", function(d){return d.path})
        .style("stroke-opacity",function(d){return (loc.skyarr.PrCumulOpCont(d.value))})
    loc.skyarr.Pr.Prcontours.enter().append("path")
        // .attr("d", d3.geoPath(d3.geoEquirectangular().scale(loc.skyarr.contourScale)))
        .style("fill-opacity",0)
        .style("stroke",function(d){return loc.skyarr.PrCumulColCont(d.value)})
        .style("stroke-width","3")
        .attr("class","contourPr contour-Pr")
        .attr("d", d3.geoPath(loc.skyarr.projI))
        // .on("mouseover",function(d){
        //     loc.tooltip
        //        .style("opacity", .9);
        //     loc.tooltip.html(loc.tttextHmap(d))
        //        .style("left", (d3.event.pageX + 10) + "px")
        //        .style("top", (d3.event.pageY-10) + "px")
        //        .style("width","auto")
        //        .style("height","auto");
        // })
        // .on("mouseout", function(d) {
        //     loc.tooltip.style("opacity", 0);
        // })
        .transition().duration(500).ease(d3.easeExp)
        .style("stroke-opacity",function(d){return (loc.skyarr.PrCumulOpCont(d.value))})
        // .merge(loc.skyarr[dd].dtcontours)
}
Localisation.prototype.updateContoursTmatch = function(){
    var loc=this;
    console.log(loc.src.Pr,loc.skyarr.arr.Pr);
    loc.skyarr.Tmatch.filtPix=loc.filterSky('Tmatch','cont',0.5);

    loc.skyarr.Tmatch.colCont = d3.scaleOrdinal().range(['#fff'])
    loc.skyarr.Tmatch.opCont = d3.scaleOrdinal().range([1])
    // console.log(dd,loc.dStatus[dd[0]],loc.dStatus[dd[1]],opMult)

    // loc.gContour.selectAll(".contour-"+dd).remove()
    contoursTmatch=loc.editContours(d3.contours()
        .size([loc.skyarr.nRA,loc.skyarr.nDec])
        .thresholds([0.9])
        (loc.skyarr.arr.Tmatch),true,'Tmatch')
    for (c=0;c<contoursTmatch.length;c++){
        path=d3.geoPath().projection(loc.skyarr.projI)(contoursTmatch[c]);
        if (contoursTmatch[c].hasEdge){
            contoursTmatch[c].path=path.replace('Z','');
        }else{
            contoursTmatch[c].path=path;
        }
    }
    loc.skyarr.Tmatch.Tmatchcontours = loc.gContourTmatch.selectAll(".contour-Tmatch")
        .data(contoursTmatch)
    loc.skyarr.Tmatch.Tmatchcontours.exit()
        .transition().duration(500)
        .style("opacity",0).remove()
    loc.skyarr.Tmatch.Tmatchcontours
        .transition().duration(500).ease(d3.easeExp)
        .attr("d", function(d){return d.path})
        .style("stroke-opacity",function(d){return (loc.skyarr.Tmatch.opCont(d.value))})
    loc.skyarr.Tmatch.Tmatchcontours.enter().append("path")
        // .attr("d", d3.geoPath(d3.geoEquirectangular().scale(loc.skyarr.contourScale)))
        .style("fill-opacity",0)
        .style("stroke",function(d){return loc.skyarr.Tmatch.colCont(d.value)})
        .style("stroke-width","3")
        .attr("class","contourTmatch contour-Tmatch")
        .attr("d", d3.geoPath(loc.skyarr.projI))
        // .on("mouseover",function(d){
        //     loc.tooltip
        //        .style("opacity", .9);
        //     loc.tooltip.html(loc.tttextHmap(d))
        //        .style("left", (d3.event.pageX + 10) + "px")
        //        .style("top", (d3.event.pageY-10) + "px")
        //        .style("width","auto")
        //        .style("height","auto");
        // })
        // .on("mouseout", function(d) {
        //     loc.tooltip.style("opacity", 0);
        // })
        .transition().duration(500).ease(d3.easeExp)
        .style("stroke-opacity",function(d){return (loc.skyarr.Tmatch.opCont(d.value))})
        // .merge(loc.skyarr[dd].dtcontours)
}
Localisation.prototype.showContoursT = function(){
    d3.select('#g-contoursT')
        .transition().duration(500)
        .style("opacity",1)
}
Localisation.prototype.hideContoursT = function(){
    d3.select('#g-contoursT')
        .transition().duration(500)
        .style("opacity",0)
}
Localisation.prototype.showOverlay = function(olName){
    gid=this.overlays[olName].gid;
    d3.select('#'+gid)
        .transition().duration(500)
        .style("opacity",this.overlays[olName].opacity)
    if (this.overlays[olName].cbar){
        d3.select('#cbar-outer')
            .transition().duration(500)
            .style("opacity",1)
    }
    this.overlays[olName].shown=true;
}
Localisation.prototype.hideOverlay = function(olName){
    gid=this.overlays[olName].gid;
    d3.select('#'+gid)
        .transition().duration(500)
        .style("opacity",0)
    d3.select('#cbar-outer')
        .transition().duration(500)
        .style("opacity",0)
    this.overlays[olName].shown=false;
}
Localisation.prototype.editContours = function(cont,edit,dd){
    console.log('edit contour ',dd,cont)
    if (edit){
        for (i in cont){
            // console.log('edit contour ',dd,' ',i,cont[i])
            if (cont[i].coordinates.length>0){
                coordIn=cont[i].coordinates[0]
                // cont[i].type="MultiLineString"
                // console.log('i in ',i,cont[i],cont[i].coordinates[0],cont[i].coordinates[0].length,'paths')
                coordOut=[]
                for (j in d3.range(coordIn.length)){
                    // console.log('j in ',j,coordIn[j].length,coordIn[j][0])
                    idxCoords=[];
                    newCoords=[];
                    z=[[],[],[]]
                    edges=[[0,0],[0,0],[0,0]];
                    lim=[this.skyarr.nRA,this.skyarr.nDec]
                    for (p in coordIn[j]){
                        z[0]=(coordIn[j][p-1])?coordIn[j][p-1]:[null,null];
                        z[1]=coordIn[j][p];
                        z[2]=(coordIn[j][p+1])?coordIn[j][p+1]:[null,null];
                        // if (coordIn[j][p-1]){d1=coordIn[j][p-1]}else{d1=[null,null]}
                        for (x in z){
                            for (y in z[x]){
                                if(z[x][y]<=0){edges[x][y]=-1}
                                else if(z[x][y]>=lim[y]){edges[x][y]=1}
                                else{edges[x][y]=0}
                            }
                        }
                        if ((edges[1][0]==0)&(edges[1][1]==0)){
                            idxCoords.push(p)
                        }
                        // else if((edges[1][1]==0)&(edges[1][0]!=0)&((edges[0][0]==0)&(edges[2][0]==0))){
                        //     idxCoords.push(p)
                        // }
                        // if(!((d[0]<=0)|(d[0]==this.skyarr.nRA)|(d[1]==0)|(d[1]==this.skyarr.nDec))){
                        //     // not at edge
                        //     idxCoords.push(p)
                        // }
                        // edges[0]=edges[1];
                        // edges[1]=edges[2];
                        // z[0]=z[1];
                    }
                    for (p in idxCoords){
                        newCoords.push(coordIn[j][idxCoords[p]])
                    }
                    idx0=[]
                    console.log('finding edges...',newCoords)
                    for (p=1; p<newCoords.length;p++){
                        // console.log(newCoords[p],newCoords[p+1])
                        p0=p
                        p1=(p==newCoords.length-1)?0:p+1;
                        if((Math.abs(newCoords[p0][0]-newCoords[p1][0])>loc.skyarr.nRA/4.)|
                            (Math.abs(newCoords[p0][1]-newCoords[p1][1])>loc.skyarr.nDec/4.)){
                            idx0.push(p+1);
                            console.log('edge at '+(p+1),newCoords[p-1],newCoords[p],newCoords[p+1])
                        }
                        // if((Math.abs(newCoords[newCoords.length-1][0]-newCoords[0][0])>loc.skyarr.nRA/4.)|
                        //     (Math.abs(newCoords[newCoords.length-1][1]-newCoords[0][1])>loc.skyarr.nDec/4.)){
                        // asasfd;
                    }
                    if(idx0.length>0){
                        // console.log(idx0,newCoords);
                        newCoords=newCoords.slice(idx0,newCoords.length)
                            .concat(newCoords.slice(0,idx0));
                        cont[i].hasEdge=true;
                        // console.log(idx0,newCoords);
                    }else{cont[i].hasEdge=false;}
                    // newCoords=coordIn[j].filter(function(d){
                    //     isVal= (!((d[0]<=0)|(d[0]==loc.skyarr.nRA)|(d[1]==0)|(d[1]==loc.skyarr.nDec)));
                    //     // if (!isVal){console.log(d[0],d[1])};
                    //     return(isVal)
                    // });
                    if (newCoords.length>0){
                        coordOut.push(newCoords)
                    }else{
                        // newCoords=[]
                        // coordOut.push(newCoords)
                    }
                    // console.log('j out',j,newCoords.length,newCoords[0])
                    // console.log('i',i,'j',j,coordOut)
                }
                cont[i].coordinates[0]=coordOut;
                // console.log('i out',i,cont[i],cont[i].coordinates[0],cont[i].coordinates[0].length,'paths')
            }
        }
    }
    cont.type="MultiLineString"
    // console.log('edit contour ',dd,cont)
    return cont;
}
Localisation.prototype.editContours2 = function(cont,edit,dd){
    console.log('edit contour 2 ',dd,cont)
    if ((edit)&(!cont[0].edited)){
        for (i in cont){
            console.log('edit contour ',dd,' ',i,cont[i])
            if (cont[i].coordinates.length>0){
                cont[i].edited=true;
                coordIn=cont[i].coordinates[0]
                // cont[i].type="MultiLineString"
                console.log('i in ',i,cont[i],cont[i].coordinates[0],cont[i].coordinates[0].length,'paths')
                coordOut=[]
                for (j in d3.range(coordIn.length)){
                    console.log('j in ',j,coordIn[j].length,coordIn[j][0])
                    newCoords=[]
                    for (l=0;l<coordIn[j].length;l++){
                        newCoords.push([loc.mod360(180-(coordIn[j][l][0]*loc.skyarr.dRA)),90-(coordIn[j][l][1]*loc.skyarr.dDec)])
                    }
                    coordOut.push(newCoords)
                    console.log('j out ',j,coordOut[j].length,coordOut[j][0])
                }
                cont[i].coordinates[0]=coordOut;
                console.log('i out',i,cont[i],cont[i].coordinates[0],cont[i].coordinates[0].length,'paths')
            }
        }
    }
    // cont.type="MultiLineString"
    // console.log('edit contour ',dd,cont)
    return cont;
}
// matrix functions
var outer = function(a,b){
    if(a.length!=b.length){
        console.log('ERROR:arrays of different lengths:',a,b);
        return null;
    }else{
        mata=$M(a);
        matb=$M(b);
        prod=mata.multiply(matb.transpose());
        return prod;
    }

}
// calculations from https://dcc.ligo.org/public/0068/T1100431/002/projectedTensor.pdf
var lb2vec = function(lon,lat){
    vec=$M([Math.cos(d2r(lon))*Math.cos(d2r(lat)),
        Math.sin(d2r(lon))*Math.cos(d2r(lat)),
        Math.sin(d2r(lat))]);
    return(vec);
}
var vec2lb = function(vec){
    if (vec.elements){
        v=vec.elements
    }else{
        v=vec
    }
    lon=Math.atan2(v[1],v[0])
    lat=Math.atan2(v[2],Math.sqrt(v[0]*v[0] + v[1]*v[1]))
    return([r2d(lon),r2d(lat)]);
}
Localisation.prototype.rotate = function (lon,lat,ang) {
    // rotate around x axis by ang
    angrot=$M([[1,0,0],[0,Math.cos(d2r(ang)),-Math.sin(d2r(ang))],[0,Math.sin(d2r(ang)),Math.cos(d2r(ang))]]);
    // rotate around z axis by lon
    if (this.world){
        lonrot=$M([[Math.cos(d2r(lon)),Math.sin(d2r(lon)),0],[-Math.sin(d2r(lon)),Math.cos(d2r(lon)),0],[0,0,1]]);
    }else{
        lonrot=$M([[Math.cos(d2r(lon)),-Math.sin(d2r(lon)),0],[Math.sin(d2r(lon)),Math.cos(d2r(lon)),0],[0,0,1]]);
    }
    // rotate around y axis by lat
    latrot=$M([[Math.cos(d2r(-lat)),0,Math.sin(d2r(-lat))],[0,1,0],[-Math.sin(d2r(-lat)),0,Math.cos(d2r(-lat))]]);
    // multiply together and return
    return (lonrot.multiply(latrot).multiply(angrot));
};
var uv2dd = function(u,v){
    return outer(u,u).add(outer(v,v).multiply(-1)).multiply(0.5)
}
var ij2eps = function(i,j,pol='+'){
    if (pol=='x'){
        return outer(i,j).add(outer(j,i))
    }else{
        return outer(i,i).add(outer(j,j).multiply(-1))
    }
}
var eps2e = function(eps,posang,pol='+'){
    if (pol=='x'){
        return eps['+'].multiply(-Math.sin(2.*d2r(posang))).add(eps['x'].multiply(Math.cos(2.*d2r(posang))))
    }else{
        return eps['+'].multiply(Math.cos(2.*d2r(posang))).add(eps['x'].multiply(Math.sin(2.*d2r(posang))))
    }
}
var ab2F = function(a,b,posang,pol='+'){
    pa=posang
    // Note that sin sign reversed from Whelan et al. to give correct behaviour.
    if (pol=='x'){
        return a*Math.sin(2.*d2r(pa)) + b*Math.cos(2.*d2r(pa))
    }else{
        return a*Math.cos(2.*d2r(pa)) - b*Math.sin(2.*d2r(pa))
    }
}
var ab2r = function(a,b){
    return(Math.sqrt(0.5)*Math.pow((a*a + b*b),0.25))
}
var ab2psi = function(a,b){
    return(Math.atan2(b,a)/2.)
}
var dotprod = function(aIn,bIn){
    // dot product
    if (aIn.hasOwnProperty('elements')){
        a=aIn.elements;
    }else{a=aIn}
    if (bIn.hasOwnProperty('elements')){
        b=bIn.elements;
    }else{b=bIn}
    dot=0;
    for (i in a){
        for (j in a[0]){
            dot = dot + a[i][j]*b[i][j];
        }
    }
    return(dot)
}
var innerprod = function(aIn,bIn,noise){
    return math.re(math.multiply(math.conj(aIn),bIn,(1./noise)))
}
Localisation.prototype.processDet = function(det){
    // process detectors
    // get vector of detector position
    // console.log('processing ',det.id,det)
    det.vec=this.rotate(det.lon,det.lat,0).multiply(lb2vec(0,0));
    //convert to latlon
    det.lb=vec2lb(det.vec);
    // construct rotation matrix
    det.rotmat=this.rotate(det.lon,det.lat,det.ang);
    // get initial arm vectors
    det.uvec=$M([0,1,0])
    det.vvec=$M([0,0,1]);;
    // rotate arms to sky position
    det.uvec=det.rotmat.multiply(det.uvec);
    det.vvec=det.rotmat.multiply(det.vvec);
    // compute vectors of ends of arms
    det.xarmvec=[det.vec,det.vec.add(det.uvec.multiply(0.1))];
    det.yarmvec=[det.vec,det.vec.add(det.vvec.multiply(0.1))];
    // convert to lat-lon
    det.xarmlb=[vec2lb(det.xarmvec[0]),vec2lb(det.xarmvec[1])];
    det.yarmlb=[vec2lb(det.yarmvec[0]),vec2lb(det.yarmvec[1])];

    // do outer products to timing matrices
    // det.dd=outer(det.uvec,det.uvec).add(outer(det.vvec,det.vvec).multiply(-1)).multiply(0.5);
    det.dd=uv2dd(det.uvec,det.vvec);

    return
    // det.detxyz=math.cross();
}
Localisation.prototype.processNetwork = function(){
    // calculate parameters relating to full network
    loc=this;
    loc.net={'d':{},'dij':{},'sigma':0};
    loc.net.dij={};
    loc.net.Snet=0;
    if(loc.Ndet<2){
        for (i in loc.dOn){
            deti=loc.dataDet[loc.dOn[i]]
            loc.net.d[i]={'sigmaT':deti.sigmaT7*(loc.src.amp/deti.noise100)/7}
            sigmaTi=loc.net.d[i].sigmaT;
            loc.net.sigma += deti.on/(sigmaTi*sigmaTi);
            loc.net.Snet += deti.on/(deti.noise100*deti.noise100);
        }
        // loc.net.Snet=1./loc.net.Snet;
        return
    }else{
        for (i in loc.dOn){
            deti=loc.dataDet[loc.dOn[i]]
            loc.net.d[i]={'sigmaT':deti.sigmaT7*(loc.src.amp/deti.noise100)/7}
            sigmaTi=loc.net.d[i].sigmaT;
            loc.net.sigma += deti.on/(sigmaTi*sigmaTi);
            loc.net.Snet += deti.on/(deti.noise100*deti.noise100);
            for (j in loc.dOn){
                if (j>i){
                    detj=loc.dataDet[loc.dOn[j]];
                    loc.net.d[j]={'sigmaT':detj.sigmaT7*(loc.src.amp/detj.noise100)/7}
                    sigmaTj=loc.net.d[j].sigmaT;
                    // console.log(deti,detj)
                    loc.net.dij[deti.id+detj.id]={}
                    dij=loc.net.dij[deti.id+detj.id]
                    // get difference vector (in m)
                    dij.d=deti.vec.add(detj.vec.multiply(-1))
                    // calculate contribution to M from that pair
                    dij.DD=dij.d.multiply(dij.d.transpose())
                        .multiply(1./(2*sigmaTi*sigmaTi*sigmaTj*sigmaTj));
                    if (!loc.net.hasOwnProperty('M')){
                        loc.net.M=dij.DD;
                    }else{
                        loc.net.M=loc.net.M.add(dij.DD)
                    }
                }
            }
        }
        loc.net.M=loc.net.M.multiply(1./loc.net.sigma)
        // loc.net.Snet=1./loc.net.Snet;
        return
    }
}
Localisation.prototype.processSrcAmp = function(){
    // calculate source amplitude and phase
    loc=this;
    src=this.src
    // console.log('processing src',src)
    // construct rotation matrix
    src.rotmat=this.rotate(src.lon,src.lat,0);
    src.rotmatpos=this.rotate(src.lon,src.lat,-src.posang);
    // get vector of source position
    src.vec=$V(src.rotmatpos.multiply(lb2vec(0,0)));
    // initial vectors
    src.ivecIn=$M([0,1,0]);
    src.jvecIn=$M([0,0,1]);
    // rotate to sky position
    src.ivec=src.rotmat.multiply(src.ivecIn);
    src.jvec=src.rotmat.multiply(src.jvecIn);
    src.lvec=src.rotmatpos.multiply(src.ivecIn);
    src.mvec=src.rotmatpos.multiply(src.jvecIn);
    // compute vectors of polarisation
    src.larmvec=[src.vec.add(src.lvec.multiply(-0.1)),src.vec.add(src.lvec.multiply(0.1))];
    src.marmvec=[src.vec.add(src.mvec.multiply(-0.1)),src.vec.add(src.mvec.multiply(0.1))];
    // convert to lat-lon
    src.larmlb=[vec2lb(src.larmvec[0]),vec2lb(src.larmvec[1])];
    src.marmlb=[vec2lb(src.marmvec[0]),vec2lb(src.marmvec[1])];

    // do outer products
    if (!src.hasOwnProperty('eps')){
        src.eps={};
    }
    src.eps['+']=ij2eps(src.lvec,src.mvec,'+');
    src.eps['x']=ij2eps(src.lvec,src.mvec,'x');
    // account for polarisation
    if (!src.hasOwnProperty('e')){
        src.e={};
    }
    src.e['+']=eps2e(src.eps,src.posang,'+');
    src.e['x']=eps2e(src.eps,src.posang,'x');

    // calculate time differences
    src.Ti={}
    for (i in loc.di){
        det=loc.dataDet[loc.di[i]]
        // console.log(d,det['F+']/Math.sqrt(0.5),det['Fx']/Math.sqrt(0.5));
        // console.log(d,det.r/Math.sqrt(0.5),det.psi);
        // console.log(d,det.r*Math.cos(d2r(2*det.psi))/Math.sqrt(0.5));
        // compute time differences
        src.Ti[det.id]=src.vec.dot(det.vec.multiply(this.rE/this.c));
    }
    // calculate source amplitudes and phase
    src.h0=src.amp/2;
    // ignore second phase
    src.h2=src.amp/2;
    src.posang2=-src.posang;
    src['A+']=src.dist*(1 + Math.cos(d2r(src.inc))*Math.cos(d2r(src.inc)))/2;
    src['Ax']=src.dist*Math.cos(d2r(src.inc));
    src.A1=src['A+']*Math.cos(d2r(2*src.phase))*Math.cos(d2r(2*src.posang2)) -
        src['Ax']*Math.sin(d2r(2*src.phase))*Math.sin(d2r(2*src.posang2));
    src.A2=src['A+']*Math.cos(d2r(2*src.phase))*Math.sin(d2r(2*src.posang2)) +
        src['Ax']*Math.sin(d2r(2*src.phase))*Math.cos(d2r(2*src.posang2));
    src.A3=-src['A+']*Math.sin(d2r(2*src.phase))*Math.cos(d2r(2*src.posang2)) -
        src['Ax']*Math.cos(d2r(2*src.phase))*Math.sin(d2r(2*src.posang2));
    src.A4=-src['A+']*Math.sin(d2r(2*src.phase))*Math.sin(d2r(2*src.posang2)) +
        src['Ax']*Math.cos(d2r(2*src.phase))*Math.cos(d2r(2*src.posang2));
    src['h+']=src.A1*src.h0 + src.A3*src.h2;
    src['hx']=src.A2*src.h0 + src.A4*src.h2;

    // calculate time differences for detectors
    src.dt={}
    if (loc.Ndet<2){
        return
    }else{
        for (i in this.di){
            deti=this.dataDet[this.di[i]].id
            for (j in this.di){
                if (j>i){
                    detj=this.dataDet[loc.di[j]].id
                    detij=deti+detj
                    src.dt[detij]=src.Ti[deti]-src.Ti[detj]
                    console.log('dt '+detij+': '+(src.dt[detij]*1e3).toPrecision(3)+'ms')
                }
            }
        }
        return
    }
}
Localisation.prototype.calcAntFacs = function(){
    // calculate antenna factor for source
    this.src.det=[]
    FpSq=0;
    FcSq=0;
    NpSq=0;
    NcSq=0;
    RpSq=0;
    RcSq=0;
    Nnet=0;
    Snet=0;
    Fnet=0;
    // Fnet=0;
    for (d in this.dataDet){
        det=this.dataDet[d];
        srcdet={'id':det.id,'color':det.color}
        srcdet.a = dotprod(det.dd,this.src.eps['+']);
        srcdet.b = dotprod(det.dd,this.src.eps['x']);
        srcdet['F+']=ab2F(srcdet.a,srcdet.b,src.posang,'+');
        srcdet['Fx']=ab2F(srcdet.a,srcdet.b,src.posang,'x');
        // srcdet['F+2']=dotprod(det.dd,this.src.e['+']);
        // srcdet['Fx2']=dotprod(det.dd,this.src.e['x']);
        srcdet.r=ab2r(srcdet.a,srcdet.b);
        srcdet.psi=r2d(ab2psi(srcdet.a,srcdet.b));
        srcdet['r+']=Math.abs(srcdet.r*Math.cos(2*d2r(srcdet.psi))*Math.sqrt(2.));
        srcdet['rx']=Math.abs(srcdet.r*Math.sin(2*d2r(srcdet.psi))*Math.sqrt(2.));
        RpSq+=Math.pow(srcdet['r+']*det.on/det.noise100,2);
        RcSq+=Math.pow(srcdet['rx']*det.on/det.noise100,2);
        //
        // include source phase
        srcdet.h = this.src['h+']*srcdet['F+'] + this.src['hx']*srcdet['Fx']
        // srcdet.h=math.add(math.multiply(this.src['h+'],srcdet['F+']),math.multiply(this.src['hx'],srcdet['Fx']))
        // srcdet.Z=math.divide(math.complex(innerprod(srcdet.h,this.src.h0,det.noise100) ,
        //     innerprod(srcdet.h,this.src.h2,det.noise100)),
        //     Math.sqrt(innerprod(this.src.h0,this.src.h0,det.noise100)))
        //
        // det['r+']=Math.abs(srcdet.r*Math.cos(2*d2r(srcdet.psi))*Math.sqrt(2.));
        // srcdet.snr=Math.sqrt(Math.pow(srcdet['F+']*Math.abs(this.src['h+'].abs())/det.noise100,2))
        srcdet.snr=Math.sqrt(Math.pow(srcdet['F+']*this.src['h+']/det.noise100,2) +
            Math.pow(srcdet['Fx']*this.src['hx']/det.noise100,2));
        //
        this.src.det.push(srcdet)
        //
        FpSq+=Math.pow(srcdet['F+']*det.on*loc.src['h+'] / det.noise100,2);
        FcSq+=Math.pow(srcdet['Fx']*det.on*loc.src['hx'] / det.noise100,2);
        NpSq+=Math.pow(srcdet['F+']*det.on / det.noise100,2);
        NcSq+=Math.pow(srcdet['Fx']*det.on / det.noise100,2);
        Nnet+=srcdet['F+']*srcdet['F+']*det.on/(det.noise100*det.noise100) +
            srcdet['Fx']*srcdet['Fx']*det.on/(det.noise100*det.noise100);
    }
    this.src.pNet=Math.sqrt(FpSq+FcSq);
    this.src.NNet=Nnet;
    // note that NNet & Snet are defined as inverse of what Fairhust calculates
    this.src.FNet=Math.sqrt(this.src.NNet / this.net.Snet);
    this.src['F+Net']=Math.sqrt(NpSq/this.net.Snet);
    this.src['FxNet']=Math.sqrt(NcSq/this.net.Snet);
    this.src.rNet=Math.sqrt((RpSq + RcSq)/this.net.Snet);
    this.src['r+Net']=Math.sqrt(RpSq/this.net.Snet);
    this.src['rxNet']=Math.sqrt(RcSq/this.net.Snet);
    this.src.aNet=Math.sqrt(FpSq)/Math.sqrt(FcSq);
}
Localisation.prototype.calcAntFacsSky = function(){
    // calculate antenna response factors for whole sky
    // this.skyarr.arr.pNet=[];
    this.skyarr.arr.FNet=[];
    // this.skyarr.arr.NNet=[];
    this.skyarr.arr.aNet=[];
    for (p in this.skyarr.arr.pix){
        rotmat=this.rotate(this.skyarr.arr.lon[p],this.skyarr.arr.lat[p],0);
        ivec=rotmat.multiply($M([0,1,0]));
        jvec=rotmat.multiply($M([0,0,1]));
        eps={'+':ij2eps(ivec,jvec,'+'),'x':ij2eps(ivec,jvec,'x')};
        FpSq=0;
        FcSq=0;
        NNet=0;
        for (d in this.di){
            det=this.dataDet[this.di[d]];
            Fp=ab2F(dotprod(det.dd,eps['+']),dotprod(det.dd,eps['+']),0,['+']);
            Fc=ab2F(dotprod(det.dd,eps['x']),dotprod(det.dd,eps['x']),0,['x']);
            // console.log(det.id,det.on);
            FpSq+=Fp*Fp * det.on * (loc.src.amp / det.noise100);
            FcSq+=Fc*Fc * det.on * (loc.src.amp / det.noise100);
            NNet += Fp*Fp*det.on/ (det.noise100*det.noise100) +
                Fc*Fc*det.on/(det.noise100*det.noise100);
        }
        // this.skyarr.arr.pNet.push(Math.sqrt(FpSq+FcSq));
        // this.skyarr.arr.NNet.push(NNet);
        this.skyarr.arr.FNet.push(Math.sqrt(NNet/this.net.Snet));
        this.skyarr.arr.aNet.push(Math.sqrt(FpSq)/Math.sqrt(FcSq))
    }
    // if (!this.skyarr.hasOwnProperty('pNet')){this.skyarr.pNet={}}
    // this.skyarr.pNet.min=Math.min.apply(Math,this.skyarr.arr.pNet);
    // this.skyarr.pNet.max=Math.max.apply(Math,this.skyarr.arr.pNet);
    if (!this.skyarr.hasOwnProperty('FNet')){this.skyarr.FNet={}}
    this.skyarr.FNet.min=Math.min.apply(Math,this.skyarr.arr.FNet);
    this.skyarr.FNet.max=Math.max.apply(Math,this.skyarr.arr.FNet);
    // if (!this.skyarr.hasOwnProperty('NNet')){this.skyarr.NNet={}}
    // this.skyarr.NNet.min=Math.min.apply(Math,this.skyarr.arr.NNet);
    // this.skyarr.NNet.max=Math.max.apply(Math,this.skyarr.arr.NNet);
    if (!this.skyarr.hasOwnProperty('aNet')){this.skyarr.aNet={}}
    this.skyarr.aNet.min=Math.min.apply(Math,this.skyarr.arr.aNet);
    this.skyarr.aNet.max=Math.max.apply(Math,this.skyarr.arr.aNet);
    console.log('min/max pNet',this.skyarr.aNet.min,this.skyarr.aNet.max);
};
Localisation.prototype.calcAntFacsSkyAmpPhase = function(){
    // calculate antenna response factors for whole sky, including amp & phase
    this.skyarr.arr.pNet=[];
    this.skyarr.arr.aNet=[];
    for (p in this.skyarr.arr.pix){
        rotmat=this.rotate(this.skyarr.arr.lon[p],this.skyarr.arr.lat[p],0);
        ivec=rotmat.multiply($M([0,1,0]));
        jvec=rotmat.multiply($M([0,0,1]));
        eps={'+':ij2eps(ivec,jvec,'+'),'x':ij2eps(ivec,jvec,'x')};
        FpSq=0;
        FcSq=0;
        for (d in this.di){
            det=this.dataDet[this.di[d]];
            Fp=ab2F(dotprod(det.dd,eps['+']),dotprod(det.dd,eps['+']),0,['+']);
            Fc=ab2F(dotprod(det.dd,eps['x']),dotprod(det.dd,eps['x']),0,['x']);
            FpSq+=Fp*Fp * (loc.src.amp / det.noise100);
            FcSq+=Fc*Fc * (loc.src.amp / det.noise100);
            hdet=math.add(math.multiply(this.src['h+'],Fp),math.multiply(this.src['hx'],Fc))
        }
        this.skyarr.arr.pNet.push(Math.sqrt(FpSq+FcSq));
        this.skyarr.arr.aNet.push(Math.sqrt(FpSq)/Math.sqrt(FcSq))
    }
    if (!this.skyarr.hasOwnProperty('pNet')){this.skyarr.pNet={}}
    this.skyarr.pNet.min=Math.min.apply(Math,this.skyarr.arr.pNet);
    this.skyarr.pNet.max=Math.max.apply(Math,this.skyarr.arr.pNet);
    if (!this.skyarr.hasOwnProperty('aNet')){this.skyarr.aNet={}}
    this.skyarr.aNet.min=Math.min.apply(Math,this.skyarr.arr.aNet);
    this.skyarr.aNet.max=Math.max.apply(Math,this.skyarr.arr.aNet);
    // console.log('min/max pNet',this.skyarr.aNet.min,this.skyarr.aNet.max);
};
Localisation.prototype.contourWidth = function(dd){
    return Math.sqrt(0.5)*Math.sqrt(Math.pow(loc.dataDet[loc.di[dd[0]]].sigmaT7 / Math.min(loc.src.det[loc.di[dd[0]]].snr/7,1),2) +
        Math.pow(loc.dataDet[loc.di[dd[1]]].sigmaT7 / Math.min(loc.src.det[loc.di[dd[1]]].snr/7,1),2))*1e-3;
}
Localisation.prototype.calcDetTimes = function(){
    // calculate arrival times at detectors from all sky pixels
    if (!this.skyarr.arr.hasOwnProperty('Ti')){this.skyarr.arr.Ti={};}
    // if (!this.skyarr.arr.hasOwnProperty('Tmatch')){this.skyarr.arr.Tmatch=[];}
    for (i in this.di){
        // console.log(i)
        det=this.dataDet[this.di[i]]
        this.skyarr.arr.Ti[det.id]=[];

        // console.log(d,det['F+']/Math.sqrt(0.5),det['Fx']/Math.sqrt(0.5));
        // console.log(d,det.r/Math.sqrt(0.5),det.psi);
        // console.log(d,det.r*Math.cos(d2r(2*det.psi))/Math.sqrt(0.5));
        // compute time differences
        for (p in this.skyarr.arr.pix){
            // console.log(p);
            vec=this.skyarr.arr.vec[p];
            // console.log(vec);
            this.skyarr.arr.Ti[det.id].push(vec.dot(det.vec.multiply(this.rE/this.c)));
        }
        // this.skyarr.arr.Ti[det.id]=$M(this.skyarr.arr.Ti[det.id]);
    }
    // calculate time differences
    this.skyarr.arr.dt={};
    this.skyarr.mindt={};
    this.skyarr.maxdt={};
    for (i in this.di){
        deti=this.dataDet[this.di[i]].id
        for (j in this.di){
            if (j>i){
                detj=this.dataDet[loc.di[j]].id
                detij=deti+detj
                this.skyarr.arr.dt[detij]=[];
                // console.log(deti,detj,detij)
                for (p in this.skyarr.arr.pix){
                    dtp=this.skyarr.arr.Ti[deti][p] - this.skyarr.arr.Ti[detj][p]
                    this.skyarr.arr.dt[detij].push(dtp)
                    // if (this.dataDet[loc.di[i]].on*this.dataDet[loc.di[j]].on==1){
                    //     Tm=(Math.abs(dtp-this.src.dt[detij])<this.contourWidth(detij)) ? 1:0;
                    //     this.skyarr.arr.Tmatch[p]*=Tm;
                    // }
                }
            }
            this.skyarr.mindt[detij]=Math.min.apply(Math,this.skyarr.arr.dt[detij])
            this.skyarr.maxdt[detij]=Math.max.apply(Math,this.skyarr.arr.dt[detij])
        }
    }
    return
}
Localisation.prototype.calcTimeRings = function(){
    if (!this.skyarr.arr.hasOwnProperty('Tmatch')){
        this.skyarr.arr.Tmatch=[];
        this.skyarr.arr.Tall=[];
        for (p in this.skyarr.arr.pix){
            this.skyarr.arr.Tmatch.push(1);
            this.skyarr.arr.Tall.push(0);}
    }
    for (p in this.skyarr.arr.pix){
        if (this.Ndet<2){
            this.skyarr.arr.Tmatch[p]=0;
            this.skyarr.arr.Tall[p]=0;
        }else{
            this.skyarr.arr.Tmatch[p]=1;
            this.skyarr.arr.Tall[p]=0;
            for (i in this.dOn){
                for (j in this.dOn){
                    if (this.dOn[j]>this.dOn[i]){
                        if (this.skyarr.arr.dt[i+j]){dd=i+j}else{dd=j+i}
                        dtp=this.skyarr.arr.dt[dd][p]
                        Tm=Math.exp(-Math.pow((dtp-this.src.dt[dd])/(4*this.contourWidth(dd)),2));
                        Ta=(Math.abs(dtp-this.src.dt[dd])<this.contourWidth(dd))?1:0
                        this.skyarr.arr.Tmatch[p]*=Tm;
                        this.skyarr.arr.Tall[p]+=Ta;
                    }
                }
            }
        }
    }
}
Localisation.prototype.calcProbSky = function(){
    // calculate probability all over sky
    // var loc=this;
    // *** storing for debugging purposes *** //
    this.skyarr.arr.vec_src=[]
    this.skyarr.arr.vec_srcT=[]
    this.skyarr.arr.logP=[]
    // *** end of debugging purpuses *** //
    this.skyarr.arr.Pr=[]
    this.skyarr.arr.PrCumul=[]
    // console.log('maxpNet',this.skyarr.maxpNet,this.skyarr.arr.pNet);
    PrTot=0

    for (p=0;p<this.skyarr.nPix;p++){
        vec_src=$M(this.src.vec).add($M(this.skyarr.arr.vec[p]).multiply(-1));
        vec_srcT=$M(vec_src).transpose();
        if (this.Ndet>=2){
            logP=vec_srcT.multiply(this.net.M).multiply(vec_src).elements[0];
        }else{
            logP=0.1;
        }
        Pr=Math.exp(-0.5*logP);
        // *** storing for debugging purposes *** //
        this.skyarr.arr.vec_src.push(vec_src)
        this.skyarr.arr.vec_srcT.push(vec_srcT)
        this.skyarr.arr.logP.push(logP)
        // *** end of debugging purpuses *** //
        this.skyarr.arr.Pr.push(Pr)
        PrTot+=Pr;
    }
    // normalise Pr
    PrTotNew=0;
    for (p=0;p<this.skyarr.nPix;p++){
        this.skyarr.arr.Pr[p]/=PrTot;
    }
    // this.skyarr.arr.Pr.forEach(function(d){console.log(d,d/PrTot);d=d/PrTot;PrTotNew+=d})
    // order pixels by probability
    this.skyarr.orderPix=this.skyarr.arr.pix.sort(function(a,b){
        return loc.skyarr.arr.Pr[b] - loc.skyarr.arr.Pr[a]
    })
    // calculate cumulative porbability for each pixel
    cumul=0;
    for (p=0;p<this.skyarr.nPix;p++){
        cumul+=this.skyarr.arr.Pr[this.skyarr.orderPix[p]];
        this.skyarr.arr.PrCumul[this.skyarr.orderPix[p]]=cumul;
    }
    if (!this.skyarr.hasOwnProperty('Pr')){this.skyarr.Pr={}};
    this.skyarr.Pr.min=Math.min.apply(Math,this.skyarr.arr.Pr);
    this.skyarr.Pr.max=Math.max.apply(Math,this.skyarr.arr.Pr);

    return
    // console.log('min/max Pr',this.skyarr.Pr.max,this.skyarr.Pr.max)

}
Localisation.prototype.filterSky = function (filtVal,type,threshold) {
    var loc=this;
    if (!loc.skyarr.hasOwnProperty(filtVal)){loc.skyarr[filtVal]={}}
    if (!threshold){threshold=loc.skyarr[filtVal][type+threshold];}
    // if (filtVal=='T'){
    //     // set default
    //     if (!loc.skyarr.T.threshold) {loc.skyarr.T.threshold=1.e-3}
    //     filtPix=this.skyarr.arr.pix.filter(function(d){
    //         return(Math.abs(loc.skyarr.arr.dt['HL'][d]-loc.src.dt['HL'])<loc.skyarr.T.threshold)
    //     })
    // }else
    if (filtVal=='Pr'){
        // if(!loc.skyarr.Pr.threshold){loc.skyarr.Pr.threshold=0.5};
        // console.log('Pr threshold',threshold,loc.skyarr.Pr.min,loc.skyarr.Pr.max)
        filtPix=this.skyarr.arr.pix.filter(function(d){
            return(loc.skyarr.arr.PrCumul[d]<threshold)
        })
        if (filtPix.indexOf(this.src.pix)>=0){
            // valSrc
            // pixel containing source not in filter
        }
    }else if((filtVal=='pNet')|(filtVal=='FNet')){
        // if(!loc.skyarr.pNet.threshold){loc.skyarr.pNet.threshold=0.1}
        filtPix=this.skyarr.arr.pix.filter(function(d){
            return(Math.abs(loc.skyarr.arr[filtVal][d]-loc.src[filtVal])<threshold)
        })
    }else if(filtVal=='Tmatch'){
        filtPix=this.skyarr.arr.pix.filter(function(d){
            return(loc.skyarr.arr.Tmatch[d]>threshold)
        });
    }else if(filtVal=='Tall'){
        filtPix=this.skyarr.arr.pix.filter(function(d){
            return(loc.skyarr.arr.Tall[d]>threshold)
        });
    }
    // get limits of filtered Data
    this.skyarr[filtVal][type+'filtData']=[]
    for (p=0;p<filtPix.length;p++){
        this.skyarr[filtVal][type+'filtData'].push(this.skyarr.arr[filtVal][filtPix[p]])
    }
    this.skyarr[filtVal][type+'minFilt']=Math.min.apply(Math,this.skyarr[filtVal][type+'filtData']);
    this.skyarr[filtVal][type+'maxFilt']=Math.max.apply(Math,this.skyarr[filtVal][type+'filtData']);
    loc.skyarr[filtVal][type+'filtPix']=filtPix;
    return(filtPix)
};
Localisation.prototype.whenLoaded = function(){
    var loc=this;
    // order Data
    loc.setDetOn();
    loc.processNetwork();
    loc.processSrcAmp();
    loc.calcAntFacs();
    // loc.processSrcAmpPhase();
    loc.calcAntFacsSky();
    loc.calcDetTimes();
    loc.calcTimeRings();
    // loc.calcProbSky();
    loc.makePlot();
    loc.hideLoading();
    // if(loc.debug){console.log('plotted');}
    // select a default event
}
Localisation.prototype.loadLang = function(lang){
    var loc=this;
    if (this.debug){console.log('new language:',lang,'; stored language',loc.lang)}
    var reload = (!loc.lang)||(loc.lang=="") ? false:true;
    loc.lang=lang;
    loc.langshort = (loc.lang.indexOf('-') > 0 ? loc.lang.substring(0,loc.lang.indexOf('-')) : loc.lang.substring(0,2));
    loc.fileInLang="lang_loc/lang_loc_"+lang+".json";
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
    loc.fileInLangDefault="lang_loc/lang_loc_"+loc.defaults.lang+".json";
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
    // d3.select('#lang-title')
    //     .html(this.tl('%text.plotloc.lang.title%'))
    // d3.select('#lang-text')
    //     .html(this.tl('%text.plotloc.lang.text%'))
    d3.select('#page-title')
        .html(this.tl('%text.loc.page.title%'))
    if (this.langdict['meta.translator'] && this.langdict['meta.translator']!=''){
        d3.select('#lang-credit')
            .html(this.tl('%text.loc.langcredit% (%meta.name%): %meta.translator%'));
    }else{
        d3.select('#lang-credit')
            .html('');
    }
    d3.select('#copy-button').attr('title',this.tl('%text.gen.share.copylink%'))
    d3.select('#facebook-share-button').attr('title',this.tl('%text.gen.share.fb%'))
    d3.select('#twitter-share-button').attr('title',this.tl('%text.gen.share.twitter%'))
}
Localisation.prototype.addHelp = function(){
    // add help to panel
    d3.select("#help-title")
        .html(this.tl("%text.loc.help.title%"))
    d3.select("#help-text")
        .html(this.tl("%text.loc.help.text%%text.loc.help.about%%text.loc.help.tech%"));
    // d3.select("#help-tech")
    //     .html(this.tl("%text.plotloc.help.about%%text.plotloc.help.tech%"));
    d3.select("#help-help-text")
        .html(this.tl("%text.loc.help.help%"));
    d3.select("#help-info-text")
        .html(this.tl("%text.loc.help.info%"));
    d3.select("#help-lang-text")
        .html(this.tl("%text.loc.help.lang%"));
    d3.select("#help-share-text")
        .html(this.tl("%text.loc.help.share%"));
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
    for (panel in this.panels){
        // console.log(panel)
        if (panel!='help'){this.panels[panel].hide()}
    }
    this.panels.help.status=true;
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
    this.panels.help.status=false;
    this.panels.info.status=true;
    // fade out infopanel
    this.helpouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.helpouter.style("top","200%");
    document.getElementById("info-icon").classList.remove("hidden");
    document.getElementById("help-icon").classList.add("hidden");
    this.updateUrl();
}

Localisation.prototype.addLang = function(replot){
    // add help to panel
    var loc=this;
    // this.panels.lang.show=this.showLang()
    // this.panels.lang.hide=this.hideLang()
    d3.select("#lang-title")
        .html(this.tl("%text.loc.lang.title%"))
        d3.select("#lang-text")
            .html(this.tl("%text.loc.lang.text%"));
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
    // console.log(this,this.panels);
    for (panel in this.panels){
        // console.log(panel)
        if (panel!='lang'){this.panels[panel].hide()}
    }
    this.panels['lang'].status=true;
    // if (this.optionsOn){this.hideOptions();}
    // if (this.helpOn){this.hideHelp();}
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
    this.panels['lang'].status=false;
    this.panels['info'].status=true;
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
Localisation.prototype.addNetwork = function(){
    var loc=this;
    d3.select("#network-title")
        .html(this.tl("%text.loc.network.title%"))
    d3.select("#network-text")
        .html(this.tl("%text.loc.network.text%"));
    if (this.portrait){
        d3.select('#network-title')
            .style("font-size",(5.0*this.xsc)+"em")
    }else{
        d3.select('#network-title')
            .style("font-size",(2.5*this.ysc)+"em")
    }
    loc.detSettings=d3.select("#network-dets-cont").selectAll(".det-cont")
        .data(loc.dataDet).enter().append("div")
        .attr("id",function(d){return "det-cont-"+d.id})
        .attr("class","det-cont panel-cont")
    loc.detSettings.append("div")
        .attr("class","det-icon")
        .style("background-color",function(d){return d.color})
        .html(function(d){return d.id});
    loc.detSettings.append("div")
        .attr("class","det-name")
        .html(function(d){return d.name});
    loc.detSettings.append("label")
        .attr("class","det-switch")
        .attr("id",function(d){return "det-switch-"+d.id})
        .html(function(d){
                return "<input type='checkbox' "+((loc.dStatus[d.id]==true)?"checked":"")+">"+"<span class='det-slider round'></span>"})
        .on("mousedown",function(){
            console.log('toggling',this,this.id.split('-')[2],loc.dStatus);
            loc.detectorToggle(this.id.split('-')[2])
        })
    loc.detSettings.append("div")
        .attr("class","det-status")
        .attr("id",function(d){return "det-status-"+d.id})
        .html(function(d){return (loc.dStatus[d.id])?'On':'Off'});
    loc.detSettings.append("div")
        .attr("class","det-lat")
        .html(function(d){return d.lat});
    loc.detSettings.append("div")
        .attr("class","det-lon")
        .html(function(d){return d.lon});
    loc.detSettings.append("div")
        .attr("class","det-ang")
        .html(function(d){return d.ang});
}
Localisation.prototype.showNetwork = function(){
    //show network
    // this.panels.network.show=this.showNetwork()
    // this.panels.network.hide=this.hideNetwork()
    for (panel in this.panels){
        console.log(panel)
        if (panel!='network'){this.panels[panel].hide()}
    }
    this.panels['network'].status=true;
    // fade in semi-transparent background layer (greys out image)
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style({"opacity":0.5});
    // this.helpbg.style("height","100%");
    //fade in infopanel
    this.networkouter = d3.select('#network-outer')
    this.networkouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    // this.infopanel.html(this.iptext(d));
    this.networkouter.style("left", document.getElementById('infoouter').offsetLeft-1)
        .style("top", document.getElementById('infoouter').offsetTop-1)
        .style("width",document.getElementById('infoouter').offsetWidth-2)
        .style("height",document.getElementById('infoouter').offsetHeight-22);
    if (this.portrait){
        document.getElementById('network-dets-cont').classList.add('bottom')
    }else{
        document.getElementById('network-dets-cont').classList.remove('bottom')
    }
    document.getElementById("network-icon").classList.remove("hidden");
    document.getElementById("info-icon").classList.add("hidden");
    this.updateUrl();
}
Localisation.prototype.hideNetwork = function() {
    // hide options box
    console.log('hiding network',this,this.panels)
    this.panels['network'].status=false;
    this.panels['info'].status=true;
    // fade out infopanel
    this.networkouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.networkouter.style("top","200%");
    document.getElementById("info-icon").classList.remove("hidden");
    document.getElementById("network-icon").classList.add("hidden");
    this.updateUrl();
    console.log('network hidden')
}
Localisation.prototype.addSource = function(){
    // this.panels.source.show=this.showSource()
    // this.panels.source.hide=this.hideSource()
    var loc=this;
    d3.select("#source-title")
        .html(this.tl("%text.loc.source.title%"))
    if (this.portrait){
        d3.select('#network-source')
            .style("font-size",(5.0*this.xsc)+"em")
    }else{
        d3.select('#network-source')
            .style("font-size",(2.5*this.ysc)+"em")
    }
    d3.select('#source-info-cont').append("div")
        .attr('class','icon labcont')
        .attr('id','lab-ra')
        .style('height',loc.labcontHeight)
    .append("div")
        .attr('class','labtext source')
        .attr('id','lab-ra-txt')
        .html(this.tl(loc.labels.ra.labstr()));
    d3.select('#source-info-cont').append("div")
        .attr('class','icon labcont')
        .attr('id','lab-dec')
        .style('height',loc.labcontHeight)
    .append("div")
        .attr('class','labtext source')
        .attr('id','lab-dec-txt')
        .html(this.tl(loc.labels.dec.labstr()));
    d3.select('#source-info-cont').append("div")
        .attr('class','icon labcont')
        .attr('id','lab-gmst')
        .style('height',loc.labcontHeight)
    .append("div")
        .attr('class','labtext source')
        .attr('id','lab-gmst-txt')
        .html(this.tl(loc.labels.gmst.labstr()));
    // position angle slider
    posangcont=d3.select('#source-info-cont').append("div")
        .attr('class','icon labcont labcont-full')
        .attr('id','lab-posang')
        .style('height',loc.labcontHeight)
    posangcont.append("div")
        .attr('class','labtext source')
        .attr('id','lab-posang-txt')
        .style('height','50%')
        .style('width','100%')
        .html(this.tl(loc.labels.posang.labstr()));
    posangcont.append("div")
        .attr("id","ang-slider")
        .style("width","100%")
    .append("input")
        .attr('class','ang-slider round')
        .attr('id','posang-slider')
        .attr('type','range')
        .attr("min","0")
        .attr("max","180")
        .attr("value",loc.src.posang)
    .on("input",function(){
        loc.src.posang=this.value;
        loc.updateCalcs(true,false)
        console.log(loc.src['h+'],loc.src['hx'],Math.sqrt(Math.pow(loc.src['h+'],2)+Math.pow(loc.src['hx'],2)))
    })
    // inclination slider
    inccont=d3.select('#source-info-cont').append("div")
        .attr('class','icon labcont labcont-full')
        .attr('id','lab-inc')
        .style('height',loc.labcontHeight)
    inccont.append("div")
        .attr('class','labtext source')
        .attr('id','lab-inc-txt')
        .style('height','50%')
        .style('width','100%')
        .html(this.tl(loc.labels.inc.labstr()));
    inccont.append("div")
        .attr("id","ang-slider")
        .style("width","100%")
    .append("input")
        .attr('class','ang-slider round')
        .attr('id','inc-slider')
        .attr('type','range')
        .attr("min","0")
        .attr("max","180")
        .attr("value",loc.src.inc)
    .on("input",function(){
        loc.src.inc=this.value;
        loc.updateCalcs(true,false)
    })
    // amplitude slider
    ampcont=d3.select('#source-info-cont').append("div")
        .attr('class','icon labcont labcont-full')
        .attr('id','lab-amp')
        .style('height',loc.labcontHeight)
    ampcont.append("div")
        .attr('class','labtext source')
        .attr('id','lab-amp-txt')
        .style('height','50%')
        .style('width','100%')
        .html(this.tl(loc.labels.amp.labstr()));
    ampcont.append("div")
        .attr("id","ang-slider")
        .style("width","100%")
    .append("input")
        .attr('class','ang-slider round')
        .attr('id','amp-slider')
        .attr('type','range')
        .attr("min","-24")
        .attr("max","-20")
        .attr("value",Math.log10(loc.src.amp))
    .on("input",function(){
        loc.src.amp=Math.pow(10,this.value);
        loc.updateCalcs(true,false)
    })
}
Localisation.prototype.showSource = function(){
    //show options
    console.log(this,this.panels);
    for (panel in this.panels){
        console.log(panel)
        if (panel!='source'){this.panels[panel].hide()}
    }
    // this.panels['lang'].status=true;
    // if (this.optionsOn){this.hideOptions();}
    // if (this.langOn){this.hideLang();}
    // if (this.helpOn){this.hideHelp();}
    this.panels['source'].status=true;
    // fade in semi-transparent background layer (greys out image)
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style({"opacity":0.5});
    // this.helpbg.style("height","100%");
    //fade in infopanel
    this.sourceouter = d3.select('#source-outer')
    this.sourceouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    // this.infopanel.html(this.iptext(d));
    this.sourceouter.style("left", document.getElementById('infoouter').offsetLeft-1)
        .style("top", document.getElementById('infoouter').offsetTop-1)
        .style("width",document.getElementById('infoouter').offsetWidth-2)
        .style("height",document.getElementById('infoouter').offsetHeight-22);
    if (this.portrait){
        document.getElementById('source-info-cont').classList.add('bottom')
    }else{
        document.getElementById('source-info-cont').classList.remove('bottom')
    }
    document.getElementById("source-icon").classList.remove("hidden");
    document.getElementById("info-icon").classList.add("hidden");
    this.updateUrl();
}
Localisation.prototype.hideSource = function() {
    // hide options box
    console.log('hiding source',this,this.panels)
    this.sourceouter = d3.select('#source-outer')
    this.panels['source'].status=false;
    this.panels['info'].status=true;
    // fade out infopanel
    this.sourceouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.sourceouter.style("top","200%");
    document.getElementById("info-icon").classList.remove("hidden");
    document.getElementById("source-icon").classList.add("hidden");
    this.updateUrl();
    console.log('source hidden')
}
Localisation.prototype.showInfo = function(){
    for (panel in this.panels){
        if (panel!='info'){this.panels[panel].hide()}
    }
    return
}
Localisation.prototype.hideInfo = function(){
    // do nothing
    console.log('hiding info')
    return
}
Localisation.prototype.addSettings = function(){
    var loc=this;
    d3.select("#settings-title")
        .html(this.tl("%text.loc.settings.title%"))
    d3.select("#settings-text")
        .html(this.tl("%text.loc.settings.text%"));
    if (this.portrait){
        d3.select('#settings-title')
            .style("font-size",(5.0*this.xsc)+"em")
    }else{
        d3.select('#settings-title')
            .style("font-size",(2.5*this.ysc)+"em")
    }

    heatmapcont=d3.select("#settings-heatmap-cont")
    d3.select('#settings-heatmap-cont').append("div")
        .attr('class','icon settingscont')
        .attr('id','lab-heatmap-FNet')
    .append("div")
        .attr('class','labtext settings')
        .attr('id','lab-heatmap-text')
        .html(loc.tl('<span class="settings-desc">%text.loc.settings.heatmap.text%</span>'));

    hmapFNet=d3.select('#settings-heatmap-cont').append("div")
        .attr('class','icon settingscont')
        .attr('id','lab-heatmap-FNet')
    hmapFNet.append("label")
        .attr("class","settings-switch")
        .attr("id",function(d){return "det-switch-FNet"})
        .html(function(){
                return "<input type='checkbox' "+((loc.hmap=='FNet')?"checked":"")+">"+"<span class='det-slider round'></span>"})
        .on("mousedown",function(){
            console.log('toggling',this,this.id.split('-')[2],loc.hmap);
            if (loc.hmap=='FNet'){
                // turn off overlay
                console.log('FNet > none');
                loc.hideOverlay('heatmap-FNet')
                loc.hmap='none';
                loc.colourWorldMap();
            }else if(loc.hmap=='none'){
                // turn on overlay
                console.log('none > FNet');
                loc.hmap='FNet';
                loc.showOverlay('heatmap-FNet');
                loc.updateHeatmap(loc.hmap);
                loc.uncolourWorldMap();
            }else{
                // switch overlay from aNet to FNet
                console.log('aNet > FNet');
                loc.hmap='FNet';
                d3.select('#det-switch-aNet > input').property("checked",false)
                loc.updateHeatmap(loc.hmap);
            }
        })
    hmapFNet.append("div")
        .attr('class','labtext settings')
        .attr('id','lab-heatmap-FNet-txt')
        .html(loc.tl('<span class="settings-name">%text.loc.settings.FNet%</span>'+
            '<span class="settings-desc">%text.loc.settings.FNet.desc%</span>'));

    hmapaNet=d3.select('#settings-heatmap-cont').append("div")
        .attr('class','icon settingscont')
        .attr('id','lab-heatmap-aNet')
    hmapaNet.append("label")
        .attr("class","settings-switch")
        .attr("id",function(d){return "det-switch-aNet"})
        .html(function(){
                return "<input type='checkbox' "+((loc.hmap=='aNet')?"checked":"")+">"+"<span class='det-slider round'></span>"})
        .on("mousedown",function(){
            console.log('toggling',this,this.id.split('-')[2],loc.hmap);
            if (loc.hmap=='aNet'){
                console.log('aNet > none');
                // turn off overlay
                loc.hideOverlay('heatmap-aNet')
                loc.hmap='none';
                loc.colourWorldMap();
            }else if (loc.hmap=='none'){
                // turn on overlay
                console.log('none > aNet');
                loc.showOverlay('heatmap-aNet');
                loc.hmap='aNet';
                loc.updateHeatmap(loc.hmap);
                loc.uncolourWorldMap();
            }else{
                // switch from FNet to aNet
                console.log('FNet > aNet',d3.select('#det-switch-FNet > input').property("checked"));
                loc.hmap='aNet';
                d3.select('#det-switch-FNet > input').property("checked",false);
                console.log(d3.select('#det-switch-FNet > input').property("checked"));
                loc.updateHeatmap(loc.hmap);
            }
        })
    hmapaNet.append("div")
        .attr('class','labtext settings')
        .attr('id','lab-heatmap-aNet-txt')
        .html(loc.tl('<span class="settings-name">%text.loc.settings.aNet%</span>'+
            '<span class="settings-desc">%text.loc.settings.aNet.desc%</span>'));

    timingcont=d3.select("#settings-timing-cont")
    d3.select('#settings-timing-cont').append("div")
        .attr('class','icon settingscont')
        .attr('id','lab-timing-Tmatch')
    .append("div")
        .attr('class','labtext settings')
        .attr('id','lab-timing-text')
        .html(loc.tl('<span class="settings-desc">%text.loc.settings.timing.text%</span>'));

    timingTmatch=d3.select('#settings-timing-cont').append("div")
        .attr('class','icon settingscont')
        .attr('id','lab-timing-FNet')
    timingTmatch.append("label")
        .attr("class","settings-switch")
        .attr("id","det-switch-Tmatch")
        .html(function(){
                return "<input type='checkbox' "+((loc.overlays['heatmap-Tmatch'].shown)?"checked":"")+">"+
                    "<span class='det-slider round'></span>"})
        .on("mousedown",function(){
            if (loc.overlays['heatmap-Tmatch'].shown){
                loc.hideOverlay('heatmap-Tmatch')
            }else{
                loc.showOverlay('heatmap-Tmatch')
            }
        })
    timingTmatch.append("div")
        .attr('class','labtext settings')
        .attr('id','lab-timing-Tmatch-txt')
        .html(loc.tl('<span class="settings-name">%text.loc.settings.Tmatch%</span>'+
            '<span class="settings-desc">%text.loc.settings.Tmatch.desc%</span>'));

    timingdt=d3.select('#settings-timing-cont').append("div")
        .attr('class','icon settingscont')
        .attr('id','lab-timing-dt')
    timingdt.append("label")
        .attr("class","settings-switch")
        .attr("id","det-switch-dt")
        .html(function(){
                return "<input type='checkbox' "+((loc.overlays['heatmap-Tall'].shown)?"checked":"")+">"+
                    "<span class='det-slider round'></span>"})
        .on("mousedown",function(){
            if (loc.overlays['heatmap-Tall'].shown){
                loc.hideOverlay('heatmap-Tall')
            }else{
                loc.showOverlay('heatmap-Tall')
            }
        })
    timingdt.append("div")
        .attr('class','labtext settings')
        .attr('id','lab-timing-dt-txt')
        .html(loc.tl('<span class="settings-name">%text.loc.settings.dt%</span>'+
            '<span class="settings-desc">%text.loc.settings.dt.desc%</span>'));

    coordscont=d3.select("#settings-coords-cont")
    d3.select('#settings-coords-cont').append("div")
        .attr('class','icon settingscont')
        .attr('id','lab-coords-FNet')
    .append("div")
        .attr('class','labtext settings')
        .attr('id','lab-coords-text')
        .html(loc.tl('<span class="settings-desc">%text.loc.settings.coords.text%</span>'));

    coordWorld=d3.select('#settings-coords-cont').append("div")
        .attr('class','icon settingscont')
        .attr('id','lab-coords-world')
    coordWorld.append("label")
        .attr("class","settings-switch")
        .attr("id","det-switch-world")
        .html(function(){
                return "<input type='checkbox' "+((loc.world)?"checked":"")+">"+"<span class='det-slider round'></span>"})
        .on("mousedown",function(){
            console.log('toggling',this,this.id.split('-')[2],loc.hmap);
            if (loc.world){
                // switch to sky
                loc.world=false;
            }else{
                // turn on overlay
                loc.world=true;
            }
            loc.svg.select("#worldmap").style("opacity",function(){return (loc.world)?1:0;})
            loc.svg.select("#skymap").style("opacity",function(){return (loc.world)?0:1;})
            if(loc.hmap=='none'){loc.colourWorldMap()}else{loc.uncolourWorldMap()}
            loc.updateAxes();
            loc.updateHeatmap(loc.hmap);
            loc.updateHeatmap('Tmatch');
            loc.updateHeatmap('Tall');
            loc.updateDetMarkers();
            loc.moveHighlight();
        })
    coordWorld.append("div")
        .attr('class','labtext settings')
        .attr('id','lab-coords-world-txt')
        .html(loc.tl('<span class="settings-name">%text.loc.settings.world%</span>'+
            '<span class="settings-desc">%text.loc.settings.world.desc%</span>'));

    coordRes=d3.select('#settings-coords-cont').append("div")
        .attr('class','icon settingscont')
        .attr('id','lab-coords-res')
    coordRes.append("label")
        .attr("class","settings-switch")
        .attr("id",function(d){return "det-switch-res"})
        .html(function(){
                return "<input type='checkbox' "+((loc.lores)?"checked":"")+">"+"<span class='det-slider round'></span>"})
        .on("mousedown",function(){
            console.log('toggling',this,this.id.split('-')[2],loc.hmap);
            if (loc.lores){
                // switch to hires
                loc.skyarr.res = 2.5;
                loc.lores=false;
                loc.setSkyarr();
                loc.updateCalcs(true,true);
            }else{
                // switch to lores
                loc.skyarr.res = 5;
                loc.lores=true;
                loc.setSkyarr();
                loc.updateCalcs(true,true);
            }
        })
    coordRes.append("div")
        .attr('class','labtext settings')
        .attr('id','lab-coords-aNet-txt')
        .html(loc.tl('<span class="settings-name">%text.loc.settings.res%</span>'+
            '<span class="settings-desc">%text.loc.settings.res.desc%</span>'));
}
Localisation.prototype.showSettings = function(){
    //show network
    // this.panels.network.show=this.showNetwork()
    // this.panels.network.hide=this.hideNetwork()
    for (panel in this.panels){
        console.log(panel)
        if (panel!='settings'){this.panels[panel].hide()}
    }
    this.panels['settings'].status=true;
    // fade in semi-transparent background layer (greys out image)
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style({"opacity":0.5});
    // this.helpbg.style("height","100%");
    //fade in infopanel
    this.settingsouter = d3.select('#settings-outer')
    this.settingsouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    // this.infopanel.html(this.iptext(d));
    this.settingsouter.style("left", document.getElementById('infoouter').offsetLeft-1)
        .style("top", document.getElementById('infoouter').offsetTop-1)
        .style("width",document.getElementById('infoouter').offsetWidth-2)
        .style("height",document.getElementById('infoouter').offsetHeight-22);
    if (this.portrait){
        document.getElementById('settings-heatmap-cont').classList.add('bottom')
        document.getElementById('settings-timing-cont').classList.add('bottom')
        document.getElementById('settings-coords-cont').classList.add('bottom')
    }else{
        document.getElementById('settings-heatmap-cont').classList.remove('bottom')
        document.getElementById('settings-timing-cont').classList.remove('bottom')
        document.getElementById('settings-coords-cont').classList.remove('bottom')
    }
    document.getElementById("settings-icon").classList.remove("hidden");
    document.getElementById("info-icon").classList.add("hidden");
    this.updateUrl();
}
Localisation.prototype.hideSettings = function() {
    // hide options box
    console.log('hiding settings',this,this.panels)
    this.panels['settings'].status=false;
    this.panels['info'].status=true;
    // fade out infopanel
    this.settingsouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.settingsouter.style("top","200%");
    document.getElementById("info-icon").classList.remove("hidden");
    document.getElementById("settings-icon").classList.add("hidden");
    this.updateUrl();
    console.log('settings hidden')
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
    this.addNetwork();
    this.addSource();
    this.addSettings();
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
    d3.selectAll(".graph-icon").remove()
    // d3.selectAll("div.labcont").remove()
    // redraw graph and eff
    this.redraw=true;
    this.setScales();
    this.setLang();
    if (this.world){
        this.skyarr.projEq=d3.geoEquirectangular()
            .translate([0,loc.skyHeight/2])
            .fitExtent([[0,0],[this.skyWidth,this.skyHeight]],this.skyarr.fullglobe)//.rotate([d2r(180),0,0])
    }else{
        this.skyarr.projEq=d3.geoEquirectangular()
            .translate([0,this.skyHeight/2])
            .fitExtent([[0,0],[this.skyWidth,this.skyHeight]],this.skymap)
    }
    this.drawSky();
    this.drawEff();
    this.addHelp();
    this.adjCss();
    this.updateSourceLabels();
    this.setPanel(this.getPanel());
    this.redraw=false;
    // gwcat.initButtons();
}
// define fly-in & fly-out

//labels to add and keep updated
