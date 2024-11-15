export function drawFortune500EmissionsChart(containerSelector, data) {
  // Set up dimensions and margins
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

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
  d3.treemap()
    .size([width, height])
    .padding(1)
    .round(true)
    (root);

  // Create SVG container
  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('margin-top', '10px')
    .style('margin-bottom', '10px')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Add title
  d3.select(containerSelector)
    .insert('h2', ':first-child')
    .attr('class', 'chart-title')
    .text('Annual CO2 Emissions From The Websites of Fortune 500 Companies');

  // Add dynamic caption
  const caption = d3.select(containerSelector)
    .insert('p', 'svg')
    .attr('class', 'chart-caption')
    .text(getCaptionText(data));

  // Create a group for each node
  const cell = svg.selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);

  // Draw rectangles
  cell.append('rect')
    .attr('id', d => d.data.name)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', d => colorScale(d.data.data.wcGrade))
    .attr('stroke', '#ffffff') // Add this line
    .attr('stroke-width', 1)   // Add this line
    .on('mouseover', showTooltip)
    .on('mouseout', hideTooltip);

  // Add company names
  cell.append('text')
    .attr('class', 'company-name')
    .attr('x', d => (d.x1 - d.x0) / 2)
    .attr('y', d => (d.y1 - d.y0) / 2)
    .attr('text-anchor', 'middle')
    .text(d => {
      const boxWidth = d.x1 - d.x0;
      const boxHeight = d.y1 - d.y0;
      const textWidth = getTextWidth(d.data.name, '12px sans-serif');
      const textHeight = 12; // Approximate text height
      if (boxWidth > textWidth && boxHeight > textHeight) {
        return d.data.name;
      } else {
        return '';
      }
    });

  // Add color scale legend
  addLegend(containerSelector, colorScale);

  // Tooltip
  const tooltip = d3.select(containerSelector)
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

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

  // Helper functions
  function buildHierarchy(data) {
    const root = { name: "root", children: [] };
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
        <li>Country: ${d.country}</li>
        <li>Website: <a href="${d.website}" target="_blank">${d.website}</a></li>
        <li>WC Grade: ${d.wcGrade}</li>
        <li>Sustainable Energy: ${d.sustainableEnergy}</li>
        <li>WC CO2 per Visit: ${d.wcCO2PerVisit}</li>
        <li>Monthly Traffic (K): ${d.monthlyTrafficK}</li>
        <li>Total Yearly Emissions (tonnes CO2): ${d.totalEmissions.toFixed(2)}</li>
      </ul>
    `;
  }

  function addLegend(containerSelector, colorScale) {
    const grades = colorScale.domain();
    const legendContainer = d3.select(containerSelector)
      .append('div')
      .attr('class', 'legend-container')
      .style('display', 'flex')
      .style('justify-content', 'center') // Center the legend
      .style('margin-top', '20px');       // Add vertical space above the legend
  
    grades.forEach(grade => {
      const legendItem = legendContainer.append('div')
        .attr('class', 'legend-item')
        .style('margin-right', '15px'); // Add spacing between legend items
  
      legendItem.append('div')
        .attr('class', 'legend-color-box')
        .style('background-color', colorScale(grade));
  
      legendItem.append('div')
        .attr('class', 'legend-label')
        .text(`Grade ${grade}`);
    });
  }
  

  function getCaptionText(data) {
    const numCompanies = data.length;
    const totalEmissions = data.reduce((sum, d) => sum + d.totalEmissions, 0);
    const formattedTotalEmissions = d3.format(',')(Math.round(totalEmissions));
    return `Over a year, the websites of these ${numCompanies} companies emit ${formattedTotalEmissions} tonnes of CO₂.`;
  }
}