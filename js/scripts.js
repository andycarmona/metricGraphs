var graphWidth;
var graphHeight;
var widthConstant = 2.5;
var heightConstant = 2.5;
var bar_data = [
    { 'label': 'first', 'value': 4, 'baseline': 4.2, 'prediction': 2 },
    { 'label': 'second', 'value': 2.1, 'baseline': 3.1, 'prediction': 3 },
    { 'label': 'third', 'value': 6.3, 'baseline': 6.3, 'prediction': 4 },
    { 'label': 'fourth', 'value': 5.7, 'baseline': 3.2, 'prediction': 5 },
    { 'label': 'fifth', 'value': 5, 'baseline': 4.2, 'prediction': 3 },
    { 'label': 'sixth', 'value': 4.2, 'baseline': 10.2, 'prediction': 3 },
    { 'label': 'yet another', 'value': 4.2, 'baseline': 10.2, 'prediction': 3 },
    { 'label': 'and again', 'value': 4.2, 'baseline': 10.2, 'prediction': 3 },
    { 'label': 'and sss', 'value': 4.2, 'baseline': 10.2, 'prediction': 3 }
];

var functionGraph = {
    title: "Singleton",
    description: "Handling a solitary data point.",
    width: 600,
    height: 200,
    right: 40,
    target: '#functionResult',
    xax_format: function (f) {
        var pf = d3.formatPrefix(f);
        return Math.round(pf.scale(f)) + pf.symbol;
    },
    x_accessor: 'xValue',
    y_accessor: 'yValue'
}


var plotterData = [
            { 'Id': 1, 'xValue': 4, 'yValue': 8 }];

var sampleDataNextID = plotterData.length + 1;
var localDataSource = new kendo.data.DataSource({ data: plotterData });

$(document).ready(function () {
    graphWidth = $(window).width();
    grapHeight = $(window).height();

    ShowGraphic();
    ShowPointGraph(plotterData);
    ShowPlotGraph();
    ShowHistogram();
    ShowBarData();
    ShowGrid();
});

function loadBackground() {
    var s = Snap("#svgout");
    var tux = Snap.load("/metrics/svg/webmap.svg", function (loadedFragment) {
        s.append(loadedFragment);
    });
}


function getIndexById(id) {
    var idx,
        l = plotterData.length;

    for (var j=0; j < l; j++) {
        if (plotterData[j].Id == id) {
            return j;
        }
    }
    return null;
}
function ShowGrid() {
    var localDataSource = new kendo.data.DataSource({
        transport: {
            read: function (e) {
                // on success
                e.success(plotterData);
                // on failure
                //e.error("XHR response", "status code", "error message");
            },
            create: function (e) {
			
                // assign an ID to the new item
                e.data.Id = sampleDataNextID++;
                // save data item to the original datasource
              
                e.data.yValue = e.data.xValue * 2;
                plotterData.push(e.data);
                ShowPointGraph(plotterData);
                // on success
                e.success(e.data);
                // on failure
                // e.error("XHR response", "status code", "create error message");
            },
            update: function (e) {
			$('#grid').data().kendoGrid.dataSource.sort({
    field: 'Id',
    dir: 'desc'
});
                // locate item in original datasource and update it
                var valueByIndex = getIndexById(e.data.Id);
				var yField = $('#grid').data().kendoGrid.dataSource.data()[valueByIndex];
                plotterData[valueByIndex].xValue = e.data.xValue;
                plotterData[valueByIndex].yValue = e.data.xValue * 2;
                yField.set('yValue',e.data.xValue * 2);
                ShowPointGraph(plotterData);
                // on success
                e.success()

                // on failure
                //e.error("XHR response", "status code", "update error message");
            },
            destroy: function (e) {
                // locate item in original datasource and remove it
                plotterData.splice(getIndexById(e.data.Id), 1);
                ShowPointGraph(plotterData);
                // on success
                e.success();
                // on failure
                //e.error("XHR response", "status code", "error message");
            }
        },
        error: function (e) {
            // handle data operation error
            alert("Status: " + e.status + "; Error message: " + e.errorThrown);
        },
        pageSize: 10,
        batch: false,
        schema: {
            model: {
                fields: {
                    Id: { editable: false, nullable: true },
                    xValue: { type: "number", validation: { required: true, min: 1 } },
                    yValue: {   type: "number", validation: {  min: 1 } }
                }
            }
        }
    });
    // localDataSource.data(newPlotterData);
    $("#grid").kendoGrid({
        dataSource: localDataSource,
        toolbar: ["create"],
        scrollable: true,
        columns: [
              { field: "xValue", title: "X Value" },
              { field: "yValue", title: "Y value" },
              { command: ["edit", "destroy"], title: "&nbsp;", width: "200px" }
        ],
        editable: "inline"
    });
}
function ShowBarData() {
    MG.data_graphic({
        title: "Bar Prototype",
        description: "Work-in-progress",
        data: bar_data,
        chart_type: 'bar',
        x_accessor: 'value',
        y_accessor: 'label',
        baseline_accessor: 'baseline',
        predictor_accessor: 'prediction',
        width: graphWidth / widthConstant,
        height: grapHeight / heightConstant,
        right: 10,
        target: '#pointResult',
        animate_on_load: true,
        x_axis: false
    });
}

function ShowGraphic() {
    d3.json('data/ufo-sightings.json', function (data) {
        MG.data_graphic({
            title: "UFO Sightings",
            description: "Yearly UFO sightings from the year 1945 to 2010.",
            data: data,
            width: graphWidth / widthConstant,
            height: graphHeight,
            target: '#normalResult',
            x_accessor: 'year',
            y_accessor: 'sightings',
            markers: [{ 'year': 1964, 'label': '"The Creeping Terror" released' }],
            legend: ['Line 1', 'Line 2', 'Line 3'],
            legend_target: '.legend'
        })
    });
}
function ShowPointGraph(pointData) {

    functionGraph.data = pointData;
    MG.data_graphic(functionGraph);
}

function ShowHistogram() {
    d3.csv('data/ufo_dates.csv', function (ufos) {
        var data = ufos.map(function (d) {
            return parseInt(d.value) / 30;
        });
        data.sort();
        var p75 = data[Math.floor(data.length * 3 / 4)];
        MG.data_graphic({
            title: "Difference in UFO Sighting and Reporting Dates (in months)",
            description: "Semi-real data about the reported differences between the supposed sighting of a UFO, and the date it was reported. I inflated the low values and inflated the high ones to make the histogram a little more pleasing for the demo. The data set comes from some random UFO sightings csv I had on my computer.",
            data: data,
            markers: [{ 'label': '75% of reports come <' + d3.round(p75 / 12) + ' years after the initial sighting', 'value': p75 }],
            chart_type: 'histogram',
            width: graphWidth / widthConstant,
            height: graphHeight,
            right: 40,
            bar_margin: 0,
            bins: 150,
            target: '#histogramResult',
            y_extended_ticks: true,
            mouseover: function (d, i) {
                var string;
                if (d.x < 12) {
                    string = d3.round(d.x, 2) + ' Months';
                } else {
                    string = d3.round(d.x, 2) + ' Months';
                }
                d3.select('#histogramResult svg .mg-active-datapoint')
                    .text(string + '       Volume: ' + d.y);
            }
        });
    });
}

function ShowPlotGraph() {
    d3.json('data/fake_users1.json', function (data) {
        data = MG.convert.date(data, 'date');
        MG.data_graphic({
            title: "Another Least Squares Example",
            description: "Least squares effortlessly works with dates or times on axes.",
            data: data,
            chart_type: 'point',
            width: graphWidth / widthConstant,
            height: grapHeight/3,
            left: 60,
            right: 10,
            least_squares: true,
            target: '#plotterResult',
            x_accessor: 'date',
            y_accessor: 'value'
        });
    });
}

