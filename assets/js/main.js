import { loadDigitalTasks, loadNonDigitalTasks, loadDrivingDistances, loadInternetUsageData } from './data/dataLoader.js';
import { drawEmissionsChart } from './charts/emissionsChart.js';
import { displayEquivalentsInList } from './charts/equivalents.js';
import { initializeUserInput } from './charts/userInput.js';
import { calculateEmissions } from './utils/calculations.js';
import { drawInternetUsersChart } from './charts/internetUsersChart.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Load data
  const digitalTasks = await loadDigitalTasks();
  const nonDigitalTasks = await loadNonDigitalTasks();
  const drivingDistances = await loadDrivingDistances();
  const internetUsageData = await loadInternetUsageData();

  if (!digitalTasks.length || !nonDigitalTasks.length || !drivingDistances.length || !internetUsageData.length) {
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

  document.getElementById('author-weekly-emissions').textContent = authorEmissions.totalEmissions.toFixed(0);

  // Draw author's weekly emissions chart
  drawEmissionsChart('#weekly-emissions-author', authorEmissions.taskEmissions, null, 'One week worth of emissions from a sample of my own digital tasks');

  // Calculate and display author's yearly equivalents
  const authorYearlyEmissions = authorEmissions.totalEmissions * 52;
  document.getElementById('author-yearly-emissions').textContent = (authorYearlyEmissions / 1000).toFixed(0); // Convert to kg

  // Display equivalents in list
  displayEquivalentsInList('#author-equivalents-list', authorYearlyEmissions, nonDigitalTasks, drivingDistances);

  // Initialize user input section
  initializeUserInput(digitalTasks, nonDigitalTasks, drivingDistances);

  // Draw Internet Users Chart
  drawInternetUsersChart('#internet-users', internetUsageData);
});