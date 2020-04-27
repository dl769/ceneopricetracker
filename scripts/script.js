var clicks = 0;//clicks
var reqTr = false;
var isDataStored = false;
var arrLen= 0;
var theArray = [];
var thePricesArray = [];
var historicalPricesArr = [];
var howManyElements;
var toSkip = [];
var flagPreloaded = false;
var flagCheckNewPrices = false;

$(document).ready(function(){
    
    var title = document.title;
if(title == 'Price Tracker'){

    disableSearchField();
    theArray = localStorage.getItem('tmp234')
    thePricesArray = localStorage.getItem('tmp567')
    historicalPricesArr = localStorage.getItem('tmp890')
    toSkip = localStorage.getItem('tmp1toSkip');

    if(theArray == null || thePricesArray == null || historicalPricesArr == null){
        console.log('no data stored')
        theArray = [];
        thePricesArray = [];
        historicalPricesArr = [];
        toSkip = [];
        for (let x = 1; x<500; x++){
            historicalPricesArr[x] = new Array;
        }
       flagPreloaded = true;
       isPreloaded();
    }else{
        theArray = JSON.parse(theArray);
        thePricesArray = JSON.parse(thePricesArray);
        historicalPricesArr = JSON.parse(historicalPricesArr);
        toSkip = JSON.parse(toSkip);

        howManyElements = theArray.length -1;//TO ITERATE THROUGH ALL ELEMENTS

        arrLen = theArray.length;
        
        clicks = arrLen - 1;

        isDataStored = true;
        
        for (let _i = 1; _i< arrLen; _i++){                                 //appending stored DB
            if(thePricesArray[_i]!= null && !toSkip.includes(_i)){
                $('section').append('<div class="box'+_i+'" id="Thebox"><a id="tekst'+_i+'"></a></div>')
                $('#tekst'+_i).append(theArray[_i]);
            }
        }

        checkNewPrices();
        runLowestToDisplay();
        function runLowestToDisplay(){
            window.setTimeout(function(){
                if(!flagCheckNewPrices){
                    runLowestToDisplay()
                }else{
                    savedb();
                    parseDB();
                    window.setTimeout(function(){

                        checkLowestToDisplay();
                        isPreloaded();
                    },1300)
                }
            },300)
        }
    }
}

///
$("#linkinput").on('click',function(){
    $("#linkinput").css("width", "18em");
  });
///

});

function help(){
    window.alert("Put valid Ceneo URL in search bar and click on search button. Item will be saved in your database and its price will be refreshed each time you visit this site")
}
function isPreloaded(){
    if(!flagPreloaded){
        window.setTimeout(function(){
            isPreloaded();
        },400)
    }else{
        appendCurrentPricesToBoxes();
        $('.loadingT').remove();
        enableSearchField();
    }
}
function parseDB(){
    theArray = JSON.parse(theArray);
    thePricesArray = JSON.parse(thePricesArray);
    historicalPricesArr = JSON.parse(historicalPricesArr);
    toSkip = JSON.parse(toSkip);

    howManyElements = theArray.length -1;//TO ITERATE THROUGH ALL ELEMENTS

    arrLen = theArray.length;
    clicks = arrLen - 1;
    isDataStored = true;
}

function checkurladdress(){
    var addressToCheck = $('#linkinput').val();
    if(addressToCheck.search('ceneo.pl/') == -1){
        window.alert('Wrong address. Correct it!')
    }else{
        submit();
    }
}
function submit(){

    disableSearchField();

    clicks += 1;

    $('section').append('<div class="box'+clicks+'" id="Thebox"><a id="tekst'+clicks+'"></a></div>')
    $('#tekst'+clicks).html('<img class="loadgif" src="src/gif.gif">');
    var ceneoURL = $('#linkinput').val();
    var productID = ceneoURL.substring(ceneoURL.lastIndexOf("/") + 1);


    var i = false;

    function zx(){

        window.setTimeout(function(){

            if (reqTr == true){
                i = true;
                checkprice(productID, ceneoURL)
            }
            if (i != true) {
                zx();
                console.log('runningavoidcors')
                avoidCORS(ceneoURL);  
            }
            }, 500)
        }    
    
    zx()
        //accessing site multiple times 'cause most of the times CORS blocks it...

}

var plCurrencyPrice = ''
function checkprice(productID, ceneoURL){
    $('#tekst'+clicks).html('');
    let lowestPrice = $('a[data-lowestprice]').data();
    if (lowestPrice == null){                           //if there's just one record different approach needed
        let a = $('.value').html()
        let b = $('.penny').html()
        lowestPrice = a+b;
    }else{
        lowestPrice = lowestPrice.lowestprice;  
    }
    let name = $("h1").html()
    let productName = name;
    var date = new Date;
    date = convertDate(date)
    plCurrencyPrice = lowestPrice+' zł'   //lowestprice is current lowest price

    let tmpl = historicalPricesArr[clicks].length
    historicalPricesArr[clicks][tmpl+1] = date+lowestPrice; //tmpl+1 to store it on the same indexes as the other arrays

    var tempName = getImageName(name);

    var img = 'http://image.ceneostatic.pl/data/products/'+productID+'/f-'+tempName+'.jpg'

    $('#tekst'+clicks).append('<a id="cpr_" class="currentPrice'+clicks+'">'+plCurrencyPrice+'</a><img src="'+img+'" class="contentIMG"></img><a class="rmbtn" onclick="remove('+clicks+')"><i class=" fas fa-window-close" id="removerIco"></i></a>');
    $('#tekst'+clicks).append('<br><a class ="pName">'+productName+'</a><br><a class="ceneoImgLink" href="'+ceneoURL+'" target="_blank"><img src="src/ceneo.png"></a><br>');
    $('#tekst'+clicks).append('<div class="wrapChart"><div class="wraptxt"><p>Lowest Price: <bold><a id="wpPRC'+clicks+'">'+plCurrencyPrice+'</a><bold>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><a id="wpDT'+clicks+'">'+date+'</a></p></div><i id="chartIMG" class="fas fa-chart-area fa-3x" onclick="openChartPopUp('+clicks+')"></i></div><br>');

    var c = $('#tekst'+clicks).html()
   
    thePricesArray[clicks] = 'Price: ' +plCurrencyPrice+ 'at '+date;
    theArray[clicks] = c

    $('#inlineFrameExample').html('')   //cleaning up frame before next item
    window.alert('Item found! Current lowest price: '+plCurrencyPrice)     
    enableSearchField();
    reqTr = false;

    savedb();
    parseDB();//SAVING DB AFTER SUCCESFULL SUBMIT
}

function remove(cl){

    toSkip.push(cl);

    $('.box'+cl).remove()

    savedb();
    parseDB();
}

function convertDate(date){
    let tempDay = date.getDate();
    let tempMonth = date.getMonth() + 1;
    let tempYear = date.getYear() + 1900;
    let tempHour = date.getHours();
    let tempMinutes = date.getMinutes();

    if(tempMinutes<10) tempMinutes = "0"+tempMinutes;
    if(tempHour<10) tempHour = "0"+tempHour;
    if(tempDay<10) tempDay = "0"+tempDay;
    if(tempMonth<10) tempMonth = "0"+tempMonth;
    
    date = tempHour+":"+tempMinutes+" | "+tempDay+"."+tempMonth+"."+tempYear;

    return date;
}

function savedb(){
    theArray = JSON.stringify(theArray);
    thePricesArray = JSON.stringify(thePricesArray);
    historicalPricesArr = JSON.stringify(historicalPricesArr)
    toSkip = JSON.stringify(toSkip)

    localStorage.setItem('tmp234', theArray)
    localStorage.setItem('tmp567', thePricesArray)
    localStorage.setItem('tmp890', historicalPricesArr)
    localStorage.setItem('tmp1toSkip', toSkip)
    console.log('added')

}

function removedb(){
    localStorage.clear();
    $('section').html('')
}

function getImageName(tempName){
    //replacing pl char
    tempName.toLowerCase()
    tempName= name.replace(/ /g,"-")
    tempName = tempName.replace(":","-")
    tempName = tempName.replace("ś","s")
    tempName = tempName.replace("ł","l")
    tempName = tempName.replace("ż","z")
    tempName = tempName.replace("ź","z")
    tempName = tempName.replace("ę","e")
    tempName = tempName.replace("ó","o")
    tempName = tempName.replace("ń","n");
    return tempName;
}

function avoidCORS(ceneoURL){
//https://stackoverflow.com/questions/15005500/loading-cross-domain-endpoint-with-jquery-ajax
console.log('runnging CORS')
    url = ceneoURL; // TEST URL
    let s;
    $.get("https://images"+~~(Math.random()*33)+"-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=" + encodeURI(url), function(data) {
        $('#inlineFrameExample').append(data)
        reqTr = true;
    });
}

function disableSearchField(){
    $('#linkinput').prop("disabled", true);
    $('#submitButton').prop("disabled", true);
}
function enableSearchField(){
    $('#linkinput').prop("disabled", false);
    $('#submitButton').prop("disabled", false);
}

var z = 1//CURRENT ELEMENT OF AN ARRAY
var urlC//CURRENT URL
var previousChecked = false;//if previous item checked then move to next
async function checkNewPrices(){
    //howManyElements = theArray.length; <=initialized in document ready
    disableSearchField()//preventing from user interacting while elements are being checked
    if(toSkip.includes(z)){
        if(z<howManyElements){
            z += 1;
            checkNewPrices();
        }else{
            moveToNext();
        }
    }else{
   
       urlC = getCeneoURL();
       getNewPrice();
       qsq();

       function qsq(){

            if(previousChecked==true){
                moveToNext();
            }else{
                window.setTimeout(function(){
                    qsq()},250);
            }
        }
    }
}
function moveToNext(){

    previousChecked=false;
    if (z==howManyElements){

        enableSearchField()
        flagCheckNewPrices = true;
    }
    if (z<howManyElements){
        z = z +1;
        checkNewPrices();
    }
}
function getCeneoURL(){
    let tmpStart = theArray[z].search('ceneo.pl');
    var tmpString = theArray[z].slice(tmpStart);
    let tempLen = tmpString.length - 17;

    tmpString = tmpString.slice(0,-tempLen);
    tmpString = "https://www."+ tmpString;
    return tmpString
}

async function getNewPrice(){
    if(!reqTr){
    avoidCORS(urlC)}
    new Promise((resolve,reject)=>{
        if(reqTr==true){
            resolve(getNewValues());
        }else{
            window.setTimeout(function(){
                        getNewPrice();},999);
        }
    })
}

function getNewValues(){
    let lPr = 0
    lPr = $('a[data-lowestprice]').data();
    if (lPr == null){                           //if there's just one record different approach needed
        let a = $('.value').html()
        let b = $('.penny').html()
        lPr = a+b;
    }else{
        lPr = lPr.lowestprice;  
    }
    var currentDate = new Date;
    currentDate = convertDate(currentDate);
    let gimmelen = historicalPricesArr[z].length;
    historicalPricesArr[z][gimmelen] = currentDate+lPr;
    $('#inlineFrameExample').html('')
    reqTr = false;
    previousChecked=true;
}

function checkLowestToDisplay(){

    

    for (let item=1; item<historicalPricesArr[item].length; item++){
        
        if(toSkip.includes(item)) {
            
        }else{
        let numberOfRecords = historicalPricesArr[item].length;
        var lowestItemPrice =0;
        var dateoflowest =0;
        for (let q=1; q<numberOfRecords; q++){

            var tprice = $('#wpPRC'+item).html()
            var tdate = $('#wpDT'+item).html()
            tprice = tprice.slice(0,-3);//- _zł 3 chars
            tprice = tprice.replace(",",".");
            tprice = parseFloat(tprice)

            var hisPr = historicalPricesArr[item][q]
            var hisDT = hisPr.slice(0,18)//just date
            hisPr = hisPr.replace(",",".")
            hisPr = hisPr.slice(18);
            hisPr = parseFloat(hisPr);
            
            if(lowestItemPrice == 0){
                if(hisPr>=tprice){
                    lowestItemPrice = tprice
                    dateoflowest = tdate
                }else{
                    lowestItemPrice = hisPr;
                    dateoflowest = hisDT;
                }
            }else{
                if(hisPr>=lowestItemPrice){
                    //same
                }else{
                    lowestItemPrice = hisPr;
                    dateoflowest = hisDT;
                }
            }
            
        }
        $('#wpPRC'+item).html(lowestItemPrice+" zł");
        $('#wpDT'+item).html(dateoflowest);
    }
    }
    
    flagPreloaded = true;
}


function appendCurrentPricesToBoxes (){
    for (let d=1; d<=clicks; d++){
        var temporarylen = historicalPricesArr[d].length -1;
        var currentPriceFromArr = historicalPricesArr[d][temporarylen];
        currentPriceFromArr = currentPriceFromArr.slice(18);
        $('.currentPrice'+d).html(currentPriceFromArr+' zł');
    }
}

//CHARTS *******************************>>

function openChartPopUp(index){

    var chartWindow = window.open("","sd","width=900,height=500,scrollbars=1,resizable=1")

    var html = "<html><head><title>Chart</title><script src='scripts/chart.js'></script><script src='https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js'></script><script src='scripts/script.js'></script></head><body>"
    html += "<div><canvas id='myChart'></canvas></div>"
    var thePrice, tmpln,theDate;

    var pricesVariable= new Array
    var datesVariable= new Array
    var _it = 0

    let tempHISTARR = [...historicalPricesArr];

    tempHISTARR[index].forEach(l => {
        if (l != null){              
            thePrice = l.slice(18);
            tmpln = thePrice.length;
            theDate = l.slice(0,-tmpln);
            thePrice = thePrice.replace(",",".")
            theDate = theDate.slice()
            pricesVariable[_it] = thePrice
            datesVariable[_it] = theDate
            _it += 1;
        }
    });
    
    console.table(pricesVariable)

    html += "<a class='wr5'>s</a>"
    html += "<script>$('.wr5').html('*******')</script>"
    html += "<script>let myChart = document.getElementById('myChart').getContext('2d');"
    html += "let masspopchart = new Chart(myChart, {type: 'line',    data: { labels: ['"+datesVariable[0]+"'"
    if(datesVariable.length>0){
        for (let y=1;y<datesVariable.length;y++){
        html += ",'"+datesVariable[y]+"'"
        }
        html.slice(0,-1)
    } 
    html += "],datasets: [{label: 'Lowest Price:',data: ["+pricesVariable[0]+""
    if(pricesVariable.length>0){
        for (let y=1;y<pricesVariable.length;y++){
        html += ","+pricesVariable[y]
        }
    }
    html += "],backgroundColor: 'rgba(31, 58, 147, 1)',   "
    html += " borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1}]}, options: { scales: {  yAxes: [{ ticks: {  beginAtZero: false }}]}}});</script>"
    html += "</body></html>"

chartWindow.document.open()

chartWindow.document.write(html)
chartWindow.document.close()

}