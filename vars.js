var query_dates = [];
var query_index = 0;
var query_stock_id = 0;
var update_stock_ids = [];
var twse_url = '';
var db = {};
var profits = [];
var fetch_region = 7;
var best_days = 0;
var best_notes = '';
var kd_threshold = 50;
var kd_strategy = strategy_2;
var auto_scan_days = 5;
var line_chart;
var line_chart_data = {
    labels: [],
    datasets: [{
        label: '',
        backgroundColor: '#2626FF',
        borderColor: '#2626FF',
        borderWidth: 1.5,
        pointRadius: 0.6,
        lineTension: 0,
        fill: false,
        data: [],
        yAxisID: 'price',
    },
    {
        label: 'K9 Threshold',
        backgroundColor: '#000000',
        borderColor: '#000000',
        borderWidth: 1,
        pointRadius: 0,
        lineTension: 0,
        fill: false,
        data: [],
        yAxisID: 'KD',
    },
    {
        label: 'K9',
        backgroundColor: '#00C400',
        borderColor: '#00C400',
        borderWidth: 1,
        pointRadius: 0,
        lineTension: 0,
        fill: false,
        data: [],
        yAxisID: 'KD',
    },
    {
        label: 'D9',
        backgroundColor: '#DB00DB',
        borderColor: '#DB00DB',
        borderWidth: 1,
        pointRadius: 0,
        lineTension: 0,
        fill: false,
        data: [],
        yAxisID: 'KD',
    }]
};

var line_chart_conf = {
    type: 'line',
    data: line_chart_data,
    options: {
        animation: false,
        title: {
            display: true
        },
        scales: {
            xAxes : [ {
                gridLines : {
                    display : false
                }
            }],
            yAxes: [{
                display: true,
                position: 'right',
                id: 'price',
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 0,
                },
                gridLines: {
                    display:false
                } 
            },
            {
                display: true,
                position: 'left',
                id: 'KD',
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                },
                gridLines: {
                    display:true
                } 
            }],
        }
    }
};