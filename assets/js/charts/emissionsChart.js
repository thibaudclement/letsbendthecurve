export function drawEmissionsChart(containerSelector, taskEmissions, usTaskEmissions = null, chartTitle = '', isUserChart = false) {
  // Remove existing SVG if any
  d3.select(containerSelector).select('svg').remove();

  // Set up dimensions and margins
  const margin = { top: 70, right: 20, bottom: 50, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'chart-container')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${800} ${height + margin.top + margin.bottom}`)
    .append('g')
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

  // X-axis
  svg.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(function(d) {
      const taskObj = taskEmissions.find(task => task.task === d);
      return taskObj ? taskObj.originalTask : d;
    }))
    .selectAll('text')
    .style('text-anchor', 'middle')
    .attr('fill', '#ffffff');

  // Y-axis
  svg.append('g')
    .attr('class', 'axis y-axis')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .attr('fill', '#ffffff');

  // Y-axis label
  svg.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', -60)
    .attr('x', -height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('CO₂ Equivalents (grams)')
    .attr('fill', '#ffffff');

  // Bars
  svg.selectAll('.bar')
    .data(taskEmissions)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.task))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.emissions))
    .attr('height', d => height - y(d.emissions))
    .attr('fill', isUserChart ? '#ffffcc' : '#74c476');

  // Labels above bars
  svg.selectAll('.label')
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
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', -30)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .attr('fill', '#ffffff')
    .text(chartTitle);
}