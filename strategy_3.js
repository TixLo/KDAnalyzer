var strategy_3 = function(key, days, update) {
    var KD = calculate_KD(key, days);

    var stock = db[key];

    kd_threshold = 40;
    var kd_min_threshold = 20;

    var state = 'search_golden_cross';
    var price_title = stock.name + '(' + key + ')';
    var price_data = [];
    var price_labels = [];
    var k9_threshold = [];
    var last_price = 0;
    var max_price = -1;
    var min_price = 10000;
    var curr_profit = {};
    profits = [];
    for (var i=1 ; i<stock.data.length ; i++) {
        var today_price = 0;
        var stock_num = 0;
        if (stock.data[i].price == undefined)
            today_price = last_price;
        else
            today_price = parseFloat(stock.data[i].price);

        last_price = today_price;

        if (min_price > today_price) {
            min_price = today_price;
        }
        if (max_price < today_price) {
            max_price = today_price;
        }

        stock_num = parseInt(stock.data[i].num);
        price_labels.push(stock.data[i].date);
        price_data.push(stock.data[i].price);
        var prev_K9 = KD.K9[i-1];
        var prev_D9 = KD.D9[i-1];
        var K9 = KD.K9[i];
        var D9 = KD.D9[i];
        // console.log('[' + stock.data[i].date + '] ,K9: ' + K9 + ',D9: ' + D9 + ',Prev K9: ' + prev_K9 + ',prev_K9: ' + prev_D9);

        if (state == 'search_golden_cross') {
            if ((prev_K9 < prev_D9) && 
                (K9 > D9) && 
                (K9 < kd_threshold)) {
                console.log('黃金交叉');
                console.log('[' + stock.data[i].date + '] ,K9: ' + K9 + ',D9: ' + D9 + ',Prev K9: ' + prev_K9 + ',prev_K9: ' + prev_D9);
                var ignore = false;
                for (var j=i; j<=i+2 ; j++) {
                    if (KD.K9[j] == undefined)
                        continue;
                    console.log('KD[' + j + ']: ' + KD.K9[j]);
                    if (KD.K9[j] < 25) {
                        ignore = true;
                    }
                }

                var decrease = false;
                if (KD.K9[i + 1] != undefined && KD.K9[i + 2] != undefined) {
                    if (KD.K9[i] >= KD.K9[i + 1] && KD.K9[i + 1] >= KD.K9[i + 2])
                        decrease = true;

                    if (KD.K9[i + 1] == KD.K9[i + 2])
                        decrease = true;
                }

                var no_effective = false;
                // if (KD.K9[i + 1] != undefined && KD.K9[i + 2] != undefined) {
                //     if (KD.K9[i + 2] - KD.K9[i] <= 10)
                //         no_effective = true;
                // }

                console.log('ignore: ' + ignore + ', decrease: ' + decrease + ',no_effective: ' + no_effective);
                if (ignore == false && decrease == false && no_effective == false) {
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
            // else if ((prev_K9 >= prev_D9) && (K9 < D9)) {
            else if ((prev_K9 >= prev_D9) && (K9 < D9) && (K9 < 80)) {
                // console.log('死亡交叉');
                curr_profit.end_date = stock.data[i].date;
                curr_profit.end_price = today_price;
                curr_profit.end_k9 = K9;
                curr_profit.end_d9 = D9;
                profits.push(curr_profit);
                curr_profit = {};
                state = 'search_golden_cross';
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
    // var tmp_profits = [];
    // for (var i=0 ; i<profits.length ; i++) {
    //     // if (profits[i].kd_lt_20 >= 3 && curr_profit.begin_k9 <= kd_min_threshold) {
    //     if (profits[i].kd_lt_20 >= 3) {
    //         continue;
    //     }
    //     tmp_profits.push(profits[i]);
    // }
    // profits = tmp_profits;
    console.log(profits);

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