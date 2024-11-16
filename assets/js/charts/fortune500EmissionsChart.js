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
  d3.select(containerSelector)
    .insert('h2', ':first-child')
    .attr('class', 'chart-title')
    .text('Annual CO₂ Emissions From The Websites of The Fortune 500 Companies');

  // Add dynamic caption
  const caption = d3.select(containerSelector)
    .insert('p', 'svg')
    .attr('class', 'chart-caption')
    .text(getCaptionText(data));

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
    .attr('stroke', '#ffffff')
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

  // Add labels for industry nodes (depth 2)
  nodesGroup.filter(d => d.depth === 2)
    .append('text')
    .attr('class', 'industry-label')
    .attr('x', d => (d.x1 - d.x0) / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '16px')
    .text(d => {
      const boxWidth = d.x1 - d.x0;
      const boxHeight = d.y1 - d.y0;
      const textWidth = getTextWidth(d.data.name, '16px sans-serif');
      if (boxWidth > textWidth && boxHeight > 20) {
        return d.data.name;
      } else {
        return '';
      }
    });

  // Add labels for sector nodes (depth 1)
  nodesGroup.filter(d => d.depth === 1)
    .append('text')
    .attr('class', 'sector-label')
    .attr('x', d => (d.x1 - d.x0) / 2)
    .attr('y', 40)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', '20px')
    .attr('font-weight', 'bold')
    .text(d => {
      const boxWidth = d.x1 - d.x0;
      const boxHeight = d.y1 - d.y0;
      const textWidth = getTextWidth(d.data.name, '20px sans-serif');
      if (boxWidth > textWidth && boxHeight > 40) {
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

  // Add toggle message and button below the legend
  d3.select(containerSelector)
    .append('p')
    .attr('class', 'toggle-message')
    .style('text-align', 'center') // Center the message
    .text('If you would like to interact with this chart, please click on the "Show Filters" button below.');

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

  function getTooltipContent(d) {
    if (!d) return '';
    return `
      <strong>${d.company}</strong><br/>
      <ul>
        <li>Rank: ${d.rank}</li>
        <li>Ticker: ${d.ticker}</li>
        <li>Sector: ${d.sector}</li>
        <li>Industry: ${d.industry}</li>
        <li>Profitable: ${d.profitableRaw}</li>
        <li>CEO: ${d.ceo}</li>
        <li>Founder is CEO: ${d.founderIsCEORaw}</li>
        <li>Female CEO: ${d.femaleCEORaw}</li>
        <li>Company Type: ${d.companyType}</li>
        <li>World's Most Admired Companies: ${d.worldsMostAdmiredCompaniesRaw}</li>
        <li>Best Companies to Work For: ${d.bestCompaniesToWorkForRaw}</li>
        <li>Number of Employees: ${d.numberOfEmployees}</li>
        <li>Website: <a href="${d.website}" target="_blank">${d.website}</a></li>
        <li>WC Grade: ${d.wcGrade}</li>
        <li>Sustainable Energy: ${d.sustainableEnergy}</li>
        <li>WC CO₂ per Visit: ${d.wcCO2PerVisit}</li>
        <li>Monthly Traffic (K): ${d.monthlyTrafficK}</li>
        <li>Total Yearly Emissions (tonnes CO₂): ${d3.format(',')(Math.round(d.totalEmissions))}</li>
      </ul>
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
      industries: [],
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
      .on('input', function () {
        filters.searchQuery = this.value.toLowerCase();
        applyFilters();
      });

    // 2. Min/Max Sliders
    addMinMaxSlider(controlContainer, 'Rank', 'rank', data, filters, applyFilters, 1);
    addMinMaxSlider(controlContainer, 'Number of Employees', 'numberOfEmployees', data, filters, applyFilters, 100);
    addMinMaxSlider(controlContainer, 'WC CO₂ per Visit', 'wcCO2PerVisit', data, filters, applyFilters, 1);
    addMinMaxSlider(controlContainer, 'Monthly Traffic (K)', 'monthlyTrafficK', data, filters, applyFilters, 1000);
    addMinMaxSlider(controlContainer, 'Total Yearly Emissions', 'totalEmissions', data, filters, applyFilters, 1000);

    // 3. Checkboxes with Dropdown (Sectors and Industries)
    addCheckboxDropdown(controlContainer, 'Sector', 'sector', data, filters, applyFilters);
    addCheckboxDropdown(controlContainer, 'Industry', 'industry', data, filters, applyFilters);

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

    // Reset Button
    controlContainer.append('div')
      .attr('class', 'reset-button-container')
      .style('text-align', 'center') // Center the reset button
      .append('button')
      .attr('class', 'reset-button')
      .text('Reset')
      .on('click', function () {
        // Reset filters
        resetFilters();
        // Reset inputs
        controlContainer.selectAll('input').property('value', '');
        controlContainer.selectAll('input[type="checkbox"]').property('checked', true);
        controlContainer.selectAll('input[type="radio"]').property('checked', false);
        // By default, check all checkboxes
        controlContainer.selectAll('.checkbox-group input[type="checkbox"]').property('checked', true);
        controlContainer.selectAll('.checkbox-dropdown input[type="checkbox"]').property('checked', true);
        // Select 'All' for radio buttons
        controlContainer.selectAll('.radio-group input[value=""]').property('checked', true);
        // Apply filters
        applyFilters();
      });

    // By default, check all checkboxes
    controlContainer.selectAll('.checkbox-group input[type="checkbox"]').property('checked', true);
    controlContainer.selectAll('.checkbox-dropdown input[type="checkbox"]').property('checked', true);
    // Select 'All' for radio buttons
    controlContainer.selectAll('.radio-group input[value=""]').property('checked', true);

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
          (filters.industries.length === 0 || filters.industries.includes(d.industry)) &&
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
      filters.industries = Array.from(new Set(data.map(d => d.industry)));
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

    const sliderContainer = container.append('div').attr('class', 'slider-container');

    // Label above the sliders
    sliderContainer.append('label').text(`${labelText}: `);

    // Create a container for the dual-range slider
    const dualSlider = sliderContainer.append('div').attr('class', 'dual-slider');

    // Min slider
    dualSlider.append('input')
      .attr('type', 'range')
      .attr('class', `${dataKey}-min-slider`)
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
      .attr('class', `${dataKey}-max-slider`)
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

  function addCheckboxDropdown(container, labelText, dataKey, data, filters, applyFilters) {
    const values = Array.from(new Set(data.map(d => d[dataKey]))).sort();

    const dropdownContainer = container.append('div').attr('class', 'checkbox-dropdown');

    // Use details/summary for the dropdown effect
    const details = dropdownContainer.append('details');

    details.append('summary').text(`${labelText}`);

    const checkboxList = details.append('div').attr('class', 'checkbox-list');

    values.forEach(value => {
      const id = `${dataKey}-${value}`;
      const checkboxLabel = checkboxList.append('label').attr('for', id);
      checkboxLabel.append('input')
        .attr('type', 'checkbox')
        .attr('id', id)
        .attr('value', value)
        .property('checked', true) // Check all by default
        .on('change', function () {
          if (this.checked) {
            filters[`${dataKey}s`].push(this.value);
          } else {
            filters[`${dataKey}s`].splice(filters[`${dataKey}s`].indexOf(this.value), 1);
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

  // Update chart function
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
      // Update caption
      caption.text('No companies match the selected filters.');
      return;
    }

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
      .attr('stroke', '#ffffff')
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

    // Add labels for industry nodes (depth 2)
    nodesGroup.filter(d => d.depth === 2)
      .append('text')
      .attr('class', 'industry-label')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '16px')
      .text(d => {
        const boxWidth = d.x1 - d.x0;
        const boxHeight = d.y1 - d.y0;
        const textWidth = getTextWidth(d.data.name, '16px sans-serif');
        if (boxWidth > textWidth && boxHeight > 20) {
          return d.data.name;
        } else {
          return '';
        }
      });

    // Add labels for sector nodes (depth 1)
    nodesGroup.filter(d => d.depth === 1)
      .append('text')
      .attr('class', 'sector-label')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text(d => {
        const boxWidth = d.x1 - d.x0;
        const boxHeight = d.y1 - d.y0;
        const textWidth = getTextWidth(d.data.name, '20px sans-serif');
        if (boxWidth > textWidth && boxHeight > 40) {
          return d.data.name;
        } else {
          return '';
        }
      });

    // Ensure labels don't capture pointer events
    svg.selectAll('text')
      .style('pointer-events', 'none');

    // Update caption
    caption.text(getCaptionText(filteredData));
  }
}