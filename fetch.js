var trigger = function() {
    if (query_index < query_dates.length) {
        if (update_stock_ids.length == 0) {
            $('#loading').text('[' + query_stock_id + ']載入資料中 (' + (query_index + 1) + '/'
                    + (query_dates.length) + ') ...');
        }
        else {
            $('#loading').text('[' + query_stock_id + ']載入資料中, 剩餘 '+ (update_stock_ids.length) + ' 股票要更新');
        }
        setTimeout(trigger_to_get_stock_price, 5000);
    }
    else {
        $('#loading').text('股票資料載入完成, 共 (' + (query_dates.length) + ') 筆資料');
        $('#req_url').text('HTTP Req: ');
        // $('#save_btn').attr('disabled', false);

        nestedSort = (prop1, prop2 = null, direction = 'asc') => (e1, e2) => {
            const a = prop2 ? e1[prop1][prop2] : e1[prop1],
                b = prop2 ? e2[prop1][prop2] : e2[prop1],
                sortOrder = direction === "asc" ? 1 : -1
            return (a < b) ? -sortOrder : (a > b) ? sortOrder : 0;
        }
        db[query_stock_id].data.sort(nestedSort('date'));

        // console.log(update_stock_ids);
        if (update_stock_ids.length > 0) {
            var today_date = new Date();
            var mm = String(today_date.getMonth() + 1).padStart(2, '0');
            var yyyy = today_date.getFullYear();

            var today = yyyy.toString() + mm + '01';
            
            query_index = 0;
            query_dates = [];
            query_dates.push(today);
            query_stock_id = update_stock_ids[0];
            update_stock_ids.shift();
            trigger();
        }
        else {
            console.log(db);
            gen_db_tbl();
        }
    }
}

var trigger_to_get_stock_price = function() {
    var date_item = query_dates[query_index];
    // twse_url = 'http://mis.twse.com.tw/stock/api/?ex_ch=tse_';
    // twse_url += query_stock_id + '.tw_' + date_item + '&json=1&delay=0';

    twse_url = 'http://www.twse.com.tw/exchangeReport/STOCK_DAY?date=';
    twse_url += date_item + '&stockNo=' + query_stock_id;

    $('#req_url').text('HTTP Req: ' + twse_url);

    // console.log(twse_url);
    $.get(twse_url, function(result){
        //
        // ref: https://sites.google.com/site/zsgititit/home/python-cheng-shi-she-ji/shi-yongpython-zhua-qu-tai-gu-zheng-jiao-suo-mei-ri-gu-jia-zi-liao-chu-cun-daomongodb
        //
        var obj = result;
        if (obj == undefined || obj.title == undefined) {
            query_index++;          
            trigger();
        }
        var title = obj.title.split(' ')[2];

        // var today_date = new Date();
        // var dd = String(today_date.getDate()).padStart(2, '0');
        // var mm = String(today_date.getMonth() + 1).padStart(2, '0');
        // var yyyy = today_date.getFullYear();
        // var today = (yyyy - 1911).toString() + mm + dd;

        for (var i=0 ; i<obj.data.length ; i++) {
            var param = obj.data[i][0].split('/');
            var date = (parseInt(param[0]) + 1911).toString() + param[1] + param[2];
            var price = obj.data[i][6];
            var num = parseInt(obj.data[i][1].replace(/,/g,'')) / 1000;

           if (db[query_stock_id] === undefined){
                var d = {};
                d.data = [];
                d.name = title;

                db[query_stock_id] = d;
            }

            var found = false;
            for (var j=0 ; j<db[query_stock_id].data.length ; j++) {
                if (db[query_stock_id].data[j].date == date) {
                    found = true;
                    break;
                }
            }
            
            if (found == false) {
                db[query_stock_id].data.push({
                    date: date,
                    price: parseFloat(price),
                    num: num
                });
            }
        }
        
        query_index++;          
        trigger();
    }).fail(function() {
        console.log('failed to get stock price and continue');
        query_index++;          
        trigger();
    });;
}

Date.prototype.format = function() {
    var mouth = (this.getMonth() + 1) >= 10 ? (this.getMonth() + 1) : ('0'+(this.getMonth() + 1));
    var day = this.getDate() >= 10 ? this.getDate() : ('0'+this.getDate());
    var s = this.getFullYear().toString() + mouth + '01';
    // s += this.getFullYear() + mouth + day;
    return (s);
};

var get_all_single_dates = function(stock_id, begin, end) {
    var ab = begin.split("-");
    var ae = end.split("-");
    var db = new Date();
    db.setUTCFullYear(ab[0], ab[1] - 1, ab[2]);
    var de = new Date();
    de.setUTCFullYear(ae[0], ae[1] - 1, ae[2]);
    var unixDb = db.getTime();
    var unixDe = de.getTime();
    var urls = [];
    for (var k = unixDe; k >= unixDb;) {
        var date_item = (new Date(parseInt(k))).format();

        var found = false;
        for (var i=0 ; i<urls.length ; i++) {
            if (urls[i] == date_item) {
                found = true;
                break;
            }
        }

        if (found == false) {
            urls.push((new Date(parseInt(k))).format());
        }
        k = k - 24 * 60 * 60 * 1000;

        fetch_region--;
        if (fetch_region <= 0)
            break;
    }
    return urls;
}

var get_stock_data = function() {
    query_stock_id = $('#stock_id').val();
    if (query_stock_id == '') {
        return;
    }
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    var dates = get_all_single_dates(query_stock_id, '2010-01-01',yyyy + '-' + mm + '-' + dd);
    // console.log(dates);
    // console.log(db);
    if (db[query_stock_id] === undefined) {
        query_dates = dates;
    }
    else {
        query_dates = [];
        for (var j=0 ; j<dates.length ; j++) {
            var found = false;
            for (var i=0 ; i<db[query_stock_id].data.length ; i++) {
                if (db[query_stock_id].data[i].date.substring(0, 6) == dates[j].substring(0, 6)) {
                    found = true;
                    break;
                }
            }

            if (found == false) {
                query_dates.push(dates[j]);
            }
        }
    }
    // console.log(query_dates);
    query_index = 0;
    trigger();
}

var update_stocks = function() {
    if (Object.keys(db).length == undefined)
        return;

    var today_date = new Date();
    var mm = String(today_date.getMonth() + 1).padStart(2, '0');
    var yyyy = today_date.getFullYear();

    var today = yyyy.toString() + mm + '01';
    
    query_index = 0;
    query_dates = [];
    query_dates.push(today);

    for (var key in db) {
        update_stock_ids.push(key);
    }
    query_stock_id = update_stock_ids[0];
    update_stock_ids.shift();  

    trigger();
}

var analyze_all_stocks = function(only_checked = false) {
    if (Object.keys(db).length == undefined)
        return;

    for (var key in db) {
        if (only_checked == true && db[key].buyin == false) {
            continue;
        }
        
        if (only_checked == false) {
            var max_profit = -100;
            for (var i=1 ; i<=auto_scan_days ; i++) {
                var profit = kd_strategy(key, i, false);
                if (max_profit < profit) {
                    max_profit = profit;
                    best_days = i;
                }
            }
        }
        else {
            best_days = db[key].best_days;
        }
        kd_strategy(key, best_days, true);
    }
    $('#loading').text('自動分析完成');
}

var get_realtime_stock_price = function(key) {
    // console.log(key);
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    var twse_url = 'http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch='
                 + key + '_' + yyyy.toString() + mm + dd + '&json=1&delay=0';
    // console.log(twse_url);
    try {
        $.get(twse_url, function(result){
            var obj = JSON.parse(result);

            for (var i=0 ; i<obj.msgArray.length ; i++) {
                var key = obj.msgArray[i].c;
                var price = obj.msgArray[i].z;
                var yesterday_price = obj.msgArray[i].y;
                var name = obj.msgArray[i].n;
                if (realtime_db[key] == undefined) {
                    realtime_db[key] = 0;
                }

                realtime_db[key] = {price: price, name: name, yesterday_price: yesterday_price};
            }
            // console.log(realtime_db);
            analyze_all_stocks(true);
            setTimeout(triger_query, 1000);
        });
    }
    catch (e) {
        console.log('http error!!');
    }
}

var ccc = 0;
var triger_query = function() {
    if (triger_query_interval == 0)
        return;

    triger_query_count--;
    if (triger_query_count <= 0) {
        triger_query_count = triger_query_interval;
        $('#query_checked_stocks_status').text('開始抓取最新股票資料...');
        var query_key = '';
        for (var key in db) {
            if (db[key].buyin == false)
                continue;
            if (query_key.length > 0)
                query_key += '|';
            query_key += 'tse_' + key + '.tw';
        }
        get_realtime_stock_price(query_key);

        // if (ccc == 0)
        //     realtime_db['2344'] = {price: 13.3, name: 'ss'};
        // else if (ccc == 1)
        //     realtime_db['2344'] = {price: 13.1, name: 'ss'};
        // else if (ccc == 2)
        //     realtime_db['2344'] = {price: 12.9, name: 'ss'};
        // else if (ccc == 3)
        //     realtime_db['2344'] = {price: 12.7, name: 'ss'};
        // else if (ccc == 4)
        //     realtime_db['2344'] = {price: 12.5, name: 'ss'};
        // else if (ccc == 5)
        //     realtime_db['2344'] = {price: 12.3, name: 'ss'};
        // else if (ccc == 6)
        //     realtime_db['2344'] = {price: 12.1, name: 'ss'};
        // else if (ccc == 7)
        //     realtime_db['2344'] = {price: 12.0, name: 'ss'};
        // ccc++;
        // analyze_all_stocks(true);
        // setTimeout(triger_query, 1000);
    }
    else {
        $('#query_checked_stocks_status').text('預計 ' + triger_query_count + ' 秒之後抓取最新股票資料...');
        setTimeout(triger_query, 1000);
    }
}

var query_checked_stocks = function() {
    if (triger_query_interval == 0) {
        triger_query_interval = 20;
        triger_query_count = 0;
        realtime_db = {};
        $('#query_checked_stocks_btn').text('停止更新即時資料');        
    }
    else {
        triger_query_interval = 0;
        triger_query_count = 0;
        $('#query_checked_stocks_btn').text('開始更新即時資料');                
    }
    triger_query();
}