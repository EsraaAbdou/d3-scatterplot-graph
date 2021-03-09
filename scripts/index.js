const xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", true);
xhttp.send();
xhttp.onreadystatechange = function() {
    if(this.readyState==4 && this.status==200){ 
        const dataset = JSON.parse(this.responseText)
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

   svg.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0 )
   .attr("x",0 - (h / 2))
   .attr("dy", "1em")
   .style("text-anchor", "middle")
   .text("Time in Minutes");

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
      .attr("x", w/2)
      .attr("y", padding)
      .attr("id","title")
      .style("text-anchor", "middle")
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
      .on("mouseover", (event,d) => {
         // for the tooltip
         const targetBar = event.target;
         const xVal = targetBar.getAttribute("cx");
         const yVal = targetBar.getAttribute("cy");
         const tooltipX = parseFloat(xVal) + 5;
         const tooltipY = parseFloat(yVal) + 5;
         const textOffset = 20;
        
         svg.select("#tooltip")
            .attr("x", tooltipX)
            .attr("y", tooltipY)
            .attr("data-year", d.Year)
            .style("visibility", "visible");

         svg.select("#tooltip-text")
            .attr("x", tooltipX + textOffset)
            .attr("y", tooltipY + textOffset)
            .style("visibility", "visible");

         svg.select("#tooltip-name")
            .text(`${d.Name}: ${d.Nationality}`);
         svg.select("#tooltip-time")
            .text(`Year: ${d.Year}, Time: ${d.Time}`)
            .attr("x", tooltipX + textOffset);
         svg.select("#tooltip-doping")
            .text(`${d.Doping}`)
            .attr("x", tooltipX + textOffset);
      })
      .on("mouseout", (event) => {
         // for the tooltip
         if(!event.relatedTarget || event.relatedTarget.getAttribute("class") !== "dot"){
            svg.select("#tooltip")
               .style("visibility", "hidden");
               
            svg.select("#tooltip-text")
               .style("visibility", "hidden");
         } 
      });

   // adding tooltip
   svg.append("rect")
      .attr("width", tooltipWidth)
      .attr("height", tooltipHeight)
      .attr("rx", 10)
      .attr("fill", "grey")
      .attr("id", "tooltip")
      .style("visibility", "hidden");   

      const tooltipText = svg.append("text")
                             .attr("fill", "white")
                             .attr("id", "tooltip-text")
                             .style("font-size", "10px")
                             .style("visibility", "hidden");

      tooltipText.append("tspan")
                 .attr("id", "tooltip-name")
      tooltipText.append("tspan")
                 .attr("id", "tooltip-time")
                 .attr("dy", 20)
      tooltipText.append("tspan")
                 .attr("id","tooltip-doping")
                 .attr("dy", 30)
         
}

function time2Date(d){
   const timeArr = d.Time.split(":");
   const temp = new Date();
   temp.setMinutes(timeArr[0]);
   temp.setSeconds(timeArr[1]);
   return temp;
}