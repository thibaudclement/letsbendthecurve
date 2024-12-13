import { 
  loadDigitalTasks,
  loadNonDigitalTasks,
  loadDrivingDistances,
  loadInternetUsageData,
  loadElectricityConsumptionData,
  loadIctEmissionsData,
  loadIctEmissionsBreakdownData,
  loadIctEmissionCategoriesData,
  loadPueData,
  loadFortune500EmissionsData,
  loadCountryData
} from './data/dataLoader.js';
import { drawEmissionsChart } from './charts/emissionsChart.js';
import { displayEquivalentsInList } from './charts/equivalents.js';
import { initializeUserInput } from './charts/userInput.js';
import { calculateEmissions } from './utils/calculations.js';
import { drawInternetUsersChart } from './charts/internetUsersChart.js';
import { drawInternetTrafficChart } from './charts/internetTrafficChart.js';
import { drawElectricityConsumptionChart } from './charts/electricityConsumptionChart.js';
import { drawIctEmissionsCharts } from './charts/ictEmissionsChart.js';
import { drawIctEmissionsBreakdownChart } from './charts/ictEmissionsBreakdownChart.js';
import { drawIctEmissionCategoriesBreakdownCharts } from './charts/ictEmissionCategoriesBreakdownChart.js';
import { drawPueChart } from './charts/pueChart.js';
import { drawEnergyConsumptionChart } from './charts/energyConsumptionChart.js';
import { drawFortune500EmissionsChart } from './charts/fortune500EmissionsChart.js';
import { drawDigitalProsperityChart } from './charts/digitalProsperityChart.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Load data
  const digitalTasks = await loadDigitalTasks();
  const nonDigitalTasks = await loadNonDigitalTasks();
  const drivingDistances = await loadDrivingDistances();
  const internetUsageData = await loadInternetUsageData();
  const electricityConsumptionData = await loadElectricityConsumptionData();
  const ictEmissionsData = await loadIctEmissionsData();
  const ictEmissionsBreakdownData = await loadIctEmissionsBreakdownData();
  const ictEmissionCategoriesData = await loadIctEmissionCategoriesData();
  const pueData = await loadPueData();
  const fortune500EmissionsData = await loadFortune500EmissionsData();
  const countryData = await loadCountryData();

  if (
    !digitalTasks.length ||
    !nonDigitalTasks.length ||
    !drivingDistances.length ||
    !internetUsageData.length ||
    !electricityConsumptionData.length ||
    !ictEmissionsData.length ||
    !ictEmissionsBreakdownData.length ||
    !ictEmissionCategoriesData.length ||
    !pueData.length ||
    !fortune500EmissionsData.length ||
    !countryData.length
  ) {
    console.error('Failed to load necessary data.');
    return;
  }

  // Prepare author's data from CSV
  const authorUsage = {};
  digitalTasks.forEach(task => {
    authorUsage[task.task] = task.thibaud_weekly_tasks;
  });

  // Update text data-points
  document.getElementById('author-streaming-hours').textContent = authorUsage['streaming'];
  document.getElementById('author-ai-queries').textContent = authorUsage['generative ai'];
  document.getElementById('author-search-requests').textContent = authorUsage['search'];
  document.getElementById('author-emails-sent').textContent = authorUsage['email'];
  document.getElementById('author-messages-sent').textContent = authorUsage['messaging'];

  // Calculate author's emissions
  const authorEmissions = calculateEmissions(digitalTasks, authorUsage);

  document.getElementById('author-weekly-emissions').textContent = authorEmissions.totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 0 });

  // Draw author's weekly emissions chart
  drawEmissionsChart('#weekly-emissions-author', authorEmissions.taskEmissions, null, 'One Week Worth of Emissions from a Sample of My Digital Activity');

  // Calculate and display author's yearly equivalents
  const authorYearlyEmissions = authorEmissions.totalEmissions * 52;
  document.getElementById('author-yearly-emissions').textContent = (authorYearlyEmissions / 1000).toFixed(0);

  // Display equivalents in list
  displayEquivalentsInList('#author-equivalents-list', authorYearlyEmissions, nonDigitalTasks, drivingDistances);

  // Initialize user input section
  initializeUserInput(digitalTasks, nonDigitalTasks, drivingDistances);

  // Draw Internet Users Chart
  drawInternetUsersChart('#internet-users', internetUsageData);

  // Draw Internet Traffic Chart
  drawInternetTrafficChart('#internet-traffic', internetUsageData);

  // Draw Electricity Consumption Chart
  drawElectricityConsumptionChart('#electricity-consumption-chart', electricityConsumptionData);

  // Draw ICT Emissions Charts
  drawIctEmissionsCharts('#ict-emissions-chart1', '#ict-emissions-chart2', '#ict-emissions-legend', ictEmissionsData);
  
  // Draw ICT Emissions Breakdown Pie Chart
  drawIctEmissionsBreakdownChart('#ict-emissions-breakdown', ictEmissionsBreakdownData);

  // Draw ICT Emission Categories Breakdown Charts
  drawIctEmissionCategoriesBreakdownCharts('#sustainable-web-design-model', ictEmissionCategoriesData);

  // Draw Energy Consumption Chart first to get the update function
  const updateEnergyConsumptionChart = drawEnergyConsumptionChart('#energy-consumption-chart', pueData);

  // Draw PUE Chart, passing the update function
  drawPueChart('#pue-chart', pueData, updateEnergyConsumptionChart);

  // Draw Fortune 500 Emissions Chart
  drawFortune500EmissionsChart('#fortune500-emissions-chart', fortune500EmissionsData);

  // Draw the Digital Prosperity Chart
  drawDigitalProsperityChart('#digital-prosperity', countryData);
});