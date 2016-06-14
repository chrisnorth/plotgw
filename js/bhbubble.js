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
}
BHBubble.prototype.makeUrl = function(newKeys){
    // construct new URL with replacement queries if necessary
    newUrlVars = this.urlVars;
    for (key in newKeys){newUrlVars[key]=newKeys[key];}
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
    _bh.lang = lang;
    if (!lang){lang="en"};
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
            //navigate to same page, but lang="en"
            window.location.replace(_bh.makeUrl({'lang':'en'}));
        },
        success:function(data){
            //console.log('success',data[0]);
            _bh.langdict=data[0];_bh.makePlot();}
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
    this.legenddescs = {
        1:this.t("Gravitational Wave Candidate"),
        2:this.t("Gravitational Wave Detection"),
        3:this.t("X-ray Binary")};
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
        .html("<img src='img/close.png' title='"+this.t("close")+"'>")
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

    // if (this.controlLoc == 'right'){
    //     this.divcont = document.createElement('div');
    //     this.divcont.setAttribute("id","controls");
    //     this.divcont.classList.add("right");
    //     this.divcont.classList.remove("bottom");
    //     this.divcont.style.width = 0.1*this.pgWidth+"px";
    //     this.divcont.style.marginLeft = 0;
    //     if (this.pgMargin.right > 0.1*this.bubWidth){
    //         this.divcont.style.marginRight = this.pgMargin.right - 0.1*this.bubWidth;
    //     }else{
    //         this.divcont.style.marginRight = 0;
    //     }
    //     full.appendChild(this.divcont);
    // }else{
    //     this.divcont = document.createElement('div');
    //     this.divcont.setAttribute("id","controls")
    //     full.insertBefore(this.divcont,full.children[0]);
    //     this.divcont.classList.add("bottom");
    //     this.divcont.classList.remove("right");
    //     this.divcont.style.marginLeft = this.pgMargin.left+"px";
    //     this.divcont.style.width = (this.bubWidth-this.pgMargin.left)+"px";
    // }
}
BHBubble.prototype.scalePage = function(){
    // Set scale of elements given page size
    this.pgWidth=window.outerWidth;
    this.pgHeight=window.outerHeight;
    this.pgAspect = this.pgWidth/this.pgHeight;
    if (this.pgAspect>0.9){this.controlLoc='right'}else{this.controlLoc='bottom'}
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
    // store bubcont size
    // this.addButtons();
    this.bubWidth = document.getElementById("bubble-container").offsetHeight;
    // this.contWidth = document.getElementById("controls").offsetWidth;
    this.bubHeight = document.getElementById("bubble-container").offsetHeight;
    if (this.controlLoc=='right'){
        // document.getElementById("full").setAttribute("style","width:"+(this.bubWidth+this.contWidth)+"px");
        this.svgSize=Math.min(this.bubWidth,this.bubHeight);
    }else{
        // console.log(this.bubWidth,this.bubHeight)
        this.svgSize=Math.min(this.bubWidth,this.bubHeight);
    }
    this.pgMargin = {left:(this.pgWidth-this.svgSize)/2.,right:(this.pgWidth-this.svgSize)/2.};
    // console.log(this.pgAspect,this.controlLoc);
    // d3.select("#full")
    //     .style("width","100")
    //     .style("margin-left",this.pgMargin.left+"px");
    // d3.select("#bubble-container")
    //     .style("width","auto")
        // .style("margin-left",this.pgMargin.left+"px");
    //add control panelfull = document.getElementById('full');
    // this.divcont = document.createElement('div');
    // this.divcont.setAttribute("id","controls");
    // this.divcont.classList.add("right");
    // if (this.controlLoc=="right"){full.appendChild(this.divcont)}
    // else{full.insertBefore(this.divcont,full.children[0]);}

    // console.log()
}
BHBubble.prototype.addTooltips = function(){
    this.tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");
    this.conttooltip = d3.select("body").append("div")
        .attr("class", "conttooltip");
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
// BHBubble.prototype.filter = function(d){
//     if (this.filterType=="nofin"){
//         return !d.children;
//     }else{
//         console.log(d.name,d.children);
//         return function(d){return !d.children;};
//     }
// }
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

BHBubble.prototype.loadData = function(){
    //load data - then call next functions
    if (this.langdict.hasOwnProperty('inputFile')){
        this.inputFile="csv/"+this.langdict.inputFile;
    }else{this.inputFile="csv/bhcat.csv";}
    // console.log('file',this.inputFile);
    var bh=this;
    d3.csv(this.inputFile, function(error, data){
        data= bh.filterData(data,bh.filterType);
        bh.data = data;
        //call next functions
        bh.formatData(bh.valueCol)
        bh.drawBubbles();
    })
}
BHBubble.prototype.formatData = function(valueCol){
    // Calculate errors and make links between black hole mergers
    var bh=this;
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
            d.massBHstr = 'approx. '+bh.tN(parseFloat(d.massBHplus.toFixed(1)));
        }else{if (this.urlVars.debug){console.log('Data format err:',d.massBHerr,d);}}
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
    if (
        ((d.BHtype=="primary")||(d.BHtype=="secondary"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))||
        ((d.BHtype=="final"))&&((bh.filterType=="nofin")||(bh.displayFilter=="nofin"))
    ){
        return "";}else{return d[bh.nameCol]}
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
    if (this.displayFilter=="nofin"){
        return (d.BHtype=="final") ? 0 : 1;
    }else if(this.displayFilter=="noinit"){
        return (d.BHtype=="primary") ? 0 : (d.BHtype=="secondary") ? 0 : 1;
    }else{return 1;}
}
BHBubble.prototype.drawBubbles = function(){
    // Add bubbles and legend
    this.svg = d3.select("div#bubble-container")
        .append("svg").attr("class", "bubble")
        .attr("width", this.svgSize).attr("height", this.svgSize);

    // console.log("drawBubbles",this.data[0].r);
    var bh=this;

    // console.log(arrows);
    // console.log(arrowpos);
    this.addcurve = function(id){
        r1=bh.arrowpos[bh.arrows[id][0]].r;
        r2=bh.arrowpos[bh.arrows[id][1]].r;
        x1=bh.arrowpos[bh.arrows[id][0]].x;
        x2=bh.arrowpos[bh.arrows[id][1]].x;
        y1=bh.arrowpos[bh.arrows[id][0]].y;
        y2=bh.arrowpos[bh.arrows[id][1]].y;
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
        col=bh.arrowpos[bh.arrows[id][0]].c;
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
    // if (
    //     ((this.filterType!="nofin")&&(this.filterType!="noinit"))&&
    //     ((this.displayFilter!="nofin")&&(this.displayFilter!="noinit"))){
    //     for (id in this.arrows){
    //         // addtriangle(i);
    //         // addpolygon(i);
    //         this.addcurve(id);
    //         this.svg.selectAll("path.merger")
    //             .attr("opacity",0.5);
    //     }
    // }
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

    if (this.alphabet=="Roman"){
        //add as SVG text item
        this.bubbles.append("text")
            .attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y + 5; })
            .attr("text-anchor", "middle")
            .text(function(d){return d.name;})
            .attr("class","bh-circle-text")
            .attr("opacity",function(d){return bh.getOpacity(d)})
            .attr("id",function(d){return "bh-circle-text-"+d.id;})
            .style({
                "fill":function(d){
                    if (d.r > (2 * d.r - 8) / this.getComputedTextLength() * 8){
                        return bh.textcolor2(bh.cValue(d));
                    }else{
                        return "white";
                    }},
                "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                "font-size":function(d) {
                    // if (d.name.search('GW')>-1){
                    // console.log(d.name,Math.min((2*d.r), (2 * d.r - 8) / this.getComputedTextLength() * 8) + "px" );}
                    return Math.min((2*d.r), (2 * d.r - 8) / this.getComputedTextLength() * 8) + "px"; }
            })
            .on("mouseover", function(d) {bh.showTooltip(d);})
            .on("mouseout", function(d) {bh.hideTooltip(d);})
            .on("click",function(d){bh.showInfopanel(d);});
        d3.selectAll("text")
            .text(function(d){ return bh.getText(d); });
    }else{
        //add as foreignObject
        this.bubbles.append("foreignObject")
            .attr("x", function(d){ return d.x -d.r; })
            .attr("y", function(d){ return d.y - 5; })
            .attr("width",function(d){return 2*d.r})
            .attr("height","28px")
            .attr("class","bh-circle-text")
            .attr("id",function(d){return "bh-circle-text-"+d.id;});
        d3.selectAll(".bh-circle-text")
            .append("xhtml:body")
                .style({"color":function(d){return bh.textcolor2(bh.cValue(d));},
                    "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                    "font-size": function(d) { return 0.2*d.r},
                    "background-color":"rgba(0,0,0,0)"
                        // return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 8) + "px"; }
                })
                .html(function(d){return "<span>"+bh.getText(d)+"</span>";})
                .on("mouseover", function(d) {bh.showTooltip(d);})
                .on("mouseout", function(d) {bh.hideTooltip(d);})
                .on("click",function(d){bh.showInfopanel(d);});
    }
    // for (i in arrows){
    //     // addtriangle(i);
    //     addcurve(i);
    // }

    // replace text and circles with display values
    d3.selectAll(".bh-circle")
        .attr("r",function(d){return bh.getRadius(d);})
    // for (i in this.arrows){
    //     // addtriangle(i);
    //     // addpolygon(i);
    //     if (
    //         ((d.BHtype=="primary")||(d.BHtype=="secondary"))&&((bh.filterType=="noinit")||(bh.displayFilter=="noinit"))||
    //         ((d.BHtype=="final"))&&((bh.filterType=="nofin")||(bh.displayFilter=="nofin"))
    //     ){
    //         d3.select(this.arrows[i][0]).attr("cx",this.arrowpos[this.arrows[i][0]].x);
    //     }
    // }
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
    if (this.alphabet=="Roman"){
        //add as SVG text object
        this.legend.append("text")
            .attr("x", 36)
            .attr("y", 21)
            .attr("dy", ".35em")
            .style("font-size","1.2em")
            .style("fill","#fff")
            .style("text-anchor", "start")
            .html(function(d){return bh.legenddescs[d];});
    }else{
        // add as HTML object
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
BHBubble.prototype.controlLabFontSize = function(width){
    // set Label fontsize for control panel
    if (this.controlLoc=='right'){
        return Math.min(width, (width - 8) / 30 * 8) + "px";
    }else{
        if (this.pgWidth > 500){
            return Math.min(width, (width - 8) / 35 * 8) + "px";
        }else{
            return Math.min(width, (width - 8) / 30 * 8) + "px";
        }
    }
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
        // this.divcont.style.width = 0.1*this.pgWidth+"px";
        // this.divcont.style.marginLeft = 0;
        // if (this.pgMargin.right > 0.1*this.bubWidth){
        //     this.divcont.style.marginRight = this.pgMargin.right - 0.1*this.bubWidth;
        // }else{
        //     this.divcont.style.marginRight = 0;
        // }
        full.appendChild(this.divcont);
    }else{
        this.divcont = document.createElement('div');
        this.divcont.setAttribute("id","controls");
        this.divcont.classList.add("bottom");
        this.divcont.classList.remove("right");
        // this.divcont.style.marginLeft = this.pgMargin.left+"px";
        // this.divcont.style.width = (this.bubWidth-this.pgMargin.left)+"px";
        full.insertBefore(this.divcont,full.children[0]);
    }
    //
    spancont = document.createElement('div');
    spancont.className = "control-lab "+((this.controlLoc == 'right')?'right':'bottom');
    spancont.innerHTML = this.t("Mergers");
    this.divcont.appendChild(spancont);
    //set font size
    // width=spancont.offsetWidth;
    fontsize=this.controlLabFontSize(spancont.offsetWidth);
    // Math.min(width, (width - 8) / 30 * 8) + "px";
    spancont.style.fontSize=fontsize;
    //
    // this.divcont.innerHTML('<span>Controls:</span>');
    this.animcont = document.createElement('div');
    this.animcont.className = 'control merge merger '+((this.controlLoc == 'right')?'right':'bottom');
    if (this.controlLoc == 'right'){this.animcont.width = "80%";}
    else{this.animcont.height = "100%";}
    if (this.displayFilter=="noinit"){this.animcont.classList.add("hide");}
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
    this.animcontun.className = 'control merge unmerger '+((this.controlLoc == 'right')?'right':'bottom');
    if (this.displayFilter=="nofin"){this.animcontun.classList.add("hide");}
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
    this.animcontall.className = 'control merge all '+((this.controlLoc == 'right')?'right':'bottom');
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
    spancontscale.className = "control-lab "+((this.controlLoc == 'right')?'right':'bottom');
    // scaletext = document.createTextNode(this.t("Scale"));
    // spancontscale.appendChild(scaletext);
    spancontscale.innerHTML = this.t("Scale");
    this.divcont.appendChild(spancontscale);
    //set font size
    fontsize=this.controlLabFontSize(spancontscale.offsetWidth);
    spancontscale.style.fontSize=fontsize;

    //
    //scale size button
    this.scalecontsize = document.createElement('div');
    this.scalecontsize.className = 'control scale scale-size '+((this.controlLoc == 'right')?'right':'bottom');
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
    this.scalecontmass.className = 'control scale scale-mass '+((this.controlLoc == 'right')?'right':'bottom');
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
    this.bubWidth = document.getElementById("bubble-container").offsetHeight;
    this.contWidth = document.getElementById("controls").offsetWidth;
    this.bubHeight = document.getElementById("bubble-container").offsetHeight;
    if (this.controlLoc=='right'){
        document.getElementById("full").setAttribute("style","width:"+(this.bubWidth+this.contWidth+30)+"px");
    }else{
        document.getElementById("full").setAttribute("style","width:"+(this.bubWidth+10)+"px");
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
    this.animcontun.classList.remove("hide");
    this.animcont.classList.add("hide");
    this.animcontall.classList.remove("hide");
    this.doAnimation();
}
BHBubble.prototype.animateUnMerger = function(){
    // Hide final black holes in mergers
    bh=this;
    this.displayFilter = "nofin";
    this.animcont.classList.remove("hide");
    this.animcontun.classList.add("hide");
    this.animcontall.classList.remove("hide");
    this.doAnimation();
}
BHBubble.prototype.showAll = function(){
    // Show all black holes
    bh=this;
    this.displayFilter = "all";
    this.animcontun.classList.remove("hide");
    this.animcont.classList.remove("hide");
    this.animcontall.classList.add("hide");
    this.doAnimation();
}
BHBubble.prototype.doAnimation = function(){
    var bh=this;
    for (id in this.arrows){
        //move intialcircles
        d3.selectAll('#bh-circle-'+this.arrows[id][0])
            .transition().duration(this.mergeDuration)
            .attr("cx",function(d){return bh.getX(d);})
            // this.arrowpos[this.arrows[id][1]].x)
            .attr("cy",function(d){return bh.getY(d);})
            // this.arrowpos[this.arrows[id][1]].y)
            // .attr("stroke","black")
            .attr("r",function(d){return bh.getRadius(d);});
            //move final circles
        d3.selectAll('#bh-circle-'+this.arrows[id][1])
            .transition().duration(this.mergeDuration).delay(250)
            .attr("r",function(d){return bh.getRadius(d)})
            // .attr("cy",this.arrowpos[this.arrows[a][1]].y)
            .attr("opacity",function(d){return bh.getOpacity(d);});
        if (this.alphabet=="Roman"){
            //hide initial text
            d3.selectAll('#bh-circle-text-'+this.arrows[id][0])
                .transition().duration(this.mergeDuration).delay(250)
                .attr("opacity",function(d){return bh.getOpacity();})
                .text(function(d){ return bh.getText(d); });
            //show final text
            d3.selectAll('#bh-circle-text-'+this.arrows[id][1])
                .transition().duration(this.mergeDuration).delay(250)
                .attr("opacity",function(d){return bh.getOpacity()(d);})
                .text(function(d){ return bh.getText(d); });
        }else{
            //hide initial text
            d3.selectAll('#bh-circle-text-'+this.arrows[id][0]).selectAll("body").remove()
            d3.selectAll('#bh-circle-text-'+this.arrows[id][0])
                .append("xhtml:body")
                .style({"color":function(d){return bh.textcolor2(bh.cValue(d));},
                    "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                    "font-size": function(d) { return 0.2*d.r},
                    "background-color":"rgba(0,0,0,0)"
                })
                .html(function(d){return "<span>"+bh.getText(d)+"</span>";})
                .on("mouseover", function(d) {bh.showTooltip(d);})
                .on("mouseout", function(d) {bh.hideTooltip(d);})
                .on("click",function(d){bh.showInfopanel(d);});
            //show final text
            d3.selectAll('#bh-circle-text-'+this.arrows[id][1]).selectAll("body").remove()
            d3.selectAll('#bh-circle-text-'+this.arrows[id][1])
                .append("xhtml:body")
                .style({"color":function(d){return bh.textcolor2(bh.cValue(d));},
                    "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                    "font-size": function(d) { return 0.2*d.r},
                    "background-color":"rgba(0,0,0,0)"})
                .html(function(d){return "<span>"+bh.getText(d)+"</span>";})
                .on("mouseover", function(d) {bh.showTooltip(d);})
                .on("mouseout", function(d) {bh.hideTooltip(d);})
                .on("click",function(d){bh.showInfopanel(d);});
        }
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
        return (e.clientX) + "px";
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
    text =  "<span class='name'>"+d[this.nameCol]+"</span>";
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
       .style("opacity",bh.getOpacity()(d)*0.9);
    this.tooltip.html(this.tttext(d))
       .style("left", getLeft(d)).style("top", getTop(d));
    //    .style("width","auto").style("height","auto");
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
    text =  "<span class='name'>"+d[this.nameCol]+"</span>";
    if(d["method"]=='Xray'){
        text=text+"<span class='info'><b>"+this.t("Mass")+"</b>: "+d["massBHstr"]+" M<sub>&#x2609;</sub>";
        if (d.refbhmass!='-'){text = text +
            " <sup>["+this.tN(rx)+"]</sup></span>";rbhm=rx;rx++;}
        else{rhbm=false;text = text+"</span>"}
        text = text + "<span class='info'><b>"+this.t("Type")+"</b>: "+this.t(d.binType)+"</span>";
        // text = text+ "<span class='info'>X-ray detection</span>";
        //companion
        text = text+ "<span class='info'><b>"+this.t("Companion")+"</b>: "+
            this.tN(d.compMass)+" M<sub>&#x2609;</sub> "+this.t(d.compType);
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
                this.tN(d.compMass)+" M<sub>&#x2609;</sub> "+this.t(d.compType)+"</span>";
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
    d3.selectAll("#controls").remove();
    d3.selectAll(".control").remove();
    d3.selectAll(".control-lab").remove();
    d3.selectAll(".conttooltip").remove();
    d3.selectAll(".tooltip").remove()
    this.drawBubbles();
    this.makeDownload();
    this.addButtons();
    this.addTooltips();
}
BHBubble.prototype.makePlot = function(){
    this.init();
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
// NB: loadLang calls makePlot function

window.addEventListener("resize",function(){
    bub.replot();
});