export function calculateEmissions(digitalTasks, usage) {
  let totalEmissions = 0;
  const taskEmissions = digitalTasks.map(task => {
    const userValue = usage[task.task];
    const emissions = task.emissions_per_unit * userValue;
    totalEmissions += emissions;
    return {
      task: task.task,
      originalTask: task.originalTask,
      platform: task.platform,
      emissions: emissions,
      userValue: userValue,
      unit: task.unit, // Include unit
    };
  });

  // Sort tasks by emissions descending
  taskEmissions.sort((a, b) => b.emissions - a.emissions);

  return { totalEmissions, taskEmissions };
}