
/**
 * Copyright (c) 2019 Chris North
 * Contact: Chris North <chris.north@astro.cf.ac.uk>
 * This source is subject to the license found in the file 'LICENSE' which must
 * be distributed together with this source. All other rights reserved.
 *
 * THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
 * EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
 */
 // Define GWCatalogue class
function GWCatalogue(inp){
    // set initial axes
    // this.init()
    var gw=this;
    this.inp=inp;
    this.getUrlVars();
    if (this.urlVars.datasrc){this.datasrc=this.urlVars.datasrc}
    else{this.datasrc = (inp)&&(inp.datasrc) ? inp.datasrc : "local"}

    if (this.urlVars.hasOwnProperty('confirmedOnly')){
        this.confirmedOnly=JSON.parse(this.urlVars.confirmedOnly);
    }else{this.confirmedOnly = (inp)&&(inp.hasOwnProperty('confirmedOnly')) ? JSON.parse(inp.confirmedOnly) : true}

    this.holderid = (inp)&&(inp.holderid) ? inp.holderid : "plotgw-cont";
    if(this.debug){console.log('creating plot in #'+this.holderid)}
    if ((inp)&&(inp.clearhtml)){
        if(this.debug){console.log('clearing current html from '+gw.holderid)}
        d3.select('#'+gw.holderid).html('')
    }
    //set default language from browser
    this.langIn = "en";
    // this.langIn = (navigator) ? (navigator.userLanguage||navigator.systemLanguage||navigator.language||browser.language) : "en";
    // console.log('browser language: '+this.langIn)
    //set lang from query (if present)
    if((inp)&&(inp.lang)&&(typeof inp.lang=="string")) this.langIn = inp.lang;
    // set language from urlVars (if present)
    this.langIn = ((this.urlVars.lang)&&(typeof this.urlVars.lang=="string")) ? this.urlVars.lang : this.langIn
    // console.log('initial language: '+this.langIn)
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
    d3.select('#nojs').style('display','none')
    if (d3.select("#fb-root").empty()){
        d3.select("#"+this.holderid).insert("div",":first-child")
            .attr("id","fb-root")
        fbfn=function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.9";
          fjs.parentNode.insertBefore(js, fjs);
        }
        fbfn(document, 'script', 'facebook-jssdk');
    }
    if (d3.select("#hdr").empty()){
        if(this.debug){console.log('adding hdr')}
        d3.select("#"+this.holderid).insert("div","#fb-root + *")
            .attr("id","hdr")
            .html('<h1 id="page-title"></h1>')
    }
    if (d3.select("#graphcontainer").empty()){
        if(this.debug){console.log('adding graphcontainer')}
        d3.select("#"+this.holderid).insert("div","#hdr + *")
            .attr("id","graphcontainer")
    }
    if (d3.select("#infoouter").empty()){
        if(this.debug){console.log('adding infoouter')}
        d3.select("#"+this.holderid).insert("div","#graphcontainer + *")
            .attr("id","infoouter")
            .attr("class","colourise")
            .html('<div id="sketchcontainer" class="colourise"></div><div id="labcontainer" class="colourise"></div><div id="select-next" class="select-event select-next colourise"></div><div id="select-previous" class="select-event select-previous colourise"></div>')
    }
    if (d3.select("#options-outer").empty()){
        if(this.debug){console.log('adding options-outer')}
        d3.select("#"+this.holderid).insert("div","#infoouter + *")
            .attr("id","options-outer").attr("class","panel-outer colourise")
            .html('<div id="options-gen" class="options-box"><div class="panel-title">Presets</div><div class="options-buttons" id="preset-options"></div></div><div id="options-x" class="options-box"><div class="panel-title">Horizontal Axis</div><div class="options-buttons" id="x-buttons-all"></div><div class="options-buttons" id="x-buttons-conf"></div></div><div id="options-y" class="options-box"><div class="panel-title">Vertical axis</div><div class="options-buttons" id="y-buttons-all"></div><div class="options-buttons" id="y-buttons-conf"></div></div><div id="display-options" class="options-box"><div class="panel-title">Display</div><div class="display-buttons" id="display-options"></div></div><div id="options-close" class="panel-close"></div></div>');
        d3.select("#preset-options").append("div")
            .attr("id","buttonpre-conf").attr("class","panel-cont")
            .html('<div class="option option-pre conf-only"><img class="button button-pre" id="preset-conf-img" src="img/confirmed.svg"></div><div class="option-pre-text"><span class="option-pre-desc" id="conf-only-text"></span></br>(<span id="conf-only-x-axis"></span> : <span id="conf-only-y-axis"></span>)</span></div>');
        d3.select("#preset-options").append("div")
            .attr("id","buttonpre-cand").attr("class","panel-cont")
            .html('<div class="option option-pre cand-only"><img class="button button-pre" id="preset-cand-img" src="img/candidate.svg"></div><div class="option-pre-text"><span class="option-pre-desc" id="cand-only-text"></span></br>(<span id="cand-only-x-axis"></span> : <span id="cand-only-y-axis"></span>)</div>');
        d3.select("#preset-options").append("div")
            .attr("id","buttonpre-all").attr("class","panel-cont")
            .html('<div class="option option-pre allsrc"><img class="button button-pre" id="preset-all-img" src="img/allsources.svg"></div><div class="option-pre-text"><span class="option-pre-desc" id="allsrc-text"></span></br>(<span id="allsrc-x-axis"></span> : <span id="allsrc-y-axis"></span>)</div>');
        d3.select("#preset-options").append("div")
            .attr("class","panel-block")
            .html('<span id="preset-warn">TEXT</span>&nbsp;<span id="preset-filter-link" style="cursor:pointer;color:red">&rarr;</span></div>');
    }
    if (d3.select("#help-outer").empty()){
        if(this.debug){console.log('adding help-outer')}
        d3.select('#'+this.holderid).insert("div","#options-outer + *")
            .attr("id","help-outer").attr("class","panel-outer colourise")
        d3.select("#help-outer").append("div")
            .attr("id","help-title").attr("class","panel-title")
        d3.select("#help-outer").append("div")
            .attr("id","help-block-icons").attr("class","panel-block")
        d3.select("#help-block-icons").append("div")
            .attr("id","help-help-cont").attr("class","panel-cont colourise")
            .html('<img class="panel-cont-img" src="img/help.svg"><div class="panel-cont-text" id="help-help-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-info-cont").attr("class","panel-cont colourise")
            .html('<img class="panel-cont-img" src="img/info.svg"><div class="panel-cont-text" id="help-info-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-settings-cont").attr("class","panel-cont colourise")
            .html('<img class="panel-cont-img" src="img/settings.svg"><div class="panel-cont-text" id="help-settings-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-lang-cont").attr("class","panel-cont colourise")
            .html('<img class="panel-cont-img" src="img/lang.svg"><div class="panel-cont-text" id="help-lang-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-errors-cont").attr("class","panel-cont colourise")
            .html('<img class="panel-cont-img" src="img/errors.svg"><div class="panel-cont-text" id="help-errors-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-share-cont").attr("class","panel-cont colourise")
            .html('<img class="panel-cont-img" src="img/share.svg"><div class="panel-cont-text" id="help-share-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-filter-cont").attr("class","panel-cont colourise")
            .html('<img class="panel-cont-img" src="img/filter.svg"><div class="panel-cont-text" id="help-filter-text"></div>')
        d3.select("#help-block-icons").append("div")
            .attr("id","help-search-cont").attr("class","panel-cont colourise")
            .html('<img class="panel-cont-img" src="img/search.svg"><div class="panel-cont-text" id="help-search-text"></div>')
        d3.select("#help-outer").append("div")
            .attr("id","help-close").attr("class","panel-close")
        d3.select("#help-outer").append("div")
            .attr("id","help-block-text").attr("class","panel-text")
            .html('<div class="panel-text" id="help-text"></div>')
    }
    if (d3.select('#lang-outer').empty()){
        if(this.debug){console.log('adding lang-outer')}
        d3.select('#'+this.holderid).insert("div","#help-outer + *")
            .attr("id","lang-outer").attr("class","panel-outer colourise")
        d3.select("#lang-outer").append("div")
            .attr("id","lang-title").attr("class","panel-title")
        d3.select("#lang-outer").append("div")
            .attr("id","lang-block-icons").attr("class","panel-block panel-block-full")
        // d3.select("#lang-outer").append("div")
        //     .attr("id","lang-block-credit").attr("class","panel-block panel-block-full")
        d3.select("#lang-outer").append("div")
            .attr("id","lang-close").attr("class","panel-close")
    }
    if (d3.select('#filter-outer').empty()){
        if(this.debug){console.log('adding filter-outer')}
        d3.select('#'+this.holderid).insert("div","#help-outer + *")
            .attr("id","filter-outer").attr("class","panel-outer colourise")
        d3.select("#filter-outer").append("div")
            .attr("id","filter-title").attr("class","panel-title")
        d3.select("#filter-outer").append("div")
            .attr("id","filter-options").attr("class","panel-block panel-block-full")
        d3.select("#filter-outer").append("div")
            .attr("id","filter-block").attr("class","panel-block panel-block-full")
        d3.select("#filter-outer").append("div")
            .attr("id","filter-close").attr("class","panel-close")
    }
    if (d3.select('#share-bg').empty()){
        if(this.debug){console.log('adding share-bg')}
        d3.select('#'+this.holderid).insert("div","#filter-outer + *")
            .attr("id","share-bg").attr("class","popup-bg colourise")
    }
    if (d3.select('#share-outer').empty()){
        if(this.debug){console.log('adding share-outer')}
        d3.select('#'+this.holderid).insert("div","#share-bg + *")
            .attr("id","share-outer").attr("class","popup-outer colourise")
        d3.select('#share-outer').append("div")
            .attr("id","share-block-icon-twitter").attr("class","popup-button")
            .html('<a href="https://twitter.com/intent/tweet" class="twitter-share-button" id="twitter-share-button"><img class="share-icon" src="img/twitter.png"></a><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>')
        d3.select('#share-outer').append("div")
            .attr("class","fb-share-button popup-button")
            .attr("data-href","http://chrisnorth.github.io/plotgw/")
            .attr("data-layout","button")
            .attr("data-size","small")
            .attr("data-mobile-iframe","true")
            .html('<a class="fb-xfbml-parse-ignore" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fchrisnorth.github.io%2Fplotgw%2F&amp;src=sdkpreparse">Share</a>')
        d3.select('#share-outer').append('div')
            .attr("class","popup-button")
            .attr("id","share-block-icon-copy")
            .html('<button id="copy-button" data-clipboard-text="URL" title="Copy link to clipboard"><img src="img/copy.svg"></button><span id="copy-conf">&#x2713</span>')
        d3.select('#share-outer').append("div")
            .attr("id","share-close").attr("class","popup-close")
    }
    if (d3.select('#search-bg').empty()){
        if(this.debug){console.log('adding search-bg')}
        d3.select('#'+this.holderid).insert("div","#search-outer + *")
            .attr("id","search-bg").attr("class","popup-bg colourise")
    }
    if (d3.select('#search-outer').empty()){
        if(this.debug){console.log('adding search-outer')}
        d3.select('#'+this.holderid).insert("div","#search-bg + *")
            .attr("id","search-outer").attr("class","popup-outer colourise")
            .html('<div id="search-close" class="popup-close"></div>')
    }
    if (d3.select('#tooltipSk').empty()){
        if(this.debug){console.log('adding tooltip')}
        d3.select('#'+this.holderid).insert("div","#search-outer + *")
            .attr("id","tooltipSk").attr("class","tooltip colourise")
    }
    var clipboard = new Clipboard('#copy-button');
    clipboard.on('success',function(e){
        d3.select('#copy-conf').transition().duration(500).style("opacity",1)
        d3.select('#copy-conf').transition().delay(2000).duration(500).style("opacity",0)
    })

    //initialyse common values
    this.flySp=1000;
    this.defaults = {
        xvar:"M1",
        yvar:"M2",
        panel:"info",
        lang:"en",
        showerrors:true,
        selectedevent:"GW170814",
        panel:"info"
    }
    this.xvar = (this.urlVars.x) ? this.urlVars.x : this.defaults.xvar;
    this.yvar = (this.urlVars.y) ? this.urlVars.y : this.defaults.yvar;
    this.axiszero = true;
    this.showerrors = (this.urlVars.err) ? this.urlVars.err : this.defaults.showerrors;
    this.showerrors = (this.showerrors=="false") ? false : true;
    this.selectedevent = (this.urlVars.event) ? this.urlVars.event : this.defaults.selectedevent;
    this.setStyles();
    this.sketchName="None";
    this.unitSwitch=false;
    this.d=null;
    this.langs = {
        "de":{code:"de",name:"Deutsch"},
        "en":{code:"en",name:"English"},
        "es":{code:"es",name:"Español"},
        "fr":{code:"fr",name:"Français"},
        "it":{code:"it",name:"Italiano"},
        "pl":{code:"pl",name:"Polski"},
        "or":{code:"or",name:"ଓଡ଼ିଆ"}
    }

    this.filters = {
        "M1":{"name":'%data.M1.name%',"type":'slider',
            "min": { "label": "", "unit": "%data.M1.unit%", "default": 0, "value": 0 },
            "max": { "label": "", "unit": "%data.M1.unit%", "default": 80, "value": 80 }
        },
        "M2":{"name":'%data.M2.name%',"type":'slider',
            "min": { "label": "", "unit": "%data.M2.unit%", "default": 0, "value": 0 },
            "max": { "label": "", "unit": "%data.M2.unit%", "default": 80, "value": 80 }
        },
        "Mfinal":{"name":'%data.Mfinal.name%',"type":'slider',
            "min": { "label": "", "unit": "%data.Mfinal.unit%", "default": 0, "value": 0 },
            "max": { "label": "", "unit": "%data.Mfinal.unit%", "default": 100, "value": 100 }
        },
        "obsrun": {
            "name":'%data.obsrun.name%',
    		"type":"checkbox",
    		"options":[
    			{"id": "filt-o1", "label":"%text.plotgw.filter.observingrun.O1%", "checked": true, "value": "O1" },
    			{"id": "filt-o2", "label":"%text.plotgw.filter.observingrun.O2%", "checked": true, "value": "O2" },
    			{"id": "filt-o3", "label":"%text.plotgw.filter.observingrun.O3%", "checked": true, "value": "O3" }
    		]
	    },
        "detType": {
            "name":'%data.dettype.name%',
    		"type":"checkbox",
    		"options":[
    			{"id": "filt-conf", "label":"%text.plotgw.filter.dettype.detections%", "checked": true, "value": "GW" },
    			{"id": "filt-cand", "label":"%text.plotgw.filter.dettype.candidates%", "checked": true, "value": "Candidate" }
            ]
	    }
    }
    this.filterr=true;
    this.presets = {
        "conf-only":{
            "icon":"",
            "x-axis":"M1",
            "y-axis":"M2",
            "tooltip":"%tooltip.plotgw.preset-conf%",
            "desc":"%text.plotgw.presets.conf-only%"
        },
        "cand-only":{
            "icon":"",
            "x-axis":"UTCdate",
            "y-axis":"FAR",
            "tooltip":"%tooltip.plotgw.preset-cand%",
            "desc":"%text.plotgw.presets.cand-only%"
        },
        "allsrc":{
            "icon":"",
            "x-axis":"UTCdate",
            "y-axis":"DL",
            "tooltip":"%tooltip.plotgw.preset-all%",
            "desc":"%text.plotgw.presets.allsrc%"
        }
    }


    // this.panels = {
    //     'info':{'status':true,
    //         'hide':function(){gw.hideInfo()},
    //         'show':function(){gw.showInfo()}},
    //     'options':{'status':false,
    //         'hide':function(){gw.hideOptions()},
    //         'show':function(){gw.showOptions()}},
    //     'help':{'status':false,
    //         'hide':function(){gw.hideHelp()},
    //         'show':function(){gw.showHelp()}},
    //     'lang':{'status':false,
    //         'hide':function(){gw.hideLang()},
    //         'show':function(){gw.showLang()}},
    //     'filter':{'status':false,
    //         'hide':function(){gw.hideFilter()},
    //         'show':function(){gw.showFilter()}}
    // }
    // if (this.urlVars.panel){
    //     for (p in this.panels){
    //         if (p==this.urlVars.panel){
    //             this.panels[p].status=true
    //         }else{this.panels[p].status=false}
    //     }
    // }

}
// GWCatalogue.prototype.showpanel = function (panel) {
//     if (this.panels.panel){
//         this.panels[panel].show()
//         this.panels[panel].status=true
//         for (p in this.panels){
//             if (p!=panels){
//                 this.panels[p].status=false
//             }
//         }
//     }else{
//
//     }
// };
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
    this.debug = (this.urlVars.debug) ? true : false;
    if(this.debug){console.log('debug',this.debug)}
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
        "event":[this.selectedevent,""],
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
GWCatalogue.prototype.updateUrl = function(vars){
    // don't show panel in URL
    if (!vars){vars={}}
    // vars.panel=this.defaults.panel
    newUrl=this.makeUrl(vars)
    // window.history.pushState({},null,newURl);
    d3.select('#copy-button').attr('data-clipboard-text',newUrl);
}
GWCatalogue.prototype.getPanel = function(){

    if (this.optionsOn){return "options";}
    else if(this.helpOn){return "help";}
    else if(this.langOn){return "lang";}
    else if(this.filtOn){return "filter";}
    else{return "info"}
}
GWCatalogue.prototype.setPanel = function(panel){
    if (panel=="options"){this.showOptions();}
    else if(panel=="help"){this.showHelp();}
    else if(panel=="lang"){this.showLang();}
    else if(panel=="filter"){this.showFilter();}
    else if(panel=="info"){this.showInfo();}
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
GWCatalogue.prototype.tName = function(textIn){
    this.names={"GW":"%data.bub.name.GW%",
        "LVT":"%data.bub.name.LVT%",
        "-A":"%data.bub.name.A%",
        "-B":"%data.bub.name.B%"}
    rename=/([A-Z]*)([0-9]*)([a-z]*)/;
    tr=rename.exec(textIn)
    textOut=gw.tl(((this.names[tr[1]])?this.names[tr[1]]:tr[1])+gw.tN(tr[2])+tr[3])
    return(textOut)
}
GWCatalogue.prototype.tN = function(key){
    var systems = {
            devanagari: 2406, tamil: 3046, kannada:  3302,
            telugu: 3174, marathi: 2406, malayalam: 3430,
            oriya: 2918, gurmukhi: 2662, nagari: 2534, gujarati: 2790
        };
    if (!systems.hasOwnProperty(this.langdict["meta.numbersystem"].toLowerCase())){return key;}
    zero = 48; // char code for Arabic zero
    nine = 57; // char code for Arabic nine
    offset = (systems[this.langdict["meta.numbersystem"].toLowerCase()] || zero) - zero;
    output = key.toString().split("");
    l = output.length;

    for (i = 0; i < l; i++) {
        cc = output[i].charCodeAt(0);
        if (cc >= zero && cc <= nine) {
            output[i] = String.fromCharCode(cc + offset);
        }
    }
    return output.join("");
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
    if ((gw.columns[src].err)&&(!d[src].err)&&(gw.debug)){
        console.log("can't find 'err' value for '"+src+"' in event '"+d.name+"'");
    }
    // txt='';
    if ((d[src].errv)&&(d[src].errv.length==2)){
        if(gw.debug){console.log(d.name,src,d[src],d[src].errtype)}
        if ((d[src].errtype)&&((d[src].errtype=='normal')||(d[src].errtype=='lim'))){
            // if(gw.debug){console.log(d.name,src,d[src],d[src].errtype)}
            sigfig=gw.columns[src].sigfig
            eneg=gw.cat.getMinVal(d.name,src).toPrecision(sigfig)
            epos=gw.cat.getMaxVal(d.name,src).toPrecision(sigfig)
            // eneg=d[src].errv[1].toPrecision(sigfig)
            // epos=d[src].errv[0].toPrecision(sigfig)
            if (d[src].errv[1]!=d[src].errv[0]){
                while (eneg==epos){
                    // need more precision to show range
                    sigfig+=1
                    eneg=gw.cat.getMinVal(d.name,src).toPrecision(sigfig)
                    epos=gw.cat.getMaxVal(d.name,src).toPrecision(sigfig)
                    // eneg=d[src].errv[1].toPrecision(sigfig)
                    // epos=d[src].errv[0].toPrecision(sigfig)
                }
            }
            txt=parseFloat(eneg)+'&ndash;'+parseFloat(epos)
        }else if((d[src].errtype)&&(d[src].errtype=='lower')){
            // if(gw.debug){console.log(d.name,src,d[src],d[src].errtype)}
            txt='> '+parseFloat(d[src].lower.toPrecision(gw.columns[src].sigfig))
        }else if((d[src].errtype)&&(d[src].errtype=='upper')){
            // if(gw.debug){console.log(d.name,src,d[src],d[src].errtype)}
            txt='< '+parseFloat(d[src].upper.toPrecision(gw.columns[src].sigfig))
        }
        // }else if((d[src].errtype)&&(d[src].errtype=='lim')){
        //     // if(gw.debug){console.log(d.name,src,d[src],d[src].errtype)}
        //     txt=parseFloat(d[src].errv[1].toPrecision(gw.columns[src].sigfig))+
        //     '&ndash;'+
        //     parseFloat(d[src].errv[0].toPrecision(gw.columns[src].sigfig))
        // }
    }else if (typeof d[src].best=="number"){
        txt=parseFloat(d[src].best.toPrecision(gw.columns[src].sigfig)).toString()
    }else{
        txt=d[src].best
    }
    txt=gw.tN(txt);
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
    if (d[src].best){
        if (typeof d[src].best=="number"){
            txt=parseFloat(d[src].best.toPrecision(gw.columns[src].sigfig)).toString()
        }else{
            txt=d[src].best
        }
    }else if((d[src].errtype)&&(d[src].errtype=='lower')){
        txt='> '+parseFloat(d[src].lower.toPrecision(gw.columns[src].sigfig))
    }else if((d[src].errtype)&&(d[src].errtype=='upper')){
        txt='< '+parseFloat(d[src].upper.toPrecision(gw.columns[src].sigfig))
    }
    txt=gw.tN(txt);
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
       cand: available for candidates
    */
    var gw=this;

    colsUpdate = {
        Mtotal:{icon:"img/totalmass.svg",avail:false,type:'src'},
        Mchirp:{icon:"img/chirpmass.svg",avail:true,type:'src'},
        M1:{icon:"img/primass.svg",avail:true,type:'src'},
        M2:{icon:"img/secmass.svg",avail:true,type:'src'},
        Mfinal:{icon:"img/finalmass.svg",avail:true,type:'src'},
        chi:{avail:true,icon:"img/initspin.svg",
            border:0.01,type:'src',forcelog:'off'},
        af:{avail:true,icon:"img/finalspin.svg",
            border:0.01,type:'src'},
        DL:{avail:true, icon:"img/ruler.svg",
            border:20,type:'src',cand:true},
        z:{avail:true,icon:"img/redshift.svg",
            border:0.01,type:'src'},
        UTC:{avail:false,type:'src',strfn:function(d){return('')}},
        UTCdate:{avail:true,type:'derived',cand:true,
            depfn:function(d){return (d.UTC)},
            namefn:function(){return(gw.columns.UTC.name)},
            convfn:['UTC',function(x){return new Date(x)}],
            strfn:function(d){return(gw.tN(d.UTC.best));},
            sigfig:0,
            err:0,
            icon:"img/time.svg",
            type:"derived",
            scale:"time",
            border:2.6e9,
            forcelog:'off',
            forcezero:'off'
        },
        FAR:{avail:true,type:'src',icon:"img/dice.svg",cand:true,
            forcelog:'on',
            forcezero:'off',
            strfn:function(d){
                if (1/d.FAR.best<1000){
                    strOut=gw.tl("%data.FAR.unit.structure%")
                        .replace("$1per$","%data.FAR.unit.1per%")
                        .replace("$val$",gw.tN((1./d.FAR.best)
                            .toPrecision(gw.columns.FAR.sigfig)))
                        .replace("$dur$","%data.FAR.unit.yr%");
                }else if (1/d.FAR.best<1e6){
                    strOut=gw.tl("%data.FAR.unit.structure%")
                        .replace("$1per$","%data.FAR.unit.1per%")
                        .replace("$val$",gw.tN(((1./d.FAR.best)/1e3)
                            .toPrecision(gw.columns.FAR.sigfig)))
                        .replace("$dur$","%data.FAR.unit.kyr%");
                }else if (1/d.FAR.best<1e9){
                    strOut=gw.tl("%data.FAR.unit.structure%")
                        .replace("$1per$","%data.FAR.unit.1per%")
                        .replace("$val$",gw.tN(((1./d.FAR.best)/1e6)
                            .toPrecision(gw.columns.FAR.sigfig)))
                        .replace("$dur$","%data.FAR.unit.Myr%");
                }else{
                    strOut=gw.tl("%data.FAR.unit.structure%")
                        .replace("$1per$","%data.FAR.unit.1per%")
                        .replace("$val$",gw.tN(((1./d.FAR.best)/1e9)
                            .toPrecision(gw.columns.FAR.sigfig)))
                        .replace("$dur$","%data.FAR.unit.Gyr%");
                }
                return(gw.tl(strOut));
            }
        },
        sigma:{avail:false,type:'src'},
        obsrun:{avail:false,type:'src',icon:"img/obsrun.svg",
            strfn:function(d){
                nettxt='';
                netlist=d.net.best.split('');
                for (i in netlist){nettxt+=gw.tl('%text.gen.det.'+netlist[i]+'%')};
                return gw.tl('%text.plotgw.filter.observingrun.'+d.obsrun.best+'%<br/>('+nettxt+')') ;
            }
        },
        detType:{avail:false,type:'src',icon:"img/tag.svg"},
        // netobs:{avail:false,type:'derived',icon:"img/obsrun.svg",
        //     namefn:function(){return(gw.columns.obsrun.name)}
        // },
        rho:{icon:"img/snr.svg",avail:true,type:'src'},
        deltaOmega:{avail:true,type:'src',icon:'img/skyarea.svg',cand:true},
        Erad:{avail:true,icon:"img/energyrad.svg",
            border:0.1,type:'src'},
        lpeak:{avail:true,icon:"img/peaklum.svg",type:'src'},
        M1kg:{type:'derived',
            depfn:function(d){return (d.M1)},
            namefn:function(){return(gw.columns.M1.name)},
            convfn:['M1',function(x){return x/2}],
            sigfig:2,
            err:2,
            unit:'%data.mass.unit.kg%',
            avail:false},
        M2kg:{type:'derived',
            depfn:function(d){return (d.M2)},
            convfn:['M2',function(x){return x/2}],
            namefn:function(){return(gw.columns.M2.name)},
            sigfig:2,
            err:2,
            unit:'%data.mass.unit.kg%',
            avail:false},
        Mfinalkg:{type:'derived',
            depfn:function(d){return (d.Mfinal)},
            namefn:function(){return(gw.columns.Mfinal.name)},
            convfn:['Mfinal',function(x){return x/2}],
            sigfig:2,
            err:2,
            unit:'%data.mass.unit.kg%',
            avail:false},
        Mchirpkg:{type:'derived',
            depfn:function(d){return (d.Mchirp)},
            namefn:function(){return(gw.columns.Mchirp.name)},
            convfn:['Mchirp',function(x){return(x/2)}],
            sigfig:2,
            err:2,
            unit:'%data.mass.unit.kg%',
            avail:false},
        Mratio:{type:"src",
            icon:"img/massratio.svg",
            avail:false,
            border:0.1},
        DLly:{type:'derived',
            depfn:function(d){return (d.DL)},
            namefn:function(){return(gw.columns.DL.name)},
            convfn:['DL',function(x){return x*3.26}],
            sigfig:2,
            err:2,
            unit:'%data.DL.unit.Mly%',
            avail:false},
        lpeakMsun:{
            type:'derived',
            depfn:function(d){return (d.lpeak)},
            name:function(){return(gw.columns.lpeak.name)},
            convfn:['lpeak',function(x){return x*55.956}],
            sigfig:2,
            err:2,
            unit:'%data.lpeak.unit.Mc2%',
            avail:false},
        lpeakWatt:{
            type:'derived',
            depfn:function(d){return (d.lpeak)},
            name:function(){return(gw.columns.lpeak.name)},
            convfn:['lpeak',function(x){return x}],
            sigfig:2,
            err:2,
            unit:'%data.lpeak.unit.Watt%',
            avail:false},
        EradErg:{
            type:'derived',
            depfn:function(d){return (d.Erad)},
            namefn:function(){return(gw.columns.Erad.name)},
            convfn:['Erad',function(x){return x*1.787}],
            err:2,
            sigfig:2,
            unit:'%data.Erad.unit.erg%'
        },
        EradJoule:{
            type:'derived',
            depfn:function(d){return (d.Erad)},
            namefn:function(){return(gw.columns.Erad.name)},
            convfn:['Erad',function(x){return x*1.787}],
            err:2,
            sigfig:2,
            unit:'%data.Erad.unit.Joule%'
        },
        FARHz:{type:'derived',
            depfn:function(d){return (d.FAR)},
            namefn:function(){return(gw.columns.FAR.name)},
            convfn:['FAR',function(x){return x/3.154e+7}],
            strfn:function(d){
                text=gw.tl((d.FARHz.best).toPrecision(gw.columns.FARHz.sigfig) +
                ' '+gw.columns.FARHz.unit);
                text=text.replace('e','x10^');
                return text;
            },
            sigfig:3,
            err:0,
            unit:'%data.FAR.unit.Hz%',
            avail:false
        },
        date:{
            type:'derived',
            depfn:function(d){return (d.UTC)},
            strfn:function(d){
                // console.log(d);
                months=['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
                if (d.UTC){
                    day=d.UTC.best.split('T')[0].split('-')[0];
                    month=months[parseInt(d['UTC'].best.split('T')[0].split('-')[1])-1];
                    year=d['UTC'].best.split('T')[0].split('-')[2];
                    return(day+'<br/>'+month+' '+year);
                }else{
                    return(gw.labBlank);
                }
            },
            name:'%data.date.name%',
            icon:"img/date.svg"},
        time:{
            type:'derived',
            depfn:function(d){return (d.UTC)},
            strfn:function(d){
                return(d['UTC'].best.split('T')[1]+"<br/>UT")
            },
            icon:"img/time.svg",
            name:'%data.time.name%'},
        datetime:{
            type:'derived',
            depfn:function(d){return (d.UTC)},
            strfn:function(d){
                day=d.UTC.best.split('T')[0].split('-')[0];
                month=d['UTC'].best.split('T')[0].split('-')[1];
                year=d['UTC'].best.split('T')[0].split('-')[2];
                time=d['UTC'].best.split('T')[1];
                return(gw.tN(gw.tl(year+'-'+month+'-'+day+"<br/>"+time+" %data.time.UT%")));
            },
            icon:"img/time.svg",
            name:'%data.time.name%'},
        data:{
            type:'derived',
            depfn:function(d){return (d.opendata)},
            strfn:function(d){
                if ((d.opendata)&&(d.opendata.url)){
                    if (d.opendata.text.search('GraceDB')>=0){
                        return gw.tl("<a target='_blank' title='"+gw.tl(d.opendata.text)+
                            "' href='"+ d.opendata.url+
                            "'>%text.gen.gracedb%</a>");
                    }else{
                        return gw.tl("<a target='_blank'title='"+gw.tl(d.opendata.text)+
                            "'  href='"+ d.opendata.url+
                            "'>%text.gen.gwosc%</a>");
                    }
                }else{
                    return(gw.labBlank);
                }
            },
            name:'%tooltip.plotgw.opendata%',
            icon:"img/data.svg"},
        paper:{
            type:'derived',
            depfn:function(d){return (d.ref)},
            strfn:function(d){
                if (gw.debug){console.log('PAPER',d.ref)}
                if ((d.ref)&&(d.ref.url)){
                    return gw.tl("<a target='_blank' href='"+d.ref.url+
                        "' title='"+d.ref.text+"'>%text.gen.paper%</a>");
                }else{
                    return(gw.labBlank);
                }
            },
            name:'%tooltip.plotgw.paper%',
            icon:"img/paper.svg"}
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
    if (!this.columns[col]){return(null);}
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
        this.langcontHeight="10%";
        this.filtcontHeight="10%";
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
        this.langcontHeight="5%";
        this.filtcontHeight="5%";
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

}
GWCatalogue.prototype.setScales = function(){
    if(this.debug){console.log('Setting scales');}
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
    this.margin = {top: 40*this.ysc, right: 20*this.xsc, bottom: 15*(1+this.ysc), left: 45*(1+this.xsc)}
    this.graphWidth =
        this.fullGraphWidth - this.margin.left - this.margin.right;
    this.graphHeight =
        0.9*this.fullGraphHeight - this.margin.top - this.margin.bottom;
    this.xyAspect = this.graphWidth/this.graphHeight;

    // set axis scales
    this.errh = 0.01;
    this.errw = 0.01;//*xyAspect;
    this.uplow=0.1;
    this.uploh=0.1;
    this.pValue = function(d,p) {
        if (!(d[p])){return 0}
        else if (d[p].best!=null){return d[p].best}
        else if (d[p].lower!=null){return d[p].lower}
        else if (d[p].upper!=null){return d[p].upper};
    }

    this.pErr = function(d,p,maxmin) {
        //error- -> value
        if (!d[p]){return null}
        else if(!d[p].errtype){return null}
        else if ((maxmin=='+')){
            if((d[p].errtype)&&(d[p].errtype=='lower')){
                return d[p].lower;
            }else{
                return Math.max.apply(Math,d[p].errv);
            }
        }else if ((maxmin=='-')){
            if((d[p].errtype)&&(d[p].errtype=='upper')){
                return d[p].upper;
            }else{
                return Math.min.apply(Math,d[p].errv);
            }
        }
    }


    this.xValue = function(d) {
        if (!d[gw.xvar]){return 0}
        else {return gw.pValue(d,gw.xvar);}
    }
    // data -> value
    // value -> display
    // this.xScale = d3.scale.linear().range([0, this.graphWidth])

    // x error bars
    this.xErrP = function(d) {
        //error+ -> value
        if (!d[gw.xvar]){return 0}
        else{ return gw.pErr(d,gw.xvar,'+');}
    }
    this.xErrM = function(d) {
        //error- -> value
        if (!d[gw.xvar]){return 0}
        else{ return gw.pErr(d,gw.xvar,'-');}
    }

    this.yValue = function(d) {
        if (!d[gw.yvar]){return 0}
        else {return gw.pValue(d,gw.yvar);}
    }
    // y error bars
    this.yErrP = function(d) {
        //error- -> value
        if (!d[gw.yvar]){return 0}
        else{ return gw.pErr(d,gw.yvar,'+');}
    }
    //error+ -> value
    this.yErrM = function(d) {
        //error- -> value
        if (!d[gw.yvar]){return 0}
        else{ return gw.pErr(d,gw.yvar,'-');}
    }

    // this.updateFilters();
    this.setXYscales(gw.xvar,gw.yvar);
    // data -> display
    this.xMap = function(d) {
        if (!(d[gw.xvar])){
            // console.log('xMap: no '+gw.xvar,d.name);
            return 0;
        }else{
            // console.log('xMap: '+d.name+' '+gw.xvar+'=',gw.xScale(gw.xValue(d)));
            return gw.xScale(gw.xValue(d));
        }
    }
    this.yMap = function(d) {
        if (!(d[gw.yvar])){
            // console.log('yMap: no '+gw.yvar,d.name);
            return 0;
        }else{
            // console.log('yMap: '+d.name+' '+gw.yvar+'=',gw.yScale(gw.yValue(d)));
            return gw.yScale(gw.yValue(d));
        }
    }

    // x error+ -> display
    this.xMapErrP = function(d) {
        if (!d[gw.xvar]){return 0}
        else if ((d[gw.xvar].errtype)&&(d[gw.xvar].errtype=='lower')){
            xval=gw.xScale(gw.xErrP(d)) + (gw.uplow*gw.graphWidth);
            if (xval>gw.graphWidth){
                xval=Math.min(gw.graphWidth,gw.xScale(gw.xErrM(d))+2*(gw.errh*gw.graphHeight));
            }
            return xval;
        }else{
            return gw.xScale(gw.xErrP(d));
        }
    }
    this.xMapErrPouter = function(d) {
        if (!d[gw.xvar]){return 0}
        if ((d[gw.xvar].errtype)&&(d[gw.xvar].errtype=='lower')){
            return gw.xMapErrP(d) - (gw.errh*gw.graphHeight)
        }else if ((d[gw.xvar].esttype)&&(d[gw.xvar].esttype[1]=='soft')){
            return gw.xMapErrP(d) - (gw.errw*gw.graphWidth)
        }else{
            return gw.xScale(gw.xErrP(d))
        }
    }
    // x error- -> display
    this.xMapErrM = function(d) {
        if (!d[gw.xvar]){return 0}
        if ((d[gw.xvar].errtype)&&(d[gw.xvar].errtype=='upper')){
            xval=gw.xScale(gw.xErrM(d)) - (gw.uplow*gw.graphWidth);
            if (xval<0){
                xval=Math.min(0,gw.xScale(gw.xErrM(d))-2*(gw.errh*gw.graphHeight));
            }
            return xval;
        }else{
            return gw.xScale(gw.xErrM(d));
        }
    }
    this.xMapErrMouter = function(d) {
        if (!d[gw.xvar]){return 0}
        if ((d[gw.xvar].errtype)&&(d[gw.xvar].errtype=='upper')){
            return gw.xMapErrM(d) + (gw.errh*gw.graphHeight)
        }else if ((d[gw.xvar].esttype)&&(d[gw.xvar].esttype[0]=='soft')){
            return gw.xMapErrM(d) + (gw.errw*gw.graphWidth)
        }else{
            return gw.xScale(gw.xErrM(d))
        }
    }
    // x error caps -> display
    this.xMapErrY0 = function(d) { return (!d[gw.yvar]) ? 0 :   gw.yScale(gw.yValue(d)) - (gw.errh*gw.graphHeight);}
    this.xMapErrY1 = function(d) { return (!d[gw.yvar]) ? 0 : gw.yScale(gw.yValue(d)) + (gw.errh*gw.graphHeight);}

    // value -> display
    // this.yScale = d3.scale.linear().range([this.graphHeight,0])
    // data -> display


    // y error+ -> display
    this.yMapErrP = function(d) {
        if (!d[gw.yvar]){return 0}
        else if ((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='lower')){
            yval=gw.yScale(gw.yErrP(d)) - (gw.uploh*gw.graphHeight)
            if (yval<0){
                yval=Math.min(0,gw.yScale(gw.yErrM(d))-2*(gw.errh*gw.graphHeight));
            }
            return yval;
        }else{
            return gw.yScale(gw.yErrP(d));
        }
    }
    this.yMapErrPouter = function(d) {
        if (!d[gw.yvar]){return 0}
        else if ((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='lower')){
            return gw.yMapErrP(d) + (gw.errh*gw.graphHeight)
        }else if ((d[gw.yvar].esttype)&&(d[gw.yvar].esttype[1]=='soft')){
            return gw.yMapErrP(d) + (gw.errh*gw.graphHeight)
        }else{
            return gw.yScale(gw.yErrP(d))
        }
    }
    // y error- -> display
    this.yMapErrM = function(d) {
        if (!d[gw.yvar]){return 0}
        else if ((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='upper')){
            yval=gw.yScale(gw.yErrM(d)) + (gw.uploh*gw.graphHeight);
            if (yval>gw.graphHeight){
                yval=Math.max(gw.graphHeight,gw.yScale(gw.yErrM(d))+2*(gw.errh*gw.graphHeight));
            }
            return yval;
        }else{
            return gw.yScale(gw.yErrM(d));
        }
    }
    this.yMapErrMouter = function(d) {
        if (!d[gw.yvar]){return 0}
        else if ((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='upper')){
            return gw.yMapErrM(d) - (gw.errh*gw.graphHeight)
        }else if ((d[gw.yvar].esttype)&&(d[gw.yvar].esttype[0]=='soft')){
            return gw.yMapErrM(d) - (gw.errh*gw.graphHeight)
        }else{
            return gw.yScale(gw.yErrM(d))
        }
    }
    // y error caps -< display
    this.yMapErrX0 = function(d) { return (!d[gw.xvar]) ? 0 : gw.xScale(gw.xValue(d)) - (gw.errh*gw.graphHeight);}
    this.yMapErrX1 = function(d) { return (!d[gw.xvar]) ? 0 : gw.xScale(gw.xValue(d)) + (gw.errh*gw.graphHeight);}

    // this.plottable = function(d) { return (d[gw.xvar])&&(d[gw.yvar])&&(d.active);}

    this.dotOp = function(d) {
        if((d[gw.xvar])&&(d[gw.yvar])&&(d.active)){return(1)}
        else{return 0}
    }
    this.errOp = function(d,param){
        if ((!d[this.xvar])||(!d[this.yvar])){return 0}
        else if (this.columns[param]["err"]==0){return 0}
        else if ((gw.showerrors)&&(d.active)){return(gw.opErr)}
        else{return 0;}
    }

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
    this.scaleRadius = function(mass,fact=1){
        if(typeof mass=="number"){
            return(fact*0.2*this.sketchWidth*(mass/100.))
        }else if (mass.best){
            return(fact*0.2*this.sketchWidth*(mass.best/100.))
        }else if (mass.lower){
            return(fact*0.2*this.sketchWidth*(mass.lower/100.))
        }else if (mass.upper){
            return(fact*0.2*this.sketchWidth*(mass.upper/100.))
        }
    }
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

        datetime:{lab:["datetime"]},
        // time:{lab:["time"]},
        FAR:{lab:["FAR"],labSw:["FARHz"]},
        Mchirp:{lab:["Mchirp"],
            labSw:["Mchirpkg"]},
        obsrun:{lab:["obsrun"]},
        // Mratio:{lab:["Mratio"]},
        // "typedesc":{icon:"img/blank.svg",lab:["typedesc"],
            // ttlab:"Category of detection"},
        lpeak:{lab:["lpeakMsun"],labSw:["lpeakWatt"]},
        Erad:{lab:["Erad"],labSw:["EradJoule"]},
        chi:{lab:["chi"]},
        af:{lab:["af"]},
        DL:{lab:["DL"],
            labSw:["DLly"]},
        data:{icon:"img/data.svg",lab:["data"]},
        paper:{icon:"img/paper.svg",lab:["paper"]}
    }
    //tool-top labels
    this.ttlabels = {
        switch:"%tooltip.plotgw.switchunits%",
        paper:"%tooltip.plotgw.paper%",
        data:"%tooltip.plotgw.opendata%"
    };
    //text for black labels
    this.labBlank="--";
}
GWCatalogue.prototype.adjCss = function(){
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
        .attr("stop-color", this.getCol('BH')[0]);
    this.gradBH.append("stop")
        .attr("offset", "80%")
        .attr("stop-color", this.getCol('BH')[0]);
    this.gradBH.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", this.getCol('BH')[1]);
    this.gradShadow = this.svgSketch.append("defs")
      .append("radialGradient")
        .attr("id", "gradShadow");
    this.gradShadow.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", this.getCol('shadow')[0]);
    this.gradShadow.append("stop")
        .attr("offset", "25%")
        .attr("stop-color", this.getCol('shadow')[0]);
    this.gradShadow.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", this.getCol('shadow')[1]);

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

    // draw probability sketch
    if (this.redraw){
        this.addProbBars(true);
    }else{
        this.addProbBars(false);
    }

    // add labels
    if (this.redraw){
        d3.selectAll('.labcont').style('height',this.labcontHeight);
        d3.selectAll('.lang-cont').style('height',this.langcontHeight);
        d3.select('#unitswtxt')
            .html(this.tl('%tooltip.plotgw.switchunits%'));
        d3.selectAll('.sketchlab').style("font-size",(1.3*gw.sksc)+"em");
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
        .attr("class","sketch-title panel-title colourise "+gw.getColClass())
        .attr("text-anchor","middle")
        .style("font-size",fs+"em")
        .html(this.tl("%text.plotgw.information.title%"));
    this.sketchTitleHint = this.svgSketch.append("text")
        .attr("x",this.xScaleSk(0.5))
        .attr("y",this.yScaleSk(0.2))
        .attr("class","sketch-subtitle panel-subtitle colourise "+gw.getColClass())
        .attr("text-anchor","middle")
        .style("font-size",(0.75*fs)+"em")
        .html(this.tl("%text.plotgw.information.subtitle%"));

    // add actions to nex/previous
    d3.select('#select-next')
        .on('mouseover',function(){gw.showTooltipManual("%tooltip.plotgw.nextevent%");})
        .on('mouseout',function(){gw.hideTooltipManual();})
        .on('click',function(){gw.selectNext(+1);})
    d3.select('#select-previous')
        .on('mouseover',function(){gw.showTooltipManual("%tooltip.plotgw.prevevent%");})
        .on('mouseout',function(){gw.hideTooltipManual();})
        .on('click',function(){gw.selectNext(-1);})


}
GWCatalogue.prototype.addMasses = function(bh,redraw){
    // add ellipse for shadow
    gw=this;
    var redraw;
    this.svgSketch.append("ellipse")
        .attr("class","sketch shadow-"+bh)
        .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
        .attr("cy",this.yScaleSk(this.bhpos[bh].scy))
        .attr("rx",this.scaleRadius(0))
        .attr("ry",this.scaleRadius(0))
        .attr("fill","url(#gradShadow)");
    // add circle for black hole
    this.svgSketch.append("circle")
        .attr("class","sketch bh-"+bh)
        .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
        .attr("cy",this.yScaleSk(this.yout))
        .attr("r",this.scaleRadius(1))
        .attr("fill","url(#gradBH)");
    // add mass icon
    if (!redraw){
        // drawing from sratch
        massicondiv = document.createElement('div');
        massicondiv.className = 'icon mass-sketch massicon';
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
            if(this.style['opacity']!="0"){
                gw.showTooltip(e,this.id.split("icon")[1])}
            }
        massicondiv.onmouseout = function(){
            if (this.style['opacity']!="0"){gw.hideTooltip()};
        }
        // add mass text
        masstxtdiv = document.createElement('div');
        masstxtdiv.className = 'sketchlab mass-sketch mtxt';
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
        .attr("rx",this.scaleRadius(1))
        .attr("ry",this.scaleRadius(1));
    //replace text in label
    document.getElementById("mtxt-"+bh).innerHTML = this.labBlank;

};
GWCatalogue.prototype.flyInMasses = function(d,bh,resize,delay=false){
    // fly in mass
    // bh = BH to fly in
    // resize= type of resizing animation
    dt=(delay) ? this.flySp/2 : 0;
    if (resize=="smooth"){
        // only resize circle & shadow
        this.svgSketch.select('circle.bh-'+bh)
            .transition().delay(dt).duration(this.flySp)
            .attr("r",this.scaleRadius(d[bh]))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-this.scaleRadius(d[bh]));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .transition().delay(dt).duration(this.flySp)
            .attr("rx",this.scaleRadius(d[bh]))
            .attr("ry",this.scaleRadius(d[bh],0.2));
    }else if(resize=="fly"){
        // resize & fly in
        this.svgSketch.select('circle.bh-'+bh)
            .attr("r",this.scaleRadius(d[bh]));
        this.svgSketch.select('circle.bh-'+bh)
            .transition().delay(dt).duration(this.flySp).ease("bounce")
            .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-this.scaleRadius(d[bh]));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .transition().delay(dt).duration(this.flySp).ease("bounce")
            .attr("rx",this.scaleRadius(d[bh]))
            .attr("ry",this.scaleRadius(d[bh],0.2));
    }else if(resize=="snap"){
        // snap resize (when redrawing sketch)
        this.svgSketch.select('circle.bh-'+bh)
            .attr("r",this.scaleRadius(d[bh]))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-this.scaleRadius(d[bh]));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .attr("rx",this.scaleRadius(d[bh]))
            .attr("ry",this.scaleRadius(d[bh],0.2));
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
GWCatalogue.prototype.addProbBars = function(redraw){
    // add probability bars
    var redraw;
    gw=this;
    // probwid=0.15;
    probx0=0.1;
    probx1=0.9;
    probxgap=0.03;
    proby0=0.9;
    proby1=0.3;
    this.probs=['BBH','BNS','NSBH','MassGap','Terrestrial'];
    np=this.probs.length;
    probwid=((probx1-probx0) - np*probxgap)/np;
    this.probpos={left:probx0,right:probx1,width:probx1-probx0,
        top:proby1,bottom:proby0,height:proby0-proby1,
        barwidth:probwid,txty:proby0-probxgap,gap:probxgap};
    for (p=0;p<this.probs.length;p++){
        this.probpos[this.probs[p]]={
            x:probx0 + (p+0.5)*probxgap + p*probwid,
            y:proby0
        }
    }

    this.scaleProbTop = function(pval,fact=1){
        t=fact * this.sketchHeight * (this.probpos.top + (1-pval) * this.probpos.height);
        // console.log('top(',this.probpos.top,fact , this.sketchHeight , (pval) , this.probpos.height,')=',t)
        return(t)
    }
    this.scaleProbHeight = function(pval,fact=1){
        if (!pval){return 0}
        h=fact * this.sketchHeight * (pval) * this.probpos.height;
        // console.log('top(',fact , this.sketchHeight , (pval) , this.probpos.height,')=',h)
        return(h)
    }
    ylabx=this.xScaleSk(this.probpos.left-0.05);
    ylaby=this.yScaleSk(this.probpos.top+this.probpos.height/2);
    xlabx=this.xScaleSk(this.probpos.left+this.probpos.width/2);
    xlaby=this.yScaleSk(this.probpos.bottom+0.05);
    ytg=this.svgSketch.append("g")
        .attr("transform","translate("+ylabx+","+ylaby+")")
    ytg.append("text")
        .attr("class","sketch prob-sketch")
        .attr("id","prob-sketch-y-label")
        .attr("x",0)
        .attr("y",0)
        .text("Probability (%)")
        .attr("fill",this.getCol('probtxt'))
        .attr("text-anchor","middle")
        .attr("dominant-baseline","central")
        .attr("transform","rotate(-90)")
        .attr("font-size",(1.3*gw.sksc)+"em");
    this.svgSketch.append("text")
        // .attr("class","sketch prob-sketch")
        .attr("id","prob-sketch-x-label")
        .attr("x",xlabx)
        .attr("y",xlaby)
        .text("Classification")
        .attr("fill",this.getCol('probtxt'))
        .attr("text-anchor","middle")
        .attr("dominant-baseline","central")
        .attr("font-size",(1.3*gw.sksc)+"em");
    for (p in this.probs){
        prob=this.probs[p];
        this.svgSketch.append("rect")
            .attr("class","sketch")
            .attr("id","prob-bar-"+prob)
            .attr("x",this.xScaleSk(this.probpos[prob].x))
            .attr("y",this.scaleProbTop(0))
            .attr("fill",this.getCol('probbar'))
            .attr("width",this.xScaleSk(this.probpos.barwidth))
            .attr("height",this.scaleProbHeight(0));
        txtx=this.xScaleSk(this.probpos[prob].x+this.probpos.barwidth/2);
        txty=this.yScaleSk(this.probpos.txty);
        grp=this.svgSketch.append("g")
            .attr("transform","translate("+txtx+","+txty+")")
            .attr("class","sketch ptxtg")
            .attr("id","ptxtg-"+prob)
        grp.append("text")
            .attr("class","sketch ptxt")
            .attr("id","ptxt-"+prob)
            .attr("x",0)
            .attr("fill",this.getCol('probtxt'))
            .attr("y",0)
            .attr("dy",(1.1*gw.sksc)+"em")
            .attr("text-anchor","left")
            .attr("dominant-baseline","central")
            .attr("transform","rotate(-90)")
            .attr("font-size",(1.3*gw.sksc)+"em")
            .text(this.obj2hint(prob,true,true));
        grp.append("text")
            .attr("class","sketch ptxt")
            .attr("id","ptxt2-"+prob)
            .attr("x",0)
            .attr("fill",this.getCol('probtxt'))
            .attr("y",0)
            .attr("dy",(-0*gw.sksc)+"em")
            .attr("text-anchor","left")
            .attr("dominant-baseline","central")
            .attr("transform","rotate(-90)")
            .attr("font-size",(1.3*gw.sksc)+"em")
            .text(this.obj2hint(prob,true));
        grp.append("text")
            .attr("class","sketch ptxt")
            .attr("id","ptxt3-"+prob)
            .attr("x",0)
            .attr("fill",this.getCol('probtxt'))
            .attr("y",0)
            .attr("dy",(-1.1*gw.sksc)+"em")
            .attr("text-anchor","left")
            .attr("dominant-baseline","central")
            .attr("transform","rotate(-90)")
            .attr("font-size",(1.3*gw.sksc)+"em")
            .text(this.obj2hint(prob));
    }
    this.svgSketch.append("line")
        .attr("class","sketch prob-sketch")
        .attr("id","prob-sketch-x")
        .attr("x1",this.xScaleSk(this.probpos.left))
        .attr("x2",this.xScaleSk(this.probpos.right))
        .attr("y1",this.yScaleSk(this.probpos.bottom))
        .attr("y2",this.yScaleSk(this.probpos.bottom))
        .attr("stroke-width",2)
        .attr("stroke",this.getCol('probbar'));
    this.svgSketch.append("line")
        .attr("class","sketch prob-sketch")
        .attr("id","prob-sketch-y")
        .attr("x1",this.xScaleSk(this.probpos.left))
        .attr("x2",this.xScaleSk(this.probpos.left))
        .attr("y1",this.yScaleSk(this.probpos.bottom))
        .attr("y2",this.yScaleSk(this.probpos.top))
        .attr("stroke-width",2)
        .attr("stroke",this.getCol('probbar'));


}
GWCatalogue.prototype.flyOutProbBars = function(){
    for (p in this.probs){
        prob=this.probs[p];
        this.svgSketch.select('#prob-bar-'+prob)
            .transition().duration(this.flySp)
            .attr("y",this.scaleProbTop(0))
            .attr("fill",this.getCol("probbar"))
            .attr("height",this.scaleProbHeight(0));
        this.svgSketch.select('#ptxt-'+prob)
            .transition().duration(this.flySp)
            .attr("x",this.yScaleSk(-1.7));
        this.svgSketch.select('#ptxt2-'+prob)
            .transition().duration(this.flySp)
            .attr("x",this.yScaleSk(-1.7));
        this.svgSketch.select('#ptxt3-'+prob)
            .transition().duration(this.flySp)
            .attr("x",this.yScaleSk(-1.7));
    }
}
GWCatalogue.prototype.flyInProbBars = function(d,resize,delay=false){

    for (p in this.probs){
        prob=this.probs[p];
        pval=d.objType.prob[prob];
        ptxt=this.obj2hint(prob,true,true);
        ptxt2=this.obj2hint(prob,true)
        ptxt3=this.obj2hint(prob);
        if ((pval>0)&(pval<0.01)){ptxt += ' (<1%)'}
        else{ptxt += ' ('+(100*pval).toFixed(0)+'%)';}
        dt=(delay) ? this.flySp/2 : 0;
        if (pval<=0.5){
            ptxty=this.yScaleSk((pval*this.probpos.height));
        }else{ptxty=this.yScaleSk(0);}
        if (resize=="smooth"){
            this.svgSketch.select('#prob-bar-'+prob)
                .transition().delay(dt).duration(this.flySp)
                .attr("y",this.scaleProbTop(pval))
                .attr("fill",this.getCol("probbars")[prob])
                .attr("height",this.scaleProbHeight(pval));
            this.svgSketch.select('#ptxt-'+prob)
                .transition().delay(dt).duration(this.flySp)
                .attr("x",ptxty)
                .attr("fill",this.getCol('probtxt'))
                .text(ptxt);
            this.svgSketch.select('#ptxt2-'+prob)
                .transition().delay(dt).duration(this.flySp)
                .attr("x",ptxty)
                .attr("fill",this.getCol('probtxt'))
                .text(ptxt2);
            this.svgSketch.select('#ptxt3-'+prob)
                .transition().delay(dt).duration(this.flySp)
                .attr("x",ptxty)
                .attr("fill",this.getCol('probtxt'))
                .text(ptxt3);
        }else if(resize=="snap"){
            this.svgSketch.select('#prob-bar-'+prob)
                .attr("y",this.scaleProbTop(pval))
                .attr("fill",this.getCol("probbars")[prob])
                .attr("height",this.scaleProbHeight(pval));
            this.svgSketch.select('#ptxt-'+prob)
                .attr("x",ptxty)
                .attr("fill",this.getCol('probtxt'))
                .text(ptxt);
            this.svgSketch.select('#ptxt2-'+prob)
                .attr("x",ptxty)
                .attr("fill",this.getCol('probtxt'))
                .text(ptxt2);
            this.svgSketch.select('#ptxt3-'+prob)
                .attr("x",ptxty)
                .attr("fill",this.getCol('probtxt'))
                .text(ptxt3);
        }
    }
}
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
                    labTxt = (labTxt=='') ? gw.labBlank : labTxt;
                }else{
                    labTxt = gw.labBlank;
                }
                document.getElementById(lab+"txt").innerHTML = this.tl(labTxt);
            }
            // console.log(this.lang,labTxt,this.tl(labTxt));
        }
    }
    masses=['M1','M2','Mfinal']
    for (m in masses){
        bh=masses[m]
        // update mass label text
        if (this.d!=null&&this.d.hasOwnProperty(bh)){
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
GWCatalogue.prototype.obj2hint = function(objType,desc=false,line2=false){
    if (objType=='BBH'){
        return (desc) ? (line2) ? this.tl('%text.gen.bbh.lab-2%') : this.tl('%text.gen.bbh.lab%') :
         this.tl('%text.gen.bbh.def%',true)}
    else if (objType=='BNS'){
        return (desc) ? ((line2) ? this.tl('%text.gen.bns.lab-2%') : this.tl('%text.gen.bns.lab%')) :  this.tl('%text.gen.bns.def%',true)}
    else if (objType=='NSBH'){
        return (desc) ? ((line2) ? this.tl('%text.gen.nsbh.lab-2%') : this.tl('%text.gen.nsbh.lab%')) : this.tl('%text.gen.nsbh.def%',true)}
    else if (objType=='MassGap'){
        return (desc) ? ((line2) ? this.tl('%text.gen.massgap.lab-2%') : this.tl('%text.gen.massgap.lab%')) : this.tl('%text.gen.massgap.def%',true)}
    else if (objType=='Terrestrial'){
        return (desc) ? ((line2) ? this.tl('%text.gen.terrestrial.lab-2%') : this.tl('%text.gen.terrestrial.lab%')) : this.tl('%text.gen.terrestrial.def%',true)}
    else {return ""}
}
GWCatalogue.prototype.updateSketch = function(d){
    // update sketch based on data clicks or resize
    if (this.redraw){
        // redrawing what's already there
        if (d.detType.best=='Candidate'){
            this.flyInProbBars(d,"snap");
            this.flyOutMasses("M1");
            this.flyOutMasses("M2");
            this.flyOutMasses("Mfinal");
            this.hideBHSketch();
            this.sketchTitleHint.html("");
        }else{
            // resize sketch
            this.flyInMasses(d,"M1","snap");
            this.flyInMasses(d,"M2","snap");
            this.flyInMasses(d,"Mfinal","snap");
            this.hideProbSketch();
            this.flyOutProbBars();
            this.sketchTitleHint.html(this.obj2hint(d.objType.best));
        }
        // update title
        this.sketchTitle.html(
            this.tl("%text.plotgw.information.heading% "+this.sketchName));
        // update labels
        this.redrawLabels();
    }else if ((d==null)||(this.sketchName==d["name"])){
        // clicked on currently selected datapoint
        this.hideProbSketch();
        this.hideBHSketch();
        this.flyOutProbBars();
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
        if (d.detType.best=='Candidate'){
            // seleted candidate
            this.hideBHSketch();
            if (!(this.d)){
                // no current selection
                this.showProbSketch();
                this.flyInProbBars(d,"smooth");
                // this.flyOutMasses("M1");
                // this.flyOutMasses("M2");
                // this.flyOutMasses("Mfinal");
            }else if (this.d.detType.best=='Candidate'){
                // switching from candidate to candidate
                if(this.debug){console.log('switching from Candidate to Candidate');}
                this.flyInProbBars(d,"smooth");
            }else{
                // switching from detection to candidate
                if(this.debug){console.log('switching from Detection to Candidate');}
                this.flyOutMasses("M1");
                this.flyOutMasses("M2");
                this.flyOutMasses("Mfinal");
                this.showProbSketch(delay=true);
                this.flyInProbBars(d,"smooth",delay=true);

            }
            this.d = d;
            // update title
            this.sketchName = d["name"];
            this.sketchTitle.html(this.tl("%text.plotgw.information.heading% "+this.tName(this.sketchName)+' %text.plotgw.information.candidate%'));
            this.sketchTitleHint.html("");
            //update labels
            this.redrawLabels();
        }else{
            // selected detection
            if (!(this.d)) {
                // nothing selected, so fly in
                this.hideProbSketch()
                this.flyOutProbBars();
                this.showBHSketch();
                this.flyInMasses(d,"M1","fly");
                this.flyInMasses(d,"M2","fly");
                this.flyInMasses(d,"Mfinal","fly");
            }else if (this.d.detType.best=='Candidate'){
                // switching from candidate to detection
                this.hideProbSketch();
                this.flyOutProbBars();
                this.showBHSketch(delay=true);
                this.flyInMasses(d,"M1","fly",delay=true);
                this.flyInMasses(d,"M2","fly",delay=true);
                this.flyInMasses(d,"Mfinal","fly",delay=true);
            }else{
                // switching from detection to detection
                this.flyInMasses(d,"M1","smooth");
                this.flyInMasses(d,"M2","smooth");
                this.flyInMasses(d,"Mfinal","smooth");
            }
            this.d = d;
            // update title
            this.sketchName = d["name"];
            this.sketchTitle.html(this.tl("%text.plotgw.information.heading% "+this.tName(this.sketchName)));
            this.sketchTitleHint.html(this.obj2hint(d.objType.best));
            //update labels
            this.redrawLabels();
        }
    }
}
GWCatalogue.prototype.hideBHSketch = function(){
    d3.selectAll('.mass-sketch')
        .transition()
        .duration(750)
        .style('opacity',0)
}
GWCatalogue.prototype.showBHSketch = function(delay=false){
    dt=(delay) ? this.flySp/2 : 0;
    d3.selectAll('.mass-sketch')
        .transition()
        .delay(dt)
        .duration(750)
        .style('opacity',1)
}
GWCatalogue.prototype.hideProbSketch = function(){
    this.svgSketch.select('#prob-sketch-x')
        .transition().duration(this.flySp)
        .attr("y1",this.yScaleSk(1.7))
        .attr("y2",this.yScaleSk(1.7))
    this.svgSketch.select('#prob-sketch-y')
        .transition().duration(this.flySp)
        .attr("x1",this.xScaleSk(-0.7))
        .attr("x2",this.xScaleSk(-0.7))
    this.svgSketch.select('#prob-sketch-x-label')
        .transition().duration(this.flySp)
        .attr("y",this.yScaleSk(1.7))
    this.svgSketch.select('#prob-sketch-y-label')
        .transition().duration(this.flySp)
        .attr("y",this.yScaleSk(-0.7))
}
GWCatalogue.prototype.showProbSketch = function(delay=false){
    dt=(delay) ? this.flySp/2 : 0;
    ylabx=this.xScaleSk(this.probpos.left-0.05);
    ylaby=this.yScaleSk(this.probpos.top+this.probpos.height/2);
    xlabx=this.xScaleSk(this.probpos.left+this.probpos.width/2);
    xlaby=this.yScaleSk(this.probpos.bottom+0.05);
    this.svgSketch.select('#prob-sketch-x')
        .transition().duration(this.flySp)
        .attr("y1",this.yScaleSk(this.probpos.bottom))
        .attr("y2",this.yScaleSk(this.probpos.bottom))
    this.svgSketch.select('#prob-sketch-y')
        .transition().duration(this.flySp)
        .attr("x1",this.xScaleSk(this.probpos.left))
        .attr("x2",this.xScaleSk(this.probpos.left))
    this.svgSketch.select('#prob-sketch-x-label')
        .transition().delay(dt).duration(this.flySp)
        .attr("y",xlaby)
    this.svgSketch.select('#prob-sketch-y-label')
        .transition().delay(dt).duration(this.flySp)
        .attr("y",0)
}
// ****************************************************************************
// ****************************************************************************
// ****************************************************************************

GWCatalogue.prototype.setStyles = function(){
    // setup colours and linestyles
    var gw=this

    // initialise colours
    this.colourList = {
        'light':{'class':'col-white','default':true,
            'label':'%text.plotgw.colour.light%',
            'fg':'#000','bg':'#fff',
            'line':'#000','text':'#000',
            'grid':'#555','err':'#555',
            'BH':["rgba(0,0,0,1)","rgba(0,0,0,0)"],
            'shadow':["rgba(128,128,128,1)","rgba(192,192,192,0)"],
            'dotfill':["#1f77b4", "#ff7f0e","#999999"],
            'dotline':["#000","#555","#555"],
            'axis':"rgb(100,100,100)",
            'highlight':'#f00',
            'tick':'#ccc',
            'probbar':'#333',
            'probbars':{BBH:'#ccccff',BNS:'#ffcccc',NSBH:'#ccffcc',MassGap:'#ccffff',Terrestrial:'#cccccc'},
            'probtxt':'#000'
        },
        'dark':{'class':'col-black','default':false,
            'label':'%text.plotgw.colour.dark%',
            'fg':'#fff','bg':'#000',
            'line':'#fff','text':'#fff',
            'grid':'#ccc','err':'#ccc',
            'BH':["rgba(255,255,255,1)","rgba(255,255,255,0)"],
            'shadow':["rgba(128,128,128,1)","rgba(64,64,64,0)"],
            'dotfill':["#1f77b4", "#ffaf0e","#999999"],
            'dotline':["#fff","#fff","#555"],
            'axis':"rgb(200,200,200)",
            'highlight':'#f00',
            'tick':'#555',
            'probbar':'#ccc',
            'probbars':{BBH:'#000096',BNS:'#960000',NSBH:'#009600',MassGap:'#009696',Terrestrial:'#555555'},
            'probtxt':'#fff'
        }
    }
    if (!this.colScheme){this.colScheme='light'}
    this.getCol = function(col){
        if ((this.colourList[this.colScheme][col])){
            return(this.colourList[this.colScheme][col])
        }else{
            return('')
        }
    }
    this.getColClass = function(){
        if (!this.colourList[this.colScheme].default){
            return this.colourList[this.colScheme].class
        }else{return ''}
    }
    this.cValue = function(d) {return d.detType.best;};
    this.color1 = d3.scale.category10();
    this.styleDomains = ['GW','Candidate'];
    this.color = d3.scale.ordinal().range(gw.getCol('dotfill')).domain(this.styleDomains);
    this.linestyles = d3.scale.ordinal().range(gw.getCol('dotline')).domain(this.styleDomains);
    this.linedashes = d3.scale.ordinal().range([0,3]).domain(this.styleDomains);
    this.dotopacity = d3.scale.ordinal().range([1,1]).domain(this.styleDomains);
    this.getOpacity = function(d) {
        return (((d[gw.xvar])&&(d[gw.yvar])) ? gw.dotopacity(d.detType) : 0)}
    this.tickTimeFormat = d3.time.format("%Y-%m");
    // this.isEst = function(d,param){
    //     return (d[param]) ? d[param].hasOwnProperty('est') : false;
    // }
    // this.isSoft = function(d,param,i=0){
    //     if ((d[param])&&(d[param]['esttype'])){
    //         return (d[param]['esttype'][i]=='soft') ? true : false
    //     }else{return false}
    // }

    this.swErr = 2;
    this.opErr = 0.7;

}
GWCatalogue.prototype.tttext = function(d){
    // graph tooltip text
    if (this.debug){console.log(d["name"],this.columns[this.xvar].name,d[this.xvar].strnoerr,this.columns[this.yvar].name,d[this.yvar].strnoerr)}

    xval= this.tl(this.oneline(d[this.xvar].strnoerr))
    yval= this.tl(this.oneline(d[this.yvar].strnoerr))

    return "<span class='ttname'>"+this.tName(d["name"])+"</span>"+
    "<span class='ttpri'>"+this.tl(this.columns[this.xvar].name)+
        ": "+xval+"</span>"+
    "<span class='ttsec'>"+this.tl(this.columns[this.yvar].name) +
        ": "+yval+"</span>";
}
GWCatalogue.prototype.orderData = function(order='GPS'){
    this.cat.data=this.cat.data.sort(function(a,b){
        return b[order].best - a[order].best
    });
    var dataOrder=[];
    this.cat.data.forEach(function(d){dataOrder.push(d.name);});
    this.cat.dataOrder=dataOrder;
}
GWCatalogue.prototype.formatData = function(d,cols){
    // generate new columns
    if (this.debug){console.log('formatData',d.name);}
    var gw=this;
    // code to create mass estimate (NOT USED)
    // if ((d.detType.best=='Candidate')&&(!(d.M1))&&(!(d.M2))){
    //     // add estimated masses
    //     mlim1={'BBH':[5,80],'BNS':[0.1,3],'MassGap':[3,5],'NSBH':[5,80]};
    //     mlim2={'BBH':[5,80],'BNS':[0.1,3],'MassGap':[3,5],'NSBH':[0.1,3]};
    //     m1=[Infinity,-Infinity];
    //     m2=[Infinity,-Infinity];
    //     m1esttype=['hard','hard'];
    //     m2esttype=['hard','hard'];
    //     console.log(d)
    //     for (c in d.objType.prob){
    //         if (d.objType.prob[c]>0.01){
    //             m1[0]= (mlim1[c]) ? Math.min(m1[0],mlim1[c][0]) : m1[0];
    //             m1[1]= (mlim1[c]) ? Math.max(m1[1],mlim1[c][1]) : m1[1];
    //             if (m1[1]>50){m1esttype[1]='soft'}
    //             m2[0]= (mlim2[c]) ? Math.min(m2[0],mlim2[c][0]) : m2[0];
    //             m2[1]= (mlim2[c]) ? Math.max(m2[1],mlim2[c][1]) : m2[1];
    //             if (m2[1]>50){m2esttype[1]='soft'}
    //         }
    //     }
    //     rand1=(d.GPS.best % 3600 )/3600;
    //     rand2=(d.GPS.best % 86400 )/86400;
    //     m1b=(rand1-0.5)*(([m1[1]-m1[0]])/2) + 0.5*(m1[0]+m1[1]);
    //     m1err=[m1[0]-m1b,m1[1]-m1b];
    //     m2b=(rand2-0.5)*(([m2[1]-m2[0]])/2) + 0.5*(m2[0]+m2[1]);
    //     m2err=[m2[0]-m2b,m2[1]-m2b];
    //     d.M1={best:m1b,est:m1err,esttype:m1esttype};
    //     d.M2={best:m2b,est:m2err,esttype:m2esttype};
    //     // console.log(d.name,d.M1,d.M2);
    // }
    for (col in gw.columns){
        // console.log(col,gw.columns[col].type);
        if (gw.columns[col].type=="derived"){
            if (gw.columns[col].depfn(d)){
                d[col]={}
                if (gw.columns[col].convfn){
                    cIn=gw.columns[col].convfn[0]
                    if (d[cIn].best){
                        d[col].best=gw.columns[col].convfn[1](d[cIn].best)
                    }
                    if (d[cIn].upper){
                        d[col].upper=gw.columns[col].convfn[1](d[cIn].upper)
                    }
                    if (d[cIn].lower){
                        d[col].lower=gw.columns[col].convfn[1](d[cIn].lower)
                    }
                    if (d[cIn].err){
                        d[col].err=
                            [gw.columns[col].convfn[1](d[cIn].err[0]),
                            gw.columns[col].convfn[1](d[cIn].err[1])]
                    }
                    if (d[cIn].lim){
                        d[col].lim=
                            [gw.columns[col].convfn[1](d[cIn].lim[0]),
                            gw.columns[col].convfn[1](d[cIn].lim[1])]
                    }
                }else{
                    if (gw.columns[col].bestfn){d[col].best=gw.columns[col].bestfn(d);}
                    if (gw.columns[col].errfn){d[col].err=gw.columns[col].errfn(d);}
                    if (gw.columns[col].limfn){d[col].lim=gw.columns[col].limfn(d);}
                    if (gw.columns[col].lowerfn){d[col].lower=gw.columns[col].lowerfn(d);}
                    if (gw.columns[col].upperfn){d[col].upper=gw.columns[col].upperfn(d);}
                }
                // console.log('new column',col,d[col])
            }
        }
        if (d[col]){
            if ((d[col].err)&&(d[col].err.length==2)){
                d[col].errv =
                    [d[col].best+d[col].err[0],
                    d[col].best+d[col].err[1]];
                d[col].errtype='normal';
            }else if ((d[col].est)&&(d[col].est.length==2)){
                d[col].errv =
                    [d[col].best+d[col].est[0],
                    d[col].best+d[col].est[1]];
                d[col].errtype='est';
            }else if ((d[col].lim)&&(d[col].lim.length==2)){
                d[col].errv =
                    [Math.max.apply(Math,d[col].lim),
                    Math.min.apply(Math,d[col].lim)];
                d[col].best = 0.5*(d[col].lim[0] + d[col].lim[1]);
                d[col].errtype='normal';
            }else if ((d[col].lower)){
                d[col].errv =[d[col].lower,d[col].lower];
                d[col].best = d[col].lower;
                d[col].errtype='lower';
            }else if ((d[col].upper)){
                d[col].errv =[d[col].upper,d[col].upper];
                d[col].best = d[col].upper;
                d[col].errtype='upper';
            }else if ((d[col].best)&&(typeof d[col].best=="number")){
                d[col].errv =[d[col].best,d[col].best];
                d[col].errtype='none';
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
    }
}
GWCatalogue.prototype.makeGraph = function(){
    // create graph
    // console.log('makeGraph');
    this.graphcont=d3.select("div#graphcontainer")
    this.svgcont = this.graphcont.append("div")
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

    this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," +
            this.margin.top + ")")

    // add the tooltip area to the webpage
    if (!this.redraw){
        this.tooltip = d3.select("#"+this.holderid).append("div")
            .attr("class", "tooltip colourise")
            .style("opacity", 0);
    }
}

GWCatalogue.prototype.drawGraphInit = function(){
    // initialise graph drawing from data
    var gw = this;
    gw.loaded=0;
    // gw.data=[];
    gw.optionsOn=false;
    gw.helpOn=false;
    gw.langOn=false;
    gw.toLoad=3;
    gw.fileInEventsDefault="https://gwcat.cardiffgravity.org/data/gwosc_gracedb.jsonp";
    gw.fileInEvents = (gw.urlVars.eventsFile) ? gw.urlVars.eventsFile : (gw.inp.eventsFile) ? gw.inp.eventsFile : gw.fileInEventsDefault;
    gw.fileInGwoscDefault="https://gwcat.cardiffgravity.org/data/gwosc.json";
    gw.fileInGwosc = (gw.urlVars.gwoscFile) ? gw.urlVars.gwoscFile : (gw.inp.gwoscFile) ? gw.inp.gwoscFile : gw.fileInGwoscDefault;

    gw.loadLangDefault()
    gw.loadLang(this.langIn)
    // gw.langdict_default = gw.loadLang(gw.langDefault,true);

    eventsCallback = function (){
        // console.log('loaded');
        this.loaded++;
        // return
        // var dataIn=this;
        if (gw.debug){console.log("dataIn (events:)",this)}
        gw.loaded++;
        if (gw.debug){console.log('dataIn.links',this.links)}
        if (this.datadict){
            // gw.datadict=this.datadict;
            //uses GWOSC format (has datadict), so need to convert
            gw.dataFormat='gwosc';
            if (gw.debug){console.log('converting from GWOSC format');}
            newlinks={}
            for (e in this.data){
                if(gw.debug){console.log(e,this.data[e])}
                if(gw.debug){console.log(e,this.links)}
                if (this.links[e]){
                    linkIn=this.links[e];
                    if(gw.debug){console.log('linkIn',e,linkIn)}
                    newlinks[e]={}
                    for (l in linkIn){
                        if (linkIn[l].type.search('primarypub')>=0){
                            newlinks[e]['DetPaper']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'paper'}
                        }
                        if (linkIn[l].text.search('Paper')>=0){
                            // keeping for compatibility
                            newlinks[e]['DetPaper']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'paper'}
                        }
                        else if (linkIn[l].text.search('Open Data page')>=0){
                            newlinks[e]['GWOSCData']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'web-data'}
                        }
                        else if (linkIn[l].text.search('GraceDB page')>=0){
                            newlinks[e]['GraceDB']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'web-data'}
                        }
                        else if (linkIn[l].text.search('Final Skymap')>=0){
                            newlinks[e]['SkyMapFile']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'file'}
                        }
                        else if (linkIn[l].text.search('Skymap View')>=0){
                            newlinks[e]['SkyMapAladin']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'web'}
                        }
                    }
                    if(gw.debug){console.log('links',e,newlinks[e])}
                }
            }
            this.links=newlinks;
        }else{
            gw.dataFormat='std';
            newlinks=false;
        }
        if (gw.debug){console.log('dataIn.links',this.links,newlinks)}
        for (e in this.data){
            if (this.data[e].name[0]=='G'){c='GW'}
            else if (this.data[e].name[0]=='L'){c='LVT'}
            else{c=''}
            this.data[e].conf=c;
            if ((this.links[e]) && (this.links[e].GWOSCData)){
                link=this.links[e].GWOSCData;
                link.url=link.url;
                this.data[e].link=link;
            }
            if ((this.links[e]) && (this.links[e].DetPaper)){
                ref=this.links[e].DetPaper;
                ref.url=ref.url;
                this.data[e].ref=ref;
                if(gw.debug){console.log(this.data[e].name,ref)}
            }
            // gw.data.push(this.data[e]);
        }
        if(gw.debug){console.log('data pre-format:',gw.cat.data);}
        if (gw.loaded==gw.toLoad){
            gw.whenLoaded();
        }
    }

    if(this.debug){console.log('loading GWCat');}
    if (gw.datasrc=='gwosc'){
        gw.cat = new GWCat(eventsCallback,{datasrc:'gwosc','fileIn':gw.fileInEvents,gwoscFile:gw.fileInGwosc,debug:this.debug});
    }else{
        gw.cat = new GWCat(eventsCallback,{confirmedOnly:gw.confirmedOnly,'fileIn':gw.fileInEvents});
    }


}
GWCatalogue.prototype.whenLoaded = function(){
    var gw=this;
    gw.setColumns(gw.cat.datadict);
    gw.cat.data.forEach(function(d){
        gw.formatData(d,gw.columns)
    });
    // order Data
    gw.orderData();
    this.setScales();
    gw.makePlot();
    panel = (this.urlVars.panel) ? this.urlVars.panel : this.getPanel();
    gw.setPanel(panel)
    if(gw.debug){console.log('plotted');}
    // select a default event
}
GWCatalogue.prototype.loadLang = function(lang){
    var gw=this;
    if (this.debug){console.log('new language:',lang,'; stored language',gw.lang)}
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
                    console.log('Error loading language '+gw.lang+'. Displaying '+gw.langshort+' instead');
                    gw.updateUrl();
                    window.location.replace({},null,gw.makeUrl({'lang':gw.defaults.lang}));
                }
                window.location.replace(gw.makeUrl({'lang':gw.langshort}));
            }else{
                if(gw.debug){console.log('Error loading language '+gw.lang+'. Reverting to '+gw.defaults.lang+' as default');}
                if (gw.urlVars.lang){
                    alert('Error loading language '+gw.lang+'. Reverting to '+gw.defaults.lang+' as default');
                }
                window.location.replace(gw.makeUrl({'lang':gw.defaults.lang}));
            }
        }
        if(gw.debug){console.log('loaded:',gw.fileInLang);}
        for (ld in dataIn){
            if ((ld!="metadata")&(typeof dataIn[ld]!="string")){
                dataIn[ld]=dataIn[ld].text;
            }
        }
        gw.langdict=dataIn;
        if (reload){
            if (gw.debug){console.log('reloaded language',gw.lang);}
            // gw.setLang();
            gw.cat.data.forEach(function(d){gw.formatData(d,gw.columns)});
            gw.replot();
            d3.select(".lang-cont.current").classed("current",false);
            d3.select("#lang_"+gw.lang+"_cont").classed("current",true);
        }else{
            if (gw.debug){console.log('loaded language',gw.lang,gw.langdict);}
            gw.loaded++;
            // gw.setLang();
            if (gw.loaded==gw.toLoad){
                gw.whenLoaded();
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
        if(gw.debug){console.log('loaded:',gw.fileInLangDefault);}
        for (ld in dataIn){
            if ((ld!="metadata")&(typeof dataIn[ld]!="string")){
                dataIn[ld]=dataIn[ld].text;
            }
        }
        gw.langdictDefault=dataIn;
        gw.loaded++;
        if (gw.loaded==gw.toLoad){
            gw.whenLoaded();
            // gw.setColumns(gw.cat.datadict);
            // gw.cat.data.forEach(function(d){gw.formatData(d,gw.columns)});
            // gw.makePlot();
            // if(gw.debug){console.log('plotted');}
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

    d3.select("#options-gen > .panel-title")
        .html(this.tl('%text.plotgw.presets.title%'))
    for (pre in this.presets){
        d3.select("#"+pre+"-text")
            .html(this.tl(this.presets[pre]["desc"]));
        d3.select("#"+pre+"-x-axis")
            .html(this.tl(this.columns[this.presets[pre]["x-axis"]]["name"]));
        d3.select("#"+pre+"-y-axis")
            .html(this.tl(this.columns[this.presets[pre]["y-axis"]]["name"]));
    }
    d3.select("#preset-warn")
        .html(this.tl('%text.plotgw.presets.filter-warn%'))
    d3.select("#preset-filter-link")
        .html(this.tl('%text.plotgw.presets.filter-link%'))
    d3.select("#options-x > .panel-title")
        .html(this.tl('%text.plotgw.horizontal-axis%'))
    d3.select("#x-buttons-all > .panel-block")
        .html(this.tl('%text.plotgw.options.allsrc%'))
    d3.select("#x-buttons-conf > .panel-block")
        .html(this.tl('%text.plotgw.options.conf-only%'))
    d3.select("#options-y > .panel-title")
        .html(this.tl('%text.plotgw.vertical-axis%'))
    d3.select("#y-buttons-all > .panel-block")
        .html(this.tl('%text.plotgw.options.allsrc%'))
    d3.select("#y-buttons-conf > .panel-block")
        .html(this.tl('%text.plotgw.options.conf-only%'))
    d3.select("#display-options > .panel-title")
        .html(this.tl('%text.plotgw.display%'))
    d3.selectAll("#xzero-lab,#yzero-lab")
        .html(this.tl('%text.plotgw.axiszero%'))
    d3.selectAll("#xlog-lab,#ylog-lab")
        .html(this.tl('%text.plotgw.log-axis%'))
    d3.select("#options-colour")
        .html(this.tl('%text.plotgw.colour%'))
    for (c in this.colourList){
        d3.select('#colour-'+c).html(this.tl(this.colourList[c].label));
    }
    d3.select("#filterr > label")
        .html(this.tl('%text.plotgw.filter.errpr%'))
    d3.select("#filter-title")
        .html(this.tl("%text.plotgw.filter.title%"));
    d3.select("#filter-text")
        .html(this.tl("%text.plotgw.filter.text%"));
    for (f in this.filters){
        d3.select('#filt_'+f+'_label > .filter-text')
            .html(this.tl(this.filters[f].name));
        d3.select('#filt_'+f+'_label > .filter-note')
            .html(this.tl(this.filters[f].note));
    }
    this.legenddescs = {GW:this.tl('%text.plotgw.legend.detections%'),
        Candidate:this.tl('%text.plotgw.legend.candidates%')}
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
    d3.select('#copy-button').attr('title',this.tl('%text.gen.share.copylink%'))
    d3.select('#facebook-share-button').attr('title',this.tl('%text.gen.share.fb%'))
    d3.select('#twitter-share-button').attr('title',this.tl('%text.gen.share.twitter%'))
}
GWCatalogue.prototype.setColour = function(newScheme){
    var gw=this;
    var oldScheme=this.colScheme;
    if (!this.colourList[newScheme]){
        console.log('ERROR: Unknown colour scheme:',newScheme);
        return;
    }else{console.log('Setting colour scheme from',oldScheme,'to',newScheme);}
    colEls=d3.selectAll('.colourise')[0]
    colEls.forEach(function(el){
        console.log('colourising',el.id,el.classList)
        if (!(gw.colourList[oldScheme].default)){
            console.log('removing old class:',gw.colourList[oldScheme].class);
            el.classList.remove(gw.colourList[oldScheme].class);
        }else{
            console.log('old scheme',oldScheme,'is default')
        }
        if ((!(gw.colourList[newScheme].default))){
            console.log('adding new class:',gw.colourList[newScheme].class);
            el.classList.add(gw.colourList[newScheme].class);
        }else{
            console.log('new scheme',newScheme,'is default')
        }
    });
    this.colScheme=newScheme;
    this.setStyles();
    this.replot();
    this.updateBothAxes(this.xvar,this.yvar);
    return;
}
GWCatalogue.prototype.getMinMax = function(p,logax,zeroax){
    var gw = this;
    var dminmax=[Infinity,-Infinity];
    border=(gw.columns[p].border) ? gw.columns[p].border : 2;
    scale = (gw.columns[p].scale) ? gw.columns[p].scale : "";
    dolog=logax;
    dozero=zeroax;
    if (gw.columns[p].forcelog){
        dolog= (gw.columns[p].forcelog=='on') ? true : false;
    }
    if (gw.columns[p].forcezero){
        dozero= (gw.columns[p].forcezero=='on') ? true : false;
    }
    // nolog = (gw.columns[p].forcelog) ? gw.columns[p].forcelog : false;
    for (i=0;i<gw.cat.data.length;i++){
        if (gw.cat.data[i].active!=false){
            if ((gw.cat.data[i][p])&&(gw.cat.data[i][p].errv)){
                pmin=Math.min(gw.cat.data[i][p].errv[0],gw.cat.data[i][p].errv[1])
                pmax=Math.max(gw.cat.data[i][p].errv[0],gw.cat.data[i][p].errv[1])
            }else{
                pmin=gw.cat.getMinVal(gw.cat.data[i].name,p);
                pmax=gw.cat.getMaxVal(gw.cat.data[i].name,p)
            }
            if (pmin){dminmax[0] = Math.min(pmin,dminmax[0])}
            if (pmax){dminmax[1] = Math.max(pmax,dminmax[1])}
        }
    }
    if (dolog){
        // console.log(p,'log axis',dminmax)
        dminmax[0] = Math.pow(10,Math.floor(Math.log10(dminmax[0])))
        dminmax[1] = Math.pow(10,Math.ceil(Math.log10(dminmax[1])))
    }else{
        // console.log(p,'linear axis')
        if (gw.debug){console.log('axiszero',dozero,dminmax[0])};
        if ((dozero)&&(scale!="time")){
            // if axiszero set, set axis min to zero unless already <0
            dminmax[0] = (dminmax[0]<0) ? dminmax[0]-border : 0;
        }else{
            // set to min-border
            dminmax[0] = (dminmax[0] < 0) ? dminmax[0]-border : (dminmax[0] < border) ? 0 : dminmax[0]-border;
        }
        // add border on to max
        dminmax[1] = dminmax[1]+border;
        // if min<0, add on border
        // dminmax[0] = dminmax[0]<0 ? dminmax[0]-border : (gw.axiszero&&dminmax[0]<border ? 0 : dminmax[0]-border);
    }

    return dminmax;
}

GWCatalogue.prototype.setXYscales = function(xvarNew,yvarNew){

    var gw=this;
    gw.xvar = xvarNew;
    gw.yvar = yvarNew;

    [xMin,xMax]=gw.getMinMax(gw.xvar,gw.xlog,gw.xzero);
    // console.log('x min/max',gw.xvar,xMin,xMax);
    if ((gw.columns[gw.xvar].scale)&&(gw.columns[gw.xvar].scale='time')){
        gw.xScale = d3.time.scale().range([0,gw.graphWidth])
        datexMin=new Date(xMin);
        datexMax=new Date(xMax);
        gw.xScale.domain([datexMin, datexMax]);
        // set tick interval in months
        mxdiff=(datexMax-datexMin)/(86400*30*1e3);
        mxticks=(mxdiff > 24) ? 6 : (mxdiff < 12) ? 1 : 3;
        gw.xScale.nice(d3.time.month,mxticks);
        if(document.getElementById('x-axis-g')){document.getElementById('x-axis-g').classList.remove('log');}
        // x axis
        this.xAxis = d3.svg.axis()
                .scale(gw.xScale)
                .ticks(d3.time.month,mxticks)
                .orient("bottom")
                .innerTickSize(-this.graphHeight)
                .tickFormat(gw.tickTimeFormat);
    }else{
        dologx=this.xlog;
        if (gw.columns[gw.xvar].forcelog){
            dologx= (gw.columns[gw.xvar].forcelog=='on') ? true : false;
        }
        if (dologx){
            this.xScale = d3.scale.log().base(10).range([0, this.graphWidth]);
            // [xMin,xMax]=gw.getMinMax(gw.xvar,gw.xlog,gw.xzero);
            this.xScale.domain([xMin, xMax]);
            if(document.getElementById('x-axis-g')){document.getElementById('x-axis-g').classList.add('log');}
        }else{
            this.xScale = d3.scale.linear().range([0, this.graphWidth])
            this.xScale.domain([xMin, xMax]);
            if(document.getElementById('x-axis-g')){document.getElementById('x-axis-g').classList.remove('log');}
        }
        // x axis
        this.xAxis = d3.svg.axis()
                .scale(this.xScale)
                .orient("bottom")
                .innerTickSize(-this.graphHeight);
    }

    if(this.debug){console.log('x',gw.axiszero,xMin,xMax,gw.xScale.range(),gw.xScale.domain())}

    [yMin,yMax]=gw.getMinMax(gw.yvar,gw.ylog,gw.yzero);
    // console.log('y min/max',gw.yvar,yMin,yMax);
    if ((gw.columns[gw.yvar].scale)&&(gw.columns[gw.yvar].scale='time')){
        gw.yScale = d3.time.scale().range([gw.graphHeight,0])
        dateyMin=new Date(yMin);
        dateyMax=new Date(yMax);
        gw.yScale.domain([dateyMin, dateyMax])
        // set tick interval in months
        mydiff=(dateyMax-dateyMin)/(86400*30*1e3);
        myticks=(mydiff > 24) ? 6 : (mydiff < 12) ? 1 : 3;
        gw.yScale.nice(d3.time.month,myticks);
        if(document.getElementById('y-axis-g')){document.getElementById('y-axis-g').classList.remove('log');}
        // y axis
        this.yAxis = d3.svg.axis()
                .scale(gw.yScale)
                .ticks(d3.time.month,myticks)
                .orient("left")
                // .innerTickSize(-(this.relw[1]-this.relw[0])*this.graphWidth);
                .innerTickSize(-this.graphWidth)
                .tickFormat(gw.tickTimeFormat);

    }else{
        dology=this.ylog;
        if (gw.columns[gw.yvar].forcelog){
            dology= (gw.columns[gw.yvar].forcelog=='on') ? true : false;
        }
        if (dology){
            // this.axiszero=false;
            this.yScale = d3.scale.log().base(10).range([gw.graphHeight,0])
            // [yMin,yMax]=gw.getMinMax(gw.yvar,gw.ylog,gw.yzero);
            this.yScale.domain([yMin, yMax]);
            if(document.getElementById('y-axis-g')){document.getElementById('y-axis-g').classList.add('log');}
        }else{
            this.yScale = d3.scale.linear().range([gw.graphHeight,0])
            this.yScale.domain([yMin, yMax]);
            if(document.getElementById('y-axis-g')){document.getElementById('y-axis-g').classList.remove('log');}
        }
        // y axis
        this.yAxis = d3.svg.axis()
                .scale(this.yScale)
                .orient("left")
                // .innerTickSize(-(this.relw[1]-this.relw[0])*this.graphWidth);
                .innerTickSize(-this.graphWidth);

    }
    if(this.debug){console.log('y',gw.axiszero,yMin,yMax,gw.yScale.range(),gw.yScale.domain())}
    return;
}

GWCatalogue.prototype.drawGraph = function(){
    // draw graph
    var gw = this;
    // gw.setSvgScales();
    gw.makeGraph();
    data = gw.cat.data;
    if(this.debug){console.log('plotting ',gw.xvar,' vs ',gw.yvar);}

    // x-axis
    gw.svg.append("g")
        .attr("class", "x-axis axis colourise "+gw.getColClass())
        .attr("id","x-axis-g")
        .attr("transform", "translate("+gw.margin.left+"," +
            (gw.margin.top + gw.graphHeight) + ")");
    // y-axis
    gw.svg.append("g")
        .attr("class", "y-axis axis colourise "+gw.getColClass())
        .attr("id","y-axis-g")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")");

    gw.setXYscales(gw.xvar,gw.yvar);

    if (gw.showerrors == null){gw.showerrors=true};


    // x-axis components
    gw.svg.append("line")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("class","x-axis-line axis-line")
        .attr("x1",0).attr("x2",gw.graphWidth)
        .attr("y1",gw.yScale(0)).attr("y2",gw.yScale(0))
        .style("stroke",gw.getCol('axis')).attr("stroke-width",5)
        .attr("opacity",gw.xAxLineOp);
    gw.svg.select(".x-axis.axis").call(gw.xAxis)
    // console.log('xticks',gw.svg.select(".x-axis.axis"),gw.svg.select(".x-axis.axis").selectAll('.tick > text'));
    gw.svg.select(".x-axis.axis").append("text")
        .attr("class", "x-axis axis-label")
        // .attr("x", (gw.relw[0]+gw.relw[1])*gw.graphWidth/2)
        .attr("x", gw.graphWidth/2)
        .attr("y", 1.2*(1+gw.scl)+"em")
        .style("text-anchor", "middle")
        .style("font-size",(1+gw.scl)+"em")
        .style("fill",gw.getCol('text'))
        .text(gw.getLabelUnit(gw.xvar,true));
    // axis icon is div in SVG container (not SVG element)
    gw.graphcont.append("div")
        .attr("class", "x-axis axis-icon colourise "+gw.getColClass())
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
        .style("font-size",(0.8*(1+gw.scl))+"em")
        .style("fill",gw.getCol('text'));

    // y-axis components
    gw.svg.append("line")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .attr("class","y-axis-line axis-line")
        .attr("x1",gw.xScale(0)).attr("x2",gw.xScale(0))
        .attr("y1",0).attr("y2",gw.graphHeight)
        .style("stroke",gw.getCol('axis')).attr("stroke-width",5)
        .attr("opacity",gw.yAxLineOp);
    gw.svg.select(".y-axis.axis").call(gw.yAxis)
    gw.svg.select(".y-axis.axis").append("text")
        .attr("class", "y-axis axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x",-gw.graphHeight/2)
        .attr("dy", (-30*(1+gw.scl))+"px")
        .style("text-anchor", "middle")
        .style("font-size",(1+gw.scl)+"em")
        .style("fill",gw.getCol('text'))
        .text(gw.getLabelUnit(gw.yvar,true));
    // axis icon is div in SVG container (not SVG element)
    gw.graphcont.append("div")
        .attr("class", "y-axis axis-icon colourise "+gw.getColClass())
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
        .style("font-size",(0.8*(1+gw.scl))+"em")
        .style("fill",gw.getCol('text'));

    d3.selectAll('.tick > line')
            .style('stroke',gw.getCol('tick'))
            .style('opacity',1)


    // add x error bar
    errorGroup = gw.svg.append("g").attr("class","g-errors")
    errX=errorGroup.selectAll(".errorX-g")
        .data(data)
    .enter().append("g")
        .attr("class","error errorX-g")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
    errX.append("line")
        .attr("class","error errorX errorXline")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMapErrP).attr("x2",gw.xMapErrM)
        .attr("y1",gw.yMap).attr("y2",gw.yMap)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)});
    // add top of x error bar
    errX.append("line")
        .attr("class","error errorX errorXp1")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMapErrPouter).attr("x2",gw.xMapErrP)
        .attr("y1",gw.xMapErrY0).attr("y2",gw.yMap)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)});
    errX.append("line")
        .attr("class","error errorX errorXp2")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMapErrP).attr("x2",gw.xMapErrPouter)
        .attr("y1",gw.yMap).attr("y2",gw.xMapErrY1)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)});
    // add bottom of x error bar
    errX.append("line")
        .attr("class","error errorX errorXm1")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMapErrMouter).attr("x2",gw.xMapErrM)
        .attr("y1",gw.xMapErrY0).attr("y2",gw.yMap)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)});
    errX.append("line")
        .attr("class","error errorX errorXm2")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMapErrM).attr("x2",gw.xMapErrMouter)
        .attr("y1",gw.yMap).attr("y2",gw.xMapErrY1)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)});
    // add y error bar
    errY=errorGroup.selectAll(".errorY-g")
        .data(data)
    .enter().append("g")
        .attr("class","error errorY-g")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
    errY.append("line")
        .attr("class","error errorY errorYline")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMap).attr("x2",gw.xMap)
        .attr("y1",gw.yMapErrP).attr("y2",gw.yMapErrM)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",function(d){return gw.errOp(d,gw.yvar)});
    // add top of y error bar
    errY.append("line")
        .attr("class","error errorY errorYp1")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.yMapErrX0).attr("x2",gw.xMap)
        .attr("y1",gw.yMapErrPouter).attr("y2",gw.yMapErrP)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",function(d){return gw.errOp(d,gw.yvar)});
    errY.append("line")
        .attr("class","error errorY errorYp2")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMap).attr("x2",gw.yMapErrX1)
        .attr("y1",gw.yMapErrP).attr("y2",gw.yMapErrPouter)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",function(d){return gw.errOp(d,gw.yvar)});
    // add bottom of y error bar
    errY.append("line")
        .attr("class","error errorY errorYm1")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.yMapErrX0).attr("x2",gw.xMap)
        .attr("y1",gw.yMapErrMouter).attr("y2",gw.yMapErrM)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",function(d){return gw.errOp(d,gw.yvar)});
    errY.append("line")
        .attr("class","error errorY errorYm2")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMap).attr("x2",gw.yMapErrX1)
        .attr("y1",gw.yMapErrM).attr("y2",gw.yMapErrMouter)
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("opacity",0.1);
        // .attr("opacity",function(d){return gw.errOp(d,gw.yvar)});

    // if (!gw.showerrors){gw.toggleErrors();}

    // add highlight circle
    gw.svg.append("g")
        .attr("class","g-highlight")
        .attr("transform", "translate("+gw.margin.left+","+
            gw.margin.top+")")
        .style("fill","white")
        .style("fill-opacity",0)
        .style("stroke",gw.getCol('highlight'))
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
    dotsGroup = gw.svg.append("g").attr("class","g-dots")
    dotsGroup.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("transform", "translate("+gw.margin.left+","+
        gw.margin.top+")")
      .attr("r", Math.min(10.,7/gw.sksc))
      // .attr("cx", function(d){console.log('draw dotx',d.name,gw.xvar,gw.xMap(d));return gw.xMap(d);})
      // .attr("cy", function(d){console.log('draw doty',d.name,gw.yvar,gw.yMap(d));return gw.yMap(d);})
      .attr("cx", gw.xMap)
      .attr("cy", gw.yMap)
      .attr("cursor","pointer")
      .attr("opacity",function(d){return gw.getOpacity(d)})
    //   .style("fill", function(d) { return color(cValue(d));})
      .style("fill", function(d){return gw.color(gw.cValue(d));})
      .style("stroke",function(d){return gw.linestyles(d.detType.best);})
      .style("stroke-dasharray",function(d){return gw.linedashes(d.detType.best);})
      .style("stroke-width",Math.min(5,2./gw.sksc))
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
          gw.selectEvent(d)
        //   gw.moveHighlight(d);
        //   gw.updateSketch(d);
        //   add highlight to selected circle
        });

    // draw legend
    gw.legend = gw.svg.selectAll(".legend")
      .data(gw.color.domain())
    .enter().append("g")
      .attr("class", function(d,i){return "legend "+d;})
      .attr("transform", function(d, i) { return "translate(0," +
        (i * 24) + ")"; });

    // draw legend colored circles
    gw.legend.append("circle")
      .attr("cx", gw.margin.left+16.5)
      .attr("cy", gw.margin.top+21)
      .attr("r", 9)
      .style("fill", gw.color)
      .style("stroke-dasharray",function(d){return gw.linedashes(d);})
      .style("stroke-width",Math.min(5,2./gw.sksc))
      .style("stroke",function(d){return gw.linestyles(d);})
      .attr("opacity",function(d){return gw.dotopacity(d)});

    // draw legend text
    gw.legend.append("text")
      .attr("x", gw.margin.left + 36)
      .attr("y", gw.margin.top + 21)
      .attr("dy", ".35em")
      .attr("font-size","1.2em")
      .style("text-anchor", "start")
      .style("fill",gw.getCol('text'))
      .text(function(d) { if (gw.legenddescs[d]){return gw.legenddescs[d];}else{return d}})

    //add options icon
    optionsClass = (this.optionsOn) ? "graph-icon" : "graph-icon hidden";
    this.optionsbg = d3.select('#options-bg');
    this.optionsouter = d3.select('#options-outer')
    this.graphcont.append("div")
        .attr("id","options-icon")
        .attr("class",optionsClass+" colourise "+gw.getColClass())
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
    this.graphcont.append("div")
        .attr("id","info-icon")
        .attr("class",infoClass+" colourise "+gw.getColClass())
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
        .on("click",function(){gw.hideOptions();gw.hideHelp();gw.hideLang();gw.hideFilter();});

    //add help icon
    helpClass = (this.helpOn) ? "graph-icon" : "graph-icon hidden";
    this.helpouter = d3.select('#help-outer')
    this.graphcont.append("div")
        .attr("id","help-icon")
        .attr("class",helpClass+" colourise "+gw.getColClass())
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
    this.graphcont.append("div")
        .attr("id","lang-icon")
        .attr("class",langClass+" colourise "+gw.getColClass())
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
    this.graphcont.append("div")
        .attr("id","errors-icon")
        .attr("class","graph-icon"+((this.showerrors) ? "" : " hidden")+" colourise "+gw.getColClass())
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

    // add filter button
    filterClass = (this.filterOn) ? "graph-icon" : "graph-icon hidden";
    this.filterouter = d3.select('#filter-outer')
    this.graphcont.append("div")
        .attr("id","filter-icon")
        .attr("class",filterClass+" colourise "+gw.getColClass())
        .style({"right":gw.margin.right+5*(gw.margin.top+10),"top":0,"width":40*gw.ysc,"height":40*gw.ysc})
        .on("mouseover", function(d) {
              gw.tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
              gw.tooltip.html(gw.tl('%tooltip.plotgw.showfilter%'))
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
        .attr("src","img/filter.svg")
        .on("click",function(){gw.showFilter();});
    // this.langbg.on("click",function(){gw.hideLang();});
    this.filterouter
        .style("top","200%");
    this.filterouter.select("#filter-close")
        .on("click",function(){gw.hideFilter();});

    //add share button
    this.graphcont.append("div")
        .attr("id","share-icon")
        .attr("class","graph-icon hidden colourise "+gw.getColClass())
        .style({"right":gw.margin.right+6*(gw.margin.top+10),"top":0,"width":gw.margin.top,"height":gw.margin.top})
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

    //add search button
    this.graphcont.append("div")
        .attr("id","search-icon")
        .attr("class","graph-icon hidden colourise "+gw.getColClass())
        .style({"right":gw.margin.right+7*(gw.margin.top+10),"top":0,"width":gw.margin.top,"height":gw.margin.top})
        .on("mouseover",function(){
            gw.showTooltipManual("%tooltip.plotgw.search%");
        })
        .on("mouseout",function(){
            gw.hideTooltipManual();
        }).append("img")
        .attr("src","img/search.svg")
        .attr("class","hidden")
        .attr("id","search-img")
        .on("click",function(){gw.showSearch();gw.hideTooltipManual();});

    this.populateSearchList();
    d3.select("#search-bg").on("click",function(){gw.hideSearch();});
    d3.select("#search-close").on("click",function(){gw.hideSearch();});
    if(gw.debug){console.log('selected:',gw.selectedevent);}

    //add search button
    this.graphcont.append("div")
        .attr("id","download-icon")
        .attr("class","graph-icon hidden colourise "+gw.getColClass())
        .style({"right":gw.margin.right+8*(gw.margin.top+10),"top":0,"width":gw.margin.top,"height":gw.margin.top})
        .on("mouseover",function(){
            gw.showTooltipManual("%tooltip.plotgw.save.png%");
        })
        .on("mouseout",function(){
            gw.hideTooltipManual();
        }).append("img")
        .attr("src","img/save.svg")
        .attr("class","hidden")
        .attr("id","download-img")
        .on("click",function(){gw.makeCanvas();gw.saveCanvas();gw.removeCanvas();gw.hideTooltipManual();});

}
GWCatalogue.prototype.populateSearchList = function(){
    var gw=this;
    d3.selectAll('.search-list-item').remove()
    gw.cat.data
        .filter(function(d){return d.active;})
        .forEach(function(d){
            d3.select('#search-outer').append("div")
                .attr("class","popup-list-item search-list-item")
                .attr("id","search-list-"+d.name)
                .html(d.name)
                .on("click",function(){
                    if (gw.selectedevent!=this.innerHTML){gw.selectEvent(this.innerHTML);gw.hideSearch();}
                });
        })
}

GWCatalogue.prototype.selectEvent = function(ev,redraw=false,init=false){
    var gw=this;
    if (typeof ev == "string"){
        if(parseInt(ev)==parseInt(ev)){
            // ev is a string which is a number
            evnum=parseInt(ev)
            if (evnum<0){
                evnum=gw.cat.dataOrder.length + evnum
            }
            evnum=evnum % gw.cat.dataOrder.length
        }else{
            // ev is a string which is not a number
            evnum=gw.cat.dataOrder.indexOf(ev)
        }
        if (evnum>=0){d=gw.cat.data[evnum]}else{d=null}
    }else if(typeof ev == "number"){
        // ev is a number
        evnum=ev
        if (evnum<0){
            evnum=gw.cat.dataOrder.length + evnum
        }
        evnum=evnum % gw.cat.dataOrder.length
        d=gw.cat.data[evnum]
    }else{
        // evname is an event object
        evnum=gw.cat.dataOrder.indexOf(ev.name)
        d=ev;
    }
    if (d){
        // d exists
        if (init){
            gw.dataIdx=evnum;
            gw.updateSketch(d);
            gw.moveHighlight();
            if(document.getElementById("search-list-"+d.name)){
                document.getElementById("search-list-"+d.name).classList.add("current")
            }
        }else if((d.name!=gw.selectedevent)||(redraw)){
            // different to currently selected event
            gw.dataIdx=evnum;
            gw.updateSketch(d);
            gw.moveHighlight();
            if (document.getElementById("search-list-"+gw.selectedevent)){
                document.getElementById("search-list-"+gw.selectedevent).classList.remove("current")
            }
            if (gw.selectedevent!=d.name){
                gw.selectedevent=d.name;
                if(document.getElementById("search-list-"+d.name)){
                    document.getElementById("search-list-"+d.name).classList.add("current")
                }
            }
        }else{
            // selected the same event
            gw.updateSketch(d);
            gw.moveHighlight();
            if (document.getElementById("search-list-"+gw.selectedevent)){
                document.getElementById("search-list-"+gw.selectedevent).classList.remove("current")
            }
            gw.selectedevent="none";
            gw.dataIdx=null;
        }
    }else{
        gw.selectedevent="none";
        gw.dataIdx=null;
    }
    this.updateUrl();
    this.showInfo();
}
GWCatalogue.prototype.selectNext = function(dir=1){
    this.selectEvent(this.dataIdx+dir)
    return(this.dataIdx)
}

GWCatalogue.prototype.moveHighlight = function(fadeOut=false){
    // move highlight circle
    var gw=this;
    d=this.d;
    if (!d) {
        // fade out
        gw.svg.select("#highlight")
            .transition().duration(500)
            .style("opacity",0);
        return
    }else if ((d.active==false)||(fadeOut)){
        gw.svg.select("#highlight")
            .transition().duration(500)
            .style("opacity",0);
    // }else if ((this.selectedevent==d["name"])){
    //     console.log('fading out',d);
    //     // fade out
    //     gw.svg.select("#highlight")
    //         .transition().duration(500)
    //         // .attr("cx",gw.xMap(d)).attr("cy",gw.yMap(d))
    //         .style("opacity",0);
    }else{
        // fade in and move
        gw.svg.select("#highlight")
            .transition().duration(500)
            .attr("cx",gw.xMap(d)).attr("cy",gw.yMap(d))
            .style("opacity",gw.dotOp(d));
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
    var gw=this;

    // add/update x-errors
    errX=this.svg.selectAll(".errorX-g")
        .data(this.cat.data)
    // main x error bar
    errX.selectAll(".errorXline")
        .transition()
        .duration(750)
        .attr("x1",this.xMapErrP).attr("x2",this.xMapErrM)
        .attr("y1",this.yMap).attr("y2",this.yMap)
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)})
        .attr("stroke-width",gw.swErr)
        .attr("stroke",gw.getCol('err'))
    // +ve x error (top)
    errX.selectAll(".errorXp1")
        .transition()
        .duration(750)
        .attr("x1",gw.xMapErrPouter)
        .attr("x2",gw.xMapErrP)
        .attr("y1",this.xMapErrY0).attr("y2",this.yMap)
        .attr("stroke",gw.getCol('err'))
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)});
    // +ve x error (bottom)
    errX.selectAll(".errorXp2")
        .transition()
        .duration(750)
        .attr("x1",gw.xMapErrP)
        .attr("x2",gw.xMapErrPouter)
        .attr("y1",this.yMap).attr("y2",this.xMapErrY1)
        .attr("stroke",gw.getCol('err'))
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)});
    // -ve x error (top)
    errX.selectAll(".errorXm1")
        .transition()
        .duration(750)
        .attr("x1",gw.xMapErrMouter)
        .attr("x2",gw.xMapErrM)
        .attr("y1",this.xMapErrY0).attr("y2",this.yMap)
        .attr("stroke",gw.getCol('err'))
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)});
    // -ve x error (bottom)
    errX.selectAll(".errorXm2")
        .transition()
        .duration(750)
        .attr("x1",gw.xMapErrMouter)
        .attr("x2",gw.xMapErrM)
        .attr("y1",this.yMap).attr("y2",this.xMapErrY1)
        .attr("stroke",gw.getCol('err'))
        .attr("opacity",function(d){return gw.errOp(d,gw.xvar)});

    // add/update y-errors
    errY=this.svg.selectAll(".errorY-g")
        .data(this.cat.data)
    // main y error line
    errY.selectAll('.errorYline')
        .transition()
        .duration(750)
        .attr("x1",this.xMap).attr("x2",this.xMap)
        .attr("y1",this.yMapErrP).attr("y2",this.yMapErrM)
        .attr("opacity",function(d){return gw.errOp(d,gw.yvar)})
        .attr("stroke",gw.getCol('err'))
        .attr("stroke-width",gw.swErr)
        .attr("stroke",gw.getCol('err'))
    // +ve y error (top)
    errY.selectAll(".errorYp1")
        .transition()
        .duration(750)
        .attr("x1",this.yMapErrX0).attr("x2",this.xMap)
        .attr("y1",gw.yMapErrPouter)
        .attr("y2",gw.yMapErrP)
        .attr("stroke",gw.getCol('err'))
        .attr("opacity",function(d){return gw.errOp(d,gw.yvar)});
    // +ve y error (bottom)
    errY.selectAll(".errorYp2")
        .transition()
        .duration(750)
        .attr("x1",this.xMap).attr("x2",this.yMapErrX1)
        .attr("y1",gw.yMapErrP)
        .attr("y2",gw.yMapErrPouter)
        .attr("stroke",gw.getCol('err'))
        .attr("opacity",function(d){return gw.errOp(d,gw.yvar)});
    // -ve y error (top)
    errY.selectAll(".errorYm1")
        .transition()
        .duration(750)
        .attr("x1",this.yMapErrX0).attr("x2",this.xMap)
        .attr("y1",gw.yMapErrM)
        .attr("y2",gw.yMapErrMouter)
        .attr("stroke",gw.getCol('err'))
        .attr("opacity",function(d){return gw.errOp(d,gw.yvar)});
    // -ve y error (bottom)
    errY.selectAll(".errorYm2")
        .transition()
        .duration(750)
        .attr("x1",this.xMap).attr("x2",this.yMapErrX1)
        .attr("y1",gw.yMapErrM)
        .attr("y2",gw.yMapErrMouter)
        .attr("stroke",gw.getCol('err'))
        .attr("opacity",function(d){return gw.errOp(d,gw.yvar)});
}
GWCatalogue.prototype.toggleErrors = function(){
    // toggle showing errors
    // console.log(this.svgcont.select("#errors-img"));
    if (this.showerrors){
        this.showerrors = false;
        this.graphcont.select("#errors-icon")
            .attr("class","graph-icon hidden")
        this.graphcont.select("#errors-img")
            .attr("class","errors-hide")
    }else{
        this.showerrors = true;
        this.graphcont.select("#errors-icon")
            .attr("class","graph-icon")
        this.graphcont.select("#errors-img")
            .attr("class","errors-show")
    }
    // console.log("toggling errors");
    this.updateErrors();
    this.redrawLabels();
    this.updateUrl();
}
GWCatalogue.prototype.updateLegend = function(){
    // update position of legend
    // not implemented yet
    return
}

GWCatalogue.prototype.updateBothAxes = function(xvarNew,yvarNew) {
    // update x-xais to xvarNew
    // set global variable
    this.xvar = xvarNew;
    this.yvar = yvarNew;
    var gw=this;
    var data=gw.cat.data;

    [xMin,xMax]=gw.getMinMax(gw.xvar,gw.xlog,gw.xzero);
    [yMin,yMax]=gw.getMinMax(gw.yvar,gw.ylog,gw.yzero);
    gw.setXYscales(gw.xvar,gw.yvar);

    gw.yAxLineOp = (xMin < 0) ? 0.5 : 0;
    gw.xAxLineOp = (yMin < 0) ? 0.5 : 0;

    // Select the section we want to apply our changes to
    var svg = d3.select("body").transition();
    // Move the dots
    gw.svg.selectAll(".dot") // change the line
        .data(this.cat.data)
        .transition()
        .duration(750)
        // .attr("cx", function(d){console.log('update dotx',d.name,gw.xvar,gw.xMap(d));return gw.xMap(d);})
        // .attr("cy", function(d){console.log('update doty',d.name,gw.yvar,gw.yMap(d));return gw.yMap(d);})
        .attr("cx", this.xMap)
        .attr("cy", this.yMap)
        .style("opacity",this.dotOp);

    function powerOfTen(d) {
      return d / Math.pow(10, Math.ceil(Math.log(d) / Math.LN10 - 1e-12)) === 1;
    }
    gw.svg.select(".x-axis.axis")
        .transition()
        .duration(750)
        .call(gw.xAxis);
    if (d3.select('#x-axis-g').attr('class').includes('log')){
        d3.select('.axis.x-axis').selectAll('.tick text')
            .text(null)
            .filter(powerOfTen)
                .text(10)
                .attr("dy","1em")
            .append("tspan")
                .attr("dy", "-.7em")
                .attr("font-size","0.7em")
                .text(function(d) { return Math.round(Math.log(d) / Math.LN10); });
    }
    //   .forceX([0]);
    gw.svg.select(".x-axis.axis-label")
        .transition()
        .duration(750)
        .text(gw.getLabelUnit(gw.xvar,true));

    gw.svg.select(".y-axis-line.axis-line")
        .transition()
        .duration(750)
        .attr("x1",gw.xScale(0)).attr("x2",gw.xScale(0))
        .attr("opacity",gw.yAxLineOp);

    // change the y axis
    gw.svg.select(".y-axis.axis")
        .transition()
        .duration(750)
        .call(gw.yAxis);
    if (d3.select('#y-axis-g').attr('class').includes('log')){
        d3.select('.axis.y-axis').selectAll('.tick text')
            .text(null)
            .filter(powerOfTen)
                .text(10)
                // .attr("dx","1em")
            .append("tspan")
                .attr("dy", "-.7em")
                .attr("font-size","0.7em")
                .text(function(d) { return Math.round(Math.log(d) / Math.LN10); });
    }
    gw.svg.selectAll(".y-axis.axis-label")
        .transition()
        .duration(750)
        .text(gw.getLabelUnit(gw.yvar,true));

    gw.svg.select(".x-axis-line.axis-line")
        .transition()
        .duration(750)
        .attr("y1",gw.yScale(0)).attr("y2",gw.yScale(0))
        .attr("opacity",gw.xAxLineOp);

    data.forEach(function(d){
        if (d.name==gw.sketchName){
            gw.svg.select("#highlight")
                .transition()
                .duration(750)
                .attr("cx", gw.xMap(d))
                .attr("cy", gw.yMap(d))
                .style("opacity",gw.dotOp(d));
        }
    });
    // Update error bars
    gw.updateErrors();
    // });
    gw.updateUrl();
    // window.history.pushState({},null,gw.makeUrl());
}

GWCatalogue.prototype.addOptions = function(){
    // add options boxetc.
    // console.log("add options");
    var gw=this;
    // add buttons
    var col;
    var divxall = document.getElementById('x-buttons-all');
    var divxconf = document.getElementById('x-buttons-conf');
    var divyall = document.getElementById('y-buttons-all');
    var divyconf = document.getElementById('y-buttons-conf');

    var xalltxt=document.createElement('div');
    xalltxt.className = 'panel-block';
    xalltxt.innerHTML = this.tl('%text.plotgw.options.allsrc%');
    var xconftxt=document.createElement('div');
    xconftxt.className = 'panel-block';
    xconftxt.innerHTML = this.tl('%text.plotgw.options.conf-only%');

    var yalltxt=document.createElement('div');
    yalltxt.className = 'panel-block';
    yalltxt.innerHTML = this.tl('%text.plotgw.options.allsrc%');
    var yconftxt=document.createElement('div');
    yconftxt.className = 'panel-block';
    yconftxt.innerHTML = this.tl('%text.plotgw.options.conf-only%');

    divxall.appendChild(xalltxt);
    divxconf.appendChild(xconftxt);
    divyall.appendChild(yalltxt);
    divyconf.appendChild(yconftxt);

    for (col in gw.columns){
        if (gw.columns[col].avail){
            var newoptdivx = document.createElement('div');
            newoptdivx.setAttribute("id","button-divx-"+col);
            if (gw.columns[col].cand){
                newoptdivx.className = 'option option-x allsrc';
                divxall.appendChild(newoptdivx);
            }else{
                newoptdivx.className = 'option option-x conf-only';
                divxconf.appendChild(newoptdivx);
            }

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
                if (gw.columns[newXvar]['forcelog']){
                    document.getElementById("xlog").setAttribute('disabled',true);
                    document.getElementById("xlog-lab").classList.add("disabled");
                }else{
                    document.getElementById("xlog").removeAttribute('disabled');
                    document.getElementById("xlog-lab").classList.remove("disabled");
                }
                if (gw.columns[newXvar]['forcezero']){
                    document.getElementById("xzero").setAttribute('disabled',true);
                    document.getElementById("xzero-lab").classList.add("disabled");
                }else{
                    document.getElementById("xzero").removeAttribute('disabled')
                    document.getElementById("xzero-lab").classList.remove("disabled");
                }
                this.classList.add("down");
                if (!gw.columns[newXvar]["cand"]){
                    // need to add in confirmed events to be able to display anything
                    d3.select("#filt-conf").property("checked",true);
                }
                gw.updateFilters();
                gw.updateBothAxes(newXvar,gw.yvar);
            });
            newoptinputx.onmouseover = function(e){
                gw.showTooltip(e,this.id.split('buttonx-')[1],type="column");};
            newoptinputx.onmouseout = function(){gw.hideTooltip();};
            newoptdivx.appendChild(newoptinputx);

            var newoptdivy = document.createElement('div');
            if (gw.columns[col].cand){
                newoptdivy.className = 'option option-y allsrc';
                divyall.appendChild(newoptdivy);
            }else{
                newoptdivy.className = 'option option-y conf-only';
                divyconf.appendChild(newoptdivy);
            }
            newoptdivy.setAttribute("id","button-divy-"+col);
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
                if (gw.columns[newYvar]['forcelog']){
                    document.getElementById("ylog").setAttribute('disabled',true);
                    document.getElementById("ylog-lab").classList.add("disabled");
                }else{
                    document.getElementById("ylog").removeAttribute('disabled');
                    document.getElementById("ylog-lab").classList.remove("disabled");
                }
                if (gw.columns[newYvar]['forcezero']){
                    document.getElementById("yzero").setAttribute('disabled',true);
                    document.getElementById("yzero-lab").classList.add("disabled");
                }else{
                    document.getElementById("yzero").removeAttribute('disabled');
                    document.getElementById("yzero-lab").classList.remove("disabled");
                }
                this.classList.add("down");
                if (!gw.columns[newYvar]["cand"]){
                    // need to add in confirmed events to be able to display anything
                    d3.select("#filt-conf").property("checked",true);
                }
                gw.updateFilters();
                gw.updateBothAxes(gw.xvar,newYvar);
            });
            newoptinputy.onmouseover = function(e){
                // console.log(this.id.split('buttony-')[1])
                gw.showTooltip(e,this.id.split('buttony-')[1],type="column");};
            newoptinputy.onmouseout = function(){gw.hideTooltip();};
            newoptdivy.appendChild(newoptinputy);
        }
    }

    // add Display buttons
    var divdisp= document.getElementById('display-options');
    divdisp.innerHTML+='<span id="options-colour">'+this.tl('%text.plotgw.colour%')+'</span>';
    var colList=document.createElement('select');
    colList.name = 'colSelect';
    colList.id = 'colSelect';
    for (c in this.colourList){
        colOpt=document.createElement('option');
        colOpt.value=c;
        colOpt.id="colour-"+c;
        colOpt.innerHTML=this.tl(this.colourList[c].label);
        colList.appendChild(colOpt);
    }
    colList.onchange = function(){
        console.log(this,this.value)
        gw.setColour(this.value)
    }

    divdisp.appendChild(colList);

    // d3.select("#display-options").append('div')
    //     // .style('display','none')
    //     .html('<input type="checkbox" name="filterr" id="axiszero"'+(gw.axiszero ? ' checked="checked"':'')+'></input><label for="axiszero">'+this.tl('%text.plotgw.axiszero%')+'</label>')
    //     .on("change",function(){
    //         gw.axiszero=d3.select('#axiszero')[0][0].checked;
    //         gw.updateBothAxes(gw.xvar,gw.yvar);
    //     });
    d3.select("#options-x").append('div')
        // .style('display','none')
        .attr("class","panel-block")
        .html('<input type="checkbox" name="xzero" id="xzero"'+(gw.xzero ? ' checked="checked"':'')+'></input><label id="xzero-lab" for="xzero">'+this.tl('%text.plotgw.axiszero%')+'</label>')
        .on("change",function(){
            gw.xzero=d3.select('#xzero')[0][0].checked;
            gw.updateBothAxes(gw.xvar,gw.yvar);
        });
    d3.select("#options-x").append('div')
        // .style('display','none')
        .attr("class","panel-block")
        .html('<input type="checkbox" name="xlog" id="xlog"'+(gw.xlog ? ' checked="checked"':'')+'></input><label id="xlog-lab" for="xlog">'+this.tl('%text.plotgw.log-axis%')+'</label>')
        .on("change",function(){
            gw.xlog=d3.select('#xlog')[0][0].checked;
            gw.updateBothAxes(gw.xvar,gw.yvar);
        });
    d3.select("#options-y").append('div')
        // .style('display','none')
        .attr("class","panel-block")
        .html('<input type="checkbox" name="yzero" id="yzero"'+(gw.xzero ? ' checked="checked"':'')+'></input><label id="yzero-lab" for="yzero">'+this.tl('%text.plotgw.axiszero%')+'</label>')
        .on("change",function(){
            gw.yzero=d3.select('#yzero')[0][0].checked;
            gw.updateBothAxes(gw.xvar,gw.yvar);
        });
    d3.select("#options-y").append('div')
        // .style('display','none')
        .attr("class","panel-block")
        .html('<input type="checkbox" name="ylog" id="ylog"'+(gw.ylog ? ' checked="checked"':'')+'></input><label id="ylog-lab" for="ylog">'+this.tl('%text.plotgw.log-axis%')+'</label>')
        .on("change",function(){
            gw.ylog=d3.select('#ylog')[0][0].checked;
            gw.updateBothAxes(gw.xvar,gw.yvar);
        });
    // d3.select("#preset-options").append('div')
    //     .attr("class","panel-cont")
    //     .html('<input type="checkbox" name="limOpt" id="limOpt"'+(gw.limOpt ? ' checked="checked"':'')+'></input><label id="limOpt-lab" for="limOpt">'+this.tl('%text.plotgw.limit-options%')+'</label>')
    //     .on("change",function(){
    //         gw.limOpt=d3.select('#limOpt')[0][0].checked;
    //         gw.limitOptions();
    //     });
    // d3.select("#preset-options").append('div')
    //     .attr("class","panel-cont-text")
    //     .html(this.tl("%text.plotgw.options.warn%"))
    d3.select("#buttonpre-conf").on("click",function(){
        d3.select("#buttonx-"+gw.presets["conf-only"]["x-axis"])[0][0].click();
        d3.select("#buttony-"+gw.presets["cand-only"]["y-axis"])[0][0].click();
        // change filters
        d3.select("#filt-cand").property("checked",false);
        d3.select("#filt-conf").property("checked",true);
        gw.updateFilters();
        // d3.select("#limOpt").property("checked",false);
        // gw.limitOptions();
    }).on("mouseover",function(){
        gw.showTooltipManual(gw.presets["conf-only"]["tooltip"]);
    }).on("mouseout",function(){
        gw.hideTooltipManual();
    });
    d3.select("#buttonpre-cand").on("click",function(){
        d3.select("#buttonx-"+gw.presets["cand-only"]["x-axis"])[0][0].click();
        d3.select("#buttony-"+gw.presets["cand-only"]["y-axis"])[0][0].click();
        d3.select("#filt-cand").property("checked",true);
        d3.select("#filt-conf").property("checked",false);
        gw.updateFilters();
        // d3.select("#limOpt").property("checked",true);
        // gw.limitOptions();
    }).on("mouseover",function(){
        gw.showTooltipManual("%tooltip.plotgw.preset-cand%");
    }).on("mouseout",function(){
        gw.hideTooltipManual();
    });
    d3.select("#buttonpre-all").on("click",function(){
        d3.select("#buttonx-"+gw.presets["allsrc"]["x-axis"])[0][0].click();
        d3.select("#buttony-"+gw.presets["allsrc"]["y-axis"])[0][0].click();
        // change filters
        d3.select("#filt-cand").property("checked",true);
        d3.select("#filt-conf").property("checked",true);
        gw.updateFilters();
        // d3.select("#limOpt").property("checked",false);
        // gw.limitOptions();
    }).on("mouseover",function(){
        gw.showTooltipManual(gw.presets["allsrc"]["tooltip"]);
    }).on("mouseout",function(){
        gw.hideTooltipManual();
    });
    d3.select("#preset-filter-link").on("click",function(){
        d3.select("#filter-icon > img")[0][0].click()
    }).on("mouseover",function(){
        gw.showTooltipManual("%tooltip.plotgw.goto-filter%");
    }).on("mouseout",function(){
        gw.hideTooltipManual();
    });

}
GWCatalogue.prototype.limitOptions = function(){
    this.limOpt=d3.select('#limOpt')[0][0].checked
    if (this.limOpt){
        d3.selectAll('.option-x.conf-only,.option-y.conf-only')
            .style('display','none');
    }else{
        d3.selectAll('.option-x.conf-only,.option-y.conf-only')
            .style('display','inline-block');
    }
    return;
}

GWCatalogue.prototype.showInfo = function(){
    //show options
    if (this.helpOn){this.hideHelp();}
    if (this.langOn){this.hideLang();}
    if (this.filterOn){this.hideFilter();}
    if (this.optionsOn){this.hideOptions();}
}
GWCatalogue.prototype.showOptions = function(){
    //show options
    if (this.helpOn){this.hideHelp()}
    if (this.langOn){this.hideLang()}
    if (this.filterOn){this.hideFilter();}
    this.optionsOn=true;

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
        document.getElementById('display-options').classList.add('bottom')
    }else{
        document.getElementById('options-x').classList.remove('bottom')
        document.getElementById('options-y').classList.remove('bottom')
        document.getElementById('display-options').classList.remove('bottom')
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

    document.getElementById("options-icon").classList.add("hidden");
    document.getElementById("info-icon").classList.remove("hidden");
    if (this.debug){console.log(this.getPanel())}
    this.updateUrl();
}
GWCatalogue.prototype.addHelp = function(){
    // add help to panel
    d3.select("#help-title")
        .html(this.tl("%text.plotgw.help.title%"))
    d3.select("#help-text")
        .html(this.tl("%text.plotgw.help.text%%text.plotgw.help.about%%text.plotgw.help.tech%"));
    // d3.select("#help-tech")
    //     .html(this.tl("%text.plotgw.help.about%%text.plotgw.help.tech%"));
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
    d3.select("#help-filter-text")
        .html(this.tl("%text.plotgw.help.filter%"));
    d3.select("#help-search-text")
        .html(this.tl("%text.plotgw.help.search%"));
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
    if (this.filterOn){this.hideFilter();}
    this.helpOn=true;

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
        langdiv.className = 'panel-cont lang-cont colourise';
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
                gw.updateUrl();
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
    if (this.filterOn){this.hideFilter();}
    this.langOn=true;

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

    document.getElementById("info-icon").classList.remove("hidden");
    document.getElementById("lang-icon").classList.add("hidden");
    this.updateUrl();
}
GWCatalogue.prototype.addFilter = function(replot){
    // add filters to panel
    var gw=this;

    function getRange(key){
		var a = gw.filters[key];
		var range = {};
		var values = [0,0];
		var dates;
		if(typeof a.min['default']==="number") range.min = a.min['default'];
		else{
			if(a.format=='date'){
				if(!dates) dates = getDateRange();
				range.min = (dates[0]).getTime();
			}
		}
		if(typeof a.max['default']==="number") range.max = a.max['default'];
		else{
			if(a.format=='date'){
				if(!dates) dates = getDateRange();
				range.max = (dates[1]).getTime();
			}
		}
		// Set the starting values to either a specified value or the range default
		values[0] = (typeof a.min.value==="number" ? a.min.value : range.min);
		values[1] = (typeof a.max.value==="number" ? a.max.value : range.max);
		return {'range':range,'values':values };
	}

    function buildSlider(attr){
		if(!attr) return {};
		if(!attr.values) return {};
		if(attr.el.length != 1) return {};
        this.values = attr.values;
		this.range = attr.range;
		this.step = (attr.step||1);
		this.connect = (this.values.length==2) ? true : false;
		this.el = attr.el;

		var inputs = { 'start': this.values, 'step': this.step, 'range': this.range, 'connect': this.connect };
		this.slider = noUiSlider.create(this.el.select('.slider')[0][0], inputs);

		var _slider = this;
		this.slider.on('update', function(values, handle) {
			var value = values[handle];
			var change = false;
			if(_slider.values[handle] != parseFloat(value)) change = true;
			_slider.values[handle] = parseFloat(value);
			var min = _slider.values[0];
			var max = _slider.values[1];
			if(attr.format && attr.format=='date'){
				min = (new Date(min)).toISOString().substr(0,10);
				max = (new Date(max)).toISOString().substr(0,10);
			}
			if(_slider.el.select('.min').length > 0) _slider.el.select('.min').html(min);
			if(_slider.el.select('.max').length > 0) _slider.el.select('.max').html(max);
		});
		this.slider.on('set',function(){
            gw.updateFilters();
		});
		return this;
	}

    d3.select("#filter-title")
        .html(this.tl("%text.plotgw.filter.title%"));
    d3.select("#filter-text")
        .html(this.tl("%text.plotgw.filter.text%"));
    d3.select("#filter-options")
        .html('<input type="checkbox" name="filterr" id="filterr"'+(gw.filterr ? ' checked="checked"':'')+'></input><label for="filterr">'+this.tl('%text.plotgw.filter.error%')+'</label>')
        .on("change",function(){
            gw.filterr=d3.select('#filterr')[0][0].checked;
            gw.updateFilters();
        });
    if (this.portrait){
        d3.select('#filter-title')
            .style("font-size",(5.0*this.xsc)+"em")
    }else{
        d3.select('#filter-title')
            .style("font-size",(2.5*this.ysc)+"em")
    }
    if (replot){
        d3.selectAll('.filter-cont').remove()
    }
    for (filt in this.filters){
        a=this.filters[filt]
        filtdiv = document.createElement('div');
        filtdiv.className = 'filter-cont colourise';
        // filtdiv.style.height = gw.filtcontHeight;
        filtdiv.setAttribute("id",'filt_'+filt+'_cont');
        filticondiv = document.createElement('div');
        filticondiv.className='filt-cont-label'
        filticondiv.setAttribute("id",'filt_'+filt+'_label');
        filticondiv.innerHTML = '<img src="'+gw.getIcon(filt)+'"></img><span class="filter-text">'+this.tl(a.name)+'</>';
        filtdiv.appendChild(filticondiv);
        filttxtdiv = document.createElement('div');
        filttxtdiv.className = 'filt-cont';
        filttxtdiv.setAttribute("id",'filt-'+filt+'-filt');
        filttxtdiv.style["font-size"] = (1.3*gw.sksc)+"em";
        if (a.type=="slider"){
            filttxtdiv.innerHTML += '<div class="slider"></div><span class="min">'+a.min['default']+'</span> &rarr; <span class="max"></span>'+(a.max.unit ? '<span lang="'+a.max.unit+'">'+this.tl(a.max.unit)+'</span>':'');
        }else if (a.type=="checkbox"){
            for (var i = 0; i < a.options.length; i++){
                filttxtdiv.innerHTML += '<input type="checkbox" name="'+a.options[i].id+'" id="'+a.options[i].id+'"'+(a.options[i].checked ? ' checked="checked"':'')+'></input><label for="'+a.options[i].id+'">'+this.tl(a.options[i].label)+'</label>'
            }
        }
        filtdiv.appendChild(filttxtdiv);
        if (a.note){
            filtnote = document.createElement('div');
            filtnote.className = "filter-note colourise";
            filtnote.innerHTML = this.tl(a.note);
            filtdiv.appendChild(filtnote)
        }

        document.getElementById('filter-block').appendChild(filtdiv);
        if (a.type=="slider"){
            filtdata=getRange(filt)
            filtdata.step = (a.step||1);
    		filtdata.format = (a.format||"");
            filtdata.el=d3.select('#filt-'+filt+'-filt');
            a.slider = new buildSlider(filtdata)
        }
    }
    document.getElementById("filter-block").addEventListener("change",function(){
        gw.updateFilters();
    })
    gw.updateFilters();
}
GWCatalogue.prototype.updateFilters = function () {
    var gw = this;
    selEvStatus=((this.d)&&(this.d.active)) ? this.d.active : false;
    selEvNewStatus=false;
    for(filt in this.filters){
        if(gw.debug){console.log('updating filter: ',filt);}
		if(this.filters[filt].type == "slider"){
			if(!this.filters[filt].slider){
				this.filters[filt].slider = {}
			}
		}else if(this.filters[filt].type == "checkbox"){
			for(var i = 0; i < this.filters[filt].options.length; i++){
				if(d3.select('#'+this.filters[filt].options[i].id)[0].length > 0){
					this.filters[filt].options[i].checked = d3.select('#'+this.filters[filt].options[i].id)[0][0].checked
				}
			}
		}
	}

    function inRange(i,key,range){
		if(!gw.cat.data[i][key]) return true;
        if (gw.filterr){
            if (gw.cat.data[i][key].errv){
                errv=gw.cat.data[i][key].errv
                var valrange = [Math.min(errv[0],errv[1]),
                    Math.max(errv[0],errv[1])
                ]
            }else{
                var valrange = [gw.cat.getMinVal(gw.cat.dataOrder[i],key),gw.cat.getMaxVal(gw.cat.dataOrder[i],key)];
            }
        }else{
            var valrange = [gw.cat.getBest(gw.cat.dataOrder[i],key),gw.cat.getBest(gw.cat.dataOrder[i],key)];
        }
		if(gw.filters[key].format=="date"){
			valrange[0] = (new Date(valrange[0])).getTime();
			valrange[1] = (new Date(valrange[1])).getTime();
		}
		if((valrange[0] >= range[0] && valrange[0] <= range[1]) || valrange[1] >= range[0] && valrange[1] <= range[1]) return true;
		return false;
	}
    function isChecked(i,key){
		if(!gw.cat.data[i][key]) return true;
        if(gw.cat.data[i][key]['best']){
            var best = gw.cat.getBest(gw.cat.dataOrder[i],key);
        }else{
            var best = gw.cat.dataOrder[i][key];
        }

        // console.log('filter',i,key,best);
		var good = 0;
		for(var o = 0; o < gw.filters[key].options.length; o++){
			if(gw.filters[key].options[o].checked){
				if(gw.filters[key].options[o].contains){
					// The string contains this option
					if(best.indexOf(gw.filters[key].options[o].value) >= 0) good++;
				}else{
					if(best == gw.filters[key].options[o].value) return true;
				}
			}
		}
		if(good == 0) return false;
		return true;
	}

    var active;
	// Loop over each event
	for(var i = 0; i < this.cat.data.length; i++){
		active = true;
		for(key in this.filters){
			a = this.filters[key];
			// console.log(key,a.type)
			if(a.type == "slider"){
				// Process each slider
				//console.log(key,inRange(i,key,this.filters[key].slider.values))
				if(!inRange(i,key,a.slider.values)) active = false;
				//if(!active) console.log(i,key)
			}else if(a.type == "checkbox"){
				if(!isChecked(i,key)) active = false;
			}
		}
        if (!(this.xvar in this.cat.data[i])&&!(this.yvar in this.cat.data[i])){
            active=false;
        }
		this.cat.data[i].active = active;
        if (this.cat.data[i].name==this.selectedevent){selEvNewStatus=active}
	}
    this.updateBothAxes(this.xvar,this.yvar);
    // update sketch if d now longer active
    if (selEvStatus!=selEvNewStatus){
        this.updateSketch(this.d);
        this.moveHighlight();
    }
    this.updateErrors();
    // repopulate search list
    this.populateSearchList();

	return this;
};
GWCatalogue.prototype.showFilter = function(){
    //show options
    if (this.optionsOn){this.hideOptions();}
    if (this.helpOn){this.hideHelp();}
    if (this.langOn){this.hideLang();}
    this.filterOn=true;
    //fade in infopanel
    this.filterouter = d3.select('#filter-outer')
    this.filterouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    this.filterouter.style("left", document.getElementById('infoouter').offsetLeft-1)
        .style("top", document.getElementById('infoouter').offsetTop-1)
        .style("width",document.getElementById('infoouter').offsetWidth-2)
        .style("height",document.getElementById('infoouter').offsetHeight-22);
    if (this.portrait){
        document.getElementById('filter-block').classList.add('bottom')
    }else{
        document.getElementById('filter-block').classList.remove('bottom')
    }
    document.getElementById("filter-icon").classList.remove("hidden");
    document.getElementById("info-icon").classList.add("hidden");
    this.updateUrl();
}
GWCatalogue.prototype.hideFilter = function(d) {
    // hide options box
    this.filterOn=false;
    // fade out infopanel
    this.filterouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.filterouter.style("top","200%");
    document.getElementById("info-icon").classList.remove("hidden");
    document.getElementById("filter-icon").classList.add("hidden");
    this.updateUrl();
}
GWCatalogue.prototype.showShare = function(){
    //show share box
    var gw=this;
    d3.select("#share-bg").style("height","100%").style("display","block");
    shareouter=d3.select('#share-outer')
    shareouter.transition()
       .duration(500)
       .style("opacity",1)
       .style("max-height",document.getElementById('svg-container').offsetHeight);;
    shareouter.style("top",
            document.getElementById('graphcontainer').offsetTop+
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
}
GWCatalogue.prototype.hideShare = function(){
    //hide search box
    d3.select('#share-bg').style("height",0).style("display","none");
    d3.select('#share-outer').transition()
       .duration(500)
       .style("opacity",0)
       .style("max-height",0);

}
GWCatalogue.prototype.showSearch = function(){
    //show search box
    var gw=this;
    d3.select("#search-bg").style("height","100%").style("display","block");
    searchouter=d3.select('#search-outer')
    searchouter.transition()
       .duration(500)
       .style("opacity",1)
       .style("max-height",gw.graphHeight);
    searchouter.style("top",
            document.getElementById('graphcontainer').offsetTop+
            document.getElementById('search-icon').offsetTop +
            document.getElementById('search-icon').offsetHeight + 10)
        .style("left",
            document.getElementById('search-icon').offsetLeft +
            document.getElementById('search-icon').offsetWidth/2 -
            document.getElementById('search-outer').offsetWidth/2)
}
GWCatalogue.prototype.hideSearch = function(){
    //hide share box
    d3.select("#search-bg").style("height","0").style("display","none");
    d3.select('#search-outer').transition()
       .duration(500)
       .style("opacity",0)
       .style("max-height",0);
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

GWCatalogue.prototype.writeDownloadLink = function(){
    //write download link
    try {
        var isFileSaverSupported = !!new Blob();
    } catch (e) {
        alert("SVG export not supported. Sorry!");
    }

    var html = d3.select("svg.graph")
        .attr("title", "test2")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    var blob = new Blob([html], {type: "image/svg+xml"});
    saveAs(blob, "Catalogue.svg");
};
GWCatalogue.prototype.makePlot = function(){
    // make plot (calls other function)
    this.setLang();
    this.drawGraph();
    this.updateBothAxes(this.xvar,this.yvar);
    this.drawSketch();
    // this.addButtons();
    this.addOptions();
    // this.addFilters();
    this.addHelp();
    this.addLang(false);
    this.addFilter();
    panel = (this.urlVars.panel) ? this.urlVars.panel : this.getPanel();
    this.adjCss();
    this.selectEvent(this.selectedevent,redraw=true,init=true);
    d3.select('#copy-button').attr('data-clipboard-text',newUrl);
}
GWCatalogue.prototype.replot = function(){
    // remove plots and redraw (e.g. on window resize)
    var gw=this;
    // console.log(gw.sketchName);
    // remove elements
    d3.select("svg#svgSketch").remove()
    d3.select("div#svg-container").remove()
    d3.selectAll(".graph-icon").remove()
    d3.selectAll(".axis-icon").remove()
    d3.selectAll(".search-list-item").remove()
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
    panel = this.getPanel();
    this.setPanel(panel);
    this.cat.data.forEach(function(d){
        // gwcat.formatData;
        if (d.name==gw.selectedevent){
            // console.log('resize:',d.name,gw.sketchName);
            gw.updateSketch(d);
        }
    });
    gwcat.redraw=false;
    // gwcat.initButtons();
}
GWCatalogue.prototype.makeCanvas = function(){
    var canvas = document.createElement('canvas');
    canvas.setAttribute("id",'myCanvas');
    canvas.setAttribute("width",this.svgWidth);
    canvas.setAttribute("height",this.svgHeight);
    document.getElementById('graphcontainer').appendChild(canvas);
    var ctx=canvas.getContext("2d");
    ctx.fillStyle = this.colourList[gw.colScheme]['bg'];
    ctx.fillRect(0,0,this.svgWidth,this.svgHeight);
    [els,xy]=this.getSvgElements();
    var em2px=16;
    getem=/\s*([^\s,)]+)em/;
    getpx=/\s*([^\s,)]+)px/;
    function component2hex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    function rgb2hex(r, g, b) {
        return "#" + component2hex(r) + component2hex(g) + component2hex(b);
    }
    var getrgb  = /rgb\s*\(\s*([^\s,)]+)[ ,]+([^\s,)]+)[ ,]+([^\s,)]+)/;
    for (e in els){
        var el=els[e]['node'];
        tl0=els[e].translate
        var translate  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(el.getAttribute('transform'));
        var rotate  = /rotate\(\s*([^\s,)]+)/.exec(el.getAttribute('transform'));
        var params={};
        params.fillcolor = window.getComputedStyle(el).getPropertyValue('fill');
        params.linecolor = window.getComputedStyle(el).getPropertyValue('stroke');
        params.color = window.getComputedStyle(el).getPropertyValue('color');
        params.linewidth = parseFloat(window.getComputedStyle(el).getPropertyValue('stroke-width'));
        params.opacity = parseFloat(window.getComputedStyle(el).getPropertyValue('opacity'));
        // console.log('fill',fc,fcrgb,params.fillcolor);
        // console.log('stroke',lc,lcrgb,params.linecolor);
        // console.log('color',color,colrgb,params.color);
        if (el.tagName=="circle"){
            console.log('circle');
            params.cx=parseFloat(el.getAttribute('cx'))+tl0[0];
            params.cy=parseFloat(el.getAttribute('cy'))+tl0[1];
            params.r=parseFloat(el.getAttribute('r'));
            if(translate){
                params.cx+=parseFloat(translate[1]);
                params.cy+=parseFloat(translate[2]);
            }
            ctx.beginPath();
            ctx.fillStyle = params.fillcolor;
            ctx.strokeStyle = params.linecolor;
            ctx.globalAlpha = params.opacity;
            ctx.lineWidth = params.linewidth;
            ctx.arc(params.cx,params.cy,params.r,0,2*Math.PI);
            ctx.stroke();
            ctx.fill();
        }else if(el.tagName=="line"){
            console.log("line",el.classList);
            params.x1=(el.getAttribute('x1')) ? parseFloat(el.getAttribute('x1'))+tl0[0] : tl0[0];
            params.x2=(el.getAttribute('x2')) ? parseFloat(el.getAttribute('x2'))+tl0[0] : tl0[0];
            params.y1=(el.getAttribute('y1')) ? parseFloat(el.getAttribute('y1'))+tl0[1] : tl0[1];
            params.y2=(el.getAttribute('y2')) ? parseFloat(el.getAttribute('y2'))+tl0[1] : tl0[1];
            if(translate){
                params.x1+=parseFloat(translate[1]);
                params.y1+=parseFloat(translate[2]);
                params.x2+=parseFloat(translate[1]);
                params.y2+=parseFloat(translate[2]);
            }
            ctx.beginPath();
            ctx.moveTo(params.x1,params.y1);
            ctx.lineTo(params.x2,params.y2);
            ctx.strokeStyle = params.linecolor;
            ctx.lineWidth = params.linewidth;
            ctx.globalAlpha = params.opacity;
            ctx.stroke();
        }else if(el.tagName=="path"){
            getpath=/M([^\s,)]+)[ ,]+([^\s,)]+)(([HV])([\d.]+)([HV])([\d.]+))/;
            params.d=el.getAttribute('d');
            if(translate){
                x1+=parseFloat(translate[1]);
                y1+=parseFloat(translate[2]);
                x2+=parseFloat(translate[1]);
                y2+=parseFloat(translate[2]);
            }
            ctx.save()
            ctx.translate(tl0[0],tl0[1])
            ctx.fillStyle = params.fillcolor;
            ctx.strokeStyle = params.linecolor;
            ctx.globalAlpha = params.opacity;
            ctx.lineWidth = params.linewidth;
            var path = new Path2D(params.d);
            ctx.stroke(path);
            ctx.restore();
        }else if (el.tagName=="text"){
            params.fontsize=parseFloat(window.getComputedStyle(el).getPropertyValue('font-size'));
            // params.txt=el.innerHTML;
            params.x=(el.getAttribute('x')) ? el.getAttribute('x') : 0;
            params.y=(el.getAttribute('y')) ? el.getAttribute('y') : 0;
            params.dx=(el.getAttribute('dx')) ? el.getAttribute('dx') : 0;
            params.dy=(el.getAttribute('dy')) ? el.getAttribute('dy') : 0;
            params.tl0_0=tl0[0];
            params.tl0_1=tl0[1];
            paramconv=['x','y','dx','dy'];
            for (i in paramconv){
                p=paramconv[i];
                if (getem.exec(params[p])){
                    params[p]=parseFloat(params[p])*em2px*params.fontsize/em2px;
                }else{
                    params[p]=parseFloat(params[p]);
                }
            }
            var txtalign=(el.style.getPropertyValue('text-anchor')) ? el.style.getPropertyValue('text-anchor') : null;
            params.txtalign = (txtalign=="middle") ? "center" : txtalign;
            if(translate){
                params.x+=parseFloat(translate[1]);
                params.y+=parseFloat(translate[2]);
            }
            var txt=el.innerHTML;
            ctx.save();
            ctx.translate(params.tl0_0,params.tl0_1);
            if (rotate){
                ctx.rotate(rotate[1] * Math.PI/180);
            }
            ctx.translate(params.x+params.dx,params.y+params.dy);
            ctx.textAlign = params.txtalign;
            ctx.font = params.fontsize+"px Arial";
            ctx.fillStyle = params.fillcolor;
            // ctx.fillStyle = "black";
            ctx.globalAlpha = params.opacity;
            ctx.fillText(txt,0,0);
            ctx.restore();
            // console.log(txt,params.x,params.y,rotate,params.dy,params.txtalign,params.fontsize);
            console.log(txt);
        }
        console.log(params);
    }
}
GWCatalogue.prototype.getSvgElements = function(){
    getChildNodes = function(node,els,refxy){
        var childNodes=node.childNodes;
        var translate  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(node.getAttribute('transform'));
        if (translate){
            refxy[0]+=parseFloat(translate[1]);
            refxy[1]+=parseFloat(translate[2]);
            console.log('translating to',translate,refxy)
        }
        // console.log('els',els,'nodes',childNodes);
        // console.log(node,node.childElementCount,node.childNodes);
        if (node.childElementCount==0){
            console.log('skipping empty:',n,node);
            if (translate){
                console.log('translating back to',translate)
                refxy[0]-=parseFloat(translate[1]);
                refxy[1]-=parseFloat(translate[2]);
            }
            return([els,refxy]);
        }else{
            for (n in childNodes){
                node=childNodes[n];
                // console.log(n,node,node.tagName);
                if (node.tagName=="g"){
                    console.log('entering:',n,node,refxy);
                    [els,refxy]=getChildNodes(node,els,refxy);
                }else if((node.tagName=="line")||(node.tagName=="text")||(node.tagName=="circle")||(node.tagName=="path")){
                    if((node.style.opacity=="0")||(node.getAttribute("opacity")=="0")){
                        console.log('skipping opacity 0:',n,node);
                    }else{
                        console.log('appending:',n,node);
                        els.push({"node":node,"translate":[refxy[0],refxy[1]]});
                    }
                }
            }
        }
        console.log('exiting node')
        if (translate){
            console.log('translating back to',translate)
            refxy[0]-=parseFloat(translate[1]);
            refxy[1]-=parseFloat(translate[2]);
        }
        return([els,refxy]);
    }
    var els = [];
    var xy=[0,0];
    svgNodes = this.svg.node();
    console.log(svgNodes);
    [els,xy]=getChildNodes(svgNodes,els,xy);
    return([els,xy]);
}
GWCatalogue.prototype.removeCanvas = function(){
    canvas = document.getElementById("myCanvas");
    document.getElementById("graphcontainer").removeChild(canvas);
}
GWCatalogue.prototype.saveCanvas = function(){
    //write download link
    try {
        var isFileSaverSupported = !!new Blob();
    } catch (e) {
        alert("blob not supported");
    }

    var canvasdl = document.getElementById('myCanvas');
    canvasdl.toBlob(function(blob) {
        saveAs(blob, "LIGO-Virgo_catalogue_"+gw.xvar+"_"+gw.yvar+".png");
    });
}