export async function loadDigitalTasks() {
  try {
    const data = await d3.csv('assets/data/digital_task_emissions.csv');
    return data.map(d => ({
      task: d.task.toLowerCase(), // Convert task names to lowercase
      originalTask: d.task, // Store the original task name
      platform: d.platform,
      emissions_per_unit: +d.emissions_per_unit,
      unit: d.unit,
      thibaud_weekly_tasks: +d.thibaud_weekly_tasks,
      us_weekly_tasks: +d.us_weekly_tasks,
    }));
  } catch (error) {
    console.error('Error loading digital tasks data:', error);
    return [];
  }
}

export async function loadNonDigitalTasks() {
  const data = await d3.csv('assets/data/non_digital_task_emissions.csv');
  return data.map(d => ({
    task: d.task,
    emissions_per_unit: +d.emissions_per_unit,
    unit: d.unit,
  }));
}

export async function loadDrivingDistances() {
  const data = await d3.csv('assets/data/driving_distances.csv');
  return data.map(d => ({
    departure: d.Departure || d.departure,
    destination: d.Destination || d.destination,
    distance: +d.Distance || +d.distance,
  }));
}