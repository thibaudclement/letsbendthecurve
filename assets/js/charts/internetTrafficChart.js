export function drawInternetTrafficChart(containerSelector, data) {
  const container = d3.select(containerSelector);

  // Remove existing content
  container.html('');

  // Create buttons
  const buttonContainer = container.append('div').attr('class', 'button-container');
  const options = [
    { name: 'Logarithmic', key: 'logarithmicSimulation' },
    { name: 'Linear', key: 'linearSimulation' },
    { name: 'Exponential', key: 'internetTraffic' },
  ];

  let selectedOption = null;

  options.forEach(option => {
    const button = buttonContainer.append('button')
      .attr('class', 'traffic-option-button')
      .text(option.name)
      .on('click', function () {
        // Check if the option is already selected
        if (selectedOption === option.key) {
          // Deselect the option
          selectedOption = null;
          // Update button styles
          buttonContainer.selectAll('button').classed('selected', false);
        } else {
          // Update selected option
          selectedOption = option.key;
          // Update button styles
          buttonContainer.selectAll('button').classed('selected', false);
          d3.select(this).classed('selected', true);
        }
        // Update chart
        updateChart();
      })
      .on('mouseover', function () {
        highlightSeries(option.key);
      })
      .on('mouseout', function () {
        unhighlightSeries(option.key);
      });
  });

  // Create SVG element
  const margin = { top: 70, right: 50, bottom: 50, left: 70 }; // Set left margin to 70 for consistency
  const width = 960 - margin.left - margin.right; // Adjusted for full width
  const height = 500 - margin.top - margin.bottom;

  const svg = container.append('svg')
    .attr('class', 'chart-container')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Append group element
  const chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Adjust data for Zettabytes
  data.forEach(d => {
    d.internetTrafficZB = d.internetTraffic / 1000;
    d.linearSimulationZB = d.linearSimulation / 1000;
    d.logarithmicSimulationZB = d.logarithmicSimulation / 1000;
  });

  // Scales with padding
  const xPadding = 10;
  const yPadding = 10;

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([xPadding, width - xPadding]); // Add padding to x-range

  const yMax = d3.max(data, d => Math.max(d.internetTrafficZB, d.linearSimulationZB, d.logarithmicSimulationZB));
  const y = d3.scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([height - yPadding, yPadding]); // Add padding to y-range

  // Horizontal grid lines
  chartGroup.append('g')
    .attr('class', 'grid horizontal-grid')
    .call(
      d3.axisLeft(y)
        .ticks(10)
        .tickSize(-width + xPadding * 2) // Adjust tick size for x-padding
        .tickFormat('')
    )
    .attr('transform', `translate(${xPadding},0)`); // Shift grid lines right by xPadding

  // Vertical grid lines
  chartGroup.append('g')
    .attr('class', 'grid vertical-grid')
    .attr('transform', `translate(0, ${height - yPadding})`) // Shift grid lines up by yPadding
    .call(
      d3.axisBottom(x)
        .ticks(10)
        .tickSize(-height + yPadding * 2) // Adjust tick size for y-padding
        .tickFormat('')
    );

  // Remove extra grid lines to avoid box effect
  chartGroup.selectAll(".horizontal-grid .tick:first-of-type line, .horizontal-grid .tick:last-of-type line")
    .remove();

  chartGroup.selectAll(".vertical-grid .tick:first-of-type line, .vertical-grid .tick:last-of-type line")
    .remove();

  // X-axis (ticks and labels only)
  chartGroup.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height - yPadding})`) // Adjust for y-padding
    .call(
      d3.axisBottom(x)
        .tickFormat(d3.format('d'))
        .tickSize(0)
    )
    .selectAll('text')
    .attr('fill', '#ffffff');

  // Remove x-axis line
  chartGroup.selectAll('.x-axis .domain').remove();

  // Y-axis (labels only)
  chartGroup.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${xPadding},0)`) // Adjust for x-padding
    .call(
      d3.axisLeft(y)
        .ticks(10)
        .tickSize(0)
        .tickFormat(d => `${d} ZB`)
    )
    .selectAll('text')
    .attr('fill', '#ffffff');

  // Remove y-axis line
  chartGroup.selectAll('.y-axis .domain').remove();

  // Axis labels
  chartGroup.append('text')
    .attr('class', 'axis-label')
    .attr('x', -height / 2)
    .attr('y', -60)
    .attr('transform', 'rotate(-90)')
    .style('text-anchor', 'middle')
    .text('Internet Traffic (Zettabytes per Year)')
    .attr('fill', '#ffffff');

  chartGroup.append('text')
    .attr('class', 'axis-label')
    .attr('x', (width - xPadding * 2) / 2 + xPadding)
    .attr('y', height + 40 - yPadding)
    .style('text-anchor', 'middle')
    .text('Year')
    .attr('fill', '#ffffff');

  // Chart title
  chartGroup.append('text')
    .attr('class', 'chart-title')
    .attr('x', (width - xPadding * 2) / 2 + xPadding)
    .attr('y', -40)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .attr('fill', '#ffffff')
    .text('Global Internet Traffic from 2000 to 2024');

  // Annotation
  const annotationYear = 2020;
  const annotationData = data.find(d => d.year === annotationYear);

  chartGroup.append('text')
    .attr('x', x(annotationYear) - 350) // Adjusted X position
    .attr('y', y(annotationData.internetTrafficZB) - 70) // Adjusted Y position
    .attr('fill', '#ffffff')
    .text('Hint: in 2020, the internet traffic amounted to 2.7 Exabytes.')
    .style('font-size', '14px'); // Adjusted font size for better visibility

  chartGroup.append('line')
    .attr('x1', x(annotationYear))
    .attr('y1', y(annotationData.internetTrafficZB))
    .attr('x2', x(annotationYear) - 100)
    .attr('y2', y(annotationData.internetTrafficZB) - 60) // Adjusted Y2 to match text position
    .attr('stroke', '#ffffff');

  // Plot all data series, but hide them initially
  const seriesKeys = ['internetTrafficZB', 'linearSimulationZB', 'logarithmicSimulationZB'];

  seriesKeys.forEach(key => {
    chartGroup.selectAll(`.dot-${key}`)
      .data(data)
      .enter()
      .append('circle')
      .attr('class', `dot dot-${key}`)
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d[key]))
      .attr('r', 5)
      .attr('fill', '#74c476')
      .attr('stroke', '#74c476')
      .attr('stroke-opacity', 1)
      .attr('fill-opacity', 0.5)
      .style('display', 'none'); // Hide dots initially
  });

  // Show the hint data point at all times
  chartGroup.append('circle')
    .attr('class', 'dot hint-dot')
    .attr('cx', x(annotationYear))
    .attr('cy', y(annotationData.internetTrafficZB))
    .attr('r', 5)
    .attr('fill', '#74c476')
    .attr('stroke', '#74c476')
    .attr('stroke-opacity', 1)
    .attr('fill-opacity', 0.5);

  // Function to update chart based on selected option
  function updateChart() {
    // Hide all dots
    chartGroup.selectAll('.dot')
      .style('display', 'none');

    // Show hint data point
    chartGroup.selectAll('.hint-dot')
      .style('display', null);

    if (selectedOption) {
      // Show selected series
      chartGroup.selectAll(`.dot-${selectedOption}ZB`)
        .style('display', null);
    }
  }

  // Function to handle hover
  function highlightSeries(key) {
    // Show the circles for the hovered key
    if (key !== selectedOption) {
      chartGroup.selectAll(`.dot-${key}ZB`)
        .style('display', null);
    }
  }

  function unhighlightSeries(key) {
    // Hide the circles for the unhovered key only if it's not selected
    if (selectedOption !== key) {
      chartGroup.selectAll(`.dot-${key}ZB`)
        .style('display', 'none');
    }
  }

  // Function to handle guess submission
  function submitGuess() {
    const feedbackSection = d3.select('#guess-feedback');
    feedbackSection.html(''); // Clear previous feedback

    if (!selectedOption) {
      feedbackSection
        .style('display', 'block')
        .html('<p>Please select an option before submitting your guess.</p>');
      return;
    }

    if (selectedOption === 'internetTraffic') {
      // Correct guess
      feedbackSection
        .style('display', 'block')
        .html('<p><strong>That’s correct!</strong> While the number of internet users has grown linearly between 2000 and 2024, global internet traffic has followed an exponential growth trend. This reflects the dramatic increase in the average data consumption per user, driven by the growing reliance on digital services and the rise of data-intensive technologies like streaming, artificial intelligence, and blockchain. Let’s explore what this means for emissions.</p>');
    } else if (selectedOption === 'linearSimulation'){
      // Incorrect guess
      feedbackSection
        .style('display', 'block')
        .html('<p><strong>Close, but not quite.</strong> A linear growth pattern for internet traffic might seem reasonable, given the steady increase in the number of internet users over the same period. However, this would suggest that the amount of data each user consumes has stayed relatively constant—which is not the case. As digital services have become central to daily life and new technologies like streaming, AI, and blockchain have emerged, data consumption per user has risen significantly. Give it another shot!</p>');
    } else if (selectedOption === 'logarithmicSimulation'){
      // Incorrect guess
      feedbackSection
        .style('display', 'block')
        .html('<p><strong>Not quite.</strong> While the number of internet users has grown linearly from 2000 to 2024, if global internet traffic had followed a logarithmic growth pattern, it would mean the amount of data consumed per user has decreased over time. This is not the case. In fact, digital services have become integral to modern life, and technologies like streaming, artificial intelligence, and blockchain are highly data-intensive. Feel free to try again!</p>');
    }
  }

  // Submit button
  container.append('button')
    .attr('id', 'submit-guess-button')
    .text('Submit my guess')
    .on('click', submitGuess);

  // Initially, hide all series except the hint
  updateChart();
}