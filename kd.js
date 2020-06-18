var calculate_KD = function(key, days) {
    if (!Array.prototype.last){
        Array.prototype.last = function() {
            return this[this.length - 1];
        }
    }

    var stock = db[key];

    var k9_data = [];
    var d9_data = [];
    var K9 = 0;
    var D9 = 0;
    var prices = [];
    var k9_interval = 9 * days;
    var last_price = 0;
    for (var i=0 ; i<stock.data.length ; i++) {
        var today_price = 0;
        if (stock.data[i].price == undefined)
            today_price = last_price;
        else
            today_price = parseFloat(stock.data[i].price);

        last_price = today_price;
        prices.push(today_price);
        //https://www.cmoney.tw/notes/note-detail.aspx?nid=16024
        if (prices.length == k9_interval) {
            // console.log(prices);

            var min_price = 100000.0;
            var max_price = 0;
            for (var j=0 ; j<prices.length ; j++) {
                if (min_price > prices[j])
                    min_price = prices[j];
                if (max_price < prices[j])
                    max_price = prices[j];
            }

            var RSV = 0;
            if (max_price > min_price)
                RSV = Math.round(((today_price - min_price) / (max_price - min_price)) * 100);

            K9 = Math.round(K9 * 0.667 + RSV * 0.333);
            D9 = Math.round(D9 * 0.667 + K9 * 0.333);
            // console.log('[' + stock.data[i].date + '] RSV: ' + RSV + ',K9: ' + K9 + ',D9: ' + D9 + ',k9.last(): ' + k9_data.last() + ',d9.last(): ' + d9_data.last());

            k9_data.push(K9);
            d9_data.push(D9);
            prices.shift();
        }
        else {
            k9_data.push(0);
            d9_data.push(0);
        }
    }

    return {K9: k9_data, D9: d9_data};
}