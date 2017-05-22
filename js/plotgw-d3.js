// Define GWCatalogue class
function GWCatalogue(inp){
    // set initial axes
    // this.init()
    var gw=this;
    this.holderid = (inp)&&(inp.holderid) ? inp.holderid : "plotgw-cont";
    console.log('creating plot in #'+this.holderid)
    if ((inp)&&(inp.clearhtml)){
        console.log('clearing current html')
        d3.select('#'+this.holderid).html()
    }
    this.getUrlVars();

    //set default language from browser
    this.langIn = (navigator) ? (navigator.userLanguage||navigator.systemLanguage||navigator.language||browser.language) : "";
    //set lang from query (if present)
    if((inp)&&(inp.lang)&&(typeof inp.lang=="string")) this.langIn = inp.lang;
    // set language from urlVars (if present)
    this.langIn = ((this.urlVars.lang)&&(typeof this.urlVars.lang=="string")) ? this.urlVars.lang : this.langIn

    this.init();
    if(this.debug){console.log('initialised');}
    this.drawGraphInit();
    if(this.debug){console.log('plotted');}
    window.addEventListener("resize",function(){
        gw.replot();
    });
    return this;
}
GWCatalogue.prototype.init = function(){
    // created HTML of not included
    if (d3.select("#hdr").empty()){
        console.log('adding hdr')
        d3.select("#"+this.holderid).insert("div",":first-child")
            .attr("id","hdr")
            .html('<h1 id="page-title"></h1>')
    }
    if (d3.select("#graphcontainer").empty()){
        console.log('adding graphcontainer')
        d3.select("#"+this.holderid).insert("div","#hdr + *")
            .attr("id","graphcontainer")
    }
    if (d3.select("#infoouter").empty()){
        console.log('adding infoouter')
        d3.select("#"+this.holderid).insert("div","#graphcontainer + *")
            .attr("id","infoouter")
            .html('<div id="sketchcontainer"></div><div id="labcontainer"></div>')
    }
    if (d3.select("#options-outer").empty()){
        console.log('adding options-outer')
        d3.select("#"+this.holderid).insert("div","#infoouter + *")
            .attr("id","options-outer").attr("class","panel-outer")
            .html('<div id="options-x" class="options-box"><div class="panel-title"></div><div class="options-buttons" id="x-buttons"></div></div><div id="options-y" class="options-box"><div class="panel-title">Vertical axis</div><div class="options-buttons" id="y-buttons"></div></div><div id="options-close" class="panel-close"><img src="img/close.png" title="close"></div></div>')
    }
    if (d3.select("#help-outer").empty()){
        console.log('adding help-outer')
        d3.select('#'+this.holderid).insert("div","#options-outer + *")
            .attr("id","help-outer").attr("class","panel-outer")
        d3.select("#help-outer").append("div")
            .attr("id","help-title").attr("class","panel-title")
        d3.select("#help-outer").append("div")
            .attr("id","help-block-text").attr("class","panel-text")
            .html('<div class="panel-text" id="help-text"></div><div class="panel-text" id="help-about"></div>')
        d3.select("#help-outer").append("div")
            .attr("id","help-block-icons").attr("class","panel-block")
        d3.select("#help-block-icons").append("div")
            .attr("id","help-help-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/help.svg"><div class="panel-cont-text" id="help-help-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-info-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/info.svg"><div class="panel-cont-text" id="help-info-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-settings-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/settings.svg"><div class="panel-cont-text" id="help-settings-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-lang-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/lang.svg"><div class="panel-cont-text" id="help-lang-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-errors-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/errors.svg"><div class="panel-cont-text" id="help-errors-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-share-cont").attr("class","panel-cont")
            .html('<img class="panel-cont-img" src="img/share.svg"><div class="panel-cont-text" id="help-share-text"></div>')
        d3.select("#help-outer").append("div")
            .attr("id","help-close").attr("class","panel-close")
            .html('<img src="img/close.png" title="close">')
    }
    if (d3.select('#lang-outer').empty()){
        console.log('adding lang-outer')
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
            .html('<img src="img/close.png" title="close">')
    }
    if (d3.select('#share-bg').empty()){
        console.log('adding share-bg')
        d3.select('#'+this.holderid).insert("div","#lang-outer + *")
            .attr("id","share-bg").attr("class","popup-bg")
    }
    if (d3.select('#share-outer').empty()){
        console.log('adding share-outer')
        d3.select('#'+this.holderid).insert("div","#share-bg + *")
            .attr("id","share-outer").attr("class","popup-outer")
        d3.select('#share-outer').append("div")
            .attr("id","share-block-icons").attr("class","popup-block")
            .html('<a href="https://twitter.com/intent/tweet" class="twitter-share-button" id="twitter-share-button"><img class="share-icon" src="img/twitter.png"></a><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>')
        d3.select('#share-outer').append("div")
            .attr("id","share-close").attr("class","popup-close")
            .html('<img src="img/close.png" title="close">')
    }
    if (d3.select('#tooltip').empty()){
        console.log('adding tooltip')
        d3.select('#'+this.holderid).insert("div","#share-outer + *")
            .attr("id","tooltipSk").attr("class","tooltip")
    }
    //initialyse common values
    this.flySp=1000;
    this.defaults = {
        xvar:"M1",
        yvar:"M2",
        panel:"info",
        lang:"en",
        showerrors:true
    }
    this.xvar = (this.urlVars.x) ? this.urlVars.x : this.defaults.xvar;
    this.yvar = (this.urlVars.y) ? this.urlVars.y : this.defaults.yvar;
    this.showerrors = (this.urlVars.err) ? this.urlVars.err : this.defaults.showerrors;
    this.showerrors = (this.showerrors=="false") ? false : true;
    this.setStyles();
    this.sketchName="None";
    this.unitSwitch=false;
    this.setScales();
    this.d=null;
    this.debug=true;
    this.langs = {
        "de":{code:"de",name:"Deutsch"},
        "en":{code:"en",name:"English"},
        "es":{code:"es",name:"Español"},
        "fr":{code:"fr",name:"Français"},
        // "en-GB":{code:"en-GB",name:"English"},
        // "de2":{code:"de",name:"Deutsch (de)"},
        // "en2":{code:"en",name:"English (en)"},
        // "fr2":{code:"fr",name:"Francais (fr)"},
    }
}
GWCatalogue.prototype.getUrlVars = function(){
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
    //set default language
    // if(!this.urlVars.hasOwnProperty("lang")){
    //     this.urlVars.lang="en-US";
    // }
}
GWCatalogue.prototype.makeUrl = function(newKeys,full){
    // construct new URL with replacement queries if necessary
    newUrlVars = this.urlVars;
    allKeys = {"x":[this.xvar,this.defaults.xvar],
        "y":[this.yvar,this.defaults.yvar],
        "lang":[this.lang,this.defaults.lang],
        "err":[this.showerrors,this.defaults.showerrors],
        "panel":[this.getPanel(),this.defaults.panel],
    }
    for (key in allKeys){
        if (this.debug){console.log(key,allKeys[key]);}
        if ((allKeys[key][0]!=allKeys[key][1])){
            newUrlVars[key]=allKeys[key][0]
        }else{
            delete newUrlVars[(key)]
        }
    }
    console.log(newUrlVars);
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
GWCatalogue.prototype.updateUrl = function(vars){
    window.history.pushState({},null,this.makeUrl((vars) ? vars : {}));
}
GWCatalogue.prototype.getPanel = function(){
    if (this.optionsOn){return "options";}
    else if(this.helpOn){return "help";}
    else if(this.langOn){return "lang";}
    else{return "info"}
}
GWCatalogue.prototype.setPanel = function(panel){
    if (panel=="options"){this.showOptions();}
    else if(panel=="help"){this.showHelp();}
    else if(panel=="lang"){this.showLang();}
}
GWCatalogue.prototype.tl = function(textIn,plaintext){
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
GWCatalogue.prototype.getBest = function(item){
    if (item.best){
        return item.best;
    }else{
        return item[0];
    }
}
GWCatalogue.prototype.stdlabel = function(d,src){
    var gw=this;
    if ((!d[src])&&(gw.debug)){
        console.log("can't find '"+src+"' in event '"+d.name+"'");
        return(this.labBlank);
    }
    if ((!d[src].best)&&(d[src].best!=0)&&(gw.debug)){
        console.log("can't find 'best' value for '"+src+"' in event '"+d.name+"':");
        return(gw.labBlank);
    }
    if ((gw.columns[src].err)&&(!d[src].err)){
        console.log("can't find 'err' value for '"+src+"' in event '"+d.name+"'");
    }
    if ((d[src].err)&&(d[src].err.length==2)){
        txt=parseFloat(d[src].errv[1].toPrecision(gw.columns[src].sigfig))+
        '&ndash;'+
        parseFloat(d[src].errv[0].toPrecision(gw.columns[src].sigfig))
    }else if (typeof d[src].best=="number"){
        txt=parseFloat(d[src].best.toPrecision(gw.columns[src].sigfig)).toString()
    }else{
        txt=d[src].best
    }
    if(gw.columns[src].unit){txt=txt+'<br/>'+gw.columns[src].unit;}
    if (typeof txt == "string"){
        // replace superscripts
        reSup=/\^(-?[0-9]*)(?=\s|$)/g
        txt=txt.replace(reSup,"<sup>$1</sup> ");
        // replace Msun
        txt=txt.replace('Msun','M<sub>&#x2609;</sub>')
    }
    return(txt)
}

GWCatalogue.prototype.stdlabelNoErr = function(d,src){
    var gw=this;
    if ((!d[src])&&(gw.debug)){
        if (gw.debug){console.log("can't find datapoint '"+src+"' in event '"+d.name+"'");}
        return(this.labBlank);
    }
    if ((!d[src].best)&&(d[src].best!=0)&&(gw.debug)){
        console.log("can't find 'best' value for '"+src+"' in event '"+d.name+"'");
        return(this.labBlank);
    }
    if (typeof d[src].best=="number"){
        txt=parseFloat(d[src].best.toPrecision(gw.columns[src].sigfig)).toString()
    }else{
        txt=d[src].best
    }
    if(gw.columns[src].unit){txt=txt+'<br/>'+gw.columns[src].unit;}
    if (typeof txt == "string"){
        // replace superscripts
        reSup=/\^(-?[0-9]*)(?=\s|$)/g
        txt=txt.replace(reSup,"<sup>$1</sup> ");
        // replace Msun
        txt=txt.replace('Msun','M<sub>&#x2609;</sub>')
    }
    return(txt)
}
GWCatalogue.prototype.oneline = function(strIn){
    reBr=/\<br\/\>/g;
    if (gw.debug){console.log('oneline:',strIn)}
    strOut= (strIn) ? strIn.replace(reBr,' ') : strIn;
    return(strOut)
}

GWCatalogue.prototype.setColumns = function(datadict){
    /*
    columns structure:
       code: column name (in CSV) used for data
       errcode: column name (in CSV) use for errors
       type: datatype
       avail: true if available for graph axes
       label: label used on graph axes
       icon: icon used on graph axes
       unit: unit used on graph axes (default=BLANK)
       border: force the border on axis (default=2)
    */
    var gw=this;

    colsUpdate = {
        Mtotal:{icon:"img/totalmass.svg",avail:true,type:'src'},
        Mchirp:{icon:"img/chirpmass.svg",avail:true,type:'src'},
        M1:{icon:"img/primass.svg",avail:true,type:'src'},
        M2:{icon:"img/secmass.svg",avail:true,type:'src'},
        Mfinal:{icon:"img/finalmass.svg",avail:true,type:'src'},
        chi:{avail:true,icon:"img/initspin.svg",
            border:0.01,type:'src'},
        af:{avail:true,icon:"img/finalspin.svg",
            border:0.01,type:'src'},
        DL:{avail:true, icon:"img/ruler.svg",
            border:20,type:'src'},
        z:{avail:true,icon:"img/redshift.svg",
            border:0.01,type:'src'},
        UTC:{avail:false,type:'src',strfn:function(d){return('')}},
        FAR:{avail:false,type:'src',icon:"img/dice.svg",
            strfn:function(d){
                if (1/d.FAR.best<1000){
                    strOut="%data.FAR.unit.1per%<br/>"+
                    (1./d.FAR.best).toPrecision(gw.columns.FAR.sigfig)+
                    " %data.FAR.unit.yr%";
                // }else if (1/d.FAR.best<1000){
                //     strOut="%data.FAR.unit.1per%<br/>"+(1./d.FAR.best).toFixed(0)+
                //     "<%data.FAR.unit.yr%";
                }else if (1/d.FAR.best<1e6){
                    strOut="%data.FAR.unit.1per%<br/>"
                    +((1./d.FAR.best)/1e3).toPrecision(gw.columns.FAR.sigfig)+
                    " %data.FAR.unit.kyr%";
                }else{
                    strOut="%data.FAR.unit.1per%<br/>"
                    +((1./d.FAR.best)/1e6).toPrecision(gw.columns.FAR.sigfig)+
                    " %data.FAR.unit.Myr%";
                }
                return(gw.tl(strOut));
            }
        },
        sigma:{avail:false,type:'src'},
        rho:{icon:"img/snr.svg",avail:true,type:'src'},
        deltaOmega:{avail:false,type:'src'},
        Erad:{avail:true,icon:"img/energyrad.svg",
            border:0.1,type:'src'},
        lpeak:{avail:true,icon:"img/peaklum.svg",type:'src'},
        M1kg:{type:'derived',
            namefn:function(){return(gw.columns.M1.name)},
            bestfn:function(d){
                return(d['M1'].best/2.)},
            errfn:function(d){
                return([d['M1'].err[0]/2.,
                d['M1'].err[1]/2.])},
            sigfig:2,
            err:2,
            unit:'%data.mass.unit.kg%',
            avail:false},
        M2kg:{type:'derived',
            namefn:function(){return(gw.columns.M2.name)},
            bestfn:function(d){
                return(d['M2'].best/2.)},
            errfn:function(d){
                return([d['M2'].err[0]/2.,
                d['M2'].err[1]/2.])},
            sigfig:2,
            err:2,
            unit:'%data.mass.unit.kg%',
            avail:false},
        Mfinalkg:{type:'derived',
            namefn:function(){return(gw.columns.Mfinal.name)},
            bestfn:function(d){
                return(d['Mfinal'].best/2.)},
            errfn:function(d){
                return([d['Mfinal'].err[0]/2.,
                d['Mfinal'].err[1]/2.])},
            sigfig:2,
            err:2,
            unit:'%data.mass.unit.kg%',
            avail:false},
        Mchirpkg:{type:'derived',
            namefn:function(){return(gw.columns.Mchirp.name)},
            bestfn:function(d){
                return(d['Mchirp'].best/2.)},
            errfn:function(d){
                return([d['Mchirp'].err[0]/2.,
                d['Mchirp'].err[1]/2.])},
            sigfig:2,
            err:2,
            unit:'%data.mass.unit.kg%',
            avail:false},
        Mratio:{type:"src",
            icon:"img/massratio.svg",
            avail:true,
            border:0.1},
        DLly:{type:'derived',
            namefn:function(){return(gw.columns.DL.name)},
            bestfn:function(d){
                return(d['DL'].best*3.26)},
            errfn:function(d){
                return([d['DL'].err[0]*3.26,
                d['DL'].err[1]*3.26])},
            sigfig:2,
            err:2,
            unit:'%data.DL.unit.Mly%',
            avail:false},
        lpeakMsun:{
            type:'derived',
            name:function(){return(gw.columns.lpeak.name)},
            bestfn:function(d){
                return(d['lpeak'].best*55.956)},
            errfn:function(d){
                return([d['lpeak'].err[0]*55.956,
                d['lpeak'].err[1]*55.956])},
            sigfig:2,
            err:2,
            unit:'%data.lpeak.unit.Mc2%',
            avail:false},
        EradErg:{
            type:'derived',
            namefn:function(){return(gw.columns.Erad.name)},
            bestfn:function(d){
                return(d['Erad'].best*1.787)},
            errfn:function(d){
                return([d['Erad'].err[0]*1.787,
                d['Erad'].err[1]*1.787])},
            err:2,
            sigfig:2,
            unit:'%data.Erad.unit.erg%'
        },
        date:{
            type:'derived',
            strfn:function(d){
                // console.log(d);
                months=['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
                day=d.UTC.best.split('T')[0].split('-')[0];
                month=months[parseInt(d['UTC'].best.split('T')[0].split('-')[1])-1];
                year=d['UTC'].best.split('T')[0].split('-')[2];
                return(day+'<br/>'+month+' '+year);
            },
            name:'%data.date.name%',
            icon:"img/date.svg"},
        time:{
            type:'derived',
            strfn:function(d){
                return(d['UTC'].best.split('T')[1]+"<br/>UT")
            },
            icon:"img/time.svg",
            name:'%data.time.name%'},
        data:{
            type:'derived',
            strfn:function(d){
                if ((d.link)&&d.link.url){
                    return gw.tl("<a href='"+d.link.url+
                        "' title='"+d.link.text+"'>%text.gen.losc%</a>");
                }else{
                    return(gw.labBlank);
                }
            },
            name:'%tooltip.plotgw.losc%',
            icon:"img/data.svg"}
    };
    this.columns={}
    for (c in colsUpdate){
        // console.log(c,colsUpdate[c],datadict)
        if (colsUpdate[c].type=='src'){
            // console.log(c,datadict[c])
            this.columns[c] = (datadict[c]) ? datadict[c] : {};
            for (k in colsUpdate[c]){
                this.columns[c][k]=colsUpdate[c][k]
            }
        }else if(colsUpdate[c].type=='derived'){
            this.columns[c]=colsUpdate[c]
            if (this.columns[c].namefn){
                this.columns[c].name=this.columns[c].namefn()
            }
        }
    }
}

// define functions to get label, icon, unit etc.
GWCatalogue.prototype.getLabel = function(col,plaintext){
    plaintext = plaintext || false;
    return(this.tl(this.columns[col].name,plaintext));
}
GWCatalogue.prototype.getLabelUnit = function(col,plaintext){
    plaintext = plaintext || false;
    if (this.columns[col].unit){
        return(this.tl(this.columns[col].name,plaintext)+
            ' ('+this.tl(this.columns[col].unit,plaintext)+')');
    }else{
        return(this.tl(this.columns[col].name,plaintext));
    }
}
GWCatalogue.prototype.getIcon = function(col){
    if (this.columns[col].icon){
        return(this.columns[col].icon);
    }else{
        return(null);
    }
}


GWCatalogue.prototype.scaleWindow = function(){
    //set window scales (protrait/landscape etc.)
    this.winFullWidth=document.getElementById(this.holderid).offsetWidth;
    this.winFullHeight=document.getElementById(this.holderid).offsetHeight;
    this.winAspect = this.winFullWidth/this.winFullHeight;
    // console.log(this.winFullWidth,this.winFullHeight,this.winAspect);

    info=document.getElementById("infoouter");
    skcont=document.getElementById("sketchcontainer");
    labcont=document.getElementById("labcontainer");
    graph=document.getElementById("graphcontainer");
    if (this.winAspect<1){
        // portrait
        // console.log('portrait');
        this.portrait=true;
        this.sketchFullWidth = 0.9*this.winFullWidth;
        this.sketchFullHeight = 0.5*this.sketchFullWidth;
        this.fullGraphWidth = 0.95*this.winFullWidth;
        this.fullGraphHeight =
            0.8*(this.winFullHeight-this.sketchFullHeight);
        info.style["margin-left"]="5%";
        this.sketchWidth = 0.45*this.sketchFullWidth;
        this.sketchHeight = this.sketchFullHeight;
        if(this.debug){console.log('portrait:',this.sketchHeight,this.sketchFullHeight);}
        this.labWidth = 0.5*this.sketchFullWidth;
        this.labHeight = this.sketchFullHight;
        //this.labcontWidth="45%";
        this.labcontHeight="20%";
        this.langcontHeight="20%";
        // info.style.top = "50%";
        // info.style.left = "0%";
    }else{
        // landscape window
        // console.log('landscape')
        this.portrait=false;
        this.sketchFullHeight = 0.85*this.winFullHeight;
        this.sketchFullWidth = 0.5*this.sketchFullHeight;
        this.fullGraphWidth =
            0.95*(this.winFullWidth-this.sketchFullWidth);
        this.fullGraphHeight = 0.9*this.winFullHeight;
        info.style["margin-left"]=0;
        this.sketchWidth = this.sketchFullWidth;
        this.sketchHeight = 0.5*this.sketchFullHeight;
        if(this.debug){console.log('landscape:',this.sketchHeight,this.sketchFullHeight);}
        this.sketchAspect = this.sketchFullWidth/this.sketchFullHeight;
        this.labWidth = this.sketchFullWidth;
        this.labHeight = 0.5*this.sketchFullHight;
        //this.labcontWidth="45%";
        this.labcontHeight="10%";
        this.langcontHeight="10%";
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
    //define scales
    this.scaleWindow();
    var gw=this;
    //set scale factor(s)
    this.xsc = Math.min(1.0,document.getElementById(this.holderid).offsetWidth/1400.)
    this.ysc = Math.min(1.0,document.getElementById(this.holderid).offsetHeight/900.)
    this.scl = Math.min(this.xsc,this.ysc)
    //sketch scale
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
    this.margin = {top: 40*this.ysc, right: 20*this.xsc, bottom: 15*(1+this.ysc), left: 35*(1+this.xsc)}
    this.graphWidth =
        this.fullGraphWidth - this.margin.left - this.margin.right;
    this.graphHeight =
        0.9*this.fullGraphHeight - this.margin.top - this.margin.bottom;
    this.xyAspect = this.graphWidth/this.graphHeight;

    // set axis scales
    this.errh = 0.01;
    this.errw = 0.01;//*xyAspect;
    this.xValue = function(d) {return d[gw.xvar].best;} // data -> value
    // value -> display
    this.xScale = d3.scale.linear().domain([0,100])
        .range([0, this.graphWidth])
        // data -> display
    this.xMap = function(d) {return gw.xScale(gw.xValue(d));}
    // x error bars
    this.xErrP = function(d) {return d[gw.xvar].errv[0];} //error+ -> value
    this.xErrM = function(d) {return d[gw.xvar].errv[1];} //error- -> value
    // x error+ -> display
    this.xMapErrP = function(d) {return gw.xScale(gw.xErrP(d))}
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

    //data -> value
    this.yValue = function(d) {return d[gw.yvar].best;}
    // value -> display
    // this.yScale = d3.scale.linear().
    //     range([this.relh[1]*this.graphHeight, this.relh[0]*this.graphHeight])
    this.yScale = d3.scale.linear().range([this.graphHeight,0])
    // data -> display
    this.yMap = function(d) { return gw.yScale(gw.yValue(d));}
    // y error bars
    this.yErrP = function(d) {return d[gw.yvar].errv[0];} //error+ -> value
    this.yErrM = function(d) {return d[gw.yvar].errv[1];} //error- -> value
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
    // Set sketch scales
    ///////////////////////////////////////////////////////////////////////////
    this.marginSketch = {top: 0*this.scl, right: 0*this.scl, bottom: 0*this.scl, left: 0*this.scl}
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

    // set scaleing functions for sketch
    this.scaleRadius = function(mass,ref){
        return(0.2*this.sketchWidth*(mass/100.))}
    this.xScaleSk = function(x){return(x*this.sketchWidth)}
    this.xScaleSkAspect = function(x){
        return(x*this.sketchWidth*this.aspectSketch)}
    this.yScaleSk = function(y){return(y*this.sketchHeight)}

    // set black hole positions
    /* cx,cy=BH position; xicon,yicon: icon-position, scy:shadow y-coordinate
    */
    this.bhpos = {
        M1:{cx:0.3,cy:0.5,xicon:"5%",yicon:"40%",scy:0.5},
        M2:{cx:0.3,cy:0.8,xicon:"5%",yicon:"70%",scy:0.8},
        Mfinal:{cx:0.65,cy:0.7,xicon:"75%",yicon:"60%",scy:0.7}
    };
        // date:{xicon:0.1,yicon:0.7,xtxt:0.2,ytxt:0.725},
        // dist:{xicon:0.1,yicon:0.85,xtxt:0.2,ytxt:0.875},
        // typedesc:{xicon:0.6,yicon:0.7,xtxt:0.7,ytxt:0.75},
        // far:{xicon:0.6,yicon:0.85,xtxt:0.7,ytxt:0.9}};

    //mass icon size, src files, and tool-tip text
    this.micon = {w:"20%",h:"20%",
        file:{'M1':"img/primass.svg",
            'M2':"img/secmass.svg",
            'Mfinal':"img/finalmass.svg"}};
    //y-position for flown-out masses
    this.yout = -0.3;

    // columns to show on sketch
    // icon: src file, label: label source, tooltip label)
    this.labels ={

        date:{lab:["date"]},
        time:{lab:["time"]},
        Mchirp:{lab:["Mchirp"],
            labSw:["Mchirpkg"]},
        Mratio:{lab:["Mratio"]},
        DL:{lab:["DL"],
            labSw:["DLly"]},
        // "typedesc":{icon:"img/blank.svg",lab:["typedesc"],
            // ttlab:"Category of detection"},
        FAR:{lab:["FAR"]},
        lpeak:{lab:["lpeakMsun"],labSw:["lpeak"]},
        Erad:{lab:["Erad"],labSw:["EradErg"]},
        chi:{lab:["chi"]},
        af:{lab:["af"]},
        data:{icon:"img/data.svg",lab:["data"]}
    }
    //tool-top labels
    this.ttlabels = {
        switch:"%tooltip.plotgw.switchunits%"
    };
    //text for black labels
    this.labBlank="--";
}
GWCatalogue.prototype.adjCss = function(){
    // adjust css of some elements
    // duplicates content of @media in css file
    console.log('this.winFullWidth:',this.winFullWidth)
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
    console.log('new css:',css)
    if (css){
        for (k in css){
            console.log(k,d3.selectAll(k),css[k])
                d3.selectAll(k).style(css[k])
        }
    }
}
GWCatalogue.prototype.drawSketch = function(){
    // Create sketch panel
    // Add svg to sketch container
    this.svgSketch = d3.select("div#sketchcontainer").append("svg")
        .attr("preserveAspectRatio", "none")
        .attr("id","svgSketch")
        // .attr("viewBox","0 0 "+this.sketchWidth+" " +this.sketchHeight)
        .attr("width", this.sketchWidth + this.marginSketch.left + this.marginSketch.right)
        .attr("height", (this.sketchHeight + this.marginSketch.top + this.marginSketch.bottom))
        .append("g")
        .attr("transform", "translate(" + this.marginSketch.left + "," + this.marginSketch.top + ")");
    // define gradients
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
        // console.log('redrawing masses');
        this.addMasses("M1",true);
        this.addMasses("M2",true);
        this.addMasses("Mfinal",true);
    }else{
        this.addMasses("M1",false);
        this.addMasses("M2",false);
        this.addMasses("Mfinal",false);
    }

    // add labels
    if (this.redraw){
        d3.selectAll('.labcont').style('height',this.labcontHeight);
        d3.selectAll('.lang-cont').style('height',this.langcontHeight);
        d3.select('#unitswtxt')
            .html(this.tl('%tooltip.plotgw.switchunits%'));
    }else{
        if (this.showerrors == null){this.showerrors=true};
        for (lab in this.labels){this.addLab(lab)};

        // add unit-switch button
        swimgdiv = document.createElement('div');
        swimgdiv.className = 'icon labcont';
        swimgdiv.setAttribute("id",'unitswicon');
        // swimgdiv.style.width = this.labcontWidth;
        swimgdiv.style.height = this.labcontHeight;
        swimgdiv.style.display = "inline-block";
        if (this.labels[lab].icon){
            swimgdiv.innerHTML ="<img src='img/switch.svg'>"
        }
        swimgdiv.onmouseover = function(e){
            gw.showTooltip(e,"switch")}
        swimgdiv.onmouseout = function(){gw.hideTooltip()};
        swimgdiv.onclick = function(){gw.switchUnits()};
        swtxtdiv = document.createElement('div');
        swtxtdiv.className = 'sketchlab info';
        swtxtdiv.setAttribute("id",'unitswtxt');
        swtxtdiv.style.height = "100%";
        swtxtdiv.style["font-size"] = (1.3*gw.sksc)+"em";
        swtxtdiv.innerHTML = this.tl('%tooltip.plotgw.switchunits%');
        swimgdiv.appendChild(swtxtdiv);
        document.getElementById('labcontainer').appendChild(swimgdiv);
    }
    // add title & subtitle to sketch
    if (this.portrait){fs=(3.0*gw.xsc)}
    else{fs=(1.5*gw.ysc)}
    this.sketchTitle = this.svgSketch.append("text")
        .attr("x",this.xScaleSk(0.5))
        .attr("y",this.yScaleSk(0.1))
        .attr("class","sketch-title panel-title")
        .attr("text-anchor","middle")
        .style("font-size",fs+"em")
        .html(this.tl("%text.plotgw.information.title%"));
    this.sketchTitleHint = this.svgSketch.append("text")
        .attr("x",this.xScaleSk(0.5))
        .attr("y",this.yScaleSk(0.2))
        .attr("class","sketch-subtitle pabel-subtitle")
        .attr("text-anchor","middle")
        .style("font-size",(0.75*fs)+"em")
        .html(this.tl("%text.plotgw.information.subtitle%"));

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
    this.svgSketch.append("ellipse")
        .attr("class","sketch shadow-"+bh)
        .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
        .attr("cy",this.yScaleSk(this.bhpos[bh].scy))
        .attr("rx",this.scaleRadius(0,1))
        .attr("ry",this.scaleRadius(0,1))
        .attr("fill","url(#gradShadow)");
    // add circle for black hole
    this.svgSketch.append("circle")
        .attr("class","sketch bh-"+bh)
        .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
        .attr("cy",this.yScaleSk(this.yout))
        .attr("r",this.scaleRadius(1,1))
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
            "<img src='"+this.micon.file[bh]+"'>"
        massicondiv.onmouseover = function(e){
            // console.log(this.id)
            gw.showTooltip(e,this.id.split("icon")[1])}
        massicondiv.onmouseout = function(){gw.hideTooltip()};
        // add mass text
        masstxtdiv = document.createElement('div');
        masstxtdiv.className = 'sketchlab mtxt';
        masstxtdiv.setAttribute('id','mtxt-'+bh);
        masstxtdiv.style["font-size"] = (1.2*this.sksc)+"em";
        masstxtdiv.innerHTML = this.labBlank;
        massicondiv.appendChild(masstxtdiv);
        document.getElementById('sketchcontainer').appendChild(massicondiv);
    }
}
GWCatalogue.prototype.addLab = function(lab){
    // add labels as html elements
    var gw=this;
    labimgdiv = document.createElement('div');
    labimgdiv.className = 'icon labcont';
    labimgdiv.setAttribute("id",lab+'icon');
    // labimgdiv.style.width = this.labcontWidth;
    labimgdiv.style.height = this.labcontHeight;
    labimgdiv.style.display = "inline-block";
    if (this.labels[lab].icon){
        labimgdiv.innerHTML ="<img src='"+this.labels[lab].icon+"'>"
    }else{
        // console.log(lab);
        labimgdiv.innerHTML ="<img src='"+this.columns[lab].icon+"'>"
    }
    labimgdiv.onmouseover = function(e){
        gw.showTooltip(e,this.id.split("icon")[0])}
    labimgdiv.onmouseout = function(){gw.hideTooltip()};
    var labtxtdiv = document.createElement('div');
    labtxtdiv.className = 'sketchlab info';
    labtxtdiv.setAttribute("id",lab+'txt');
    labtxtdiv.style.height = "100%";
    labtxtdiv.style["font-size"] = (1.3*gw.sksc)+"em";
    labtxtdiv.innerHTML = '--';
    labtxtdiv.onmouseover = function(e){
        gw.showTooltip(e,this.id.split("txt")[0])}
    labtxtdiv.onmouseout = function(){gw.hideTooltip()};
    labimgdiv.appendChild(labtxtdiv);
    document.getElementById('labcontainer').appendChild(labimgdiv);
}
GWCatalogue.prototype.flyOutMasses = function(bh){
    // fly out mass (set by "bh")
    this.svgSketch.select('circle.bh-'+bh)
        .transition().duration(this.flySp)
        .attr("cy",this.yScaleSk(this.yout));
    this.svgSketch.select('ellipse.shadow-'+bh)
        .transition().duration(this.flySp)
        .attr("rx",this.scaleRadius(1,1))
        .attr("ry",this.scaleRadius(1,1));
    //replace text in label
    document.getElementById("mtxt-"+bh).innerHTML = this.labBlank;

};
GWCatalogue.prototype.flyInMasses = function(d,bh,resize){
    // fly in mass
    // bh = BH to fly in
    // resize= type of resizing animation
    if (resize=="smooth"){
        // only resize circle & shadow
        this.svgSketch.select('circle.bh-'+bh)
            .transition().duration(this.flySp)
            .attr("r",this.scaleRadius(
                d[bh].best,d.Mfinal.best))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-
                this.scaleRadius(d[bh].best,d.Mfinal.best));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .transition().duration(this.flySp)
            .attr("rx",this.scaleRadius(
                d[bh].best,d.Mfinal.best))
            .attr("ry",this.scaleRadius(
                0.2*d[bh].best,d.Mfinal.best));
    }else if(resize=="fly"){
        // resize & fly in
        this.svgSketch.select('circle.bh-'+bh)
            .attr("r",this.scaleRadius(
                d[bh].best,d.Mfinal.best));
        this.svgSketch.select('circle.bh-'+bh)
            .transition().duration(this.flySp).ease("bounce")
            .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-
                this.scaleRadius(d[bh].best,d.Mfinal.best));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .transition().duration(this.flySp).ease("bounce")
            .attr("rx",this.scaleRadius(
                d[bh].best,d.Mfinal.best))
            .attr("ry",this.scaleRadius(
                0.2*d[bh].best,d.Mfinal.best));
    }else if(resize=="snap"){
        // snap resize (when redrawing sketch)
        this.svgSketch.select('circle.bh-'+bh)
            .attr("r",this.scaleRadius(
                d[bh].best,d.Mfinal.best))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-
                this.scaleRadius(d[bh].best,d.Mfinal.best));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .attr("rx",this.scaleRadius(
                d[bh].best,d.Mfinal.best))
            .attr("ry",this.scaleRadius(
                0.2*d[bh].best,d.Mfinal.best));
    };

    // update mass label text
    if (this.showerrors){
        // console.log('error',d[bh]);
        document.getElementById("mtxt-"+bh).innerHTML = this.tl(d[bh].str);
    }else{
        // console.log('noerror',d[bh]);
        document.getElementById("mtxt-"+bh).innerHTML = this.tl(d[bh].strnoerr);
    }
};
GWCatalogue.prototype.switchUnits = function(){
    // switch between label units
    if (this.unitSwitch){
        // console.log('switching to false');
        this.unitSwitch=false;}
    else{
        // console.log('switching to true');
        this.unitSwitch=true;}
    if (!this.d){
        // no data shown
        return
    }
    this.redrawLabels();
}
GWCatalogue.prototype.redrawLabels = function(){
    for (lab in this.labels){
        // console.log(this.labels[lab])
        labTxt=''
        labs=this.labels[lab].lab;
        if (this.unitSwitch){
            if (this.labels[lab].labSw){labs=this.labels[lab].labSw}
        }
        if (this.d!=null){
            for (i in labs){
                if (this.d[labs[i]]){
                    if (this.showerrors){
                        labTxt += " "+this.d[labs[i]].str;
                    }else{
                        labTxt += " "+this.d[labs[i]].strnoerr;
                    }
                    if (i<labs.length-1){
                        labTxt += "<br>";
                    }
                }else if (gw.debug){console.log("can't find '"+labs[i]+"' in event '"+this.d.name+"'");}
            }
            labTxt = (labTxt=='') ? gw.labBlank : labTxt;
            document.getElementById(lab+"txt").innerHTML = this.tl(labTxt);
            // console.log(this.lang,labTxt,this.tl(labTxt));
        }
    }
    masses=['M1','M2','Mfinal']
    for (m in masses){
        bh=masses[m]
        // update mass label text
        if (this.d!=null){
            if (this.unitSwitch){dbh=this.d[bh+'kg']}
            else{dbh=this.d[bh]}
            document.getElementById("mtxt-"+bh)
                .style["font-size"] = (1.2*this.sksc)+"em";
            if (this.showerrors){
                // console.log('error',bh,this.d[bh]);
                document.getElementById("mtxt-"+bh).innerHTML = this.tl(dbh.str);
            }else{
                // console.log('noerror',bh,this.d[bh]);
                document.getElementById("mtxt-"+bh).innerHTML = this.tl(dbh.strnoerr);
            }
        }
    }
}
GWCatalogue.prototype.updateSketch = function(d){
    // update sketch based on data clicks or resize
    if (this.redraw){
        // resize sketch
        this.flyInMasses(d,"M1","snap");
        this.flyInMasses(d,"M2","snap");
        this.flyInMasses(d,"Mfinal","snap");
        // update title
        this.sketchTitle.html(
            this.tl("%text.plotgw.information.heading% "+this.sketchName));
        this.sketchTitleHint.html("");
        // update labels
        this.redrawLabels();
    }else if ((this.sketchName==d["name"])){
        // clicked on currently selected datapoint
        this.flyOutMasses("M1");
        this.flyOutMasses("M2");
        this.flyOutMasses("Mfinal");
        this.d = null;
        // replace title
        this.sketchName="None";
        this.sketchTitle.html(this.tl("%text.plotgw.information.title%"));
        this.sketchTitleHint.html(this.tl("%text.plotgw.information.subtitle%"));
        // replace labels with blank text
        for (lab in this.labels){
            document.getElementById(lab+"txt").innerHTML = this.labBlank;
        }
    }else{
        // clicked on un-selelected datapoint
        if ((this.sketchName=="None")||(this.sketchName=="")) {
            // nothing selected, so fly in
            this.flyInMasses(d,"M1","fly");
            this.flyInMasses(d,"M2","fly");
            this.flyInMasses(d,"Mfinal","fly");
            this.d = d;
        }else{
            // different data selected, so resize
            this.flyInMasses(d,"M1","smooth");
            this.flyInMasses(d,"M2","smooth");
            this.flyInMasses(d,"Mfinal","smooth");
            this.d = d;
        }
        // update title
        this.sketchName = d["name"];
        this.sketchTitle.html("Information: "+this.sketchName);
        this.sketchTitleHint.html("");
        //update labels
        this.redrawLabels();
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
    // graph tooltip text
    if (this.debug){console.log(d["name"],this.columns[this.xvar].name,d[this.xvar].strnoerr,this.columns[this.yvar].name,d[this.yvar].strnoerr)}
    return "<span class='ttname'>"+d["name"]+"</span>"+
    "<span class='ttpri'>"+this.tl(this.columns[this.xvar].name)+
        ": "+this.tl(this.oneline(d[this.xvar].strnoerr))+"</span>"+
    "<span class='ttsec'>"+this.tl(this.columns[this.yvar].name) +
        ": "+this.tl(this.oneline(d[this.yvar].strnoerr))+"</span>";
}

GWCatalogue.prototype.formatData = function(d,cols){
    // generate new columns
    if (this.debug){console.log('formatData',d.name);}
    var gw=this;
    for (col in gw.columns){
        // console.log(col,gw.columns[col].type);
        if (gw.columns[col].type=="derived"){
            d[col]={}
            if (gw.columns[col].bestfn){d[col].best=gw.columns[col].bestfn(d);}
            if (gw.columns[col].errfn){d[col].err=gw.columns[col].errfn(d);}
            // console.log('new column',col,d[col])
        }else{
            // console.log('existing column',col,d[col])
        }
        if (d[col]){
            if ((d[col].err)&&(d[col].err.length==2)){
                d[col].errv =
                    [d[col].best+d[col].err[0],
                    d[col].best-d[col].err[1]];
            }else if (typeof d[col].best=="number"){
                d[col].errv =[d[col].best,d[col].best];
            }
            if (gw.columns[col].strfn){
                d[col].str=gw.columns[col].strfn(d);
                if (gw.columns[col].strfnnoerr){
                    d[col].strnoerr=gw.columns[col].strfnnoerr(d);
                }else{
                    d[col].strnoerr=gw.columns[col].strfn(d);
                }
            }else{
                d[col].str=gw.stdlabel(d,col);
                d[col].strnoerr=gw.stdlabelNoErr(d,col);
            }
        }
        // console.log(col,d[col])
        // console.log(col,d[col])
        // console.log(col,d[col]);
    }
}
GWCatalogue.prototype.makeGraph = function(){
    // create graph
    // console.log('makeGraph');
    this.svgcont = d3.select("div#graphcontainer").append("div")
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
        this.tooltip = d3.select("#"+this.holderid).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
}
GWCatalogue.prototype.getUrlVars = function(){
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
}

GWCatalogue.prototype.drawGraphInit = function(){
    // initialise graph drawing from data
    var gw = this;
    gw.loaded=0;
    gw.toLoad=4;
    gw.data=[];
    gw.optionsOn=false;
    gw.helpOn=false;
    gw.lengOn=false;

    gw.fileInDataDictDefault="json/datadict.json";
    gw.fileInDataDict = (gw.urlVars.dictFile) ? gw.urlVars.dictFile : gw.fileInDataDictDefault
    gw.fileInEventsDefault="json/events.json";
    gw.fileInEvents = (gw.urlVars.eventsFile) ? gw.urlVars.eventsFile : gw.fileInEventsDefault

    // if (gw.urlVars.lang){
    //     lang=gw.urlVars.lang;
    // }else{lang=gw.defaults.lang}

    gw.loadLangDefault()
    gw.loadLang(this.langIn)
    // gw.langdict_default = gw.loadLang(gw.langDefault,true);

    d3.json(gw.fileInEvents, function(error, dataIn) {
        if (error){
            console.log(error);
            alert("Fatal error loading input file: '"+gw.fileInEvents+"'. Sorry!");
        }
        gw.loaded++;
        if ((!dataIn.data)&&(dataIn.events)){
            //uses LOSC format, so need to convert
            gw.dataFormat='losc';
            dataIn.data={};
            if (this.debug){console.log('converting from LOSC format');}
            for (e in dataIn.events){
                // convert events to required format
                ev=dataIn.events[e];
                dataIn.data[e]={};
                for (c in ev){
                    if (typeof ev[c]=="number"){
                        dataIn.data[e][c]={best:ev[c]}
                    }else if (typeof ev[c]=="object"){
                        dataIn.data[e][c]={best:ev[c][0],err:[ev[c][1],ev[c][2]]}
                    }else{
                        dataIn.data[e][c]={best:ev[c]}
                    }
                }
                // convert links to required format
                if (dataIn.links[e]){
                    linkIn=dataIn.links[e];
                    dataIn.links[e]={}
                    for (l in linkIn){
                        if (linkIn[l].text.search('Paper')){
                            dataIn.links[e]['DetPaper']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'paper'}
                        }
                        if (linkIn[l].text.search('Open Data page')){
                            dataIn.links[e]['LOSCData']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'web-data'}
                        }
                        if (linkIn[l].text.search('GraceDB page')){
                            dataIn.links[e]['GraceDB']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'web-data'}
                        }
                        if (linkIn[l].text.search('Final Skymap')){
                            dataIn.links[e]['SkyMapFile']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'file'}
                        }
                        if (linkIn[l].text.search('Skymap View')){
                            dataIn.links[e]['SkyMapAladin']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'web'}
                        }
                    }
                }
            }

        }else{
            gw.dataFormat='std';
        }
        for (e in dataIn.data){
            dataIn.data[e].name=e;
            if (e[0]=='G'){t='GW'}
            else if (e[0]=='L'){t='LVT'}
            else{t=''}
            dataIn.data[e].type=t;
            if ((dataIn.links[e]) && (dataIn.links[e].LOSCData)){
                link=dataIn.links[e].LOSCData;
                link.url=gw.tl(link.url);
                dataIn.data[e].link=link;
            }
            gw.data.push(dataIn.data[e]);
        }
        if(gw.debug){console.log('data pre-format:',gw.data);}
        if (gw.loaded==gw.toLoad){
            gw.setColumns(gw.datadict);
            gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
            gw.makePlot();
            if(gw.debug){console.log('plotted');}
        }
    });
    d3.json(gw.fileInDataDict, function(error, dataIn) {
        if (error){
            alert("Fatal error loading input file: '"+gw.fileInDataDict+"'. Sorry!")
        }
        gw.loaded++;
        gw.datadict = (dataIn.datadict) ? dataIn.datadict : dataIn;
        if(gw.debug){console.log('data pre-format:',gw.data);}
        if (gw.loaded==gw.toLoad){
            gw.setColumns(gw.datadict);
            gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
            gw.makePlot();
            if(gw.debug){console.log('plotted');}
        }
    });
}
GWCatalogue.prototype.loadLang = function(lang){
    var gw=this;
    console.log(gw.lang,lang)
    var reload = (!gw.lang)||(gw.lang=="") ? false:true;
    gw.lang=lang;
    gw.langshort = (gw.lang.indexOf('-') > 0 ? gw.lang.substring(0,gw.lang.indexOf('-')) : gw.lang.substring(0,2));
    gw.fileInLang="lang/lang_"+lang+".json";
    d3.json(gw.fileInLang, function(error, dataIn) {
        if (error){
            if (gw.lang==gw.defaults.lang){
                console.log(error);
                alert("Fatal error loading input file: '"+gw.fileInLang+"'. Sorry!")
            }else if (gw.langshort!=gw.lang){
                if(gw.debug){console.log('Error loading language '+gw.lang+'. Displaying '+gw.langshort+' instead');}
                if (gw.urlVars.lang){
                    alert('Error loading language '+gw.lang+'. Displaying '+gw.langshort+' instead');
                    window.history.pushState({},null,gw.makeUrl({'lang':gw.defaults.lang}));
                }
                window.location.replace(gw.makeUrl({'lang':gw.langshort}));
            }else{
                if(gw.debug){console.log('Error loading language '+gw.lang+'. Reverting to '+gw.defaults.lang+' as default');}
                if (gw.urlVars.lang){
                    alert('Error loading language '+gw.lang+'. Reverting to '+gw.defaults.lang+' as default');
                }
                // console.log('error loading',gw.lang,error);
                // window.history.pushState({},null,gw.makeUrl({'lang':gw.defaults.lang}));
                // gw.loaded-=1;
                // gw.lang=null;
                // gw.loadLang(gw.defaults.lang);
                window.location.replace(gw.makeUrl({'lang':gw.defaults.lang}));
            }
        }
        if(gw.debug){console.log(gw.fileInLang);}
        for (ld in dataIn){
            if ((ld!="metadata")&(typeof dataIn[ld]!="string")){
                dataIn[ld]=dataIn[ld].text;
            }
        }
        gw.langdict=dataIn;
        if (reload){
            if (gw.debug){console.log('reloaded language',gw.lang);}
            // gw.setLang();
            gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
            gw.replot();
            d3.select(".lang-cont.current").classed("current",false);
            d3.select("#lang_"+gw.lang+"_cont").classed("current",true);
        }else{
            if (gw.debug){console.log('loaded language',gw.lang,gw.langdict);}
            gw.loaded++;
            // gw.setLang();
            if (gw.loaded==gw.toLoad){
                gw.setColumns(gw.datadict);
                gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
                gw.makePlot();
                if(gw.debug){console.log('plotted');}
            }
        }
    });
}
GWCatalogue.prototype.loadLangDefault = function(){
    var gw=this;
    var reload = (gw.lang) ? true:false;
    gw.fileInLangDefault="lang/lang_"+gw.defaults.lang+".json";
    d3.json(gw.fileInLangDefault, function(error, dataIn) {
        if (error){
            console.log(error);
            alert("Fatal error loading input file: '"+gw.fileInLang+"'. Sorry!")
        }
        if(gw.debug){console.log(gw.fileInLangDefault);}
        for (ld in dataIn){
            if ((ld!="metadata")&(typeof dataIn[ld]!="string")){
                dataIn[ld]=dataIn[ld].text;
            }
        }
        gw.langdictDefault=dataIn;
        gw.loaded++;
        if (gw.loaded==gw.toLoad){
            gw.setColumns(gw.datadict);
            gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
            gw.makePlot();
            if(gw.debug){console.log('plotted');}
        }
    });
}
GWCatalogue.prototype.setLang = function(){
    // should be run before graph is made
    if (this.debug){console.log('setting',this.lang);}
    for (k in this.langdictDefault){
        if (!this.langdict.hasOwnProperty(k)){
            if (this.debug){console.log('TRANSLATION WARNING: using default for '+k+' ('+this.lang+')');}
            this.langdict[k]=this.langdictDefault[k];
        }
    }
    d3.select("#options-x > .panel-title")
        .html(this.tl('%text.plotgw.horizontal-axis%'))
    d3.select("#options-y > .panel-title")
        .html(this.tl('%text.plotgw.vertical-axis%'))
    this.legenddescs = {GW:this.tl('%text.plotgw.legend.detections%'),
        LVT:this.tl('%text.plotgw.legend.candidates%')}
    d3.select('#lang-title')
        .html(this.tl('%text.plotgw.lang.title%'))
    d3.select('#lang-text')
        .html(this.tl('%text.plotgw.lang.text%'))
    d3.select('#page-title')
        .html(this.tl('%text.plotgw.page.title%'))
    if (this.langdict['meta.translator'] && this.langdict['meta.translator']!=''){
        d3.select('#lang-credit')
            .html(this.tl('%text.gen.langcredit% (%meta.name%): %meta.translator%'));
    }else{
        d3.select('#lang-credit')
            .html('');
    }
}
GWCatalogue.prototype.drawGraph = function(){
    // draw graph
    var gw = this;
    // gw.setSvgScales();
    gw.makeGraph();
    data = gw.data;
    if(this.debug){console.log('plotting ',gw.xvar,' vs ',gw.yvar);}
    // console.log(this.graphHeight);
    // console.log('drawGraph');
    // console.log('this.data',this.data);

    // don't want dots overlapping axis, so add in buffer to data domain
    // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    // yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    xBorder = (gw.columns[gw.xvar].border) ? gw.columns[gw.xvar].border : 2;
    xMin = (d3.min(data, gw.xErrM)<0) ? d3.min(data, gw.xErrM) - xBorder : 0;
    xMax = d3.max(data, gw.xErrP)+xBorder;
    gw.xScale.domain([xMin, xMax]);
    yBorder = (gw.columns[gw.yvar].border) ? gw.columns[gw.yvar].border : 2;
    yMin = (d3.min(data, gw.yErrM)<0) ? d3.min(data, gw.yErrM) - yBorder : 0;
    yMax = d3.max(data, gw.yErrP)+yBorder;
    gw.xAxLineOp = (yMin < 0) ? 0.5 : 0;
    gw.yAxLineOp = (xMin < 0) ? 0.5 : 0;
    if(this.debug){console.log('xy Ranges',xMin,xMax,yMin,yMax)}
    gw.yScale.domain([yMin, yMax]);
    if (gw.showerrors == null){gw.showerrors=true};

    // x-axis
    gw.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate("+gw.margin.left+"," +
            (gw.margin.top + gw.graphHeight) + ")");
    gw.svg.append("line")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("class","x-axis-line axis-line")
        .attr("x1",0).attr("x2",gw.graphWidth)
        .attr("y1",0).attr("y2",0)
        .style("stroke","rgb(100,100,100)").attr("stroke-width",5)
        .attr("opacity",gw.xAxLineOp);
    gw.svg.select(".x-axis.axis").call(gw.xAxis)
    gw.svg.select(".x-axis.axis").append("text")
        .attr("class", "x-axis axis-label")
        // .attr("x", (gw.relw[0]+gw.relw[1])*gw.graphWidth/2)
        .attr("x", gw.graphWidth/2)
        .attr("y", 1.2*(1+gw.scl)+"em")
        .style("text-anchor", "middle")
        .style("font-size",(1+gw.scl)+"em")
        .text(gw.getLabelUnit(gw.xvar,true));
    gw.svgcont.append("div")
        .attr("class", "x-axis axis-icon")
        // .attr("x", (gw.relw[0]+gw.relw[1])*gw.graphWidth/2)
        .style("right", gw.margin.right)
        .style("bottom", (gw.margin.bottom+(15*gw.scl)))
        .style("width",40*gw.scl+"px")
        .style("height",40*gw.scl+"px")
    .append("img")
        .attr("id","x-axis-icon")
        .attr("src",gw.getIcon(gw.xvar));
    //scale tick font-size
    d3.selectAll(".x-axis > .tick > text")
        .style("font-size",(0.8*(1+gw.scl))+"em");

    // y-axis
    gw.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")");
    gw.svg.append("line")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("class","y-axis-line axis-line")
        .attr("x1",0).attr("x2",0)
        .attr("y1",0).attr("y2",gw.graphHeight)
        .style("stroke","rgb(100,100,100)").attr("stroke-width",5)
        .attr("opacity",gw.yAxLineOp);
    gw.svg.select(".y-axis.axis").call(gw.yAxis)
    gw.svg.select(".y-axis.axis").append("text")
        .attr("class", "y-axis axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x",-gw.graphHeight/2)
        .attr("dy", (-20*(1+gw.scl))+"px")
        .style("text-anchor", "middle")
        .style("font-size",(1+gw.scl)+"em")
        .text(gw.getLabelUnit(gw.yvar,true));
    gw.svgcont.append("div")
        .attr("class", "y-axis axis-icon")
        // .attr("x", (gw.relw[0]+gw.relw[1])*gw.graphWidth/2)
        .style("top", gw.margin.top)
        .style("left", (gw.margin.left-(40*gw.scl))/2.)
        .style("width",(40*gw.scl)+"px")
        .style("height",(40*gw.scl)+"px")
    .append("img")
        .attr("id","y-axis-icon")
        .attr("src",gw.getIcon(gw.yvar));
    //scale tick font-size
    d3.selectAll(".y-axis > .tick > text")
        .style("font-size",(0.8*(1+gw.scl))+"em");

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
    // add top of x error bar
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
    // add bottom of x error bar
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
    // if (!gw.showerrors){gw.toggleErrors();}

    // add highlight circle
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
    if (gw.d){
        if(this.debug){console.log('current gwcat.d:',gw.d);}
        gw.initHighlight(gw.d);
    }else{
        if(this.debug){console.log('no gwcat.d');}
    }
    // draw dots
    gw.svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("transform", "translate("+gw.margin.left+","+
        gw.margin.top+")")
      .attr("r", Math.min(10.,7/gw.sksc))
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
    optionsClass = (this.optionsOn) ? "graph-icon" : "graph-icon hidden";
    this.optionsbg = d3.select('#options-bg');
    this.optionsouter = d3.select('#options-outer')
    d3.select("#svg-container").append("div")
        .attr("id","options-icon")
        .attr("class",optionsClass)
        .style({"right":gw.margin.right+gw.margin.top+10,"top":0,"width":gw.margin.top,"height":gw.margin.top})
        .on("mouseover", function(d) {
              gw.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              gw.tooltip.html(gw.tl('%tooltip.plotgw.showoptions%'))
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
    .append("img")
        .attr("src","img/settings.svg")
        .on("click",function(){gw.showOptions();});
    this.optionsbg.on("click",function(){gw.hideOptions();});
    this.optionsouter
        .style("top","200%");
    this.optionsouter.select("#options-close")
        .on("click",function(){gw.hideOptions();});

    // add info icon
    infoClass = ((!this.optionsOn)&(!this.helpOn)&(!this.langOn)) ? "graph-icon" : "graph-icon hidden";
    d3.select("#svg-container").append("div")
        .attr("id","info-icon")
        .attr("class",infoClass)
        .style({"right":gw.margin.right,"top":0,"width":gw.margin.top,"height":gw.margin.top})
        .on("mouseover", function(d) {
              gw.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              gw.tooltip.html(gw.tl('%tooltip.plotgw.showinfo%'))
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
    .append("img")
        .attr("src","img/info.svg")
        .on("click",function(){gw.hideOptions();gw.hideHelp();gw.hideLang();});

    //add help icon
    helpClass = (this.helpOn) ? "graph-icon" : "graph-icon hidden";
    this.helpouter = d3.select('#help-outer')
    d3.select("#svg-container").append("div")
        .attr("id","help-icon")
        .attr("class",helpClass)
        .style({"right":gw.margin.right+2*(gw.margin.top+10),"top":0,"width":40*gw.ysc,"height":40*gw.ysc})
        .on("mouseover", function(d) {
              gw.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              gw.tooltip.html(gw.tl('%tooltip.plotgw.showhelp%'))
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
        }).append("img")
        .attr("src","img/help.svg")
        .on("click",function(){gw.showHelp();});
    this.helpouter
        .style("top","200%");
    this.helpouter.select("#help-close")
        .on("click",function(){gw.hideHelp();});

    // add language button
    langClass = (this.langOn) ? "graph-icon" : "graph-icon hidden";
    this.langouter = d3.select('#lang-outer')
    d3.select("#svg-container").append("div")
        .attr("id","lang-icon")
        .attr("class",langClass)
        .style({"right":gw.margin.right+3*(gw.margin.top+10),"top":0,"width":40*gw.ysc,"height":40*gw.ysc})
        .on("mouseover", function(d) {
              gw.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              gw.tooltip.html(gw.tl('%tooltip.plotgw.showlang%'))
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
        }).append("img")
        .attr("src","img/lang.svg")
        .on("click",function(){console.log('showing lang panel');gw.showLang();});
    // this.langbg.on("click",function(){gw.hideLang();});
    this.langouter
        .style("top","200%");
    this.langouter.select("#lang-close")
        .on("click",function(){gw.hideLang();});

    //add error toggle button
    errorClass = (this.showerrors) ? "errors-show" : "errors-hide";
    // errordivClass = (this.showerrors) ? "graph-icon" : "graph-icon hidden";
    d3.select("#svg-container").append("div")
        .attr("id","errors-icon")
        .attr("class","graph-icon"+((this.showerrors) ? "" : " hidden"))
        .style({"right":gw.margin.right+4*(gw.margin.top+10),"top":0,"width":gw.margin.top,"height":gw.margin.top})
        .on("mouseover",function(){
            if (gw.showerrors){
                gw.showTooltipManual("%tooltip.plotgw.errors.off%");
            }else{
                gw.showTooltipManual("%tooltip.plotgw.errors.on%");
            }
        })
        .on("mouseout",function(){
            gw.hideTooltipManual();
        }).append("img")
        .attr("src","img/errors.svg")
        .attr("class",errorClass)
        .attr("id","errors-img")
        .on("click",function(){gw.toggleErrors();gw.hideTooltipManual();});

    //add share button
    d3.select("#svg-container").append("div")
        .attr("id","share-icon")
        .attr("class","graph-icon hidden")
        .style({"right":gw.margin.right+5*(gw.margin.top+10),"top":0,"width":gw.margin.top,"height":gw.margin.top})
        .on("mouseover",function(){
            gw.showTooltipManual("%tooltip.plotgw.share%");
        })
        .on("mouseout",function(){
            gw.hideTooltipManual();
        }).append("img")
        .attr("src","img/share.svg")
        .attr("class","hidden")
        .attr("id","share-img")
        .on("click",function(){gw.showShare();gw.hideTooltipManual();});
    d3.select("#share-bg").on("click",function(){gw.hideShare();});
    d3.select("#share-close").on("click",function(){gw.hideShare();});
}

GWCatalogue.prototype.moveHighlight = function(d){
    // move highlight circle
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
GWCatalogue.prototype.initHighlight = function(d){
    // move highlight circle
    var gw=this;
    gw.svg.select("#highlight")
        .attr("cx",gw.xMap(d)).attr("cy",gw.yMap(d))
        .style("opacity",1);
}
GWCatalogue.prototype.updateErrors = function(){
    // update error bars

    if ((this.columns[this.xvar]["errcode"]=="")||(!this.showerrors)){
        // remove x-errors
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
        // add/update x-errors
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
    if ((this.columns[this.yvar]["errcode"]=="")||(!this.showerrors)){
        // remove y-errors
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
        // add/update y-errors
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
GWCatalogue.prototype.toggleErrors = function(){
    // toggle showing errors
    // console.log(this.svgcont.select("#errors-img"));
    if (this.showerrors){
        this.showerrors = false;
        this.svgcont.select("#errors-icon ")
            .attr("class","graph-icon hidden")
        this.svgcont.select("#errors-img ")
            .attr("class","errors-hide")
    }else{
        this.showerrors = true;
        this.svgcont.select("#errors-icon ")
            .attr("class","graph-icon")
        this.svgcont.select("#errors-img")
            .attr("class","errors-show")
    }
    // console.log("toggling errors");
    this.updateErrors();
    this.redrawLabels();
    this.updateUrl();
}
GWCatalogue.prototype.updateXaxis = function(xvarNew) {
    // update x-xais to xvarNew
    // set global variable
    this.xvar = xvarNew;
    var gw=this;
    var data=gw.data;
    // d3.csv("csv/gwcat.csv", function(error, data) {

        // change string (from CSV) into number format
        // data.forEach(gw.formatData);

        // don't want dots overlapping axis, so add in buffer to data domain
        // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
        xBorder= (gw.columns[gw.xvar].border) ? gw.columns[gw.xvar].border : 2
        if (gw.columns[gw.xvar].errcode==""){
            xMin = (d3.min(data, gw.xValue)<0) ? d3.min(data, gw.xValue) - xBorder : 0;
            xMax = d3.max(data, gw.xValue)+xBorder;
            gw.xScale.domain([xMin, xMax]);
        }else{
            xMin = (d3.min(data, gw.xErrM)<0) ? d3.min(data, gw.xErrM) - xBorder : 0;
            xMax = d3.max(data, gw.xErrP)+xBorder;
            gw.xScale.domain([xMin, xMax]);
        }
        gw.yAxLineOp = (xMin < 0) ? 0.5 : 0;

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
            .text(gw.getLabelUnit(gw.xvar,true));
        gw.svgcont.select("#x-axis-icon")
            .attr("src",gw.getIcon(gw.xvar));
        gw.svg.select(".y-axis-line.axis-line")
            .transition()
            .duration(750)
            .attr("x1",gw.xScale(0)).attr("x2",gw.xScale(0))
            .attr("opacity",gw.yAxLineOp);
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
    window.history.pushState({},null,gw.makeUrl({'x':gw.xvar}));
}

GWCatalogue.prototype.updateYaxis = function(yvarNew) {
    // update y-axis to yvarNew
    // set global variable
    var gw=this;
    var data=gw.data;
    this.yvar = yvarNew;

    // d3.csv("csv/gwcat.csv", function(error, data) {

        // change string (from CSV) into number format
        // data.forEach(gw.formatData);
        // don't want dots overlapping axis, so add in buffer to data domain
        // yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
        yBorder= (gw.columns[gw.yvar].border) ? gw.columns[gw.yvar].border : 2
        if (gw.columns[gw.yvar].errcode==""){
            yMin = (d3.min(data, gw.yValue)<0) ? d3.min(data, gw.yValue) - yBorder : 0;
            gw.yScale.domain([yMin, d3.max(data, gw.yValue)+yBorder]);
        }else{
            yMin = (d3.min(data, gw.yErrM)<0) ? d3.min(data, gw.yErrM) - yBorder : 0;
            gw.yScale.domain([yMin, d3.max(data, gw.yErrP)+yBorder]);
        }
        gw.xAxLineOp = (yMin < 0) ? 0.5 : 0;
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
            .text(gw.getLabelUnit(gw.yvar,true));
        gw.svgcont.select("#y-axis-icon")
            .attr("src",gw.getIcon(gw.yvar));
        gw.svg.select(".x-axis-line.axis-line")
            .transition()
            .duration(750)
            .attr("y1",gw.yScale(0)).attr("y2",gw.yScale(0))
            .attr("opacity",gw.yAxLineOp);
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
    window.history.pushState({},null,gw.makeUrl({'y':gw.yvar}));
}
GWCatalogue.prototype.addOptions = function(){
    // add options boxetc.
    // console.log("add options");
    var gw=this;
    // add buttons
    var col;
    var divx = document.getElementById('x-buttons');
    var divy= document.getElementById('y-buttons');

    for (col in gw.columns){
        if (gw.columns[col].avail){
            var newoptdivx = document.createElement('div');
            newoptdivx.className = 'option option-x';
            newoptdivx.setAttribute("id","button-divx-"+col);
            divx.appendChild(newoptdivx);
            var newoptinputx = document.createElement('img');
            newoptinputx.type = 'submit';
            newoptinputx.name = col;
            // newoptinputx.value = gw.getLabel(col);
            newoptinputx.setAttribute("id","buttonx-"+col);
            newoptinputx.classList.add("button");
            newoptinputx.classList.add("button-x");
            newoptinputx.src = gw.getIcon(col);
            newoptinputx.label = gw.getLabel(col);
            if (col==this.xvar){newoptdivx.classList.add("down")};
            // newoptinputx.innerHTML = "<img src="+gw.getIcon(col)+" title='"+gw.getLabel(col)+"'>";
            newoptinputx.addEventListener('click',function(){
                oldXvar = gw.xvar;
                newXvar = this.id.split('buttonx-')[1]
                document.getElementById("button-divx-"+oldXvar).classList.remove("down")
                document.getElementById("button-divx-"+newXvar).classList.add("down")
                this.classList.add("down");
                gw.updateXaxis(this.name);
            });
            newoptinputx.onmouseover = function(e){
                gw.showTooltip(e,this.id.split('buttonx-')[1],type="column");};
            newoptinputx.onmouseout = function(){gw.hideTooltip();};
            newoptdivx.appendChild(newoptinputx);

            var newoptdivy = document.createElement('div');
            newoptdivy.className = 'option option-y';
            newoptdivy.setAttribute("id","button-divy-"+col);
            divy.appendChild(newoptdivy);
            var newoptinputy = document.createElement('img');
            newoptinputy.type = 'submit';
            newoptinputy.name = col;
            // newoptinputy.value = gw.getLabel(col);
            newoptinputy.setAttribute("id","buttony-"+col);
            newoptinputy.classList.add("button");
            newoptinputy.classList.add("button-y");
            newoptinputy.src = gw.getIcon(col);
            newoptinputy.label = gw.getLabel(col);
            if (col==this.yvar){newoptdivy.classList.add("down")};
            newoptinputy.innerHTML = "<img src="+gw.getIcon(col)+" title='"+gw.getLabel(col)+"'>";
            newoptinputy.addEventListener('click',function(){
                oldYvar = gw.yvar;
                newYvar = this.id.split('buttony-')[1]
                document.getElementById("button-divy-"+oldYvar).classList.remove("down")
                document.getElementById("button-divy-"+newYvar).classList.add("down")
                this.classList.add("down");
                gw.updateYaxis(this.name);
            });
            newoptinputy.onmouseover = function(e){
                // console.log(this.id.split('buttony-')[1])
                gw.showTooltip(e,this.id.split('buttony-')[1],type="column");};
            newoptinputy.onmouseout = function(){gw.hideTooltip();};
            newoptdivy.appendChild(newoptinputy);
        }
    }

    // gw.langs={
    //     "en":{code:"en",name:"English (en)"},
    //     "fr":{code:"fr",name:"Francais (fr)"},
    //     "de":{code:"de",name:"Deutsch (de)"},
    // }
    // var divl= document.getElementById('lang-buttons');
    // for (lang in gw.langs){
    //     var newoptdivl = document.createElement('div');
    //     newoptdivl.className = 'option option-lang';
    //     newoptdivl.setAttribute("id","button-divl-"+lang);
    //     divy.appendChild(newoptdivy);
    //     var newoptinputl = document.createElement('span');
    //     newoptinputl.type = 'submit';
    //     newoptinputl.name = lang;
    //     // newoptinputy.value = gw.getLabel(col);
    //     newoptinputl.setAttribute("id","buttonl-"+lang);
    //     newoptinputl.classList.add("button");
    //     newoptinputl.classList.add("buttonl");
    //     newoptinputl.src = gw.getIcon(col);
    //     newoptinputl.label = gw.getLabel(col);
    //     if (lang==this.lang){newoptdivl.classList.add("down")};
    //     newoptinputl.innerHTML = lang;
    //     newoptinputl.addEventListener('click',function(){
    //         oldLang = gw.lang;
    //         newLang = this.id.split('buttonl-')[1]
    //         document.getElementById("button-divl-"+oldLang).classList.remove("down")
    //         document.getElementById("button-divl-"+newLang).classList.add("down")
    //         this.classList.add("down");
    //         // gw.updateLang(this.name);
    //     });
    //     newoptinputl.onmouseover = function(e){
    //         // console.log(this.id.split('buttony-')[1])
    //         gw.showTooltip(e,this.id.split('buttonl-')[1],type="lang");};
    //     newoptinputy.onmouseout = function(){gw.hideTooltip();};
    //     newoptdivy.appendChild(newoptinputl);
    // }
}

GWCatalogue.prototype.showOptions = function(){
    //show options
    if (this.helpOn){this.hideHelp()}
    if (this.langOn){this.hideLang()}
    this.optionsOn=true;
    // fade in semi-transparent background layer (greys out image)
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style({"opacity":0.5});
    // this.optionsbg.style("height","100%");
    //fade in infopanel
    this.optionsouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    // this.infopanel.html(this.iptext(d));
    this.optionsouter.style("left", document.getElementById('infoouter').offsetLeft-1)
        .style("top", document.getElementById('infoouter').offsetTop-1)
        .style("width",document.getElementById('infoouter').offsetWidth-2)
        .style("height",document.getElementById('infoouter').offsetHeight-22);
    if (this.portrait){
        document.getElementById('options-x').classList.add('bottom')
        document.getElementById('options-y').classList.add('bottom')
    }else{
        document.getElementById('options-x').classList.remove('bottom')
        document.getElementById('options-y').classList.remove('bottom')
    }
    document.getElementById("options-icon").classList.remove("hidden");
    document.getElementById("info-icon").classList.add("hidden");
    this.updateUrl();
}
GWCatalogue.prototype.hideOptions = function(d) {
    // hide options box
    this.optionsOn=false;
    // fade out infopanel
    this.optionsouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.optionsouter.style("top","200%");
    // fade out semi-transparent background
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style("opacity",0);
    // this.optionsbg.style("height",0);
    // d3.selectAll(".info").attr("opacity",0);
    document.getElementById("options-icon").classList.add("hidden");
    document.getElementById("info-icon").classList.remove("hidden");
    console.log(this.getPanel())
    this.updateUrl();
}
GWCatalogue.prototype.addHelp = function(){
    // add help to panel
    d3.select("#help-title")
        .html(this.tl("%text.plotgw.help.title%"))
    d3.select("#help-text")
        .html(this.tl("%text.plotgw.help.text%%text.plotgw.help.about%"));
    d3.select("#help-help-text")
        .html(this.tl("%text.plotgw.help.help%"));
    d3.select("#help-settings-text")
        .html(this.tl("%text.plotgw.help.settings%"));
    d3.select("#help-errors-text")
        .html(this.tl("%text.plotgw.help.errors%"));
    d3.select("#help-info-text")
        .html(this.tl("%text.plotgw.help.info%"));
    d3.select("#help-lang-text")
        .html(this.tl("%text.plotgw.help.lang%"));
    d3.select("#help-share-text")
        .html(this.tl("%text.plotgw.help.share%"));
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
GWCatalogue.prototype.showHelp = function(){
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
GWCatalogue.prototype.hideHelp = function(d) {
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

GWCatalogue.prototype.addLang = function(replot){
    // add help to panel
    var gw=this;

    d3.select("#lang-title")
        .html(this.tl("%text.plotgw.lang.title%"))
        d3.select("#lang-text")
            .html(this.tl("%text.plotgw.lang.text%"));
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
        if (lang==gw.lang){
            langdiv.classList.add('current')
        }
        langdiv.style.height = gw.langcontHeight;
        langdiv.setAttribute("id",'lang_'+lang+'_cont');
        langicondiv = document.createElement('div');
        langicondiv.className='panel-cont-icon'
        langicondiv.setAttribute("id",'lang_'+lang+'_icon');
        langicondiv.innerHTML =lang;
        langicondiv.addEventListener('click',function(){
            newlang = this.id.split('_')[1];
            oldlang = gw.lang;
            if (newlang!=oldlang){
                window.history.pushState({},null,gw.makeUrl({'lang':newlang}));
                gw.loadLang(newlang);
            }

        });
        langdiv.appendChild(langicondiv);
        // langdiv.onmouseover = function(e){
        //     gw.showTooltip(e,this.id.split("icon")[0])}
        // labimgdiv.onmouseout = function(){gw.hideTooltip()};
        langtxtdiv = document.createElement('div');
        langtxtdiv.className = 'panel-cont-text panel-lang';
        langtxtdiv.setAttribute("id",'lang-'+lang+'-txt');
        langtxtdiv.style.height = "100%";
        langtxtdiv.style["font-size"] = (1.3*gw.sksc)+"em";
        langtxtdiv.innerHTML = gw.langs[lang].name;
        // langtxtdiv.onmouseover = function(e){
        //     gw.showTooltip(e,"%meta.translator%","manual")}
        // langtxtdiv.onmouseout = function(){gw.hideTooltip()};
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

GWCatalogue.prototype.showLang = function(){
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
GWCatalogue.prototype.hideLang = function(d) {
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
GWCatalogue.prototype.showShare = function(){
    //show share pot
    var gw=this;
    d3.select("#share-bg").style("height","100%").style("display","block");
    shareouter=d3.select('#share-outer')
    shareouter.transition()
       .duration(500)
       .style("opacity",1);
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
            gw.tl("https://twitter.com/intent/tweet?text=%share.plotgw.twitter.text%&url=")+
                gw.url.replace("file:///Users/chrisnorth/Cardiff/GravWaves/Outreach/","http%3A%2F%2Fchrisnorth.github.io/").replace(/:/g,'%3A').replace(/\//g,'%2F')+
                gw.tl("&hashtags=%share.plotgw.twitter.hashtag%"));
            // gw.tl("https://twitter.com/intent/tweet?text=%share.plotgw.twitter.text%&url=").replace(/\s/g,"%20")+
            // gw.makeUrl().replace("file:///","http%3A%2F%2F").replace(/&/g,'%26').replace(/:/g,'%3A').replace(/\//g,'%2F').replace(/\?/g,'%3F').replace(/=/g,'%3D')+
            // gw.tl("&hashtags=%share.plotgw.twitter.hashtag%"));
}
GWCatalogue.prototype.hideShare = function(){
    //show share pot
    d3.select("#share-bg").style("height","0").style("display","none");
    d3.select('#share-outer').transition()
       .duration(500)
       .style("opacity",0);
}


GWCatalogue.prototype.showTooltip = function(e,tttxt,type){
    // add tooltip to sketch
    ttSk = document.getElementById("tooltipSk")
    ttSk.style.transitionDuration = "200ms";
    ttSk.style.opacity = 0.9;
    ttSk.style.left = e.pageX + 10 ;
    ttSk.style.top = e.pageY - 10 ;
    ttSk.style.width = "auto";
    ttSk.style.height = "auto";
    if (type=="manual"){
        ttSk.innerHTML = this.tl(tttxt);
    }else{
        if (this.columns[tttxt]){
            ttSk.innerHTML = this.tl(this.columns[tttxt].name);
        }else if(this.ttlabels[tttxt]){
            ttSk.innerHTML = this.tl(this.ttlabels[tttxt]);
        }else{
            ttSk.innerHTML = this.tl(tttxt);
        }
    }
}
GWCatalogue.prototype.hideTooltip = function(){
    // hide tooltip to skwtch
    ttSk = document.getElementById("tooltipSk");
    ttSk.style.transitionDuration = "500ms";
    ttSk.style.opacity = 0.;
}
GWCatalogue.prototype.showTooltipManual = function(txt){
    var gw=this;
    gw.tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    gw.tooltip.html(gw.tl(txt))
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY-10) + "px")
        .style("width","auto")
        .style("height","auto");
}
GWCatalogue.prototype.hideTooltipManual = function(){
    gw.tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}
GWCatalogue.prototype.makePlot = function(){
    // make plot (calls other function)
    this.setLang();
    this.drawGraph();
    this.updateXaxis(this.xvar);
    this.updateYaxis(this.yvar);
    this.drawSketch();
    // this.addButtons();
    this.addOptions();
    this.addHelp();
    this.addLang(false);
    panel = (this.urlVars.panel) ? this.urlVars.panel : this.getPanel();
    this.setPanel(panel);
    this.adjCss();
    // if (this.optionsOn){
    //     // console.log('showing options')
    //     this.showOptions();
    // }
    // if (this.helpOn){
    //     // console.log('showing options')
    //     this.showHelp();
    // }
}
GWCatalogue.prototype.replot = function(){
    // remove plots and redraw (e.g. on window resize)
    var gw=this;
    // console.log(gw.sketchName);
    // remove elements
    d3.select("svg#svgSketch").remove()
    d3.select("div#svg-container").remove()
    // d3.selectAll("div.labcont").remove()
    // redraw graph and sketch
    this.redraw=true;
    this.setScales();
    this.setLang();
    this.drawGraph();
    this.drawSketch();
    this.addHelp();
    this.adjCss();
    // this.redrawLabels();
    this.setPanel(this.getPanel());
    // if (this.optionsOn){this.showOptions();}
    // if (this.helpOn){this.showHelp();}
    // if (this.langOn){this.showLang();}
    this.data.forEach(function(d){
        // gwcat.formatData;
        if (d.name==gw.sketchName){
            // console.log('resize:',d.name,gw.sketchName);
            gw.updateSketch(d);
        }
    });
    gwcat.redraw=false;
    // gwcat.initButtons();
}
// define fly-in & fly-out

//labels to add and keep updated
