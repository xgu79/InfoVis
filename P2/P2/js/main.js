var svg = d3.select('svg');

var svgHeight = 600;
var svgWidth = 760;
var updownMargin = 100;
var leftrightMargin = 30;
var barWidth = 40;
var data_arr;
var maxy;

var chart1 = svg.append("g")
        .attr('transform', 'translate(10, 0)');

d3.csv('./data/coffee_data.csv', function(error, dataset) {
    data_arr = dataset
    var salesPerYears = d3.nest()
        .key(function(d) {return d.region;})
        .rollup(function(v) {return d3.sum(v, function(d) {return d.sales;})
        })
        .entries(data_arr);
    maxy = d3.max(salesPerYears, function(d) {return +d.value;});
    var c = d3.scaleOrdinal()
        .domain(['Central','East','South','West'])
        .range(['#ffb3b3','#b3daff','#e2a96f','#b3fff0']);
    var x = d3.scaleOrdinal()
        .domain(['Central','East','South','West'])
        .range([70, 130, 190, 250]);
    var y = d3.scaleLinear()
        .domain([0,maxy])
        .range([svgHeight - updownMargin, updownMargin]);

    chart1.selectAll("rect")
        .data(salesPerYears)
            .enter()
            .append("rect")
        .attr("height", function(d) {return svgHeight - updownMargin - y(+d.value)})
        .attr("y", function(d) {return y(+d.value)})
        .attr("width", barWidth)
        .attr("x", function(d,i) {return (leftrightMargin+ i*60 + 40)})
        .attr("fill", function(d,i) {return c(d.key)});

    chart1.append('g')
        .attr('class', 'x axis')
        .attr('transform','translate(20,520)')
        .call(d3.axisBottom(x)
            .tickFormat(function(d) {return d;}));
            
    chart1.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(50, 0)')
        .call(d3.axisLeft(y)
            .tickFormat(function(d) {return d/1000 +'k';})
            .ticks(5));

    chart1.append('text')
        .attr('class', 'lable')
        .attr('transform', 'translate(5, 350) rotate(-90)')
        .text('Coffee Sales (USD)');

    chart1.append('text')
        .attr('class', 'lable')
        .attr('transform', 'translate(150, 560)')
        .text('Region');

    chart1.append('text')
        .attr('class', 'title')
        .attr('transform', 'translate(160, 60)')
        .text('Coffee Sales by Region (USD)');
})

var chart2 = svg.append("g")
        .attr('transform', 'translate(400, 0)');

d3.csv('./data/coffee_data.csv', function(error, dataset) {
    data_arr = dataset
    var salesPerCategory = d3.nest()
        .key(function(d) {return d.category;})
        .rollup(function(v) {return d3.sum(v, function(d) {return d.sales;})
        })
        .entries(data_arr);

    var c = d3.scaleOrdinal()
        .domain(['Coffee','Tea','Espresso','Herbal Tea'])
        .range(['#D2691E',' #008000','#8B4513','#808080']);
    var x = d3.scaleOrdinal()
        .domain(['Coffee','Tea','Espresso','Herbal Tea'])
        .range([70, 130, 190, 250]);
    var y = d3.scaleLinear()
        .domain([0,maxy])
        .range([svgHeight - updownMargin, updownMargin]);

    chart2.selectAll("rect")
        .data(salesPerCategory)
            .enter()
            .append("rect")
        .attr("height", function(d) {return svgHeight - updownMargin - y(+d.value)})
        .attr("y", function(d) {return y(+d.value)})
        .attr("width", barWidth)
        .attr("x", function(d,i) {return (leftrightMargin+ i*60 + 40)})
        .attr("fill", function(d,i) {return c(d.key)});

    chart2.append('g')
        .attr('class', 'x axis')
        .attr('transform','translate(20,520)')
        .call(d3.axisBottom(x)
            .tickFormat(function(d) {return d;}));
            
    chart2.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(50, 0)')
        .call(d3.axisLeft(y)
            .tickFormat(function(d) {return d/1000 +'k';})
            .ticks(5));

    chart2.append('text')
        .attr('class', 'lable')
        .attr('transform', 'translate(5, 350) rotate(-90)')
        .text('Coffee Sales (USD)');

    chart2.append('text')
        .attr('class', 'lable')
        .attr('transform', 'translate(150, 560)')
        .text('Product');

    chart2.append('text')
        .attr('class', 'title')
        .attr('transform', 'translate(160, 60)')
        .text('Coffee Sales by Product (USD)');
})
