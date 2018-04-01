
/**
 * Copyright (c) 2017 Chris North
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
    this.getUrlVars();
    this.date = new Date();
    if ((this.date.getMonth()==3)&&(this.date.getDate()==1)){this.doAprilFool=true;this.afterApril=false}
    else{this.doAprilFool=false;this.afterApril=true;}
    if (this.urlVars["ha"]=="true"){this.doAprilFool=true;}
    if (this.urlVars["ha"]=="false"){this.doAprilFool=false;}

    this.holderid = (inp)&&(inp.holderid) ? inp.holderid : "plotgw-cont";
    if(this.debug){console.log('creating plot in #'+this.holderid)}
    if ((inp)&&(inp.clearhtml)){
        if(this.debug){console.log('clearing current html from '+gw.holderid)}
        d3.select('#'+gw.holderid).html('')
    }

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

GWCatalogue.prototype.aprilFool = function(){
    this.addApril();
    this.showApril();
    if (this.afterApril){
        this.showAprilPopup();
    }
    if ((this.showerrors)){this.toggleErrors();}
}
GWCatalogue.prototype.addApril = function(){
    var gw=this;
    if (d3.select("#april-outer").empty()){
        if(this.debug){console.log('adding april-outer')}
        d3.select('#'+this.holderid).insert("div","#options-outer + *")
            .attr("id","april-outer").attr("class","panel-outer")
        d3.select("#april-outer").append("div")
            .attr("id","april-title").attr("class","panel-title")
        d3.select("#april-outer").append("div")
            .attr("id","april-block-text").attr("class","panel-block")
        d3.select("#april-outer").append("div")
            .attr("id","april-block-after").attr("class","panel-block")
        d3.select("#april-outer").append("div")
            .attr("id","april-close").attr("class","panel-close")
        d3.select("#april-outer").append("div")
            .attr("id","april-block-text").attr("class","panel-text")
            .html('<div class="panel-text" id="help-text"></div>')
        gwcat.switchZ=function(){
            oldXvar = gw.xvar;
            newXvar = "Mfinal";
            document.getElementById("button-divx-"+oldXvar).classList.remove("down");
            document.getElementById("button-divx-"+newXvar).classList.add("down");
            oldYvar = gw.yvar;
            newYvar = "z";
            document.getElementById("button-divy-"+oldYvar).classList.remove("down");
            document.getElementById("button-divy-"+newYvar).classList.add("down");
            // gw.updateYaxis(newYvar);
            gw.updateBothaxes(newXvar,newYvar);
        }
        gwcat.switchM=function(){
            oldXvar = gw.xvar;
            newXvar = "M1";
            document.getElementById("button-divx-"+oldXvar).classList.remove("down");
            document.getElementById("button-divx-"+newXvar).classList.add("down");
            oldYvar = gw.yvar;
            newYvar = "M2";
            document.getElementById("button-divy-"+oldYvar).classList.remove("down");
            document.getElementById("button-divy-"+newYvar).classList.add("down");
            // gw.updateYaxis(newYvar);
            gw.updateBothaxes(newXvar,newYvar);
        }
        gwcat.resetApril=function(){
            url=gw.makeUrl({'ha':"false",'err':true});
            window.location.href=url;
        }
    }
    // add april icon to panel
    d3.select("#april-title")
        .html("1 April 2018 Update")
    d3.select("#april-block-text")
            .html("<p>Following the full analysis of the LIGO data, and with a commitment to open data, it is only fair that the full collection of detections are released to the public. The data are published here as of 1 April 2018.</p><p>To fully appreciate the significance of this data release, it is suggested that you look at the detections in <a id='zswitch' href='#' onclick='gwcat.switchZ();return false;'>redshift space</a>, as well as in <a id='mswitch' href='#' onclick='gwcat.switchM();return false;'>mass space</a>.</p><p>The justification for this data release, which is not endorsed by the LIGO Scientific Collaboration or the Virgo Collaboration, is available <a href='https://en.wikipedia.org/wiki/April_Fools%27_Day'>here</a>.</p><p>You can also return to the <a id='zswitch' href='#' onclick='gwcat.resetApril();return false;'>official data release</a>.</p>");
    if (this.afterApril){
        d3.select("#april-block-after")
            .html("You are reading this after 1 April 2018. This is an archived page. <a id='zswitch' href='#' onclick='gwcat.resetApril();return false;'>Revert to normal.</a>").style("color","red")
    }
    if (d3.select('#april-popup-bg').empty()){
        if(this.debug){console.log('adding april-popup-bg')}
        d3.select('#'+this.holderid).insert("div","#lang-outer + *")
            .attr("id","april-popup-bg").attr("class","popup-bg")
    }
    if (d3.select('#april-popup-outer').empty()){
        if(this.debug){console.log('adding april-popup-outer')}
        d3.select('#'+this.holderid).insert("div","#april-popup-bg + *")
            .attr("id","april-popup-outer").attr("class","popup-outer")
        d3.select('#april-popup-outer').append("div")
            .attr("id","popup-block-title").attr("class","popup-title")
            .html("<p>You have followed a link to a page that was published on 1 April 2018 (<a href=https://en.wikipedia.org/wiki/April_Fools%27_Day'>April Fools' Day</a>). Continue at your own risk.</p><p>To visit the normal site <a id='zswitch' href='#' onclick='gwcat.resetApril();return false;'>click here</a>.")
        d3.select('#april-popup-outer').append("div")
            .attr("id","april-popup-close").attr("class","popup-close")
    }
    d3.select("#april-popup-bg").on("click",function(){gw.hideAprilPopup();});
    d3.select("#april-popup-close").on("click",function(){gw.hideAprilPopup();});

    this.langdict["tooltip.plotgw.april"]="April Fool!";

    d3.select("#april-close").on("click",function(){gw.hideApril();});
    // d3.select("#help-tech")
    //     .html(this.tl("%text.plotgw.help.about%%text.plotgw.help.tech%"));
    if (this.portrait){
        d3.select('.april-title')
            .style("font-size",(5.0*this.xsc)+"em")
        d3.selectAll('.april-cont-text')
            .style("font-size",(2.0*this.xsc)+"em")
        d3.selectAll('.april-text')
            .style("font-size",(2.0*this.xsc)+"em")
    }else{
        d3.select('.april-title')
            .style("font-size",(2.5*this.ysc)+"em")
        d3.selectAll('.april-cont-text')
            .style("font-size",(1.2*this.ysc)+"em")
        d3.selectAll('.april-text')
            .style("font-size",(1.2*this.ysc)+"em")
    }
}
GWCatalogue.prototype.showApril = function(){
    //show options
    if (this.optionsOn){this.hideOptions();}
    if (this.langOn){this.hideLang();}
    if (this.helpOn){this.hideHelp();}
    this.aprilOn=true;
    // fade in semi-transparent background layer (greys out image)
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style({"opacity":0.5});
    // this.helpbg.style("height","100%");
    //fade in infopanel
    this.aprilouter = d3.select('#april-outer')
    this.aprilouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    // this.infopanel.html(this.iptext(d));
    this.aprilouter.style("left", document.getElementById('infoouter').offsetLeft-1)
        .style("top", document.getElementById('infoouter').offsetTop-1)
        .style("width",document.getElementById('infoouter').offsetWidth-2)
        .style("height",document.getElementById('infoouter').offsetHeight-22);
    if (this.portrait){
        document.getElementById('april-block-text').classList.add('bottom')
    }else{
        document.getElementById('april-block-text').classList.remove('bottom')
    }
    if (!d3.select("#april-icon").empty()){document.getElementById("april-icon").classList.remove("hidden");}
    document.getElementById("info-icon").classList.add("hidden");
    this.updateUrl();
}
GWCatalogue.prototype.hideApril = function(d) {
    // hide options box
    this.aprilOn=false;
    // fade out infopanel
    this.aprilouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.aprilouter.style("top","200%");
    // fade out semi-transparent background
    // this.optionsbg.transition()
    //   .duration(500)
    //   .style("opacity",0);
    // this.helpbg.style("height",0);
    // d3.selectAll(".info").attr("opacity",0);
    //add April button
    if (d3.select("#april-icon").empty()){
        this.graphcont.append("div")
            .attr("id","april-icon")
            .attr("class","graph-icon hidden")
            .style({"right":gw.margin.right+7*(gw.margin.top+10),"top":0,"width":gw.margin.top,"height":gw.margin.top})
            .on("mouseover",function(){
                gw.showTooltipManual("%tooltip.plotgw.april%");
            })
            .on("mouseout",function(){
                gw.hideTooltipManual();
            }).append("img")
            .attr("src","img/april.svg")
            .attr("class","hidden")
            .attr("id","april-img")
            .on("click",function(){gw.showApril();gw.hideTooltipManual();});
        d3.select("#april-bg").on("click",function(){gw.hideApril();});
    }

    document.getElementById("info-icon").classList.remove("hidden");
    document.getElementById("april-icon").classList.add("hidden");
    this.updateUrl();
}

GWCatalogue.prototype.showAprilPopup = function(){
    //show share pot
    var gw=this;
    d3.select("#april-popup-bg").style("height","100%").style("display","block").style("opacity",0.9);
    aprilpopupouter=d3.select('#april-popup-outer')
    aprilpopupouter.transition()
       .duration(500)
       .style("opacity",1)
       .style("max-height",document.getElementById('svg-container').offsetHeight);;
    aprilpopupouter.style("top",
            document.getElementById('graphcontainer').offsetTop+
            document.getElementById('graphcontainer').offsetHeight*0.1)
        .style("left",
            document.getElementById('graphcontainer').offsetLeft+
            document.getElementById('graphcontainer').offsetWidth*0.1)
        .style("width",document.getElementById('graphcontainer').offsetWidth*0.8)
        .style("height",document.getElementById('graphcontainer').offsetHeight*0.8)
}
GWCatalogue.prototype.hideAprilPopup = function(){
    //show share pot
    d3.select('#april-popup-bg').style("height",0).style("display","none");
    d3.select('#april-popup-outer').transition()
       .duration(500)
       .style("opacity",0)
       .style("max-height",0);

}

GWCatalogue.prototype.init = function(){
    // created HTML of not included
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
            .html('<div id="sketchcontainer"></div><div id="labcontainer"></div><div id="select-next" class="select-event select-next"></div><div id="select-previous" class="select-event select-previous"></div>')
    }
    if (d3.select("#options-outer").empty()){
        if(this.debug){console.log('adding options-outer')}
        d3.select("#"+this.holderid).insert("div","#infoouter + *")
            .attr("id","options-outer").attr("class","panel-outer")
            .html('<div id="options-x" class="options-box"><div class="panel-title"></div><div class="options-buttons" id="x-buttons"></div></div><div id="options-y" class="options-box"><div class="panel-title">Vertical axis</div><div class="options-buttons" id="y-buttons"></div></div><div id="options-close" class="panel-close"></div></div>')
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
        d3.select("#help-block-icons").append("div")
            .attr("id","help-search-cont").attr("class","panel-cont")
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
    if (d3.select('#share-bg').empty()){
        if(this.debug){console.log('adding share-bg')}
        d3.select('#'+this.holderid).insert("div","#lang-outer + *")
            .attr("id","share-bg").attr("class","popup-bg")
    }
    if (d3.select('#share-outer').empty()){
        if(this.debug){console.log('adding share-outer')}
        d3.select('#'+this.holderid).insert("div","#share-bg + *")
            .attr("id","share-outer").attr("class","popup-outer")
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
            .attr("id","search-bg").attr("class","popup-bg")
    }
    if (d3.select('#search-outer').empty()){
        if(this.debug){console.log('adding search-outer')}
        d3.select('#'+this.holderid).insert("div","#search-bg + *")
            .attr("id","search-outer").attr("class","popup-outer")
            .html('<div id="search-close" class="popup-close"></div>')
    }
    if (d3.select('#tooltipSk').empty()){
        if(this.debug){console.log('adding tooltip')}
        d3.select('#'+this.holderid).insert("div","#search-outer + *")
            .attr("id","tooltipSk").attr("class","tooltip")
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
        showxray:false,
        selectedevent:"GW170817"
    }
    this.xvar = (this.urlVars.x) ? this.urlVars.x : this.defaults.xvar;
    this.yvar = (this.urlVars.y) ? this.urlVars.y : this.defaults.yvar;
    this.showerrors = (this.urlVars.err) ? this.urlVars.err : this.defaults.showerrors;
    this.showerrors = (this.showerrors=="false") ? false : true;
    this.showxray = (this.urlVars.xray) ? this.urlVars.xray : this.defaults.showxray;
    this.selectedevent = (this.urlVars.event) ? this.urlVars.event : this.defaults.selectedevent;
    this.setStyles();
    this.sketchName="None";
    this.unitSwitch=false;
    this.setScales();
    this.d=null;
    this.langs = {
        "de":{code:"de",name:"Deutsch"},
        "en":{code:"en",name:"English"},
        "es":{code:"es",name:"Español"},
        "fr":{code:"fr",name:"Français"},
        "pl":{code:"pl",name:"Polski"},
        // "en-GB":{code:"en-GB",name:"English"},
        // "de2":{code:"de",name:"Deutsch (de)"},
        // "en2":{code:"en",name:"English (en)"},
        // "fr2":{code:"fr",name:"Francais (fr)"},
    }

    this.panels = {
        'info':{'status':true,
            'hide':function(){gw.hideInfo()},
            'show':function(){gw.showInfo()}},
        'options':{'status':false,
            'hide':function(){gw.hideOptions()},
            'show':function(){gw.showSettings()}},
        'help':{'status':false,
            'hide':function(){gw.hideHelp()},
            'show':function(){gw.showHelp()}},
        'lang':{'status':false,
            'hide':function(){gw.hideLang()},
            'show':function(){gw.showLang()}},
        'april':{'status':false,
            'hide':function(){gw.hideApril()},
            'show':function(){gw.showApril()}}
    }
    if (this.urlVars.panel){
        for (p in this.panels){
            if (p==this.urlVars.panel){
                this.panels[p].status=true
            }else{this.panels[p].status=false}
        }
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
    if (this.doAprilFool){
        allKeys["ha"]=[this.doAprilFool,false]
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
    // set defauly
    // panel="info"
    // for (p in this.panels){
    //     if (this.panels[p].status){
    //         panel=p
    //     }
    // }

    if (this.optionsOn){return "options";}
    else if(this.helpOn){return "help";}
    else if(this.langOn){return "lang";}
    else{return "info"}
}
GWCatalogue.prototype.setPanel = function(panel){
    if (panel=="options"){this.showOptions();}
    else if(panel=="help"){this.showHelp();}
    else if(panel=="lang"){this.showLang();}
    else if(panel=="april"){this.showApril();}
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
            eneg=d[src].errv[1].toPrecision(sigfig)
            epos=d[src].errv[0].toPrecision(sigfig)
            if (d[src].errv[1]!=d[src].errv[0]){
                while (eneg==epos){
                    sigfig+=1
                    eneg=d[src].errv[1].toPrecision(sigfig)
                    epos=d[src].errv[0].toPrecision(sigfig)
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
            avail:true,
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
                time=d['UTC'].best.split('T')[1]
                return(year+'-'+month+'-'+day+"<br/>"+time+" UT")
            },
            icon:"img/time.svg",
            name:'%data.time.name%'},
        data:{
            type:'derived',
            depfn:function(d){return (d.link)},
            strfn:function(d){
                if ((d.link)&&d.link.url){
                    return gw.tl("<a target='_blank' href='"+d.link.url+
                        "' title='"+d.link.text+"'>%text.gen.losc%</a>");
                }else{
                    return(gw.labBlank);
                }
            },
            name:'%tooltip.plotgw.losc%',
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
    this.uplow=0.1;
    this.uploh=0.1;
    this.xValue = function(d) {
        if (!d[gw.xvar]){return 0}
        else if (d[gw.xvar].best!=null){return d[gw.xvar].best}
        else if (d[gw.xvar].lower!=null){return d[gw.xvar].lower}
        else if (d[gw.xvar].upper!=null){return d[gw.xvar].upper};
    } // data -> value
    // value -> display
    this.xScale = d3.scale.linear().domain([0,100])
        .range([0, this.graphWidth])
        // data -> display
    this.xMap = function(d) {return gw.xScale(gw.xValue(d));}
    // x error bars
    this.xErrP = function(d) {
        //error+ -> value
        if (!d[gw.xvar]){return null}
        else if((d[gw.xvar].errtype)&&(d[gw.xvar].errtype=='lower')){
            return d[gw.xvar].lower;
        }else{
            return (d[gw.xvar].errv[0])
        }
    }
    this.xErrM = function(d) {
        //error- -> value
        if (!d[gw.xvar]){return null}
        else if((d[gw.xvar].errtype)&&(d[gw.xvar].errtype=='upper')){
            return d[gw.xvar].upper;
        }else{
            return (d[gw.xvar].errv[1])
        }
    }
    // x error+ -> display
    this.xMapErrP = function(d) {
        if (!d[gw.xvar]){return null}
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
        if (!d[gw.xvar]){return null}
        if ((d[gw.xvar].errtype)&&(d[gw.xvar].errtype=='lower')){
            return gw.xMapErrP(d) - (gw.errh*gw.graphHeight)
        }else{
            return gw.xScale(gw.xErrP(d))
        }
    }
    // x error- -> display
    this.xMapErrM = function(d) {
        if (!d[gw.xvar]){return null}
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
        if (!d[gw.xvar]){return null}
        if ((d[gw.xvar].errtype)&&(d[gw.xvar].errtype=='upper')){
            return gw.xMapErrM(d) + (gw.errh*gw.graphHeight)
        }else{
            return gw.xScale(gw.xErrM(d))
        }
    }
    // x error caps -> display
    this.xMapErrY0 = function(d) { return gw.yScale(gw.yValue(d)) - (gw.errh*gw.graphHeight);}
    this.xMapErrY1 = function(d) { return gw.yScale(gw.yValue(d)) + (gw.errh*gw.graphHeight);}

    // x axis
    this.xAxis = d3.svg.axis()
            .scale(this.xScale)
            .orient("bottom")
            .innerTickSize(-this.graphHeight);

    //data -> value
    this.yValue = function(d) {
        if (!d[gw.yvar]){return 0}
        else if (d[gw.yvar].best!=null){return d[gw.yvar].best}
        else if (d[gw.yvar].lower!=null){return d[gw.yvar].lower}
        else if (d[gw.yvar].upper!=null){return d[gw.yvar].upper};
    }
    // value -> display
    // this.yScale = d3.scale.linear().
    //     range([this.relh[1]*this.graphHeight, this.relh[0]*this.graphHeight])
    this.yScale = d3.scale.linear().range([this.graphHeight,0])
    // data -> display
    this.yMap = function(d) { return gw.yScale(gw.yValue(d));}
    // y error bars
    this.yErrP = function(d) {
        //error- -> value
        if (!d[gw.yvar]){return null}
        else if((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='lower')){
            return d[gw.yvar].lower;
        }else{
            return (d[gw.yvar].errv[0])
        }
    }
    //error+ -> value
    this.yErrM = function(d) {
        //error- -> value
        if (!d[gw.yvar]){return null}
        else if((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='upper')){
            return d[gw.yvar].upper;
        }else{
            return (d[gw.yvar].errv[1])
        }
    }
    // y error+ -> display
    this.yMapErrP = function(d) {
        if (!d[gw.yvar]){return null}
        else if ((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='lower')){
            yval=gw.yScale(gw.yErrP(d)) - (gw.uploh*gw.graphHeight)
            if (yval<0){
                yval=Math.min(0,gw.yScale(gw.yErrM(d))-2*(gw.errw*gw.graphWidth));
            }
            return yval;
        }else{
            return gw.yScale(gw.yErrP(d));
        }
    }
    this.yMapErrPouter = function(d) {
        if (!d[gw.yvar]){return null}
        else if ((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='lower')){
            return gw.yMapErrP(d) + (gw.errw*gw.graphWidth)
        }else{
            return gw.yScale(gw.yErrP(d))
        }
    }
    // y error- -> display
    this.yMapErrM = function(d) {
        if (!d[gw.yvar]){return null}
        else if ((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='upper')){
            yval=gw.yScale(gw.yErrM(d)) + (gw.uploh*gw.graphHeight);
            if (yval>gw.graphHeight){
                yval=Math.max(gw.graphHeight,gw.yScale(gw.yErrM(d))+2*(gw.errw*gw.graphWidth));
            }
            return yval;
        }else{
            return gw.yScale(gw.yErrM(d));
        }
    }
    this.yMapErrMouter = function(d) {
        if (!d[gw.yvar]){return null}
        else if ((d[gw.yvar].errtype)&&(d[gw.yvar].errtype=='upper')){
            return gw.yMapErrM(d) - (gw.errw*gw.graphWidth)
        }else{
            return gw.yScale(gw.yErrM(d))
        }
    }
    // y error caps -< display
    this.yMapErrX0 = function(d) { return gw.xScale(gw.xValue(d)) - (gw.errw*gw.graphWidth);}
    this.yMapErrX1 = function(d) { return gw.xScale(gw.xValue(d)) + (gw.errw*gw.graphWidth);}

    // y axis
    this.yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient("left")
            // .innerTickSize(-(this.relw[1]-this.relw[0])*this.graphWidth);
            .innerTickSize(-this.graphWidth);

    this.dotOp = function(d) {return ((d[gw.xvar])&&(d[gw.yvar])) ? 1 : 0}
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

        datetime:{lab:["datetime"]},
        // time:{lab:["time"]},
        FAR:{lab:["FAR"]},
        Mchirp:{lab:["Mchirp"],
            labSw:["Mchirpkg"]},
        Mratio:{lab:["Mratio"]},
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
        switch:"%tooltip.plotgw.switchunits%"
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

    // add actions to nex/previous
    d3.select('#select-next')
        .on('mouseover',function(){gw.showTooltipManual("%tooltip.plotgw.nextevent%");})
        .on('mouseout',function(){gw.hideTooltipManual();})
        .on('click',function(){gw.selectNext(+1);})
    d3.select('#select-previous')
        .on('mouseover',function(){gw.showTooltipManual("%tooltip.plotgw.prevevent%");})
        .on('mouseout',function(){gw.hideTooltipManual();})
        .on('click',function(){gw.selectNext(-1);})

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
        .attr("rx",this.scaleRadius(1))
        .attr("ry",this.scaleRadius(1));
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
            .attr("r",this.scaleRadius(d[bh]))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-this.scaleRadius(d[bh]));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .transition().duration(this.flySp)
            .attr("rx",this.scaleRadius(d[bh]))
            .attr("ry",this.scaleRadius(d[bh],0.2));
    }else if(resize=="fly"){
        // resize & fly in
        this.svgSketch.select('circle.bh-'+bh)
            .attr("r",this.scaleRadius(d[bh]));
        this.svgSketch.select('circle.bh-'+bh)
            .transition().duration(this.flySp).ease("bounce")
            .attr("cx",this.xScaleSk(this.bhpos[bh].cx))
            .attr("cy",this.yScaleSk(this.bhpos[bh].cy)-this.scaleRadius(d[bh]));
        this.svgSketch.select('ellipse.shadow-'+bh)
            .transition().duration(this.flySp).ease("bounce")
            .attr("rx",this.scaleRadius(d[bh]))
            .attr("ry",this.scaleRadius(d[bh],0.2));
    }else if(resize=="snap"){
        // snap resize (when redrawing sketch)
        this.svgSketch.select('circle.bh-'+bh)
            .attr("r",this.scaleRadius(
                d[bh].best,d.Mfinal.best))
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
GWCatalogue.prototype.obj2hint = function(objType){
    if (objType=='BBH'){ return this.tl('%text.gen.bbh%')}
    else if (objType=='BNS'){ return this.tl('%text.gen.bns%')}
    else if (objType=='BHNS'){ return this.tl('%text.gen.bhns%')}
    else {return ""}
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
        this.sketchTitleHint.html(this.obj2hint(d.objType.best));
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
        this.sketchTitleHint.html(this.obj2hint(d.objType.best));
        //update labels
        this.redrawLabels();
    }
}

// ****************************************************************************
// ****************************************************************************
// ****************************************************************************

GWCatalogue.prototype.setStyles = function(){
    // setup colours and linestyles
    var gw=this
    this.cValue = function(d) {return d.type;};
    this.color1 = d3.scale.category10();
    this.styleDomains = (this.showxray) ? ['GW','LVT','xray'] : ['GW','LVT'];
    this.color = d3.scale.ordinal().range(["#1f77b4", "#ff7f0e","#999999"]).domain(this.styleDomains);
    this.linestyles = d3.scale.ordinal().range(["#000","#555","#555"]).domain(this.styleDomains);
    this.linedashes = d3.scale.ordinal().range([0,3,0]).domain(this.styleDomains);
    this.dotopacity = d3.scale.ordinal().range([1,1,0.5]).domain(this.styleDomains);
    this.getOpacity = function(d) {return (((d[gw.xvar])&&(d[gw.yvar])) ? gw.dotopacity(d.type) : 0)}
    // this.xrayShown = function(d) {
    //     if ((gw.xrayCols.hasOwnProperty(gw.xvar))&&(gw.xrayCols.hasOwnProperty(gw.yvar))&&(gw.showxray)){
    //         return true
    //     }else{return false}
    // }
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
GWCatalogue.prototype.tttextXray = function(d){
    // graph tooltip text
    if (this.debug){console.log(d["name"],this.columns[this.xvar].name,d[this.xvar].strnoerr,this.columns[this.yvar].name,d[this.yvar].strnoerr)}
    return "<span class='ttname'>"+d["name"]+"</span>"+
    "<span class='ttpri'>"+this.tl(this.oneline(d[this.xvar].strnoerr))+"</span>"+
    "<span class='ttsec'>"+this.tl(this.oneline(d[this.yvar].strnoerr))+"</span>";
}
GWCatalogue.prototype.orderData = function(order='GPS'){
    this.data=this.data.sort(function(a,b){
        return b[order].best - a[order].best
    });
    var dataOrder=[];
    this.data.forEach(function(d){dataOrder.push(d.name);});
    this.dataOrder=dataOrder;
}
GWCatalogue.prototype.formatData = function(d,cols){
    // generate new columns
    if (this.debug){console.log('formatData',d.name);}
    var gw=this;
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
                    d[col].best-d[col].err[1]];
                d[col].errtype='normal';
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
        // console.log(col,d[col])
        // console.log(col,d[col])
        // console.log(col,d[col]);
    }
}
// GWCatalogue.prototype.formatDataXray = function(d,cols){
//     // generate new columns
//     if (this.debug){console.log('formatData',d.name);}
//     var gw=this;
//     gw.xrayCols=['M1','M2'];
//     gw.xrayCols={
//         M1:{icon:"img/primass.svg",avail:true,type:'src',
//             strfn:function(d){
//                 return("%text.plotgw.bhmass%<br/>"+(d.M1.best)+" %data.M1.unit%");}
//             },
//         M2:{icon:"img/secmass.svg",avail:true,type:'src',
//             strfn:function(d){
//                 return("%text.plotgw.compmass%<br/>"+(d.M2.best)+" %data.M2.unit%");}
//         }
//     }
//     for (col in gw.xrayCols){
//         // console.log(col,gw.columns[col].type);
//         if (gw.xrayCols[col].type=="derived"){
//             d[col]={}
//             if (gw.xrayCols[col].bestfn){d[col].best=gw.xrayCols[col].bestfn(d);}
//             if ((gw.xrayCols[col].errfn)&&(d[col].err)){d[col].err=gw.columns[col].errfn(d);}
//             // console.log('new column',col,d[col])
//         }else{
//             // console.log('existing column',col,d[col])
//         }
//         if (d[col]){
//             if ((d[col].err)&&(d[col].err.length==2)){
//                 d[col].errv =
//                     [d[col].best+d[col].err[0],
//                     d[col].best-d[col].err[1]];
//             }else if (typeof d[col].best=="number"){
//                 d[col].errv =[d[col].best,d[col].best];
//             }
//             if (gw.xrayCols[col].strfn){
//                 d[col].str=gw.xrayCols[col].strfn(d);
//                 if ((gw.xrayCols[col].strfnnoerr)&&(d[col].err)){
//                     d[col].strnoerr=gw.xrayCols[col].strfnnoerr(d);
//                 }else{
//                     d[col].strnoerr=gw.xrayCols[col].strfn(d);
//                 }
//             }else{
//                 d[col].str=(d[col].err) ? gw.stdlabel(d,col) : gw.stdlabelNoErr(d,col);
//                 d[col].strnoerr = gw.stdlabelNoErr(d,col);
//             }
//         }
//         // console.log(col,d[col])
//         // console.log(col,d[col])
//         // console.log(col,d[col]);
//     }
// }
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
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
}
// GWCatalogue.prototype.getUrlVars = function(){
//     // Get URL and query variables
//     var vars = {},hash;
//     var url = window.location.href;
//     if (window.location.href.indexOf('?')!=-1){
//         var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
//         url = window.location.href.slice(0,window.location.href.indexOf('?'));
//         for(var i = 0; i < hashes.length; i++)
//         {
//             hash = hashes[i].split('=');
//             // vars.push(hash[0]);
//             vars[hash[0]] = hash[1];
//         }
//     }
//     // console.log("input:",vars);
//     this.urlVars = vars;
//     this.url = url;
// }

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
    gw.fileInEventsDefault=(gw.doAprilFool)?"json/events0104.json":"json/events.json";
    // gw.fileInEventsDefault="json/events0104.json";
    gw.fileInEvents = (gw.urlVars.eventsFile) ? gw.urlVars.eventsFile : gw.fileInEventsDefault
    gw.fileInXrayDefault="csv/bhcat_xray.csv";
    gw.fileInXray = (gw.urlVars.xrayFile) ? gw.urlVars.xrayFile : gw.fileInXrayDefault

    // if (gw.urlVars.lang){
    //     lang=gw.urlVars.lang;
    // }else{lang=gw.defaults.lang}

    gw.loadLangDefault()
    gw.loadLang(this.langIn)
    // gw.langdict_default = gw.loadLang(gw.langDefault,true);

    d3.json(gw.fileInEvents, function(error, dataIn) {
        if (error){
            console.log('events error:',error,dataIn);
            alert("Fatal error loading input file: '"+gw.fileInEvents+"'. Sorry!");
        }else{
            if (this.debug){console.log("dataIn (events:)",dataIn)}
        }
        gw.loaded++;
        if (gw.debug){console.log('dataIn.links',dataIn.links)}
        if (dataIn.datadict){
            //uses LOSC format (has datadict), so need to convert
            gw.dataFormat='losc';
            if (this.debug){console.log('converting from LOSC format');}
            newlinks={}
            for (e in dataIn.data){
                if(this.debug){console.log(e,dataIn.data[e])}
                // // convert events to required format
                // ev=dataIn.events[e];
                // dataIn.data[e]={};
                // for (c in ev){
                //     if (typeof ev[c]=="number"){
                //         dataIn.data[e][c]={best:ev[c]}
                //     }else if (typeof ev[c]=="object"){
                //         dataIn.data[e][c]={best:ev[c][0],err:[ev[c][1],ev[c][2]]}
                //     }else{
                //         dataIn.data[e][c]={best:ev[c]}
                //     }
                // }
                // convert links to required format
                if(this.debug){console.log(e,dataIn.links)}
                if (dataIn.links[e]){
                    linkIn=dataIn.links[e];
                    if(this.debug){console.log('linkIn',e,linkIn)}
                    newlinks[e]={}
                    for (l in linkIn){
                        if (linkIn[l].text.search('Paper')>=0){
                            newlinks[e]['DetPaper']={
                                text:linkIn[l].text,
                                url:linkIn[l].url,
                                type:'paper'}
                        }
                        else if (linkIn[l].text.search('Open Data page')>=0){
                            newlinks[e]['LOSCData']={
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
                    if(this.debug){console.log('links',e,newlinks[e])}
                }
            }
            dataIn.links=newlinks;
        }else{
            gw.dataFormat='std';
            newlinks=false;
        }
        if (gw.debug){console.log('dataIn.links',dataIn.links,newlinks)}
        for (e in dataIn.data){
            dataIn.data[e].name=e;
            if (dataIn.data[e].type){
                dataIn.data[e].type=dataIn.data[e].type.best
            }else{
                if (e[0]=='G'){t='GW'}
                else if (e[0]=='L'){t='LVT'}
                else{t=''}
                dataIn.data[e].type=t;
            }
            if (e[0]=='G'){c='GW'}
            else if (e[0]=='L'){c='LVT'}
            else{c=''}
            dataIn.data[e].conf=c;
            if ((dataIn.links[e]) && (dataIn.links[e].LOSCData)){
                link=dataIn.links[e].LOSCData;
                link.url=link.url;
                dataIn.data[e].link=link;
            }
            if ((dataIn.links[e]) && (dataIn.links[e].DetPaper)){
                ref=dataIn.links[e].DetPaper;
                ref.url=ref.url;
                dataIn.data[e].ref=ref;
                if(gw.debug){console.log(dataIn.data[e].name,ref)}
            }
            gw.data.push(dataIn.data[e]);
        }
        if(gw.debug){console.log('data pre-format:',gw.data);}
        if (gw.loaded==gw.toLoad){
            gw.whenLoaded();
            // gw.setColumns(gw.datadict);
            // gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
            // gw.makePlot();
            // if(gw.debug){console.log('plotted');}
        }
    });
    d3.json(gw.fileInDataDict, function(error, dataIn) {
        if (error){
            alert("Fatal error loading input file: '"+gw.fileInDataDict+"'. Sorry!")
        }
        gw.loaded++;
        // if(gw.debug){console.log((dataIn),(dataIn.datadict))}
        gw.datadict = (dataIn.datadict) ? dataIn.datadict : dataIn;
        if((gw.debug)&&(dataIn)){console.log('datadict:',gw.datadict,dataIn);}
        if (gw.loaded==gw.toLoad){
            gw.whenLoaded();
            // gw.setColumns(gw.datadict);
            // gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
            // gw.makePlot();
            // if(gw.debug){console.log('plotted');}
        }
    });
    // read in Xray data
    // d3.csv(gw.fileInXray, function(error, dataIn){
    //     if (error){alert("Fatal error loading input file: '"+gw.fileInXray+"'. Sorry!")}
    //     gw.dataXray = dataIn;
    //     for (i in gw.dataXray){
    //         d=gw.dataXray[i];
    //         d.M1={best:d.massBH};
    //         d.M2={best:d.compMass};
    //         d.D2={best:d.distance};
    //         d.type='xray';
    //     }
    //     gw.loaded++;
    //     if (gw.debug){console.log('loaded: '+gw.inputFileXray)}
    //     //call next functions
    //     if (gw.loaded==gw.toLoad){
    //         gw.whenLoaded();
    //     }else{
    //         if (gw.debug){console.log('not ready yet')}
    //     }
    // })
}
GWCatalogue.prototype.whenLoaded = function(){
    var gw=this;
    gw.setColumns(gw.datadict);
    gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
    // gw.dataXray.forEach(function(d){gw.formatDataXray(d,gw.columns)});
    // order Data
    gw.orderData();
    gw.makePlot();
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
                    alert('Error loading language '+gw.lang+'. Displaying '+gw.langshort+' instead');
                    gw.updateUrl();
                    window.location.replace({},null,gw.makeUrl({'lang':gw.defaults.lang}));
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
            gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
            gw.replot();
            d3.select(".lang-cont.current").classed("current",false);
            d3.select("#lang_"+gw.lang+"_cont").classed("current",true);
        }else{
            if (gw.debug){console.log('loaded language',gw.lang,gw.langdict);}
            gw.loaded++;
            // gw.setLang();
            if (gw.loaded==gw.toLoad){
                gw.whenLoaded();
                // gw.setColumns(gw.datadict);
                // gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
                // gw.makePlot();
                // if(gw.debug){console.log('plotted');}
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
            // gw.setColumns(gw.datadict);
            // gw.data.forEach(function(d){gw.formatData(d,gw.columns)});
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
    d3.select("#options-x > .panel-title")
        .html(this.tl('%text.plotgw.horizontal-axis%'))
    d3.select("#options-y > .panel-title")
        .html(this.tl('%text.plotgw.vertical-axis%'))
    this.legenddescs = {GW:this.tl('%text.plotgw.legend.detections%'),
        LVT:this.tl('%text.plotgw.legend.candidates%'),
        xray:this.tl('%text.bub.legend.xray%')}
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
    // axis icon is div in SVG container (not SVG element)
    gw.graphcont.append("div")
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
    // axis icon is div in SVG container (not SVG element)
    gw.graphcont.append("div")
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

    d3.selectAll('.tick > line')
            .style('stroke','#ccc')
            .style('opacity',1)

    // draw x-ray dots
    // if (this.showxray){
    // xrayGroup = gw.svg.append("g").attr("class","g-xray")
    // xrayGroup.selectAll(".xraydot")
    //     .data(gw.dataXray)
    // .enter().append("circle")
    //     .attr("class", "xraydot")
    //     .attr("transform", "translate("+gw.margin.left+","+
    //         gw.margin.top+")")
    //     .attr("r", Math.min(10.,7/gw.sksc))
    //     .attr("cx", gw.xMap)
    //     .attr("cy", gw.yMap)
    //     .attr("cursor","default")
    //     .attr("opacity",function(d){return gw.getOpacity(d)})
    // //   .style("fill", function(d) { return color(cValue(d));})
    //     .style("fill", function(d){return gw.color(gw.cValue(d));})
    //     .style("stroke",function(d){return gw.linestyles(d.type);})
    //     .style("stroke-dasharray",function(d){return gw.linedashes(d.type);})
    //     .style("stroke-width",Math.min(5,2./gw.sksc))
    //     .on("mouseover", function(d) {
    //         gw.tooltip.transition()
    //            .duration(200)
    //            .style("opacity", .9);
    //         gw.tooltip.html(gw.tttextXray(d))
    //            .style("left", (d3.event.pageX + 10) + "px")
    //            .style("top", (d3.event.pageY-10) + "px")
    //            .style("width","auto")
    //            .style("height","auto");
    //     })
    //     .on("mouseout", function(d) {
    //         gw.tooltip.transition()
    //            .duration(500)
    //            .style("opacity", 0);
    //     })
    // }

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
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    // add top of x error bar
    errX.append("line")
        .attr("class","error errorX errorXp1")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMapErrPouter).attr("x2",gw.xMapErrP)
        .attr("y1",gw.xMapErrY0).attr("y2",gw.yMap)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    errX.append("line")
        .attr("class","error errorX errorXp2")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMapErrP).attr("x2",gw.xMapErrPouter)
        .attr("y1",gw.yMap).attr("y2",gw.xMapErrY1)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    // add bottom of x error bar
    errX.append("line")
        .attr("class","error errorX errorXm1")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMapErrMouter).attr("x2",gw.xMapErrM)
        .attr("y1",gw.xMapErrY0).attr("y2",gw.yMap)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    errX.append("line")
        .attr("class","error errorX errorXm2")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMapErrM).attr("x2",gw.xMapErrMouter)
        .attr("y1",gw.yMap).attr("y2",gw.xMapErrY1)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);

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
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    // add top of y error bar
    errY.append("line")
        .attr("class","error errorY errorYp1")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.yMapErrX0).attr("x2",gw.xMap)
        .attr("y1",gw.yMapErrPouter).attr("y2",gw.yMapErrP)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    errY.append("line")
        .attr("class","error errorY errorYp2")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMap).attr("x2",gw.yMapErrX1)
        .attr("y1",gw.yMapErrP).attr("y2",gw.yMapErrPouter)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    // add bottom of y error bar
    errY.append("line")
        .attr("class","error errorY errorYm1")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.yMapErrX0).attr("x2",gw.xMap)
        .attr("y1",gw.yMapErrMouter).attr("y2",gw.yMapErrM)
        .attr("stroke",gw.colorErr)
        .attr("stroke-width",gw.swErr)
        .attr("opacity",gw.opErr);
    errY.append("line")
        .attr("class","error errorY errorYm2")
        // .attr("transform", "translate("+gw.margin.left+","+
        //     gw.margin.top+")")
        .attr("x1",gw.xMap).attr("x2",gw.yMapErrX1)
        .attr("y1",gw.yMapErrM).attr("y2",gw.yMapErrMouter)
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
    dotsGroup = gw.svg.append("g").attr("class","g-dots")
    dotsGroup.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("transform", "translate("+gw.margin.left+","+
        gw.margin.top+")")
      .attr("r", Math.min(10.,7/gw.sksc))
      .attr("cx", gw.xMap)
      .attr("cy", gw.yMap)
      .attr("cursor","pointer")
      .attr("opacity",function(d){return gw.getOpacity(d)})
    //   .style("fill", function(d) { return color(cValue(d));})
      .style("fill", function(d){return gw.color(gw.cValue(d));})
      .style("stroke",function(d){return gw.linestyles(d.type);})
      .style("stroke-dasharray",function(d){return gw.linedashes(d.type);})
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
      .text(function(d) { if (gw.legenddescs[d]){return gw.legenddescs[d];}else{return d}})

    // hide/show xray legend dot
    // if(gw.xrayShown()){
    //     d3.select('.legend.xray')
    //         .transition().duration(750).attr("opacity",1)
    // }else{
    //     d3.select('.legend.xray').transition().duration(750).attr("opacity",0)
    // }

    //add options icon
    optionsClass = (this.optionsOn) ? "graph-icon" : "graph-icon hidden";
    this.optionsbg = d3.select('#options-bg');
    this.optionsouter = d3.select('#options-outer')
    this.graphcont.append("div")
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
    this.graphcont.append("div")
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
    this.graphcont.append("div")
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
    this.graphcont.append("div")
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
    this.graphcont.append("div")
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
    this.graphcont.append("div")
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

    //add search button
    this.graphcont.append("div")
        .attr("id","search-icon")
        .attr("class","graph-icon hidden")
        .style({"right":gw.margin.right+6*(gw.margin.top+10),"top":0,"width":gw.margin.top,"height":gw.margin.top})
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
    gw.data.forEach(function(d){
        if (d.objType.best!="BBHApril"){
            d3.select('#search-outer').append("div")
            .attr("class","popup-list-item search-list-item")
            .attr("id","search-list-"+d.name)
            .html(d.name)
            .on("click",function(){
                if (gw.selectedevent!=this.innerHTML){gw.selectEvent(this.innerHTML);}gw.hideSearch();})
            }
        // if (gw.selectedevent==d.name){
        //     document.getElementById("search-list-"+d.name).classList.add("current")
        // }else{
        //     document.getElementById("search-list-"+d.name).classList.remove("current")
        // }
    })
    d3.select("#search-bg").on("click",function(){gw.hideSearch();});
    d3.select("#search-close").on("click",function(){gw.hideSearch();});

    console.log(gw.selectedevent); 
    // //add download button
    // this.graphcont.append("div")
    //     .attr("id","save-icon")
    //     .attr("class","graph-icon hidden")
    //     .style({"right":gw.margin.right+7*(gw.margin.top+10),"top":0,"width":gw.margin.top,"height":gw.margin.top})
    //     .on("mouseover",function(){
    //         gw.showTooltipManual("%tooltip.plotgw.save%");
    //     })
    //     .on("mouseout",function(){
    //         gw.hideTooltipManual();
    //     }).append("img")
    //     .attr("src","img/save.svg")
    //     .attr("class","hidden")
    //     .attr("id","save-img")
    //     .on("click",function(){gw.writeDownloadLink()});
}
GWCatalogue.prototype.selectEvent = function(ev,redraw=false,init=false){
    var gw=this;
    if (typeof ev == "string"){
        if(parseInt(ev)==parseInt(ev)){
            // ev is a string which is a number
            evnum=parseInt(ev)
            if (evnum<0){
                evnum=gw.dataOrder.length + evnum
            }
            evnum=evnum % gw.dataOrder.length
        }else{
            // ev is a string which is not a number
            evnum=gw.dataOrder.indexOf(ev)
        }
        if (evnum>=0){d=gw.data[evnum]}else{d=null}
    }else if(typeof ev == "number"){
        // ev is a number
        evnum=ev
        if (evnum<0){
            evnum=gw.dataOrder.length + evnum
        }
        evnum=evnum % gw.dataOrder.length
        d=gw.data[evnum]
    }else{
        // evname is an event object
        evnum=gw.dataOrder.indexOf(ev.name)
        d=ev;
    }
    if (d){
        // d exists
        if (init){
            gw.dataIdx=evnum;
            gw.moveHighlight(d);
            gw.updateSketch(d);
            if(document.getElementById("search-list-"+d.name)){
                document.getElementById("search-list-"+d.name).classList.add("current")
            }
        }else if((d.name!=gw.selectedevent)||(redraw)){
            // different to currently selected event
            gw.dataIdx=evnum;
            gw.moveHighlight(d);
            gw.updateSketch(d);
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
            gw.moveHighlight(d);
            gw.updateSketch(d);
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
}
GWCatalogue.prototype.selectNext = function(dir=1){
    this.selectEvent(this.dataIdx+dir)
    return(this.dataIdx)
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
        errX=this.svg.selectAll(".errorX-g")
            .data(this.data)
        errX.selectAll('.errorX')
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",0);
        // errX.selectAll(".errorXp1")
        //     .transition()
        //     .duration(750)
        //     .attr("x1",this.xMap).attr("x2",this.xMap)
        //     .attr("y1",this.yMap).attr("y2",this.yMap)
        //     .attr("opacity",0);
        // errX.selectAll(".errorXm1")
        //     .transition()
        //     .duration(750)
        //     .attr("x1",this.xMap).attr("x2",this.xMap)
        //     .attr("y1",this.yMap).attr("y2",this.yMap)
        //     .attr("opacity",0);
    }else{
        // add/update x-errors
        errX=this.svg.selectAll(".errorX-g")
            .data(this.data)
        errX.selectAll(".errorXline")
            .transition()
            .duration(750)
            .attr("x1",this.xMapErrP).attr("x2",this.xMapErrM)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",this.dotOp);
        errX.selectAll(".errorXp1")
            .transition()
            .duration(750)
            .attr("x1",this.xMapErrPouter).attr("x2",this.xMapErrP)
            .attr("y1",this.xMapErrY0).attr("y2",this.yMap)
            .attr("opacity",this.dotOp);
        errX.selectAll(".errorXp2")
            .transition()
            .duration(750)
            .attr("x1",this.xMapErrP).attr("x2",this.xMapErrPouter)
            .attr("y1",this.yMap).attr("y2",this.xMapErrY1)
            .attr("opacity",this.dotOp);
        errX.selectAll(".errorXm1")
            .transition()
            .duration(750)
            .attr("x1",this.xMapErrMouter).attr("x2",this.xMapErrM)
            .attr("y1",this.xMapErrY0).attr("y2",this.yMap)
            .attr("opacity",this.dotOp);
        errX.selectAll(".errorXm2")
            .transition()
            .duration(750)
            .attr("x1",this.xMapErrM).attr("x2",this.xMapErrMouter)
            .attr("y1",this.yMap).attr("y2",this.xMapErrY1)
            .attr("opacity",this.dotOp);
    }
    if ((this.columns[this.yvar]["errcode"]=="")||(!this.showerrors)){
        // remove y-errors
        errY=this.svg.selectAll(".errorY-g")
            .data(this.data)
        errY.selectAll('.errorY')
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMap).attr("y2",this.yMap)
            .attr("opacity",0);
        // errY.selectAll(".errorYp1")
        //     .transition()
        //     .duration(750)
        //     .attr("x1",this.xMap).attr("x2",this.xMap)
        //     .attr("y1",this.yMap).attr("y2",this.yMap)
        //     .attr("opacity",0);
        // errY.selectAll(".errorYp2")
        //     .transition()
        //     .duration(750)
        //     .attr("x1",this.xMap).attr("x2",this.xMap)
        //     .attr("y1",this.yMap).attr("y2",this.yMap)
        //     .attr("opacity",0);
        // errY.selectAll(".errorYm1")
        //     .transition()
        //     .duration(750)
        //     .attr("x1",this.xMap).attr("x2",this.xMap)
        //     .attr("y1",this.yMap).attr("y2",this.yMap)
        //     .attr("opacity",0);
        // errY.selectAll(".errorYm2")
        //     .transition()
        //     .duration(750)
        //     .attr("x1",this.xMap).attr("x2",this.xMap)
        //     .attr("y1",this.yMap).attr("y2",this.yMap)
        //     .attr("opacity",0);
    }else{
        // add/update y-errors
        errY=this.svg.selectAll(".errorY-g")
            .data(this.data)
        errY.selectAll('.errorYline')
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.xMap)
            .attr("y1",this.yMapErrP).attr("y2",this.yMapErrM)
            .attr("opacity",this.dotOp);
        errY.selectAll(".errorYp1")
            .transition()
            .duration(750)
            .attr("x1",this.yMapErrX0).attr("x2",this.xMap)
            .attr("y1",this.yMapErrPouter).attr("y2",this.yMapErrP)
            .attr("opacity",this.dotOp);
        errY.selectAll(".errorYp2")
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.yMapErrX1)
            .attr("y1",this.yMapErrP).attr("y2",this.yMapErrPouter)
            .attr("opacity",this.dotOp);
        errY.selectAll(".errorYm1")
            .transition()
            .duration(750)
            .attr("x1",this.yMapErrX0).attr("x2",this.xMap)
            .attr("y1",this.yMapErrMouter).attr("y2",this.yMapErrM)
            .attr("opacity",this.dotOp);
        errY.selectAll(".errorYm2")
            .transition()
            .duration(750)
            .attr("x1",this.xMap).attr("x2",this.yMapErrX1)
            .attr("y1",this.yMapErrM).attr("y2",this.yMapErrMouter)
            .attr("opacity",this.dotOp);
    }
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

        // Move the dots
        gw.svg.selectAll(".dot")   // change the line
            .transition()
            .duration(750)
            .attr("cx", gw.xMap)
            .style("opacity",this.dotOp);
        gw.svg.selectAll(".xraydot")   // change the line
            .transition()
            .duration(750)
            .attr("cx", gw.xMap)
            .attr("opacity",function(d){return gw.getOpacity(d)})
        // hide/show xray legend dot
        // if(gw.xrayShown()){
        //     d3.select('.legend.xray')
        //         .transition().duration(750).attr("opacity",1)
        // }else{
        //     d3.select('.legend.xray').transition().duration(750).attr("opacity",0)
        // }
        // change the x axis
        gw.svg.select(".x-axis.axis")
            .transition()
            .duration(750)
            .call(gw.xAxis);
            //   .forceX([0]);
        gw.svg.select(".x-axis.axis-label")
            .transition()
            .duration(750)
            .text(gw.getLabelUnit(gw.xvar,true));
        gw.graphcont.select("#x-axis-icon")
            .attr("src",gw.getIcon(gw.xvar));
        gw.svg.select(".y-axis-line.axis-line")
            .transition()
            .duration(750)
            .attr("x1",gw.xScale(0)).attr("x2",gw.xScale(0))
            .attr("opacity",gw.yAxLineOp);
        data.forEach(function(d){
            if (d.name==gw.sketchName){
                gw.svg.select("#highlight")
                    .transition()
                    .duration(750)
                    .attr("cx", gw.xMap(d))
                    .style("opacity",gw.dotOp(d));
            }
        });
        // Update error bars
        gw.updateErrors();
    // });
    gw.updateUrl();
    // window.history.pushState({},null,gw.makeUrl());
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
            yMax = d3.max(data, gw.yValue)+yBorder;
            gw.yScale.domain([yMin, yMax]);
        }else{
            yMin = (d3.min(data, gw.yErrM)<0) ? d3.min(data, gw.yErrM) - yBorder : 0;
            yMax = d3.max(data, gw.yErrP)+yBorder;
            gw.yScale.domain([yMin, yMax]);
        }
        gw.xAxLineOp = (yMin < 0) ? 0.5 : 0;
        // Select the section we want to apply our changes to
        // var svg = d3.select("body").transition();

        // Move the dots
        gw.svg.selectAll(".dot")   // change the line
            .transition()
            .duration(750)
            .attr("cy", gw.yMap)
            .style("opacity",this.dotOp);
        gw.svg.selectAll(".xraydot")   // change the line
            .transition()
            .duration(750)
            .attr("cy", gw.yMap)
            .attr("opacity",function(d){return gw.getOpacity(d)})
        // hide/show xray legend dots
        // if(gw.xrayShown()){
        //     d3.select('.legend.xray')
        //         .transition().duration(750).attr("opacity",1)
        // }else{
        //     d3.select('.legend.xray').transition().duration(750).attr("opacity",0)
        // }
        // change the y axis
        gw.svg.select(".y-axis.axis")
            .transition()
            .duration(750)
            .call(gw.yAxis);
        gw.svg.selectAll(".y-axis.axis-label")
            .transition()
            .duration(750)
            .text(gw.getLabelUnit(gw.yvar,true));
        gw.graphcont.select("#y-axis-icon")
            .attr("src",gw.getIcon(gw.yvar));
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
                    .attr("cy", gw.yMap(d))
                    .style("opacity",gw.dotOp(d));
            }
        });
        // Update error bars
        gw.updateErrors();
    // });
    gw.updateUrl()
    // window.history.pushState({},null,gw.makeUrl());
}
GWCatalogue.prototype.updateBothaxes = function(xvarNew,yvarNew) {
    // update x-xais to xvarNew
    // set global variable
    this.xvar = xvarNew;
    this.yvar = yvarNew;
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

        yBorder= (gw.columns[gw.yvar].border) ? gw.columns[gw.yvar].border : 2
        if (gw.columns[gw.yvar].errcode==""){
            yMin = (d3.min(data, gw.yValue)<0) ? d3.min(data, gw.yValue) - yBorder : 0;
            yMax = d3.max(data, gw.yValue)+yBorder;
            gw.yScale.domain([yMin, yMax]);
        }else{
            yMin = (d3.min(data, gw.yErrM)<0) ? d3.min(data, gw.yErrM) - yBorder : 0;
            yMax = d3.max(data, gw.yErrP)+yBorder;
            gw.yScale.domain([yMin, yMax]);
        }
        gw.xAxLineOp = (yMin < 0) ? 0.5 : 0;

        // Select the section we want to apply our changes to
        var svg = d3.select("body").transition();

        // Move the dots
        gw.svg.selectAll(".dot")   // change the line
            .transition()
            .duration(750)
            .attr("cx", gw.xMap)
            .attr("cy", gw.yMap)
            .style("opacity",this.dotOp);
        gw.svg.selectAll(".xraydot")   // change the line
            .transition()
            .duration(750)
            .attr("cx", gw.xMap)
            .attr("cy", gw.yMap)
            .attr("opacity",function(d){return gw.getOpacity(d)})

        gw.svg.select(".x-axis.axis")
            .transition()
            .duration(750)
            .call(gw.xAxis);
            //   .forceX([0]);
        gw.svg.select(".x-axis.axis-label")
            .transition()
            .duration(750)
            .text(gw.getLabelUnit(gw.xvar,true));
        gw.graphcont.select("#x-axis-icon")
            .attr("src",gw.getIcon(gw.xvar));
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
        gw.svg.selectAll(".y-axis.axis-label")
            .transition()
            .duration(750)
            .text(gw.getLabelUnit(gw.yvar,true));
        gw.graphcont.select("#y-axis-icon")
            .attr("src",gw.getIcon(gw.yvar));
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
    if (this.alrilOn){this.hideApril()}
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
    if (this.aprilOn){this.hideApril();}
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
    if (this.aprilOn){this.hideApril();}
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
            // gw.tl("https://twitter.com/intent/tweet?text=%share.plotgw.twitter.text%&url=").replace(/\s/g,"%20")+
            // gw.makeUrl().replace("file:///","http%3A%2F%2F").replace(/&/g,'%26').replace(/:/g,'%3A').replace(/\//g,'%2F').replace(/\?/g,'%3F').replace(/=/g,'%3D')+
            // gw.tl("&hashtags=%share.plotgw.twitter.hashtag%"));
}
GWCatalogue.prototype.hideShare = function(){
    //show share pot
    d3.select('#share-bg').style("height",0).style("display","none");
    d3.select('#share-outer').transition()
       .duration(500)
       .style("opacity",0)
       .style("max-height",0);

}
GWCatalogue.prototype.showSearch = function(){
    //show share pot
    var gw=this;
    d3.select("#search-bg").style("height","100%").style("display","block");
    searchouter=d3.select('#search-outer')
    searchouter.transition()
       .duration(500)
       .style("opacity",1)
       .style("max-height",document.getElementById('svg-container').offsetHeight);
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
    //show share pot
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
    this.updateXaxis(this.xvar);
    this.updateYaxis(this.yvar);
    this.drawSketch();
    // this.addButtons();
    this.addOptions();
    this.addHelp();
    this.addLang(false);
    if(this.doAprilFool){this.aprilFool();}
    panel = (this.urlVars.panel) ? this.urlVars.panel : this.getPanel();
    this.setPanel(panel);
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
