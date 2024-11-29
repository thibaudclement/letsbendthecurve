export function drawEnergyConsumptionChart(containerSelector, data) {
  // Set up margins and dimensions
  const margin = { top: 70, right: 30, bottom: 80, left: 80 };
  const containerWidth = d3.select(containerSelector).node().getBoundingClientRect().width;
  const width = containerWidth - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'energy-chart-container')
    .attr('width', '100%') // Full width
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Add chart title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', (width + margin.left + margin.right) / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '22px')
    .text('Global Data Center Electricity Consumption (2010-2050)');

  // Create chart area
  const chartArea = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X scale for years (band scale for bar chart)
  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.1);

  // Y scale for energy consumption
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.energyConsumption) * 1.1])
    .range([height, 0]);

  // Define axes
  const xAxis = d3.axisBottom(x)
    .tickValues(data.filter(d => d.year % 5 === 0).map(d => d.year))
    .tickFormat(d => d.toString());

  const yAxis = d3.axisLeft(y)
    .ticks(5);

  // Add horizontal gridlines
  chartArea.append('g')
    .attr('class', 'grid horizontal-grid')
    .call(d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width)
      .tickFormat(''))
    .selectAll('line')
    .attr('stroke', '#58595b')
    .attr('stroke-width', 0.5);

  // Add vertical gridlines every 5 years
  chartArea.append('g')
    .attr('class', 'grid vertical-grid')
    .call(d3.axisBottom(x)
      .tickValues(data.filter(d => d.year % 5 === 0).map(d => d.year))
      .tickSize(height)
      .tickFormat(''))
    .attr('transform', `translate(0,0)`)
    .selectAll('line')
    .attr('stroke', '#58595b')
    .attr('stroke-width', 0.5);

  // Append x-axis labels without the axis line
  chartArea.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  // Remove x-axis line but keep tick labels
  chartArea.select('.x-axis path')
    .style('display', 'none');

  // Remove x-axis tick lines
  chartArea.selectAll('.x-axis .tick line')
    .style('display', 'none');

  // Append y-axis labels without the axis line
  chartArea.append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis);

  // Remove y-axis line but keep tick labels
  chartArea.select('.y-axis path')
    .style('display', 'none');

  // Remove y-axis tick lines
  chartArea.selectAll('.y-axis .tick line')
    .style('display', 'none');

  // Add x-axis title
  chartArea.append('text')
    .attr('class', 'axis-title')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .text('Years');

  // Add y-axis title
  chartArea.append('text')
    .attr('class', 'axis-title')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -50)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .text('Electricity Consumption (TWh)');

  // Append bars
  const bars = chartArea.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.year))
    .attr('y', d => y(d.energyConsumption))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.energyConsumption))
    .attr('fill', '#78c679');

  // Add tooltip
  const tooltip = d3.select(containerSelector)
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  bars.on('mouseover', function(event, d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(`Year: ${d.year}<br>Consumption: ${d.energyConsumption.toFixed(2)} TWh`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .style('max-width', '200px');
    })
    .on('mouseout', function(d) {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });

  // Function to update the chart
  function updateChart() {
    // Recalculate energy consumption based on updated PUE values
    data.forEach(d => {
      d.energyConsumption = d.pue * d.computingUnitsNeed;
    });

    // Update y scale
    y.domain([0, d3.max(data, d => d.energyConsumption) * 1.1]);

    // Update gridlines
    chartArea.select('.horizontal-grid')
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#58595b')
      .attr('stroke-width', 0.5);

    // Update y-axis labels
    chartArea.select('.y-axis')
      .call(yAxis);

    // Remove y-axis line but keep tick labels
    chartArea.select('.y-axis path')
      .style('display', 'none');

    // Remove y-axis tick lines
    chartArea.selectAll('.y-axis .tick line')
      .style('display', 'none');

    // Update bars
    chartArea.selectAll('.bar')
      .data(data)
      .transition()
      .duration(500)
      .attr('y', d => y(d.energyConsumption))
      .attr('height', d => height - y(d.energyConsumption));
  }

  // Return the update function so it can be called from the PUE chart
  return updateChart;
}