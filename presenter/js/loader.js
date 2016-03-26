/**
 * @author Tomas Mlynaric | xmlyna06@stud.fit.vutbr.cz
 * @since 26.3.2016
 */

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
    }
};

/**
 * Shortens number by specified amount of decimals
 * @param input number
 * @param decimals number of decimals (default is 2)
 * @returns {string}
 */
function numberShortener(input, decimals) {
    return parseFloat(input).toFixed(decimals || 2);
}

/**
 * Setups summary information.
 * @param json with needed data
 */
function log_summary(json) {
    $('#log_filename').html(logFile);
    $('#input_filename').html(json.summary.input_filename);
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
}

$.getJSON(logFile, function (json) {
    // --------- Summary
    log_summary(json);

    // --------- Windows
    var window_options = jQuery.extend(true, {}, charts_options, {
        chart: {
            type: 'line'
        },
        tooltip: {
            formatter: function () {
                return 'Time: ' + numberShortener(this.x) + ' ms <br />Window: <strong>' + this.y + ' B</strong>';
            }
        },
        xAxis: {
            title: {
                text: 'Time [ms]'
            }
        },
        yAxis: {
            title: {
                text: 'Window Size [B]'
            }
        },
        series: [
            {
                name: 'Sender',
                data: json.client.windows,
                lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 2
                }
            },
            {
                name: 'Receiver',
                data: json.server.windows,
                lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 2
                }
            }
        ]
    });
    $('#graph_windows').highcharts(window_options);

    // --------- Transfer speed
    var speed_options = jQuery.extend(true, {}, charts_options, {
        chart: {
            type: 'areaspline'
        },
        xAxis: {
            title: {
                text: 'Time [ms]'
            }
        },
        yAxis: {
            title: {
                text: 'Average speed [B/s]'
            }
        },
        tooltip: {
            formatter: function () {
                return 'Time: ' + numberShortener(this.x) + ' ms <br />Speed: <strong>' + numberShortener(this.y) + ' B/s</strong>';
            }
        },
        series: [
            {
                name: 'Receiver → Sender',
                data: json.server.speed
            },
            {
                name: 'Sender → Receiver',
                data: json.client.speed
            }
        ]
    });
    $('#graph_speed').highcharts(speed_options);

    // --------- Roundtrip time
    var rtt_options = jQuery.extend(true, {}, charts_options, {
        tooltip: {
            formatter: function () {
                return 'Sequence number: ' + this.x + ' B <br />RTT: <strong>' + numberShortener(this.y) + ' ms</strong>';
            }
        },
        xAxis: {
            tickInterval: 200000,
            title: {
                text: 'Sequence number [B]'
            }
        },
        yAxis: {
            title: {
                text: 'Roundtrip time [ms]'
            },
            labels: {
                format: '{value:.2f}'
            }
        },
        series: [
            {
                name: 'Receiver → Sender',
                data: (function () {
                    var srv_cli_data = [];
                    $.each(json.server.roundtrip, function () {
                        if (this.replied == 0) return;
                        srv_cli_data.push([this.seq, this.rtt_timestamp]);
                    });
                    return srv_cli_data;
                }())
            },
            {
                name: 'Sender → Receiver',
                data: (function () {
                    var cli_srv_data = [];
                    $.each(json.client.roundtrip, function () {
                        if (this.replied == 0) return;
                        cli_srv_data.push([this.seq, this.rtt_timestamp]);
                    });
                    return cli_srv_data;
                }())
            }
        ]
    });
    $('#graph_rtt').highcharts(rtt_options);

    // --------- Sequence numbers
    var seq_options = jQuery.extend(true, {}, charts_options, {
        tooltip: {
            formatter: function () {
                return 'Time: ' + numberShortener(this.x) + ' ms <br />Sequence number: <strong>' + this.y + ' B</strong>';
            }
        },
        xAxis: {
            title: {
                text: 'Time [ms]'

            }
        },
        yAxis: {
            title: {
                text: 'Sequence number [B]'
            }
        },
        series: [
            {
                name: 'Receiver → Sender',
                data: json.server.seq_numbers,
                lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 2
                }
            },

            {
                name: 'Sender → Receiver',
                data: json.client.seq_numbers,
                lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 2
                }
            }
        ]
    });


    $('#graph_seq').highcharts(seq_options);
});