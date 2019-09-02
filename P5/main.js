
var margin = {top:50, left:50, right:50, bottom:50},
    height = 900 - margin.top - margin.bottom,
    width = 1300 - margin.left - margin.right;

var detailBox_margin = {top:30, left:10, right:10, bottom:10},
    detailBox_height = 800 - detailBox_margin.top - detailBox_margin.bottom,
    detailBox_width = 350 - detailBox_margin.left - detailBox_margin.right;
    
var mapBox_margin = {top:10, left:10, right:10, bottom:10},
    mapBox_height = 700 - mapBox_margin.top - mapBox_margin.bottom,
    mapBox_width = 700 - detailBox_margin.left - detailBox_margin.right;

var margin_text = 10,
    margin_number = 30;

var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);


var canvas = d3.select("#canvas")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        

var detailBox = canvas.append("g")
        .attr("transform", "translate(" + 15 + "," + 0 + ")");
        
detailBox.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", detailBox_height)
        .attr("width", detailBox_width)
        .attr("class", "framed");

//aircraft incidents by country
detailBox.append("text")
    .attr("x", detailBox_margin.left)
    .attr("y", 20)
    .attr("class", "labels")
    .text("Aircraft Incidents by Country");

detailBox.append("text")
    .attr("x", margin_text)
    .attr("y", 50)
    .attr("class", "texts")
    .text("Total Crushes");

var total_crashes_number = detailBox.append("text")
    .attr("x", margin_number)
    .attr("y", 80)
    .attr("class", "numbers");

detailBox.append("text")
    .attr("x", margin_text)
    .attr("y", 110)
    .attr("class", "texts")
    .text("Total Fatal Injuries");

var total_fatal_injuries = detailBox.append("text")
    .attr("x", margin_number)
    .attr("y", 140)
    .attr("class", "numbers");

detailBox.append("text")
    .attr("x", margin_text)
    .attr("y", 170)
    .attr("class", "texts")
    .text("Total Serious Injuries");

var total_serious_injuries = detailBox.append("text")
    .attr("x", margin_number)
    .attr("y", 200)
    .attr("class", "numbers");

detailBox.append("text")
    .attr("x", margin_text)
    .attr("y", 230)
    .attr("class", "texts")
    .text("Total Uninjured");

var total_uninjured = detailBox.append("text")
    .attr("x", margin_number)
    .attr("y", 260)
    .attr("class", "numbers");


//bar chart
var barSvg_width = detailBox_width - detailBox_margin.right-detailBox_margin.left,
    barSvg_height = detailBox_height - 350- detailBox_margin.bottom;
var barSvg_margin = {top:10, left:20, right:12, bottom:20};

detailBox.append("text")
    .attr("x", barSvg_margin.left)
    .attr("y", 300)
    .attr("class", "labels")
    .text("Aircraft Incidents by Year");

var barSvg = detailBox.append("svg")
    .attr("x", margin_text)
    .attr("y", 300)
    .attr("width", barSvg_width + barSvg_margin.left+barSvg_margin.right)
    .attr("height", barSvg_height + barSvg_margin.top + barSvg_margin.bottom)
    .append("g")
    .attr("transform", "translate("+barSvg_margin.left+","+ barSvg_margin.top+")");

var y = d3.scaleBand()
        .range([0,  barSvg_height-barSvg_margin.top-barSvg_margin.bottom])
        .padding(0.1);
var x = d3.scaleLinear()
        .range([0, barSvg_width-barSvg_margin.left-barSvg_margin.right-3]);


//the map
var svg = canvas.append("g")
        .attr("transform", "translate("+ (detailBox_width - detailBox_margin.right - mapBox_margin.left+mapBox_margin.left) + "," + 0 + ")");

var projection = d3.geoMercator()
    .translate([width / 2, height / 2])
    .scale(120)

var path = d3.geoPath()
    .projection(projection)

d3.queue()
    .defer(d3.json, "world_countries.json")
    .defer(d3.csv, "aircraft_incidents.csv")
    .await(ready)

/*
add crash circle to the map
show its detail in the tooltip when hover
*/
function ready(error, data, crashes) {

    /* 
    build the bar chart
    cal nest total crashes each year
    filter the crash circles in the map according to selected year
    */
    data_arr = crashes
    var crashesPerYear = d3.nest()
        .key(function(d){return d.Event_Date.split("/")[2];})
        .rollup(function(v) { return v.length;})
        .entries(data_arr)
        .sort(function(a,b) {return d3.ascending(a.key, b.key);});

    y.domain(crashesPerYear.map(function(d) {return d.key;}));
    x.domain([0, d3.max(crashesPerYear, function(d) { return d.value; })]);

    barSvg.selectAll(".bar")
        .data(crashesPerYear)
        .enter().append("rect")
        .style("fill","LightSkyBlue")
        .attr("class", "bar")
        .attr("x", barSvg_margin.left)
        .attr("y", d=>y(d.key))
        .attr("width", d=> x(d.value))
        .attr("height", (y.bandwidth()-2))
        .on('mouseover', function() {
            d3.select(this)
                .attr("transform", "translate(4, 0)")
                .style("stroke","red")
                .style("stroke-width",1);
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr("transform", "translate(0,0)")
                .style("stroke", "none");
        })
        .on('click', function(d) {
            var filteredCircle = data_arr.filter(function(c) {
                return c.Event_Date.split("/")[2] == d.key;
            });

            var circleSelection = svg.selectAll(".crash-circle").data(filteredCircle);
            circleSelection.exit()
                .transition().duration(d=> Math.random()*1000)
                .delay(2)
                .remove();

            circleSelection.enter()
                .append("circle")
                .attr("class", "crash-circle")
            .merge(circleSelection)
                .attr("r", 2)
            .attr("cx", function(d) {
                var coords = projection([d.Longitude, d.Latitude])
                return coords[0];
            })
            .attr("cy", function(d) {
                var coords = projection([d.Longitude, d.Latitude])
                return coords[1];
            })
            .on("mouseover", function(d,i) {
                d3.select(this)
                  .classed("crash-circle", false)
                  .style("fill", "#40E0D0")
                  .attr("r", 4);

                //tooltip
                var date_now = d.Event_Date;
                var make_now = d.Make;
                var model_now = d.Model;
                div.transition()        
                        .duration(200)      
                        .style("opacity", .9);      
                    div.html([date_now + '\n' + make_now + '\n' + model_now] + "<br/>")  
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px");

            })
            .on("mouseout", function(d) {
                d3.select(this)
                  .classed("crash-circle", true)
                  .style("fill", "darkblue")
                  .attr("r", 2);
                div.transition()        
                .duration(500)      
                .style("opacity", 0);
            });

        });

    barSvg.append("g")
        .attr("transform", "translate("+barSvg_margin.left+"," + (barSvg_height-barSvg_margin.bottom) +")")
        .call(d3.axisBottom(x));

    barSvg.append("g")
        .call(d3.axisLeft(y))
        .attr("transform", "translate(0"  + ",0)");



    /*
    cal nest total crashes in each country
    color the country based on the total crushes
    */
    var crashesPerCountry = d3.nest()
        .key(function(d) {return d.Country;})
        .rollup(function(v) {return v.length;})
        .entries(data_arr)
        .sort(function(a,b){ return d3.descending(a.value, b.value); });
    var fatalInjuriesPerCountry = d3.nest()
        .key(function(d) {return d.Country;})
        .rollup(function(v) { return d3.sum(v, function(d) {return d.Total_Fatal_Injuries;})})
        .entries(data_arr);
    var seriouisInjuriesPerCountry = d3.nest()
        .key(function(d) {return d.Country; })
        .rollup(function(v) {return d3.sum(v, function(d) {return d.Total_Serious_Injuries;})})
        .entries(data_arr);
    var uninjuredPerCountry = d3.nest()
        .key(function(d) { return d.Country; })
        .rollup(function(v) {return d3.sum(v, function(d) {return d.Total_Uninjured; })})
        .entries(data_arr);

    var crashesByCountry = {},
        fatalInjuriesByCountry = {},
        seriouisInjuriesByCountry = {},
        uninjuredByCountry = {},
        crashesRank = {};
    crashesPerCountry.forEach(function(d) {crashesByCountry[d.key] = +d.value; });
    fatalInjuriesPerCountry.forEach(function(d) { fatalInjuriesByCountry[d.key] = +d.value;});
    seriouisInjuriesPerCountry.forEach(function(d) {seriouisInjuriesByCountry[d.key] = +d.value;});
    uninjuredPerCountry.forEach(function(d) {uninjuredByCountry[d.key] = +d.value;});
    crashesPerCountry.forEach(function(d, i) {crashesRank[d.key] = +i + 1; })
    
    var color = d3.scaleThreshold()
        .domain([2, 10, 20, 40, 70, 100])
        .range(["#ffa500", "ff8c00", "#ff7f50", "#ff6347", "#ff4500", "#f00000"])

    var countries = topojson.feature(data, data.objects.countries1).features;
    
    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", function(d) {
                if (crashesByCountry[d.properties.name] > 0)
                    return color(crashesByCountry[d.properties.name]);
                else
                    return "#ffffe0"
        })
        .style('stroke', 'white')
        .style('stroke-width', 1.5)
        .style("opacity",0.8)
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          d3.select(this)
            .style("opacity", 1)
            .style("stroke","white")
            .style("stroke-width",3);
        })
        .on('mouseout', function(d){
          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke","white")
            .style("stroke-width",0.3);
        })
        .on('click', function(d) {
            if (typeof crashesRank[d.properties.name] =='undefined'){
                document.getElementById("rank").innerHTML = 'NaN';
            } else {
                document.getElementById("rank").innerHTML = crashesRank[d.properties.name];
            }
            document.getElementById("name").innerHTML = "   " + d.properties.name;
            total_crashes_number.text(crashesByCountry[d.properties.name]);
            total_fatal_injuries.text(fatalInjuriesByCountry[d.properties.name]);
            total_serious_injuries.text(seriouisInjuriesByCountry[d.properties.name]);
            total_uninjured.text(uninjuredByCountry[d.properties.name]);
        });

    svg.selectAll(".crash-circle")
        .data(crashes)
        .enter().append("circle")
        .attr("class", "crash-circle")
        .attr("r", 2)
        .attr("cx", function(d) {
            var coords = projection([d.Longitude, d.Latitude])
            return coords[0];
        })
        .attr("cy", function(d) {
            var coords = projection([d.Longitude, d.Latitude])
            return coords[1];
        })
        .on("mouseover", function(d,i) {
            d3.select(this)
              .classed("crash-circle", false)
              .style("fill", "#40E0D0")
              .attr("r", 4);

            //tooltip
            var date_now = d.Event_Date;
            var make_now = d.Make;
            var model_now = d.Model;
            div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html([date_now + '\n' + make_now + '\n' + model_now] + "<br/>")  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");

        })
        .on("mouseout", function(d) {
            d3.select(this)
              .classed("crash-circle", true)
              .style("fill", "darkblue")
              .attr("r", 2);
            div.transition()        
                .duration(500)      
                .style("opacity", 0);
        });

    //bar chart reset button
var button =     
    detailBox.append("rect")
        .attr("x", 20+detailBox_margin.left)
        .attr("y", 745)
        .attr("height", 40)
        .attr("width", 120)
        .style("border", "1px solid black")
        .style("fill", "#cccccc")
        .style("opacity", "0.8")
        .on('click', function() {
            var circleSelection = svg.selectAll(".crash-circle").data(data_arr);
            circleSelection.exit()
                .transition().duration(d=>Math.random()*1000)
                .delay(2)
                .remove();
            circleSelection.enter()
                .append("circle")
                    .attr("class", "crash-circle")
                    .attr("r", 2)
                    .attr("cx", function(d) {
                        var coords = projection([d.Longitude, d.Latitude])
                        return coords[0];
                    })
                    .attr("cy", function(d) {
                        var coords = projection([d.Longitude, d.Latitude])
                        return coords[1];
                    })
                    .on("mouseover", function(d,i) {
                        d3.select(this)
                          .classed("crash-circle", false)
                          .style("fill", "#40E0D0")
                          .attr("r", 4);

                        //tooltip
                        var date_now = d.Event_Date;
                        var make_now = d.Make;
                        var model_now = d.Model;
                        div.transition()        
                                .duration(200)      
                                .style("opacity", .9);      
                            div.html([date_now + '\n' + make_now + '\n' + model_now] + "<br/>")  
                                .style("left", (d3.event.pageX) + "px")     
                                .style("top", (d3.event.pageY - 28) + "px");

                    })
                    .on("mouseout", function(d) {
                        d3.select(this)
                          .classed("crash-circle", true)
                          .style("fill", "darkblue")
                          .attr("r", 2);
                        div.transition()        
                            .duration(500)      
                            .style("opacity", 0);
                    });
        });

detailBox.append("text")
    .attr("x", 20+detailBox_margin.left)
    .attr("y", 765)
    .attr("class", "labels2")
    .text("Reset Year Filter");
}



