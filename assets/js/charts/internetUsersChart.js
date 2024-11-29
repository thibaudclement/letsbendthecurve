export function drawInternetUsersChart(containerSelector, data) {
  // Remove existing SVG if any
  d3.select(containerSelector).select('svg').remove();

  // Set up dimensions and margins
  const margin = { top: 70, right: 50, bottom: 50, left: 70 };
  const width = 960 - margin.left - margin.right; // Adjusted for full width
  const height = 500 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'chart-container')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Append group element
  const chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X-axis scale
  const x = d3.scalePoint()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.5);

  // Y-axis scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.internetUsers)])
    .nice()
    .range([height, 0]);

  // Horizontal grid lines
  chartGroup.append('g')
    .attr('class', 'grid horizontal-grid')
    .call(
      d3.axisLeft(y)
        .ticks(10)
        .tickSize(-width)
        .tickFormat('')
    )
    .selectAll('line')
    .attr('stroke-width', 0.5);

  // Vertical grid lines
  chartGroup.append('g')
    .attr('class', 'grid vertical-grid')
    .attr('transform', `translate(0, ${height})`)
    .call(
      d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat('')
    )
    .selectAll('line')
    .attr('stroke-width', 0.5);

  // Remove extra grid lines to avoid box effect
  chartGroup.selectAll(".horizontal-grid .tick:first-of-type line, .horizontal-grid .tick:last-of-type line")
    .remove();

  // X-axis (ticks and labels only)
  chartGroup.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .tickFormat(d3.format('d'))
        .tickSize(0)
    )
    .selectAll('.tick text')
    .style('opacity', (d, i) => i % 4 === 0 ? 1 : 0)
    .attr('fill', '#ffffff');

  // Remove x-axis line
  chartGroup.selectAll('.x-axis .domain').remove();

  // Y-axis (labels only)
  chartGroup.append('g')
    .attr('class', 'y-axis')
    .call(
      d3.axisLeft(y)
        .ticks(10)
        .tickSize(0)
        .tickFormat(d => d3.format('.2s')(d).replace('G', 'B'))
    )
    .selectAll('text')
    .attr('fill', '#ffffff');

  // Remove y-axis line
  chartGroup.selectAll('.y-axis .domain').remove();

  // X-axis label
  chartGroup.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .style('text-anchor', 'middle')
    .text('Year')
    .attr('fill', '#ffffff');

  // Y-axis label
  chartGroup.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', -60)
    .attr('x', -height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Internet Users')
    .attr('fill', '#ffffff');

  // Title
  chartGroup.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', -30)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .attr('fill', '#ffffff')
    .text('Global Internet Users from 2000 to 2024');

  // Tooltip
  const tooltip = d3.select(containerSelector)
    .append('div')
    .attr('class', 'chart-tooltip')
    .style('opacity', 0);

  // Dots
  chartGroup.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.internetUsers))
    .attr('r', 5)
    .attr('fill', '#74c476')
    .attr('stroke', '#74c476')
    .attr('stroke-opacity', 1)
    .attr('fill-opacity', 0.5)
    .on('mouseover', function(event, d) {
      // Show the tooltip
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
      tooltip.html(`<strong>Year:</strong> ${d.year}<br/><strong>Internet Users:</strong> ${d3.format('.2s')(d.internetUsers).replace('G', 'B')}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', function(event) {
      // Update the tooltip position
      tooltip.style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      // Hide the tooltip
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });
}