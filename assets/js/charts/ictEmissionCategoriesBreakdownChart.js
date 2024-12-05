export function drawIctEmissionCategoriesBreakdownCharts(containerSelector, data) {
  // Set up dimensions and margins
  const width = 200;
  const height = 200;
  const margin = 20;

  // Define the color scale for the slices
  const colorScale = d3.scaleOrdinal()
    .domain(['Operational Emissions', 'Embodied Emissions'])
    .range(['#58595b', '#bcbec0']);

  // Insert main title into the #sustainable-web-design-model-title div
  d3.select('#sustainable-web-design-model-title')
    .append('h2')
    .attr('class', 'main-title')
    .style('text-align', 'center')
    .style('color', '#ffffff')
    .style('font-size', '22px')
    .text('Operational vs. Embodied Emissions by ICT Sector Segment');

  // Create a container for the charts
  const container = d3.select(containerSelector)
    .append('div')
    .attr('class', 'emission-categories-container');

  // For each segment, create a pie chart
  data.forEach(segmentData => {
    // Prepare data for pie chart
    const pieData = [
      {
        category: 'Operational Emissions',
        value: segmentData['Operational Emissions'],
      },
      {
        category: 'Embodied Emissions',
        value: segmentData['Embodied Emissions'],
      },
    ];

    // Create SVG container
    const chartDiv = container.append('div')
      .attr('class', 'emission-chart')
      .attr('data-segment', segmentData.Segment)
      .on('mouseover', function() {
        const segment = d3.select(this).attr('data-segment');
        // Highlight corresponding slice in ict-emissions-breakdown
        d3.selectAll(`.ict-breakdown-slice[data-segment='${segment}']`)
          .classed('highlighted-slice', true);
        // Apply colored outline to this chart
        d3.select(this)
          .classed('highlighted-chart', true)
          .style('outline-color', getSegmentColor(segment));
      })
      .on('mouseout', function() {
        const segment = d3.select(this).attr('data-segment');
        // Remove highlight from corresponding slice
        d3.selectAll(`.ict-breakdown-slice[data-segment='${segment}']`)
          .classed('highlighted-slice', false);
        // Remove outline from this chart
        d3.select(this)
          .classed('highlighted-chart', false)
          .style('outline-color', 'none');
      });

    const svg = chartDiv.append('svg')
      .attr('width', width)
      .attr('height', height + margin);

    // Add chart title
    svg.append('text')
      .attr('class', 'pie-chart-title')
      .attr('x', width / 2)
      .attr('y', margin / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '16px')
      .text(segmentData.Segment);

    // Adjust chart area
    const chartArea = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${(height + margin) / 2})`);

    // Create pie generator
    const pie = d3.pie()
      .sort(null)
      .value(d => d.value)
      .startAngle(-Math.PI / 2);

    // Create arc generator
    const radius = Math.min(width, height) / 2 - margin;
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Generate pie chart
    const arcs = chartArea.selectAll('.arc')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Append path (slices)
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.category));

    // Append labels (only percentage values)
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .text(d => `${d.data.value}%`);
  });

  // Add legend for the emission categories
  const legendData = [
    { category: 'Operational Emissions', color: '#58595b' },
    { category: 'Embodied Emissions', color: '#bcbec0' },
  ];

  const legend = d3.select(containerSelector)
    .append('div')
    .attr('class', 'legend');

  const legendItems = legend.selectAll('.legend-item')
    .data(legendData)
    .enter()
    .append('div')
    .attr('class', 'legend-item');

  legendItems.append('div')
    .attr('class', 'legend-color-box')
    .style('background-color', d => d.color);

  legendItems.append('div')
    .attr('class', 'legend-label')
    .text(d => d.category);

  // Helper function to get segment color
  function getSegmentColor(segment) {
    const colorMap = {
      'Networks': '#006837',
      'Data Centers': '#31a354',
      'User Devices': '#78c679',
    };
    return colorMap[segment] || '#ffffff';
  }
}