const xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json", true);
xhttp.send();
xhttp.onreadystatechange = function() {
    if(this.readyState==4 && this.status==200){ 
        const parsedRes = JSON.parse(this.responseText)
        const dataset = parsedRes.data;
        drawChart(dataset)
    }      
};

function drawChart(dataset) {
   // create SVG
   const padding = 60;
   const w = 1200;
   const h = 600;
   const tooltipWidth = 200;
   const tooltipHeight = 30;
   const svg = d3.select("div")
                 .append("svg")
                 .attr("preserveAspectRatio", "xMinYMin meet")
                 .attr("viewBox", `0 0 ${w} ${h}`)
                 .style("background-color", "white")
   
   console.log(document.getElementsByTagName("svg")[0].getBoundingClientRect().width)
   console.log(document.getElementsByTagName("div")[0].getBoundingClientRect().width)
   // create dynamic scales
   const xScale = d3.scaleTime()
                  .domain([d3.min(dataset, (d) => new Date(d[0])), d3.max(dataset, (d) => new Date(d[0]))])
                  .range([padding, w - padding]);
   
   const yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, (d) => d[1])])
                    .range([h - padding, padding]);
   
   // adding axes
   const xAxis = d3.axisBottom(xScale);
   const yAxis = d3.axisLeft(yScale);

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
      .attr("y", padding/2)
      .attr("id","title")
      .text("Graph Title");

   // adding bars
   svg.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("data-date", d => d[0])
      .attr("data-gdp", d => d[1])
      .attr("x", d => xScale(new Date(d[0])))
      .attr("y", d => yScale(d[1]))
      .attr("width", 5)
      .attr("height", d => h- padding - yScale(d[1]))
      .attr("class", "bar")
      .on("mouseover", (event) => {
         // for the tooltip
         const targetBar = event.target;
         const xVal = targetBar.getAttribute("x");
         const date = targetBar.getAttribute("data-date");
         const dateArr = date.split("-");
         const year = dateArr[0];
         const month = parseInt(dateArr[1]);
         const q = (month<4)?1:(month<7)?2:(month<10)?3:4;
         const gdp = targetBar.getAttribute("data-gdp");
         const tooltipX = (xVal<w/2) ? parseFloat(xVal) + 10 : parseFloat(xVal) - tooltipWidth - 10;

         svg.select("#tooltip")
            .attr("x", tooltipX)
            .attr("data-date", date)
            .style("visibility", "visible");

         svg.select("#tooltip-text")
            .attr("x", tooltipX + 10)
            .text(year +" Q" + q + ", $" + gdp + " Billion")
            .style("visibility", "visible");
      })
      .on("mouseout", (event) => {
         // for the tooltip
         if(!event.relatedTarget || event.relatedTarget.getAttribute("class") !== "bar"){
            svg.select("#tooltip")
               .style("visibility", "hidden");
               
            svg.select("#tooltip-text")
               .style("visibility", "hidden");
         } 
      });

   //adding tooltip
   svg.append("rect")
      .attr("y", h-tooltipWidth)
      .attr("width", tooltipWidth)
      .attr("height", tooltipHeight)
      .attr("rx", 10)
      .attr("fill", "grey")
      .attr("id", "tooltip")
      .style("visibility", "hidden");   

   svg.append("text")
      .attr("y", h - tooltipWidth + 20)
      .attr("fill", "white")
      .attr("id", "tooltip-text")
      .style("visibility", "hidden");
}