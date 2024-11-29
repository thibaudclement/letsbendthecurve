export function drawFortune500EmissionsChart(containerSelector, data) {
  // Store the original data for resetting
  const originalData = [...data];

  // Get the container's width for responsive design
  const containerWidth = d3.select(containerSelector).node().getBoundingClientRect().width;

  // Set up dimensions and margins
  const margin = { top: 20, right: 10, bottom: 20, left: 10 };
  const width = containerWidth - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom; // Adjust as needed

  // Create color scale for WC Grade
  const colorScale = d3.scaleOrdinal()
    .domain(['A+', 'A', 'B', 'C', 'D', 'E', 'F'])
    .range(['#78c679', '#41ab5d', '#238443', '#006837', '#004529', '#002a18', '#000000']);

  // Build hierarchy
  const hierarchyData = buildHierarchy(data);

  const root = d3.hierarchy(hierarchyData)
    .sum(d => d.totalEmissions)
    .sort((a, b) => b.value - a.value);

  // Create treemap layout
  const treemapLayout = d3.treemap()
    .size([width, height])
    .paddingInner(2) // Adjust padding between nodes
    .round(true);

  treemapLayout(root);

  // Create SVG container
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('margin-top', '20px')
    .style('margin-bottom', '20px')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Add title
  const title = d3.select(containerSelector)
    .insert('div', ':first-child')
    .attr('class', 'chart-title')
    .text(getTitleText(data));

  function getTitleText(data) {
    const numCompanies = data.length;
    const totalEmissions = data.reduce((sum, d) => sum + d.totalEmissions, 0);
    const formattedTotalEmissions = d3.format(',')(Math.round(totalEmissions));
    return `Once a Year, the Websites of These ${numCompanies} Fortune 500 Companies Emit Approximately ${formattedTotalEmissions} Tonnes of CO₂`;
  }

  // Create a group for each node
  let nodesGroup = svg.selectAll('g')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);

  // Draw rectangles for leaf nodes (companies)
  nodesGroup.filter(d => d.depth === 3)
    .append('rect')
    .attr('id', d => d.data.name)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', d => colorScale(d.data.data.wcGrade))
    .attr('stroke', '#414042') // Updated border color
    .attr('stroke-width', 1)
    .on('mouseover', showTooltip)
    .on('mouseout', hideTooltip);

  // Add company names
  nodesGroup.filter(d => d.depth === 3)
    .append('text')
    .attr('class', 'company-name')
    .attr('x', d => (d.x1 - d.x0) / 2)
    .attr('y', d => (d.y1 - d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => {
      const boxWidth = d.x1 - d.x0;
      const boxHeight = d.y1 - d.y0;
      const textWidth = getTextWidth(d.data.name, '12px sans-serif');
      const textHeight = 12;
      if (boxWidth > textWidth && boxHeight > textHeight) {
        return d.data.name;
      } else {
        return '';
      }
    });

  // Ensure labels don't capture pointer events
  svg.selectAll('text')
    .style('pointer-events', 'none');

  // Tooltip
  const tooltip = d3.select(containerSelector)
    .append('div')
    .attr('class', 'tooltip');

  function showTooltip(event, d) {
    tooltip
      .style('opacity', 1)
      .html(getTooltipContent(d.data.data))
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 28) + 'px');
  }

  function hideTooltip(event, d) {
    tooltip
      .style('opacity', 0);
  }

  // Call the legend function
  addLegend(containerSelector, colorScale);

  d3.select(containerSelector)
    .append('div')
    .attr('class', 'toggle-button-container')
    .style('text-align', 'center') // Center the button
    .append('button')
    .attr('class', 'toggle-controls-button')
    .text('Show Filters')
    .on('click', function () {
      const controlBlock = d3.select(containerSelector).select('.control-block');
      const isVisible = controlBlock.style('display') === 'block';
      controlBlock.style('display', isVisible ? 'none' : 'block');
      d3.select(this).text(isVisible ? 'Show Filters' : 'Hide Filters');
    });

  // Add controls in a control-block, initially hidden
  addControls(containerSelector, originalData, updateChart);

  // Helper functions
  function buildHierarchy(data) {
    const root = { name: 'root', children: [] };
    const sectorMap = new Map();

    data.forEach(d => {
      // Get or create the sector node
      let sectorNode = sectorMap.get(d.sector);
      if (!sectorNode) {
        sectorNode = { name: d.sector, children: [] };
        sectorMap.set(d.sector, sectorNode);
        root.children.push(sectorNode);
      }

      // Get or create the industry node
      let industryNode = sectorNode.children.find(child => child.name === d.industry);
      if (!industryNode) {
        industryNode = { name: d.industry, children: [] };
        sectorNode.children.push(industryNode);
      }

      // Add the company node
      industryNode.children.push({
        name: d.company,
        data: d,
        totalEmissions: d.totalEmissions,
      });
    });

    return root;
  }

  function getTextWidth(text, font) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function getTooltipContent(d) {
    if (!d) return '';
    const formatNumber = d3.format(','); // For thousands separator

    return `
      <strong>${d.company}</strong><br/>
      Rank: ${d.rank}<br/>
      Ticker: ${d.ticker}<br/>
      Sector: ${d.sector}<br/>
      Industry: ${d.industry}<br/>
      Profitable: ${capitalize(d.profitableRaw)}<br/>
      CEO: ${d.ceo}<br/>
      Founder is CEO: ${capitalize(d.founderIsCEORaw)}<br/>
      Female CEO: ${capitalize(d.femaleCEORaw)}<br/>
      Company Type: ${d.companyType}<br/>
      World's Most Admired Companies: ${capitalize(d.worldsMostAdmiredCompaniesRaw)}<br/>
      Best Companies to Work For: ${capitalize(d.bestCompaniesToWorkForRaw)}<br/>
      Number of Employees: ${formatNumber(d.numberOfEmployees)}<br/>
      Website: <a href="${d.website}" target="_blank">${d.website}</a><br/>
      Website Carbon Grade: ${d.wcGrade}<br/>
      Sustainable Energy: ${capitalize(d.sustainableEnergy)}<br/>
      WC CO₂ per Visit: ${d.wcCO2PerVisit}<br/>
      Monthly Traffic (K): ${formatNumber(d.monthlyTrafficK)}<br/>
      Total Yearly Emissions (tonnes CO₂): ${formatNumber(Math.round(d.totalEmissions))}<br/>
    `;
  }

  function addLegend(containerSelector, colorScale) {
    const grades = colorScale.domain();
    const legendContainer = d3.select(containerSelector)
      .append('div')
      .attr('class', 'legend-container')
      .style('display', 'flex')
      .style('justify-content', 'center')
      .style('margin-top', '20px');

    grades.forEach(grade => {
      const legendItem = legendContainer.append('div')
        .attr('class', 'legend-item')
        .style('margin-right', '15px');

      legendItem.append('div')
        .attr('class', 'legend-color-box')
        .style('background-color', colorScale(grade))
        .style('border', '1px solid #ffffff');

      legendItem.append('div')
        .attr('class', 'legend-label')
        .text(`Grade ${grade}`);
    });
  }

  function getCaptionText(data) {
    const numCompanies = data.length;
    const totalEmissions = data.reduce((sum, d) => sum + d.totalEmissions, 0);
    const formattedTotalEmissions = d3.format(',')(Math.round(totalEmissions));
    return `Over a year, the websites of these ${numCompanies} companies emitted ${formattedTotalEmissions} tonnes of CO₂.`;
  }

  // Add controls
  function addControls(containerSelector, data, updateChart) {
    // Create a control-block container, initially hidden
    const controlBlock = d3.select(containerSelector)
      .append('div')
      .attr('class', 'control-block')
      .style('display', 'none') // Initially hidden
      .style('max-width', '600px') // Adjust width as needed
      .style('margin', '0 auto'); // Center the control-block

    const controlContainer = controlBlock
      .append('div')
      .attr('class', 'control-container');

    // Filter state
    const filters = {
      searchQuery: '',
      rankMin: null,
      rankMax: null,
      numberOfEmployeesMin: null,
      numberOfEmployeesMax: null,
      wcCO2PerVisitMin: null,
      wcCO2PerVisitMax: null,
      monthlyTrafficKMin: null,
      monthlyTrafficKMax: null,
      totalEmissionsMin: null,
      totalEmissionsMax: null,
      sectors: [],
      companyType: null,
      wcGrades: [],
      profitableRaw: null,
      founderIsCEORaw: null,
      femaleCEORaw: null,
      worldsMostAdmiredCompaniesRaw: null,
      bestCompaniesToWorkForRaw: null,
      sustainableEnergy: null,
    };

    // Implementing Controls

    // 1. Search Bar
    const searchContainer = controlContainer.append('div').attr('class', 'search-container');
    searchContainer.append('label')
      .attr('for', 'search-input')
      .text('Search: ');
    searchContainer.append('input')
      .attr('type', 'text')
      .attr('class', 'search-input')
      .attr('id', 'search-input')
      .attr('placeholder', 'Enter a company name, ticker, or CEO...')
      .on('input', function () {
        filters.searchQuery = this.value.toLowerCase();
        applyFilters();
      });

    // 2. Min/Max Sliders
    addMinMaxSlider(controlContainer, 'Rank', 'rank', data, filters, applyFilters, 1);
    addMinMaxSlider(controlContainer, 'Number of Employees', 'numberOfEmployees', data, filters, applyFilters, 100);
    addMinMaxSlider(controlContainer, 'WC CO₂ per Visit', 'wcCO2PerVisit', data, filters, applyFilters, 0.01);
    addMinMaxSlider(controlContainer, 'Monthly Traffic (K)', 'monthlyTrafficK', data, filters, applyFilters, 10);
    addMinMaxSlider(controlContainer, 'Total Yearly Emissions', 'totalEmissions', data, filters, applyFilters, 1);

    // 3. Sector Checkboxes
    addSectorCheckboxes(controlContainer, 'Sector', 'sector', data, filters, applyFilters);

    // 4. Radio Buttons for Company Type
    addRadioButtons(controlContainer, 'Company Type', 'companyType', data, filters, applyFilters);

    // 5. Checkboxes for WC Grade
    addCheckboxGroup(controlContainer, 'WC Grade', 'wcGrade', data, filters, applyFilters);

    // 6. Radio Buttons
    addRadioButtons(controlContainer, 'Profitable', 'profitableRaw', data, filters, applyFilters);
    addRadioButtons(controlContainer, 'Founder is CEO', 'founderIsCEORaw', data, filters, applyFilters);
    addRadioButtons(controlContainer, 'Female CEO', 'femaleCEORaw', data, filters, applyFilters);
    addRadioButtons(controlContainer, "World's Most Admired Companies", 'worldsMostAdmiredCompaniesRaw', data, filters, applyFilters);
    addRadioButtons(controlContainer, 'Best Companies to Work For', 'bestCompaniesToWorkForRaw', data, filters, applyFilters);
    addRadioButtons(controlContainer, 'Sustainable Energy', 'sustainableEnergy', data, filters, applyFilters);

    // Initialize filters with all values for checkboxes
    initializeFilters();

    // By default, check all checkboxes
    controlContainer.selectAll('.checkbox-group input[type="checkbox"]').property('checked', true);
    controlContainer.selectAll('.sector-checkboxes input[type="checkbox"]').property('checked', true);
    // Select 'All' for radio buttons
    controlContainer.selectAll('.radio-group input[value=""]').property('checked', true);

    // Apply filters on initial load
    applyFilters();

    // Reset Button
    controlContainer.append('div')
    .attr('class', 'reset-button-container')
    .append('button')
    .attr('class', 'reset-button')
    .text('Reset Filters')
    .on('click', function () {
      // Reset filters
      resetFilters();
      // Reset inputs
      controlContainer.selectAll('input').property('value', '');
      controlContainer.selectAll('input[type="checkbox"]').property('checked', true);
      controlContainer.selectAll('input[type="radio"]').property('checked', false);
      // By default, check all checkboxes
      controlContainer.selectAll('.checkbox-group input[type="checkbox"]').property('checked', true);
      controlContainer.selectAll('.sector-checkboxes input[type="checkbox"]').property('checked', true);
      // Select 'All' for radio buttons
      controlContainer.selectAll('.radio-group input[value=""]').property('checked', true);
      // Update slider labels and positions
      controlContainer.selectAll('.slider-container').each(function () {
        const sliderContainer = d3.select(this);
        const dataKey = sliderContainer.attr('data-key');
        const values = data.map(d => +d[dataKey]).filter(v => v !== null && !isNaN(v));
        const min = Math.min(...values);
        const max = Math.max(...values);
        sliderContainer.select(`.${dataKey}-min-slider`).property('value', min);
        sliderContainer.select(`.${dataKey}-max-slider`).property('value', max);
        sliderContainer.select('.min-value').text(`Min: ${min}`);
        sliderContainer.select('.max-value').text(`Max: ${max}`);
        // Reset filters for sliders
        filters[`${dataKey}Min`] = min;
        filters[`${dataKey}Max`] = max;
      });
      // Re-initialize filters
      initializeFilters();
      // Apply filters
      applyFilters();
    });


    // Apply filters and update chart
    function applyFilters() {
      let filteredData = data;

      // Search Filter
      if (filters.searchQuery) {
        filteredData = filteredData.filter(d =>
          (d.company && d.company.toLowerCase().includes(filters.searchQuery)) ||
          (d.ticker && d.ticker.toLowerCase().includes(filters.searchQuery)) ||
          (d.ceo && d.ceo.toLowerCase().includes(filters.searchQuery))
        );
      }

      // Min/Max Filters
      filteredData = filteredData.filter(d => {
        return (
          (filters.rankMin === null || d.rank >= filters.rankMin) &&
          (filters.rankMax === null || d.rank <= filters.rankMax) &&
          (filters.numberOfEmployeesMin === null || d.numberOfEmployees >= filters.numberOfEmployeesMin) &&
          (filters.numberOfEmployeesMax === null || d.numberOfEmployees <= filters.numberOfEmployeesMax) &&
          (filters.wcCO2PerVisitMin === null || d.wcCO2PerVisit >= filters.wcCO2PerVisitMin) &&
          (filters.wcCO2PerVisitMax === null || d.wcCO2PerVisit <= filters.wcCO2PerVisitMax) &&
          (filters.monthlyTrafficKMin === null || d.monthlyTrafficK >= filters.monthlyTrafficKMin) &&
          (filters.monthlyTrafficKMax === null || d.monthlyTrafficK <= filters.monthlyTrafficKMax) &&
          (filters.totalEmissionsMin === null || d.totalEmissions >= filters.totalEmissionsMin) &&
          (filters.totalEmissionsMax === null || d.totalEmissions <= filters.totalEmissionsMax)
        );
      });

      // Checkbox Filters
      filteredData = filteredData.filter(d => {
        return (
          (filters.sectors.length === 0 || filters.sectors.includes(d.sector)) &&
          (filters.wcGrades.length === 0 || filters.wcGrades.includes(d.wcGrade))
        );
      });

      // Company Type Radio Button
      if (filters.companyType) {
        filteredData = filteredData.filter(d => d.companyType === filters.companyType);
      }

      // Radio Button Filters
      filteredData = filteredData.filter(d => {
        return (
          (filters.profitableRaw === null || d.profitableRaw === filters.profitableRaw) &&
          (filters.founderIsCEORaw === null || d.founderIsCEORaw === filters.founderIsCEORaw) &&
          (filters.femaleCEORaw === null || d.femaleCEORaw === filters.femaleCEORaw) &&
          (filters.worldsMostAdmiredCompaniesRaw === null || d.worldsMostAdmiredCompaniesRaw === filters.worldsMostAdmiredCompaniesRaw) &&
          (filters.bestCompaniesToWorkForRaw === null || d.bestCompaniesToWorkForRaw === filters.bestCompaniesToWorkForRaw) &&
          (filters.sustainableEnergy === null || d.sustainableEnergy === filters.sustainableEnergy)
        );
      });

      updateChart(filteredData);
    }

    // Initialize filters with all values for checkboxes
    function initializeFilters() {
      filters.sectors = Array.from(new Set(data.map(d => d.sector)));
      filters.wcGrades = Array.from(new Set(data.map(d => d.wcGrade)));
    }

    // Reset filters to default values
    function resetFilters() {
      filters.searchQuery = '';
      filters.rankMin = null;
      filters.rankMax = null;
      filters.numberOfEmployeesMin = null;
      filters.numberOfEmployeesMax = null;
      filters.wcCO2PerVisitMin = null;
      filters.wcCO2PerVisitMax = null;
      filters.monthlyTrafficKMin = null;
      filters.monthlyTrafficKMax = null;
      filters.totalEmissionsMin = null;
      filters.totalEmissionsMax = null;
      filters.companyType = null;
      filters.profitableRaw = null;
      filters.founderIsCEORaw = null;
      filters.femaleCEORaw = null;
      filters.worldsMostAdmiredCompaniesRaw = null;
      filters.bestCompaniesToWorkForRaw = null;
      filters.sustainableEnergy = null;
      initializeFilters();
    }
  }

  // Helper functions for controls
  function addMinMaxSlider(container, labelText, dataKey, data, filters, applyFilters, step) {
    const values = data.map(d => +d[dataKey]).filter(v => v !== null && !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);

    const sliderContainer = container.append('div').attr('class', 'slider-container')
      .attr('data-key', dataKey); // Store dataKey for reset

    // Initialize filters for sliders
    filters[`${dataKey}Min`] = min;
    filters[`${dataKey}Max`] = max;

    // Label above the sliders
    sliderContainer.append('label').text(`${labelText}: `);

    // Create a container for the dual-range slider
    const dualSlider = sliderContainer.append('div').attr('class', 'dual-slider');

    // Min slider
    dualSlider.append('input')
      .attr('type', 'range')
      .attr('class', `${dataKey}-min-slider slider-input`)
      .attr('min', min)
      .attr('max', max)
      .attr('value', min)
      .attr('step', step)
      .on('input', function () {
        filters[`${dataKey}Min`] = +this.value;
        minOutput.text(`Min: ${this.value}`);
        applyFilters();
      });

    // Max slider
    dualSlider.append('input')
      .attr('type', 'range')
      .attr('class', `${dataKey}-max-slider slider-input`)
      .attr('min', min)
      .attr('max', max)
      .attr('value', max)
      .attr('step', step)
      .on('input', function () {
        filters[`${dataKey}Max`] = +this.value;
        maxOutput.text(`Max: ${this.value}`);
        applyFilters();
      });

    // Display current values
    const valuesContainer = sliderContainer.append('div').attr('class', 'slider-values');
    const minOutput = valuesContainer.append('span').attr('class', 'slider-value min-value').text(`Min: ${min}`);
    const maxOutput = valuesContainer.append('span').attr('class', 'slider-value max-value').text(`Max: ${max}`);
  }

  function addCheckboxGroup(container, labelText, dataKey, data, filters, applyFilters) {
    const values = Array.from(new Set(data.map(d => d[dataKey]))).sort();
    const groupContainer = container.append('div').attr('class', 'checkbox-group');

    // Label above the checkboxes
    groupContainer.append('label').text(`${labelText}: `);

    const optionsContainer = groupContainer.append('div').attr('class', 'options-container');

    values.forEach(value => {
      const id = `${dataKey}-${value}`;
      const checkboxLabel = optionsContainer.append('label').attr('for', id);
      checkboxLabel.append('input')
        .attr('type', 'checkbox')
        .attr('id', id)
        .attr('value', value)
        .property('checked', true) // Check all by default
        .on('change', function () {
          if (this.checked) {
            filters[`${dataKey}s`].push(this.value);
          } else {
            filters[`${dataKey}s`] = filters[`${dataKey}s`].filter(v => v !== this.value);
          }
          applyFilters();
        });
      checkboxLabel.append('span').text(value);
    });
  }

  function addSectorCheckboxes(container, labelText, dataKey, data, filters, applyFilters) {
    const values = Array.from(new Set(data.map(d => d[dataKey]))).sort();
    const numColumns = 3;
  
    const groupContainer = container.append('div').attr('class', 'sector-checkboxes');
  
    // Label above the checkboxes
    groupContainer.append('label').text(`${labelText}: `);
  
    // Create a wrapper for the columns
    const columnsWrapper = groupContainer.append('div').attr('class', 'columns-wrapper');
  
    // Create columns
    for (let i = 0; i < numColumns; i++) {
      columnsWrapper.append('div').attr('class', 'checkbox-column');
    }
  
    // Distribute checkboxes into columns
    values.forEach((value, index) => {
      const columnIndex = index % numColumns;
      const column = columnsWrapper.selectAll('.checkbox-column').nodes()[columnIndex];
      const columnSelection = d3.select(column);
  
      const id = `${dataKey}-${value}`;
      const checkboxLabel = columnSelection.append('label').attr('for', id);
      checkboxLabel.append('input')
        .attr('type', 'checkbox')
        .attr('id', id)
        .attr('value', value)
        .property('checked', true)
        .on('change', function () {
          if (this.checked) {
            filters[`${dataKey}s`].push(this.value);
          } else {
            filters[`${dataKey}s`]= filters[`${dataKey}s`].filter(v => v !== this.value);
          }
          applyFilters();
        });
      checkboxLabel.append('span').text(value);
    });
  }

  function addRadioButtons(container, labelText, dataKey, data, filters, applyFilters) {
    const values = Array.from(new Set(data.map(d => d[dataKey]))).filter(v => v !== '').sort();
    const groupContainer = container.append('div').attr('class', 'radio-group');

    // Label above the radio buttons
    groupContainer.append('label').text(`${labelText}: `);

    const optionsContainer = groupContainer.append('div').attr('class', 'options-container');

    // Add option to clear selection (All)
    const clearId = `${dataKey}-all`;
    const clearLabel = optionsContainer.append('label').attr('for', clearId);
    clearLabel.append('input')
      .attr('type', 'radio')
      .attr('name', dataKey)
      .attr('id', clearId)
      .attr('value', '')
      .property('checked', true) // Select 'All' by default
      .on('change', function () {
        filters[dataKey] = null;
        applyFilters();
      });
    clearLabel.append('span').text('All');

    values.forEach(value => {
      const id = `${dataKey}-${value}`;
      const radioLabel = optionsContainer.append('label').attr('for', id);
      radioLabel.append('input')
        .attr('type', 'radio')
        .attr('name', dataKey)
        .attr('id', id)
        .attr('value', value)
        .on('change', function () {
          filters[dataKey] = this.value;
          applyFilters();
        });
      radioLabel.append('span').text(value);
    });
  }

  // Update chart function remains the same
  function updateChart(filteredData) {
    // If no data, display a message
    if (filteredData.length === 0) {
      svg.selectAll('*').remove();
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '24px')
        .text('No companies match the selected filters.');
      // Update title
      title.text('No companies match the selected filters.');
      return;
    }

    // Update title
    title.text(getTitleText(filteredData));

    // Clear existing chart
    svg.selectAll('*').remove();

    // Rebuild hierarchy
    const hierarchyData = buildHierarchy(filteredData);
    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.totalEmissions)
      .sort((a, b) => b.value - a.value);

    // Recompute treemap layout
    treemapLayout(root);

    // Update nodes
    let nodesGroup = svg.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Draw rectangles for leaf nodes (companies)
    nodesGroup.filter(d => d.depth === 3)
      .append('rect')
      .attr('id', d => d.data.name)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale(d.data.data.wcGrade))
      .attr('stroke', '#414042') // Updated border color
      .attr('stroke-width', 1)
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip);

    // Add company names
    nodesGroup.filter(d => d.depth === 3)
      .append('text')
      .attr('class', 'company-name')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(d => {
        const boxWidth = d.x1 - d.x0;
        const boxHeight = d.y1 - d.y0;
        const textWidth = getTextWidth(d.data.name, '12px sans-serif');
        const textHeight = 12;
        if (boxWidth > textWidth && boxHeight > textHeight) {
          return d.data.name;
        } else {
          return '';
        }
      });

    // Ensure labels don't capture pointer events
    svg.selectAll('text')
      .style('pointer-events', 'none');
  }
}