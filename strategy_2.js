var strategy_2 = function(key, days, update) {
    if (!Array.prototype.last){
        Array.prototype.last = function() {
            return this[this.length - 1];
        }
    }
    var KD = calculate_KD(key, 1);

    var stock = db[key];

    kd_threshold = 50;
    var kd_min_threshold = 30;

    var state = 'search_golden_cross';
    var price_title = stock.name + '(' + key + ')';
    var price_data = [];
    var price_labels = [];
    var k9_threshold = [];
    var max_price = -1;
    var min_price = 10000;
    var K9 = 0;
    var D9 = 0;
    var cache = [];
    var last_price = 0;
    var kd_lt_20_count = 0;
    var kd_gt_20_count = 0;
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
        if (today_price == 0)
            continue;

        price_labels.push(stock.data[i].date);
        price_data.push(stock.data[i].price);

        stock_num = parseInt(stock.data[i].num);
        if (i % days != 0) {
            cache.push(today_price);
            if (i != stock.data.length - 1)
                continue;
        }

        if (cache.length > 0) {
            var sum = 0;
            for (var j=0 ; j<cache.length ; j++) {
                sum += cache[j];
            }
            today_price = sum / cache.length;
            cache = [];
        }

        if (min_price > today_price) {
            min_price = today_price;
        }
        if (max_price < today_price) {
            max_price = today_price;
        }

        var prev_K9 = KD.K9[i-1];
        var prev_D9 = KD.D9[i-1];
        var K9 = KD.K9[i];
        var D9 = KD.D9[i];

        if (K9 <= kd_min_threshold) {
            kd_lt_20_count++;
            kd_gt_20_count = 0;
        }
        else if (K9 >= 80) {
            kd_lt_20_count = 0;
            kd_gt_20_count++;
        }
        else {
            kd_lt_20_count = 0;
            kd_gt_20_count = 0;
        }

        if (kd_lt_20_count >= 3) {
            if (curr_profit.kd_lt_20 != undefined) {
                curr_profit.kd_lt_20 = kd_lt_20_count;
            }
            else {
                // ignore
                curr_profit = {};
                state = 'search_golden_cross';
            }
        }
        if (kd_gt_20_count >= 3) {
            if (curr_profit.kd_gt_20 != undefined) {
                curr_profit.kd_gt_20 = kd_gt_20_count;
            }
        }

        if (state == 'search_golden_cross') {
            if ((prev_K9 <= prev_D9) && (K9 > D9) && (K9 < kd_threshold)) {
                // console.log('黃金交叉');
                curr_profit = {};
                curr_profit.kd_lt_20 = 0;
                curr_profit.kd_gt_20 = 0;
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
            else if ((prev_K9 >= prev_D9) && (K9 < D9)) {
                // console.log('死亡交叉');
                var good = false;
                // if (KD.K9[i - 2] >= 80 && KD.K9[i - 1] >= 80 && KD.K9[i] >= 80) {
                //     console.log("高檔鈍化,不賣");
                //     good = true;
                // }

                if (good == false) {
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

        k9_threshold.push(kd_threshold);
    }

    if (curr_profit.end_date == '--') {
        // console.log('found a new golden');
        curr_profit.end_price = today_price;
        profits.push(curr_profit);
    }

    // console.log(profits);
    var tmp_profits = [];
    for (var i=0 ; i<profits.length ; i++) {
        if (profits[i].kd_lt_20 >= 3) {
            continue;
        }
        tmp_profits.push(profits[i]);
    }
    profits = tmp_profits;
    // console.log(profits);

    var avg_profit = gen_profit_tbl(key, update);

    if (update) {
        line_chart.data.labels = price_labels;
        line_chart.data.datasets[0].label = price_title;
        line_chart.data.datasets[0].data = price_data;
        line_chart.data.datasets[1].data = k9_threshold;
        line_chart.data.datasets[2].data = KD.K9;
        line_chart.data.datasets[3].data = KD.D9;

        line_chart.options.scales.yAxes[0].ticks.suggestedMin = min_price * 0.8;
        line_chart.options.scales.yAxes[0].ticks.suggestedMax = max_price * 1.05;
        line_chart.update();
    }

    return avg_profit;
}