/**
 * @author Tomas Mlynaric
 */

var options = {
    title: {
        text: '',
    },
    xAxis: {
        type: 'datetime',
        units: [
            [
                'millisecond'
            ]
        ]
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
    //tooltip: {
    //    valueSuffix: '°C'
    //},
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    },
};


$.getJSON('log.json', function (json) {
    options.series = [
        {
            name: 'Server window',
            data: json.server.windows
        },
        //{
        //    name: 'Client window',
        //    data: json.client.window
        //}
    ]

    $('#container').highcharts(options);
});

//data: [
//    //[Date.UTC(2010, 0, 1,11,11,12, 1), 29.9],
//    //[Date.UTC(2010, 0, 1,11,11,12, 12), 71.5],
//    //[Date.UTC(2010, 0, 1,11,11,12, 13), 106.4],
//    //[Date.UTC(2010, 0, 1,11,11,12, 14), 129.2],
//    //[Date.UTC(2010, 0, 1,11,11,12, 15), 144.0],
//
//    [1110033190.9, 50],
//    [1110033190.9, 51],
//    [1110033190.9, 52],
//    [1110033191.07, 53],
//    [1110033191.15, 54],
//    [1110033191.23, 55],
//    [1110033191.26, 56],
//    [1110033191.26, 57],
//]