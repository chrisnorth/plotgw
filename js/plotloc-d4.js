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
        posang:19,
        lst:0,
    }
    this.src={}
    this.src.ra = (this.urlVars.ra) ? this.urlVars.ra : this.defaults.ra;
    this.src.dec = (this.urlVars.dec) ? this.urlVars.dec : this.defaults.dec;
    this.src.posang = (this.urlVars.posang) ? this.urlVars.posang : this.defaults.posang;
    this.src.lst = (this.urlVars.lst) ? this.urlVars.lst : this.defaults.lst;
    // set values for styles
    this.setStyles();
    this.setScales();
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
    // set arrays for sky
    this.rE = 6.3716e6;
    this.c = 3.e8
    this.skyarr={"dDec":5.,"dRA":5.}
    this.skyarr.nRA=Math.floor(360./this.skyarr.dRA);
    this.skyarr.nDec=Math.floor(180./this.skyarr.dDec);
    this.skyarr.nPix=this.skyarr.nRA*this.skyarr.nDec;
    this.skyarr.yList=d3.range(-90+this.skyarr.dDec/2.,90+this.skyarr.dDec/2.,this.skyarr.dDec);
    this.skyarr.dec2i = d3.scaleLinear().domain([-90,90]).range([-0.5,loc.skyarr.nDec+0.5])
    // RA needs to run backwards to switch to longitude
    this.skyarr.xList=d3.range(360-this.skyarr.dRA/2.,0-this.skyarr.dRA/2.,-this.skyarr.dRA);
    this.skyarr.ra2i = d3.scaleLinear().domain([-180,180]).range([loc.skyarr.nRA+0.5,-0.5])
    this.skyarr.radec2p = function(ra,dec){
        ira=Math.max(Math.floor(loc.skyarr.ra2i(ra)),0)
        idec=Math.max(Math.floor(loc.skyarr.dec2i(dec)),0)
        console.log(ira,idec)
        return idec*loc.skyarr.nRA + ira
    }
    this.skyarr.arr={'ra':[],'dec':[],'vec':[],'pix':[]};
    p=0;
    for (j in d3.range(0,this.skyarr.nDec)){
        for (i in d3.range(0,this.skyarr.nRA)){
            this.skyarr.arr.pix.push(p);
            this.skyarr.arr.ra.push(180+this.skyarr.xList[i]);
            this.skyarr.arr.dec.push(-this.skyarr.yList[j]);
            this.skyarr.arr.vec.push($V(lb2vec(this.skyarr.arr.ra[p],this.skyarr.arr.dec[p])))
            p++;
        }
    }
    // this.skyarr.arr={"RA":$M(raArr),"Dec":$M(decArr),"vec":vecArr}
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
        "lang":[this.src.lang,this.defaults.lang],

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
    this.sky=document.getElementById("skycontainer");
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
        this.effHeight = this.effFullHeight;
        if(this.debug){console.log('portrait:',this.effHeight,this.effFullHeight);}
        this.wfWidth = 0.5*this.effFullWidth;
        this.wfHeight = this.effFullHight;
        this.labcontHeight="20%";
        this.langcontHeight="10%";
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
        this.labcontHeight="10%";
        this.langcontHeight="5%";
    }
    info.style.width = this.effFullWidth;
    info.style.height = this.effFullHeight;
    this.sky.style.width = this.fullSkyWidth;
    this.sky.style.height = this.fullSkyHeight;

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
            .tickSizeInner(-this.skyHeight)
            .tickValues(d3.range(-180,180+30,30))
            .tickFormat(function(d){if (d<0){return -d+"E"}else if(d>0){return d+"W"}else{return d}});

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
            .tickSizeInner(-this.skyWidth)
            .tickValues(d3.range(-90,90+30,30))
            .tickFormat(function(d){if (d<0){return (-d)+"S"}else if(d>0){return d+"N"}else{return d}});

    // set length scale (normalised to 20px=4km)
    this.lenScale = function(len){return 20*this.scl * len/4.}

    // convert detector position to xy on sky
    this.det2xy = function(d,pt){
        if (pt=='ctr'){
            x=loc.lonMap(d);
            y=loc.latMap(d);
        }else if(pt=='xarm'){
            x = loc.lonMap(d) - loc.lenScale(d.length)*Math.cos(d2r(d.ang));
            y = loc.latMap(d) - loc.lenScale(d.length)*Math.sin(d2r(d.ang));
        }else if(pt=='yarm'){
            x = loc.lonMap(d) + loc.lenScale(d.length)*Math.sin(d2r(d.ang));
            y = loc.latMap(d) - loc.lenScale(d.length)*Math.cos(d2r(d.ang));
        }
        return([x,y]);
    }
    this.rect2xy = function(p,pt){
        x1=loc.raScale(loc.mod360(loc.skyarr.arr.ra[p]-loc.skyarr.dRA/2.));
        y1=loc.decScale(loc.skyarr.arr.dec[p]-loc.skyarr.dDec/2.);
        x2=loc.raScale(loc.mod360(loc.skyarr.arr.ra[p]+loc.skyarr.dRA/2.));
        y2=loc.decScale(loc.skyarr.arr.dec[p]+loc.skyarr.dDec/2.);
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

    // convert source position 2 xy on sky
    this.src2xy = function(pt){
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
    if (this.redraw){
        // console.log('redrawing masses');
        this.updateLines();
        d3.selectAll('.labcont').style('height',this.labcontHeight);
        d3.selectAll('.lang-cont').style('height',this.langcontHeight);
    }else{
        this.updateLines();
        for (lab in this.labels){
            this.addLabel(lab);
        }
        for (det in this.di){
            this.addLabelDet(det);
        }
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
        .attr("stroke",function(d){return loc.detCols[d.id]})
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
        .attr("stroke",function(d){return loc.detCols[d.id]})
        .attr("stroke-width","3px")
        .attr("stroke-dasharray",5)
        .attr("stroke-opacity",0.7);

}
Localisation.prototype.addLabel = function (lab,det='') {
    labimgdiv = document.createElement('div');
    labimgdiv.className = 'icon labcont';
    // labimgdiv.style.width = this.labcontWidth;
    labimgdiv.style.height = this.labcontHeight;
    labimgdiv.style.display = "inline-block";
    if (this.labels[lab].hasOwnProperty('icon')){
        if ((loc.labels.type)&&(loc.labels.type=="det")){
            labimgdiv.setAttribute("id",lab+det+'icon');
            labimgdiv.innerHTML ="<img src='"+this.labels[lab].icon(det)+"'>"
        }else{
            labimgdiv.setAttribute("id",lab+'icon');
            labimgdiv.innerHTML ="<img src='"+this.labels[lab].icon+"'>"
        }
    }
    labtxtdiv = document.createElement('div');
    labtxtdiv.className='label info';
    labtxtdiv.style.height = "100%";
    labtxtdiv.style["font-size"] = (1.3*loc.sksc)+"em";
    if ((loc.labels[lab].type)&&(loc.labels[lab].type=="det")){
        // console.log(lab,loc.labels[lab].labstrdet(det));
        labtxtdiv.setAttribute('id',lab+det+'txt');
        labtxtdiv.innerHTML = this.tl(loc.labels[lab].labstrdet(det));
    }else{
        // console.log(lab,loc.labels[lab].labstr());
        labtxtdiv.setAttribute('id',lab+'txt');
        labtxtdiv.innerHTML = this.tl(loc.labels[lab].labstr());
    }
    labimgdiv.appendChild(labtxtdiv);
    document.getElementById('wfcontainer').appendChild(labimgdiv);
};
Localisation.prototype.addLabelDet = function (det) {
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
        if (loc.dStatus[det]==1){
            document.getElementById('det-toggle-lab-'+det).innerHTML=loc.tl("ON")
        }else{
            document.getElementById('det-toggle-lab-'+det).innerHTML=loc.tl("OFF")
        }
        loc.updateDet();
    })
    labtxtdiv = document.createElement('div');
    labtxtdiv.className='label info dettoggle-lab';
    labtxtdiv.setAttribute('id','det-toggle-lab-'+det);
    labtxtdiv.style.height = "100%";
    labtxtdiv.style["font-size"] = (1.3*loc.sksc)+"em";
    if (this.dStatus[det]==1){
        labtxtdiv.innerHTML = this.tl('ON');
    }else{
        labtxtdiv.innerHTML = this.tl('OFF');
    }
    labimgdiv.appendChild(labtxtdiv);
    document.getElementById('wfcontainer').appendChild(labimgdiv);
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
        .attr("stroke",function(d){return loc.detCols[d.id]})
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
        .attr("stroke",function(d){return loc.detCols[d.id]})
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
Localisation.prototype.updateEff = function(){
    // update eff based on data clicks or resize
    if (this.redraw){
        // resize eff
        this.fadeInLines("H","snap");
        this.fadeInLines("L","snap");
        this.fadeInLines("V","snap");

    }else{
        // clicked on un-selelected datapoint
        this.fadeInLines("H","smooth");
        this.fadeInLines("L","smooth");
        this.fadeInLines("V","smooth");
    }
}
Localisation.prototype.redrawLabels = function(){
    for (lab in this.labels){
        if ((this.labels[lab].type)&&this.labels[lab].type=="det"){
            for (d in this.di){
                labTxt=this.tl(this.labels[lab].labstrdet(d));
                // console.log(lab,d,labTxt);
                document.getElementById(lab+d+"txt").innerHTML = this.tl(labTxt);
            }
        }else{
            labTxt=this.tl(this.labels[lab].labstr());
            // console.log(lab,labTxt)
            document.getElementById(lab+"txt").innerHTML = this.tl(labTxt);
        }
    }
    return
}
Localisation.prototype.moveSrc = function(ra,dec){
    this.src.ra=ra;
    this.src.dec=dec;
    this.processSrc();
    this.calcAntFacs();
    this.redrawLabels();
    this.updateLines();
    this.calcSrcTimes();
    this.moveHighlight();
    this.updateHeatmap('Pr');
    this.updateContours();
    return
}
Localisation.prototype.detectorOn = function(det){
    this.dStatus[det]=1;
}
Localisation.prototype.detectorOff = function(det){
    this.dStatus[det]=0;
}
Localisation.prototype.detectorToggle = function(det){
    this.dStatus[det]=1-this.dStatus[det];
}
Localisation.prototype.setDetOn = function(){
    this.dOn={}
    for (d in this.di){
        if (this.dStatus[d]==1){this.dOn[d]=this.di[d]}
    }
}
Localisation.prototype.updateDet = function(){
    console.log(this.dStatus);
    this.setDetOn();
    this.processNetwork();
    this.processSrc();
    this.calcDetTimes();
    this.calcAntFacs();
    this.redrawLabels();
    this.updateLines();
    this.calcSrcTimes();
    this.moveHighlight();
    this.updateHeatmap('Pr');
    this.updateContours();
    return
}
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
        'ra':{'labstr':function(){return(loc.tl('%text.loc.ra%')+': '+
            parseInt(loc.src.ra)+'<sup>o</sup>')}},
        'dec':{'labstr':function(){return(loc.tl('%text.loc.dec%')+': '+
            parseInt(loc.src.dec)+'<sup>o</sup>')}},
        'posang':{'labstr':function(){return(loc.tl('%text.loc.posang%')+': '+
            parseInt(loc.src.posang)+'<sup>o</sup>')}},
        'lst':{'labstr':function(){return(loc.tl('%text.loc.lst%')+': '+
            parseInt(   loc.src.lst))},
            "icon":"img/time.svg"},
        // 'detr':{'type':'det','labstrdet':function(det){return det+' %text.loc.sensitivity%: '+loc.dataDet[loc.di[det]]['r+'].toPrecision(2)}}
    }
    this.detCols={"H":"#e00","L":"#4ba6ff","V":"#9b59b6","K":"#ffb200"};
    this.legenddescs = {H:'%text.loc.legend.Hanford%',
        L:'%text.loc.legend.Livingston%',
        V:'%text.loc.legend.Virgo%',
        K:'%text.loc.legend.KAGRA%'};
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
        loc.di={};
        loc.dStatus={};
        loc.dOn={};
        i=0;
        for (d in dataIn){
            loc.processDet(dataIn[d])
            loc.dataDet.push(dataIn[d])
            loc.di[dataIn[d].id]=i;
            loc.dStatus[dataIn[d].id]=parseFloat(dataIn[d].on);
            loc.legenddescs[dataIn[d].id]=dataIn[d].name;
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
        .text(loc.tl('%text.loc.rightasc%'));

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
        .text(loc.tl('%text.loc.declination%'));

    d3.selectAll('.tick > line')
        .style('stroke','#ccc')
        .style('opacity',1)

    // draw contours
    loc.skyarr.contourScale=(loc.svgWidth-loc.margin.left-loc.margin.right)/loc.skyarr.nRA
    loc.skyarr.projEq=d3.geoEquirectangular()
        .translate([0,loc.svgHeight/2]).rotate([d2r(180),0,0])
    loc.skyarr.projI=d3.geoIdentity().scale(loc.skyarr.contourScale)
    // loc.skyarr.projEq([0,0])
    loc.gContour=loc.svg.append("g")
        .attr("id","g-contour")
        .attr("class","contours")
        .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
    loc.updateContours();

    // draw Heatmap
    loc.skyarr['Pr']={}
    loc.skyarr['Pr'].gHeatmap=loc.svg.append("g")
        .attr("id","g-heatmap-Pr")
        .attr("class","heatmap")
        .attr("transform", "translate("+loc.margin.left+","+loc.margin.top+")")
    loc.updateHeatmap('Pr')

    // draw detectors
    detGroup = loc.svg.append("g").attr("class","g-dets")
    loc.detMarkers=detGroup.selectAll(".detmarker")
        .data(loc.dataDet)
    .enter().append("g")
        .attr("class", "detmarker marker")
        .attr("id", function(d){return "detmarker-"+d.id;})
        // .attr("transform", function(d){return "translate("+(loc.margin.left+loc.lonScale(loc.lonMod(d.lon)))+","+
        //     (loc.margin.top+loc.decScale(d.lat))+") rotate("+d.ang+")";})
        .attr("transform", "translate("+loc.margin.left+","+
            loc.margin.top+")")
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
        .attr("x1", function(d){return loc.det2xy(d,'ctr')[0]})
        .attr("y1", function(d){return loc.det2xy(d,'ctr')[1]})
        .attr("x2", function(d){return loc.det2xy(d,'xarm')[0]})
        .attr("y2", function(d){return loc.det2xy(d,'xarm')[1]})
        .attr("cursor","default")
        .style("opacity",1)
        .style("stroke", function(d){return loc.detCols[d.id]})
        .style("stroke-width",Math.min(5,2./loc.sksc))
    loc.detMarkers.append("line")
        .attr("class","detline detline-y")
        .attr("id",function(d){return "detline detline-y-"+d.id;})
        .attr("x1", function(d){return loc.det2xy(d,'ctr')[0]})
        .attr("y1", function(d){return loc.det2xy(d,'ctr')[1]})
        .attr("x2", function(d){return loc.det2xy(d,'yarm')[0]})
        .attr("y2", function(d){return loc.det2xy(d,'yarm')[1]})
        .attr("cursor","default")
        .attr("opacity",1)
        .style("stroke", function(d){return loc.detCols[d.id]})
        .style("stroke-width",Math.min(5,2./loc.sksc))
        // .style("stroke-dasharray",1)

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
        .style("fill-opacity",1)
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
        .style("stroke",function(d){return loc.detCols[d];})
        .attr("opacity",1);
    loc.legend.append("line")
        .attr("x1", loc.margin.left+12)
        .attr("y1", loc.margin.top+24)
        .attr("x2", loc.margin.left+12)
        .attr("y2", loc.margin.top+12)
        .style("stroke-width",Math.min(5,2./loc.sksc))
        .style("stroke",function(d){return loc.detCols[d];})
        .attr("opacity",1);

    // draw legend text
    loc.legend.append("text")
      .attr("x", loc.margin.left + 36)
      .attr("y", loc.margin.top + 21)
      .attr("dy", ".35em")
      .attr("font-size","1.2em")
      .style("text-anchor", "start")
      .text(function(d) { if (loc.legenddescs[d]){return loc.tl(loc.legenddescs[d]);}else{return loc.tl(d)}})

    // add info icon
    infoClass = ((!this.optionsOn)&(!this.helpOn)&(!this.langOn)) ? "graph-icon" : "graph-icon hidden";
    d3.select("div#skycontainer").append("div")
        .attr("id","info-icon")
        .attr("class",infoClass)
        .style("right",loc.margin.right)
        .style("top",0)
        .style("width",loc.margin.top)
        .style("height",loc.margin.top);
    d3.select("div#skycontainer > #info-icon").on("mouseover", function() {
              loc.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              loc.tooltip.html(loc.tl('%tooltip.plotloc.showinfo%'))
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
        .on("click",function(){loc.hideHelp();loc.hideLang();});

    //add help icon
    helpClass = (this.helpOn) ? "graph-icon" : "graph-icon hidden";
    this.helpouter = d3.select('#help-outer')
    d3.select("div#skycontainer").append("div")
        .attr("id","help-icon")
        .attr("class",helpClass)
        .style("right",loc.margin.right+1*(loc.margin.top+10))
        .style("top",0)
        .style("width",40*loc.ysc)
        .style("height",40*loc.ysc);
    d3.select("div#skycontainer > #help-icon").on("mouseover", function(d) {
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
        })
    d3.select("div#skycontainer > #help-icon").append("img")
        .attr("src","img/help.svg")
        .on("click",function(){loc.showHelp();});
    this.helpouter
        .style("top","200%");
    this.helpouter.select("#help-close")
        .on("click",function(){loc.hideHelp();});

    // add language button
    langClass = (this.langOn) ? "graph-icon" : "graph-icon hidden";
    this.langouter = d3.select('#lang-outer')
    d3.select("div#skycontainer").append("div")
        .attr("id","lang-icon")
        .attr("class",langClass)
        .style("right",loc.margin.right+2*(loc.margin.top+10))
        .style("top",0)
        .style("width",40*loc.ysc)
        .style("height",40*loc.ysc);
    d3.select("div#skycontainer > #lang-icon").on("mouseover", function(d) {
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
        })
    d3.select("div#skycontainer > #lang-icon").append("img")
        .attr("src","img/lang.svg")
        .on("click",function(){console.log('showing lang panel');loc.showLang();});
    // this.langbg.on("click",function(){loc.hideLang();});
    this.langouter
        .style("top","200%");
    this.langouter.select("#lang-close")
        .on("click",function(){loc.hideLang();});

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
Localisation.prototype.updateHeatmap = function(data){
    // update heatmap
    if (!data){data='Pr'}
    if (data=="Pr"){
        loc.skyarr.Pr.filtpix=loc.filterSkyPr(0.9995);
        loc.skyarr.Pr.opHeat=d3.scaleLinear().range([0,1]).domain([loc.skyarr.minPr,loc.skyarr.maxPr])
    }
    var data;
    console.log(data,loc.skyarr[data])
    loc.skyarr[data].heatmap = loc.skyarr[data].gHeatmap.selectAll(".hm-rect")
        .data(loc.skyarr[data].filtpix)
    loc.skyarr[data].heatmap.exit()
        .attr("class","hm-rect old")
        .transition().duration(500)
        .style("fill-opacity",0).remove()
    loc.skyarr[data].heatmap.enter().append("rect")
        .attr("class","hm-rect new")
    .merge(loc.skyarr[data].heatmap)
        .transition().duration(500)
        .attr("x",function(d){return loc.rect2xy(d)[0];})
        .attr("y",function(d){return loc.rect2xy(d)[1];})
        .attr("width",function(d){return loc.rect2xy(d)[2];})
        .attr("height",function(d){return loc.rect2xy(d)[3];})
        .style("fill","#555")
        .style("fill-opacity",function(d){return loc.skyarr[data].opHeat(loc.skyarr.arr.Pr[p])})
}
Localisation.prototype.updateContours = function(){
    console.log(loc.src.dt,loc.skyarr.arr.dt);
    for (dd in loc.src.dt){
        loc.skyarr[dd]={}
        // loc.skyarr.dtCont=[
        //     Math.min(loc.src.dt[dd]-5e-4,loc.skyarr.mindt[dd]),
        //     loc.src.dt[dd],
        //     Math.max(loc.src.dt[dd]+5e-4,loc.skyarr.maxdt[dd])]
        loc.skyarr.dtCont=[
            Math.max(loc.src.dt[dd]-5e-4,loc.skyarr.mindt[dd]+5.e-6),
            loc.src.dt[dd],
            Math.min(loc.src.dt[dd]+5e-4,loc.skyarr.maxdt[dd]-5.e-6)]
        loc.skyarr.colCont = d3.scaleOrdinal().range([loc.detCols[dd[0]],'#000',loc.detCols[dd[1]]])
        loc.skyarr.opCont = d3.scaleOrdinal().range([1,0,1])
        opMult=loc.dStatus[dd[0]]*loc.dStatus[dd[1]]
        console.log(dd,loc.dStatus[dd[0]],loc.dStatus[dd[1]],opMult)

        // loc.gContour.selectAll(".contour-"+dd).remove()
        loc.skyarr[dd].dtcontours = loc.gContour.selectAll(".contour-"+dd)
            .data(loc.editContours(d3.contours()
                .size([loc.skyarr.nRA,loc.skyarr.nDec])
                .thresholds(loc.skyarr.dtCont)
                (loc.skyarr.arr.dt[dd]),true,dd))
        loc.skyarr[dd].dtcontours.exit()
            .transition().duration(500)
            .style("opacity",0).remove()
        loc.skyarr[dd].dtcontours
            .transition().duration(500).ease(d3.easeExp)
            .attr("d", d3.geoPath(loc.skyarr.projI))
            .style("stroke-opacity",function(d){return (loc.skyarr.opCont(d.value)*opMult)})
        loc.skyarr[dd].dtcontours.enter().append("path")
                // .attr("d", d3.geoPath(d3.geoEquirectangular().scale(loc.skyarr.contourScale)))
                .style("fill-opacity",0)
                .style("stroke",function(d){return loc.skyarr.colCont(d.value)})
                .style("stroke-width","3")
                .attr("class","contour-"+dd)
                .attr("d", d3.geoPath(loc.skyarr.projI))
                .transition().duration(500).ease(d3.easeExp)
                .style("stroke-opacity",function(d){return (loc.skyarr.opCont(d.value)*opMult)})

    }
}
Localisation.prototype.editContours = function(cont,edit,dd){
    // console.log('edit contour ',dd)
    if (edit){
        for (i in cont){
            coordIn=cont[i].coordinates[0]
            // console.log('i in ',i,cont[i],cont[i].coordinates[0],cont[i].coordinates[0].length,'paths')
            coordOut=[]
            for (j in d3.range(coordIn.length)){
                // console.log('j in ',j,coordIn[j].length,coordIn[j][0])
                idxCoords=[]
                newCoords=[]
                edgeh=''
                edgev=''
                for (p in coordIn[j]){
                    d=coordIn[j][p]
                    if (coordIn[j][p+1]){d1=coordIn[j][p+1]}else{d1=[null,null]}
                    // if(d[0]==0){edgeh=-1}
                    if(!((d[0]<=0)|(d[0]==loc.skyarr.nRA)|(d[1]==0)|(d[1]==loc.skyarr.nDec))){
                        // not at edge
                        idxCoords.push(p)
                    }
                }
                for (p in idxCoords){
                    newCoords.push(coordIn[j][idxCoords[p]])
                }
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
            cont[i].coordinates[0]=coordOut
            // console.log('i out',i,cont[i],cont[i].coordinates[0],cont[i].coordinates[0].length,'paths')
        }
    }
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
        math.sin(d2r(lat))]);
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
var rotate = function (lon,lat,ang) {
    // rotate around x axis by ang
    angrot=$M([[1,0,0],[0,Math.cos(d2r(ang)),-Math.sin(d2r(ang))],[0,Math.sin(d2r(ang)),Math.cos(d2r(ang))]]);
    // rotate around z axis by lon
    lonrot=$M([[Math.cos(d2r(lon)),-Math.sin(d2r(lon)),0],[Math.sin(d2r(lon)),Math.cos(d2r(lon)),0],[0,0,1]]);
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
    if (pol=='x'){
        return -a*Math.sin(2.*d2r(posang)) + b*Math.cos(2.*d2r(posang))
    }else{
        return a*Math.cos(2.*d2r(posang)) + b*Math.sin(2.*d2r(posang))
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
Localisation.prototype.processDet = function(det){
    // process detectors
    // get vector of detector position
    // console.log('processing ',det.id,det)
    det.vec=rotate(det.lon,det.lat,0).multiply(lb2vec(0,0));
    //convert to latlon
    det.lb=vec2lb(det.vec);
    // construct rotation matrix
    det.rotmat=rotate(det.lon,det.lat,det.ang);
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
    loc.net={'pairs':{},'sigma':0};
    for (i in loc.dOn){
        deti=loc.dataDet[loc.dOn[i]]
        loc.net.sigma += 1./(deti.sigmat*deti.sigmat)
        for (j in loc.dOn){
            if (j>i){
                dij={};
                detj=loc.dataDet[loc.dOn[j]];
                // get difference vector (in m)
                dij.d=deti.vec.add(detj.vec.multiply(-1)).multiply(loc.rE/loc.c);
                // calculate contribution to M from that pair
                dij.DD=dij.d.multiply(dij.d.transpose())
                    .multiply(1./(2*deti.sigmat*deti.sigmat*detj.sigmat*detj.sigmat));
                if (!loc.net.hasOwnProperty('M')){
                    loc.net.M=dij.DD;
                }else{
                    loc.net.M=loc.net.M.add(dij.DD)
                }
            }
        }
    }
    loc.net.M=loc.net.M.multiply(1./loc.net.sigma)
    return
}
Localisation.prototype.processSrc = function(){
    loc=this;
    src=this.src
    // console.log('processing src',src)
    // construct rotation matrix
    src.rotmat=rotate(src.ra,src.dec,0);
    src.rotmatpos=rotate(src.ra,src.dec,src.posang);
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
    // calculate time differences
    src.dt={}
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
}
Localisation.prototype.calcAntFacs = function(){
    this.src.det=[]
    FpSq=0;
    FcSq=0;
    for (d in this.dataDet){
        det=this.dataDet[d];
        srcdet={'id':det.id}
        srcdet.a = dotprod(det.dd,this.src.eps['+']);
        srcdet.b = dotprod(det.dd,this.src.eps['x']);
        srcdet['F+']=ab2F(srcdet.a,srcdet.b,src.posang,'+');
        srcdet['Fx']=ab2F(srcdet.a,srcdet.b,src.posang,'x');
        srcdet['F+2']=dotprod(det.dd,this.src.e['+']);
        srcdet['Fx2']=dotprod(det.dd,this.src.e['x']);
        srcdet.r=ab2r(srcdet.a,srcdet.b);
        srcdet.psi=r2d(ab2psi(srcdet.a,srcdet.b));
        det['r+']=Math.abs(srcdet.r*Math.cos(2*d2r(srcdet.psi))*Math.sqrt(2.));
        this.src.det.push(srcdet)
        FpSq+=srcdet['F+']*srcdet['F+'];
        FcSq+=srcdet['Fx']*srcdet['Fx'];
    }
    this.src.pNet=Math.sqrt(FpSq+FcSq);
    this.src.aNet=Math.sqrt(FpSq)/Math.sqrt(FcSq)
}
Localisation.prototype.calcAntFacsSky = function(){
    this.skyarr.arr.pNet=[];
    this.skyarr.arr.aNet=[];
    for (p in this.skyarr.arr.pix){
        rotmat=rotate(this.skyarr.arr.ra[p],this.skyarr.arr.dec[p],0);
        ivec=rotmat.multiply($M([0,1,0]));
        jvec=rotmat.multiply($M([0,0,1]));
        eps={'+':ij2eps(ivec,jvec,'+'),'x':ij2eps(ivec,jvec,'x')};
        FpSq=0;
        FcSq=0;
        for (d in this.dataDet){
            det=this.dataDet[d];
            Fp=ab2F(dotprod(det.dd,eps['+']),dotprod(det.dd,eps['+']),0,['+']);
            Fc=ab2F(dotprod(det.dd,eps['x']),dotprod(det.dd,eps['x']),0,['x']);
            FpSq+=Fp*Fp;
            FcSq+=Fc*Fc;
        }
        this.skyarr.arr.pNet.push(Math.sqrt(FpSq+FcSq));
        this.skyarr.arr.aNet.push(Math.sqrt(FpSq)/Math.sqrt(FcSq))
    }
    this.skyarr.minpNet=Math.min.apply(Math,this.skyarr.arr.pNet);
    this.skyarr.maxpNet=Math.max.apply(Math,this.skyarr.arr.pNet);
    console.log('min/max pNet',this.skyarr.minpNet,this.skyarr.maxpNet);
};
Localisation.prototype.calcDetTimes = function(){
    // calculate arrival times at detectors from all sky pixels
    if (!this.skyarr.arr.hasOwnProperty('Ti')){this.skyarr.arr.Ti={};}
    for (i in this.di){
        console.log(i)
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
                console.log(deti,detj,detij)
                for (p in this.skyarr.arr.pix){
                    this.skyarr.arr.dt[detij].push(this.skyarr.arr.Ti[deti][p] - this.skyarr.arr.Ti[detj][p])
                }
            }
            this.skyarr.mindt[detij]=Math.min.apply(Math,this.skyarr.arr.dt[detij])
            this.skyarr.maxdt[detij]=Math.max.apply(Math,this.skyarr.arr.dt[detij])
        }
    }
}
Localisation.prototype.calcSrcTimes = function(){
    // var loc=this;
    this.skyarr.arr.vec_src=[]
    this.skyarr.arr.vec_srcT=[]
    this.skyarr.arr.expP=[]
    this.skyarr.arr.Pr=[]
    for (p in this.skyarr.arr.pix){
        this.skyarr.arr.vec_src.push($M(this.src.vec).add($M(this.skyarr.arr.vec[p]).multiply(-1)))
        this.skyarr.arr.vec_srcT.push($M(this.skyarr.arr.vec_src[p]).transpose())
        this.skyarr.arr.expP.push(this.skyarr.arr.vec_srcT[p].multiply(this.net.M).multiply(this.skyarr.arr.vec_src[p]).elements[0])
        this.skyarr.arr.Pr.push(Math.exp(-0.5*this.skyarr.arr.expP[p]))
    }
    this.skyarr.minPr=Math.min.apply(Math,this.skyarr.arr.Pr)
    this.skyarr.maxPr=Math.max.apply(Math,this.skyarr.arr.Pr)
    console.log('min/max Pr',this.skyarr.minPr,this.skyarr.maxPr)

}
Localisation.prototype.filterSkyTime = function(dt){
    var loc=this;
    if (dt){loc.skyarr.dtFilt=dt;}
    // set default
    dt = (loc.skyarr.dtFilt) ? loc.skyarr.dtFilt : 1.e-3
    this.skyarr.filtTpix=this.skyarr.arr.pix.filter(function(d){
        return(Math.abs(loc.skyarr.arr.dt['HL'][d]-loc.src.dt['HL'])<loc.skyarr.dtFilt)
    })
}
Localisation.prototype.filterSkyPr = function(dP){
    var loc=this;
    if (dP){
        loc.skyarr.dPrFilt=loc.skyarr.minPr + dP*(loc.skyarr.maxPr-loc.skyarr.minPr)
    }
    // set default
    dP = (loc.skyarr.dPrFilt) ? loc.skyarr.dPrFilt : 0.5
    filtPix=this.skyarr.arr.pix.filter(function(d){
        return(loc.skyarr.arr.Pr[d]>loc.skyarr.dPrFilt)
    })
    return(filtPix)
}
Localisation.prototype.filterSkyPNet = function(dPNet){
    var loc=this;
    if (dPNet){loc.skyarr.dPNetFilt=dPNet}
    // set default
    dPNet = (loc.skyarr.dPNetFilt) ? loc.skyarr.dPNetFilt : 0.1
    this.skyarr.filtPNetpix=this.skyarr.arr.pix.filter(function(d){
        return(Math.abs(loc.skyarr.arr.pNet[d]-loc.src.pNet)<loc.skyarr.dPNetFilt)
    })
}
Localisation.prototype.whenLoaded = function(){
    var loc=this;
    // order Data
    loc.setDetOn();
    loc.processSrc();
    loc.calcAntFacs();
    loc.calcAntFacsSky();
    loc.processNetwork();
    loc.calcDetTimes();
    loc.calcSrcTimes();
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
    // d3.select('#lang-title')
    //     .html(this.tl('%text.plotloc.lang.title%'))
    // d3.select('#lang-text')
    //     .html(this.tl('%text.plotloc.lang.text%'))
    d3.select('#page-title')
        .html(this.tl('%text.loc.page.title%'))
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
    d3.selectAll(".graph-icon").remove()
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
    this.redraw=false;
    // gwcat.initButtons();
}
// define fly-in & fly-out

//labels to add and keep updated
