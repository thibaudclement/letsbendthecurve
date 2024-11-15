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

export async function loadInternetUsageData() {
  try {
    const data = await d3.csv('assets/data/internet_usage.csv');
    return data.map(d => ({
      year: +d.Year,
      internetUsers: +d['Internet Users'].replace(/,/g, ''),
      internetTraffic: +d['Internet Traffic (Exabytes per Year)'],
      linearSimulation: +d['Internet Traffic - Linear Simulation (Exabytes per Year)'],
      logarithmicSimulation: +d['Internet Traffic - Logarithmic Simulation (Exabytes per Year)'], // Convert GB to EB
    }));
  } catch (error) {
    console.error('Error loading internet usage data:', error);
    return [];
  }
}

export async function loadElectricityConsumptionData() {
  try {
    const data = await d3.csv('assets/data/electricity_consumption.csv');
    return data.map(d => ({
      country: d.Country,
      year: +d.Year,
      powerConsumption: +d['Power Consumption (TWh)'],
    }));
  } catch (error) {
    console.error('Error loading electricity consumption data:', error);
    return [];
  }
}

export async function loadIctEmissionsData() {
  try {
    const data = await d3.csv('assets/data/ict_sector_emissions.csv');
    return data.map(d => ({
      year: +d.Year,
      minEstimate: +d.MinEstimate,
      maxEstimate: +d.MaxEstimate,
      isProjection: +d.Year >= 2018, // True if year >= 2018
    }));
  } catch (error) {
    console.error('Error loading ICT emissions data:', error);
    return [];
  }
}

export async function loadIctEmissionsBreakdownData() {
  try {
    const data = await d3.csv('assets/data/ict_emissions_breakdown.csv');
    return data.map(d => ({
      component: d['ICT Component'],
      proportionalImpact: parseFloat(d['Proportional Impact'].replace('%', '')),
    }));
  } catch (error) {
    console.error('Error loading ICT emissions breakdown data:', error);
    return [];
  }
}

export async function loadPueData() {
  try {
    const data = await d3.csv('assets/data/data_center_efficiency.csv');

    return data.map(d => {
      const year = +d.Year;
      const pue = +d.PUE;
      const energyConsumption = +d['Energy Consumption'];
      const itEnergy = energyConsumption / pue;

      return {
        year,
        pue,
        pueSource: d['PUE Source'],
        energyConsumption,
        itEnergy,
        isProjection: d['PUE Source'] === 'Projection',
        isInterpolation: d['PUE Source'] === 'Interpolation',
      };
    });
  } catch (error) {
    console.error('Error loading PUE data:', error);
    return [];
  }
}