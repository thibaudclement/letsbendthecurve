export function drawInternetUsersChart(containerSelector, data) {
  // Remove existing SVG if any
  d3.select(containerSelector).select('svg').remove();

  // Set up dimensions and margins
  const margin = { top: 70, right: 20, bottom: 50, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  const xPadding = 40;

  // Create SVG element
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'chart-container')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 800 ${height + margin.top + margin.bottom}`)
    .append('g')
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

  // X-axis
  const xAxis = svg.append('g')
  .attr('class', 'axis x-axis')
  .attr('transform', `translate(0,${height})`)
  .call(
    d3.axisBottom(x)
      .tickFormat(d3.format('d'))
  );

  xAxis.selectAll('.tick text')
    .style('opacity', (d, i) => i % 4 === 0 ? 1 : 0);

  // Y-axis
  svg.append('g')
    .attr('class', 'axis y-axis')
    .call(d3.axisLeft(y).tickFormat(d => d3.format('.2s')(d).replace('G', 'B')))
    .selectAll('text')
    .attr('fill', '#ffffff');

  // X-axis label
  svg.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .style('text-anchor', 'middle')
    .text('Year')
    .attr('fill', '#ffffff');

  // Y-axis label
  svg.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', -60)
    .attr('x', -height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Internet Users')
    .attr('fill', '#ffffff');

  // Title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', -30)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .attr('fill', '#ffffff')
    .text('Global Internet Users from 2000 to 2024');

  // Dots
  svg.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.internetUsers))
    .attr('r', 5)
    .attr('fill', '#74c476');
}
