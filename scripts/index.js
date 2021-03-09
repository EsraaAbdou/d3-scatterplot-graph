const xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", true);
xhttp.send();
xhttp.onreadystatechange = function() {
    if(this.readyState==4 && this.status==200){ 
        const dataset = JSON.parse(this.responseText)
        console.log(dataset)
        drawChart(dataset)
    }      
};

function drawChart(dataset) {
   // create SVG
   const padding = 60;
   const w = 1200;
   const h = 600;
   const tooltipWidth = 300;
   const tooltipHeight = 90;
   const svg = d3.select("div")
                 .append("svg")
                 .attr("preserveAspectRatio", "xMinYMin meet")
                 .attr("viewBox", `0 0 ${w} ${h}`)
                 .style("background-color", "white")
   
   // create dynamic scales
   const xScale = d3.scaleLinear()
                    .domain([d3.min(dataset, (d) => d.Year - 1), d3.max(dataset, (d) => d.Year + 1)])
                    .range([padding, w - padding]);

   const yScale = d3.scaleTime()
                    .domain(d3.extent(dataset, time2Date).reverse())
                    .range([h - padding, padding]);
   
   // adding axes
   const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
   const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
      const min = (d.getMinutes()<10?'0':'') + d.getMinutes();
      const sec = (d.getSeconds()<10?'0':'') + d.getSeconds();
      return min + ":" + sec;
   });

   svg.append("g")
      .attr("transform", "translate(0," + (h - padding) + ")")
      .attr("id", "x-axis")
      .call(xAxis);

   svg.append("g")
      .attr("transform", "translate(" + padding+ ",0)")
      .attr("id", "y-axis")
      .call(yAxis);

   // adding title
   svg.append("text")
      .attr("x", w/2 - 150)
      .attr("y", padding)
      .attr("id","title")
      .text("Doping in Professional Bicycle Racing");

   // adding dots
   svg.selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("data-xvalue", d => d.Year)
      .attr("data-yvalue", d => time2Date(d))
      .attr("cx", d => xScale(d.Year))
      .attr("cy", d => yScale(time2Date(d)))
      .attr("r", "5")
      .attr("class", "dot")
}

function time2Date(d){
   const timeArr = d.Time.split(":");
   const temp = new Date();
   temp.setMinutes(timeArr[0]);
   temp.setSeconds(timeArr[1]);
   console.log(temp)
   return temp;
}