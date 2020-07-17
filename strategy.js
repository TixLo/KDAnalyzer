var strategy = function(key, days, update) {
    if (!Array.prototype.last){
        Array.prototype.last = function() {
            return this[this.length - 1];
        }
    }

    if (!Array.prototype.kd_check){
        Array.prototype.kd_check = function(curr_k9) {
            var i1 = this.length - 1;
            var i2 = this.length - 2;
            var i3 = this.length - 3;

            // console.log(this[i1] + ',' + this[i2] + ',' + this[i3]);
            if (this[i1] < 0 && this[i2] < 0 && this[i3] < 0) {
                return false;
            }

            if (curr_k9 <= this[i1] && this[i1] <= this[i2]) {
                // console.log('越來越弱');
                return false;
            }

            return true;
        }
    }

    var stock = db[key];
    var found_realtime_stock = false;
    var realtime_stock_price = 0;
    yesterday_stock_price = 0;
    for (var rt_key in realtime_db) {
        if (rt_key != key)
            continue;

        found_realtime_stock = true;
        yesterday_stock_price = parseFloat(realtime_db[rt_key].yesterday_price);
        if (realtime_db[rt_key].price == '-') {
            if (db[key].z == undefined || db[key].z == '-')
                realtime_stock_price = -1;
            else
                realtime_stock_price = db[key].z;
        }
        else {
            realtime_stock_price = parseFloat(realtime_db[rt_key].price);
        }
        stock.data.push({
                    date: 'now!',
                    price: realtime_stock_price,
                    num: 0
                });
        db[key].z = realtime_stock_price;
        break;
    }

    var manually_price = $('#manually_price').val();
    if (manually_price.length > 0) {
        found_realtime_stock = true;
        realtime_stock_price = parseFloat(manually_price);
        stock.data.push({
                    date: '--',
                    // date: 'now!',
                    price: realtime_stock_price,
                    num: 0
                });
    }

    auto_scan_days = 5;
    kd_threshold = 30;

    var state = 'search_golden_cross';
    var price_title = stock.name + '(' + key + ')';
    var price_data = [];
    var price_labels = [];
    var k9_threshold = [];
    var k9_data = [];
    var d9_data = [];
    var prices = [];
    var max_price = -1;
    var min_price = 10000;
    var K9 = 0;
    var D9 = 0;
    var cache = [];
    var last_price = 0;
    var curr_profit = {};
    profits = [];
    latest_stock_date = '';
    latest_stock_price = 0;
    for (var i=0 ; i<stock.data.length; i++) {
        var today_price = 0;
        var stock_num = 0;
        if (stock.data[i].price == undefined)
            today_price = last_price;
        else
            today_price = parseFloat(stock.data[i].price);

        last_price = today_price;
        if (today_price == 0)
            continue;

        cache.push(today_price);
        if (cache.length > days) {
            cache.shift();
        }
        if (cache.length > 0) {
            var sum = 0;
            for (var j=0 ; j<cache.length ; j++) {
                sum += cache[j];
            }
            today_price = sum / cache.length;
        }

        price_labels.push(stock.data[i].date);
        price_data.push(stock.data[i].price);
        stock_num = parseInt(stock.data[i].num);

        if (min_price > today_price) {
            min_price = today_price;
        }
        if (max_price < today_price) {
            max_price = today_price;
        }

        prices.push(today_price);
        if (prices.length == 9) {
            var min_p = 100000.0;
            var max_p = 0;
            for (var j=0 ; j<prices.length ; j++) {
                if (min_p > prices[j])
                    min_p = prices[j];
                if (max_p < prices[j])
                    max_p = prices[j];
            }

            var RSV = 0;
            if (max_p > min_p)
                RSV = Math.round(((today_price - min_p) / (max_p - min_p)) * 100);

            K9 = Math.round(K9 * 0.667 + RSV * 0.333);
            D9 = Math.round(D9 * 0.667 + K9 * 0.333);

            // if (i > stock.data.length - 4) {
                // console.log('[' + stock.data[i].date + '] today_price: ' + today_price + ', RSV: ' + RSV + ',K9: ' + K9 + ',D9: ' + D9 + ',k9.last(): ' + k9_data.last() + ',d9.last(): ' + d9_data.last());
            // }
            var prev_K9 = k9_data.last();
            var prev_D9 = d9_data.last();

            if (i == stock.data.length - 1 && found_realtime_stock == true) {
                latest_stock_date = stock.data[i].date;
                latest_stock_price = realtime_stock_price;
            }
            if (state == 'search_golden_cross') {
                if ((prev_K9 <= prev_D9) && (K9 > D9) && (K9 < kd_threshold)) {
                    // console.log('黃金交叉: ' + stock.data[i].date);
                    if (k9_data.kd_check(K9)) {
                        curr_profit = {};
                        curr_profit.k9_lt_20 = 0;
                        curr_profit.begin_date = stock.data[i].date;
                        curr_profit.begin_price = today_price;
                        curr_profit.begin_k9 = K9;
                        curr_profit.begin_d9 = D9;
                        curr_profit.begin_num = stock_num;
                        curr_profit.end_date = '--';
                        state = 'search_dead_cross';
                    }
                }
            }
            else if (state == 'search_dead_cross') {
                if (K9 < 20) {
                    curr_profit.k9_lt_20++;
                }

                var dead_cross = false;
                if ((prev_K9 >= prev_D9) && (K9 < D9)) {
                    dead_cross = true;
                }
                var p = (curr_profit.begin_price - today_price) / curr_profit.begin_price;
                if (dead_cross && p > 0 && p > 0.05) {
                    // console.log('停損點(-5%)');
                    curr_profit.end_date = stock.data[i].date;
                    curr_profit.end_price = (curr_profit.begin_price) * 0.95;
                    curr_profit.end_k9 = 0;
                    curr_profit.end_d9 = 0;
                    profits.push(curr_profit);
                    state = 'search_golden_cross';
                }
                else if (dead_cross == false && p > 0 && p > 0.8) {
                    // console.log('停損點(-8%)');
                    curr_profit.end_date = stock.data[i].date;
                    curr_profit.end_price = (curr_profit.begin_price) * 0.92;
                    curr_profit.end_k9 = 0;
                    curr_profit.end_d9 = 0;
                    profits.push(curr_profit);
                    state = 'search_golden_cross';
                }
                else if (curr_profit.k9_lt_20 >= 3) {
                    // console.log('低檔鈍化,快逃');
                    curr_profit.end_date = stock.data[i].date;
                    curr_profit.end_price = today_price;
                    curr_profit.end_k9 = 0;
                    curr_profit.end_d9 = 0;
                    profits.push(curr_profit);
                    state = 'search_golden_cross';
                }
                else if (dead_cross) {
                    // console.log('死亡交叉: ' + stock.data[i].date);
                    if (stock.data[i].date == 'now!') {
                        curr_profit.end_date = stock.data[i].date;
                        curr_profit.end_price = realtime_stock_price;
                    }
                    else {
                        curr_profit.end_date = stock.data[i].date;
                        curr_profit.end_price = today_price;
                        curr_profit.end_k9 = K9;
                        curr_profit.end_d9 = D9;
                        profits.push(curr_profit);

                        curr_profit = {};
                        state = 'search_golden_cross';
                    }
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

    if (curr_profit.end_date == '--' || curr_profit.end_date == 'now!') {
        if (curr_profit.begin_date == 'now!')
            curr_profit.begin_price = realtime_stock_price;
        
        if (curr_profit.end_date == '--')
            curr_profit.end_price = today_price;
        else
            curr_profit.end_price = realtime_stock_price;
        profits.push(curr_profit);
    }
    // console.log(profits);

    var avg_profit = gen_profit_tbl(key, update);
    if (found_realtime_stock) {
        stock.data.pop();
    }

    if (update) {
        stock.K9 = K9;
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