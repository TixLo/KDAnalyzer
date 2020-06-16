var init = function() {
    $('#db_tbl').DataTable( {
        data: [],
        paging:   true,
        ordering: true,
        info:     false,
        searching: true,
        pageLength: 5,
        lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
        columns: [
            {title: "#"},
            {title: "代號"},
            {title: "名稱"},
            {title: "筆數"},
            {title: "名單內"},
            {title: "KD天數"},
            {title: "&nbsp;&nbsp;&nbsp;"},
            {title: "&nbsp;&nbsp;&nbsp;"},
            {title: "[張數](天數, 時間, 買入價格, K9, 目前獲利(%))"}
        ],
        columnDefs: [
           {className: "dt-left", targets: [ 0, 1, 2, 3, 4, 8] },
           {"width": "10", "targets": 0},
           {"width": "30", "targets": 1},
           {"width": "96", "targets": 2},
           {"width": "30", "targets": 3},
           {"width": "50", "targets": 4},
           {"width": "50", "targets": 5},
           {"width": "40", "targets": 6},
           {"width": "40", "targets": 7}
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
            {title: "[交易張數](K9,D9)->(K9,D9)"},
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
                best_days = parseInt(days);
                refresh_line_chart(data[1], parseInt(days), true);
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

    $('#db_tbl tbody').on('click', 'input[type="checkbox"]', function() {
        var data = $('#db_tbl').DataTable().row( $(this).parents('tr') ).data();
        if (db[data[1]].buyin == false)
            db[data[1]].buyin = true;
        else
            db[data[1]].buyin = false;
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