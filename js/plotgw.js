function gwcatalogue(){
    return this;
}

loaddata = function(callback){
    // Load data from JSON file
    fileIn='json/gwcat.json'
    console.log('reading data from',fileIn);
     $.getJSON({
        url:fileIn,
        beforeSend: function(xhr){
            if (xhr.overrideMimeType){
                xhr.overrideMimeType("application/json");
            }
        },
        dataType: 'json',
        success: function(data){
            callback(data);
        }
    });
}

$(document).ready(function(){
    console.log('doc ready');

    // load data and initialise
    loaddata(datainit);
})


datainit = function(data){
    // Initialise gwcat with loaded data
    // This is where all the code is!
    console.log('input read:',data);
    function gwcatalogue(){
        return this;
    }
    gwcatalogue.prototype.testplot = function(name){
        TESTER = document.getElementById(name);
    	Plotly.plot( TESTER, [{
    	x: this.pall.initmass1,
    	y: this.pall.initmass2 }], {
    	margin: { t: 0 } } );
        console.log('datainit -> testplot',this)
    }
    gwcatalogue.prototype.plotmasses = function(name){
        MASSES = document.getElementById(name);

        tracegw={
            x: this.pvar['GW'].initmass1,
            y: this.pvar['GW'].initmass2,
            text:this.pvar['GW'].srclist,
            type:'scatter',
            mode:'markers',
            marker:{size:12},
            name:'GW'
        }
        tracelvt={
            x: this.pvar['LVT'].initmass1,
            y: this.pvar['LVT'].initmass2,
            text:this.pvar['LVT'].srclist,
            type:'scatter',
            mode:'markers',
            marker:{size:12},
            name:'LVT'
        }
        var data=[tracegw,tracelvt]
        var layout = {
            xaxis:{
                title:'Mass 1 (M<sub>&#9737;</sub>)',
                range:[0,50]
            },
            yaxis:{
                title:'Mass 2 (M<sub>&#9737;</sub>)',
                range:[0,50]
            },
            margin:{t:0}
        }
        Plotly.plot( MASSES, data, layout);
        console.log('datainit -> plotmasses',data.x,data.y)
    }
    gwcatalogue.prototype.formatdata = function(){
        // set variables
        var plotvars=['finalmass','initmass1','initmass2','snr'];
        for (v in plotvars) {
            pvar=plotvars[v]
            console.log('variable',v,pvar);
            this.pall[pvar]=[]
            for (type in this.pvar){this.pvar[type][pvar]=[]}
            for (g in this.pall.srclist) {
                gw=this.pall.srclist[g]
                srctype=this.cat[gw]["type"]
                console.log(gw);
                if (pvar in this.cat[gw]) {
                    console.log('found',pvar,'in',gw,
                        this.cat[gw][pvar].value);
                    this.pall[pvar].push(this.cat[gw][pvar].value);
                    this.pvar[srctype][pvar].push(this.cat[gw][pvar].value);
                }else{
                    console.log('no',pvar,'in',gw);
                    this.pall[pvar].push(NaN);
                }
                // console.log(gw,this.cat[gw].srcprop.finalmass.value,
                    // this.cat[gw].srcprop.finalmass.unit);
            }
        }
    }

    gwcat = new gwcatalogue();

    gwcat.cat = data;
    console.log('initialised:',gwcat.cat);

    gwcat.pall={};
    var types=['GW','LVT']
    gwcat.pvar={};
    for (t in types){
        gwcat.pvar[types[t]]={"srclist":[]}
    }
    gwcat.pall.srclist=[];
    for (g in gwcat.cat){
        gwcat.pall.srclist.push(g)
        var srctype=gwcat.cat[g]['type']
        gwcat.pvar[srctype].srclist.push(g)
    }
    // gwcat.pall.srclist=['GW150914','LVT151012','GW151226']
    console.log(gwcat.pall);
    gwcat.formatdata();
    console.log(gwcat.pall)

    gwcat.plotmasses('masses');
    // gwcat.testplot('tester');
}