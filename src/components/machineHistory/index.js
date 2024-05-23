/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import {
  AppBar,
  Grid,
  Icon,
  Skeleton,
  Tab,
  Tabs,
  Tooltip,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { enumQueryNames } from "api/reactQueryConstant";
import { getOeeCalculationDaysApi } from "api/watchmenApi";
import anomalySvg from "assets/images/anomaly.svg";
import cyclesSvg from "assets/images/cycles.svg";
import energyConsumptionSvg from "assets/images/energy_consumption.svg";
import energyWastageSvg from "assets/images/energy_wastage.svg";
import colors from "assets/theme-dark/base/colors";
import ComplexStatisticsCard from "components/Cards/StatisticsCards/ComplexStatisticsCard";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDCard from "components/MDCard";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import ReactEcharts from "echarts-for-react";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import RangePicker from "layouts/dashboards/machineShifts/rangepicker";
import moment from "moment";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { convertHMS } from "utils/constants";
import LabeledProgress from "../labeledProgress";

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

export const useStyle = () => ({
  skeleton: {
    transform: "unset",
    margin: "1% 0"
  }
});

const index = () => {
  const [startDate, setStartDate] = useState(moment().subtract(1, "month"));
  const [endDate, setEndDate] = useState(moment());
  const [machineHistoryV2, setMachineHistoryV2] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [runtimeData, setRunTimeData] = useState(null);
  const [powerData, setPowerData] = useState(null);
  const { axiosPrivate } = useAxiosPrivate();
  const { machineId } = useParams();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [tabValue, setTabValue] = useState(0);
  const [tabMonthValue, setTabMonthValue] = useState(1);
  const [ratings, setRatings] = useState({});
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const classes = useStyle();

  const { isFetching, refetch } = useQuery(
    [enumQueryNames.CALCULATION_DETAILS],
    () =>
      getOeeCalculationDaysApi(axiosPrivate, {
        machine_list: [+machineId],
        end_date: moment(endDate).format("YYYY-MM-DD"),
        start_date: moment(startDate).format("YYYY-MM-DD"),
        // anomalies: true,
        // cycles: true,
        energy_data: true
      }),
    {
      enabled: false,
      onSuccess: (machineHistory) => {
        setRatings(machineHistory[startDate.format("YYYY-MM-DD")]?.[machineId]?.ratings);
        const mappdeMachineHistory = [];
        const mappdeMachineData = [];
        for (const key in machineHistory) {
          mappdeMachineHistory.push({ [key]: machineHistory[key][machineId] });
          mappdeMachineData.push({ ...machineHistory[key][machineId].shift_data });
        }
        setMachineHistoryV2(mappdeMachineHistory);
      }
    }
  );

  useEffect(() => {
    if (endDate !== null) {
      refetch();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (machineHistoryV2) {
      const dataV2 = machineHistoryV2;

      const dateRangeV2 = dataV2.map((machineDayData) => {
        const date = Object.keys(machineDayData)[0];
        const currdate = date.split("-");
        return new Date(`${currdate[1]}-${currdate[2]}-${currdate[0]}`);
      });

      const availabilityV2 = {
        x: dateRangeV2,
        y: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          if (tabValue) {
            const shiftData = Object.values(shift_data)[tabValue - 1];
            return shiftData?.availability ? (shiftData.availability * 100)?.toFixed(2) : 0;
          }
          return day_data?.availability ? (day_data.availability * 100)?.toFixed(2) : 0;
        }),
        name: "Availability",
        type: "bar",
        marker: {
          color: "#58ddbf"
        }
      };

      const oeeV2 = {
        x: dateRangeV2,
        y: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          if (tabValue) {
            const shiftData = Object.values(shift_data)[tabValue - 1];
            return shiftData?.oee ? (shiftData.oee * 100)?.toFixed(2) : 0;
          }
          return day_data?.oee ? (day_data.oee * 100)?.toFixed(2) : 0;
        }),
        name: "OEE",
        type: "bar",
        marker: {
          color: "#59c185"
        }
      };

      const performanceV2 = {
        x: dateRangeV2,
        y: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          if (tabValue) {
            const shiftData = Object.values(shift_data)[tabValue - 1];
            return shiftData?.performance ? (shiftData.performance * 100)?.toFixed(2) : 0;
          }
          return day_data.performance ? (day_data.performance * 100)?.toFixed(2) : 0;
        }),
        name: "Performance",
        type: "bar",
        marker: {
          color: "#59a9dc"
        }
      };

      const runtimeV2 = {
        x: dateRangeV2,
        y: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          let data = day_data;
          if (tabValue) {
            data = Object.values(shift_data)[tabValue - 1];
          }
          const hours = (data?.production_duration || 0) / 3600;
          return hours.toFixed(2);
        }),
        name: "Productiontime",
        type: "bar",
        text: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          let data = day_data;
          if (tabValue) {
            data = Object.values(shift_data)[tabValue - 1];
          }
          const hours = Math.floor((data?.production_duration || 0) / 3600);
          const minutes = Math.floor(((data?.production_duration || 0) % 3600) / 60);
          return `${hours}hr ${minutes}min`;
        }),
        hoverinfo: "text",
        marker: {
          color: "#59a9dc"
        }
      };

      const idletimeV2 = {
        x: dateRangeV2,
        y: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          let data = day_data;
          if (tabValue) {
            data = Object.values(shift_data)[tabValue - 1];
          }
          const hours = (data?.idle_duration || 0) / 3600;
          return hours.toFixed(2);
        }),
        name: "Idletime",
        type: "bar",
        text: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          let data = day_data;
          if (tabValue) {
            data = Object.values(shift_data)[tabValue - 1];
          }
          const hours = Math.floor((data?.idle_duration || 0) / 3600);
          const minutes = Math.floor(((data?.idle_duration || 0) % 3600) / 60);
          return `${hours}hr ${minutes}min`;
        }),
        hoverinfo: "text",
        marker: {
          color: "#59a9dc"
        }
      };

      const offtimeV2 = {
        x: dateRangeV2,
        y: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          let data = day_data;
          if (tabValue) {
            data = Object.values(shift_data)[tabValue - 1];
          }
          const hours = (data?.off_duration || 0) / 3600;
          return hours.toFixed(2);
        }),
        name: "Offtime",
        type: "bar",
        text: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          let data = day_data;
          if (tabValue) {
            data = Object.values(shift_data)[tabValue - 1];
          }
          const hours = Math.floor((data?.off_duration || 0) / 3600);
          const minutes = Math.floor(((data?.off_duration || 0) % 3600) / 60);
          return `${hours}hr ${minutes}min`;
        }),
        hoverinfo: "text",
        marker: {
          color: "#59a9dc"
        }
      };

      const powerComsumptionV2 = {
        x: dateRangeV2,
        y: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          let data = day_data;
          if (tabValue) {
            data = Object.values(shift_data)[tabValue - 1];
          }
          return data?.energy_consumption;
        }),
        name: "Offtime",
        type: "bar",
        hoverinfo: "text",
        marker: {
          color: "#59a9dc"
        }
      };

      const powerWasteV2 = {
        x: dateRangeV2,
        y: dataV2.map((machineDayData) => {
          const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
            day_data: 0,
            shift_data: 0
          };
          let data = day_data;
          if (tabValue) {
            data = Object.values(shift_data)[tabValue - 1];
          }
          return data?.energy_wastage;
        }),
        name: "Offtime",
        type: "bar",
        hoverinfo: "text",
        marker: {
          color: "#59a9dc"
        }
      };
      // eslint-disable-next-line no-shadow
      const graphData = [availabilityV2, oeeV2, performanceV2];
      setGraphData(graphData);
      setRunTimeData([runtimeV2, idletimeV2, offtimeV2]);
      setPowerData([powerComsumptionV2, powerWasteV2]);
    }
  }, [machineHistoryV2, tabValue]);

  const OeeAvailabilityPerformannce = {
    title: {
      left: "center",
      text: "",
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
      data: ["Availability", "Performance", "OEE"],
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
    dataZoom: [
      {
        type: "slider",
        xAxisIndex: 0,
        filterMode: "weakFilter",
        height: 20,
        bottom: 5,
        start: 0,
        handleIcon:
          "path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "80%",
        showDetail: false
      }
    ],
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
        formatter: (value) => moment(value).format("MMM DD"),
        data: graphData ? graphData[0]?.x.map((data) => moment(data).format("MMM DD")) : []
      }
    ],
    yAxis: [
      {
        type: "value",
        alignTicks: true,
        splitLine: {
          show: false // hide the horizontal grid lines
        },
        min: 0,
        max: 100,
        axisLabel: {
          formatter: (value) => `${Math.trunc(value)} %`,
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      }
    ],
    series: [
      {
        name: "Availability",
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series"
        },
        itemStyle: {
          color: darkMode ? Availability.dark : Availability.main // change this to the color you want
        },
        data: graphData ? graphData[0]?.y : [],
        tooltip: {
          valueFormatter(value) {
            return `${Number(value || 0).toFixed(2)}%`;
          }
        }
      },
      {
        name: "Performance",
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series"
        },
        itemStyle: {
          color: darkMode ? Productivity.main : Productivity.main // change this to the color you want
        },
        data: graphData ? graphData[2]?.y : [],
        tooltip: {
          valueFormatter(value) {
            return `${Number(value).toFixed(2) || 0}%`;
          }
        },
        markLine: {
          data: [
            {
              type: "average",
              name: "Avg",
              // yAxis: graphData ? calculateTotalExcludingWeekends(graphData[1]) : ""
              yAxis: ratings?.performance ? ratings.performance * 100 : 0
            }
          ],
          label: {
            formatter: "{c}%",
            color: "#FFF"
          }
        }
      },
      {
        name: "OEE",
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series"
        },
        itemStyle: {
          color: darkMode ? OEE.dark : OEE.main // change this to the color you want
        },
        data: graphData ? graphData[1]?.y : [],
        tooltip: {
          valueFormatter(value) {
            return `${Number(value || 0).toFixed(2) || 0}%`;
          }
        },
        markPoint: {
          data: [{ type: "max", name: "Max" }],
          label: {
            formatter: "{c}%"
          }
        },
        markLine: {
          data: [
            {
              type: "average",
              name: "Avg",
              // yAxis: graphData ? calculateTotalExcludingWeekends(graphData[1]) : ""
              yAxis: ratings?.oee ? ratings.oee * 100 : 0
            }
          ],
          label: {
            formatter: "{c}%",
            color: "#FFF"
          }
        }
      }
    ]
  };

  const MachineTimes = {
    title: {
      left: "center",
      text: "",
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
      data: ["Productiontime", "Idletime", "Offtime"],
      top: 25,
      textStyle: {
        color: darkMode ? "#ffffffcc" : "#7B809A"
      }
    },
    dataZoom: [
      {
        type: "slider",
        xAxisIndex: 0,
        filterMode: "weakFilter",
        height: 20,
        bottom: 5,
        start: 0,
        handleIcon:
          "path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "80%",
        showDetail: false
      }
    ],
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
        formatter: (value) => moment(value).format("MMM DD"),
        data: graphData ? graphData[0]?.x.map((data) => moment(data).format("MMM DD")) : []
      }
    ],
    yAxis: [
      {
        type: "value",
        alignTicks: true,
        axisLabel: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        },
        axisLine: {
          show: true
        },
        splitLine: {
          show: false // hide the horizontal grid lines
        }
      }
    ],
    series: [
      {
        name: "Productiontime",
        type: "bar",
        barGap: 0,
        stack: "Time",
        emphasis: {
          focus: "series"
        },
        itemStyle: {
          color: RunTime.main // change this to the color you want
        },
        tooltip: {
          valueFormatter(value) {
            const n = new Date(0, 0);
            n.setSeconds(+value * 60 * 60);
            return value !== "24.00"
              ? n.toTimeString().slice(0, 8)
              : `${value.split(".")[0]}:00:00`;
          }
        },
        data: runtimeData ? runtimeData[0]?.y : []
      },
      {
        name: "Idletime",
        type: "bar",
        barGap: 0,
        stack: "Time",
        emphasis: {
          focus: "series"
        },
        itemStyle: {
          color: IdleTime.main // change this to the color you want
        },
        tooltip: {
          valueFormatter(value) {
            const n = new Date(0, 0);
            n.setSeconds(+value * 60 * 60);
            return value !== "24.00"
              ? n.toTimeString().slice(0, 8)
              : `${value.split(".")[0]}:00:00`;
          }
        },
        data: runtimeData ? runtimeData[1]?.y : []
      },
      {
        name: "Offtime",
        type: "bar",
        barGap: 0,
        stack: "Time",
        emphasis: {
          focus: "series"
        },
        tooltip: {
          valueFormatter(value) {
            const n = new Date(0, 0);
            n.setSeconds(+value * 60 * 60);
            return value !== "24.00"
              ? n.toTimeString().slice(0, 8)
              : `${value.split(".")[0]}:00:00`;
          }
        },
        itemStyle: {
          color: StoppedTime.main // change this to the color you want
        },
        data: runtimeData ? runtimeData[2]?.y : []
      }
    ]
  };

  const MachinePower = {
    title: {
      left: "center",
      text: "",
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
    dataZoom: [
      {
        type: "slider",
        xAxisIndex: 0,
        filterMode: "weakFilter",
        height: 20,
        bottom: 5,
        start: 0,
        handleIcon:
          "path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "80%",
        showDetail: false
      }
    ],
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
        formatter: (value) => moment(value).format("MMM DD"),
        data: powerData ? powerData[0]?.x.map((data) => moment(data).format("MMM DD")) : []
      }
    ],
    yAxis: [
      {
        type: "value",
        alignTicks: true,
        axisLabel: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        },
        axisLine: {
          show: true
        },
        splitLine: {
          show: false // hide the horizontal grid lines
        }
      }
    ],
    series: [
      {
        name: "Energy consumption",
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series"
        },
        itemStyle: {
          color: darkMode ? EnergyConsumption.dark : EnergyConsumption.main // change this to the color you want
        },
        data: powerData ? powerData[0]?.y : [],
        tooltip: {
          valueFormatter(value) {
            return `${value || 0} kWh`;
          }
        },
        markLine: {
          data: [
            {
              type: "average",
              name: "Avg",
              // yAxis: graphData ? calculateTotalExcludingWeekends(graphData[1]) : ""
              yAxis: ratings?.energy_consumption || 0
            }
          ],
          label: {
            formatter: "{c}kWh",
            color: "#FFF"
          }
        }
      },
      {
        name: "Energy wastage",
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series"
        },
        itemStyle: {
          color: darkMode ? EnergyWastage.dark : EnergyWastage.main // change this to the color you want
        },
        data: powerData ? powerData[1]?.y : [],
        tooltip: {
          valueFormatter(value) {
            return `${value || 0} kWh`;
          }
        },
        markLine: {
          data: [
            {
              type: "average",
              name: "Avg",
              // yAxis: graphData ? calculateTotalExcludingWeekends(graphData[1]) : ""
              yAxis: ratings?.energy_wastage || 0
            }
          ],
          label: {
            formatter: "{c}kWh",
            color: "#FFF"
          }
        }
      }
    ]
  };

  useEffect(() => {
    setTabValue(0);
  }, [machineId]);

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSetTabMonthValue = (event, newValue) => {
    if (newValue === 0) {
      setStartDate(moment().subtract(6, "days"));
    } else if (newValue === 1) {
      setStartDate(moment().subtract(1, "month"));
    } else if (newValue === 2) {
      setStartDate(moment().subtract(3, "month"));
    }
    setTabMonthValue(newValue);
    setEndDate(moment());
  };

  const totalRatingData = (key) => {
    const total = machineHistoryV2
      ?.map((machineDayData) => {
        const { ratings } = Object.values(machineDayData)?.[0] || { ratings: 0 };
        if (tabValue) {
          return ratings?.[key] ? Number(ratings?.[key]) : 0;
        }
        return ratings?.[key] ? Number(ratings?.[key]) : 0;
      })
      .reduce((sum, diff) => sum + diff, 0)
      .toFixed(2);
    return key === "oee" || key === "performance" ? total / machineHistoryV2.length : total;
  };
  const totalShiftData = (key) => {
    const total = machineHistoryV2
      ?.map((machineDayData) => {
        const { day_data, shift_data } = Object.values(machineDayData)?.[0] || {
          day_data: 0,
          shift_data: 0
        };
        if (tabValue) {
          const shiftData = Object.values(shift_data)?.[tabValue - 1];
          return shiftData?.[key] ? Number(shiftData?.[key]) : 0;
        }
        return day_data?.[key] || 0;
      })
      .reduce((sum, diff) => sum + diff, 0);
    return key === "oee" || key === "performance" || key === "availability"
      ? key === "performance" && (total / machineHistoryV2.length) * 100 > 100
        ? 1
        : total / machineHistoryV2.length
      : total;
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container justifyContent={smDown ? "center" : "space-between"} spacing={2}>
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
              <Tab label={translate("All Shifts")} sx={{ padding: "3px 14px" }} />
              {machineHistoryV2?.length &&
                Object.keys(Object.values(machineHistoryV2[0])[0]?.shift_data || {}).map(
                  (shift) => <Tab label={translate(shift)} key={shift} sx={{ padding: "0 14px" }} />
                )}
            </Tabs>
          </AppBar>
          <Tooltip title={translate("selectedTabs")}>
            <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
          </Tooltip>
        </Grid>
        <Grid
          item
          display="flex"
          flexDirection={smDown ? "column" : "row"}
          justifyContent="center"
          alignItems="center"
        >
          <MDBox
            sx={{ display: "flex", justifyContent: "end", alignItems: "center", width: "250px" }}
            textAlign="center"
          >
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
          <Grid item spacing={3} ml={2}>
            <Tabs
              orientation="horizontal"
              value={tabMonthValue}
              onChange={handleSetTabMonthValue}
              TabIndicatorProps={{
                style: {
                  backgroundColor: colors.info.main
                }
              }}
            >
              <Tab label="1W" key="days" sx={{ padding: "3px 14px" }} />
              <Tab label="1M" key="month" sx={{ padding: "0 14px" }} />
              <Tab label="3M" key="months" sx={{ padding: "0 14px" }} />
            </Tabs>
          </Grid>
        </Grid>
      </Grid>
      <Grid container display="flex" alignItems="center" justifyContent="center" my={5}>
        <Grid
          item
          sm={12}
          md={4}
          lg={6}
          display="flex"
          justifyContent="center"
          alignContent="center"
        >
          {machineHistoryV2 ? (
            <LabeledProgress
              size={90}
              tooltipTitle={`OEE compared to machine rating ${(
                (totalRatingData("oee") || 0) * 100
              ).toFixed(1)}%`}
              tooltipTitlePer={`Performance compared to machine rating ${(
                (totalRatingData("performance") || 0) * 100
              ).toFixed(2)}%`}
              machineStatusData={{
                oee: totalShiftData("oee"),
                performance: totalShiftData("performance"),
                availability: totalShiftData("availability")
              }}
              overallRating={totalRatingData("oee") || 0}
              overallPerformance={totalRatingData("performance") || 0}
            />
          ) : (
            <Skeleton variant="circular" height={200} width={200} sx={classes.skeleton} />
          )}
        </Grid>
        <Grid item xs={12} lg={6}>
          {machineHistoryV2 ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <ComplexStatisticsCard
                  title="Energy consumption"
                  count={totalShiftData("energy_consumption").toFixed(2) || 0}
                  unit="kWh"
                  image={energyConsumptionSvg}
                  color={darkMode ? EnergyConsumption.dark : EnergyConsumption.main}
                  tooltip="Energy consumption"
                  tooltipTitle={`Compared to machine rating ${totalShiftData(
                    "rating_energy_consumption"
                  ).toFixed(2)} kWh`}
                  overallRating={totalShiftData("rating_energy_consumption").toFixed(2) || 0}
                  currentRating={totalShiftData("energy_consumption").toFixed(2) || 0}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <ComplexStatisticsCard
                  title="Energy wastage"
                  count={totalShiftData("energy_wastage").toFixed(2) || 0}
                  unit="kWh"
                  image={energyWastageSvg}
                  color={darkMode ? EnergyWastage.dark : EnergyWastage.main}
                  tooltip="Energy wastage"
                  tooltipTitle={`Compared to machine rating ${totalShiftData(
                    "rating_energy_wastage"
                  ).toFixed(2)} kWh`}
                  overallRating={totalShiftData("rating_energy_wastage").toFixed(2) || 0}
                  currentRating={totalShiftData("energy_wastage").toFixed(2) || 0}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6} mt={2}>
                <ComplexStatisticsCard
                  title="Cycles"
                  count={0}
                  image={cyclesSvg}
                  tooltip="Cycles"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6} mt={2}>
                <ComplexStatisticsCard
                  title="Anomalies"
                  count={0}
                  image={anomalySvg}
                  tooltip="Anomalies"
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={6} height={100}>
                <Skeleton height={100} />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} height={100}>
                <Skeleton height={100} />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} height={100}>
                <Skeleton height={100} />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} height={100}>
                <Skeleton height={100} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid container spacing={3} mt={2}>
        {/* {machineData?.machine?.settings?.card_productiontime && */}
        <Grid item xs={6} md={4} lg={3}>
          {machineHistoryV2 ? (
            <Tooltip title={translate("Total Production time")}>
              <MDCard bgColor={RunTime.main}>
                <MDBox
                  fontSize={smDown ? "1.50rem" : "2.25rem"}
                  sx={classes.cardProductionTime}
                  borderRadius="xl"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                >
                  <MDTypography
                    variant="v4"
                    fontWeight="bold"
                    color="text"
                    textTransform="capitalize"
                  >
                    {machineHistoryV2
                      ? convertHMS(
                          new Date(Math.floor(totalShiftData("production_duration"))).getTime()
                        )
                      : "00:00:00"}
                  </MDTypography>
                  <MDTypography fontSize="0.7rem">hh:mm:ss</MDTypography>
                </MDBox>
              </MDCard>
            </Tooltip>
          ) : (
            <Skeleton height={100} width="100%" sx={classes.skeleton} />
          )}
        </Grid>
        {/* } */}
        {/* {machineData?.machine?.settings?.card_idletime && */}
        <Grid item xs={6} md={4} lg={3}>
          {machineHistoryV2 ? (
            <Tooltip title={translate("Total Idle time")}>
              <MDCard bgColor={IdleTime.main}>
                <MDBox
                  sx={classes.cardIdleTime}
                  fontSize={smDown ? "1.50rem" : "2.25rem"}
                  borderRadius="xl"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                >
                  <MDTypography
                    variant="v4"
                    fontWeight="bold"
                    color="text"
                    textTransform="capitalize"
                  >
                    {machineHistoryV2
                      ? convertHMS(new Date(Math.floor(totalShiftData("idle_duration"))).getTime())
                      : "00:00:00"}
                  </MDTypography>
                  <MDTypography fontSize="0.7rem">hh:mm:ss</MDTypography>
                </MDBox>
              </MDCard>
            </Tooltip>
          ) : (
            <Skeleton height={100} width="100%" sx={classes.skeleton} />
          )}
        </Grid>
        {/* } */}
        {/* {machineData?.machine?.settings?.card_offtime && */}
        <Grid item xs={6} md={4} lg={3}>
          {machineHistoryV2 ? (
            <Tooltip title={translate("Total Off time")}>
              <MDCard bgColor={StoppedTime.main}>
                <MDBox
                  sx={classes.cardOffTime}
                  fontSize={smDown ? "1.50rem" : "2.25rem"}
                  borderRadius="xl"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                >
                  <MDTypography
                    variant="v4"
                    fontWeight="bold"
                    color="text"
                    textTransform="capitalize"
                  >
                    {machineHistoryV2
                      ? convertHMS(new Date(Math.floor(totalShiftData("off_duration"))).getTime())
                      : "00:00:00"}
                  </MDTypography>
                  <MDTypography fontSize="0.7rem">hh:mm:ss</MDTypography>
                </MDBox>
              </MDCard>
            </Tooltip>
          ) : (
            <Skeleton height={100} width="100%" sx={classes.skeleton} />
          )}
        </Grid>
        {/* } */}
      </Grid>
      {isFetching ? (
        <>
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
        </>
      ) : (
        <>
          <MDCard sx={{ margin: "10px 0", padding: "10px", overflow: "auto" }}>
            <MDTypography sx={{ textAlign: "center" }}>
              {translate("OEE, Availability, and Performance Analysis by Day/Shift")}
            </MDTypography>
            <ReactEcharts
              option={OeeAvailabilityPerformannce}
              style={{
                minWidth: 668,
                overflow: "auto"
              }}
            />
          </MDCard>
          <MDCard sx={{ margin: "10px 0", padding: "10px", overflow: "auto" }}>
            <MDTypography sx={{ textAlign: "center" }}>
              {translate("Total Production, Idle, and Stop Time by Day/Shift")}
            </MDTypography>
            <ReactEcharts
              option={MachineTimes}
              style={{
                minWidth: 668,
                overflow: "auto"
              }}
            />
          </MDCard>
          <MDCard sx={{ margin: "10px 0", padding: "10px", overflow: "auto" }}>
            <MDTypography sx={{ textAlign: "center" }}>
              {translate("Energy Consumption and Waste Analysis by Day/Shift")}
            </MDTypography>
            <ReactEcharts
              option={MachinePower}
              style={{
                minWidth: 668,
                overflow: "auto"
              }}
            />
          </MDCard>
        </>
      )}
    </DashboardLayout>
  );
};

export default index;
