export function drawElectricityConsumptionChart(containerSelector, data) {
  // Set up initial parameters
  const margin = { top: 50, right: 50, bottom: 50, left: 150 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Get unique years and countries
  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
  const allCountries = Array.from(new Set(data.map(d => d.country)));

  // Initial settings
  let selectedCountries = [...allCountries];
  let currentYearIndex = 0;
  let isPlaying = false;
  let timer;

  // Create SVG container
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'chart-container')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const chartArea = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Create scales
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleBand().range([0, height]).padding(0.1);

  // Create axes
  const xAxis = svg.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(${margin.left},${height + margin.top})`);

  const yAxis = svg.append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Add year label
  const yearLabel = svg.append('text')
    .attr('class', 'year-label')
    .attr('x', width + margin.left)
    .attr('y', height + margin.top - 10)
    .attr('text-anchor', 'end')
    .attr('font-size', '48px')
    .attr('fill', '#ffffff')
    .text(years[currentYearIndex]);

  // Function to update the chart for a given year
  function updateChart(year) {
    // Filter data for the selected year and countries
    let yearData = data.filter(d => d.year === year && selectedCountries.includes(d.country));

    // Sort data in descending order of power consumption
    yearData.sort((a, b) => b.powerConsumption - a.powerConsumption);

    // Update scales
    x.domain([0, d3.max(yearData, d => d.powerConsumption)]);
    y.domain(yearData.map(d => d.country));

    // Update axes
    xAxis.transition().call(d3.axisBottom(x).tickFormat(d => `${d} TWh`).ticks(5))
      .selectAll('text').attr('fill', '#ffffff');
    yAxis.transition().call(d3.axisLeft(y))
      .selectAll('text').attr('fill', '#ffffff');

    // Bind data
    const bars = chartArea.selectAll('.bar')
      .data(yearData, d => d.country);

    // Exit
    bars.exit().transition().duration(500).attr('width', 0).remove();

    // Update
    bars.transition().duration(500)
      .attr('x', 0)
      .attr('y', d => y(d.country))
      .attr('width', d => x(d.powerConsumption))
      .attr('height', y.bandwidth())
      .attr('fill', d => d.country === 'Internet' ? '#74c476' : '#006837');

    // Enter
    bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.country))
      .attr('height', y.bandwidth())
      .attr('width', 0)
      .attr('fill', d => d.country === 'Internet' ? '#74c476' : '#006837')
      .transition().duration(500)
      .attr('width', d => x(d.powerConsumption));

    // Add labels for power consumption
    const labels = chartArea.selectAll('.label')
      .data(yearData, d => d.country);

    // Exit
    labels.exit().transition().duration(500).attr('x', 0).remove();

    // Update
    labels.transition().duration(500)
      .attr('x', d => x(d.powerConsumption) + 5)
      .attr('y', d => y(d.country) + y.bandwidth() / 2 + 5)
      .text(d => `${d.powerConsumption} TWh`);

    // Enter
    labels.enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', 0)
      .attr('y', d => y(d.country) + y.bandwidth() / 2 + 5)
      .attr('fill', '#ffffff')
      .text(d => `${d.powerConsumption} TWh`)
      .transition().duration(500)
      .attr('x', d => x(d.powerConsumption) + 5);

    // Update year label
    yearLabel.text(year);
  }

  // Function to play the animation
  function play() {
    isPlaying = true;
    playButton.textContent = 'Pause';
    timer = setInterval(() => {
      currentYearIndex = (currentYearIndex + 1) % years.length;
      updateChart(years[currentYearIndex]);
    }, 2000);
  }

  // Function to pause the animation
  function pause() {
    isPlaying = false;
    playButton.textContent = 'Play';
    clearInterval(timer);
  }

  // Initial chart update
  updateChart(years[currentYearIndex]);

  // Create controls
  const controlsContainer = d3.select('#electricity-consumption-controls');

  // Play/Pause button
  const playButton = document.createElement('button');
  playButton.textContent = 'Play';
  playButton.className = 'control-button';
  playButton.onclick = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  controlsContainer.node().appendChild(playButton);

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.className = 'control-button';
  prevButton.onclick = () => {
    pause();
    currentYearIndex = (currentYearIndex - 1 + years.length) % years.length;
    updateChart(years[currentYearIndex]);
  };
  controlsContainer.node().appendChild(prevButton);

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.className = 'control-button';
  nextButton.onclick = () => {
    pause();
    currentYearIndex = (currentYearIndex + 1) % years.length;
    updateChart(years[currentYearIndex]);
  };
  controlsContainer.node().appendChild(nextButton);

  // Year range slider
  const yearRangeLabel = document.createElement('label');
  yearRangeLabel.textContent = 'Year Range: ';
  controlsContainer.node().appendChild(yearRangeLabel);

  const yearRangeInput = document.createElement('input');
  yearRangeInput.type = 'range';
  yearRangeInput.min = years[0];
  yearRangeInput.max = years[years.length - 1];
  yearRangeInput.value = years[years.length - 1];
  yearRangeInput.className = 'year-range-slider';
  yearRangeInput.oninput = () => {
    pause();
    const selectedYear = +yearRangeInput.value;
    currentYearIndex = years.indexOf(selectedYear);
    updateChart(years[currentYearIndex]);
  };
  controlsContainer.node().appendChild(yearRangeInput);

  // Country selection
  const countrySelectLabel = document.createElement('label');
  countrySelectLabel.textContent = 'Select Countries: ';
  controlsContainer.node().appendChild(countrySelectLabel);

  const countrySelect = document.createElement('select');
  countrySelect.multiple = true;
  countrySelect.className = 'country-select';

  // Create options for countries
  allCountries.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    option.selected = true;
    countrySelect.appendChild(option);
  });

  countrySelect.onchange = () => {
    pause();
    // Always keep 'Internet' selected
    const selectedOptions = Array.from(countrySelect.selectedOptions).map(option => option.value);
    if (!selectedOptions.includes('Internet')) {
      selectedOptions.push('Internet');
      Array.from(countrySelect.options).forEach(option => {
        if (option.value === 'Internet') {
          option.selected = true;
        }
      });
    }
    selectedCountries = selectedOptions;
    updateChart(years[currentYearIndex]);
  };

  controlsContainer.node().appendChild(countrySelect);

  // Ensure 'Internet' is always selected and disabled
  Array.from(countrySelect.options).forEach(option => {
    if (option.value === 'Internet') {
      option.disabled = true;
    }
  });
}