import { calculateEmissions } from '../utils/calculations.js';
import { drawEmissionsChart } from './emissionsChart.js';
import { displayEquivalentsInList } from './equivalents.js';

export function initializeUserInput(digitalTasks, nonDigitalTasks, drivingDistances) {
  const container = d3.select('#user-input-section');
  container.html(''); // Clear previous content

  const usage = {};
  digitalTasks.forEach(task => {
    usage[task.task] = task.us_weekly_tasks;
  });

  const form = container.append('div').attr('class', 'sliders-container');

  // Add title or guidance text
  form.append('h3')
    .attr('class', 'sliders-title')
    .text('Your digital activity from last week:');

  // Create sliders
  digitalTasks.forEach(task => {
    const sliderContainer = form.append('div')
      .attr('class', 'slider-container');

    // Display category name and value
    const labelContainer = sliderContainer.append('label')
      .attr('for', `slider-${task.task}`)
      .attr('class', 'slider-label');

      labelContainer.html(`${task.originalTask}:<span class="slider-value">${usage[task.task]}</span>${task.unit.toLowerCase()}`);

    const sliderInput = sliderContainer.append('input')
      .attr('type', 'range')
      .attr('min', 0)
      .attr('max', task.task === 'streaming' ? 168 : 1000)
      .attr('step', 1)
      .attr('value', usage[task.task])
      .attr('id', `slider-${task.task}`)
      .attr('class', 'slider-input');

    // Update usage and emissions on input
    sliderInput.on('input', function () {
      usage[task.task] = +this.value;
      labelContainer.select('.slider-value').text(`${this.value}`);
      updateSliderBackground(this);
      updateEmissions();
    });

    // Initialize slider background
    updateSliderBackground(sliderInput.node());
  });

  // Function to update slider background fill
  function updateSliderBackground(slider) {
    const min = slider.min;
    const max = slider.max;
    const value = slider.value;
    const percentage = ((value - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, #78c679 0%, #78c679 ${percentage}%, #000000 ${percentage}%, #000000 100%)`;
  }

  // Initial calculation and rendering
  updateEmissions();

  function updateEmissions() {
    // Calculate emissions
    const userEmissions = calculateEmissions(digitalTasks, usage);

    // Update the viewer's yearly emissions
    const viewerYearlyEmissions = userEmissions.totalEmissions * 52;
    document.getElementById('viewer-yearly-emissions').textContent = (viewerYearlyEmissions / 1000).toFixed(0); // Convert to kg

    // Draw chart
    drawEmissionsChart(
      '#weekly-emissions-viewer',
      userEmissions.taskEmissions,
      null, // Remove US average emissions
      'One Week Worth of Emissions from Your Digital Activity',
      true
    );

    // Display equivalents in list
    displayEquivalentsInList('#viewer-equivalents-list', viewerYearlyEmissions, nonDigitalTasks, drivingDistances);
  }
}