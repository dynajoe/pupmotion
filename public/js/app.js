$(function () {
   
    var socket = io();

    var addPoint = function (series, ticks, value) {
        series.addPoint([ticks, value], true, series.data.length > 100);
    };

    socket.on('data', function (data) {
        addPoint(chart.series[0], data.ticks, data.led1);
        addPoint(chart.series[1], data.ticks, data.led2);
        addPoint(chart.series[2], data.ticks, data.led3);
    });

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    var chart = new Highcharts.Chart({
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            renderTo: 'container'
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        },
        title: {
            text: 'Gesture Sensor Data'
        },
        xAxis: {
            type: 'linear',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: 'Value'
            },
            max: 20000,
            min: 0,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            enabled: true
        },
        exporting: {
            enabled: false
        },
        series: [
        {
            name: 'LED1',
            data: []
        },
        {
            name: 'LED2',
            data: []
        },
        {
            name: 'LED3',
            data: []
        }]
    });

});