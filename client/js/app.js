//TODO-LIST

//1) predictive search

var app = new Vue({
    el: '#app',
    data: {
        itemName: null,
        itemDesc: null,
        itemImgSrc: null,
        itemRarity: null
    },
    methods: {
        auctionRequest,
        clearChart,
        processAuctionData,
        updateAuctionInfo,
        updateItemInfo
    },
    mounted(){
        setTimeout(() => {
        }, 0);
    }
});

var input = document.getElementById('guessInput');
var button = document.getElementById('inputButton');
var ele = document.getElementById("chartContainer");
var chart = new CanvasJS.Chart("chartContainer", {
    axisY: {
    title: "Neopoints",
    includeZero: true
    },
    axisX: {
        title: "Timestamp"
    },
    legend: {
        cursor: "pointer",
        verticalAlign: "top",
        horizontalAlign: "center",
        dockInsidePlotArea: true,
        itemclick: toggleDataSeries
        
    },
    data: [{
        type: "line",
        xValueType: "dateTime",
        name: "Public Successful Auctions",
        showInLegend: true,
        dataPoints: [
            // { x: new Date('2020-02-25 11:18:33'), y: 60000 }
        ]
    },{
        type: "line",
        xValueType: "dateTime",
        name: "Public Unsuccessful Auctions",
        showInLegend: true,
        dataPoints: [
            // { x: new Date('2020-02-25 11:18:33'), y: 60000 }
        ]
    },{
        type: "line",
        xValueType: "dateTime",
        name: "Neofriend Successful Auctions",
        showInLegend: true,
        dataPoints: [
            // { x: new Date('2020-02-25 11:18:33'), y: 60000 }
        ]
    },{
        type: "line",
        xValueType: "dateTime",
        name: "Neofriend Unsuccessful Auctions",
        showInLegend: true,
        dataPoints: [
            // { x: new Date('2020-02-25 11:18:33'), y: 60000 }
        ]
    }]
});
chart.render();
var canvas = $("#chartContainer .canvasjs-chart-canvas").get(0);


function toggleDataSeries(e){
    if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    }
    else{
        e.dataSeries.visible = true;
    }
    e.chart.render();
}

$(document).ready(function(){  
  $('#item').keypress(function(){  
        var query = $(this).val();  
        if(event.which == 13){
            $('#itemList').fadeOut();
            clearChart();
            updateItemInfo($("li").first().data());
            updateAuctionInfo($("li").first().data().oii);
            ele.style.display = "block";
            $('ul').empty();
            
        }
        else  
        {  
            $.ajax({  
                url:"https://neopia.live/idb/autocomplete.php",  
                method:"POST",  
                data:{query:query},  
                success:function(data)  
                {  
                    $('#itemList').fadeIn();  
                    $('#itemList').html(data);  
                }  
            });  
        } 
  });  
  $(document).on('click', 'li', function(){  
        $('#itemList').fadeOut();  
        clearChart();
        updateItemInfo($(this).data());
        updateAuctionInfo($(this).data().oii);
        ele.style.display = "block";
  });  
});  

// Creates AJAX request from item ID and auction type passed into updateAuctionInfo()
// oii: item ID
// auctType: 1=unsuccessful, 2=successful
function auctionRequest(oii, auctType, neoFriend){
    var urlPart1 = 'https://neopia.live/idb/history/?oii=';
    var urlPart2 = '&status=';
    var urlPart3 = '&neofriend=';

    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: urlPart1 + oii + urlPart2 + auctType + urlPart3 + neoFriend,
        crossDomain: true,
        success: function(data) {
            processAuctionData(data, auctType, neoFriend);
        }
    });    
}

// Clears auction data chart of data - called for each successful item query
function clearChart(){
    chart.options.data[0].dataPoints = [];
    chart.options.data[1].dataPoints = [];
    chart.options.data[2].dataPoints = [];
    chart.options.data[3].dataPoints = [];
}

// Accepts auction list and auction type to fill chart dataPoints array
function processAuctionData(auctionList, auctType, neoFriend){

    // Unsuccessful auction: use currentbid as price
    if (auctType == '1'){
        if (neoFriend == '0'){
            for (var i = 0; i < auctionList.length; i++){
                var arr = auctionList[i].last_updated.split(/[- :]/);
                chart.options.data[1].dataPoints.push({ x: new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]), y: Number(auctionList[i].currentbid) });
            }
        }else if (neoFriend == '1'){
            for (var i = 0; i < auctionList.length; i++){
                var arr = auctionList[i].last_updated.split(/[- :]/);
                chart.options.data[3].dataPoints.push({ x: new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]), y: Number(auctionList[i].currentbid) });
            }
        }
    }

    // Successful auction: use lastbid as price
    else if (auctType == '2'){
        if (neoFriend == '0'){
            for (var i = 0; i < auctionList.length; i++){
                var arr = auctionList[i].last_updated.split(/[- :]/);
                chart.options.data[0].dataPoints.push({ x: new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]), y: Number(auctionList[i].lastbid) });
            }
        }else if (neoFriend == '1'){
            for (var i = 0; i < auctionList.length; i++){
                var arr = auctionList[i].last_updated.split(/[- :]/);
                chart.options.data[2].dataPoints.push({ x: new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]), y: Number(auctionList[i].lastbid) });
            }
        }
    }
    console.log(chart.options.data);
    chart.render();
}

// Two requests necessary - one for successful auction, one for unsuccessful auction.
function updateAuctionInfo(oii){
    auctionRequest(oii, 2, 0); // successful public
    auctionRequest(oii, 2, 1); // successful neofriend
    auctionRequest(oii, 1, 0); // unsuccessful public
    auctionRequest(oii, 1, 1); // unsuccessful neofriend
}

// Accepts response from checkInput(), uses it to fill item information
function updateItemInfo(data){
    app.itemName = data.name;
    app.itemDesc = data.description;
    app.itemImgSrc = 'http://images.neopets.com/items/' + data.image + '.gif';
    app.itemRarity = data.rarity;
}