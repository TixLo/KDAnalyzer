var strategy_1 = function(key, days, update) {
    if (!Array.prototype.last){
        Array.prototype.last = function() {
            return this[this.length - 1];
        }
    }

    kd_threshold = 50;
    var stock = db[key];

    var state = 'search_golden_cross';
    var price_title = stock.name + '(' + key + ')';
    var price_data = [];
    var price_labels = [];
    var k9_data = [];
    var d9_data = [];
    var k9_threshold = [];
    var prices = [];
    var max_price = -1;
    var min_price = 10000;
    var K9 = 0;
    var D9 = 0;
    var cache = [];
    var last_price = 0;
    var curr_profit = {};
    profits = [];
    for (var i=0 ; i<stock.data.length ; i++) {
        var today_price = 0;
        var stock_num = 0;
        if (stock.data[i].price == undefined)
            today_price = last_price;
        else
            today_price = parseFloat(stock.data[i].price);

        last_price = today_price;
        stock_num = parseInt(stock.data[i].num);
        if (i % days != 0) {
            cache.push(today_price);
            continue;
        }

        if (cache.length > 0) {
            var sum = 0;
            for (var j=0 ; j<cache.length ; j++) {
                sum += cache[j];
            }
            today_price = sum / cache.length;
            // console.log('sum: ' + sum +', today: ' + today_price);
            cache = [];
        }

        price_labels.push(stock.data[i].date);
        price_data.push(stock.data[i].price);
        if (min_price > today_price) {
            min_price = today_price;
        }
        if (max_price < today_price) {
            max_price = today_price;
        }

        prices.push(today_price);
        //https://www.cmoney.tw/notes/note-detail.aspx?nid=16024
        if (prices.length == 9) {
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

            if (state == 'search_golden_cross') {
                if ((k9_data.last() <= d9_data.last()) && (K9 > D9) && (K9 < kd_threshold)) {
                // if ((k9_data.last() <= d9_data.last()) && (K9 > D9)) {
                    // console.log('黃金交叉');
                    curr_profit = {};
                    curr_profit.begin_date = stock.data[i].date;
                    curr_profit.begin_price = today_price;
                    curr_profit.begin_k9 = K9;
                    curr_profit.begin_d9 = D9;
                    curr_profit.begin_num = stock_num;
                    curr_profit.end_date = '--';
                    state = 'search_dead_cross';
                }
            }
            else if (state == 'search_dead_cross') {
                // if ((k9_data.last() > d9_data.last()) && (K9 < D9) && (D9 - K9 > 2)) {
                var p = (curr_profit.begin_price - today_price) / curr_profit.begin_price;
                if (p > 0 && p > 0.05) {
                    // console.log('停損點(-5%)');
                    curr_profit.end_date = stock.data[i].date;
                    curr_profit.end_price = today_price;
                    curr_profit.end_k9 = 0;
                    curr_profit.end_d9 = 0;
                    profits.push(curr_profit);
                    state = 'search_golden_cross';
                }
                else if ((k9_data.last() >= d9_data.last()) && (K9 < D9)) {
                    // console.log('死亡交叉');
                    curr_profit.end_date = stock.data[i].date;
                    curr_profit.end_price = today_price;
                    curr_profit.end_k9 = K9;
                    curr_profit.end_d9 = D9;
                    profits.push(curr_profit);
                    state = 'search_golden_cross';
                }
            }

            k9_data.push(K9);
            d9_data.push(D9);
            prices.shift();
        }
        else {
            k9_data.push(0);
            d9_data.push(0);
        }
        k9_threshold.push(kd_threshold);
    }

    if (curr_profit.end_date == '--') {
        // console.log('found a new golden');
        curr_profit.end_price = today_price;
        profits.push(curr_profit);
    }
    // console.log(profits);

    var avg_profit = gen_profit_tbl(key, update);

    if (update) {
        line_chart.data.labels = price_labels;
        line_chart.data.datasets[0].label = price_title;
        line_chart.data.datasets[0].data = price_data;
        line_chart.data.datasets[1].data = k9_threshold;
        line_chart.data.datasets[2].data = k9_data;
        line_chart.data.datasets[3].data = d9_data;

        line_chart.options.scales.yAxes[0].ticks.suggestedMin = min_price * 0.8;
        line_chart.options.scales.yAxes[0].ticks.suggestedMax = max_price * 1.05;
        line_chart.update();
    }

    return avg_profit;
}