export function drawPueChart(containerSelector, data, updateEnergyConsumptionChart) {
  // Make a copy of the initial data to reset later
  const initialData = data.map(d => ({ ...d }));

  // Set up dimensions and margins
  const margin = { top: 70, right: 30, bottom: 80, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create a container div for the chart and the button
  const chartContainer = d3.select(containerSelector)
    .append('div')
    .attr('class', 'pue-chart-wrapper');

  // Create SVG container inside the chart container
  const svg = chartContainer
    .append('svg')
    .attr('class', 'pue-chart-container')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  // Add chart title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', (width + margin.left + margin.right) / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '16px')
    .text('Worldwide Data Center Average Annual Power Usage Effectiveness (2010-2050)');

  // Create chart area
  const chartArea = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales with fixed y-domain
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([1.0, 2.5]) // Fixed domain for PUE values
    .range([height, 0]);

  // Axes
  const xAxis = d3.axisBottom(x)
    .tickValues(data.map(d => d.year)) // Tick for every year
    .tickFormat(d => (d % 5 === 0 ? d : '')); // Label every 5 years

  const yAxis = d3.axisLeft(y);

  // Append axes before dots
  chartArea.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .selectAll('text')
    .attr('transform', 'rotate(-30)')
    .style('text-anchor', 'end');

  chartArea.append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis);

  // Add x-axis title
  chartArea.append('text')
    .attr('class', 'axis-title')
    .attr('x', width / 2)
    .attr('y', height + 60)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '14px')
    .text('Years');

  // Add y-axis title
  chartArea.append('text')
    .attr('class', 'axis-title')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -60)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '14px')
    .text('Worldwide Average Data Center PUE');

  // Append data points after axes
  const dots = chartArea.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.pue))
    .attr('r', 5)
    .attr('fill', '#31a354')
    .attr('opacity', d => d.pueSource === 'Actual' ? 1 : 0.5)
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

  // Add legend
  const legend = chartArea.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - 150}, 10)`);

  // Actual Data Legend
  legend.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 5)
    .attr('fill', '#31a354')
    .attr('opacity', 1);

  legend.append('text')
    .attr('x', 15)
    .attr('y', 5)
    .attr('fill', '#ffffff')
    .text('Actual Data');

  // Interpolations/Projections Legend
  legend.append('circle')
    .attr('cx', 0)
    .attr('cy', 20)
    .attr('r', 5)
    .attr('fill', '#31a354')
    .attr('opacity', 0.5);

  legend.append('text')
    .attr('x', 15)
    .attr('y', 25)
    .attr('fill', '#ffffff')
    .text('Interpolations/Projections');

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
    d.pue = Math.max(1.0, Math.min(newY, 3.0)); // Limit PUE between 1.0 and 3.0
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