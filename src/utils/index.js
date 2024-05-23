/* eslint-disable no-loop-func */
/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
export function calculateTotalExcludingWeekends(data) {
  const xArray = data.x;
  const yArray = data.y;

  let total = 0;
  let numWeekdays = 0;

  for (let i = 0; i < xArray.length; i++) {
    const currentDate = new Date(xArray[i]);
    if (currentDate.getDay() !== 6 && currentDate.getDay() !== 0) {
      total += parseFloat(yArray[i]);
      numWeekdays++;
    }
  }

  if (numWeekdays === 0) {
    return 0; // To avoid division by zero
  }

  const average = total / numWeekdays;
  return average;
}

export function shiftPlanningTableDateFormat(data) {
  const result = [];
  for (const machineId in data.shiftplan) {
    const machineData = data.shiftplan[machineId];
    const transformedMachineData = {
      machineName: machineData.machine_name,
      machineId: +machineId
    };
    for (const date in machineData.dates) {
      const shifts = machineData.dates[date];
      const transformedShifts = {};
      for (const shift of Object.entries(data.shift_list)) {
        if (machineData.shift_group_shifts.find((curshiftId) => curshiftId === +shift[0])) {
          // eslint-disable-next-line no-shadow
          transformedShifts[shift[1].shift_name] = {
            status: !!shifts.find((curshift) => curshift.shift_id === +shift[0]),
            operatorId: shifts.find((curshift) => curshift.shift_id === +shift[0])?.operator_id
          };
        }
      }
      transformedMachineData[date] = transformedShifts;
    }
    result.push(transformedMachineData);
  }
  return result;
}

export function updateShiftDataHandler(data, machineId, date, shiftName, newValue) {
  // eslint-disable-next-line no-shadow
  return data.map((machine) => {
    if (+machine.machineId === machineId) {
      machine[date][shiftName] = {
        ...machine[date][shiftName],
        status: newValue
      };
      return machine;
    }
    return machine;
  });
}

export function updateOperatorHandler(data, machineId, date, shiftName, operatorId) {
  // eslint-disable-next-line no-shadow
  return data.map((machine) => {
    if (+machine.machineId === machineId) {
      if (machine[date][shiftName].status) {
        machine[date][shiftName] = {
          ...machine[date][shiftName],
          operatorId: +operatorId
        };
      }
      return machine;
    }
    return machine;
  });
}

export function calculateTotal(data, isDay) {
  let dayCount = 0;
  let today = {
    energy_consumption: 0,
    energy_wastage: 0,
    energy_wastage_cost: 0,
    energy_consumption_cost: 0,
    rating_energy_consumption: 0,
    rating_energy_wastage: 0,
    production_duration: 0,
    off_duration: 0,
    idle_duration: 0,
    co2_emissions_tons: 0,
    oee: 0
  };
  let week = {
    energy_consumption: 0,
    energy_wastage: 0,
    energy_wastage_cost: 0,
    energy_consumption_cost: 0,
    rating_energy_consumption: 0,
    rating_energy_wastage: 0,
    production_duration: 0,
    off_duration: 0,
    idle_duration: 0,
    co2_emissions_tons: 0,
    oee: 0
  };
  let month = {
    energy_consumption: 0,
    energy_wastage: 0,
    energy_wastage_cost: 0,
    energy_consumption_cost: 0,
    rating_energy_consumption: 0,
    rating_energy_wastage: 0,
    production_duration: 0,
    off_duration: 0,
    idle_duration: 0,
    co2_emissions_tons: 0,
    oee: 0
  };
  if (data) {
    const keys = Object.keys(data);
    for (let i = keys.length - 1; i >= 0; i--) {
      const date = keys[i];
      const overAllHallData = data[date].overall;
      if (!isDay) {
        for (const shift in overAllHallData) {
          if (dayCount === 0) {
            today = {
              energy_consumption:
                today.energy_consumption + overAllHallData[shift].energy_consumption,
              energy_wastage: today.energy_wastage + overAllHallData[shift].energy_wastage,
              energy_wastage_cost:
                today.energy_wastage_cost + overAllHallData[shift].energy_wastage_cost,
              energy_consumption_cost:
                today.energy_consumption_cost + overAllHallData[shift].energy_consumption_cost,
              rating_energy_consumption:
                today.rating_energy_consumption + overAllHallData[shift].rating_energy_consumption,
              rating_energy_wastage:
                today.rating_energy_wastage + overAllHallData[shift].rating_energy_wastage,
              production_duration:
                today.production_duration + overAllHallData[shift].production_duration,
              off_duration: today.off_duration + overAllHallData[shift].off_duration,
              co2_emissions_tons:
                today.co2_emissions_tons + overAllHallData[shift].co2_emissions_tons,
              idle_duration: today.idle_duration + overAllHallData[shift].idle_duration
            };
          }
          if (dayCount <= 6) {
            week = {
              energy_consumption:
                week.energy_consumption + overAllHallData[shift].energy_consumption,
              energy_wastage: week.energy_wastage + overAllHallData[shift].energy_wastage,
              energy_wastage_cost:
                week.energy_wastage_cost + overAllHallData[shift].energy_wastage_cost,
              energy_consumption_cost:
                week.energy_consumption_cost + overAllHallData[shift].energy_consumption_cost,
              rating_energy_consumption:
                week.rating_energy_consumption + overAllHallData[shift].rating_energy_consumption,
              rating_energy_wastage:
                week.rating_energy_wastage + overAllHallData[shift].rating_energy_wastage,
              production_duration:
                week.production_duration + overAllHallData[shift].production_duration,
              off_duration: week.off_duration + overAllHallData[shift].off_duration,
              co2_emissions_tons:
                week.co2_emissions_tons + overAllHallData[shift].co2_emissions_tons,
              idle_duration: week.idle_duration + overAllHallData[shift].idle_duration
            };
          }
          month = {
            energy_consumption:
              month.energy_consumption + overAllHallData[shift].energy_consumption,
            energy_wastage: month.energy_wastage + overAllHallData[shift].energy_wastage,
            energy_wastage_cost:
              month.energy_wastage_cost + overAllHallData[shift].energy_wastage_cost,
            energy_consumption_cost:
              month.energy_consumption_cost + overAllHallData[shift].energy_consumption_cost,
            rating_energy_consumption:
              month.rating_energy_consumption + overAllHallData[shift].rating_energy_consumption,
            rating_energy_wastage:
              month.rating_energy_wastage + overAllHallData[shift].rating_energy_wastage,
            production_duration:
              month.production_duration + overAllHallData[shift].production_duration,
            off_duration: month.off_duration + overAllHallData[shift].off_duration,
            idle_duration: month.idle_duration + overAllHallData[shift].idle_duration,
            co2_emissions_tons: month.co2_emissions_tons + overAllHallData[shift].co2_emissions_tons
          };
        }
      } else {
        if (dayCount === 0) {
          today = {
            energy_consumption: today.energy_consumption + overAllHallData.energy_consumption,
            energy_wastage: today.energy_wastage + overAllHallData.energy_wastage,
            energy_wastage_cost: today.energy_wastage_cost + overAllHallData.energy_wastage_cost,
            energy_consumption_cost:
              today.energy_consumption_cost + overAllHallData.energy_consumption_cost,
            rating_energy_consumption:
              today.rating_energy_consumption + overAllHallData.rating_energy_consumption,
            rating_energy_wastage:
              today.rating_energy_wastage + overAllHallData.rating_energy_wastage,
            production_duration: today.production_duration + overAllHallData.production_duration,
            off_duration: today.off_duration + overAllHallData.off_duration,
            co2_emissions_tons: today.co2_emissions_tons + overAllHallData.co2_emissions_tons,
            idle_duration: today.idle_duration + overAllHallData.idle_duration
          };
        }
        if (dayCount <= 6) {
          week = {
            energy_consumption: week.energy_consumption + overAllHallData.energy_consumption,
            energy_wastage: week.energy_wastage + overAllHallData.energy_wastage,
            energy_wastage_cost: week.energy_wastage_cost + overAllHallData.energy_wastage_cost,
            energy_consumption_cost:
              week.energy_consumption_cost + overAllHallData.energy_consumption_cost,
            rating_energy_consumption:
              week.rating_energy_consumption + overAllHallData.rating_energy_consumption,
            rating_energy_wastage:
              week.rating_energy_wastage + overAllHallData.rating_energy_wastage,
            production_duration: week.production_duration + overAllHallData.production_duration,
            off_duration: week.off_duration + overAllHallData.off_duration,
            co2_emissions_tons: week.co2_emissions_tons + overAllHallData.co2_emissions_tons,
            idle_duration: week.idle_duration + overAllHallData.idle_duration
          };
        }
        month = {
          energy_consumption: month.energy_consumption + overAllHallData.energy_consumption,
          energy_wastage: month.energy_wastage + overAllHallData.energy_wastage,
          energy_wastage_cost: month.energy_wastage_cost + overAllHallData.energy_wastage_cost,
          energy_consumption_cost:
            month.energy_consumption_cost + overAllHallData.energy_consumption_cost,
          rating_energy_consumption:
            month.rating_energy_consumption + overAllHallData.rating_energy_consumption,
          rating_energy_wastage:
            month.rating_energy_wastage + overAllHallData.rating_energy_wastage,
          production_duration: month.production_duration + overAllHallData.production_duration,
          off_duration: month.off_duration + overAllHallData.off_duration,
          co2_emissions_tons: month.co2_emissions_tons + overAllHallData.co2_emissions_tons,
          idle_duration: month.idle_duration + overAllHallData.idle_duration
        };
      }
      dayCount += 1;
    }
  }

  return {
    today,
    week,
    month
  };
}

export function peakOptimizerTableDateFormat(inputData) {
  let outputData = [];
  for (const date in inputData) {
    const operators = inputData[date];

    for (const operatorId in operators) {
      const operatorData = operators[operatorId];

      const machineList = operatorData.machine_list;
      machineList?.forEach((machine) => {
        const machineId = machine.id;
        const machineName = machine.name;
        for (const shift in machine.shift_data) {
          const shiftData = machine.shift_data[shift];

          // Create the output format
          const outputEntry = {
            machineId,
            machineName,
            operatorId,
            shift,
            [date]: {
              energy_wastage: shiftData.energy_wastage,
              idle_duration: shiftData.idle_duration,
              oee: shiftData.oee,
              performance: shiftData.performance,
              production_duration: shiftData.production_duration,
              overall_oee: machine.ratings.oee,
              overall_performance: machine.ratings.performance,
              overall_energy_wastage: shiftData.rating_energy_wastage
            }
          };

          if (
            outputData.find(
              (item) =>
                item.machineId === outputEntry.machineId &&
                item.operatorId === outputEntry.operatorId &&
                item.shift === outputEntry.shift
            )
          ) {
            const updatedOutPutData = outputData.map((data) => {
              if (
                data.machineId === outputEntry.machineId &&
                data.operatorId === outputEntry.operatorId &&
                data.shift === outputEntry.shift
              ) {
                return {
                  ...data,
                  ...outputEntry
                };
              }
              return data;
            });
            outputData = [...updatedOutPutData];
          } else {
            outputData.push(outputEntry);
          }
        }
      });
    }
  }

  return outputData;
}

export function aggregateOperatorData(inputData) {
  const outputData = [];

  // Create a map to store aggregated data for each operator and day
  const operatorAggregatedDataMap = new Map();

  // Iterate through the input data
  inputData?.forEach((entry) => {
    // eslint-disable-next-line prefer-destructuring
    const operatorId = entry.operatorId;

    // If the operatorId doesn't exist in the map, initialize it
    if (!operatorAggregatedDataMap.has(operatorId)) {
      operatorAggregatedDataMap.set(operatorId, {});
    }

    // Iterate through the dates in the entry
    for (const date in entry) {
      if (
        date !== "machineId" &&
        date !== "machineName" &&
        date !== "operatorId" &&
        date !== "shift"
      ) {
        const dayData = entry[date];
        // If the date doesn't exist for the operator, initialize it
        if (!operatorAggregatedDataMap.get(operatorId)[date]) {
          operatorAggregatedDataMap.get(operatorId)[date] = {
            oee: 0,
            performance: 0,
            // energy_consumption: 0,
            // energy_wastage: 0,
            idle_duration: 0,
            production_duration: 0
            // overall_oee: 0,
            // overall_energy_wastage: 0,
          };
        }

        // Update the aggregated values
        operatorAggregatedDataMap.get(operatorId)[date].oee += dayData.oee;
        operatorAggregatedDataMap.get(operatorId)[date].performance += dayData.performance;
        // operatorAggregatedDataMap.get(operatorId)[date].energy_consumption += dayData.energy_consumption;
        // operatorAggregatedDataMap.get(operatorId)[date].energy_wastage += dayData.energy_wastage;
        operatorAggregatedDataMap.get(operatorId)[date].idle_duration += dayData.idle_duration;
        operatorAggregatedDataMap.get(operatorId)[date].production_duration +=
          dayData.production_duration;
        // operatorAggregatedDataMap.get(operatorId)[date].overall_oee += dayData.overall_oee;
        // operatorAggregatedDataMap.get(operatorId)[date].overall_energy_wastage += dayData.overall_energy_wastage;
      }
    }
  });

  // Convert map values to an array for the final output
  operatorAggregatedDataMap?.forEach((operatorData, operatorId) => {
    const operatorEntry = {
      operatorId
    };

    for (const date in operatorData) {
      operatorEntry[date] = {
        oee: operatorData[date].oee,
        performance: operatorData[date].performance,
        // energy_consumption: operatorData[date].energy_consumption,
        // energy_wastage: operatorData[date].energy_wastage,
        total_idle_duration: operatorData[date].idle_duration,
        total_production_duration: operatorData[date].production_duration
        // overall_oee: operatorData[date].overall_oee,
        // overall_energy_wastage: operatorData[date].overall_energy_wastage,
      };
    }

    outputData.push(operatorEntry);
  });

  return outputData;
}

export const defaultValuesOfReport = {
  day_data: {
    availability: 0,
    cycles: 0,
    energy_consumption: 0,
    energy_wastage: 0,
    idle_duration: 0,
    oee: 0,
    off_duration: 0,
    on_duration: 0,
    performance: 0,
    preparation_duration: 0,
    production_duration: 0,
    quality: 0,
    rating_energy_consumption: 0,
    rating_energy_wastage: 0,
    total_duration: 0
  },
  ratings: {
    energy_consumption: 0,
    energy_wastage: 0,
    oee: 0,
    performance: 0
  },
  shift_data: {},
  state: 0
};

export function parseJsonPayload(jsonString) {
  try {
    // Parse the JSON string into a JavaScript object
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
  } catch (error) {
    // Handle parsing errors
    console.error("Error parsing JSON:", error);
    return null;
  }
}