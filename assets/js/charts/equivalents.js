export function displayEquivalentsInList(listSelector, yearlyEmissions, nonDigitalTasks, drivingDistances) {
  const list = d3.select(listSelector);
  list.html(''); // Clear previous content

  // Miles driven equivalent
  const drivingTask = nonDigitalTasks.find(d => d.task === 'driving');
  const milesDriven = yearlyEmissions / drivingTask.emissions_per_unit;

  const closestDistance = findClosestDistance(milesDriven, drivingDistances);

  const drivingItem = list.append('li');
  drivingItem.html(`Driving <span class="data-point">${milesDriven.toFixed(0)}</span> miles in a gas-powered car.`);

  // Beef servings equivalent
  const beefTask = nonDigitalTasks.find(d => d.task === 'beef_serving');
  const beefServings = yearlyEmissions / beefTask.emissions_per_unit;

  const beefItem = list.append('li');
  beefItem.html(`Eating <span class="data-point">${beefServings.toFixed(0)}</span> servings of beef (25 grams of protein each).`);

  // Smartphone charges equivalent
  const chargingTask = nonDigitalTasks.find(d => d.task === 'charging_smartphone');
  const smartphoneCharges = yearlyEmissions / chargingTask.emissions_per_unit;
  const yearsOfCharging = smartphoneCharges / 365;
  const currentYear = new Date().getFullYear();
  const futureYear = currentYear + Math.round(yearsOfCharging);

  const chargingItem = list.append('li');
  chargingItem.html(`Charging a smartphone every day, until the year <span class="data-point">${futureYear}</span>.`);

  // Style list items and add images as bullets
  list.selectAll('li')
    .style('list-style-type', 'none')
    .style('margin', '10px 0')
    .style('padding-left', '35px')
    .style('background-position', '0 center')
    .style('background-repeat', 'no-repeat')
    .style('background-size', '25px 25px');

  // Add images as bullets
  list.selectAll('li')
    .data(['assets/images/driving_distance.svg', 'assets/images/smartphone_charging.svg', 'assets/images/beef_serving.svg'])
    .style('background-image', d => `url(${d})`);
}

// Ensure the findClosestDistance function is included
function findClosestDistance(miles, distances) {
  let closest = distances[0];
  let minDiff = Math.abs(miles - (closest.distance * 2)); // Multiply by 2 for round trip

  distances.forEach(d => {
    const totalDistance = d.distance * 2; // Round trip
    const diff = Math.abs(miles - totalDistance);
    if (diff < minDiff) {
      minDiff = diff;
      closest = d;
    }
  });

  return {
    departure: closest.departure || closest.Departure,
    destination: closest.destination || closest.Destination,
    totalDistance: closest.distance * 2,
  };
}