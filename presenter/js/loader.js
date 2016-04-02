/**
 * Singleton for outputting parsed log data (from tcpstats python script)
 * @author Tomas Mlynaric | xmlyna06@stud.fit.vutbr.cz
 * @since 26.3.2016
 */
var Statistics = {
    /**
     * Default chart options (other options use this)
     */
    charts_options: {
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
    },

    /**
     * Shortens number by specified amount of decimals
     * @param input number
     * @param decimals number of decimals (default is 2)
     * @returns {string}
     */
    numberShortener: function (input, decimals) {
        return input % 1 == 0 ? input : parseFloat(input).toFixed(decimals || 2);
    },

    /**
     * Function for outputting all logged data from javascript object (json)
     * @param json
     */
    all: function (json) {
        // --------- Summary
        this.summary(json);

        // --------- Windows
        var window_options = jQuery.extend(true, {}, Statistics.charts_options, {
            chart: {
                type: 'line'
            },
            tooltip: {
                formatter: function () {
                    var ret = 'Packet number: <strong>' + this.point.i + '</strong><br/>';
                    ret += 'Time: <strong>' + Statistics.numberShortener(this.x) + ' ms</strong><br />';
                    ret += 'Window: <strong>' + Statistics.numberShortener(this.y) + ' B</strong>';
                    return ret;
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
                    lineWidth: 1,
                    marker: {
                        enabled: true,
                        radius: 2
                    }
                },
                {
                    name: 'Receiver',
                    data: json.server.windows,
                    lineWidth: 1,
                    marker: {
                        enabled: true,
                        radius: 2
                    }
                }
            ]
        });
        $('#graph_windows').highcharts(window_options);

        // --------- Transfer speed
        var speed_options = jQuery.extend(true, {}, Statistics.charts_options, {
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
                    var ret = 'Packet number: <strong>' + this.point.i + '</strong><br/>';
                    ret += 'Time: <strong>' + Statistics.numberShortener(this.x) + ' ms</strong><br />';
                    ret += 'Speed: <strong>' + Statistics.numberShortener(this.y) + ' B/s</strong>';
                    return ret;
                }
            },
            series: [
                {
                    name: 'Sender → Receiver',
                    data: json.client.speed
                },
                {
                    name: 'Receiver → Sender',
                    data: json.server.speed
                }
            ]
        });
        $('#graph_speed').highcharts(speed_options);

        // --------- Roundtrip time
        var rtt_options = jQuery.extend(true, {}, Statistics.charts_options, {
            tooltip: {
                formatter: function () {
                    var ret = 'Packet number: <strong>' + this.point.i + '</strong><br/>';
                    ret += 'Sequence number: <strong>' + this.x + ' B</strong><br />';
                    ret += 'RTT: <strong>' + Statistics.numberShortener(this.y) + ' ms</strong>';
                    return ret;
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
                    name: 'Sender → Receiver',
                    data: (function () {
                        var cli_srv_data = [];
                        $.each(json.client.roundtrip, function () {
                            if (this.replied == 0) return;
                            cli_srv_data.push({x: this.seq, y: this.rtt_timestamp, i: this.p_num});
                        });
                        return cli_srv_data;
                    }())
                },
                {
                    name: 'Receiver → Sender',
                    data: (function () {
                        var srv_cli_data = [];
                        $.each(json.server.roundtrip, function () {
                            if (this.replied == 0) return;
                            srv_cli_data.push({x: this.seq, y: this.rtt_timestamp, i: this.p_num});
                        });
                        return srv_cli_data;
                    }())
                }
            ]
        });
        $('#graph_rtt').highcharts(rtt_options);

        // --------- Sequence numbers
        var seq_options = jQuery.extend(true, {}, Statistics.charts_options, {
            tooltip: {
                formatter: function () {
                    var ret = 'Packet number: <strong>' + this.point.i + '</strong><br/>';
                    ret += 'Time: <strong>' + Statistics.numberShortener(this.x) + ' ms</strong><br />';
                    ret += 'Sequence number: <strong>' + this.y + ' B</strong>';
                    return ret;
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
                    name: 'Sender → Receiver',
                    data: json.client.seq_numbers,
                    lineWidth: 1,
                    marker: {
                        enabled: true,
                        radius: 2
                    }
                },
                {
                    name: 'Receiver → Sender',
                    data: json.server.seq_numbers,
                    lineWidth: 1,
                    marker: {
                        enabled: true,
                        radius: 2
                    }
                }
            ]
        });


        $('#graph_seq').highcharts(seq_options);
    },

    /**
     * Properly formats scaling window
     * @param streamer_data
     * @returns {string}
     */
    scaling_window: function (streamer_data) {
        return streamer_data.windows_scale + ' (' + (streamer_data.windows_scale == 0 ? "no scaling" : Math.pow(2, streamer_data.windows_scale)) + ')'
    },

    /**
     * Setups summary information.
     * @param json with needed data
     */
    summary: function (json) {
        $('#log_filename').html(logFile);
        $('#input_filename').html(json.summary.input_filename);
        $('#packets_number').html(json.summary.packets_count);
        $('#initial_rtt').html(Statistics.numberShortener(json.summary.initial_rtt) + ' ms');

        $('#sen_ip').html(json.client.ip_address);
        $('#rec_ip').html(json.server.ip_address);
        // data sent
        var kb_cli_sent = json.client.data_sent / 1024;
        var kb_srv_sent = json.server.data_sent / 1024;
        $('#cli_data_sent').html(Statistics.numberShortener(kb_cli_sent) + ' kB');
        $('#srv_data_sent').html(Statistics.numberShortener(kb_srv_sent) + ' kB');
        $('#all_data_sent').html(Statistics.numberShortener(kb_cli_sent + kb_srv_sent) + ' kB');
        // window scaling factor
        $('#cli_win_scale').html(this.scaling_window(json.client));
        $('#srv_win_scale').html(this.scaling_window(json.server));
    }
};
