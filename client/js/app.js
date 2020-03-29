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
            alertPrompt,
            auctionRequest,
            buttonClick,
            checkInput,
            clearChart,
            processAuctionData,
            resetInput,
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
        width:1000,
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
            dockInsidePlotArea: true
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
        }]
    });
    chart.render();
    var canvas = $("#chartContainer .canvasjs-chart-canvas").get(0);
    var dataURL = canvas.toDataURL('image/png');
    console.log(dataURL);
    $("#base64").text(dataURL.substr(22));


    input.addEventListener('keyup', function(event){
        if (event.keyCode === 13){
            event.preventDefault();
            button.click();
        }
    });

    // Bootstrap alert implementation
    function alertPrompt(message){
        var alertHTML = '<div id="alertdiv" class="alert alert-warning"><a class="close" data-dismiss="alert">×</a><span>'+ message +'</span></div>';
        $('#alert_placeholder').append(alertHTML)

        setTimeout(function() { // this will automatically close the alert and remove this if the users doesnt close it in 5 secs
          $("#alertdiv").remove();
    
        }, 5000);
    }
    
    // Creates AJAX request from item ID and auction type passed into updateAuctionInfo()
    // oii: item ID
    // auctType: 1=unsuccessful, 2=successful
    function auctionRequest(oii, auctType){
        var urlPart1 = 'https://neopia.live/idb/history/?oii=';
        var urlPart2 = '&status=';

        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: urlPart1 + oii + urlPart2 + auctType,
            crossDomain: true,
            success: function(data) {
                processAuctionData(data, auctType);
            }
        });    
    }

    // Processes user input, then resets input box
    function buttonClick(){
        checkInput();
        resetInput();
    }

    // Creates AJAX request from user input.
    // If successful, updates item info & auction info
    function checkInput(){
        var urlPart = 'https://neopia.live/idb/api/?item=';
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: urlPart + input.value,
            crossDomain: true,
            success: function(data) {
                if (data[0] == null || data[0].name == ''){
                    alertPrompt('Item does not exist - try again');
                }
                else{
                    clearChart();
                    updateItemInfo(data);
                    updateAuctionInfo(data[0].oii);
                    ele.style.display = "block";
                }
            }
        });
    }

    // Clears auction data chart of data - called for each successful item query
    function clearChart(){
        chart.options.data[0].dataPoints = [];
        chart.options.data[1].dataPoints = [];
    }
    
    // Accepts auction list and auction type to fill chart dataPoints array
    function processAuctionData(auctionList, auctType){

        // Unsuccessful auction: use currentbid as price
        if (auctType == '1'){
            for (var i = 0; i < auctionList.length; i++){
                chart.options.data[1].dataPoints.push({ x: new Date(auctionList[i].last_updated), y: Number(auctionList[i].currentbid) });
            }
        }

        // Successful auction: use lastbid as price
        else if (auctType == '2'){
            for (var i = 0; i < auctionList.length; i++){
                chart.options.data[0].dataPoints.push({ x: new Date(auctionList[i].last_updated), y: Number(auctionList[i].lastbid) });
            }
        }
        chart.render();
    }

    // Resets user input form
    function resetInput(){
        input.value = '';
    }

    // Two requests necessary - one for successful auction, one for unsuccessful auction.
    function updateAuctionInfo(oii){
        auctionRequest(oii, 2); // successful
        auctionRequest(oii, 1); // unsuccessful
    }

    // Accepts response from checkInput(), uses it to fill item information
    function updateItemInfo(data){
        app.itemName = data[0].name;
        app.itemDesc = data[0].description;
        app.itemImgSrc = 'http://images.neopets.com/items/' + data[0].image + '.gif';
        app.itemRarity = data[0].rarity;
    }