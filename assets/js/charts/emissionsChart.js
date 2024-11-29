export function drawEmissionsChart(containerSelector, taskEmissions, usTaskEmissions = null, chartTitle = '', isUserChart = false) {
  // Remove existing SVG if any
  d3.select(containerSelector).select('svg').remove();

  // Set up dimensions and margins
  const margin = { top: 70, right: 20, bottom: 50, left: 70 };
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
  const x = d3.scaleBand()
    .domain(taskEmissions.map(d => d.task))
    .range([0, width])
    .padding(0.2);

  // Y-axis scale
  const maxEmission = d3.max(taskEmissions, d => d.emissions);
  const y = d3.scaleLinear()
    .domain([0, maxEmission])
    .nice()
    .range([height, 0]);

  // Horizontal grid lines
  chartGroup.append('g')
    .attr('class', 'grid horizontal-grid')
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat('')
    )
    .selectAll('line')
    .attr('stroke-width', 0.5);

  // X-axis (ticks and labels only)
  chartGroup.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .tickFormat(function(d) {
          const taskObj = taskEmissions.find(task => task.task === d);
          return taskObj ? taskObj.originalTask : d;
        })
        .tickSize(0)
    )
    .selectAll('text')
    .style('text-anchor', 'middle')
    .attr('fill', '#ffffff');

  // Remove x-axis line
  chartGroup.selectAll('.x-axis .domain').remove();

  // Y-axis (labels only)
  chartGroup.append('g')
    .attr('class', 'y-axis')
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickSize(0)
    )
    .selectAll('text')
    .attr('fill', '#ffffff');

  // Remove y-axis line
  chartGroup.selectAll('.y-axis .domain').remove();

  // Y-axis label
  chartGroup.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', -60)
    .attr('x', -height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('CO₂ Equivalents (grams)')
    .attr('fill', '#ffffff');

  // Tooltip
  const tooltip = d3.select(containerSelector)
    .append('div')
    .attr('class', 'chart-tooltip')
    .style('opacity', 0);

  // Bars
  chartGroup.selectAll('.bar')
    .data(taskEmissions)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.task))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.emissions))
    .attr('height', d => height - y(d.emissions))
    .attr('fill', isUserChart ? '#ffffcc' : '#41ab5d')
    .on('mouseover', function(event, d) {
      // Show the tooltip
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
      tooltip.html(`<strong>${d.originalTask}</strong><br/>Emissions: ${d.emissions.toFixed(0)} grams`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', function(event, d) {
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

  // Labels above bars
  chartGroup.selectAll('.label')
    .data(taskEmissions)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.task) + x.bandwidth() / 2)
    .attr('y', d => y(d.emissions) - 5)
    .attr('text-anchor', 'middle')
    .style('fill', '#ffffff')
    .style('font-size', '10px')
    .text(d => `${d.userValue} ${d.unit.toLowerCase()}`);

  // Chart title
  chartGroup.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', -30)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .attr('fill', '#ffffff')
    .text(chartTitle);
}