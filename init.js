var init = function() {
    $('#db_tbl').DataTable( {
        data: [],
        paging:   false,
        ordering: false,
        info:     false,
        searching: false,
        columns: [
            {title: "#"},
            {title: "股票代號"},
            {title: "股票名稱"},
            {title: "資料筆數"},
            {title: "平均天數"},
            {title: "&nbsp;&nbsp;&nbsp;"},
            {title: "&nbsp;&nbsp;&nbsp;"}
        ],
        columnDefs: [
           {className: "dt-left", targets: [ 0, 1, 2, 3, 4] }
        ]
    });

    $('#profit_tbl').DataTable( {
        data: [],
        paging:   false,
        ordering: true,
        info:     false,
        searching: false,
        columns: [
            {title: "#"},
            {title: "時間區段"},
            {title: "股價變化"},
            {title: "(K9,D9)->(K9,D9)"},
            {title: "投資效益"}
        ],
        columnDefs: [
           {className: "dt-left", targets: [ 0, 1, 2, 3 ,4] }
        ]
    });

    $('#db_tbl tbody').on('click', 'button', function () {
        var action = this.className;
        var data = $('#db_tbl').DataTable().row( $(this).parents('tr') ).data();

        if (action == 'delete') {
            delete db[data[1]];
            gen_db_tbl();
        }
        else if (action == 'analyze') {
            var days = $('#' + data[1] + '_days').val();
            if (days != '0') {
                refresh_line_chart(data[1], parseInt(days), true);
                best_days = parseInt(days);
            }
            else {
                var max_profit = -100;
                for (var i=1 ; i<=7 ; i++) {
                    var profit = refresh_line_chart(data[1], i, false);
                    if (max_profit < profit) {
                        max_profit = profit;
                        best_days = i;
                    }
                }
                // console.log('best_days: ' + best_days);
                // console.log('max_profit: ' + max_profit);
                refresh_line_chart(data[1], best_days, true);
                best_days = parseInt(days);
            }
        }
    });

    var ctx = $('#stock_line_chart');
    line_chart = new Chart(ctx, line_chart_conf);

    $('#fetch_region input').click(function(){
        if($(this).prop('checked')){
            fetch_region = parseInt($(this).val());
            $('#fetch_region input:checkbox').prop('checked',false);
            $(this).prop('checked',true);
        }
    });
}