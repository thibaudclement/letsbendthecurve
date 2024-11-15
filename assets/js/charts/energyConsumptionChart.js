export function drawEnergyConsumptionChart(containerSelector, data) {
  // Use the same data array
  // const energyData = data.map(d => ({ ...d }));

  // Set up dimensions and margins
  const margin = { top: 50, right: 30, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'energy-chart-container')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  // Create chart area
  const chartArea = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.energyConsumption) * 1.1])
    .range([height, 0]);

  // Axes
  const xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(y);

  // Append axes
  chartArea.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  chartArea.append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis);

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.energyConsumption));

  // Append line path
  const linePath = chartArea.append('path')
    .datum(data)
    .attr('class', 'line energy-line')
    .attr('d', line);

  // Function to update the chart
  function updateChart() {
    // Recalculate energy consumption based on updated PUE values
    data.forEach(d => {
      d.energyConsumption = d.pue * d.itEnergy;
    });

    // Update y scale
    y.domain([0, d3.max(data, d => d.energyConsumption) * 1.1]);

    // Update axes
    chartArea.select('.y-axis')
      .transition()
      .duration(500)
      .call(yAxis);

    // Update line
    chartArea.select('.energy-line')
      .datum(data)
      .transition()
      .duration(500)
      .attr('d', line);
  }

  // Return the update function so it can be called from the PUE chart
  return updateChart;
}
