export function drawIctEmissionsBreakdownChart(containerSelector, data) {
  // Set up dimensions and margins
  const width = 550;
  const height = 500;
  const margin = 40;

  // Create color scale with updated colors
  const colorScale = d3.scaleOrdinal()
    .domain(['Networks', 'Data Centers', 'User Devices'])
    .range(['#006837', '#31a354', '#78c679']);

  // Create SVG container with increased height to prevent overlap
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'pie-chart-container')
    .attr('width', width)
    .attr('height', height + margin);

  // Add chart title with adjusted vertical position
  svg.append('text')
    .attr('class', 'pie-chart-title')
    .attr('x', width / 2)
    .attr('y', margin / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '18px')
    .text('Proportional Breakdown of ICT Emissions (2020)');

  // Adjust chart area to leave space for the title
  const chartArea = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${(height + margin) / 2})`);

  // Create pie generator with adjusted start angle and sorted data
  const pie = d3.pie()
    .sort((a, b) => b.proportionalImpact - a.proportionalImpact)
    .value(d => d.proportionalImpact)
    .startAngle(-Math.PI / 2);

  // Create arc generator
  const radius = Math.min(width, height) / 2 - margin;
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  // Generate pie chart
  const arcs = chartArea.selectAll('.arc')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'arc');

  // Append path (slices) with updated colors
  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => colorScale(d.data.component));

  // Append labels with component name and data value on separate lines
  arcs.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '12px')
    .selectAll('tspan')
    .data(d => [d.data.component, `${d.data.proportionalImpact}%`])
    .enter()
    .append('tspan')
    .attr('x', 0)
    .attr('dy', (d, i) => i === 0 ? 0 : '1.2em')
    .text(d => d);
}