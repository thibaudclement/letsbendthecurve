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

export async function loadIctEmissionCategoriesData() {
  try {
    const data = await d3.csv('assets/data/ict_sector_emission_categories.csv');
    // Parse data
    return data.map(d => ({
      Segment: d['Segment'],
      'Operational Emissions': +d['Operational Emissions'],
      'Embodied Emissions': +d['Embodied Emissions'],
    }));
  } catch (error) {
    console.error('Error loading ICT emission categories data:', error);
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
      const computingUnitsNeed = energyConsumption / pue; // Compute Computing Units Need

      return {
        year,
        pue,
        pueSource: d['PUE Source'],
        energyConsumption,
        computingUnitsNeed,
        isProjection: d['PUE Source'] === 'Projection',
        isInterpolation: d['PUE Source'] === 'Interpolation',
      };
    });
  } catch (error) {
    console.error('Error loading PUE data:', error);
    return [];
  }
}

export async function loadFortune500EmissionsData() {
  try {
    const data = await d3.csv('assets/data/fortune_500_websites_emissions.csv');

    // Process data
    const processedData = data.map(d => {
      const wcCO2PerVisit = parseFloat(d['WC CO2 per Visit']);
      const monthlyTrafficK = parseFloat(d['Monthly traffic in K']);
      const totalEmissions = wcCO2PerVisit * monthlyTrafficK * 12 / 1000; // in tonnes of CO2 per year

      return {
        rank: parseInt(d.Rank),
        company: d.Company,
        ticker: d.Ticker,
        sector: d.Sector,
        industry: d.Industry,
        profitable: d.Profitable === 'yes',
        founderIsCEO: d.Founder_is_CEO === 'yes',
        femaleCEO: d.FemaleCEO === 'yes',
        worldsMostAdmiredCompanies: d.Worlds_Most_Admired_Companies === 'yes',
        bestCompaniesToWorkFor: d.Best_Companies_to_Work_For === 'yes',
        numberOfEmployees: parseInt(d.Number_of_employees),
        country: d.Country,
        website: d.Website,
        ceo: d.CEO,
        companyType: d.CompanyType,
        wcGrade: d['WC Grade'],
        sustainableEnergy: d['Sustainable Energy'],
        wcCO2PerVisit,
        monthlyTrafficK,
        totalEmissions,
        // Additional fields for filtering and display
        profitableRaw: d.Profitable,
        founderIsCEORaw: d.Founder_is_CEO,
        femaleCEORaw: d.FemaleCEO,
        worldsMostAdmiredCompaniesRaw: d.Worlds_Most_Admired_Companies,
        bestCompaniesToWorkForRaw: d.Best_Companies_to_Work_For,
      };
    }).filter(d =>
      !isNaN(d.wcCO2PerVisit) &&
      !isNaN(d.monthlyTrafficK) &&
      d.wcGrade &&
      !isNaN(d.totalEmissions)
    );

    return processedData;
  } catch (error) {
    console.error('Error loading Fortune 500 Emissions data:', error);
    return [];
  }
}

export async function loadCountryData() {
  try {
    const data = await d3.csv('assets/data/country_data.csv');
    // Parse and convert data types
    data.forEach(d => {
      d.Country = d.Country;
      d.Population = d.Population ? +d.Population : NaN;
      d["Human Development Index"] = d["Human Development Index"] ? +d["Human Development Index"] : NaN;
      d["GDP (Nominal)"] = d["GDP (Nominal)"] ? +d["GDP (Nominal)"] : NaN;
      d["GDP Per Capita"] = d["GDP Per Capita"] ? +d["GDP Per Capita"] : NaN;
      d["Electricity Consumption"] = d["Electricity Consumption"] ? +d["Electricity Consumption"] : NaN;
      d["Internet Users (% of Population)"] = d["Internet Users (% of Population)"] ? +d["Internet Users (% of Population)"] : NaN;
      d["Data Centers"] = d["Data Centers"] ? +d["Data Centers"] : NaN;
      d["Supercomputer Cores"] = d["Supercomputer Cores"] ? +d["Supercomputer Cores"] : NaN;
      d["Internet Connection Speed (Average Download Speed in Mbit Per Second)"] = d["Internet Connection Speed (Average Download Speed in Mbit Per Second)"] ? +d["Internet Connection Speed (Average Download Speed in Mbit Per Second)"] : NaN;

      // Calculate Supercomputer Cores Per Million Inhabitants
      if (!isNaN(d["Supercomputer Cores"]) && !isNaN(d.Population) && d.Population !== 0) {
        d["Supercomputer Cores Per Million Inhabitants"] = (d["Supercomputer Cores"] / d.Population) * 1000000;
      } else {
        d["Supercomputer Cores Per Million Inhabitants"] = NaN;
      }
    });
    return data;
  } catch (error) {
    console.error('Error loading country data:', error);
    return [];
  }
}

