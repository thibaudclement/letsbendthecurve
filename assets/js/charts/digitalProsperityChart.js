export function drawDigitalProsperityChart(containerSelector, data) {
  // Set up the chart dimensions and margins
  const margin = { top: 60, right: 50, bottom: 70, left: 70 },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", '100%')
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 800 ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("margin", "0 auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define chart configurations
  const charts = [
    {
      title: "Human Development Index vs. Internet Users (% of Population)",
      xLabel: "Internet Users (% of Population)",
      yLabel: "Human Development Index",
      xKey: "Internet Users (% of Population)",
      yKey: "Human Development Index",
      xScaleType: "linear",
      yScaleType: "linear",
      trendline: "linear"
    },
    {
      title: "Human Development Index vs. Internet Connection Speed",
      xLabel: "Internet Connection Speed (Mbit/s)",
      yLabel: "Human Development Index",
      xKey: "Internet Connection Speed (Average Download Speed, Mbit/s)",
      yKey: "Human Development Index",
      xScaleType: "linear",
      yScaleType: "linear",
      trendline: "linear"
    },
    {
      title: "Human Development Index vs. Supercomputer Cores Per Million Inhabitants",
      xLabel: "Supercomputer Cores Per Million Inhabitants (log scale)",
      yLabel: "Human Development Index",
      xKey: "Supercomputer Cores Per Million Inhabitants",
      yKey: "Human Development Index",
      xScaleType: "log",
      yScaleType: "linear",
      trendline: "linear"
    },
    {
      title: "GDP Per Capita vs. Internet Users (% of Population)",
      xLabel: "Internet Users (% of Population)",
      yLabel: "GDP Per Capita (log scale)",
      xKey: "Internet Users (% of Population)",
      yKey: "GDP Per Capita",
      xScaleType: "linear",
      yScaleType: "log",
      trendline: "exponential"
    },
    {
      title: "GDP (Nominal) vs. Electricity Consumption",
      xLabel: "Electricity Consumption (log scale)",
      yLabel: "GDP (Nominal) (log scale)",
      xKey: "Electricity Consumption",
      yKey: "GDP (Nominal)",
      xScaleType: "log",
      yScaleType: "log",
      trendline: "linear"
    },
    {
      title: "GDP (Nominal) vs. Supercomputer Cores",
      xLabel: "Supercomputer Cores (log scale)",
      yLabel: "GDP (Nominal) (log scale)",
      xKey: "Supercomputer Cores",
      yKey: "GDP (Nominal)",
      xScaleType: "log",
      yScaleType: "log",
      trendline: "linear"
    }
  ];

  let currentChartIndex = 0;

  // Draw the initial chart
  updateChart();

  // Add Previous and Next buttons
  const buttonContainer = d3.select(containerSelector)
    .append("div")
    .attr("class", "button-container")
    .style("text-align", "center")
    .style("margin-top", "20px");

  buttonContainer.append("button")
    .attr("class", "prev-button")
    .text("Previous Chart")
    .on("click", () => {
      currentChartIndex = (currentChartIndex - 1 + charts.length) % charts.length;
      updateChart();
    });

  buttonContainer.append("button")
    .attr("class", "next-button")
    .text("Next Chart")
    .on("click", () => {
      currentChartIndex = (currentChartIndex + 1) % charts.length;
      updateChart();
    });

  function updateChart() {
    // Clear the previous chart
    svg.selectAll("*").remove();
    d3.select(containerSelector).selectAll(".tooltip").remove();

    // Get the current chart configuration
    const chartConfig = charts[currentChartIndex];

    // Filter data to remove entries with missing or invalid values
    const filteredData = data.filter(d => {
      const xValue = d[chartConfig.xKey];
      const yValue = d[chartConfig.yKey];

      // Check for missing or invalid data
      if (
        xValue == null || yValue == null ||
        isNaN(xValue) || isNaN(yValue)
      ) {
        return false;
      }

      // For log scales, exclude non-positive values
      if (chartConfig.xScaleType === "log" && xValue <= 0) {
        return false;
      }
      if (chartConfig.yScaleType === "log" && yValue <= 0) {
        return false;
      }

      return true;
    });

    // Check if there is data to display
    if (filteredData.length === 0) {
      svg.append("text")
        .attr("class", "no-data-message")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("No data available for this chart.");
      return;
    }

    // Extract x and y values from filtered data
    const xValues = filteredData.map(d => d[chartConfig.xKey]);
    const yValues = filteredData.map(d => d[chartConfig.yKey]);

    // Set up scales
    const xScale = (chartConfig.xScaleType === "log" ? d3.scaleLog() : d3.scaleLinear())
      .range([0, width])
      .domain(d3.extent(xValues))
      .nice();

    const yScale = (chartConfig.yScaleType === "log" ? d3.scaleLog() : d3.scaleLinear())
      .range([height, 0])
      .domain(d3.extent(yValues))
      .nice();

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(10, chartConfig.xScaleType === "log" ? "~s" : null);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    // Add X axis label
    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text(chartConfig.xLabel);

    // Add Y axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(10, chartConfig.yScaleType === "log" ? "~s" : null);

    svg.append("g")
      .call(yAxis);

    // Add Y axis label
    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text(chartConfig.yLabel);

    // Add chart title
    svg.append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .text(chartConfig.title);

    // Add dots
    svg.append("g")
      .selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
        .attr("cx", d => xScale(d[chartConfig.xKey]))
        .attr("cy", d => yScale(d[chartConfig.yKey]))
        .attr("r", 5)
        .attr("fill", "#31a354")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    // Tooltip
    const tooltip = d3.select(containerSelector)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    function showTooltip(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`<strong>${d.Country}</strong><br/>${chartConfig.xLabel}: ${d3.format(",.2f")(d[chartConfig.xKey])}<br/>${chartConfig.yLabel}: ${d3.format(",.2f")(d[chartConfig.yKey])}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    }

    function hideTooltip(event, d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    }

    // Add trendline
    let trendlinePoints = [];

    if (chartConfig.trendline === "linear") {
      // Compute linear regression coefficients
      const { slope, intercept } = linearRegression(filteredData, chartConfig);

      // Generate trendline points
      const xFit = d3.range(
        d3.min(xValues),
        d3.max(xValues),
        (d3.max(xValues) - d3.min(xValues)) / 100
      );

      trendlinePoints = xFit.map(x => {
        const xTransformed = chartConfig.xScaleType === "log" ? Math.log(x) : x;
        const y = slope * xTransformed + intercept;
        const yValue = chartConfig.yScaleType === "log" ? Math.exp(y) : y;
        return { x: x, y: yValue };
      });
    } else if (chartConfig.trendline === "exponential") {
      // Compute exponential regression coefficients
      const { A, B } = exponentialRegression(filteredData, chartConfig);

      // Generate trendline points
      const xFit = d3.range(
        d3.min(xValues),
        d3.max(xValues),
        (d3.max(xValues) - d3.min(xValues)) / 100
      );

      trendlinePoints = xFit.map(x => {
        const y = A * Math.exp(B * x);
        return { x: x, y: y };
      });
    }

    // Draw trendline
    svg.append("path")
      .datum(trendlinePoints)
      .attr("fill", "none")
      .attr("stroke", "#ffab00")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
      );
  }

  // Function to compute linear regression coefficients
  function linearRegression(data, chartConfig) {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = data.length;

    data.forEach(d => {
      const x = chartConfig.xScaleType === "log" ? Math.log(d[chartConfig.xKey]) : d[chartConfig.xKey];
      const y = chartConfig.yScaleType === "log" ? Math.log(d[chartConfig.yKey]) : d[chartConfig.yKey];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  // Function to compute exponential regression coefficients
  function exponentialRegression(data, chartConfig) {
    let sumX = 0, sumLnY = 0, sumXlnY = 0, sumX2 = 0;
    const n = data.length;

    data.forEach(d => {
      const x = d[chartConfig.xKey];
      const y = d[chartConfig.yKey];
      const lnY = Math.log(y);
      sumX += x;
      sumLnY += lnY;
      sumXlnY += x * lnY;
      sumX2 += x * x;
    });

    const B = (n * sumXlnY - sumX * sumLnY) / (n * sumX2 - sumX * sumX);
    const lnA = (sumLnY - B * sumX) / n;
    const A = Math.exp(lnA);

    return { A, B };
  }
}