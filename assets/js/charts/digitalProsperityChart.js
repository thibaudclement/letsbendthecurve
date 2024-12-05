export function drawDigitalProsperityChart(containerSelector, data) {
  // Set up the chart dimensions and margins
  const margin = { top: 60, right: 50, bottom: 70, left: 70 };
  const width = 960 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", '100%')
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Append group element
  const chartGroup = svg.append("g")
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
      yScaleType: "linear"
    },
    {
      title: "Human Development Index vs. Internet Connection Speed",
      xLabel: "Internet Connection Speed (Average Download Speed in Mbit Per Second)",
      yLabel: "Human Development Index",
      xKey: "Internet Connection Speed (Average Download Speed in Mbit Per Second)",
      yKey: "Human Development Index",
      xScaleType: "linear",
      yScaleType: "linear"
    },
    {
      title: "Human Development Index vs. Supercomputer Cores Per Million Inhabitants",
      xLabel: "Supercomputer Cores Per Million Inhabitants (Log scale)",
      yLabel: "Human Development Index",
      xKey: "Supercomputer Cores Per Million Inhabitants",
      yKey: "Human Development Index",
      xScaleType: "log",
      yScaleType: "linear"
    },
    {
      title: "GDP Per Capita vs. Internet Users (% of Population)",
      xLabel: "Internet Users (% of Population)",
      yLabel: "GDP Per Capita (Dollars, Log scale)",
      xKey: "Internet Users (% of Population)",
      yKey: "GDP Per Capita",
      xScaleType: "linear",
      yScaleType: "log"
    },
    {
      title: "GDP (Nominal) vs. Electricity Consumption",
      xLabel: "Electricity Consumption (Log scale)",
      yLabel: "GDP (Dollars, Log scale)",
      xKey: "Electricity Consumption",
      yKey: "GDP (Nominal)",
      xScaleType: "log",
      yScaleType: "log"
    },
    {
      title: "GDP (Nominal) vs. Supercomputer Cores",
      xLabel: "Supercomputer Cores (Log scale)",
      yLabel: "GDP (Dollars, Log scale)",
      xKey: "Supercomputer Cores",
      yKey: "GDP (Nominal)",
      xScaleType: "log",
      yScaleType: "log"
    }
  ];

  let currentChartIndex = 0;

  // Draw the initial chart
  updateChart();

  // Add Previous and Next buttons
  const buttonContainer = d3.select(containerSelector)
    .append("div")
    .attr("class", "button-container");

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
    chartGroup.selectAll("*").remove();
    d3.select(containerSelector).selectAll(".tooltip").remove();

    // Get the current chart configuration
    const chartConfig = charts[currentChartIndex];

    // Filter data to remove entries with missing or invalid values
    const filteredData = data.filter(d => {
      let xValue = d[chartConfig.xKey];
      let yValue = d[chartConfig.yKey];

      // Check for missing or invalid data
      if (
        xValue == null || xValue === '' || yValue == null || yValue === '' ||
        isNaN(xValue) || isNaN(yValue)
      ) {
        return false;
      }

      // For log scales, exclude non-positive values and apply log transformation
      if (chartConfig.xScaleType === "log") {
        if (xValue <= 0) return false;
        xValue = Math.log(xValue);
      }
      if (chartConfig.yScaleType === "log") {
        if (yValue <= 0) return false;
        yValue = Math.log(yValue);
      }

      // Attach transformed values for regression calculation
      d._xValue = xValue;
      d._yValue = yValue;

      return true;
    });

    // Check if there is data to display
    if (filteredData.length === 0) {
      chartGroup.append("text")
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

    // Add grid lines
    chartGroup.append("g")
      .attr("class", "grid x-grid")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(10, chartConfig.xScaleType === "log" ? "~s" : null)
          .tickSize(-height)
          .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke-width', 0.5);

    chartGroup.append("g")
      .attr("class", "grid y-grid")
      .call(
        d3.axisLeft(yScale)
          .ticks(10, chartConfig.yScaleType === "log" ? "~s" : null)
          .tickSize(-width)
          .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke-width', 0.5);

    // Remove extra grid lines to avoid box effect
    chartGroup.selectAll(".x-grid .tick:first-of-type line, .x-grid .tick:last-of-type line")
      .remove();

    chartGroup.selectAll(".y-grid .tick:first-of-type line, .y-grid .tick:last-of-type line")
      .remove();

    // Add X axis (ticks and labels only)
    chartGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(10, chartConfig.xScaleType === "log" ? "~s" : null)
          .tickSize(0)
          .tickPadding(10)
      );

    // Add Y axis (ticks and labels only)
    chartGroup.append("g")
      .attr("class", "y-axis")
      .call(
        d3.axisLeft(yScale)
          .ticks(10, chartConfig.yScaleType === "log" ? "~s" : null)
          .tickSize(0)
          .tickPadding(10)
      );

    // Remove axis lines
    chartGroup.selectAll(".x-axis .domain, .y-axis .domain").remove();

    // Add chart title
    chartGroup.append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .text(chartConfig.title);

    // Add X axis label
    chartGroup.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text(chartConfig.xLabel);

    // Add Y axis label
    chartGroup.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("text-anchor", "middle")
      .text(chartConfig.yLabel);

    // Add dots
    chartGroup.append("g")
      .selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
        .attr("cx", d => xScale(d[chartConfig.xKey]))
        .attr("cy", d => yScale(d[chartConfig.yKey]))
        .attr("r", 5)
        .attr("fill", "#78c679")
        .attr("stroke", "#78c679")
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 0.5)
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
      tooltip.html(`<strong>${d.Country}</strong><br/>${chartConfig.xLabel}: ${formatValue(d[chartConfig.xKey])}<br/>${chartConfig.yLabel}: ${formatValue(d[chartConfig.yKey])}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    }

    function hideTooltip(event, d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    }

    function formatValue(value) {
      if (value >= 1000000000) {
        return d3.format(".2s")(value);
      } else if (value >= 1000000) {
        return d3.format(".2s")(value);
      } else if (value >= 1000) {
        return d3.format(",")(value);
      } else {
        return d3.format(",.2f")(value);
      }
    }

    // Compute and Add Trendline
    // Prepare data for regression
    const regressionData = filteredData.map(d => ({
      x: d._xValue,
      y: d._yValue
    }));

    // Compute regression coefficients and correlation coefficient
    const regressionResult = linearRegression(regressionData);

    // Generate points for the trendline
    let xMin = d3.min(filteredData, d => d[chartConfig.xKey]);
    let xMax = d3.max(filteredData, d => d[chartConfig.xKey]);

    // For log scales, adjust xMin and xMax to avoid negative or zero values
    if (chartConfig.xScaleType === "log") {
      xMin = xScale.domain()[0];
      xMax = xScale.domain()[1];
    }

    const trendlineData = [
      {
        x: xMin,
        y: regressionResult.predict(chartConfig.xScaleType === "log" ? Math.log(xMin) : xMin)
      },
      {
        x: xMax,
        y: regressionResult.predict(chartConfig.xScaleType === "log" ? Math.log(xMax) : xMax)
      }
    ];

    // Plot the trendline
    chartGroup.append("line")
      .attr("class", "trendline")
      .attr("x1", xScale(trendlineData[0].x))
      .attr("y1", yScale(chartConfig.yScaleType === "log" ? Math.exp(trendlineData[0].y) : trendlineData[0].y))
      .attr("x2", xScale(trendlineData[1].x))
      .attr("y2", yScale(chartConfig.yScaleType === "log" ? Math.exp(trendlineData[1].y) : trendlineData[1].y))
      .attr("stroke", "#c2e699")
      .attr("stroke-width", 2);

    // Add Correlation Coefficient Annotation
    chartGroup.append("text")
      .attr("class", "correlation-coefficient")
      .attr("x", width - 10)
      .attr("y", height - 10)
      .attr("text-anchor", "end")
      .attr("fill", "#c2e699")
      .text(`r = ${regressionResult.r.toFixed(2)}`);

  }

  // Linear Regression Function
  function linearRegression(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    data.forEach(d => {
      sumX += d.x;
      sumY += d.y;
      sumXY += d.x * d.y;
      sumX2 += d.x * d.x;
      sumY2 += d.y * d.y;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Compute correlation coefficient (Pearson's r)
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = numerator / denominator;

    return {
      slope: slope,
      intercept: intercept,
      r: r,
      predict: function(x) { return slope * x + intercept; }
    };
  }
}