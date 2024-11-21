export function drawDigitalProsperityChart(containerSelector, data) {
  // Set up the chart dimensions and margins
  const margin = { top: 60, right: 50, bottom: 70, left: 70 };
  const width = 960 - margin.left - margin.right; // Adjusted for full width
  const height = 500 - margin.top - margin.bottom;

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
      xLabel: "Internet Connection Speed (Average Download Speed, Mbit/s)",
      yLabel: "Human Development Index",
      xKey: "Internet Connection Speed (Average Download Speed, Mbit/s)",
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
      yLabel: "GDP Per Capita (Log scale)",
      xKey: "Internet Users (% of Population)",
      yKey: "GDP Per Capita",
      xScaleType: "linear",
      yScaleType: "log"
    },
    {
      title: "GDP (Nominal) vs. Electricity Consumption",
      xLabel: "Electricity Consumption (Log scale)",
      yLabel: "GDP (Nominal) (Log scale)",
      xKey: "Electricity Consumption",
      yKey: "GDP (Nominal)",
      xScaleType: "log",
      yScaleType: "log"
    },
    {
      title: "GDP (Nominal) vs. Supercomputer Cores",
      xLabel: "Supercomputer Cores (Log scale)",
      yLabel: "GDP (Nominal) (Log scale)",
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
      const xValue = d[chartConfig.xKey];
      const yValue = d[chartConfig.yKey];

      // Check for missing or invalid data
      if (
        xValue == null || xValue === '' || yValue == null || yValue === '' ||
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
        .attr("fill", "#74c476")
        .attr("stroke", "#74c476")
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
  }
}