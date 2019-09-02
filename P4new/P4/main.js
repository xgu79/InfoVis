var width =500;
var height= 500;

d3.csv("calvinCollegeSeniorScores.csv", function(csv) {
    for (var i=0; i<csv.length; ++i) {
		csv[i].GPA = Number(csv[i].GPA);
		csv[i].SATM = Number(csv[i].SATM);
		csv[i].SATV = Number(csv[i].SATV);
		csv[i].ACT = Number(csv[i].ACT);
    }
    var satmExtent = d3.extent(csv, function(row) { return row.SATM; });
    var satvExtent = d3.extent(csv, function(row) { return row.SATV; });
    var actExtent = d3.extent(csv,  function(row) { return row.ACT;  });
    var gpaExtent = d3.extent(csv,  function(row) {return row.GPA;   });    

    
    var satExtents = {
	"SATM": satmExtent,
	"SATV": satvExtent
    }; 


    // Axis setup
    var xScale = d3.scaleLinear().domain(satmExtent).range([50, 470]);
    var yScale = d3.scaleLinear().domain(satvExtent).range([470, 30]);
 
    var xScale2 = d3.scaleLinear().domain(actExtent).range([50, 470]);
    var yScale2 = d3.scaleLinear().domain(gpaExtent).range([470, 30]);
     
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);
  
    var xAxis2 = d3.axisBottom().scale(xScale2);
    var yAxis2 = d3.axisLeft().scale(yScale2);

    //Create SVGs and <g> elements as containers for charts
    var chart1G = d3.select("#chart1")
	                .append("svg:svg")
	                .attr("width",width)
	                .attr("height",height)
                    .append('g');


    var chart2G = d3.select("#chart2")
	                .append("svg:svg")
	                .attr("width",width)
	                .attr("height",height)
                    .append('g');


    var brushContainer1G = chart1G.append('g')
                                .attr('id', 'brush-container-1');

    var brushContainer2G = chart2G.append('g')
                                .attr('id', 'brush-container-2');

    //the brushes
    var brush1 = d3.brush()
                    .extent([[-10,-10], [width+10, height+10]]);
    brush1.on('start', handleBrushStart1)
            .on('brush', handleBrushMove1)
            .on('end', handleBrushEnd);
    brushContainer1G.call(brush1);

    //Brush2
    var brush2 = d3.brush()
                    .extent([[-10,-10],[width+10,height+10]]);
    brush2.on('start', handleBrushStart2)
            .on('brush', handleBrushMove2)
            .on('end', handleBrushEnd);
    brushContainer2G.call(brush2);

    //clear Brush2
    function handleBrushStart1() {
        brush2.move(brushContainer2G, null);
    }
    function handleBrushStart2() {
        brush1.move(brushContainer1G, null);
    }

    function handleBrushMove1() {
        var sel = d3.event.selection;
        if (!sel) {
            return;
        }
        //[[x0.y0],[x1,y1]]
        var [[left, top], [right, bottom]] = sel;
        //check all the dots, highlight the ones inside brush1
        //no need to handle chart2G separately???
        chart2G.selectAll("circle")
            .classed('selected2', function(d) {
                var cx = xScale(d.SATM);
                var cy = yScale(d.SATV);
                return (left<=cx && cx<=right && top<=cy && cy<=bottom);
            });
    }

    function handleBrushMove2() {
        var sel = d3.event.selection;
        if (!sel) {
            return;
        }
        var [[left, top], [right, bottom]] = sel;
        chart1G.selectAll("circle")
            .classed('selected', function(d) {
                var cx = xScale2(d.ACT);
                var cy = yScale2(d.GPA);
                return left<=cx && cx<=right && top<=cy && cy<=bottom;
                //return true;
            })
    }
    function handleBrushEnd() {
        //Clear existing styles
        if (!d3.event.selection) {
            clearSelection();
        }
    }
    function clearSelection(){
        d3.selectAll("circle").classed('selected', false)
        d3.selectAll("circle").classed('selected2', false);
    }

	 //add scatterplot points
     var temp1= chart1G.selectAll("circle")
	   .data(csv)
	   .enter()
	   .append("circle")
	   .attr("id",function(d,i) {return i;} )
	   .attr("stroke", "black")
	   .attr("cx", function(d) { return xScale(d.SATM); })
	   .attr("cy", function(d) { return yScale(d.SATV); })
	   .attr("r", 5)
	   .on("click", function(d,i){ 
            document.getElementById("satm").innerHTML = d.SATM;
            document.getElementById("satv").innerHTML = d.SATV;
            document.getElementById("act").innerHTML = d.ACT;
            document.getElementById("gpa").innerHTML = d.GPA;
            clearSelection();
            chart2G.selectAll("circle")
                .classed('selected2', function(d) {
                    return d3.select(this).attr("id") == i;
                });
       });

    var temp2= chart2G.selectAll("circle")
	   .data(csv)
	   .enter()
	   .append("circle")
	   .attr("id",function(d,i) {return i;} )
	   .attr("stroke", "black")
	   .attr("cx", function(d) { return xScale2(d.ACT); })
	   .attr("cy", function(d) { return yScale2(d.GPA); })
	   .attr("r", 5)
	   .on("click", function(d,i){ 
            document.getElementById("satm").innerHTML = d.SATM;
            document.getElementById("satv").innerHTML = d.SATV;
            document.getElementById("act").innerHTML = d.ACT;
            document.getElementById("gpa").innerHTML = d.GPA;
            clearSelection();
            chart1G.selectAll("circle")
                .classed('selected', function(d) {
                    return d3.select(this).attr("id") == i;
                });
       });
    


    chart1G // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(0,"+ (width -30)+ ")")
		.call(xAxis) // call the axis generator
		.append("text")
		.attr("class", "label")
		.attr("x", width-16)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("SATM");

    chart1G // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(50, 0)")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("SATV");

    chart2G // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(0,"+ (width -30)+ ")")
		.call(xAxis2)
		.append("text")
		.attr("class", "label")
		.attr("x", width-16)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("ACT");

    chart2G // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(50, 0)")
		.call(yAxis2)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("GPA");
	





});