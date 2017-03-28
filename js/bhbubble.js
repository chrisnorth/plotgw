// var diameter = Math.min(document.getElementById("bubble-container").offsetWidth,document.getElementById("bubble-container").offsetHeight);
// // document.getElementById("hdr").setAttribute("width",diameter);
// document.getElementById("bubble-container").setAttribute("width",diameter);
// console.log(document.getElementById("hdr"));

function BHBubble(){
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
    if(!this.urlVars.hasOwnProperty("lang")){
        this.urlVars.lang="en";
    }
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
    var reload = (_bh.lang) ? true:false;
    if (this.urlVars.debug){console.log('reload',reload);}
    _bh.lang = lang;
    _bh.langloaded=false;
    if (!lang){
        lang="en";
        if(_bh.urlVars.debug){console.log("default to",lang);}
        _bh.lang = lang;
    };
    var url=this.langdir+lang+'.json';
    // console.log(url);
    // Bug fix for reading local JSON file in FF3
    $.ajaxSetup({async:true,'beforeSend': function(xhr){
        // console.log(this);
        if (xhr.overrideMimeType) xhr.overrideMimeType("text/plain"); },
        datatype:'json',
        success:function(json){}
    });
    // Get the JSON language file amd call "makePlot" on completion
    $.getJSON({url:url,
        beforeSend: function(xhr){
            if (xhr.overrideMimeType){
                xhr.overrideMimeType("application/json");
            }
        },
        dataType: 'json',
        error:function(data){
            alert('Error loading language '+_bh.lang+'. Reverting to English as default');
            if (_bh.urlVars.debug){console.log(data);}
            //navigate to same page, but lang="en"
            // window.location.replace(_bh.makeUrl({'lang':'en'}));
            window.history.pushState({},null,_bh.makeUrl({'lang':'en'}));
            _bh.lang=null;
            _bh.loadLang('en');
        },
        success:function(data){
            if (_bh.urlVars.debug){console.log('success',data[0]);}
            _bh.langdict=data[0];
            _bh.nameCol = (_bh.langdict.hasOwnProperty("nameCol")) ? _bh.langdict.nameCol : "name";
            _bh.alphabet = (_bh.langdict.hasOwnProperty("alphabet")) ? _bh.langdict.alphabet : "Roman";
            if (_bh.alphabet=="Roman"){
                document.title=_bh.t("title",document.title);}
            _bh.langloaded=true;
            _bh.legenddescs = {
                1:_bh.t("Gravitational Wave Candidate"),
                2:_bh.t("Gravitational Wave Detection"),
                3:_bh.t("X-ray Binary")};
            if (_bh.urlVars.debug){console.log('loaded: '+_bh.lang)}
            if (reload){
                // change language
                _bh.langlab.html(_bh.langs[_bh.lang].code);
                d3.select(".lang-item.current").classed("current",false);
                d3.select(".lang-item#"+_bh.lang).classed("current",true);
                // Replace help
                _bh.addHelp();
                // update URL
                window.history.pushState({},null,_bh.makeUrl({'lang':_bh.lang}));
                // update footer
                footer=document.getElementById("footer-txt");
                footer.innerHTML = _bh.t("footer",footertxt);
                // update title
                d3.select('#hdr h1').html(_bh.t("title","Known Stellar-mass Black Holes"));
                // replot
                _bh.replot();
            }
            else{_bh.makePlot();}
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
    if (!systems.hasOwnProperty(this.langdict.name.toLowerCase())){return key;}
    zero = 48; // char code for Arabic zero
    nine = 57; // char code for Arabic nine
    offset = (systems[this.langdict.name.toLowerCase()] || zero) - zero;
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
    this.langdir = 'bhbubble-lang/';
    d3.select('#hdr h1').html(this.t("title","Known Stellar-mass Black Holes"));
    this.mergeDuration = 1000;
    //set name column
    this.nameCol="name";
    if (this.langdict.hasOwnProperty("nameCol")){this.nameCol=this.langdict.nameCol;}
    this.alphabet = (this.langdict.hasOwnProperty("alphabet")) ? this.langdict.alphabet : "Roman";
}
BHBubble.prototype.makeSvg = function(){
    // make initial elements
    var bh=this;
    // .style("opacity", 0);

    this.infopanelbg = d3.select("body").append("div")
        .attr("class","infopanelbg")
        .on("click",function(){bh.hideInfopanel();});
    this.infopanelouter = d3.select("body").append("div")
        .attr("class","infopanelouter").attr("id","infopanel-outer")
        .style("top",0.5*this.bubHeight);
    this.infopanel = this.infopanelouter.append("div")
            .attr("class","infopanel");
    this.infopanelouter.append("div").attr("class","infoclose")
        .html("<img src='img/close.png' title='"+this.t("Close")+"'>")
        .on("click",function(){bh.hideInfopanel();});
    //replace footer text for language
    footer=document.getElementById("footer-txt");
    footertxt = footer.innerHTML;
    footer.innerHTML = this.t("footer",footertxt);
    //replace svg button text for language
    if (this.alphabet!="Roman"){
        document.getElementById("generate").style.display = "none";
    }
    document.getElementById("generate").innerHTML=this.t("Save as SVG");

}
BHBubble.prototype.scalePage = function(){
    // Set scale of elements given page size
    this.pgWidth=window.outerWidth;
    this.pgHeight=window.outerHeight;
    this.pgAspect = this.pgWidth/this.pgHeight;
    if (this.pgAspect>1){this.controlLoc='right'}else{this.controlLoc='bottom'}
    //apply classes accordingly
    footer = document.getElementById("footer");
    this.full = document.getElementById("full");
    this.bubcont = document.getElementById("bubble-container");
    if (this.controlLoc=='right'){
        footer.classList.add("right");
        footer.classList.remove("bottom");
        this.bubcont.classList.add("right");
        this.bubcont.classList.remove("bottom");
        // bubcont.style.height = this.svgSize+"px";
        this.full.classList.add("right");
        this.full.classList.remove("bottom");
        // full.style.height = this.svgSize+"px";
    }else{
        footer.classList.add("bottom");
        footer.classList.remove("right");
        this.bubcont.classList.add("bottom");
        this.bubcont.classList.remove("right");
        // bubcont.style.height = this.pgWidth+"px";
        this.full.classList.add("bottom");
        this.full.classList.remove("right");
        // bubcont.style.height = this.pgWidth+"px";
    }
    if (this.controlLoc=='right'){
        // document.getElementById("full").setAttribute("style","width:"+(this.bubWidth+this.contWidth)+"px");
        this.bubHeight = document.getElementById("bubble-container").offsetHeight;
        this.bubWidth = this.bubHeight;
        this.svgSize=Math.min(this.bubWidth,this.bubHeight);
    }else{
        this.bubHeight = document.getElementById("bubble-container").offsetHeight;
        this.bubWidth = document.getElementById("bubble-container").offsetWidth;
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
//define tooltip text
BHBubble.prototype.filterData = function(data,filterType){
    //filter data (OBSOLETE)
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
        dataJson=jsonIn.data;
        links=jsonIn.links
        data = [];
        nametr={};
        for (i in dataJson){
            dj=dataJson[i]
            pri=[]
            sec=[]
            fin=[]
            console.log(i,dj);
            pri={
                name:i+'-A',
                massBH:dj.M1.best,
                massBHerr:'e'+parseFloat(dj.M1.err[1])+'-'+
                    parseFloat(dj.M1.err[0]),
                compMass:dj.M2.best,
                compType:'Black hole',
                parentName:i,
                BHtype:'primary',
            }
            sec={
                name:i+'-B',
                massBH:dj.M2.best,
                massBHerr:'e'+parseFloat(dj.M2.err[1])+'-'+
                    parseFloat(dj.M2.err[0]),
                compMass:dj.M1.best,
                compType:'Black hole',
                parentName:i,
                BHtype:'secondary',
            }
            fin={
                name:i,
                massBH:dj.Mfinal.best,
                massBHerr:'e'+parseFloat(dj.Mfinal.err[1])+'-'+
                    parseFloat(dj.Mfinal.err[0]),
                compMass:'None',
                compType:'None',
                parentName:'',
                BHtype:'final',
            }
            if (i[0]=='G'){method='GW'}
            else if (i[0]=='L'){method='LVT'}
            paper='<a target="_blank" href="'+
                links[i].DetPaper.url+'">'+
                links[i].DetPaper.text+'</a>';
            binType='Binary black hole';
            period='';
            loc='Extragalactic'
            distance=parseInt(3.26*(dj.Ldist.best-dj.Ldist.err[0]))+
                '-'+parseInt(3.26*(dj.Ldist.best+dj.Ldist.err[1]));
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
            data.push(sec);
            data.push(fin);
            data.push(pri);
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
            d.massBHstr = bh.t('approx.')+' '+bh.tN(parseFloat(d.massBHplus.toFixed(1)));
        }else{if (this.urlVars.debug){console.log('Data format err:',d.massBHerr,d);}}
        if (bh.langdict.hasOwnProperty('nameCol')&&(d.binType=='Binary black hole')){
            nc=bh.langdict.nameCol;
            rename=/([A-Z]*)([0-9]*)([-A-Z]*)/;
            tr=rename.exec(d.name)
            d[nc]=bh.t(tr[1])+bh.tN(tr[2])+bh.t(tr[3])
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
        if (d.compType=="Black hole"){
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
        ((d.BHtype=="primary")||(d.BHtype=="secondary"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))||
        ((d.BHtype=="final"))&&((bh.filterType=="nofin")||(bh.displayFilter=="nofin"))
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
        ((d.BHtype=="primary")||(d.BHtype=="secondary"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))||
        ((d.BHtype=="final"))&&((bh.filterType=="nofin")||(bh.displayFilter=="nofin"))
    ){
        return 0;}else{return d.r}
}
BHBubble.prototype.getX = function(d){
    // get Y position of a BH element given a displayFilter
    bh=this;
    if (
        ((d.BHtype=="primary")||(d.BHtype=="secondary"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))
    ){return this.arrowpos[this.arrows[d.id][1]].x;}
    else{return this.arrowpos[d.id].x}
}
BHBubble.prototype.getY = function(d){
    // get Y position of a BH element given a displayFilter
    bh=this;
    if (
        ((d.BHtype=="primary")||(d.BHtype=="secondary"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))
    ){return this.arrowpos[this.arrows[d.id][1]].y;}
        else{return this.arrowpos[d.id].y}
}
BHBubble.prototype.getOpacity = function(d){
    // get opacity of a BH element given a displayFilter
    bh=this;
    var BHtype=d.BHtype;
    // console.log(d);
    if ((this.displayFilter=="nofin")&&(BHtype=="final")){
        return 0;
    }else if((this.displayFilter=="noinit")&&((BHtype=="primary")||BHtype=="secondary")){
        return 0;
    }else{return 1;}
}
BHBubble.prototype.drawBubbles = function(){
    // Add bubbles and legend
    this.svg = d3.select("div#bubble-container")
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
    this.langs={
        "cy":{code:"cy",name:"Cymraeg (cy)"},
        "en":{code:"en",name:"English (en)"},
        "fr":{code:"fr",name:"Francais (fr)"},
        "hu":{code:"hu",name:"Magyar (hu)"},
        "or":{code:"or",name:"ଓଡ଼ିଆ (or)"},
        "zhhk":{code:"zhhk",name:"繁體中文(香港) (zh-hk)"}
    }
    var bh=this;
    this.langdiv = d3.select("#lang-button");
    this.langlab = d3.select("#lang-label");
    this.langlab.html(bh.langs[bh.lang].code);
    this.langdiv.on("click",function(){bh.toggleLangList();});
    this.langlist=document.getElementById("lang-list")
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
        bh.langlist.appendChild(langspan);
    }
    document.getElementById("lang-label").addEventListener("mouseover",function(e){
        console.log("dfd")
        bh.showControlTooltip(e,bh.t("Change language"));
    });
    document.getElementById("lang-label").addEventListener("mouseout",function(){
        bh.hideControlTooltip();
    });
    document.getElementById("lang-icon").addEventListener("mouseover",function(e){
        console.log("dfd")
        bh.showControlTooltip(e,bh.t("Change language"));
    });
    document.getElementById("lang-icon").addEventListener("mouseout",function(){
        bh.hideControlTooltip();
    });

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
            tt:this.t("Merge binary black holes")},
        unmerger:{icon:"img/unmerger.svg",
            tt:this.t("Unmerge binary black holes")},
        showall:{icon:"img/showall.svg",
            tt:this.t("Show all black holes")}
    }
    this.scales={
        scalesize:{icon:"img/scalesize.svg",
            tt:this.t("Scale by size")},
        scalemass:{icon:"img/scalemass.svg",
            tt:this.t("Scale by mass")},
    }
    this.helpbg = d3.select('#help-bg');
    this.helpouter = d3.select('#help-outer');
    this.helpinner = d3.select('#help-inner');
    // add click actions
    helpicon = document.getElementById('help-icon')
    helpicon.addEventListener("click",function(){bh.showHelp();})
    helpicon.addEventListener("mouseover",function(e){
            bh.showControlTooltip(e,"Help");})
    helpicon.addEventListener("mouseout",function(e){
            bh.hideControlTooltip();});
    this.helpbg.on("click",function(){bh.hideHelp();});
    this.helpouter
        .style("top","200%");
    d3.selectAll("#help-close")
        .html("<img src='img/close.png' title='"+this.t("Close")+"'>")
        .on("click",function(){bh.hideHelp();});
    // build help text
    this.helpinner.append("div")
        .attr("class","help-title")
        .html(this.t("Mergers"));
    for (cont in this.anim){
        helpcont=this.helpinner.append("div")
            .attr("class","help-cont")
            .attr("id","help-"+cont);
        helpcont.append("img")
            .attr("class","anim")
            .attr("src",this.anim[cont].icon);
        helpcont.append("div")
            .attr("class","help-text")
            .html(this.anim[cont].tt);
    }
    this.helpinner.append("div")
        .attr("class","help-title")
        .html(this.t("Scale"));
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
    full = document.getElementById('full');
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
    spancont.innerHTML = this.t("Mergers");
    this.divcont.appendChild(spancont);
    //set font size
    // width=spancont.offsetWidth;
    fontsize=this.controlLabFontSize(spancont.offsetWidth);
    // correct for text length
    fontscale = Math.sqrt("Mergers".length/this.t("Mergers").length);
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
    // animimg.setAttribute("title",this.t("Merge binary black holes"));
    animimg.addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,"Merge binary black holes");
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
    // animimgun.setAttribute("title",this.t("Unmerge binary black holes"));
    animimgun.addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,"Unmerge binary black holes");
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
    // animimgall.setAttribute("title",this.t("Show all black holes"));
    animimgall.addEventListener("mouseover",function(e){bh.showControlTooltip(e,"Show all black holes");});
    animimgall.addEventListener("mouseout",function(){bh.hideControlTooltip();});
    animimgall.addEventListener("click",function(){bh.showAll();});
    this.animcontall.appendChild(animimgall);
    //
    //Scale label
    spancontscale = document.createElement('div');
    spancontscale.className = "control-lab reloadable "+((this.controlLoc == 'right')?'right':'bottom');
    // scaletext = document.createTextNode(this.t("Scale"));
    // spancontscale.appendChild(scaletext);
    spancontscale.innerHTML = this.t("Scale");
    this.divcont.appendChild(spancontscale);
    //set font size
    fontsize=this.controlLabFontSize(spancontscale.offsetWidth);
    //scale by text length
    fontscale = Math.sqrt("Scale".length/this.t("Scale").length);
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
    // scaleimgsize.setAttribute("title",this.t("Scale by size"));
    scaleimgsize.addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,"Scale by size");
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
    // scaleimgmass.setAttribute("title",this.t("Scale by mass"));
    scaleimgmass.addEventListener("mouseover",function(e){
        bh.showControlTooltip(e,"Scale by mass");
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
        this.bubHeight = document.getElementById("bubble-container").offsetHeight;
        this.bubWidth = this.bubHeight;
        document.getElementById("full").setAttribute("style","width:"+(this.bubWidth+this.contWidth+30)+"px");
    }else{
        this.bubWidth = document.getElementById("bubble-container").offsetWidth;
        this.contWidth = document.getElementById("controls").offsetWidth;
        this.bubHeight = document.getElementById("bubble-container").offsetHeight;
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
    text =  this.t(text);
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
    text = text + "<span class='info'>"+this.t("Mass")+": "+d["massBHstr"]+" M<sub>&#x2609;</sub></span>";
    if(d["method"]=='Xray'){
        // text = text+ "<span class='info'>X-ray detection</span>";
        text = text + "<span class='info'>"+this.t(d.binType)+"</span>";
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
        text=text+"<span class='info'><b>"+this.t("Mass")+"</b>: "+d["massBHstr"]+" M<sub>&#x2609;</sub>";
        if (d.refbhmass!='-'){text = text +
            " <sup>["+this.tN(rx)+"]</sup></span>";rbhm=rx;rx++;}
        else{rhbm=false;text = text+"</span>"}
        text = text + "<span class='info'><b>"+this.t("Type")+"</b>: "+this.t(d.binType)+"</span>";
        // text = text+ "<span class='info'>X-ray detection</span>";
        //companion
        text = text+ "<span class='info'><b>"+this.t("Companion")+"</b>: "+
            this.t(d.compType)+" ("+this.tN(d.compMass)+" M<sub>&#x2609;</sub>) ";
        if (d.refcomp!="-"){text = text +
            " <sup>["+this.tN(rx)+"]</sup>";rct=rx;rx++;}else{rct=false;}
        if (d.refcompmass!="-"){text = text +
            " <sup>["+this.tN(rx)+"]</sup>";rcm=rx;rx++;}else{rcm=false;}
        text = text+"</span>";
        //period mass
        text = text+ "<span class='info'><b>"+this.t("Orbital period")+"</b>: "+this.tN(d.period)+
        " "+this.t("days")+"</sub>";
        if (d.refper!="-"){text = text +
            " <sup>["+this.tN(rx)+"]</sup></span>";rper=rx;rx++;}
        else{rper=false;text = text+"</span>"}
        text = text+ "<span class='info'><b>"+this.t("Location")+"</b>: "+this.t(d.location)+"</span>";
        if (rbhm){text = text + "<span class='ref'>["+this.tN(rbhm)+"] "+d.refbhmass+"</span>"}
        if (rct){text = text + "<span class='ref'>["+this.tN(rct)+"] "+d.refcomp+"</span>"}
        if (rcm){text = text + "<span class='ref'>["+this.tN(rcm)+"] "+d.refcompmass+"</span>"}
        if (rper){text = text + "<span class='ref'>["+this.tN(rper)+"] "+d.refper+"</span>"}
    }else{
        text = text + "<span class='info'><b>"+this.t("Mass")+"</b>: "+this.tN(d["massBHstr"])+" M<sub>&#x2609;</sub>";
        if (d.refbhmass!='-'){text = text +
            " <sup>["+this.tN(rx)+"]</sup></span>";rbhm=rx;rx++;}
        else{rbhm=false;text = text+"</span>"}
        text = text+ "<span class='info'><b>"+this.t("Type")+"</b>: "+this.t(d.binType)+
            " ("+this.t(d.BHtype)+")</span>";
        if (d.compType!="None"){
            text = text+ "<span class='info'><b>"+this.t("Companion")+"</b>: "+
                this.t(d.compType)+" ("+this.tN(d.compMass)+" M<sub>&#x2609;</sub>) "+"</span>";
        }else{text = text+ "<span class='info'><b>"+this.t("Companion")+"</b>: "+this.t("None")+"</span>"}
        text = text+ "<span class='info'><b>"+this.t("Distance")+"</b>: "+this.tN(d.distance)+
            " "+this.t("million light years")+"</span>";
        if (rbhm){text = text + "<span class='ref'>["+this.tN(rbhm)+"] "+d.refbhmass+"</span>"}

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
       .style("width","50%").style("height","50%");

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
    this.drawBubbles();
    this.makeDownload();
    this.addButtons();
    this.addTooltips();
}
BHBubble.prototype.makePlot = function(){
    this.init();
    this.addHelp();
    this.addLang();
    this.scalePage();
    this.makeSvg();
    this.loadData();
    this.makeDownload();
    this.addButtons();
    this.addTooltips();
}

// create BHBubble object
bub = new BHBubble
// parse URL queries
bub.getUrlVars();
// load language
bub.langdir='bhbubble-lang/';
bub.loadLang(bub.urlVars.lang);
// bub.makePlot();
// NB: "loadLang" calls makePlot function on first load

window.addEventListener("resize",function(){
    bub.replot();
});