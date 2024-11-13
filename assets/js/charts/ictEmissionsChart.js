export function drawIctEmissionsCharts(containerSelector1, containerSelector2, legendSelector, data) {
  // Split data into two datasets
  const data1 = data.filter(d => d.year >= 2007 && d.year <= 2020);
  const data2 = data.filter(d => d.year >= 2021 && d.year <= 2040);

  // Shared y-domain
  const yMax = d3.max(data, d => d.maxEstimate);
  const yDomain = [0, yMax];

  // Function to create a chart
  function createChart(containerSelector, chartData, subtitle, xDomain) {
    // Set up margins and dimensions
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create scales with correct ranges
    const x = d3.scaleLinear()
      .domain(xDomain)
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(yDomain)
      .nice()
      .range([height, 0]);

    // Create SVG container
    const svg = d3.select(containerSelector)
      .append('svg')
      .attr('class', 'chart-container')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // Create chart area
    const chartArea = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Axes
    const xAxis = d3.axisBottom(x)
      .tickFormat(d3.format('d'))
      .ticks(5);

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
      .defined(d => !isNaN(d.minEstimate))
      .x(d => x(d.year))
      .y(d => y(d.minEstimate));

    const lineMax = d3.line()
      .defined(d => !isNaN(d.maxEstimate))
      .x(d => x(d.year))
      .y(d => y(d.maxEstimate));

    // Append area between lines
    chartArea.append('path')
      .datum(chartData)
      .attr('fill', '#74c476')
      .attr('opacity', 0.3)
      .attr('d', d3.area()
        .defined(d => !isNaN(d.minEstimate) && !isNaN(d.maxEstimate))
        .x(d => x(d.year))
        .y0(d => y(d.minEstimate))
        .y1(d => y(d.maxEstimate))
      );

    // Append lines
    chartArea.append('path')
      .datum(chartData)
      .attr('class', 'line line-min')
      .attr('d', lineMin);

    chartArea.append('path')
      .datum(chartData)
      .attr('class', 'line line-max')
      .attr('d', lineMax);

    // Remove the vertical dotted line
    // Code for adding the projection line has been removed as per the request.

    // Add chart subtitle
    svg.append('text')
      .attr('class', 'chart-subtitle')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', '#ffffff')
      .text(subtitle);
  }

  // Create both charts with adjusted x-domains
  createChart(
    containerSelector1,
    data1,
    'Historical Trends (2007-2020)',
    [2007, 2020]
  );

  createChart(
    containerSelector2,
    data2,
    'Modeled Projections (2021-2040)',
    [2021, 2040]
  );

  // Insert main title into the #ict-emissions-title div
  d3.select('#ict-emissions-title')
    .append('h3')
    .attr('class', 'main-title')
    .style('text-align', 'center')
    .style('color', '#ffffff')
    .text('ICT Sector Emissions as a Percentage of Global Emissions');

  // Adjust the margin-top of the charts-container to bring the charts closer to the title
  d3.select('#ict-emissions .charts-container')
    .style('margin-top', '10px');

  // Create combined legend
  const svgLegend = d3.select(legendSelector)
    .append('svg')
    .attr('class', 'legend-container')
    .attr('width', 800)
    .attr('height', 50); // Reduced height to bring legend closer

  const legend = svgLegend.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${(800 - 300) / 2}, 10)`); // Adjusted to bring legend closer

  // Legend items
  const legendData = [
    { label: 'Estimate Range', type: 'area', color: '#74c476' },
    { label: 'Min Estimate', type: 'line', color: '#74c476' },
    { label: 'Max Estimate', type: 'line', color: '#31a354' },
  ];

  const legendItem = legend.selectAll('.legend-item')
    .data(legendData)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(${i * 150}, 0)`); // Adjusted spacing

  // Legend symbols
  legendItem.each(function(d) {
    const g = d3.select(this);
    if (d.type === 'area') {
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d.color)
        .attr('opacity', 0.3);
    } else if (d.type === 'line') {
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 7)
        .attr('x2', 15)
        .attr('y2', 7)
        .attr('stroke', d.color)
        .attr('stroke-width', 2);
    }
  });

  // Legend labels
  legendItem.append('text')
    .attr('x', 20)
    .attr('y', 10)
    .attr('fill', '#ffffff')
    .text(d => d.label);
}