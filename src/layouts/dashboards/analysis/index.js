/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
  AppBar,
  Autocomplete,
  Checkbox,
  Chip,
  Grid,
  Icon,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/system";
import { enumQueryNames } from "api/reactQueryConstant";
import {
  getHallListApi,
  getOeeCalculationDaysApi,
  getOeeCalculationWeeksApi
} from "api/watchmenApi";
import colors from "assets/theme-dark/base/colors";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDCard from "components/MDCard";
import MDSnackbar from "components/MDSnackbar";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import * as echarts from "echarts";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import RangePicker from "../machineShifts/rangepicker";
import { defaultValuesOfReport } from "utils";

const {
  EnergyConsumption,
  EnergyWastage,
  OEE,
  Availability,
  Productivity,
  StoppedTime,
  IdleTime,
  RunTime
} = colors;
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function sumObjectsByKey(...objs) {
  return objs.reduce((a, b) => {
    for (const k in b) {
      if (b.hasOwnProperty(k)) {
        if (typeof b[k] === "number") {
          a[k] = (a[k] || 0) + b[k];
        } else {
          a[k] = b[k];
        }
      }
    }
    return a;
  }, {});
}

moment.updateLocale("en", {
  week: {
    dow: 1
  }
});

export const useStyle = () => ({
  skeleton: {
    transform: "unset",
    margin: "1% 0"
  },
  leftArror: { marginRight: "12px", cursor: "pointer", color: "#FFFFFF" },
  rightArror: { marginLeft: "12px", cursor: "pointer", color: "#FFFFFF" }
});

function Analysis() {
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [selectedMachinesData, setSelectedMachinesData] = useState([]);
  const [originalMachineData, setOriginalMachineData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { axiosPrivate } = useAxiosPrivate();
  const [isCumulative, setIsCumulative] = useState(false);
  const [tabValue, setTabValue] = useState(1);
  const [tabDataValue, setTabDataValue] = useState(0);
  const [cummulativeMachineData, setCummulativeMachineData] = useState(null);
  const [successSB, setSuccessSB] = useState(null);

  const energyChartRef = useRef(null);
  const oeeChartRef = useRef(null);
  const timeChartRef = useRef(null);
  const averageChartRef = useRef(null);
  const averageProductionChartRef = useRef(null);
  const totalChartRef = useRef(null);

  const closeSuccessSB = () => setSuccessSB(null);
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const classes = useStyle();
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [machineHistoryV2, setMachineHistoryV2] = useState(null);

  useEffect(() => {
    if (isCumulative) {
      setSelectedMachinesData(originalMachineData);
    } else {
      const data2 = originalMachineData
        .map((machine) => ({
          data: machine.map((machineData) => {
            const machineValues = Object.values(machineData)[0];
            let shift_data = {
              oee: 0,
              energy_consumption: 0,
              energy_wastage: 0,
              off_duration: 0,
              idle_duration: 0,
              production_duration: 0
            };
            let total_shift_data = {
              oee: 0,
              energy_consumption: 0,
              energy_wastage: 0,
              off_duration: 0,
              idle_duration: 0,
              production_duration: 0
            };
            if (machineValues?.shift_data) {
              const shiftCount = Object.keys(machineValues?.shift_data).length;
              Object.values(machineValues?.shift_data)?.forEach((shiftData) => {
                shift_data = {
                  oee: (shift_data.oee += shiftData.oee),
                  energy_consumption: (shift_data.energy_consumption +=
                    shiftData.energy_consumption),
                  energy_wastage: (shift_data.energy_wastage += shiftData.energy_wastage),
                  off_duration: (shift_data.off_duration += shiftData.off_duration),
                  idle_duration: (shift_data.idle_duration += shiftData.idle_duration),
                  production_duration: (shift_data.production_duration +=
                    shiftData.production_duration)
                };
              });
              shift_data = {
                oee: shift_data.oee / shiftCount,
                energy_consumption: shift_data.energy_consumption / shiftCount,
                energy_wastage: shift_data.energy_wastage / shiftCount,
                off_duration: shift_data.off_duration / shiftCount,
                idle_duration: shift_data.idle_duration / shiftCount,
                production_duration: shift_data.production_duration / shiftCount
              };
              total_shift_data = {
                oee: shift_data.oee,
                energy_consumption: shift_data.energy_consumption,
                energy_wastage: shift_data.energy_wastage,
                off_duration: shift_data.off_duration,
                idle_duration: shift_data.idle_duration,
                production_duration: shift_data.production_duration
              };
            }
            return {
              shift_data,
              total_shift_data
            };
          })
        }))
        .flat();
      setSelectedMachinesData(data2);
    }
  }, [isCumulative]);

  const { isFetching: machinesDataFetching, refetch } = useQuery(
    [enumQueryNames.DASHBOARD_STATUS],
    () =>
      getOeeCalculationDaysApi(axiosPrivate, {
        machine_list: selectedMachines.map((machine) => +machine.id),
        start_date: moment(startDate).format("YYYY-MM-DD"),
        end_date: moment(endDate).format("YYYY-MM-DD"),
        pulse: false,
        timeline: false,
        anomalies: false,
        cycles: false,
        energy_data: true,
        extern: false
      }),
    {
      enabled: false,
      onSuccess: (data) => {
        const machines = {};
        const mappdeMachineHistory = [];
        for (const key in data) {
          mappdeMachineHistory.push({ [key]: data[key] });
        }
        setIsCumulative(false);
        setTabValue(1);
        setTabDataValue(0);
        setMachineHistoryV2(mappdeMachineHistory);
        selectedMachines.forEach((machine) => {
          machines[machine.id] = [];
          for (const [key, value] of Object.entries(data)) {
            machines[machine.id].push({ [key]: value?.[machine.id] || defaultValuesOfReport });
          }
        });

        setOriginalMachineData(Object.values({ ...machines }));
        let data2 = _.cloneDeep(Object.values({ ...machines }));
        const cummulativeMachineData2 = data2[0];
        if (data2.length > 1) {
          for (let index = 1; index < data2.length; index++) {
            const machine = data2[index];
            if (machine.length) {
              // eslint-disable-next-line no-shadow
              machine.forEach((data2, idx) => {
                const dateKey = Object.keys(data2)[0];
                cummulativeMachineData2[idx][dateKey].day_data = sumObjectsByKey(
                  Object.values(cummulativeMachineData2[idx])[0].day_data,
                  Object.values(data2)[0].day_data
                );
                Object.values(data2[dateKey].shift_data).forEach((shiftData, shiftIdx) => {
                  const shiftKey = Object.keys(data2[dateKey].shift_data)[shiftIdx];
                  if (
                    Object.keys(cummulativeMachineData2[idx][dateKey].shift_data).includes(shiftKey)
                  ) {
                    cummulativeMachineData2[idx][dateKey].shift_data[shiftKey] = sumObjectsByKey(
                      Object.values(cummulativeMachineData2[idx][dateKey].shift_data[shiftKey]),
                      shiftData
                    );
                  } else {
                    cummulativeMachineData2[idx][dateKey].shift_data[shiftKey] = shiftData;
                  }
                });
              });
            }
          }
        }
        setCummulativeMachineData(cummulativeMachineData2);
        if (!isCumulative) {
          data2 = data2
            .map((machine) => ({
              data: machine.map((machineData) => {
                const machineValues = Object.values(machineData)[0];
                let shift_data = {
                  oee: 0,
                  energy_consumption: 0,
                  energy_wastage: 0,
                  off_duration: 0,
                  idle_duration: 0,
                  production_duration: 0
                };
                let total_shift_data = {
                  oee: 0,
                  energy_consumption: 0,
                  energy_wastage: 0,
                  off_duration: 0,
                  idle_duration: 0,
                  production_duration: 0
                };
                if (machineValues?.shift_data) {
                  const shiftCount = Object.keys(machineValues?.shift_data).length;
                  Object.values(machineValues?.shift_data)?.forEach((shiftData) => {
                    shift_data = {
                      oee: (shift_data.oee += shiftData.oee),
                      energy_consumption: (shift_data.energy_consumption +=
                        shiftData.energy_consumption),
                      energy_wastage: (shift_data.energy_wastage += shiftData.energy_wastage),
                      off_duration: (shift_data.off_duration += shiftData.off_duration),
                      idle_duration: (shift_data.idle_duration += shiftData.idle_duration),
                      production_duration: (shift_data.production_duration +=
                        shiftData.production_duration)
                    };
                  });
                  shift_data = {
                    oee: shift_data.oee / shiftCount,
                    energy_consumption: shift_data.energy_consumption / shiftCount,
                    energy_wastage: shift_data.energy_wastage / shiftCount,
                    off_duration: shift_data.off_duration / shiftCount,
                    idle_duration: shift_data.idle_duration / shiftCount,
                    production_duration: shift_data.production_duration / shiftCount
                  };
                  total_shift_data = {
                    oee: shift_data.oee,
                    energy_consumption: shift_data.energy_consumption,
                    energy_wastage: shift_data.energy_wastage,
                    off_duration: shift_data.off_duration,
                    idle_duration: shift_data.idle_duration,
                    production_duration: shift_data.production_duration
                  };
                }
                return {
                  shift_data,
                  total_shift_data
                };
              })
            }))
            .flat();
        }
        setSelectedMachinesData(data2);
      }
    }
  );

  const { mutate: fetchWeeks } = useMutation(
    [enumQueryNames.DASHBOARD_STATUS],
    () =>
      getOeeCalculationWeeksApi(axiosPrivate, {
        machine_list: selectedMachines.map((machine) => +machine.id),
        start_date: moment(startDate).format("YYYY-MM-DD"),
        end_date: moment(endDate).format("YYYY-MM-DD"),
        pulse: false,
        timeline: false,
        anomalies: false,
        cycles: false,
        energy_data: true,
        extern: false
      }),
    {
      enabled: false,
      onSuccess: (data) => {
        const machines = {};
        const mappdeMachineHistory = [];
        for (const key in data) {
          mappdeMachineHistory.push({ [key]: data[key] });
        }
        setMachineHistoryV2(mappdeMachineHistory);
        selectedMachines.forEach((machine) => {
          machines[machine.id] = [];
          for (const [key, value] of Object.entries(data)) {
            machines[machine.id].push({ [key]: value[machine.id] });
          }
        });

        setOriginalMachineData(Object.values({ ...machines }));
        let data2 = _.cloneDeep(Object.values({ ...machines }));
        const cummulativeMachineData2 = data2[0];

        if (data2.length > 1) {
          for (let index = 1; index < data2.length; index++) {
            const machine = data2[index];
            if (machine.length) {
              // eslint-disable-next-line no-shadow
              machine.forEach((data2, idx) => {
                const dateKey = Object.keys(data2)[0];
                cummulativeMachineData2[idx][dateKey].day_data = sumObjectsByKey(
                  Object.values(cummulativeMachineData2[idx])[0].day_data,
                  Object.values(data2)[0].day_data
                );
                Object.values(data2[dateKey].shift_data).forEach((shiftData, shiftIdx) => {
                  const shiftKey = Object.keys(data2[dateKey].shift_data)[shiftIdx];
                  if (
                    Object.keys(cummulativeMachineData2[idx][dateKey].shift_data).includes(shiftKey)
                  ) {
                    cummulativeMachineData2[idx][dateKey].shift_data[shiftKey] = sumObjectsByKey(
                      Object.values(cummulativeMachineData2[idx][dateKey].shift_data[shiftKey]),
                      shiftData
                    );
                  } else {
                    cummulativeMachineData2[idx][dateKey].shift_data[shiftKey] = shiftData;
                  }
                });
              });
            }
          }
        }

        setCummulativeMachineData(cummulativeMachineData2);
        if (!isCumulative) {
          data2 = data2
            .map((machine) => ({
              data: machine.map((machineData) => {
                const machineValues = Object.values(machineData)[0];
                let shift_data = {
                  oee: 0,
                  energy_consumption: 0,
                  energy_wastage: 0,
                  off_duration: 0,
                  idle_duration: 0,
                  production_duration: 0
                };
                let total_shift_data = {
                  oee: 0,
                  energy_consumption: 0,
                  energy_wastage: 0,
                  off_duration: 0,
                  idle_duration: 0,
                  production_duration: 0
                };
                if (machineValues?.shift_data) {
                  const shiftCount = Object.keys(machineValues?.shift_data).length;
                  Object.values(machineValues?.shift_data)?.forEach((shiftData) => {
                    shift_data = {
                      oee: (shift_data.oee += shiftData.oee),
                      energy_consumption: (shift_data.energy_consumption +=
                        shiftData.energy_consumption),
                      energy_wastage: (shift_data.energy_wastage += shiftData.energy_wastage),
                      off_duration: (shift_data.off_duration += shiftData.off_duration),
                      idle_duration: (shift_data.idle_duration += shiftData.idle_duration),
                      production_duration: (shift_data.production_duration +=
                        shiftData.production_duration)
                    };
                  });
                  shift_data = {
                    oee: shift_data.oee / shiftCount,
                    energy_consumption: shift_data.energy_consumption / shiftCount,
                    energy_wastage: shift_data.energy_wastage / shiftCount,
                    off_duration: shift_data.off_duration / shiftCount,
                    idle_duration: shift_data.idle_duration / shiftCount,
                    production_duration: shift_data.production_duration / shiftCount
                  };
                  total_shift_data = {
                    oee: shift_data.oee,
                    energy_consumption: shift_data.energy_consumption,
                    energy_wastage: shift_data.energy_wastage,
                    off_duration: shift_data.off_duration,
                    idle_duration: shift_data.idle_duration,
                    production_duration: shift_data.production_duration
                  };
                }
                return {
                  shift_data,
                  total_shift_data
                };
              })
            }))
            .flat();
        }
        setSelectedMachinesData(data2);
      }
    }
  );
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const body = {
  //       start_date:
  //         startDate && startDate?._d !== "Invalid Date"
  //           ? moment(startDate._d).format("YYYY-MM-DD")
  //           : null,
  //       end_date:
  //         endDate && endDate?._d !== "Invalid Date"
  //           ? moment(endDate._d).format("YYYY-MM-DD")
  //           : null,
  //       machine_ids: selectedMachines.map((machine) => machine.id)
  //     }
  //     if (body.machine_ids.length === 0 || body.start_date === null || body.end_date === null) {
  //       return
  //     }
  //     setIsLoading(true)

  //     const response2 = await axiosPrivate.post(`v4/machine/history`, body)

  //     setIsLoading(false)
  //     setOriginalMachineData(Object.values({ ...response2.data.machines }))
  //     if (response2?.status === 200 && response2?.data?.machines) {
  //       let data2 = _.cloneDeep(Object.values({ ...response2.data.machines }))
  //       const cummulativeMachineData2 = data2[0]

  //       if (data2.length > 1) {
  //         for (let index = 1; index < data2.length; index++) {
  //           const machine = data2[index]
  //           if (machine.length) {
  //             // eslint-disable-next-line no-shadow
  //             machine.forEach((data2, idx) => {
  //               const dateKey = Object.keys(data2)[0]
  //               cummulativeMachineData2[idx][dateKey].day_data = sumObjectsByKey(
  //                 Object.values(cummulativeMachineData2[idx])[0].day_data,
  //                 Object.values(data2)[0].day_data
  //               )
  //               Object.values(data2[dateKey].shift_data).forEach((shiftData, shiftIdx) => {
  //                 const shiftKey = Object.keys(data2[dateKey].shift_data)[shiftIdx]
  //                 if (
  //                   Object.keys(cummulativeMachineData2[idx][dateKey].shift_data).includes(shiftKey)
  //                 ) {
  //                   cummulativeMachineData2[idx][dateKey].shift_data[shiftKey] = sumObjectsByKey(
  //                     Object.values(cummulativeMachineData2[idx][dateKey].shift_data[shiftKey]),
  //                     shiftData
  //                   )
  //                 } else {
  //                   cummulativeMachineData2[idx][dateKey].shift_data[shiftKey] = shiftData
  //                 }
  //               })
  //             })
  //           }
  //         }
  //       }
  //       setCummulativeMachineData(cummulativeMachineData2)
  //       if (!isCumulative) {
  //         data2 = data2
  //           .map((machine) => ({
  //             data: machine.map((machineData) => {
  //               const machineValues = Object.values(machineData)[0]
  //               let shift_data = {
  //                 oee: 0,
  //                 energy_consumption: 0,
  //                 energy_wastage: 0,
  //                 off_duration: 0,
  //                 idle_duration: 0,
  //                 production_duration: 0
  //               }
  //               const shiftCount = Object.keys(machineValues?.shift_data).length
  //               Object.values(machineValues?.shift_data)?.forEach((shiftData) => {
  //                 shift_data = {
  //                   oee: (shift_data.oee += shiftData.oee),
  //                   energy_consumption: (shift_data.energy_consumption +=
  //                     shiftData.energy_consumption),
  //                   energy_wastage: (shift_data.energy_wastage += shiftData.energy_wastage),
  //                   off_duration: (shift_data.off_duration += shiftData.off_duration),
  //                   idle_duration: (shift_data.idle_duration += shiftData.idle_duration),
  //                   production_duration: (shift_data.production_duration +=
  //                     shiftData.production_duration)
  //                 }
  //               })
  //               shift_data = {
  //                 oee: shift_data.oee / shiftCount,
  //                 energy_consumption: shift_data.energy_consumption / shiftCount,
  //                 energy_wastage: shift_data.energy_wastage / shiftCount,
  //                 off_duration: shift_data.off_duration / shiftCount,
  //                 idle_duration: shift_data.idle_duration / shiftCount,
  //                 production_duration: shift_data.production_duration / shiftCount
  //               }
  //               return {
  //                 shift_data
  //               }
  //             })
  //           }))
  //           .flat()
  //       }
  //       setSelectedMachinesData(data2)
  //     }
  //   }
  //   fetchData()
  // }, [fetchDataFlag])

  const applyFilterHandler = () => {
    if (selectedMachines.length > 0 && startDate !== null && endDate !== null) {
      refetch();
    } else if (selectedMachines.length === 0 && startDate === null && endDate === null) {
      setSuccessSB("Please select start date , end date and machine");
    } else if (selectedMachines.length === 0) {
      setSuccessSB("Please select machine.");
    } else if (startDate === null && endDate === null) {
      setSuccessSB("Please select start date and end date.");
    }
  };

  useEffect(() => {
    const energyChart = echarts.init(energyChartRef.current);

    const indexCount = cummulativeMachineData?.findIndex(
      (item) => Object.keys(Object.values(item)[0]?.shift_data).length > 0
    );
    const xAxisEDates =
      tabDataValue === 0
        ? cummulativeMachineData?.map((data) => moment(Object.keys(data)[0]).format("YYYY-MM-DD"))
        : cummulativeMachineData?.map((data) => Object.keys(data)[0]);
    const energyOptions = {
      title: {
        left: "center",
        // text: "",
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        data: ["Energy consumption", "Energy wastage"],
        top: 25,
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar", "stack"] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: "category",
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            rotate: 45,
            color: darkMode ? "#ffffffcc" : "#7B809A"
          },
          formatter: (value) => moment(value).format("YYYY-MM-DD"),
          data: xAxisEDates
        }
      ],
      yAxis: [
        {
          type: "value",
          // name: "Energy",
          position: "left",
          alignTicks: true,
          axisLine: {
            show: true,
            lineStyle: {
              color: darkMode ? "#ffffffcc" : "#7B809A"
            }
          },
          splitLine: {
            show: false // hide the horizontal grid lines
          },
          axisLabel: {
            formatter: "{value} kWh",
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      series: isCumulative
        ? [
            {
              name: "Energy consumption",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              barGap: 0,
              tooltip: {
                valueFormatter(value) {
                  return `${value} kWh`;
                }
              },
              itemStyle: {
                color: darkMode ? EnergyConsumption.dark : EnergyConsumption.main // change this to the color you want
              },
              data: cummulativeMachineData?.map((data) => {
                const dataValue = Object.values(data)?.[0] || 0;
                return dataValue !== 0 ? dataValue.day_data.energy_consumption : 0;
              }) || [0]
            },
            {
              name: "Energy wastage",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              barGap: 0,
              tooltip: {
                valueFormatter(value) {
                  return `${value} kWh`;
                }
              },
              itemStyle: {
                color: darkMode ? EnergyWastage.dark : EnergyWastage.main // change this to the color you want
              },
              data: cummulativeMachineData?.map((data) => {
                const dataValue = Object.values(data)?.[0] || 0;
                return dataValue !== 0 ? dataValue.day_data.energy_wastage : 0;
              }) || [0]
            }
          ]
        : cummulativeMachineData?.length &&
          Object.keys(Object.values(cummulativeMachineData[indexCount])[0]?.shift_data)
            .map((shiftId) => {
              const shiftName = shiftId;
              return [
                {
                  name: "Energy consumption",
                  type: "bar",
                  emphasis: {
                    focus: "series"
                  },
                  barGap: 0,
                  tooltip: {
                    valueFormatter(value) {
                      return `${value} kWh ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? EnergyConsumption.dark : EnergyConsumption.main // change this to the color you want
                  },
                  data: cummulativeMachineData?.map((data) => {
                    const dataValue = Object.values(data)[0];
                    return dataValue?.shift_data[shiftId]?.energy_consumption || 0;
                  }) || [0]
                },
                {
                  name: "Energy wastage",
                  type: "bar",
                  barGap: 0,
                  emphasis: {
                    focus: "series"
                  },
                  tooltip: {
                    valueFormatter(value) {
                      return `${value} kWh ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? EnergyWastage.dark : EnergyWastage.main // change this to the color you want
                  },
                  data: cummulativeMachineData.map((data) => {
                    const dataValue = Object.values(data)[0];
                    return dataValue?.shift_data[shiftId]?.energy_wastage || 0;
                  }) || [0]
                },
                {
                  name: "",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    show: false
                  },
                  barWidth: "5%",
                  itemStyle: {
                    color: "#FFFFFF" // change this to the color you want
                  },
                  data: cummulativeMachineData.map(() => 0)
                }
              ];
            })
            .flat()
    };
    energyChart.setOption(energyOptions);

    const oeeChart = echarts.init(oeeChartRef.current);

    const OEECummulativeData = isCumulative
      ? cummulativeMachineData?.map((data) => {
          const dataValue = Object.values(data)[0];
          return ((dataValue.day_data.oee * 100) / selectedMachines.length).toFixed(2);
        })
      : [];
    const OEEEnergyOptions = {
      title: {
        left: "center",
        // text: "",
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        data: ["OEE", "Performance", "Availability"],
        selected: {
          Availability: false,
          Performance: false,
          OEE: true
        },
        top: 25,
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar", "stack"] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: "category",
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            rotate: 45,
            color: darkMode ? "#ffffffcc" : "#7B809A"
          },
          formatter: (value) => moment(value).format("YYYY-MM-DD"),
          data: xAxisEDates
        }
      ],
      yAxis: {
        type: "value",
        // name: "OEE",
        position: "left",
        alignTicks: true,
        axisLine: {
          show: true
          // lineStyle: {
          //     color: "#fcdb03e6"
          // }
        },
        splitLine: {
          show: false // hide the horizontal grid lines
        },
        axisLabel: {
          formatter: (value) => `${Math.trunc(value)} %`,
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },

      series: isCumulative
        ? [
            {
              name: "OEE",
              type: "bar",
              barGap: 0,
              emphasis: {
                focus: "series"
              },
              tooltip: {
                valueFormatter(value) {
                  return `${value === 0 ? 0 : Number(value).toFixed(2) || 0}%`;
                }
              },
              itemStyle: {
                color: darkMode ? OEE.dark : OEE.main // change this to the color you want
              },
              data: OEECummulativeData,
              markPoint: {
                data: [{ type: "max", name: "Max" }],
                label: {
                  formatter: "{c}%"
                }
              }
            },
            {
              name: "Availability",
              type: "bar",
              barGap: 0,
              emphasis: {
                focus: "series"
              },
              tooltip: {
                valueFormatter(value) {
                  return `${value === 0 ? 0 : Number(value).toFixed(2) || 0}%`;
                }
              },
              itemStyle: {
                color: darkMode ? Availability.dark : Availability.main // change this to the color you want
              },
              data: cummulativeMachineData?.map((data) => {
                const dataValue = Object.values(data)[0];
                return ((dataValue.day_data.availability * 100) / selectedMachines.length).toFixed(
                  2
                );
              })
            },
            {
              name: "Performance",
              type: "bar",
              barGap: 0,
              emphasis: {
                focus: "series"
              },
              tooltip: {
                valueFormatter(value) {
                  return `${value === 0 ? 0 : Number(value).toFixed(2) || 0}%`;
                }
              },
              itemStyle: {
                color: darkMode ? Productivity.dark : Productivity.main // change this to the color you want
              },
              data: cummulativeMachineData?.map((data) => {
                const dataValue = Object.values(data)[0];
                return ((dataValue.day_data.performance * 100) / selectedMachines.length).toFixed(
                  2
                );
              })
            }
          ]
        : cummulativeMachineData?.length &&
          Object.keys(Object.values(cummulativeMachineData[indexCount])[0]?.shift_data)
            .map((shiftId) => {
              const OEENonCummulativeData = cummulativeMachineData?.map((data) => {
                const dataValue = Object.values(data)[0];
                return (
                  ((dataValue?.shift_data?.[shiftId]?.oee || 0) * 100) /
                  (selectedMachines?.length || 1)
                )?.toFixed(2);
              });
              const shiftName = shiftId;
              return [
                {
                  name: "OEE",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    valueFormatter(value) {
                      return `${value === 0 ? 0 : Number(value).toFixed(2)}% ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? OEE.dark : OEE.main // change this to the color you want
                  },

                  data: OEENonCummulativeData,
                  markPoint: {
                    data: [{ type: "max", name: "Max" }],
                    label: {
                      formatter: "{c}%"
                    }
                  },
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: shiftName,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "Availability",
                  type: "bar",
                  barGap: 0,
                  emphasis: {
                    focus: "series"
                  },
                  tooltip: {
                    valueFormatter(value) {
                      return `${Number(value).toFixed(2) || 0}% ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? Availability.dark : Availability.main // change this to the color you want
                  },
                  data: cummulativeMachineData.map((data) => {
                    const dataValue = Object.values(data)[0];
                    return (
                      ((dataValue?.shift_data?.[shiftId]?.availability || 0) * 100) /
                      (selectedMachines?.length || 1)
                    ).toFixed(2);
                  })
                },
                {
                  name: "Performance",
                  type: "bar",
                  barGap: 0,
                  emphasis: {
                    focus: "series"
                  },
                  tooltip: {
                    valueFormatter(value) {
                      return `${Number(value).toFixed(2) || 0}% ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? Productivity.dark : Productivity.main // change this to the color you want
                  },
                  data: cummulativeMachineData.map((data) => {
                    const dataValue = Object.values(data)[0];
                    return (
                      ((dataValue?.shift_data?.[shiftId]?.performance || 0) * 100) /
                      (selectedMachines?.length || 1)
                    ).toFixed(2);
                  })
                },
                {
                  name: "",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    show: false
                  },
                  barWidth: "5%",
                  itemStyle: {
                    color: "#FFFFFF" // change this to the color you want
                  },
                  data: cummulativeMachineData.map(() => 0)
                }
              ];
            })
            .flat()
    };
    oeeChart.setOption(OEEEnergyOptions);

    const timeChart = echarts.init(timeChartRef.current);
    const TimeGrapgOptions = {
      title: {
        left: "center",
        // text: "",
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        data: ["Production", "Idle", "Stopped"],
        top: 25,
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar", "stack"] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: "category",
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            rotate: 45,
            color: darkMode ? "#ffffffcc" : "#7B809A"
          },
          formatter: (value) => moment(value).format("YYYY-MM-DD"),
          data: xAxisEDates
        }
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false // hide the horizontal grid lines
          },
          axisLabel: {
            formatter: "{value} hr",
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      series: isCumulative
        ? [
            {
              name: "Production",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              stack: "Time",
              tooltip: {
                valueFormatter(value) {
                  const minutes = Math.floor(((value * 3600) % 3600) / 60);
                  const hours = Math.floor(value);
                  return `${hours || 0}hr ${minutes || 0}min`;
                }
              },
              itemStyle: {
                color: RunTime.main // change this to the color you want
              },
              data: cummulativeMachineData?.map((data) => {
                const totalData = Object.values(data)[0];
                const sec = Number(totalData?.day_data?.production_duration);
                const hour = sec / 3600;
                return hour;
              })
            },
            {
              name: "Idle",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              stack: "Time",
              tooltip: {
                valueFormatter(value) {
                  const minutes = Math.floor(((value * 3600) % 3600) / 60);
                  const hours = Math.floor(value);
                  return `${hours || 0}hr ${minutes || 0}min`;
                }
              },
              itemStyle: {
                color: IdleTime.main // change this to the color you want
              },
              data: cummulativeMachineData?.map((data) => {
                const totalData = Object.values(data)[0];
                const sec = Number(totalData?.day_data?.idle_duration);
                const hour = sec / 3600;
                return hour;
              })
            },
            {
              name: "Stopped",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              stack: "Time",
              tooltip: {
                valueFormatter(value) {
                  const minutes = Math.floor(((value * 3600) % 3600) / 60);
                  const hours = Math.floor(value);
                  return `${hours || 0}hr ${minutes || 0}min`;
                }
              },
              itemStyle: {
                color: StoppedTime.main // change this to the color you want
              },
              data: cummulativeMachineData?.map((data) => {
                const totalData = Object.values(data)[0];
                const sec = Number(totalData?.day_data?.off_duration);
                const hour = sec / 3600;
                return hour;
              })
            }
          ]
        : cummulativeMachineData?.length &&
          Object.keys(Object.values(cummulativeMachineData[indexCount])[0]?.shift_data)
            ?.map((shiftId, shiftIndex) => {
              const shiftName = shiftId;
              return [
                {
                  name: "Production",
                  type: "bar",
                  emphasis: {
                    focus: "series"
                  },
                  stack: `Time${shiftIndex}`,
                  tooltip: {
                    valueFormatter(value) {
                      const minutes = Math.floor(((value * 3600) % 3600) / 60);
                      const hours = Math.floor(value);

                      return `${hours || 0}hr ${minutes || 0}min ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: RunTime.main // change this to the color you want
                  },
                  data: cummulativeMachineData?.map((data) => {
                    const dataValue = Object.values(data)[0];
                    const sec = Number(dataValue?.shift_data?.[shiftId]?.production_duration || 0);
                    const hour = sec / 3600;
                    return hour;
                  })
                },
                {
                  name: "Idle",
                  type: "bar",
                  stack: `Time${shiftIndex}`,
                  tooltip: {
                    valueFormatter(value) {
                      const minutes = Math.floor(((value * 3600) % 3600) / 60);
                      const hours = Math.floor(value);
                      return `${hours || 0}hr ${minutes || 0}min ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: IdleTime.main // change this to the color you want
                  },
                  data: cummulativeMachineData?.map((data) => {
                    const dataValue = Object.values(data)[0];
                    const sec = Number(dataValue?.shift_data?.[shiftId]?.idle_duration || 0);
                    const hour = sec / 3600;
                    return hour;
                  })
                },
                {
                  name: "Stopped",
                  type: "bar",
                  stack: `Time${shiftIndex}`,
                  tooltip: {
                    valueFormatter(value) {
                      const minutes = Math.floor(((value * 3600) % 3600) / 60);
                      const hours = Math.floor(value);
                      return `${hours || 0}hr ${minutes || 0}min ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: StoppedTime.main // change this to the color you want
                  },
                  data: cummulativeMachineData?.map((data) => {
                    const dataValue = Object.values(data)[0];
                    const sec = Number(dataValue?.shift_data?.[shiftId]?.off_duration || 0);
                    const hour = sec / 3600;
                    return hour;
                  }),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: shiftName,
                      color: "#FFF"
                    }
                  }
                }
              ];
            })
            .flat()
    };
    timeChart.setOption(TimeGrapgOptions);
    const averageProChart = echarts.init(averageProductionChartRef.current);
    const AverageProOptions = {
      title: {
        left: "center",
        // text: "",
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        data: ["Production", "Idle", "Stopped"],
        top: 25,
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar", "stack"] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: "category",
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            color: darkMode ? "#ffffffcc" : "#7B809A"
          },
          formatter: (value) => moment(value).format("YYYY-MM-DD"),
          data: originalMachineData?.map(
            (machine) =>
              Object.values(
                Object.values(machine).find((item) => Object.values(item)?.[0]?.name)
              )[0]?.name
          )
        }
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false // hide the horizontal grid lines
          },
          axisLabel: {
            formatter: "{value} hr",
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      series: isCumulative
        ? [
            {
              name: "Production",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              stack: "Time",
              tooltip: {
                valueFormatter(value) {
                  const minutes = Math.floor(((value * 3600) % 3600) / 60);
                  const hours = Math.floor(value);
                  return `${hours}hr ${minutes}min`;
                }
              },
              itemStyle: {
                color: RunTime.main // change this to the color you want
              },
              data: originalMachineData?.map((machine) => {
                const totalEnergyConsumption = machine
                  .map((data) => {
                    const dataValue = Object.values(data)[0];
                    return dataValue.day_data.production_duration;
                  })
                  .reduce((total, value) => total + value, 0);
                const sec = Number(totalEnergyConsumption);
                const hour = sec / 3600;
                return hour;
              })
            },
            {
              name: "Idle",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              stack: "Time",
              tooltip: {
                valueFormatter(value) {
                  const minutes = Math.floor(((value * 3600) % 3600) / 60);
                  const hours = Math.floor(value);

                  return `${hours}hr ${minutes}min`;
                }
              },
              itemStyle: {
                color: IdleTime.main // change this to the color you want
              },
              data: originalMachineData?.map((machine) => {
                const totalEnergyConsumption = machine
                  .map((data) => {
                    const dataValue = Object.values(data)[0];
                    return dataValue.day_data.idle_duration;
                  })
                  .reduce((total, value) => total + value, 0);
                const sec = Number(totalEnergyConsumption);
                const hour = sec / 3600;
                return hour;
              })
            },
            {
              name: "Stopped",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              stack: "Time",
              tooltip: {
                valueFormatter(value) {
                  const minutes = Math.floor(((value * 3600) % 3600) / 60);
                  const hours = Math.floor(value);
                  return `${hours}hr ${minutes}min`;
                }
              },
              itemStyle: {
                color: StoppedTime.main // change this to the color you want
              },
              data: originalMachineData?.map((machine) => {
                const totalEnergyConsumption = machine
                  .map((data) => {
                    const dataValue = Object.values(data)[0];

                    return dataValue.day_data.off_duration;
                  })
                  .reduce((total, value) => total + value, 0);
                const sec = Number(totalEnergyConsumption);
                const hour = sec / 3600;
                return hour;
              })
            }
          ]
        : cummulativeMachineData?.length &&
          Object.keys(Object.values(cummulativeMachineData[indexCount])[0]?.shift_data)
            ?.map((shiftId) => {
              const shiftName = shiftId;
              return [
                {
                  name: "Production",
                  type: "bar",
                  stack: shiftName,
                  tooltip: {
                    valueFormatter(value) {
                      const minutes = Math.floor(((value * 3600) % 3600) / 60);
                      const hours = Math.floor(value);
                      return `${hours}hr ${minutes}min ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: RunTime.main // change this to the color you want
                  },
                  data: originalMachineData.map((machine) => {
                    const totalEnergyConsumption = machine
                      .map((data) => {
                        const dataValue = Object.values(data)[0];
                        const currentShift = Object.keys(dataValue.shift_data)?.find(
                          (machineShiftId) => machineShiftId === shiftId
                        );
                        if (currentShift) {
                          return dataValue.shift_data[currentShift]?.production_duration;
                        }
                        return 0;
                      })
                      .reduce((total = 0, value) => total + value);
                    const sec = Number(totalEnergyConsumption);
                    const hour = sec / 3600;
                    return hour;
                  })
                },
                {
                  name: "Idle",
                  type: "bar",
                  stack: shiftName,
                  tooltip: {
                    valueFormatter(value) {
                      const minutes = Math.floor(((value * 3600) % 3600) / 60);
                      const hours = Math.floor(value);
                      return `${hours}hr ${minutes}min ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: IdleTime.main // change this to the color you want
                  },
                  data: originalMachineData.map((machine) => {
                    const totalEnergyConsumption = machine
                      .map((data) => {
                        const dataValue = Object.values(data)[0];
                        const currentShift = Object.keys(dataValue.shift_data).find(
                          (machineShiftId) => machineShiftId === shiftId
                        );
                        if (currentShift) {
                          return dataValue.shift_data[currentShift]?.idle_duration;
                        }
                        return 0;
                      })
                      .reduce((total = 0, value) => total + value);
                    const sec = Number(totalEnergyConsumption);
                    const hour = sec / 3600;
                    return hour;
                  })
                },
                {
                  name: "Stopped",
                  type: "bar",
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: shiftName,
                      color: "#FFF"
                    }
                  },
                  stack: shiftName,
                  tooltip: {
                    valueFormatter(value) {
                      const minutes = Math.floor(((value * 3600) % 3600) / 60);
                      const hours = Math.floor(value);
                      return `${hours}hr ${minutes}min ${shiftName ?? ""}`;
                    }
                  },
                  itemStyle: {
                    color: StoppedTime.main // change this to the color you want
                  },
                  data: originalMachineData.map((machine) => {
                    const totalEnergyConsumption = machine
                      .map((data) => {
                        const dataValue = Object.values(data)[0];
                        const currentShift = Object.keys(dataValue.shift_data).find(
                          (machineShiftId) => machineShiftId === shiftId
                        );
                        if (currentShift) {
                          return dataValue.shift_data[currentShift]?.off_duration;
                        }
                        return 0;
                      })
                      .reduce((total = 0, value) => total + value);
                    const sec = Number(totalEnergyConsumption);
                    const hour = sec / 3600;
                    return hour;
                  })
                }
              ];
            })
            .flat()
    };
    averageProChart.setOption(AverageProOptions);

    const averageChart = echarts.init(averageChartRef.current);
    const AverageOeeOptions = {
      title: {
        left: "center",
        // text: "Avg. OEE per machine",
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        data: ["OEE", "Performance", "Availability"],
        selected: {
          Availability: false,
          Performance: false,
          OEE: true
        },
        top: 25,
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar", "stack"] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: "category",
          axisTick: {
            alignWithLabel: true
          },
          formatter: (value) => moment(value).format("YYYY-MM-DD"),
          data: originalMachineData?.map(
            (machine) =>
              Object.values(
                Object.values(machine).find((item) => Object.values(item)?.[0]?.name)
              )[0]?.name
          ),
          axisLabel: {
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false // hide the horizontal grid lines
          },
          axisLabel: {
            formatter: (value) => `${Math.trunc(value)} %`,
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      series: isCumulative
        ? [
            {
              name: "OEE",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              barGap: 0,
              tooltip: {
                valueFormatter(value) {
                  return `${Number(value).toFixed(2)}%`;
                }
              },
              itemStyle: {
                color: darkMode ? OEE.dark : OEE.main // change this to the color you want
              },
              data: originalMachineData?.map((machine) => {
                const totalOEE = machine
                  .map((data) => {
                    const dataValue = Object.values(data)[0];
                    return dataValue.day_data.oee;
                  })
                  .reduce((total = 0, value) => total + value);
                return (totalOEE * 100) / machine.length;
              })
            },
            {
              name: "Availability",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              barGap: 0,
              tooltip: {
                valueFormatter(value) {
                  return `${Number(value).toFixed(2)}%`;
                }
              },
              itemStyle: {
                color: darkMode ? Availability.dark : Availability.main // change this to the color you want
              },
              data: originalMachineData?.map((machine) => {
                const totalOEE = machine
                  .map((data) => {
                    const dataValue = Object.values(data)[0];
                    return dataValue.day_data.availability;
                  })
                  .reduce((total = 0, value) => total + value);
                return (totalOEE * 100) / machine.length;
              })
            },
            {
              name: "Performance",
              type: "bar",
              emphasis: {
                focus: "series"
              },
              barGap: 0,
              tooltip: {
                valueFormatter(value) {
                  return `${Number(value).toFixed(2)}%`;
                }
              },
              itemStyle: {
                color: darkMode ? Productivity.dark : Productivity.main // change this to the color you want
              },
              data: originalMachineData?.map((machine) => {
                const totalOEE = machine
                  .map((data) => {
                    const dataValue = Object.values(data)[0];
                    return dataValue.day_data.performance;
                  })
                  .reduce((total = 0, value) => total + value);
                return (totalOEE * 100) / machine.length;
              })
            }
          ]
        : cummulativeMachineData?.length &&
          Object.keys(Object.values(cummulativeMachineData[indexCount])[0]?.shift_data)
            ?.map((shiftId) => {
              const shiftName = shiftId;
              return [
                {
                  name: "OEE",
                  type: "bar",
                  tooltip: {
                    valueFormatter(value) {
                      return `${Number(value).toFixed(2)}%`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? OEE.dark : OEE.main // change this to the color you want
                  },
                  barGap: 0,
                  data: originalMachineData.map((machine) => {
                    const totalOEE = machine
                      .map((data) => {
                        const dataValue = Object.values(data)[0];
                        const currentShift = Object.keys(dataValue.shift_data).find(
                          (machineShiftId) => machineShiftId === shiftId
                        );
                        if (currentShift) {
                          return dataValue.shift_data[currentShift]?.oee;
                        }
                        return 0;
                      })
                      .reduce((total = 0, value) => total + value);
                    return (totalOEE * 100) / machine.length;
                  }),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: shiftName,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "Availability",
                  type: "bar",
                  tooltip: {
                    valueFormatter(value) {
                      return `${Number(value).toFixed(2)}%`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? Availability.dark : Availability.main // change this to the color you want
                  },
                  barGap: 0,
                  data: originalMachineData.map((machine) => {
                    const totalOEE = machine
                      .map((data) => {
                        const dataValue = Object.values(data)[0];
                        const currentShift = Object.keys(dataValue.shift_data).find(
                          (machineShiftId) => machineShiftId === shiftId
                        );
                        if (currentShift) {
                          return dataValue.shift_data[currentShift]?.availability;
                        }
                        return 0;
                      })
                      .reduce((total = 0, value) => total + value);
                    return (totalOEE * 100) / machine.length;
                  }),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: shiftName,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "Performance",
                  type: "bar",
                  tooltip: {
                    valueFormatter(value) {
                      return `${Number(value).toFixed(2)}%`;
                    }
                  },
                  barGap: 0,
                  itemStyle: {
                    color: darkMode ? Productivity.dark : Productivity.main // change this to the color you want
                  },
                  data: originalMachineData.map((machine) => {
                    const totalOEE = machine
                      .map((data) => {
                        const dataValue = Object.values(data)[0];
                        const currentShift = Object.keys(dataValue.shift_data).find(
                          (machineShiftId) => machineShiftId === shiftId
                        );
                        if (currentShift) {
                          return dataValue.shift_data[currentShift]?.performance;
                        }
                        return 0;
                      })
                      .reduce((total = 0, value) => total + value);
                    return (totalOEE * 100) / machine.length;
                  }),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: shiftName,
                      color: "#FFF"
                    }
                  }
                }
              ];
            })
            .flat()
    };
    averageChart.setOption(AverageOeeOptions);

    const totalChart = echarts.init(totalChartRef.current);
    const TotalEnergyOptions = {
      title: {
        left: "center",
        // text: "",
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        data: ["Energy consumption", "Energy wastage"],
        top: 25,
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar", "stack"] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: "category",
          axisTick: {
            alignWithLabel: true
          },
          formatter: (value) => moment(value).format("YYYY-MM-DD"),
          axisLabel: {
            color: darkMode ? "#ffffffcc" : "#7B809A"
          },
          data: originalMachineData?.map(
            (machine) =>
              Object.values(
                Object.values(machine).find((item) => Object.values(item)?.[0]?.name)
              )[0]?.name
          )
        }
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false // hide the horizontal grid lines
          },
          axisLabel: {
            formatter: "{value} kWh",
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      series: isCumulative
        ? [
            {
              name: "Energy consumption",
              type: "bar",
              barGap: 0,
              emphasis: {
                focus: "series"
              },
              tooltip: {
                valueFormatter(value) {
                  return `${Number(value).toFixed(2)}kWh`;
                }
              },
              itemStyle: {
                color: darkMode ? EnergyConsumption.dark : EnergyConsumption.main // change this to the color you want
              },
              data: originalMachineData?.map((machine) => {
                const totalEnergyConsumption = machine
                  .map((data) => {
                    const dataValue = Object.values(data)[0];
                    return dataValue.day_data.energy_consumption;
                  })
                  .reduce((total, value) => total + value, 0);
                return totalEnergyConsumption;
              })
            },
            {
              name: "Energy wastage",
              type: "bar",
              barGap: 0,
              emphasis: {
                focus: "series"
              },
              tooltip: {
                valueFormatter(value) {
                  return `${Number(value).toFixed(2)}kWh`;
                }
              },
              itemStyle: {
                color: darkMode ? EnergyWastage.dark : EnergyWastage.main // change this to the color you want
              },
              data: originalMachineData?.map((machine) => {
                const totalEnergyConsumption = machine
                  .map((data) => {
                    const dataValue = Object.values(data)[0];
                    return dataValue.day_data.energy_wastage;
                  })
                  .reduce((total, value) => total + value, 0);
                return totalEnergyConsumption;
              })
            }
          ]
        : cummulativeMachineData?.length &&
          Object.keys(Object.values(cummulativeMachineData[indexCount])[0]?.shift_data)
            ?.map((shiftId) => {
              const shiftName = shiftId;
              return [
                {
                  name: "Energy consumption",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    valueFormatter(value) {
                      return `${Number(value).toFixed(2)} kWh ${shiftName}`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? EnergyConsumption.dark : EnergyConsumption.main // change this to the color you want
                  },
                  data: originalMachineData.map((machine) => {
                    const totalEnergyConsumption = machine
                      .map((data) => {
                        const dataValue = Object.values(data)[0];
                        const currentShift = Object.keys(dataValue.shift_data)?.find(
                          (machineShiftId) => machineShiftId === shiftId
                        );
                        if (currentShift) {
                          return dataValue.shift_data[currentShift]?.energy_consumption;
                        }
                        return 0;
                      })
                      .reduce((total = 0, value) => total + value);
                    return totalEnergyConsumption;
                  }),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: shiftName,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "Energy wastage",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    valueFormatter(value) {
                      return `${Number(value).toFixed(2)} kWh ${shiftName}`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? EnergyWastage.dark : EnergyWastage.main // change this to the color you want
                  },
                  data: originalMachineData.map((machine) => {
                    const totalEnergyConsumption = machine
                      .map((data) => {
                        const dataValue = Object.values(data)[0];
                        const currentShift = Object.keys(dataValue.shift_data).find(
                          (machineShiftId) => machineShiftId === shiftId
                        );
                        if (currentShift) {
                          return dataValue.shift_data[currentShift]?.energy_wastage;
                        }
                        return 0;
                      })
                      .reduce((total = 0, value) => total + value);
                    return totalEnergyConsumption;
                  }),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: shiftName,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    show: false
                  },
                  barWidth: "5%",
                  itemStyle: {
                    color: "#FFFFFF" // change this to the color you want
                  },
                  data: cummulativeMachineData.map(() => 0)
                }
              ];
            })
            .flat()
    };
    totalChart.setOption(TotalEnergyOptions);

    return () => {
      energyChart.dispose();
      averageProChart.dispose();
      oeeChart.dispose();
      timeChart.dispose();
      averageChart.dispose();
      totalChart.dispose();
    };
  }, [selectedMachinesData]);

  const { data: hallList = [] } = useQuery([enumQueryNames.HALL_LIST], () =>
    getHallListApi(axiosPrivate)
  );

  const options = hallList
    ?.map((option) =>
      option?.machine_list?.map((machine) => ({
        firstLetter: option.name,
        hallId: option.id,
        id: machine.id,
        name: machine.name
      }))
    )
    .flat();

  const handleSetTabValue = (event, newValue) => {
    setIsCumulative(newValue !== 1);
    setTabValue(newValue);
  };

  const handleSetTabDataValue = (event, newValue) => {
    setTabDataValue(newValue);
    if (newValue === 0) {
      refetch();
    } else if (newValue === 1) {
      fetchWeeks();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container mb={3} spacing={2} alignItems="center">
        <Grid item md={6} sm={12} xs={12} pr={2}>
          <Autocomplete
            value={selectedMachines}
            multiple
            id="grouped-demo"
            options={options?.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter)) || []}
            groupBy={(option) => option.firstLetter}
            getOptionLabel={(option) => option.name}
            disableCloseOnSelect
            limitTags={2}
            renderTags={(value, getTagProps) =>
              selectedMachines.map((option, index) => (
                <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => <TextField {...params} label="Machines" />}
            renderGroup={(params) => (
              <li key={params.key}>
                <Typography style={{ color: "#FFFFFF" }}>{params.group}</Typography>
                {params.children}
              </li>
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selectedMachines.find((selOpt) => selOpt.id === option.id)}
                />
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    e.stopPropagation();
                  }}
                >
                  {option.name}
                </span>
              </li>
            )}
            onChange={(event, newValue) => {
              const multipleItems = newValue.filter(
                (item) => item.id === newValue[newValue.length - 1].id
              );
              if (multipleItems.length > 1) {
                setSelectedMachines(newValue.filter((item) => item.id !== multipleItems[0].id));
              } else {
                setSelectedMachines(newValue);
              }
            }}
          />
        </Grid>
        <Grid item md={6} sm={12} xs={12} pr={2}>
          <MDBox sx={{ display: "flex", alignItems: "center" }}>
            <RangePicker
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              // rangeChange={(newValue) => {
              //   setStartDate(newValue?.startDate ?? null)
              //   setEndDate(newValue?.endDate ?? null)
              // }}
            />
          </MDBox>
        </Grid>
        {/* <Grid
          item
          lg={3}
          md={4}
          sm={6}
          xs={12}
          pr={2}
          justifyContent="center"
          display="flex"
          alignItems="center"
          height="fit-content"
        >
          <MDTypography color="text" fontWeight="medium" fontSize="1rem">
            Per-shift
          </MDTypography>
          <Switch checked={isCumulative} onChange={() => setIsCumulative(!isCumulative)} />
          <MDTypography color="text" fontWeight="medium" fontSize="1rem">
            Per-day
          </MDTypography>
        </Grid> */}
        <Grid
          item
          md={12}
          sm={12}
          xs={12}
          justifyContent="center"
          display="flex"
          height="fit-content"
        >
          <MDButton
            variant="gradient"
            color="info"
            onClick={applyFilterHandler}
            sx={{
              mx: 1
            }}
          >
            {translate("Generate report")}
          </MDButton>
        </Grid>
      </Grid>
      <div ref={averageProductionChartRef} style={{ visibility: "hidden" }} />
      <div ref={energyChartRef} style={{ visibility: "hidden" }} />
      <div ref={oeeChartRef} style={{ visibility: "hidden" }} />
      <div ref={timeChartRef} style={{ visibility: "hidden" }} />
      <div ref={averageChartRef} style={{ visibility: "hidden" }} />
      <div ref={totalChartRef} style={{ visibility: "hidden" }} />
      {machinesDataFetching ? (
        <>
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
        </>
      ) : (
        selectedMachinesData.length > 0 && (
          <>
            <Grid container justifyContent={smDown ? "center" : "space-between"} spacing={3}>
              <Grid item spacing={3} display="flex" justifyContent="center" alignItems="center">
                <AppBar position="static">
                  <Tabs
                    orientation="horizontal"
                    value={tabValue}
                    onChange={handleSetTabValue}
                    TabIndicatorProps={{
                      style: {
                        backgroundColor: colors.info.main
                      }
                    }}
                  >
                    <Tab label={translate("All Day")} key={0} sx={{ padding: "5px 14px" }} />
                    <Tab label={translate("Planned")} key={1} sx={{ padding: "5px 14px" }} />
                  </Tabs>
                </AppBar>
              </Grid>
              <Grid
                item
                spacing={3}
                display="flex"
                justifyContent="center"
                alignItems="center"
                style={{ marginRight: "16px" }}
              >
                <Tooltip title={translate("selectedTabs")}>
                  <Icon style={{ color: "white", marginRight: "10px" }}>info</Icon>
                </Tooltip>
                <AppBar position="static">
                  <Tabs
                    orientation="horizontal"
                    value={tabDataValue}
                    onChange={handleSetTabDataValue}
                    TabIndicatorProps={{
                      style: {
                        backgroundColor: colors.info.main
                      }
                    }}
                  >
                    <Tab label={translate("Day")} key={0} sx={{ padding: "5px 14px" }} />
                    <Tab label={translate("Week")} key={1} sx={{ padding: "5px 14px" }} />
                  </Tabs>
                </AppBar>
              </Grid>
            </Grid>
            <MDCard sx={{ margin: "10px 0", padding: "10px", overflowX: "auto" }}>
              <MDTypography sx={{ textAlign: "center" }}>
                {translate("Daily OEE, Performance & Availability")}
              </MDTypography>
              <div
                ref={oeeChartRef}
                style={{ width: "100%", height: "400px", minWidth: "668px" }}
              />
            </MDCard>
            <MDCard sx={{ margin: "10px 0", padding: "10px", overflowX: "auto" }}>
              <MDTypography sx={{ textAlign: "center" }}>
                {translate("Time Analysis (Prod/Idle/Stop)")}
              </MDTypography>
              <div
                ref={timeChartRef}
                style={{ width: "100%", height: "400px", minWidth: "668px" }}
              />
            </MDCard>
            <MDCard sx={{ margin: "10px 0", padding: "10px", overflowX: "auto" }}>
              <MDTypography sx={{ textAlign: "center" }}>
                {translate("Daily Energy Consumption & Waste")}
              </MDTypography>
              <div
                ref={energyChartRef}
                style={{ width: "100%", height: "400px", minWidth: "668px" }}
              />
            </MDCard>
            <MDCard sx={{ margin: "10px 0", padding: "10px", overflowX: "auto" }}>
              <MDTypography sx={{ textAlign: "center" }}>
                {translate("Avg. OEE, Performance & Availability by Machine")}
              </MDTypography>
              <div
                ref={averageChartRef}
                style={{ width: "100%", height: "400px", minWidth: "668px" }}
              />
            </MDCard>
            <MDCard sx={{ margin: "10px 0", padding: "10px", overflowX: "auto" }}>
              <MDTypography sx={{ textAlign: "center" }}>
                {translate("Production Times by Machine")}
              </MDTypography>
              <div
                ref={averageProductionChartRef}
                style={{ width: "100%", height: "400px", minWidth: "668px" }}
              />
            </MDCard>
            <MDCard sx={{ margin: "10px 0", padding: "10px", overflowX: "auto" }}>
              <MDTypography sx={{ textAlign: "center" }}>
                {translate("Energy Consumption & Waste by Machine")}
              </MDTypography>
              <div
                ref={totalChartRef}
                style={{ width: "100%", height: "400px", minWidth: "668px" }}
              />
            </MDCard>
          </>
        )
      )}
      <MDSnackbar
        color="error"
        icon="check"
        title="Error"
        content={successSB}
        open={!!successSB}
        onClose={closeSuccessSB}
        close={closeSuccessSB}
        bgWhite
      />
    </DashboardLayout>
  );
}

export default Analysis;
