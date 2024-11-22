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
    .domain([0, 3.0]) // Changed to 0 - 3.0 for more amplitude
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
    .attr('fill-opacity', d => d.pueSource === 'Actual' ? 0.5 : 0.2) // Adjusted fill opacity
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

  // Move legend below the chart
  const legendData = [
    { label: 'Actual Data', opacity: 0.5 },
    { label: 'Interpolations/Projections', opacity: 0.2 }
  ];

  const legend = chartContainer.append('div')
    .attr('class', 'legend');

  const legendItems = legend.selectAll('.legend-item')
    .data(legendData)
    .enter()
    .append('div')
    .attr('class', 'legend-item');

  legendItems.append('div')
    .attr('class', 'legend-color-box')
    .style('background-color', '#31a354')
    .style('opacity', d => d.opacity);

  legendItems.append('div')
    .attr('class', 'legend-label')
    .text(d => d.label);

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
    d.pue = Math.max(0, Math.min(newY, 3.0)); // Limit PUE between 0 and 3.0
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