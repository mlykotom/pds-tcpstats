/**
 * @author Tomas Mlynaric
 */

var server_window = log.server.window;
var chro = [];
for (var x = 0; x < server_window.data.length; x++) {
    chro.push(x);
}

var data = {
    labels: chro,
    //labels: server_window.time,
    datasets: [
        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: server_window.data
        },
        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: log.client.window.data
        }
    ]
};


var ctx = $("#myChart").get(0).getContext("2d");
var myLineChart = new Chart(ctx).Line(data, {
    responsive: true
});
