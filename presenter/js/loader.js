/**
 * @author Tomas Mlynaric
 */

function numberShortener(input, decimals) {
    return parseFloat(input).toFixed(decimals || 2);
}

var logFile = './log/log.json';

var charts_options = {
    global: {
        useUTC: false
    },

    title: {
        text: ''
    },

    legend: {
        layout: 'horizontal',
        align: 'right',
        verticalAlign: 'top',
        borderWidth: 0
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
            hour: '',
            day: '',
            week: '',
            month: '',
            year: ''
        }
    }
};

$.getJSON(logFile, function (json) {
    $('#log_filename').html(logFile);
    $('#packets_number').html(json.summary.packets_count);
    $('#initial_rtt').html(numberShortener(json.summary.initial_rtt) + ' ms');
    // data sent
    var kb_cli_sent = json.client.data_sent / 1024;
    var kb_srv_sent = json.server.data_sent / 1024;
    $('#cli_data_sent').html(numberShortener(kb_cli_sent) + ' kB');
    $('#srv_data_sent').html(numberShortener(kb_srv_sent) + ' kB');
    $('#all_data_sent').html(numberShortener(kb_cli_sent + kb_srv_sent) + ' kB');
    // window scaling factor
    $('#cli_win_scale').html(json.client.windows_scale + ' (' + Math.pow(2, json.client.windows_scale) + ')');
    $('#srv_win_scale').html(json.server.windows_scale + ' (' + Math.pow(2, json.server.windows_scale) + ')');


    var window_options = jQuery.extend(true, {}, charts_options);

    window_options.tooltip = {
        valueSuffix: ' B'
    };

    window_options.series = [
        {
            name: 'sender window',
            data: json.client.windows
        },
        {
            name: 'receiver window',
            data: json.server.windows
        }
    ];

    window_options.xAxis = {
        title: {
            text: 'Time [ms]'
        }
    };
    window_options.yAxis = {
        title: {
            text: 'Window Size [B]'
        }
    };

    $('#graph_windows').highcharts(window_options);

    var speed_options = jQuery.extend(true, {}, charts_options);
    speed_options.series = [
        {
            name: 'server->client',
            data: json.server.speed
        },
        {
            name: 'client->server',
            data: json.client.speed
        }
    ];

    $('#graph_speed').highcharts(speed_options);


    var rtt_options = jQuery.extend(true, {}, charts_options);

    rtt_options.tooltip = {
        valueSuffix: ' ms',
        valueDecimals: 6 // TODO pryc
    };

    var srv_cli_data = [];
    var cli_srv_data = [];

    $.each(json.server.roundtrip, function () {
        if (this.replied == 0) return;
        srv_cli_data.push([this.seq, this.rtt_timestamp]);
    });

    rtt_options.xAxis = {
        title: {
            text: 'Sequence number [B]'
        }
    };

    rtt_options.yAxis = {
        title: {
            text: 'Roundtrip time [ms]'
        },
        labels: {
            format: '{value:.2f}'
        }
    };

    rtt_options.series = [
        {
            name: 'roundtrip server->client',
            data: srv_cli_data
        }
    ];

    $('#graph_rtt').highcharts(rtt_options);

    var rtt2_options = jQuery.extend(true, {}, rtt_options);

    $.each(json.client.roundtrip, function () {
        if (this.replied == 0) return;
        cli_srv_data.push([this.seq, this.rtt_timestamp]);
    });

    rtt2_options.series = [
        {
            name: 'roundtrip client->server',
            data: cli_srv_data
        }
    ];

    $('#graph_rtt2').highcharts(rtt2_options);


    var seq_options = jQuery.extend(true, {}, charts_options);
    seq_options.series = [
        {
            name: 'server->client',
            data: json.server.seq_numbers,
            lineWidth: 0,
            marker: {
                enabled: true,
                radius: 2
            }
        },

        {
            name: 'client->server',
            data: json.client.seq_numbers,
            lineWidth: 0,
            marker: {
                enabled: true,
                radius: 2
            }
        }
    ];


    $('#graph_seq').highcharts(seq_options);
});