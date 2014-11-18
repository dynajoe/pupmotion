$(function () {
   
    var socket = io();

    socket.on('data', function (data) {
       console.log(data);
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
            text: 'Live random data'
        },
        xAxis: {
            type: 'linear',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: 'Value'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                    Highcharts.numberFormat(this.y, 2);
            }
        },
        legend: {
            enabled: false
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

	
   setInterval(function () {
		var series = chart.series[0];
		var x = (new Date()).getTime(), // current time
		 y = Math.random();

		if (series.data.length > 250) 
		series.addPoint([x, y], true, true);
		else
		series.addPoint([x, y], true, false);
	}, 100);

});