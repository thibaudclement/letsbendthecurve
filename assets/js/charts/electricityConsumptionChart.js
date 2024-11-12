export function drawElectricityConsumptionChart(containerSelector, data) {
  // Set up initial parameters
  const margin = { top: 80, right: 50, bottom: 50, left: 150 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Get unique years and countries
  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
  const allCountries = Array.from(new Set(data.map(d => d.country))).filter(c => c !== 'Internet').sort();

  // Initial settings
  let selectedCountries = [...allCountries];
  let currentYearIndex = 0;
  let isPlaying = false;
  let hasPlayed = false;
  let timer;

  // Create SVG container
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('class', 'chart-container')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  // Add chart title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', (width + margin.left + margin.right) / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '18px')
    .attr('fill', '#ffffff')
    .text('Electricity Consumption: The Internet vs. G20 Countries From 2010 to 2022');

  const chartArea = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Create scales
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleBand().range([0, height]).padding(0.1);

  // Create axes
  const xAxisGroup = svg.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(${margin.left},${height + margin.top})`);

  const yAxisGroup = svg.append('g')
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
    let yearData = data.filter(d => d.year === year && (selectedCountries.includes(d.country) || d.country === 'Internet'));

    // Sort data in descending order of power consumption
    yearData.sort((a, b) => b.powerConsumption - a.powerConsumption);

    // Update scales
    x.domain([0, d3.max(yearData, d => d.powerConsumption)]);
    y.domain(yearData.map(d => d.country));

    // Update axes
    xAxisGroup.transition().call(
      d3.axisBottom(x)
        .tickFormat(d => `${d3.format(',')(d)} TWh`)
        .ticks(5)
    )
      .selectAll('text').attr('fill', '#ffffff');

    yAxisGroup.transition().call(d3.axisLeft(y))
      .selectAll('text').attr('fill', '#ffffff');

    // DATA JOIN for bars
    const bars = chartArea.selectAll('.bar')
      .data(yearData, d => d.country);

    // EXIT old elements
    bars.exit().transition().duration(500)
      .attr('width', 0)
      .remove();

    // UPDATE existing elements
    bars.transition().duration(500)
      .attr('x', 0)
      .attr('y', d => y(d.country))
      .attr('width', d => x(d.powerConsumption))
      .attr('height', y.bandwidth())
      .style('fill', d => d.country === 'Internet' ? '#74c476' : '#006837');

    // ENTER new elements
    bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.country))
      .attr('height', y.bandwidth())
      .attr('width', 0)
      .style('fill', d => d.country === 'Internet' ? '#74c476' : '#006837')
      .transition().duration(500)
      .attr('width', d => x(d.powerConsumption));

    // DATA JOIN for labels
    const labels = chartArea.selectAll('.label')
      .data(yearData, d => d.country);

    // EXIT old labels
    labels.exit().transition().duration(500)
      .attr('x', 0)
      .remove();

    // UPDATE existing labels
    labels.transition().duration(500)
      .attr('x', d => x(d.powerConsumption) + 5)
      .attr('y', d => y(d.country) + y.bandwidth() / 2 + 5)
      .tween('text', function(d) {
        const previous = this.textContent.replace(/,/g, '').split(' ')[0];
        const current = d.powerConsumption;
        const i = d3.interpolateNumber(+previous, current);
        return function(t) {
          this.textContent = `${d3.format(',')(Math.round(i(t)))} TWh`;
        };
      });

    // ENTER new labels
    labels.enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.powerConsumption) + 5)
      .attr('y', d => y(d.country) + y.bandwidth() / 2 + 5)
      .attr('fill', '#ffffff')
      .text(d => `${d3.format(',')(d.powerConsumption)} TWh`);

    // Update year label
    yearLabel.text(year);
  }

  // Function to play the animation
  function play() {
    if (currentYearIndex >= years.length - 1) {
      currentYearIndex = -1; // Reset to start before the first year
    }
    isPlaying = true;
    playButton.textContent = 'Pause';
    timer = setInterval(() => {
      currentYearIndex++;
      if (currentYearIndex >= years.length) {
        pause();
        currentYearIndex = years.length - 1; // Set to last year
        return;
      }
      updateChart(years[currentYearIndex]);
    }, 1000); // Reduced interval to speed up
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

  // First row for buttons
  const controlButtonsRow = controlsContainer.append('div')
    .attr('class', 'control-row')
    .attr('id', 'control-buttons');

  // Second row for country checkboxes
  const controlOptionsRow = controlsContainer.append('div')
    .attr('class', 'control-row')
    .attr('id', 'control-options');

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
  controlButtonsRow.node().appendChild(playButton);

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.className = 'control-button';
  prevButton.onclick = () => {
    pause();
    currentYearIndex = (currentYearIndex - 1 + years.length) % years.length;
    updateChart(years[currentYearIndex]);
  };
  controlButtonsRow.node().appendChild(prevButton);

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.className = 'control-button';
  nextButton.onclick = () => {
    pause();
    currentYearIndex = (currentYearIndex + 1) % years.length;
    updateChart(years[currentYearIndex]);
  };
  controlButtonsRow.node().appendChild(nextButton);

  // Country selection checkboxes
  const countryCheckboxesContainer = controlOptionsRow.append('div')
    .attr('class', 'checkboxes-container');

  // Split countries into two columns
  const firstColumnCountries = allCountries.slice(0, 10);
  const secondColumnCountries = allCountries.slice(10);

  const countryColumnsContainer = countryCheckboxesContainer.append('div')
    .attr('class', 'country-columns-container');

  const firstColumn = countryColumnsContainer.append('div')
    .attr('class', 'country-column');

  const secondColumn = countryColumnsContainer.append('div')
    .attr('class', 'country-column');

  // Function to create checkboxes in a column
  function createCheckboxes(column, countries) {
    countries.forEach(country => {
      const checkboxLabel = column.append('label')
        .attr('class', 'checkbox-label');

      checkboxLabel.append('input')
        .attr('type', 'checkbox')
        .attr('value', country)
        .attr('checked', true)
        .on('change', function() {
          pause();
          const checkedCountries = [];
          d3.selectAll('.checkboxes-container input[type="checkbox"]').each(function() {
            if (this.checked) {
              checkedCountries.push(this.value);
            }
          });
          selectedCountries = checkedCountries;
          updateChart(years[currentYearIndex]);
        });

      checkboxLabel.append('span')
        .text(country);
    });
  }

  // Create checkboxes in each column
  createCheckboxes(firstColumn, firstColumnCountries);
  createCheckboxes(secondColumn, secondColumnCountries);

  // Autoplay when chart is in viewport
  const chartContainerElement = document.querySelector('#electricity-consumption-chart');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasPlayed) {
        hasPlayed = true;
        play();
        observer.unobserve(chartContainerElement);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(chartContainerElement);
}