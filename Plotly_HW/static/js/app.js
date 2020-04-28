// Use the D3 library to read in `samples.json`. 
var file_path = "samples.json"
      // Write the response to the console
var data = d3.json(file_path)
      console.log(data)
d3.json(file_path).then(function(data) {
    console.log(data.names)
    var select = d3.select("#selDataset")
    data.names.forEach(patient => {
      select.append("option").attr("value", patient).text(patient)
    })
//Change data based on patient selected
select.on("change", patientSelect);
function patientSelect (patient_select) {
  var patient_id = d3.select(this).property("value");
  // console.log(patient_id) 
  // console.log(data)
  var patient_data = data.samples.filter(d => d.id == patient_id)[0]
  //display metadata 
  var meta_data = data.metadata.filter(d => d.id == patient_id)[0]
  console.log(meta_data)
  for (x in meta_data) {
    document.getElementById("sample-metadata").innerHTML += x + ":" + meta_data[x] + "<br>";
  }
  drawCharts(patient_data);
  // displayMetadata(meta_data);
 
} 
}); 

function drawCharts (pdata) {
// //Build Horizontal Bar Chart
  var sample_values = pdata.sample_values.slice(0, 10);
  var otu_ids = pdata.otu_ids.map(String).slice(0, 10);
  var i;
    for (i = 0; i < otu_ids.length; i++) {
    otu_ids[i] = "OTU ID " + otu_ids[i] ;
    }
  console.log(otu_ids)
  console.log(sample_values)
  
  var data = [{
    "x": sample_values,
    "y": otu_ids,
    "orientation": "h",
    "marker": {
      "color": "green",
      "width": 1
    },
    "type": "bar"
  }]

  var layout = [{
    barmode: "stack",
    title: 'Patient OTU Value Stats',
    xaxis: {
      title: ' '
    },
    yaxis: {
      title: ' ',
      dtick: 1
    },
    margin: {
      l: 180
    }
  }]

  Plotly.newPlot('bar', data, layout)
  
// //Create bubble chart function
  var sample_values1 = pdata.sample_values;
  var otu_ids1 = pdata.otu_ids;
  var otu_labels = pdata.otu_labels;
  console.log(otu_ids1)
  console.log(sample_values1)
  console.log(otu_labels)
  
  var trace1 = {
    x: otu_ids1,
    y: sample_values1,
    text: otu_labels,
    mode: 'markers',
    marker: {
      size: sample_values1,
      color: otu_ids1,
      text: otu_labels,
      sizemode: 'area'
    }
  };

  var data = [trace1];

  var layout = {
    title: {
      text:'Belly Button Sample Bubble Chart',
      font: {
        family: 'Courier New, monospace',
        size: 24
      },
      xref: 'paper',
      x: 0.05,
    },
    xaxis: {
      title: {
        text: 'OTU IDs',
        font: {
          family: 'Courier New, monospace',
          size: 18,
          color: 'black'
        }
      },
    },
    yaxis: {
      title: {
        text: 'Sample Values',
        font: {
          family: 'Courier New, monospace',
          size: 18,
          color: 'black'
        }
      }
    }
  };

  Plotly.newPlot('bubble', data, layout);
}

// // // Display Demographic Info
// function displayMetadata(mdata){
  
//   var meta_data = mdata.metadata.filter(d => d.id == patient_id)[0]
//   console.log(meta_data)
//   document.getElementById("sample-metadata").innerHTML = Object.entries(obj);
// }