export function drawIctEmissionsChart(containerSelector, data) {
  // Set up margins and dimensions
  const margin = { top: 60, right: 30, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'chart-container')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  // Create chart area
  const chartArea = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width]);

  const yMax = d3.max(data, d => d.maxEstimate);
  const y = d3.scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([height, 0]);

  // Axes
  const xAxis = d3.axisBottom(x)
    .tickFormat(d3.format('d')); // Format years as integers

  const yAxis = d3.axisLeft(y)
    .tickFormat(d => `${d}%`);

  // Append axes
  chartArea.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .selectAll('text').attr('fill', '#ffffff');

  chartArea.append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .selectAll('text').attr('fill', '#ffffff');

  // Line generators
  const lineMin = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.minEstimate));

  const lineMax = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.maxEstimate));

  // Append area between lines
  chartArea.append('path')
    .datum(data)
    .attr('fill', '#74c476')
    .attr('opacity', 0.3)
    .attr('d', d3.area()
      .x(d => x(d.year))
      .y0(d => y(d.minEstimate))
      .y1(d => y(d.maxEstimate))
    );

  // Append lines
  chartArea.append('path')
    .datum(data)
    .attr('class', 'line line-min')
    .attr('fill', 'none')
    .attr('stroke', '#74c476')
    .attr('stroke-width', 2)
    .attr('d', lineMin);

  chartArea.append('path')
    .datum(data)
    .attr('class', 'line line-max')
    .attr('fill', 'none')
    .attr('stroke', '#31a354')
    .attr('stroke-width', 2)
    .attr('d', lineMax);

  // Add vertical line to separate actual data from projections
  const projectionStartYear = 2018;
  chartArea.append('line')
    .attr('class', 'projection-line')
    .attr('x1', x(projectionStartYear))
    .attr('y1', 0)
    .attr('x2', x(projectionStartYear))
    .attr('y2', height)
    .attr('stroke', '#ffffff')
    .attr('stroke-dasharray', '4');

  // Add text label for actual data
  chartArea.append('text')
    .attr('x', x(2012.5)) // Midpoint between 2007 and 2017
    .attr('y', -20)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .text('Actual Data');

  // Add text label for projections
  chartArea.append('text')
    .attr('x', x(2029)) // Midpoint between 2018 and 2040
    .attr('y', -20)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .text('Projections');

  // Add chart title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', (width + margin.left + margin.right) / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '18px')
    .attr('fill', '#ffffff')
    .text('ICT Sector Emissions as a Percentage of Global Emissions (2007-2040)');

  // Add legend
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - 150}, ${margin.top})`);

  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', '#74c476')
    .attr('opacity', 0.3);

  legend.append('text')
    .attr('x', 20)
    .attr('y', 12)
    .attr('fill', '#ffffff')
    .text('Estimate Range');

  legend.append('line')
    .attr('x1', 0)
    .attr('y1', 30)
    .attr('x2', 15)
    .attr('y2', 30)
    .attr('stroke', '#74c476')
    .attr('stroke-width', 2);

  legend.append('text')
    .attr('x', 20)
    .attr('y', 33)
    .attr('fill', '#ffffff')
    .text('Min Estimate');

  legend.append('line')
    .attr('x1', 0)
    .attr('y1', 50)
    .attr('x2', 15)
    .attr('y2', 50)
    .attr('stroke', '#31a354')
    .attr('stroke-width', 2);

  legend.append('text')
    .attr('x', 20)
    .attr('y', 53)
    .attr('fill', '#ffffff')
    .text('Max Estimate');
}