$(function () {
    var socket = io();

    var yMax = 5000;

    socket.on('data', function (data) {
        var now = new Date().getTime();
        addPoint(chart.series[0], now, data.led1);
        addPoint(chart.series[1], now, data.led3);
        addPoint(chart.series[2], now, data.threshold);

        var maxData = data.led1 > data.led3 ? data.led1 : data.led3;

        if (maxData > yMax) {
            chart.yAxis[0].update({
                max: maxData
            });

            yMax = maxData;
        }
    });

    var addPoint = function (series, ticks, value) {
        series.addPoint([ticks, value], true, series.data.length > 30);
    };

    var svg = d3.select("#ball")
    .append("svg")
    .attr("width", 1000)
    .attr("height", 100);

    var circles = svg.append('circle')
    .attr('cx', 50)
    .attr('cy', 50)
    .attr('r', 20)
    .style('fill','rgb(255,0,255)');

    var currentState = 'none';

    socket.on('left', function () {
        if (currentState != 'left') {
            currentState = 'left';
            circles
             .transition()
             .attr("cx", 50)
             .duration(300);
        }
    });

    socket.on('right', function () {
        if (currentState != 'right') {
            currentState = 'right';
            circles
             .transition()
             .attr("cx", 950)
             .duration(300);
        }
    });

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    var chart = new Highcharts.Chart({
        chart: {
            type: 'spline',
            animation: Highcharts.svg,
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
            type: 'datetime',
            tickPixelInterval: 1000,
            visible: false,
            labels: {
                formatter: function () {
                    return '';
                }
            }
        },
        yAxis: {
            title: {
                text: 'Value'
            },
            max: 10000,
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
            name: 'LED3',
            data: []
        }, {
            name: 'threshold',
            data: []
        }]
    });
});