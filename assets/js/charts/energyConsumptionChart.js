export function drawEnergyConsumptionChart(containerSelector, data) {
  // Set up dimensions and margins
  const margin = { top: 70, right: 30, bottom: 80, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'energy-chart-container')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  // Add chart title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', (width + margin.left + margin.right) / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '16px')
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

  // Axes
  const xAxis = d3.axisBottom(x)
    .tickValues(data.map(d => d.year)) // Tick for every year
    .tickFormat(d => (d % 5 === 0 ? d : '')); // Label every 5 years

  const yAxis = d3.axisLeft(y);

  // Append axes
  chartArea.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .selectAll('text')
    .attr('transform', 'rotate(-30)')
    .style('text-anchor', 'end');

  chartArea.append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis);

  // Add x-axis title
  chartArea.append('text')
    .attr('class', 'axis-title')
    .attr('x', width / 2)
    .attr('y', height + 60)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '14px')
    .text('Years');

  // Add y-axis title
  chartArea.append('text')
    .attr('class', 'axis-title')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -60)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '14px')
    .text('Global Data Center Electricity Consumption (TWh)');

  // Append bars
  chartArea.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.year))
    .attr('y', d => y(d.energyConsumption))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.energyConsumption))
    .attr('fill', '#74c476');

  // Function to update the chart
  function updateChart() {
    // Recalculate energy consumption based on updated PUE values
    data.forEach(d => {
      d.energyConsumption = d.pue * d.computingUnitsNeed;
    });

    // Update y scale
    y.domain([0, d3.max(data, d => d.energyConsumption) * 1.1]);

    // Update axes
    chartArea.select('.y-axis')
      .transition()
      .duration(500)
      .call(yAxis);

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