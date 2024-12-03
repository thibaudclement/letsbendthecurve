export function drawIctEmissionsCharts(containerSelector1, containerSelector2, legendSelector, data) {
  // Split data into two datasets
  const data1 = data.filter(d => d.year >= 2007 && d.year <= 2020);
  const data2 = data.filter(d => d.year >= 2021 && d.year <= 2040);

  // Shared y-domain
  const yMax = d3.max(data, d => d.maxEstimate);
  const yDomain = [0, yMax];

  // Function to create a chart
  function createChart(containerSelector, chartData, subtitle, xDomain, chartId) {
    // Set up margins and dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 70 };

    // Get container width
    const containerWidth = d3.select(containerSelector).node().getBoundingClientRect().width;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create scales with correct ranges
    const x = d3.scaleLinear()
      .domain(xDomain)
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(yDomain)
      .nice()
      .range([height, 0]);

    // Number formatter for percentages with two decimal places
    const formatPercentage = d3.format(".2f");

    // Create SVG container
    const svg = d3.select(containerSelector)
      .append('svg')
      .attr('class', 'chart-container')
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create chart area
    const chartArea = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create a tooltip div and append it to the container
    const tooltip = d3.select(containerSelector)
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0);

    // Add gridlines before plotting data
    // Vertical gridlines
    const verticalGrid = chartArea.append('g')
      .attr('class', 'grid vertical-grid')
      .call(
        d3.axisBottom(x)
          .ticks(5)
          .tickSize(-height)
          .tickFormat('')
      )
      .attr('transform', `translate(0, ${height})`);

    verticalGrid.selectAll('line')
      .attr('stroke', '#414042')
      .attr('stroke-width', 0.5);

    // Remove rightmost vertical gridline
    verticalGrid.select('.tick:last-of-type line').remove();

    // Horizontal gridlines
    const horizontalGrid = chartArea.append('g')
      .attr('class', 'grid horizontal-grid')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat('')
      );

    horizontalGrid.selectAll('line')
      .attr('stroke', '#414042')
      .attr('stroke-width', 0.5);

    // Remove bottommost horizontal gridline (x-axis gridline)
    horizontalGrid.select('.tick:last-of-type line').remove();

    // Create axes
    let tickValues;
    if (chartId === 'chart1') {
      tickValues = d3.range(2008, 2021, 2);
    } else if (chartId === 'chart2') {
      tickValues = [2025, 2030, 2035, 2040];
    }

    // Add x-axis
    const xAxis = chartArea.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x)
        .tickValues(tickValues)
        .tickFormat(d3.format('d')));

    xAxis.selectAll('text')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px');

    // Add y-axis
    const yAxis = chartArea.append('g')
      .attr('class', 'axis y-axis')
      .call(d3.axisLeft(y).tickFormat(d => `${d}%`));

    yAxis.selectAll('text')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px');

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
      .attr('fill', '#78c679')
      .attr('opacity', 0.3)
      .attr('d', d3.area()
        .defined(d => !isNaN(d.minEstimate) && !isNaN(d.maxEstimate))
        .x(d => x(d.year))
        .y0(d => y(d.minEstimate))
        .y1(d => y(d.maxEstimate))
      )
      .style('pointer-events', 'none');

    // Append lines
    chartArea.append('path')
      .datum(chartData)
      .attr('class', 'line line-min')
      .attr('d', lineMin)
      .style('pointer-events', 'none');

    chartArea.append('path')
      .datum(chartData)
      .attr('class', 'line line-max')
      .attr('d', lineMax)
      .style('pointer-events', 'none');

    // Add invisible circles for minEstimate
    chartArea.selectAll('.ict-invisible-dot-min')
      .data(chartData.filter(d => !isNaN(d.minEstimate)))
      .enter()
      .append('circle')
      .attr('class', 'ict-invisible-dot ict-invisible-dot-min')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.minEstimate))
      .attr('r', 8)
      .style('fill', '#000000')
      .style('fill-opacity', 0)
      .style('stroke', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', function(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', 1);
        tooltip.html(`<strong>Year:</strong> ${d.year}<br/><strong>Estimate:</strong> Minimum<br/><strong>Percentage:</strong> ${formatPercentage(d.minEstimate)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add invisible circles for maxEstimate
    chartArea.selectAll('.ict-invisible-dot-max')
      .data(chartData.filter(d => !isNaN(d.maxEstimate)))
      .enter()
      .append('circle')
      .attr('class', 'ict-invisible-dot ict-invisible-dot-max')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.maxEstimate))
      .attr('r', 8)
      .style('fill', '#000000')
      .style('fill-opacity', 0)
      .style('stroke', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', function(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', 1);
        tooltip.html(`<strong>Year:</strong> ${d.year}<br/><strong>Estimate:</strong> Maximum<br/><strong>Percentage:</strong> ${formatPercentage(d.maxEstimate)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add chart subtitle
    svg.append('text')
      .attr('class', 'chart-subtitle')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('fill', '#ffffff')
      .text(subtitle);

    // Add x-axis title
    svg.append('text')
      .attr('class', 'axis-title')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', height + margin.top + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .text('Years');

    // Add y-axis title
    svg.append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2) - margin.top)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .text('Percentage of Global Emissions');

    // Add annotation on the second chart
    if (chartId === 'chart2') {
      // Create a group for the annotation
      const annotationGroup = chartArea.append('g')
        .attr('class', 'annotation-group')
        .attr('transform', `translate(${x(2026)}, ${y(12)})`);

      // Add the text
      const annotationText = annotationGroup.append('text')
        .attr('class', 'annotation')
        .attr('fill', '#78c679')
        .text('This is the curve we want to bend.')
        .style('font-size', '16px')
        .attr('x', 0)
        .attr('y', 0);

      // After text is rendered, get its bounding box
      const bbox = annotationText.node().getBBox();

      // Add padding
      const padding = { top: 2, right: 4, bottom: 2, left: 4 };

      // Create a rectangle behind the text
      annotationGroup.insert('rect', 'text')
        .attr('class', 'annotation-rect')
        .attr('x', bbox.x - padding.left)
        .attr('y', bbox.y - padding.top)
        .attr('width', bbox.width + padding.left + padding.right)
        .attr('height', bbox.height + padding.top + padding.bottom)
        .attr('fill', 'none')
        .attr('stroke', '#78c679')
        .attr('stroke-width', 2);
    }
  }

  // Create both charts with adjusted x-domains
  createChart(
    containerSelector1,
    data1,
    'Historical Trends (2007-2020)',
    [2007, 2020],
    'chart1'
  );

  createChart(
    containerSelector2,
    data2,
    'Modeled Projections (2021-2040)',
    [2021, 2040],
    'chart2'
  );

  // Insert main title into the #ict-emissions-title div
  d3.select('#ict-emissions-title')
    .append('p')
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
    .attr('width', '100%')
    .attr('height', 50)
    .attr('viewBox', `0 0 800 50`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const legend = svgLegend.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${(800 - 450) / 2}, 10)`);

  // Legend items
  const legendData = [
    { label: 'Estimate Range', type: 'area', color: '#78c679' },
    { label: 'Min Estimate', type: 'line', color: '#78c679' },
    { label: 'Max Estimate', type: 'line', color: '#31a354' },
  ];

  const legendItem = legend.selectAll('.legend-item')
    .data(legendData)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(${i * 150}, 0)`);

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