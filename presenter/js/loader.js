/**
 * @author Tomas Mlynaric
 */

var options = {
    global: {
        useUTC: false
    },

    title: {
        text: ''
    },

    xAxis: {
        type: 'datetime',
        units: [
            [
                'millisecond',
                [1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
            ]
        ],
        dateTimeLabelFormats: {
            millisecond: '%S.%L',
            second: '%H:%M:%S',
            minute: '%H:%M',
            hour: '%H:%M',
            day: '%e. %b',
            week: '%e. %b',
            month: '%b \'%y',
            year: '%Y'
        }
    },
    yAxis: {
        //title: {
        //    text: 'Temperature (°C)'
        //},
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    }
};


$.getJSON('log.json', function (json) {
    options.tooltip = {
        valueSuffix: ' B'
    };

    options.series = [
        {
            name: 'sender window',
            data: json.windows.sender
        },
        {
            name: 'receiver window',
            data: json.windows.receiver
        }
    ];

    $('#container').highcharts(options);
});