//Make page responsive when resizing

function makeResponsive() {
}

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(acsData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(acsData, d => d[chosenXAxis]) * 0.8,
      d3.max(acsData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;

}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "In Poverty %:";
  }
  else if (chosenXAxis === "age") {
    var label = "Age (Median):";
  }
  else {var label = "House Income (Median)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(acsData, err) {
  if (err) throw err;

  // parse data
  acsData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
    console.log(data);
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(acsData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([20, d3.max(acsData, d => d.obesity)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(acsData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  // Append the State abbreviations to the markers 
  // var circletextGroup = 
  chartGroup.selectAll(null)
    .data(acsData)
    .enter()
    .append("text")
    .text(d => (d.abbr))
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .style("font-size", "12px")
    .style("text-anchor", "middle")
    .style('fill', 'black');

  // Create group for  3 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty %");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median):");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median):");  
  
    // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obesity %:");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(acsData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } 
        else { 
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

// // When the browser loads, makeResponsive() is called.
makeResponsive();

// // // When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);


// // =========================================================================================//
// // =========================================================================================//
// //                                 BONUS CODE                                               //
// // =========================================================================================//
// // The code for the chart is wrapped inside a function that
// // automatically resizes the chart
// function makeResponsive() {
// // //      // if the SVG area isn't empty when the browser loads,
// // //   // remove it and replace it with a resized version of the chart
// // //   // var svgArea = d3.select("body").select("svg");

// // //   // // clear svg is not empty
// // //   // if (!svgArea.empty()) {
// // //   //   svgArea.remove();
//   }
// // Define SVG area dimensions
// var svgWidth = 1000;
// var svgHeight = 660;

// // Define the chart's margins as an object
// var margin = {
//     top: 20,
//     right: 40,
//     bottom: 100,
//     left: 100
// };

// // Define dimensions of the chart area
// var width = svgWidth - margin.left - margin.right;
// var height = svgHeight - margin.top - margin.bottom;;

// // Select body, append SVG area to it, and set the dimensions
// var svg = d3
//   .select("#scatter")
//   .append("svg")
//   .attr("height", svgHeight)
//   .attr("width", svgWidth);

// // Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// // to the margins set in the "chartMargin" object.
// var chartGroup = svg.append("g")
//   .attr("transform", `translate(${margin.left}, ${margin.top})`);

// // Initial Params
// var chosenXAxis = "income";
// var chosenYAxis = "obesity";

// // function used for updating x-scale var upon click on axis label
// function xScale(acsData, chosenXAxis) {
//   // create scales
//   var xLinearScale = d3.scaleLinear()
//     .domain([d3.min(acsData, d => d[chosenXAxis]) * 0.8,
//       d3.max(acsData, d => d[chosenXAxis]) * 1.2
//     ])
//     .range([0, width]);

//   return xLinearScale;

// }
// // function used for updating y-scale var upon click on axis label
// function yScale(acsData, chosenYAxis) {
//   // create scales
//   var yLinearScale = d3.scaleLinear()
//     .domain([d3.min(acsData, d => d[chosenYAxis]) * 0.8,
//       d3.max(acsData, d => d[chosenYAxis]) * 1.2
//     ])
//     .range([height, 0]);

//   return yLinearScale;

// }

// // function used for updating xAxis var upon click on axis label
// function renderAxes(newXScale, xAxis) {
//   var bottomAxis = d3.axisBottom(newXScale);

//   xAxis.transition()
//     .duration(1000)
//     .call(bottomAxis);

//   return xAxis;
// }

// // function used for updating yAxis var upon click on axis label
// function renderAxes(newYScale, yAxis) {
//   var leftAxis = d3.axisLeft(newYScale);

//   yAxis.transition()
//     .duration(1000)
//     .call(leftAxis);

//   return yAxis;
// }

// // function used for updating circles group with a transition to
// // new circles
// function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {
  
//   circlesGroup.transition()
//             .duration(1000)
//             .attr("cx", d => newXScale(d[chosenXAxis]))
//             .attr("cy", d => newYScale(d[chosenYAxis]));

//         return circlesGroup;
//     }

// //   if (chosenXAxis) { 
// //     circlesGroup.transition()
// //     .duration(1000)
// //     .attr("cx", d => newXScale(d[chosenXAxis]));
// //   }

// //   if (chosenYAxis) {
// //     circlesGroup.transition()
// //     .duration(1000)
// //     .attr("cx", d => newYScale(d[chosenYAxis]));
// //   }
// //   return circlesGroup;
// // }
// // Function used for updating text in circles group with a transition to new text.
// function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
//   circletextGroup.transition()
//       .duration(1000)
//       .attr("x", d => newXScale(d[chosenXAxis]))
//       .attr("y", d => newYScale(d[chosenYAxis]));
  
//   return circletextGroup;
// }
// // function used for updating circles group with new tooltip
// function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
//   // X axis conditions
//   if (chosenXAxis === "income") {
//     var xlabel = "Income Level:";
//   }
//   else if (chosenXAxis === "poverty") {
//     var xlabel = "In Poverty:";
//   }
//   else {
//     var xlabel = "Age:";
//   }

//   // Y axis conditions
//   if (chosenYAxis === "obesity") {
//     var ylabel = "Obesity %:";
//   }
//   else if (chosenYAxis === "smokes") {
//     var ylabel = "Smokes %:";
//   }
//   else {
//     var ylabel = "Lacks Healthcare:";
//   }

//   //Initialize tool tip
//   var toolTip = d3.tip()
//   .attr("class", "tooltip")
//   .style("background", "black")
//   .style("color", "white")
//   .offset([120, -60])
//   .html(function(d) {
//       if (chosenXAxis === "age") {
//           // All yAxis tooltip labels presented and formated as %.
//           // Display Age without format for xAxis.
//           return (`${d.state}<hr>${label} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
//         } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
//           // Display Income in dollars for xAxis.
//           return (`${d.state}<hr>${label}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
//         } else {
//           // Display Poverty as percentage for xAxis.
//           return (`${d.state}<hr>${label}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
//         }      
//   });
// // var toolTip = d3.tip()
// //   .attr("class", "tooltip")
// //   .offset([80, -60])
// //   .html(function(d) {
// //     return (`${d.abbr}<br>${label}<br>${d[chosenXAxis]}<br>${d[chosenYAxis]}`);
// // });

// // Create tooltip in the chart
// chartGroup.call(toolTip);

// // Create event listeners to display and hide the tooltip
// circlesGroup.on("click", function(data) {
// toolTip.show(data, this);
// })
// // onmouseout event
// .on("mouseout", function(data) {
//   toolTip.hide(data);
// });

// return circlesGroup;
// }

// // Load data from data.csv
// d3.csv("assets/data/data.csv").then(function(acsData) {

//     console.log(acsData)

// // Cast each numerical value in tvData as a number using the unary + operator
//   acsData.forEach(function(data) {
//     data.poverty = +data.poverty;
//     data.healthcare = +data.healthcare;
//     data.age = +data.age;
//     data.income = +data.income;
//     data.smokes = +data.smokes;
//     data.obesity = +data.obesity;
//       console.log(data);
//   });
// // Create scale functions
//     // ==============================
//     var xLinearScale = xScale(acsData, chosenXAxis);
//     var yLinearScale = yScale(acsData, chosenYAxis);
//     //  d3.scaleLinear()
//     //   .domain([0, d3.max(acsData, d => d[chosenYAxis])])
//     //   .range([height, 0]);

//     // Create axis functions
//     // ==============================
//     var bottomAxis = d3.axisBottom(xLinearScale);
//     var leftAxis = d3.axisLeft(yLinearScale);

//     // Append Axes to the chart
//     // ==============================
//     var yAxis = chartGroup.append("g")
//       .classed("y-axis", true)
//       .call(leftAxis);

//     var xAxis = chartGroup.append("g")
//       .classed("x-axis", true)
//       .attr("transform", `translate(0, ${height})`)
//       .call(bottomAxis);

//     // Create Circles
//     // ==============================
//     var circlesGroup = chartGroup.selectAll("circle")
//     .data(acsData)
//     .enter()
//     .append("circle")
//     .attr("cx", d => xLinearScale(d[chosenXAxis]))
//     .attr("cy", d => yLinearScale(d[chosenYAxis]))
//     .attr("r", 20)
//     .attr("fill", "red")
//     .attr("opacity", ".5");
    
//     // Append the State abbreviations to the markers 
//     var circletextGroup = chartGroup.selectAll()
//         .data(acsData)
//         .enter()
//         .append("text")
//         .text(d => (d.abbr))
//         .attr("x", d => xLinearScale(d[chosenXAxis]))
//         .attr("y", d => yLinearScale(d[chosenYAxis]))
//         .style("font-size", "12px")
//         .style("text-anchor", "middle")
//         .style('fill', 'black');
      
//       // let ticked = () => {
//       //   circles.attr('cx', (data) => {
//       //           return data.x
//       //       })
//       //       .attr('cy', (data) => {
//       //           return data.y
//       //       });
    
//       //   texts.attr('x', (data) => {
//       //           return data.x
//       //       })
//       //       .attr('y', (data) => {
//       //           return data.y
//       //       });
//       //   simulation.nodes(data)
//       //     .on('tick', ticked)
//       //   };
// // var text = vis.selectAll(null)
// //   .data(acsData)
// //   .enter()
// //   .append("text");

// // var textLabels = text
// //   .attr("x", function(d) {
// //     return xRange(d.abbr);
// //   })
// //   .attr("text-anchor", "middle")
// //   .attr("y", function(d) {
// //     return yRange(d.abbr);
// //   })
// //   .text(function(d) {
// //     return "(d.abbr)";
// //   })
// //   .attr("font-family", "sans-serif")
// //   .attr("font-size", "10px")
// //   .attr("fill", "black");

// //Create Label Groups for x and y axis
// var labelsGroup = chartGroup.append("g")
//     .attr("transform", `translate(${width / 2}, ${height + 20})`);


// var incomeLabel = labelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 20)
//     .attr("value", "income") // value to grab for event listener
//     .classed("active", true)
//     .text("Median Household Income");

// var povertyLabel = labelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 40)
//     .attr("value", "poverty") // value to grab for event listener
//     .classed("inactive", true)
//     .text("In Poverty");

// var ageLabel = labelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 60)
//     .attr("value", "age") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Age");

// // var ylabelsGroup = chartGroup.append("g")
// //     .attr("transform", "rotate(-90)")
// //     .attr("y", 0 - margin.left)
// //     .attr("x", 0 - (height / 2))
// //     .attr("dy", "1em")
// //     .classed("axis-text", true)

// var obesityLabel = labelsGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("x", (margin.left) * 2.5)
//     .attr("y", 0 - (height - 60))
//     .attr("value", "obesity") // value to grab for event listener
//     .classed("active", true)
//     .text("Obesity %");

// var smokesLabel = labelsGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("x", (margin.left) * 2.5)
//     .attr("y", 0 - (height - 40))
//     .attr("value", "smokes") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Smokes %");

// var healthcareLabel = labelsGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("x", (margin.left) * 2.5)
//     .attr("y", 0 - (height - 20))
//     .attr("value", "healthcare") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Lacks Healthcare %");

//     // // Create axes labels
//     // chartGroup.append("text")
//     //   .attr("transform", "rotate(-90)")
//     //   .attr("y", 0 - margin.left + 40)
//     //   .attr("x", 0 - (height / 2))
//     //   .attr("dy", "1em")
//     //   .attr("class", "axisText", true)
//     //   .text("Obesity %");

//       // updateToolTip function above csv import
//   var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

//   // x axis labels event listener
//   labelsGroup.selectAll("text")
//     .on("click", function() {
//       // get value of selection
//       var value = d3.select(this).attr("value");
//       if (true) {
//         if (value === "income" || value === "poverty" || value === "age") {

//       // replaces chosenXAxis with value
//       chosenXAxis = value;
//       console.log (chosenXaxis)

//         // updates x scale for new data
//         xLinearScale = xScale(acsData, chosenXAxis);
//         // updates x axis with transition
//         xAxis = renderAxes(xLinearScale, xAxis);
   
//       // changes classes to change bold text
//       if (chosenXAxis === "income") {
//         incomeLabel
//           .classed("active", true)
//           .classed("inactive", false);
//         povertyLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         ageLabel
//           .classed("active", false)
//           .classed("inactive", true);
//       }
//       else if (chosenXAxis === "poverty"){
//         incomeLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         povertyLabel
//           .classed("active", true)
//           .classed("inactive", false);
//         ageLabel
//           .classed("active", false)
//           .classed("inactive", true);
//       }
//       else {
//         incomeLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         povertyLabel
//           .classed("active", false)
//           .classed("inactive", false);
//         ageLabel
//           .classed("active", true)
//           .classed("inactive", false);
//       }
//     }
//       else {

//         // replaces chosenYAxis with value
//         chosenYAxis = value;

//         console.log(chosenYAxis)

//         // updates y scale for new data
//         yLinearScale = yScale(acsData, chosenYAxis);

//         // updates y axis with transition
//         yAxis = renderAxes(yLinearScale, yAxis);
        
//       //  // changes classes to change bold text
//       if (chosenYAxis === "obesity") {
//         obesityLabel
//           .classed("active", true)
//           .classed("inactive", false);
//         smokesLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         healthcareLabel
//           .classed("active", false)
//           .classed("inactive", true);
//       }
//       else if (chosenYAxis === "smokes"){
//         obesityLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         smokesLabel
//           .classed("active", true)
//           .classed("inactive", false);
//         healthcareLabel
//           .classed("active", false)
//           .classed("inactive", true);
//       }
//       else {
//         obesityLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         smokesLabel
//           .classed("active", false)
//           .classed("inactive", false);
//         healthcareLabel
//           .classed("active", true)
//           .classed("inactive", false);
//        }
//       }
//       // updates circles with new values
//       circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        
//       // updates tooltips with new info
//       circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

//       // Update circles text with new values.
//       circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

//     }
//   });
// });
// // // When the browser loads, makeResponsive() is called.
// makeResponsive();

// // // When the browser window is resized, makeResponsive() is called.
// d3.select(window).on("resize", makeResponsive);