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
    	x: [1, 2, 3, 4, 5],
    	y: [1, 2, 4, 8, 16] }], {
    	margin: { t: 0 } } );
        console.log('testplot',this)
    }

    gwcatalogue.prototype.formatdata = function(){
        gwlist=['gw150914','lvt151012','gw151226']
        for (g in gwlist) {
            gw=gwlist[g]
            console.log(gw,this.cat[gw].srcprop.finalmass.value,this.cat[gw].srcprop.finalmass.unit);
        }
    }

    gwcat = new gwcatalogue();

    gwcat.cat = data;
    console.log('initialised:',gwcat.cat);

    // this.testplot = function(){
    //     TESTER = document.getElementById('tester');
    // 	Plotly.plot( TESTER, [{
    // 	x: [1, 2, 3, 4, 5],
    // 	y: [1, 2, 4, 8, 16] }], {
    // 	margin: { t: 0 } } );
    //     console.log('testplot',this)
    // }
    console.log('datainit -> gwcat.testplot');
    // gwcat.testplot('tester2');
    gwcat.formatdata();
}