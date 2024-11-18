export function drawInternetTrafficChart(containerSelector, data) {
  const container = d3.select(containerSelector);

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
        // Update selected option
        selectedOption = option.key;

        // Update button styles
        buttonContainer.selectAll('button').classed('selected', false);
        d3.select(this).classed('selected', true);

        // Update chart
        updateChart();
      })
      .on('mouseover', function () {
        highlightSeries(option.key);
      })
      .on('mouseout', function () {
        highlightSeries(null);
      });
  });

  // Create SVG element
  const margin = { top: 70, right: 20, bottom: 50, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = container.append('svg')
    .attr('class', 'chart-container')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 800 ${height + margin.top + margin.bottom}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width]);

  const yMax = d3.max(data, d => Math.max(d.internetTraffic, d.linearSimulation, d.logarithmicSimulation));
  const y = d3.scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([height, 0]);

  // Axes
  svg.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')))
    .selectAll('text')
    .attr('fill', '#ffffff');

  svg.append('g')
    .attr('class', 'axis y-axis')
    .call(d3.axisLeft(y).tickFormat(d => `${d} EB`))
    .selectAll('text')
    .attr('fill', '#ffffff');

  // Axis labels
  svg.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .style('text-anchor', 'middle')
    .text('Year')
    .attr('fill', '#ffffff');

  svg.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', -80)
    .attr('x', -height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Internet Traffic (Exabytes per Year)')
    .attr('fill', '#ffffff');

  // Chart title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', -40)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .attr('fill', '#ffffff')
    .text('Guess the Growth of Internet Traffic from 2000 to 2024');

  // Annotation
  const annotationYear = 2020;
  const annotationData = data.find(d => d.year === annotationYear);

  svg.append('text')
    .attr('x', x(annotationYear) - 350)
    .attr('y', y(annotationData.internetTraffic) - 50)
    .attr('fill', '#ffffff')
    .text('Hint: in 2020, the internet traffic amounted to 2.7 Exabytes.')
    .style('font-size', '12px');

  svg.append('line')
    .attr('x1', x(annotationYear) - 10)
    .attr('y1', y(annotationData.internetTraffic) - 10)
    .attr('x2', x(annotationYear) - 30)
    .attr('y2', y(annotationData.internetTraffic) - 40)
    .attr('stroke', '#ffffff');

  // Plot all data series in grey with 50% opacity
  const seriesKeys = ['internetTraffic', 'linearSimulation', 'logarithmicSimulation'];

  seriesKeys.forEach(key => {
    svg.selectAll(`.dot-${key}`)
      .data(data)
      .enter()
      .append('circle')
      .attr('class', `dot dot-${key}`)
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d[key]))
      .attr('r', 5)
      .attr('fill', '#888888')
      .attr('opacity', 0.5);
  });

  // Submit button
  container.append('button')
    .attr('id', 'submit-guess-button')
    .text('Submit my guess')
    .on('click', submitGuess);

  // Function to highlight series
  function highlightSeries(key) {
    // Reset all dots
    svg.selectAll('.dot')
      .attr('fill', '#888888')
      .attr('opacity', 0.5);

    if (key) {
      // Highlight selected series
      svg.selectAll(`.dot-${key}`)
        .attr('fill', '#74c476')
        .attr('opacity', 1);
    }
  }

  // Function to update chart based on selected option
  function updateChart() {
    highlightSeries(selectedOption);
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
        .html('<p><strong>That’s correct!</strong> While the number of internet users has grown linearly between 2000 and 2024, global internet traffic has followed an exponential growth trend. This reflects the dramatic increase in the average data consumption per user, driven by the growing reliance on digital services and the rise of data-intensive technologies like streaming, artificial intelligence, and blockchain. Let\’s explore what this means for emissions.</p>');
    } else if (selectedOption === 'linearSimulation'){
      // Incorrect guess
      feedbackSection
        .style('display', 'block')
        .html('<p><strong>Close, but not quite.</strong> A linear growth pattern for internet traffic might seem reasonable, given the steady increase in the number of internet users over the same period. However, this would suggest that the amount of data each user consumes has stayed relatively constant—which is not the case. As digital services have become central to daily life and new technologies like streaming, AI, and blockchain have emerged, data consumption per user has risen significantly. Give it another shot!</p>');
    } else if (selectedOption === 'logarithmicSimulation'){
      // Incorrect guess
      feedbackSection
        .style('display', 'block')
        .html('<p><strong>Not quite.</strong> While the number of internet users has grown linearly from 2000 to 2024, if global internet traffic had followed a logarithmic growth pattern, it would mean the amount of data consumed per user had decreased over time. This is not the case. In fact, digital services have become integral to modern life, and technologies like streaming, artificial intelligence, and blockchain are highly data-intensive. Feel free to try again!</p>');
    }
  }
}