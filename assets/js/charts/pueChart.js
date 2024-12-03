export function drawPueChart(containerSelector, data, updateEnergyConsumptionChart) {
  // Make a copy of the initial data to reset later
  const initialData = data.map(d => ({ ...d }));

  // Set up margins and dimensions
  const margin = { top: 70, right: 30, bottom: 80, left: 80 };
  const containerWidth = d3.select(containerSelector).node().getBoundingClientRect().width;
  const width = containerWidth - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom; // Increased height for finer control

  // Create a container div for the chart and the button
  const chartContainer = d3.select(containerSelector)
    .append('div')
    .attr('class', 'pue-chart-wrapper');

  // Create SVG container inside the chart container
  const svg = chartContainer
    .append('svg')
    .attr('class', 'pue-chart-container')
    .attr('width', '100%') // Full width
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Add chart title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', (width + margin.left + margin.right) / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '22px')
    .text('Worldwide Data Center Average Annual Power Usage Effectiveness (2010-2050)');

  // Create chart area
  const chartArea = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales with fixed y-domain
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, 3.0])
    .range([height, 0]);

  // Define axes
  const xAxis = d3.axisBottom(x)
    .tickValues(data.filter(d => d.year % 5 === 0).map(d => d.year))
    .tickFormat(d => d.toString());

  const yAxis = d3.axisLeft(y)
    .ticks(5);

  // Add horizontal gridlines
  chartArea.append('g')
    .attr('class', 'grid horizontal-grid')
    .call(d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width)
      .tickFormat(''))
    .selectAll('line')
    .attr('stroke', '#58595b')
    .attr('stroke-width', 0.5);

  // Add vertical gridlines every 5 years
  chartArea.append('g')
    .attr('class', 'grid vertical-grid')
    .call(d3.axisBottom(x)
      .tickValues(data.filter(d => d.year % 5 === 0).map(d => d.year))
      .tickSize(height)
      .tickFormat(''))
    .selectAll('line')
    .attr('stroke', '#58595b')
    .attr('stroke-width', 0.5);

  // Append x-axis labels without the axis line
  chartArea.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  // Remove x-axis line but keep tick labels
  chartArea.select('.x-axis path')
    .style('display', 'none');

  // Remove x-axis tick lines
  chartArea.selectAll('.x-axis .tick line')
    .style('display', 'none');

  // Append y-axis labels without the axis line
  chartArea.append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis);

  // Remove y-axis line but keep tick labels
  chartArea.select('.y-axis path')
    .style('display', 'none');

  // Remove y-axis tick lines
  chartArea.selectAll('.y-axis .tick line')
    .style('display', 'none');

  // Add x-axis title
  chartArea.append('text')
    .attr('class', 'axis-title')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .text('Years');

  // Add y-axis title
  chartArea.append('text')
    .attr('class', 'axis-title')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -50)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .text('Power Usage Effectiveness (PUE)');

  // Append data points after gridlines
  const dots = chartArea.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.pue))
    .attr('r', 6)
    .attr('fill', '#31a354')
    .attr('fill-opacity', d => d.pueSource === 'Actual' ? 0.5 : 0.2)
    .attr('stroke', '#31a354')
    .attr('stroke-width', 1)
    .style('pointer-events', 'all')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    );

  // Bring dots to the front
  dots.raise();

  // Add tooltip
  const tooltip = d3.select(containerSelector)
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  dots.on('mouseover', function(event, d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(`Year: ${d.year}<br>PUE: ${d.pue.toFixed(2)}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .style('max-width', '200px');
    })
    .on('mouseout', function(d) {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });

  // Vertical dashed line between past and future data
  const separatorYear = 2024.5;
  chartArea.append('line')
    .attr('class', 'separator-line')
    .attr('x1', x(separatorYear))
    .attr('y1', 0)
    .attr('x2', x(separatorYear))
    .attr('y2', height)
    .attr('stroke', '#ffffff')
    .attr('stroke-dasharray', '4');

  // Labels for past and future data
  chartArea.append('text')
    .attr('class', 'label')
    .attr('x', x(2017))
    .attr('y', 20)
    .attr('fill', '#ffffff')
    .text('Past Data');

  chartArea.append('text')
    .attr('class', 'label')
    .attr('x', x(2030))
    .attr('y', 20)
    .attr('fill', '#ffffff')
    .text('Future Data');

  // Add horizontal line at y = 1.0 (theoretical limit of PUE)
  chartArea.append('line')
    .attr('class', 'theoretical-limit-line')
    .attr('x1', 0)
    .attr('y1', y(1.0))
    .attr('x2', width)
    .attr('y2', y(1.0))
    .attr('stroke', '#78c679')
    .attr('stroke-dasharray', '4');

  // Move legend below the chart
  const legendData = [
    { label: 'Actual Data', opacity: 0.5, type: 'circle' },
    { label: 'Interpolations/Projections', opacity: 0.2, type: 'circle' },
    { label: 'Past/Future Boundary', type: 'line', style: 'separator' },
    { label: 'Theoretical PUE Limit', type: 'line', style: 'theoretical' }
  ];

  const legend = chartContainer.append('div')
    .attr('class', 'legend');

  const legendItems = legend.selectAll('.legend-item')
    .data(legendData)
    .enter()
    .append('div')
    .attr('class', 'legend-item');

  legendItems.each(function(d) {
    const item = d3.select(this);
    if (d.type === 'circle') {
      item.append('div')
        .attr('class', 'legend-color-box')
        .style('background-color', '#31a354')
        .style('opacity', d.opacity);
    } else if (d.type === 'line') {
      item.append('div')
        .attr('class', 'legend-line-box')
        .style('border-bottom', d.style === 'separator' ? '2px dashed #ffffff' : '2px dashed #78c679')
        .style('width', '20px')
        .style('height', '0px')
        .style('margin-right', '5px');
    }
    item.append('div')
      .attr('class', 'legend-label')
      .text(d.label);
  });

  // Add Reset button below the chart inside the chart container
  chartContainer.append('button')
    .attr('class', 'reset-button')
    .text('Reset')
    .on('click', resetChart);

  // Function to update the chart
  function updateChart() {
    // Update dots
    chartArea.selectAll('.dot')
      .data(data)
      .attr('cy', d => y(d.pue));
  }

  // Drag event handlers
  function dragstarted(event, d) {
    d3.select(this).raise().classed('active', true);
  }

  function dragged(event, d) {
    const newY = y.invert(event.y);
    d.pue = Math.max(0, Math.min(newY, 3.0));
    d3.select(this)
      .attr('cy', y(d.pue));

    // Update energy consumption chart
    if (updateEnergyConsumptionChart) {
      updateEnergyConsumptionChart();
    }
  }

  function dragended(event, d) {
    d3.select(this).classed('active', false);
  }

  // Function to reset the chart
  function resetChart() {
    // Reset data to initial values
    data.forEach((d, i) => {
      d.pue = initialData[i].pue;
    });

    // Update chart
    updateChart();

    // Update energy consumption chart
    if (updateEnergyConsumptionChart) {
      updateEnergyConsumptionChart();
    }
  }
}