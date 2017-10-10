// var diameter = Math.min(document.getElementById("svg-container").offsetWidth,document.getElementById("svg-container").offsetHeight);
// // document.getElementById("hdr").setAttribute("width",diameter);
// document.getElementById("svg-container").setAttribute("width",diameter);
// console.log(document.getElementById("hdr"));

function BHBubble(inp){
    var bh=this;
    this.holderid = (inp)&&(inp.holderid) ? inp.holderid : "bubble-cont";
    // parse URL queries
    this.getUrlVars();
    // load language
    this.langdir='lang/';
    this.defaults = {"lang":"en"}
    this.nameCols = {"or":"name-or-unicode"}

    //set default language from browser
    langIn = (navigator) ? (navigator.userLanguage||navigator.systemLanguage||navigator.language||browser.language) : "";

    //set lang from query (if present)
    if((inp)&&(inp.lang)&&(typeof inp.lang=="string")) langIn = inp.lang;

    // set language from urlVars (if present)
    langIn = ((this.urlVars.lang)&&(typeof this.urlVars.lang=="string")) ? this.urlVars.lang : langIn
    if (this.urlVars.debug){console.log('initial language: ',langIn)}

    this.loadLang(langIn);
    // bub.makePlot();
    // NB: "loadLang" calls makePlot function on first load

    window.addEventListener("resize",function(){
        bh.replot();
    });
    return this;
}
BHBubble.prototype.getUrlVars = function(){
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
    //     this.urlVars.lang="en";
    // }
}
BHBubble.prototype.makeUrl = function(newKeys){
    // construct new URL with replacement queries if necessary
    newUrlVars = this.urlVars;
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
BHBubble.prototype.loadLang = function(lang){
    //;load language files - then call rest of load procedure
    var _bh = this;
    if (this.urlVars.debug){console.log('lang',lang);}
    var reload = (!_bh.lang)||(_bh.lang=="") ? false:true;
    if (this.urlVars.debug){console.log('reload',reload);}
    _bh.langloaded=false;
    if (!lang){
        lang="en";
        if(_bh.urlVars.debug){console.log("default to",lang);}
    }
    _bh.lang = lang;
    _bh.langshort = (_bh.lang.indexOf('-') > 0 ? _bh.lang.substring(0,_bh.lang.indexOf('-')) : _bh.lang.substring(0,2));
    _bh.fileInLang=this.langdir+'lang_'+_bh.lang+'.json';
    // console.log(url);
    // Bug fix for reading local JSON file in FF3
    // $.ajaxSetup({async:true,'beforeSend': function(xhr){
    //     // console.log(this);
    //     if (xhr.overrideMimeType) xhr.overrideMimeType("text/plain"); },
    //     datatype:'json',
    //     success:function(json){}
    // });
    // Get the JSON language file amd call "makePlot" on completion
    d3.json(_bh.fileInLang, function(error, data) {
        if (error){
            if (_bh.lang==_bh.defaults.lang){
                console.log(error);
                alert("Fatal error loading input file: '"+_bh.fileInLang+"'. Sorry!")
            }else if (_bh.langshort!=_bh.lang){
                if (_bh.urlVars.debug){console.log('Error loading language '+_bh.lang+'. Displaying '+_bh.langshort+' instead')}
                if (_bh.urlVars.lang){
                    alert('Error loading language '+_bh.lang+'. Displaying '+_bh.langshort+' instead');
                    window.history.pushState({},null,_bh.makeUrl({'lang':_bh.langshort}));
                }
                _bh.langold=_bh.lang
                _bh.lang=null;
                _bh.loadLang(_bh.langshort);
            }else{
                if (_bh.urlVars.debug){console.log('Error loading language '+_bh.lang+'. Reverting to '+_bh.defaults.lang+' as default');}
                if (_bh.urlVars.lang){
                    alert('Error loading language '+_bh.lang+'. Reverting to '+_bh.defaults.lang+' as default');
                    window.history.pushState({},null,_bh.makeUrl({'lang':_bh.defaults.lang}));
                }
                // window.history.pushState({},null,gw.makeUrl({'lang':gw.defaults.lang}));
                // gw.loaded-=1;
                _bh.langold=_bh.lang
                _bh.lang=null;
                _bh.loadLang(_bh.defaults.lang);
                // window.location.replace(_bh.makeUrl({'lang':_bh.defaults.lang}));
            }
        }
        if (!data){
            if (_bh.urlVars.debug){console.log('tried loading: ',_bh.langold)}
            return
        }
        if (_bh.urlVars.debug){console.log('successfully loaded: ',_bh.lang,data);}
        _bh.langdict=data;
        document.title=_bh.tl("%text.bub.page.title%");
        _bh.langloaded=true;
        // update legend
        _bh.legenddescs = {
            1:_bh.tl("%text.bub.legend.candidate%"),
            2:_bh.tl("%text.bub.legend.detection%"),
            3:_bh.tl("%text.bub.legend.xray%")};
        if (reload){
            // replot
            _bh.replot();
            // change language
            _bh.langlab.html(_bh.langs[_bh.lang].code);
            d3.select(".lang-item.current").classed("current",false);
            d3.select(".lang-item#"+_bh.lang).classed("current",true);
            // update URL
            window.history.pushState({},null,_bh.makeUrl({'lang':_bh.lang}));
            // update footer
            footer=document.getElementById("footer-txt");
            footer.innerHTML = _bh.tl("%text.bub.footer%",footertxt);
            // update title
            d3.select('#hdr h1').html(_bh.tl("%text.bub.page.title%"));
            d3.select('#copy-button').attr('title',_bh.tl('%text.gen.share.copylink%'))
            d3.select('#facebook-share-button').attr('title',_bh.tl('%text.gen.share.fb%'))
            d3.select('#twitter-share-button').attr('title',_bh.tl('%text.gen.share.twitter%'))
            d3.select('#copy-button').attr('data-clipboard-text',_bh.makeUrl());
        }
        else{
            d3.select('#copy-button').attr('title',_bh.tl('%text.gen.share.copylink%'))
            d3.select('#facebook-share-button').attr('title',_bh.tl('%text.gen.share.fb%'))
            d3.select('#twitter-share-button').attr('title',_bh.tl('%text.gen.share.twitter%'))
            d3.select('#copy-button').attr('data-clipboard-text',_bh.makeUrl());
            _bh.makePlot();
        }
    })
}
BHBubble.prototype.t = function(key,def){
    //translate text
    if (this.langdict.hasOwnProperty(key)){return this.langdict[key];}
    else{
        if (this.urlVars.debug){console.log("not found: "+key)};
        return (def) ? def : key;
    }
}
BHBubble.prototype.tl = function(textIn,plaintext){
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
    textOut=textIn;
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
        // textOut = (textOut) ? textOut.replace(reSup,"<sup>$1</sup> ") : "";
        textOut = textOut.replace(reSup,"<sup>$1</sup> ")
        // replace Msun
        // textOut = (textOut) ? textOut.replace(this.tl("%data.mass.unit.msun%",true),'M<sub>&#x2609;</sub>') : "";
        textOut = textOut.replace(new RegExp(this.tl("%data.mass.unit.msun%",true),'g'),'M<sub>&#x2609;</sub>')
    }
    return(textOut);
}
BHBubble.prototype.tNold = function(key){
    // translate numbers
    if (this.langdict.hasOwnProperty("numbers")){
        ndict=this.langdict.numbers;
        newNum='';
        for (n=0;n<key.length;n++){
            if (ndict.hasOwnProperty(key[n])){
                newNum = newNum + ndict[key[n]];}
            else{newNum = newNum + key[n];}
        }
        return newNum;
    }
    return key;
}
BHBubble.prototype.tN = function(key){
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
BHBubble.prototype.init = function(){
    // initialise parameters (only called on load)
    this.fillcolor2 = d3.scale.linear().domain([1,2,3])
            .range([d3.rgb("#48c7e9"), d3.rgb("#67c18d"), d3.rgb('#f68d69')])
    this.textcolor2 = d3.scale.linear().domain([1,2,3])
            .range([d3.rgb("#000000"), d3.rgb("#000000"),d3.rgb('#000000')])
    this.cVals={LVT:1,GW:2,Xray:3};
    // var cValue = function(d){if(d.method=="GW"){return 1;}else{return 2;};};
    this.cValue = function(d){return this.cVals[d.method]};
    //define comparitor sort function(blank for null)
    this.sort = "gwfirst";
    this.valueCol='massBHsq';
    this.filterType="";
    this.displayFilter="nofin";
    this.langdir = 'lang/';
    d3.select('#hdr h1').html(this.tl("%text.bub.page.title%"));
    this.mergeDuration = 1000;
    //set name column
    this.nameCol = (this.nameCols.hasOwnProperty(this.lang)) ? this.nameCols[this.lang] : "name";
}
BHBubble.prototype.makeSvg = function(){
    // make initial elements
    var bh=this;
    // .style("opacity", 0);

    this.infopanelbg = d3.select("body").append("div")
        .attr("class","infopanelbg popup-bg")
        .on("click",function(){bh.hideInfopanel();});
    this.infopanelouter = d3.select("body").append("div")
        .attr("class","infopanelouter pop-outer").attr("id","infopanel-outer")
        .style("top",0.5*this.bubHeight);
    this.infopanel = this.infopanelouter.append("div")
            .attr("class","infopanel");
    this.infopanelouter.append("div").attr("class","infoclose popup-close")
        .html("<img src='img/close.png' title='"+this.tl("%text.gen.close%")+"'>")
        .on("click",function(){bh.hideInfopanel();});
    //replace footer text for language
    footer=document.getElementById("footer-txt");
    footertxt = footer.innerHTML;
    footer.innerHTML = this.tl("%text.bub.footer%");
    //replace svg button text for language
    if (this.langdict["meta.alphabet"]!="Roman"){
        document.getElementById("generate").style.display = "none";
    }
    document.getElementById("generate").innerHTML=this.tl("%text.bub.save.svg%");

}
BHBubble.prototype.scalePage = function(){
    // Set scale of elements given page size
    this.pgWidth=document.getElementById(this.holderid).offsetWidth;
    this.pgHeight=document.getElementById(this.holderid).offsetHeight;
    this.pgAspect = this.pgWidth/this.pgHeight;
    if (this.pgAspect>1){this.controlLoc='right'}else{this.controlLoc='bottom'}
    //apply classes accordingly
    footer = document.getElementById("footer");
    this.full = document.getElementById("full");
    this.bubcont = document.getElementById("svg-container");
    if (this.controlLoc=='right'){
        footer.classList.add("right");
        footer.classList.remove("bottom");
        this.bubcont.classList.add("right");
        this.bubcont.classList.remove("bottom");
        // bubcont.style.height = this.svgSize+"px";
        this.full.classList.add("right");
        this.full.classList.remove("bottom");
        // this.holder.style.height = this.svgSize+"px";
    }else{
        footer.classList.add("bottom");
        footer.classList.remove("right");
        this.bubcont.classList.add("bottom");
        this.bubcont.classList.remove("right");
        // bubcont.style.height = this.pgWidth+"px";
        this.full.classList.add("bottom");
        this.full.classList.remove("right");
        this.full.style.eidth = this.pgWidth+"px";
        // bubcont.style.height = this.pgWidth+"px";
    }
    if (this.controlLoc=='right'){
        // this.full.setAttribute("style","width:"+(this.bubWidth+this.contWidth)+"px");
        this.bubHeight = document.getElementById("svg-container").offsetHeight;
        this.bubWidth = this.bubHeight;
        this.svgSize=Math.min(this.bubWidth,this.bubHeight);
    }else{
        this.bubHeight = document.getElementById("svg-container").offsetHeight;
        this.bubWidth = document.getElementById("svg-container").offsetWidth;
        // console.log(this.bubWidth,this.bubHeight)
        this.svgSize=Math.min(this.bubWidth,this.bubHeight);
    }
}
BHBubble.prototype.addTooltips = function(){
    this.tooltip = d3.select("body").append("div")
        .attr("class", "tooltip reloadable");
    this.conttooltip = d3.select("body").append("div")
        .attr("class", "conttooltip reloadable");
}

BHBubble.prototype.comparitor = function(sort){
    // Define comparitor (for sorting positions of black holes)
    bh=this;
    // console.log(this,this.sort);
    if (sort=="random"){
        // random sorting
        return function(a,b){
            return a.value * Math.random()- b.value*Math.random();};
    }else if(sort=="forward"){
        // keep input order (in table)
        return function(a,b){return a.value - b.value;};
    }else if(sort=="reverse"){
        // reverse the input order (in table)
        return function(a,b){return b.value - a.value;};
    }else if(sort=="gwfirst"){
        // GW & LVT on outside of Xray binaries, otherise keep order of input
        return function(a,b){
            if (((a.method=='Xray')&&(b.method=='Xray'))||((a.method!='Xray')&&(b.method!='Xray'))){return b.num-a.num;}
            else if((a.method=='GW')||(a.method=='LVT')){return 1000;}
            else{return -1000;}
        }
    }else{
        // keep input order (but reverses order on replot!?)
        return null;
    }
}

BHBubble.prototype.filterFn = function(filterType){
    // define filter function
    if (filterType=="nofin"){
        return function(d){
            // console.log(d.name,(d.BHtype!="final"),(!d.children),((d.BHtype!="final")&&(!d.children)));
            return ((d.BHtype!="%data.bub.type.final%")&&(!d.children));};
    }else if(filterType=="noinit"){
        return function(d){
            // console.log(d.name,(d.BHtype!="final"),(!d.children),((d.BHtype!="final")&&(!d.children)));
            return ((d.BHtype!="%data.bub.type.primary%")&&(d.BHtype!='%data.bub.type.secondary%')&&(!d.children));};
    }else{
        // console.log('filter',d.name,d.children);
        return function(d){
            // console.log(d.name,(!d.children));
            return !d.children;};
    }
}
//define tooltip text
BHBubble.prototype.filterData = function(data,filterType){
    //filter data (OBSOLETE)
    var idxRem=[];
    if (filterType=="nofin"){
        data.forEach(function(d){
            if(d.BHtype=="%data.bub.type.final%"){
                // console.log('nofin removing',d.name);
                idxRem.push(data.indexOf(d));
            }
        });
    }else if (filterType=="noinit"){
        data.forEach(function(d){
            if((d.BHtype=="%data.bub.type.primary%")||(d.BHtype=="%data.bub.type.secondary%")){
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
BHBubble.prototype.dataLoaded = function(){
    // check 2 data files and language file are loaded
    if ((this.nloaded>=2) && (this.langloaded)){
        return(true);
    }else{
        return(false);
    }
}
BHBubble.prototype.loadData = function(){
    //load data - then call next functions
    var bh=this;

    // this.inputFileGwDefault="csv/bhcat_gw.csv"
    // if (this.langdict.hasOwnProperty('inputFile')){
    //     this.inputFileGw="csv/"+this.langdict.inputFile;
    // }else{
    //     this.inputFileGw=this.inputFileGwDefault;
    // }
    if (this.urlVars.infile){
        alert('"infile" variable is obsolete. Please use "eventsFile" instead.');
    }

    // set input file for GW events
    this.inputFileEventsDefault="json/events.json"
    if (this.langdict.hasOwnProperty('eventsFile')){
        this.inputFileEvents="json/"+this.langdict.inputFile;
    }else{
        this.inputFileEvents=this.inputFileEventsDefault;
    }
    if (this.urlVars.eventsFile){
        this.inputFileEvents=this.urlVars.eventsFile;
    }

    // set input file for xray binaries
    this.inputFileXray="csv/bhcat_xray.csv";
    if (this.urlVars.xrayFile){
        this.inputFileXray=this.urlVars.xrayFile;
    }
    // set loaded counter
    bh.nloaded=0
    if (this.urlVars.debug){console.log(this.inputFileEvents);}

    // read in GW data and reformat
    d3.json(this.inputFileEvents,function(error,jsonIn){
        if (error){
            if (bh.inputFileEvents==bh.inputFileEventsDefault){
                alert("Fatal error loading input file: '"+bh.inputFileEvents+"'. Sorry!")
            }else{
                alert("Problem loading input file: '"+bh.inputFileEvents+"'. Reverting to default '"+bh.inputFileEventsDefault+"'.");
                window.location.replace(bh.makeUrl({'eventsFile':null}));
            }
        }
        if (jsonIn.data){
            dataJson=jsonIn.data;
        }else if(jsonIn.events){
            dataJson=jsonIn.events;
        }
        links=jsonIn.links;
        data = [];
        nametr={};
        for (i in dataJson){
            dj=dataJson[i]
            pri=[]
            sec=[]
            fin=[]
            pri={
                name:i+'-A',
                compType:'%data.bub.comp.bh%',
                parentName:i,
                BHtype:'%data.bub.type.primary%',
            }
            sec={
                name:i+'-B',
                compType:'%data.bub.comp.bh%',
                parentName:i,
                BHtype:'%data.bub.type.secondary%',
            }
            fin={
                name:i,
                compMass:'%data.bub.comp.none%',
                compType:'%data.bub.comp.none%',
                parentName:'',
                BHtype:'%data.bub.type.final%',
            }
            massbfn=function(m){
                if((m.best)&&(m.err)){return m.best}
                else if(m.lim){return 0.5*(m.lim[0]+m.lim[1])}
                else if(m.lower){return m.lower}
                else if(m.upper){return m.upper}
                else{return m[0]}
            }
            massefn=function(m){
                if((m.best)&&(m.err)){return 'e'+parseFloat(m.err[1])+'-'+
                    parseFloat(m.err[0]);}
                else if(m.lim){return 'e'+parseFloat(Math.min.apply(Math,m.err))+'-'+
                    parseFloat(Math.max.apply(Math,m.err));}
                else if(m.lower){return '>'+parseFloat(m.lower)}
                else if(m.upper){return '<'+parseFloat(m.upper)}
                else{return'e'+parseFloat(m[2])+'-'+
                    parseFloat(m[1]);}
            }
            distfn=function(d){
                if((d.best)&&(d.err)){return (Math.round(3.26*(d.best-d.err[0])/100)*100)+
                '-'+(Math.round(3.26*(d.best+d.err[1])/100)*100);}
                else if(d.lim){return (Math.round(3.26*(Math.min.apply(Math,d.lim)/100)*100)+
                '-'+(Math.round(3.26*(Math.max.apply(Math,d.lim)/100)*100)));}
                else if(d.lower){return '>'+parseFloat(d.lower)}
                else if(d.upper){return '<'+parseFloat(d.upper)}
                else{return (Math.round(3.26*(d[0]-d[1])/100)*100)+
                    '-'+(Math.round(3.26*(d[0]+d[2])/100)*100);}
            }
            // if ((dj.M1.best)&&(dj.M1.err)){
            //     // use M1.best, M1.err
            //     massbfn=function(m){return m.best}
            //     massefn=function(m){return'e'+parseFloat(m.err[1])+'-'+
            //         parseFloat(m.err[0]);}
            //     distfn=function(d){return (Math.round(3.26*(d.best-d.err[0])/100)*100)+
            //         '-'+(Math.round(3.26*(d.best+d.err[1])/100)*100);}
            // }if (dj.M1.lim){
            //     // use M1.best, M1.err
            //     massbfn=function(m){return 0.5*(m.err[0]+m.err[1])}
            //     massefn=function(m){return'e'+parseFloat(Math.min.apply(Math,m.err))+'-'+
            //         parseFloat(Math.max.apply(Math,m.err));}
            //     distfn=function(d){return (Math.round(3.26*(d.best-d.err[0])/100)*100)+
            //         '-'+(Math.round(3.26*(d.best+d.err[1])/100)*100);}
            // }else{
            //     massbfn=function(m){return m[0]}
            //     massefn=function(m){return'e'+parseFloat(m[2])+'-'+
            //         parseFloat(m[1]);}
            //     distfn=function(d){return (Math.round(3.26*(d[0]-d[1])/100)*100)+
            //         '-'+(Math.round(3.26*(d[0]+d[2])/100)*100);}
            // }
            pri.massBH=massbfn(dj.M1);
            pri.massBHerr=massefn(dj.M1);
            pri.compMass=massbfn(dj.M2);
            sec.massBH=massbfn(dj.M2);
            sec.massBHerr=massefn(dj.M2)
            sec.compMass=massbfn(dj.M1);
            fin.massBH=massbfn(dj.Mfinal);
            fin.massBHerr=massefn(dj.Mfinal);
            distance=distfn(dj.DL);
            // }else{
            //     pri.massBH=dj.M1[0];
            //     pri.massBHerr='e'+parseFloat(dj.M1[2])+'-'+
            //         parseFloat(dj.M1[1]);
            //     pri.compMass=dj.M2[0];
            //     sec.massBH=dj.M2[0];
            //     sec.massBHerr='e'+parseFloat(dj.M2[2])+'-'+
            //         parseFloat(dj.M2[1]);
            //     sec.compMass=dj.M1[0];
            //     fin.massBH=dj.Mfinal[0];
            //     fin.massBHerr='e'+parseFloat(dj.Mfinal[2])+'-'+
            //         parseFloat(dj.Mfinal[1]);
            //     distance=(Math.round(3.26*(dj.DL[0]-dj.DL[1])/100)*100)+
            //         '-'+(Math.round(3.26*(dj.DL[0]+dj.DL[2])/100)*100);
            // }
            if (i[0]=='G'){method='GW'}
            else if (i[0]=='L'){method='LVT'}
            paper='-';
            if (links[i]){
                if (links[i].DetPaper){
                    paper='<a target="_blank" href="'+
                        links[i].DetPaper.url+'">'+
                        links[i].DetPaper.text+'</a>';
                }else{
                    for (p in links[i]){
                        if ((links[i][p].text) && (links[i][p].url)){
                            if (links[i][p].text.search("Paper")>=0){
                                console.log(i,links[i][p].text,links[i][p].text.search("Paper"))
                                if (links[i][p].citation){
                                    paper='<a target="_blank" href="'+
                                        links[i][p].url+'">'+
                                        links[i][p].citation+'</a>';
                                }else{
                                    aper='<a target="_blank" href="'+
                                        links[i][p].url+'">'+
                                        links[i][p].text+'</a>';
                                }
                            }
                        }
                    }
                }
            }
            binType='%data.bub.type.bbh%';
            period='';
            loc='%data.bub.loc.extragalactic%'
            refcompmass='';
            refcomp='';
            refper='';
            evs={pri:pri,sec:sec,fin:fin}
            for (b in evs){
                evs[b].method=method;
                evs[b].period=period;
                evs[b].location=loc;
                evs[b].distance=distance;
                evs[b].binType=binType;
                evs[b].refbhmass=paper;
                evs[b].refcompmass=refcompmass;
                evs[b].refcomp=refcomp;
                evs[b].refper=refper;
            }
            if (dj.type.best=='BBH'){
                data.push(sec);
                data.push(fin);
                data.push(pri);
            }
        }
        data= bh.filterData(data,bh.filterType);
        bh.dataGw = data;
        bh.nloaded++;
        if (bh.urlVars.debug){console.log('loaded: '+bh.inputFileEvents)}
        //call next functions
        if (bh.dataLoaded()){
            bh.formatData(bh.valueCol)
            bh.drawBubbles();
        }else{
            if (bh.urlVars.debug){console.log('not ready yet')}
        }
    });

    // read in Xray data
    d3.csv(this.inputFileXray, function(error, data){
        if (error){alert("Fatal error loading input file: '"+bh.inputFileXray+"'. Sorry!")}
        data= bh.filterData(data,bh.filterType);
        for (i in data){
            dx=data[i]

        }
        bh.dataXray = data;
        bh.nloaded++;
        if (bh.urlVars.debug){console.log('loaded: '+bh.inputFileXray)}
        //call next functions
        if (bh.dataLoaded()){
            bh.formatData(bh.valueCol)
            bh.drawBubbles();
        }else{
            if (bh.urlVars.debug){console.log('not ready yet')}
        }
    })
    // d3.csv(this.inputFileGw, function(error, data){
    //     if (error){
    //         if (bh.inputFileGw==bh.inputFileGwDefault){
    //             alert("Fatal error loading input file: '"+bh.inputFileGw+"'. Sorry!")
    //         }else{
    //             alert("Problem loading input file: '"+bh.inputFileGw+"'. Reverting to default '"+bh.inputFileGwDefault+"'.");
    //             window.location.replace(bh.makeUrl({'infile':null}));
    //         }
    //     }
    //     data= bh.filterData(data,bh.filterType);
    //     bh.dataGwOld = data;
    //     // bh.nloaded++;
    //     if (bh.urlVars.debug){console.log('loaded: '+bh.inputFileGw)}
    //     //call next functions
    //     if (bh.dataLoaded()){
    //         bh.formatData(bh.valueCol)
    //         bh.drawBubbles();
    //     }else{
    //         if (bh.urlVars.debug){console.log('not ready yet')}
    //     }
    // })

}
BHBubble.prototype.formatData = function(valueCol){
    // Calculate errors and make links between black hole mergers
    var bh=this;
    bh.data=[]
    for (i in bh.dataGw){bh.data.push(bh.dataGw[i]);}
    for (i in bh.dataXray){bh.data.push(bh.dataXray[i]);}
    //convert numerical values from strings to numbers
    //bubbles needs very specific format, convert data to this.
    this.data.forEach(function(d){
        d.massBH = +d.massBH;
        d.massBHsq = Math.pow(d.massBH,2);
        if (d.massBHerr[0]=='e'){
            errcode=d.massBHerr.split('e')[1];
            errcode=errcode.split('-');
            d.massBHplus = +errcode[0] + d.massBH;
            d.massBHminus = -errcode[1] + d.massBH;
            d.massBHstr = bh.tN(parseFloat(d.massBHminus.toFixed(1)))+' - '+
                                bh.tN(parseFloat(d.massBHplus.toFixed(1)));
            // console.log('lim:',d.massBHerr,errcode,d.massBHstr);
        }else if(d.massBHerr[0]=='r'){
            errcode=d.massBHerr.split('r')[1];
            errcode=errcode.split('-');
            d.massBHplus = +errcode[1];
            d.massBHminus = +errcode[0];
            d.massBHstr = bh.tN(parseFloat(d.massBHminus.toFixed(1)))+' - '+
                                bh.tN(parseFloat(d.massBHplus.toFixed(1)));
            // console.log('range:',d.massBHerr,errcode,d.massBHstr);
        }else if(d.massBHerr[0]=='>'){
            errcode=d.massBHerr.split('>')[1]
            d.massBHplus = Infinity;
            d.massBHminus = +errcode;
            d.massBHstr = '>'+bh.tN(parseFloat(d.massBHminus.toFixed(1)));
            // console.log('min:',d.massBHerr,errcode,d.massBHstr);
        }else if(d.massBHerr[0]=='<'){
            errcode=d.massBHerr.split('<')[1]
            d.massBHplus = +errcode;
            d.massBHminus = 0;
            d.massBHstr = '<'+bh.tN(parseFloat(d.massBHplus.toFixed(1)));
            // console.log('max:',d.massBHerr,errcode,d.massBHstr);
        }else if(d.massBHerr[0]=='~'){
            errcode=d.massBHerr.split('~')[1];
            d.massBHplus = +errcode;
            d.massBHminus = +errcode;
            d.massBHstr = bh.tl("%data.bub.approx%")+' '+bh.tN(parseFloat(d.massBHplus.toFixed(1)));
        }else{if (this.urlVars.debug){console.log('Data format err:',d.massBHerr,d);}}
        if ((bh.nameCol!="name")&&(d.binType=='%data.bub.type.bbh%')){
            this.names={"GW":"%data.bub.name.GW%",
                "LVT":"%data.bub.name.LVT%",
                "-A":"%data.bub.name.A%",
                "-B":"%data.bub.name.B%"}
            nc=bh.nameCol;
            rename=/([A-Z]*)([0-9]*)([-A-Z]*)/;
            tr=rename.exec(d.name)
            d[nc]=bh.tl(this.names[tr[1]]+bh.tN(tr[2])+this.names[tr[3]])
        }
    });
    this.data = this.data.map(function(d){d.value=+d[valueCol];return d;})
    // data = data.map(function(d){
    //     if(!bh.filterFn(bh.filterType)){d="";return d;}else{d.value = +(d["massBH"]); return d; }});
    this.bubble = d3.layout.pack()
        .sort(this.comparitor(this.sort))
        .size([this.svgSize, this.svgSize])
        // .size([this.diameter, this.diameter])
        .padding(15);
    this.nodes = this.bubble.nodes({children:this.data})
        .filter(this.filterFn(this.filterType));
    this.arrows={};
    this.arrowpos = {};
    this.name2id=function(name){
        return name.replace('+','').replace('(','').replace(')','').replace('-','');
    };
    this.data.forEach(function(d){
        // console.log(d);
        d.id = bh.name2id(d.name);
        // console.log(d.name,d.id);
        bh.arrowpos[d.id]={x:d.x,y:d.y,r:d.r,c:bh.fillcolor2(bh.cValue(d)),type:d.BHtype};
        // if ((d.method=="GW")||(d.method=="LVT")){
        //     bh.arrowpos[d.id]={x:d.x,y:d.y,r:d.r,c:bh.fillcolor2(bh.cValue(d)),type:d.BHtype};
        // }
        if (d.compType=="%data.bub.comp.bh%"){
            bh.arrows[d.id]=[d.id,bh.name2id(d.parentName)];
        }
    });
}
BHBubble.prototype.getText = function(d){
    // get text contents of a BH element given a displayFilter
    bh=this;
    if (d.r<15){
        return "";
    }else if (
        ((d.BHtype=="%data.bub.type.primary%")||(d.BHtype=="%data.bub.type.secondary%"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))||
        ((d.BHtype=="%data.bub.type.final%"))&&((bh.filterType=="nofin")||(bh.displayFilter=="nofin"))
    ){
        return "";
    }else{
        return(bh.getUtf8(d[bh.nameCol]));
    }
}
BHBubble.prototype.getName = function(d){
    if (this.alphabet=="Roman"){
        return(d.name);
    }else{
        return(bh.getUtf8(d[bh.nameCol]));
    }
}
BHBubble.prototype.getUtf8 = function(textIn){
    if (this.alphabet=="Roman"){
        return textIn;
    }else{
        re=/\&\#([0-9]*);/g;
        matches=[];
        var match=re.exec(textIn);
        while (match!=null){
            matches.push(parseInt(match[1]));
            match=re.exec(textIn);
        }
        textOut=textIn;
        if (matches){
            nmatch=matches.length
            for (n in matches){
                mx0='&#'+matches[n]+';';
                // mx1='\u2784';
                mx1=String.fromCharCode(matches[n]);
                textOut=textOut.replace(mx0,mx1);
            }
        }
        // console.log(textIn,"->",textOut);
        return(textOut);
    }
}
BHBubble.prototype.getRadius = function(d){
    // get radius of a BH element given a displayFilter
    bh=this;
    if (
        ((d.BHtype=="%data.bub.type.primary%")||(d.BHtype=="%data.bub.type.secondary%"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))||
        ((d.BHtype=="%data.bub.type.final%"))&&((bh.filterType=="nofin")||(bh.displayFilter=="nofin"))
    ){
        return 0;}else{return d.r}
}
BHBubble.prototype.getX = function(d){
    // get Y position of a BH element given a displayFilter
    bh=this;
    if (
        ((d.BHtype=="%data.bub.type.primary%")||(d.BHtype=="%data.bub.type.secondary%"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))
    ){return this.arrowpos[this.arrows[d.id][1]].x;}
    else{return this.arrowpos[d.id].x}
}
BHBubble.prototype.getY = function(d){
    // get Y position of a BH element given a displayFilter
    bh=this;
    if (
        ((d.BHtype=="%data.bub.type.primary%")||(d.BHtype=="%data.bub.type.secondary%"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))
    ){return this.arrowpos[this.arrows[d.id][1]].y;}
        else{return this.arrowpos[d.id].y}
}
BHBubble.prototype.getOpacity = function(d){
    // get opacity of a BH element given a displayFilter
    bh=this;
    var BHtype=d.BHtype;
    // console.log(d);
    if ((this.displayFilter=="nofin")&&(BHtype=="%data.bub.type.final%")){

        return 0;
    }else if((this.displayFilter=="noinit")&&((BHtype=="%data.bub.type.primary%")||BHtype=="%data.bub.type.secondary%")){
        return 0;
    }else{return 1;}
}
BHBubble.prototype.drawBubbles = function(){
    // Add bubbles and legend
    this.svg = d3.select("div#svg-container")
        .append("svg").attr("class", "bubble")
        .attr("width", this.svgSize).attr("height", this.svgSize);

    // console.log("drawBubbles",this.data[0].r);
    var bh=this;

    this.bubbles = this.svg.append("g")
        .attr("transform", "translate(0,0)")
        .attr("width", this.svgSize).attr("height", this.svgSize)
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
        .attr("r", function(d){ return bh.getRadius(d); })
        .attr("cx", function(d){ return bh.getX(d); })
        .attr("cy", function(d){ return bh.getY(d); })
        .attr("id",function(d){return 'bh-circle-'+d.id;})
        .attr("opacity",function(d){return bh.getOpacity(d);})
        .attr("class","bh-circle")
        .style("fill", function(d){return bh.fillcolor2(bh.cValue(d))})
        .on("mouseover", function(d) {bh.showTooltip(d);})
        .on("mouseout", function(d) {bh.hideTooltip(d);})
        .on("click",function(d){bh.showInfopanel(d);});

    //format the text for each bubble

    //add as SVG text item
    this.bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d){return bh.getText(d);})
        .attr("class","bh-circle-text")
        .attr("opacity",function(d){return bh.getOpacity(d)})
        .attr("id",function(d){return "bh-circle-text-"+d.id;})
    d3.selectAll("text")
        .style({
            "fill":function(d){
                if (d.r > (2 * d.r - 8) / this.getComputedTextLength() * 8){
                    return bh.textcolor2(bh.cValue(d));
                }else{
                    return "white";
                }},
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size":function(d) {
                return 0.2*d.r}
                // if (d.name.search('GW')>-1){
                // console.log(d.name,Math.min((2*d.r), (2 * d.r - 8) / this.getComputedTextLength() * 8) + "px" );}
                // return Math.min((2*d.r), (2 * d.r - 8) / this.getComputedTextLength() * 8) + "px"; }
        })
        .on("mouseover", function(d) {bh.showTooltip(d);})
        .on("mouseout", function(d) {bh.hideTooltip(d);})
        .on("click",function(d){bh.showInfopanel(d);});
    d3.selectAll("text")
        .text(function(d){ return bh.getText(d); });

    // replace text and circles with display values
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
    if ((this.alphabet=="Roman")||(this.alphabet!="Roman")){
        //add as SVG text object
        this.legend.append("text")
            .attr("x", 36)
            .attr("y", 21)
            .attr("dy", ".35em")
            .style("font-size","1.2em")
            .style("fill","#fff")
            .style("text-anchor", "start")
            .text(function(d){return bh.legenddescs[d];});
    }else{
        // add as HTML object
        // OBSOLETE now everything is utf-8
        this.legend.append("foreignObject")
            .attr("x", 36)
            .attr("y", 15)
            .attr("width",200)
            .attr("height",18)
            //   .attr("dy", ".35em")
            .append("xhtml:body")
            .style({"font-size":"1.2em","color":"#fff","text-align":"left",
                "background-color":"rgba(0,0,0,0)"})
            .style("fill","#fff")
            //   .style("text-anchor", "start")
            .html(function(d){return "<p>"+bh.legenddescs[d]+"<p>";});
    }
}
BHBubble.prototype.addLang = function(){
    this.langs = {
        "cy":{code:"cy",name:"Cymraeg (cy)"},
        "de":{code:"de",name:"Deutsch (de)"},
        "en":{code:"en",name:"English (en)"},
        "es":{code:"es",name:"Español (es)"},
        "fr":{code:"fr",name:"Francais (fr)"},
        "hu":{code:"hu",name:"Magyar (hu)"},
        "or":{code:"or",name:"ଓଡ଼ିଆ (or)"},
        "pl":{code:"pl",name:"Polski (pl)"},
        "zhhk":{code:"zhhk",name:"繁體中文(香港) (zh-hk)"}
    }
    var bh=this;
    this.langdiv = d3.select("#lang-button");
    this.langlab = d3.select("#lang-label");
    this.langlab.html(bh.langs[bh.lang].code);
    this.langdiv.on("click",function(){bh.showLang();});
    // this.langlist=document.getElementById("lang-list")
    this.langblock=document.getElementById("lang-block");
    d3.select("#lang-title").html(bh.tl("%text.gen.lang%"));
    for(lang in this.langs){
        langspan=document.createElement("span");
        var langtxt="";
        langtxt = langtxt + bh.langs[lang].name;
        langspan.classList.add("lang-item");
        if(bh.langs[lang].code==bh.lang){
            langspan.classList.add("current");
        }
        langspan.innerHTML = langtxt;
        langspan.setAttribute("id",bh.langs[lang].code);
        langspan.addEventListener("click",function(){
            bh.newlang=this.getAttribute("id");
            if (bh.urlVars.debug){console.log('replotting new language:',bh.lang,"->",bh.newlang)}
            d3.selectAll('.reloadable').remove();
            bh.svg.selectAll('.legend').remove();
            bh.loadLang(bh.newlang);
            // window.location.href = bh.makeUrl({lang:this.getAttribute("id")});
        })
        // bh.langlist.appendChild(langspan);
        bh.langblock.appendChild(langspan);
    }
    document.getElementById("lang-label").addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,bh.tl("%text.gen.lang%"));
    });
    document.getElementById("lang-label").addEventListener("mouseout",function(){
        bh.hideControlTooltip();
    });
    document.getElementById("lang-icon").addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,bh.tl("%text.gen.lang%"));
    });
    document.getElementById("lang-icon").addEventListener("mouseout",function(){
        bh.hideControlTooltip();
    });
    d3.selectAll("#lang-close")
        .on("click",function(){bh.hideLang();});
    d3.select("#lang-close > img").attr("title",this.tl("%text.gen.close%"));
    d3.select("#lang-bg").on("click",function(){bh.hideLang();});
}
BHBubble.prototype.toggleLangList = function(){
    $("#lang-button").toggleClass("show");
    $("#lang-label").toggleClass("show");
}
BHBubble.prototype.addHelp = function(){
    // set up help divs
    var bh=this;
    this.anim={
        merger:{icon:"img/merger.svg",
            tt:this.tl("%text.bub.help.merge%")},
        unmerger:{icon:"img/unmerger.svg",
            tt:this.tl("%text.bub.help.unmerge%")},
        showall:{icon:"img/showall.svg",
            tt:this.tl("%text.bub.help.showall%")}
    }
    this.scales={
        scalesize:{icon:"img/scalesize.svg",
            tt:this.tl("%text.bub.help.scalesize%")},
        scalemass:{icon:"img/scalemass.svg",
            tt:this.tl("%text.bub.help.scalemass%")},
    }
    this.helpbg = d3.select('#help-bg');
    this.helpouter = d3.select('#help-outer');
    this.helpinner = d3.select('#help-inner');
    // add click actions
    helpicon = document.getElementById('help-icon');
    helpicon.addEventListener("click",function(){bh.showHelp();})
    helpicon.addEventListener("mouseover",function(e){
            bh.showControlTooltip(e,"%text.gen.help%");})
    helpicon.addEventListener("mouseout",function(e){
            bh.hideControlTooltip();});
    this.helpbg.on("click",function(){bh.hideHelp();});
    this.helpouter
        .style("top","200%");
    d3.selectAll("#help-close")
        .on("click",function(){bh.hideHelp();});
    d3.select("#help-close > img").attr("title",this.tl("%text.gen.close%"));
    // build help text
    this.helpinner.append("div")
        .attr("class","popup-title reloadable")
        .html(this.tl("%text.bub.mergers%"));
    for (cont in this.anim){
        helpcont=this.helpinner.append("div")
            .attr("class","help-cont reloadable")
            .attr("id","help-"+cont);
        helpcont.append("img")
            .attr("class","anim")
            .attr("src",this.anim[cont].icon);
        helpcont.append("div")
            .attr("class","help-text")
            .html(this.anim[cont].tt);
    }
    this.helpinner.append("div")
        .attr("class","popup-title reloadable")
        .html(this.tl("%text.bub.scale%"));
    for (cont in this.scales){
        helpcont=this.helpinner.append("div")
            .attr("class","help-cont reloadable")
            .attr("id","help-"+cont);
        helpcont.append("img")
            .attr("class","scale")
            .attr("src",this.scales[cont].icon);
        helpcont.append("div")
            .attr("class","help-text")
            .html(this.scales[cont].tt);
    }
    helptech=this.helpinner.append("div")
        .attr("class","help-cont reloadable")
        .attr("id","help-tech");
    helptech.append("div")
        .attr("class","help-text reloadable")
        .html(this.tl("%text.bub.help.tech%"));
}
BHBubble.prototype.addShare = function(){
    // add click actions
    var bh=this;
    shareicon = document.getElementById('share-icon');
    console.log('addShare')
    shareicon.addEventListener("click",function(){bh.showShare();})
    shareicon.addEventListener("mouseover",function(e){
            bh.showControlTooltip(e,"%text.gen.share%");})
    shareicon.addEventListener("mouseout",function(e){
            bh.hideControlTooltip();});
    d3.select('#share-bg').on("click",function(){bh.hideShare();});
    // d3.select('#share-outer').style("top","200%");
    d3.selectAll("#share-close")
        // .html("<img src='img/close.png' title='"+this.tl("%text.gen.close%")+"'>")
        .on("click",function(){bh.hideShare();});
    d3.select("#share-close > img").attr("title",bh.tl("%text.gen.close%"));
    d3.select("#share-title").html(bh.tl("%text.gen.share%"))

}
BHBubble.prototype.controlLabFontSize = function(width,txtCorr){
    // set Label fontsize for control panel
    if (this.controlLoc=='right'){
        return Math.min(width, (width - 8) / 30 * 8);
    }else{
        if (this.pgWidth > 500){
            return Math.min(width, (width - 8) / 35 * 8);
        }else{
            return Math.min(width, (width - 8) / 35 * 8);
        }
    }
    // correct for length of text
}
BHBubble.prototype.addButtons = function(width){
    // Add control buttons
    var bh=this;
    full = document.getElementById("full");
    if (this.controlLoc == 'right'){
        this.divcont = document.createElement('div');
        this.divcont.setAttribute("id","controls");
        this.divcont.classList.add("right");
        this.divcont.classList.remove("bottom");
        full.appendChild(this.divcont);
    }else{
        this.divcont = document.createElement('div');
        this.divcont.setAttribute("id","controls");
        this.divcont.classList.add("bottom");
        this.divcont.classList.remove("right");
        full.insertBefore(this.divcont,full.children[0]);
    }
    this.divcont.classList.add("reloadable")
    //
    spancont = document.createElement('div');
    spancont.className = "control-lab reloadable "+((this.controlLoc == 'right')?'right':'bottom');
    spancont.innerHTML = this.tl("%text.bub.mergers%");
    this.divcont.appendChild(spancont);
    //set font size
    // width=spancont.offsetWidth;
    fontsize=this.controlLabFontSize(spancont.offsetWidth);
    // correct for text length
    fontscale = Math.sqrt("Mergers".length/this.tl("%text.bub.mergers%").length);
    if (this.langdict.alphabet!="Roman"){fontscale *= Math.sqrt(7);}
    if (fontscale<1){fontsize *= fontscale;}
    spancont.style.fontSize=fontsize+"px";
    //
    // this.divcont.innerHTML('<span>Controls:</span>');
    this.animcont = document.createElement('div');
    this.animcont.className = 'control merge merger reloadable '+((this.controlLoc == 'right')?'right':'bottom');
    if (this.controlLoc == 'right'){this.animcont.width = "80%";}
    else{this.animcont.height = "100%";}
    if (this.displayFilter=="noinit"){this.animcont.classList.add("current");}
    // animcont.style.display = 'inline-block';
    this.divcont.appendChild(this.animcont);
    animimg = document.createElement('img');
    animimg.setAttribute("id","button-merger");
    animimg.setAttribute("src","img/merger.svg");
    // animimg.setAttribute("title",this.tl("%text.bub.help.merger%"));
    animimg.addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,"%text.bub.help.merge%");
    });
    animimg.addEventListener("mouseout",function(){
        bh.hideControlTooltip();
    });
    animimg.addEventListener("click",function(){
        bh.animateMerger();
    });
    this.animcont.appendChild(animimg);
    //
    //unmerger button
    this.animcontun = document.createElement('div');
    this.animcontun.className = 'control merge unmerger reloadable '+((this.controlLoc == 'right')?'right':'bottom');
    if (this.displayFilter=="nofin"){this.animcontun.classList.add("current");}
    // animcontun.style.display = 'inline-block';
    this.divcont.appendChild(this.animcontun);
    animimgun = document.createElement('img');
    animimgun.setAttribute("id","button-unmerger");
    animimgun.setAttribute("src","img/unmerger.svg");
    // animimgun.setAttribute("title",this.tl("%text.bub.help.unmerge%"));
    animimgun.addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,"%text.bub.help.unmerge%");
    });
    animimgun.addEventListener("mouseout",function(){
        bh.hideControlTooltip();
    });
    animimgun.addEventListener("click",function(){
        bh.animateUnMerger();
    });
    this.animcontun.appendChild(animimgun);
    //
    //show all button
    this.animcontall = document.createElement('div');
    this.animcontall.className = 'control merge all reloadable '+((this.controlLoc == 'right')?'right':'bottom');
    if (this.displayFilter=="all"){this.animcontall.classList.add("current");}
    this.divcont.appendChild(this.animcontall);
    animimgall = document.createElement('img');
    animimgall.setAttribute("id","button-showall");
    animimgall.setAttribute("src","img/showall.svg");
    // animimgall.setAttribute("title",this.tl("%text.bub.help.showall%"));
    animimgall.addEventListener("mouseover",function(e){bh.showControlTooltip(e,"%text.bub.help.showall%");});
    animimgall.addEventListener("mouseout",function(){bh.hideControlTooltip();});
    animimgall.addEventListener("click",function(){bh.showAll();});
    this.animcontall.appendChild(animimgall);
    //
    //Scale label
    spancontscale = document.createElement('div');
    spancontscale.className = "control-lab reloadable "+((this.controlLoc == 'right')?'right':'bottom');
    // scaletext = document.createTextNode(this.tl("%text.bub.scale%"));
    // spancontscale.appendChild(scaletext);
    spancontscale.innerHTML = this.tl("%text.bub.scale%");
    this.divcont.appendChild(spancontscale);
    //set font size
    fontsize=this.controlLabFontSize(spancontscale.offsetWidth);
    //scale by text length
    fontscale = Math.sqrt("Scale".length/this.tl("%text.bub.scale%").length);
    if (this.langdict.alphabet!="Roman"){fontscale *= Math.sqrt(7);}
    if (fontscale<1){fontsize *= fontscale;}
    spancontscale.style.fontSize=fontsize+"px";

    //
    //scale size button
    this.scalecontsize = document.createElement('div');
    this.scalecontsize.className = 'control scale scale-size reloadable '+((this.controlLoc == 'right')?'right':'bottom');
    if (this.valueCol=="massBHsq"){this.scalecontsize.classList.add("current");}
    // animcontun.style.display = 'inline-block';
    this.divcont.appendChild(this.scalecontsize);
    scaleimgsize = document.createElement('img');
    scaleimgsize.setAttribute("id","button-scale-size");
    scaleimgsize.setAttribute("src","img/scalesize.svg");
    // scaleimgsize.setAttribute("title",this.tl("%text.bub.help.scalesize%"));
    scaleimgsize.addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,"%text.bub.help.scalesize%");
    });
    scaleimgsize.addEventListener("mouseout",function(){
        bh.hideControlTooltip();
    });
    if (this.valueCol!="massBHsq"){
        scaleimgsize.addEventListener("click",function(){bh.replot("massBHsq");}
    );}
    this.scalecontsize.appendChild(scaleimgsize);
    //
    //scale mass button
    this.scalecontmass = document.createElement('div');
    this.scalecontmass.className = 'control scale scale-mass reloadable '+((this.controlLoc == 'right')?'right':'bottom');
    if (this.valueCol=="massBH"){this.scalecontmass.classList.add("current");}
    // animcontun.style.display = 'inline-block';
    this.divcont.appendChild(this.scalecontmass);
    scaleimgmass = document.createElement('img');
    scaleimgmass.setAttribute("id","button-scale-mass");
    scaleimgmass.setAttribute("src","img/scalemass.svg");
    // scaleimgmass.setAttribute("title",this.tl("%text.bub.help.scalemass%"));
    scaleimgmass.addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,"%text.bub.help.scalemass%");
    });
    scaleimgmass.addEventListener("mouseout",function(){
        bh.hideControlTooltip();
    });
    if (this.valueCol!="massBH"){
        scaleimgmass.addEventListener("click",function(){bh.replot("massBH");}
    );}
    this.scalecontmass.appendChild(scaleimgmass);
    //
    if (this.controlLoc=='right'){
        this.contWidth = document.getElementById("controls").offsetWidth;
        this.bubHeight = document.getElementById("svg-container").offsetHeight;
        this.bubWidth = this.bubHeight;
        document.getElementById("full").setAttribute("style","width:"+(this.bubWidth+this.contWidth+30)+"px");
    }else{
        this.bubWidth = document.getElementById("svg-container").offsetWidth;
        this.contWidth = document.getElementById("controls").offsetWidth;
        this.bubHeight = document.getElementById("svg-container").offsetHeight;
        document.getElementById("full").setAttribute("style","width:100%");
    }
}
// BHBubble.prototype.addSvgButtons = function(){
//     this.svg.append("div")
//         .
// }
BHBubble.prototype.animateMerger = function(){
    // Hide initial black holes in mergers
    bh=this;
    this.displayFilter = "noinit";
    this.animcontun.classList.remove("current");
    this.animcont.classList.add("current");
    this.animcontall.classList.remove("current");
    this.doAnimation();
}
BHBubble.prototype.animateUnMerger = function(){
    // Hide final black holes in mergers
    bh=this;
    this.displayFilter = "nofin";
    this.animcont.classList.remove("current");
    this.animcontun.classList.add("current");
    this.animcontall.classList.remove("current");
    this.doAnimation();
}
BHBubble.prototype.showAll = function(){
    // Show all black holes
    bh=this;
    this.displayFilter = "all";
    this.animcontun.classList.remove("current");
    this.animcont.classList.remove("current");
    this.animcontall.classList.add("current");
    this.doAnimation();
}
BHBubble.prototype.doAnimation = function(){
    var bh=this;
    for (id in this.arrows){
        //move intialcircles
        d3.select('#bh-circle-'+this.arrows[id][0])
            .transition().duration(this.mergeDuration)
            .attr("cx",function(d){return bh.getX(d);})
            .attr("cy",function(d){return bh.getY(d);})
            .attr("r",function(d){return bh.getRadius(d);})
            .style("fill", function(d){return bh.fillcolor2(bh.cValue(d))})
            .attr("opacity",function(d){return bh.getOpacity(d);});
        //move final circles
        d3.select('#bh-circle-'+this.arrows[id][1])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("r",function(d){return bh.getRadius(d)})
            .attr("opacity",function(d){return bh.getOpacity(d);})
            .style("fill", function(d){return bh.fillcolor2(bh.cValue(d))});

        //hide initial text
        d3.select('#bh-circle-text-'+this.arrows[id][0])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("opacity",function(d){return bh.getOpacity(d);})
            .text(function(d){ return bh.getText(d); });
        //show final text
        d3.select('#bh-circle-text-'+this.arrows[id][1])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("opacity",function(d){return bh.getOpacity(d);})
            .text(function(d){ return bh.getText(d); })
            .style({
                "fill":function(d){
                        return bh.textcolor2(bh.cValue(d));
                },
                "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                "font-size":function(d) {return 0.2*d.r}
            });
    }
}
BHBubble.prototype.conttttext = function(text){
    //text of control panel tool-tip
    text =  this.tl(text);
    return text;
}
BHBubble.prototype.showControlTooltip = function(e,text){
    // console.log('2',d.name,tooltip);
    bh=this;
    var e;
    getLeft = function(e){
        if (e.clientX > window.innerWidth/2){
            return (e.clientX - bh.conttooltip.property("offsetWidth"))+"px";
        }else{return (e.clientX) + "px";}
    }
    getTop = function(e){
        return (e.clientY) + "px";
    }
    this.conttooltip.transition()
       .duration(200)
       .style("opacity",0.9);
    this.conttooltip.html(this.conttttext(text));
    this.conttooltip.style({"left":getLeft(e),"top":getTop(e)});
    //    .style("width","25%").style("height","auto");
}
BHBubble.prototype.hideControlTooltip = function(d) {
    this.conttooltip.transition()
        .duration(500).style("opacity", 0);
}
BHBubble.prototype.tttext = function(d){
    //create tooltip text
    text =  "<span class='name'>"+this.getName(d)+"</span>";
    //mass already has numbers converted
    text = text + "<span class='info'>%data.bub.mass%: "+d["massBHstr"]+" %data.mass.unit.msun%</span>";
    if(d["method"]=='Xray'){
        // text = text+ "<span class='info'>X-ray detection</span>";
        text = text + "<span class='info'>"+d.binType+"</span>";
        // text = text+ "<span class='info'>"+this.tl("%data.bub.comp%")+": "+this.tl(this.comps[d.compType])+"</span>";
    }else{
        text = text+ "<span class='info'>"+d.binType+" ("+d.BHtype+")</span>";
    }
    // text = text+ "<span class='info'>"+this.tl("%data.bub.info.location%")+": "+this.tl(this.locs[d.location])+"</span>";
    return this.tl(text);
}
//set tooltip functions
BHBubble.prototype.showTooltip = function(d){
    // console.log('2',d.name,tooltip);
    bh=this;
    getLeft = function(d){
        // if (d.x > bh.svgSize/2){return (d3.event.pageX - 0.25*bh.svgSize - 10) + "px";}
        // else{return (d3.event.pageX + 10) + "px";};
        return (d3.event.pageX) + "px";
    }
    getTop = function(d){
        // if (d.y > bh.svgSize/2){return (d3.event.pageY - 0.1*bh.svgSize - 10) + "px";}
        // else{return (d3.event.pageY + 10) + "px";};
        return (d3.event.pageY) + "px";
    }
    this.tooltip.transition()
       .duration(200)
       .style("opacity",0.9);
    this.tooltip.html(this.tttext(d))
       .style("left", getLeft(d)).style("top", getTop(d));
    //    .style("width","auto").style("height","auto");
    this.svg.select('#hl'+d.id)
        .transition(500)
        .attr("stroke-opacity",function(d){return bh.getOpacity(d)});
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
    text =  "<span class='name'>"+this.getName(d)+"</span>";
    if(d["method"]=='Xray'){
        text=text+"<span class='info'><b>%data.bub.mass%</b>: "+d["massBHstr"]+" %data.mass.unit.msun%";
        if (d.refbhmass!='-'){
            rbhm=rx;
            rx++;
            rbhmu=true
            text = text + " <sup>["+this.tN(rbhm)+"]</sup></span>";
        }else{
            rbhm=false;
            text = text+"</span>"
        }
        text = text + "<span class='info'><b>%data.bub.type%</b>: "+d.binType+"</span>";
        // text = text+ "<span class='info'>X-ray detection</span>";
        //companion
        text = text+ "<span class='info'><b>"+this.tl("%data.bub.comp%")+"</b>: "+
            d.compType+" ("+this.tN(d.compMass)+" %data.mass.unit.msun%) ";
        if (d.refcomp!="-"){
            if (d.refcomp==d.refbhmass){rct=rbhm;rctu=false;}
            else{rct=rx;rx++;rctu=true;}
            text = text + " <sup>["+this.tN(rct)+"]</sup>";
        }else{rct=false;}
        if (d.refcompmass!="-"){
            if (d.refcompmass==d.refcomp){rcm=rct;rcmu=false}
            else if(d.refcompmass==d.refbhmass){rcm=rbhm;rcmu=false}
            else{rcm=rx;rx++;rcmu=true}
            if (rcm!=rct){text = text + " <sup>["+this.tN(rcm)+"]</sup>";}
            console.log(d.refcompmass)
        }else{rcm=false;}
        text = text+"</span>";
        //period mass
        text = text+ "<span class='info'><b>%data.bub.period%</b>: "+this.tN(d.period)+
        " %data.bub.period.days%</sub>";
        if (d.refper!="-"){
            if (d.refper==d.refbhmass){rper=rbhm;rperu=false;}
            else if(d.refper==d.refcomp){rper=rct;rperu=false;}
            else if(d.refper==d.refcompmass){rper=rcm;rperu=false;}
            else{rper=rx;rx++;rperu=true}
            text = text +" <sup>["+this.tN(rper)+"]</sup></span>";
        }else{rper=false;text = text+"</span>"}
        text = text+ "<span class='info'><b>%data.bub.loc%"+"</b>: "+d.location+"</span>";
        if ((rbhm)&&(rbhmu)){text = text + "<span class='ref'>["+this.tN(rbhm)+"] "+d.refbhmass+"</span>"}
        if ((rct)&&(rctu)){text = text + "<span class='ref'>["+this.tN(rct)+"] "+d.refcomp+"</span>"}
        if ((rcm)&&(rcmu)){text = text + "<span class='ref'>["+this.tN(rcm)+"] "+d.refcompmass+"</span>"}
        if ((rper)&&(rperu)){text = text + "<span class='ref'>["+this.tN(rper)+"] "+d.refper+"</span>"}
    }else{
        text = text + "<span class='info'><b>%data.bub.mass%</b>: "+this.tN(d["massBHstr"])+" %data.mass.unit.msun%";
        if (d.refbhmass!='-'){text = text +
            " <sup>["+this.tN(rx)+"]</sup></span>";rbhm=rx;rx++;}
        else{rbhm=false;text = text+"</span>"}
        text = text+ "<span class='info'><b>%data.bub.type%</b>: "+d.binType+
            " ("+d.BHtype+")</span>";
        if (d.compType!="None"){
            text = text+ "<span class='info'><b>%data.bub.comp%</b>: "+
                d.compType+" ("+this.tN(d.compMass)+" %data.mass.unit.msun%)</span>";
        }else{text = text+ "<span class='info'><b>%data.bub.comp%</b>: %data.bub.comp.none%</span>"}
        text = text+ "<span class='info'><b>%data.bub.distance%</b>: "+this.tN(d.distance)+
            " %data.bub.distance.mly%</span>";
        if (rbhm){text = text + "<span class='ref'>["+this.tN(rbhm)+"] "+d.refbhmass+"</span>"}

    }
    return this.tl(text);
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
BHBubble.prototype.showHelp = function(){
    // fade in semi-transparent background layer (greys out image)
    this.helpbg.transition()
      .duration(500)
      .style({"opacity":0.5});
    this.helpbg.style("height","100%");
    //fade in infopanel
    this.helpouter.transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of infopanel
    // this.infopanel.html(this.iptext(d));
    this.helpouter.style("left", "25%").style("top", "25%")
       .style("width","50%");

}
BHBubble.prototype.hideHelp = function(d) {
    // fade out infopanel
    this.helpouter.transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    this.helpouter.style("top","200%");
    // fade out semi-transparent background
    this.helpbg.transition()
      .duration(500)
      .style("opacity",0);
    this.helpbg.style("height",0);
    // d3.selectAll(".info").attr("opacity",0);
}
BHBubble.prototype.showShare = function(){
    // fade in semi-transparent background layer (greys out image)
    var bh=this;
    d3.select('#share-bg').transition()
      .duration(500)
      .style({"opacity":0.5});
    d3.select('#share-bg').style("height","100%");
    //fade in share panel
    d3.select('#share-outer').transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of share panel
    d3.select('#share-outer')
        .style("left", (bh.pgWidth - document.getElementById('share-outer').offsetWidth)/2.)
        .style("top", (bh.pgHeight - document.getElementById('share-outer').offsetHeight)/3.);
    d3.select("#twitter-share-button")
        .attr("href",
            "https://twitter.com/intent/tweet?text="+bh.tl("%share.bub.twitter.text%")+"&url="+
                bh.url.replace("file:///Users/chrisnorth/Cardiff/GravWaves/Outreach/","http%3A%2F%2Fchrisnorth.github.io/").replace(/:/g,'%3A').replace(/\//g,'%2F')+
                "&hashtags="+bh.tl("%share.bub.twitter.hashtag%"));

}
BHBubble.prototype.hideShare = function(d) {
    // fade out infopanel
    d3.select('#share-outer').transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    d3.select('#share-outer').style("top","200%");
    // fade out semi-transparent background
    d3.select('#share-bg').transition()
      .duration(500)
      .style("opacity",0);
    d3.select('#share-bg').style("height",0);
}
BHBubble.prototype.showLang = function(){
    // fade in semi-transparent background layer (greys out image)
    var bh=this;
    d3.select('#lang-bg').transition()
      .duration(500)
      .style({"opacity":0.5});
    d3.select('#lang-bg').style("height","100%");
    //fade in share panel
    d3.select('#lang-outer').transition()
       .duration(500)
       .style("opacity",1);
    // set contents and position of share panel
    d3.select('#lang-outer')
        .style("left", (bh.pgWidth - document.getElementById('lang-outer').offsetWidth)/2.)
        .style("top", (bh.pgHeight - document.getElementById('lang-outer').offsetHeight)/3.);

}
BHBubble.prototype.hideLang = function(d) {
    // fade out infopanel
    d3.select('#lang-outer').transition()
        .duration(500).style("opacity", 0);
    // move infopanel out of page
    d3.select('#lang-outer').style("top","200%");
    // fade out semi-transparent background
    d3.select('#lang-bg').transition()
      .duration(500)
      .style("opacity",0);
    d3.select('#lang-bg').style("height",0);
}
BHBubble.prototype.makeDownload = function(){
    //make SVG download button
    d3.select("#generate")
        .on("click", this.writeDownloadLink);
}

BHBubble.prototype.writeDownloadLink = function(){
    //write download link
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
    this.valueCol = (valueCol) ? valueCol : oldValueCol;
    this.scalePage()
    this.formatData(this.valueCol);
    // this.makeSvg();
    d3.select("svg").remove();
    d3.selectAll(".reloadable").remove();
    this.addHelp();
    this.drawBubbles();
    this.makeDownload();
    this.addButtons();
    this.addTooltips();
}
BHBubble.prototype.makePlot = function(){
    this.init();
    this.addHelp();
    this.addShare();
    this.addLang();
    this.scalePage();
    this.makeSvg();
    this.loadData();
    this.makeDownload();
    this.addButtons();
    this.addTooltips();
}

