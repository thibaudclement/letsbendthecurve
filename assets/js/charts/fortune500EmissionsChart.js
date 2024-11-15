export function drawFortune500EmissionsChart(containerSelector, data) {
  // Get the container's width for responsive design
  const containerWidth = d3.select(containerSelector).node().getBoundingClientRect().width;

  // Set up dimensions and margins
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const width = containerWidth - margin.left - margin.right;
  const height = 750 - margin.top - margin.bottom;

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
    .paddingInner(2) // Adjust padding between nodes
    .round(true)
    (root);

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
  const nodes = svg.selectAll('g')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);

  // Draw rectangles for leaf nodes (companies)
  nodes.filter(d => d.depth === 3)
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
  nodes.filter(d => d.depth === 3)
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
  nodes.filter(d => d.depth === 2)
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
  nodes.filter(d => d.depth === 1)
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

  // Call the legend function
  addLegend(containerSelector, colorScale);
}