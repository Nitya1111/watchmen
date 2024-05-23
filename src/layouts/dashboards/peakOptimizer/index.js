/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/prop-types */
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Checkbox, Chip, Grid, Skeleton, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box, Stack } from "@mui/system";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { enumQueryNames } from "api/reactQueryConstant";
import { getOperatorsApi, getOperatorsDayApi } from "api/watchmenApi";
import colors from "assets/theme-dark/base/colors";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDCard from "components/MDCard";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import DataTable from "components/Tables/DataTable";
import RatingPercentage from "components/rating";
import ReactEcharts from "echarts-for-react";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import WeekPicker from "layouts/dashboards/machineShifts/weekPicker";
import moment from "moment";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { aggregateOperatorData, peakOptimizerTableDateFormat } from "utils";
import { convertHMS } from "utils/constants";
import Tooltip from '@mui/material/Tooltip';

const {
  OEE,
  IdleTime,
  RunTime,
  Productivity
} = colors;

export const useStyle = () => ({
  skeleton: {
    transform: "unset",
    margin: "1.5%",
    display: "inline-block"
  },
  leftArrow: {
    marginRight: "12px",
    cursor: "pointer",
    color: "#FFFFFF",
    width: "18px",
    height: "18px"
  },
  rightArrow: {
    marginLeft: "12px",
    cursor: "pointer",
    color: "#FFFFFF",
    width: "18px",
    height: "18px"
  }
});

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function PeakOptimizer() {
  const [machineShiftsData, setMachineShiftsData] = useState([])
  const [columanDates, setColumnDates] = useState([])
  // const [updateShiftsData, setUpdateShiftsData] = useState([])
  const [weekStartDate, setWeekStartDate] = useState(null)
  const [weekEndDate, setWeekEndDate] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [date, setDate] = useState(moment());
  const { axiosPrivate } = useAxiosPrivate();
  const classes = useStyle();

  const { data: operatorsList = [] } = useQuery([enumQueryNames.OPERATOR_LIST], () =>
    getOperatorsApi(axiosPrivate)
  );

  const { refetch, isFetching } = useQuery(
    [enumQueryNames.OPERATORS_DAY],
    () =>
      getOperatorsDayApi(axiosPrivate, {
        operator_list: operatorsList.map(operator => operator.id),
        start_date: weekStartDate.format("YYYY-MM-DD"),
        end_date: weekEndDate.format("YYYY-MM-DD"),
        energy_data: true,
        anomalies: false,
        cycles: false
      }),
    {
      enabled: false,
      onSuccess: (data) => {
        const formatedMachineShiftData = peakOptimizerTableDateFormat(data["operator-days"]);
        const allColumns = Object.keys(data["operator-days"]);
        setColumnDates(allColumns);
        const operatorsData = aggregateOperatorData(formatedMachineShiftData);
        let updatedMachineSHiftData = operatorsData
          .map((operatorData) => [
            operatorData,
            ...formatedMachineShiftData.filter(
              (data) => data.operatorId === operatorData.operatorId
            ),
          ])
          .flat();
        console.log(updatedMachineSHiftData);
        updatedMachineSHiftData = updatedMachineSHiftData.map(data => ({
            ...data,
            rowBackgroundColor: !data.machineId ? "#344767" : null
          }))
        console.log(updatedMachineSHiftData);
        setMachineShiftsData(updatedMachineSHiftData);
      }
    }
  );

  useEffect(() => {
    // const weekNumber = moment(date).week();
    const startDate = moment(date)?.startOf("isoWeek");
    let endDate = moment(date)?.endOf("isoWeek");
    if (endDate.isAfter(moment())) {
      endDate = moment()
    }
    setWeekEndDate(endDate);
    setWeekStartDate(startDate);
  }, [date]);

  useEffect(() => {
    if (weekEndDate && weekStartDate && operatorsList.length) {
      refetch();
    }
  }, [weekStartDate, weekEndDate, operatorsList]);

  const goToPreviosWeek = () => {
    const weekNumber = moment(weekStartDate).week() - 1;
    const startDate = moment().week(weekNumber).startOf("isoWeek");
    const endDate = moment().week(weekNumber).endOf("isoWeek");
    setWeekEndDate(endDate);
    setWeekStartDate(startDate);
  };

  const goToNextWeek = () => {
    const weekNumber = moment(weekStartDate).week() + 1;
    const startDate = moment().week(weekNumber).startOf("isoWeek");
    const endDate = moment().week(weekNumber).endOf("isoWeek");
    setWeekEndDate(endDate);
    setWeekStartDate(startDate);
  };

  // const { mutate: assignShiftPlan } = useMutation(
  //     (formData) => shiftPlanAssignApi(axiosPrivate, formData),
  //     {
  //         onSuccess: () => {
  //             setUpdateShiftsData([])
  //             invalidateQuery([enumQueryNames.SHIFT_ASSIGN_DETAILS])
  //         }
  //     }
  // );

  // const assignShiftPlanHandler = (assignData) => {
  //     const assignShhiftData = {
  //         "data": assignData
  //     }
  //     assignShiftPlan(assignShhiftData)
  // }

  // const handleUpdateShiftDataClick = () => {
  //     if (updateShiftsData.length) {
  //         assignShiftPlanHandler(updateShiftsData)
  //     }
  // }

  // const clearUpdateShiftDataHandler = () => {
  //     const formatedMachineShiftData = shiftPlanningTableDateFormat(originalMahcineShiftData)
  //     setMachineShiftsData(formatedMachineShiftData)
  //     setUpdateShiftsData([])
  // }

  const componentValue = (value, row, date) => {
    let OEE = value?.oee;
    if (!row?.original?.machineId && value?.oee !== undefined) {
      const machineCount = machineShiftsData.filter(
        (data) => data.operatorId === row.original.operatorId && data[date]?.oee
      ).length
      OEE = value.oee / (machineCount - 1);
    }
    let PERFORMANCE = value?.performance;
    if (!row?.original?.machineId && value?.performance !== undefined) {
      const machineCount = machineShiftsData.filter(
        (data) => data.operatorId === row.original.operatorId && data[date]?.performance
      ).length
      PERFORMANCE = value.performance / (machineCount - 1);
    }
    return (
      <>
        {OEE !== undefined && (
          <Stack>
            <MDBox
              sx={{
                height: "25px",
                marginTop: "46px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <MDTypography
                variant="caption"
                fontWeight="medium"
                color="text"
                sx={{ display: "inline", marginRight: "8px" }}
              >
                {(OEE * 100)?.toFixed(2)}%
              </MDTypography>
              <RatingPercentage
                overallRating={value?.overall_oee || 0}
                currentRating={OEE || 0}
                display="inline"
                title={`OEE compared to machine rating ${(
                  (value?.overall_oee || 0) * 100
                ).toFixed(1)}%`}
              />
            </MDBox>
          </Stack>
        )}
        {PERFORMANCE !== undefined && (
          <Stack>
            <MDBox
              sx={{
                height: "25px",
                // marginTop: "46px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <MDTypography
                variant="caption"
                fontWeight="medium"
                color="text"
                sx={{ display: "inline", marginRight: "8px" }}
              >
                {(PERFORMANCE * 100)?.toFixed(2)}%
              </MDTypography>
              <RatingPercentage
                overallRating={value?.overall_performance || 0}
                currentRating={PERFORMANCE || 0}
                display="inline"
                title={`Performance compared to machine rating ${(
                  (value?.overall_performance || 0) * 100
                ).toFixed(2)}%`}
              />
            </MDBox>
          </Stack>
        )}
        {value?.energy_wastage !== undefined && (
          <Stack>
            <MDBox
              sx={{
                height: "25px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <MDTypography
                variant="caption"
                fontWeight="medium"
                color="text"
                sx={{ display: "inline", marginRight: "8px" }}
              >
                {value?.energy_wastage?.toFixed(2)}kWh
              </MDTypography>
              <RatingPercentage
                overallRating={value?.overall_energy_wastage || 0}
                currentRating={value?.energy_wastage || 0}
                direction={false}
                display="inline"
                title={`Compared to machine rating ${value?.overall_energy_wastage} kWh`}
              />
            </MDBox>
          </Stack>
        )}
        {value?.production_duration !== undefined && (
          <Stack>
            <MDBox sx={{
              height: "25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <MDTypography
                variant="caption"
                fontWeight="medium"
                color="text"
                sx={{ display: "inline", marginRight: "8px" }}
              >
                {convertHMS(
                  new Date(
                    Math.floor(value?.production_duration)
                  ).getTime()
                )?.slice(0, -3)}
              </MDTypography>
            </MDBox>
          </Stack>
        )}
        {value?.idle_duration !== undefined && (
          <Stack>
            <MDBox sx={{
              height: "25px",
              display: "flex",
              alignItems: "center",
            }}>
              <MDTypography
                variant="caption"
                fontWeight="medium"
                color="text"
                sx={{ display: "inline", marginRight: "8px" }}
              >
                {convertHMS(
                  new Date(
                    Math.floor(value?.idle_duration)
                  ).getTime()
                )?.slice(0, -3)}
              </MDTypography>
            </MDBox>
          </Stack>
        )}
      </>
    );
  };

  const columns = [
    {
      Header: "",
      accessor: "operatorId",
      Cell: ({ value, row }) => {
        const operator = operatorsList.find((item) => item.id === +value);
        if (row.original.machineId) {
          return (
            <>
              <Stack
                sx={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#303f59",
                  fontWeight: "bold",
                  display: "block"
                }}
              >
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color="text"
                  sx={{ display: "block" }}
                >
                  {row.original.machineName}
                </MDTypography>
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color="text"
                  sx={{ display: "block" }}
                >{`(${row.original.shift})`}</MDTypography>
              </Stack>
              <Stack mt={1}>
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color="text"
                  sx={{ height: "25px" }}
                >
                  {translate("OEE")}
                </MDTypography>
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color="text"
                  sx={{ height: "25px" }}
                >
                  {translate("Performance")}
                </MDTypography>
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color="text"
                  sx={{ height: "25px" }}
                >
                  {translate("Energy wastage")}
                </MDTypography>
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color="text"
                  sx={{ height: "25px" }}
                >
                  {translate("Production duration")} (hh:mm)
                </MDTypography>
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color="text"
                  sx={{ height: "25px" }}
                >
                  {translate("Idle Duration")} (hh:mm)
                </MDTypography>
              </Stack>
            </>
          );
        }
        return (
          <>
            <MDTypography
              variant="caption"
              fontWeight="large"
              color="text"
              sx={{
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "#1f1f1f",
                fontWeight: "bold",
                display: "block",
                marginBottom: "15px"
              }}
            >
              {operator?.name}
            </MDTypography>
            <MDTypography
              variant="caption"
              fontWeight="medium"
              color="text"
              sx={{ height: "25px", marginTo: "4px", display: 'block' }}
            >
              {translate("Avg. OEE")}
            </MDTypography>
            <MDTypography
              variant="caption"
              fontWeight="medium"
              color="text"
              sx={{ height: "25px", marginTo: "4px" }}
            >
              {translate("Avg. Performance")}
            </MDTypography>
          </>
        );
      }
    },
    {
      Header: moment(columanDates[0]).format("dddd"),
      accessor: columanDates[0],
      Cell: ({ value, row }) => componentValue(value, row, columanDates[0]),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[0]).format("dddd"))}</p>
          <p>{moment(columanDates[0]).format("DD-MM-YYYY")}</p>
        </Box>
      ),
      // LeftArrow: () => (
      //   <KeyboardArrowLeftIcon
      //     onClick={(e) => {
      //       e.preventDefault();
      //       e.stopPropagation();
      //       goToPreviosWeek();
      //     }}
      //     sx={classes.leftArror}
      //   />
      // )
    },
    {
      Header: moment(columanDates[1]).format("dddd"),
      accessor: columanDates[1],
      Cell: ({ value, row }) => componentValue(value, row, columanDates[1]),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[1]).format("dddd"))}</p>
          <p>{moment(columanDates[1]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[2]).format("dddd"),
      accessor: columanDates[2],
      Cell: ({ value, row }) => componentValue(value, row, columanDates[2]),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[2]).format("dddd"))}</p>
          <p>{moment(columanDates[2]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[3]).format("dddd"),
      accessor: columanDates[3],
      Cell: ({ value, row }) => componentValue(value, row, columanDates[3]),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[3]).format("dddd"))}</p>
          <p>{moment(columanDates[3]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[4]).format("dddd"),
      accessor: columanDates[4],
      Cell: ({ value, row }) => componentValue(value, row, columanDates[4]),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[4]).format("dddd"))}</p>
          <p>{moment(columanDates[4]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[5]).format("dddd"),
      accessor: columanDates[5],
      Cell: ({ value, row }) => componentValue(value, row, columanDates[5]),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[5]).format("dddd"))}</p>
          <p>{moment(columanDates[5]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[6]).format("dddd"),
      accessor: columanDates[6],
      Cell: ({ value, row }) => componentValue(value, row, columanDates[6]),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[6]).format("dddd"))}</p>
          <p>{moment(columanDates[6]).format("DD-MM-YYYY")}</p>
        </Box>
      ),
      // RightArrow: () => (
      //   <KeyboardArrowRightIcon
      //     onClick={(e) => {
      //       e.preventDefault();
      //       e.stopPropagation();
      //       goToNextWeek();
      //     }}
      //     sx={classes.rightArror}
      //   />
      // )
    }
  ];
  const currentOperators = selectedOptions.length ? selectedOptions.sort((a, b) => +a.id - +b.id) : operatorsList.sort((a, b) => +a.id - +b.id)
  const isCurrentWeek = moment(date).isoWeek() === moment().isoWeek() && moment(date).year() === moment().year();

  const Oee = {
    title: {
      left: "center",
      text: "",
      textStyle: {
        color: "#ffffffcc"
      }
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    legend: {
      data: ["OEE", "Performance"],
      top: 25,
      textStyle: {
        color: "#ffffffcc"
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
          color: "#ffffffcc"
        },
        formatter: (value) => moment(value).format("MMM DD"),
        data: currentOperators.map(operator => operator.name)
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
        // max: 100,
        axisLabel: {
          formatter: (value) => `${Math.trunc(value)} %`,
          color: "#ffffffcc"
        }
      }
    ],
    series: [
      {
        name: "OEE",
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series"
        },
        itemStyle: {
          color: OEE.dark// change this to the color you want
        },
        data: currentOperators.map(operator => {
          const operatorData = machineShiftsData.find(
            (data) => data.operatorId && !data.machineId && operator.id === +data.operatorId
          )
          if (!operatorData) {
            return 0
          }
          const operatorMachines = machineShiftsData.filter(
            (machine) => +machine.operatorId === operator.id && machine.machineId
          ).map((machine) => Object.keys(machine).length - 4)
            .reduce((a, b) => a + b, 0);
          let totalOee = 0;
          for (const key in operatorData) {
            if (key !== "operatorId" && key !== "rowBackgroundColor") {
              totalOee += operatorData[key].oee;
            }
          }
          const averageOee = totalOee / operatorMachines;
          return averageOee * 100
        }),
        tooltip: {
          valueFormatter(value) {
            if (!value) {
              return `0%`;
            }
            return `${Number(value).toFixed(2)}%`;
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
          color: Productivity.dark// change this to the color you want
        },
        data: currentOperators.map(operator => {
          const operatorData = machineShiftsData.find(
            (data) => data.operatorId && !data.machineId && operator.id === +data.operatorId
          )
          if (!operatorData) {
            return 0
          }
          const operatorMachines = machineShiftsData.filter(
            (machine) => +machine.operatorId === operator.id && machine.machineId
          ).map((machine) => Object.keys(machine).length - 4)
            .reduce((a, b) => a + b, 0);
          let totalPerformance = 0;
          for (const key in operatorData) {
            if (key !== "operatorId" && key !== "rowBackgroundColor") {
              totalPerformance += operatorData[key].performance;
            }
          }
          const averagePerformance = totalPerformance / operatorMachines;
          return averagePerformance * 100
        }),
        tooltip: {
          valueFormatter(value) {
            if (!value) {
              return `0%`
            }
            return `${Number(value).toFixed(2)}%`;
          }
        }
      },
    ]
  };

  const Durations = {
    title: {
      left: "center",
      text: "",
      textStyle: {
        color: "#ffffffcc"
      }
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    legend: {
      data: ["Productiontime", "Idletime"],
      top: 25,
      textStyle: {
        color: "#ffffffcc"
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
          color: "#ffffffcc"
        },
        formatter: (value) => moment(value).format("MMM DD"),
        data: currentOperators.map(operator => operator.name)
      }
    ],
    yAxis: [
      {
        type: "value",
        alignTicks: true,
        axisLabel: {
          color: "#ffffffcc"
        },
        splitLine: {
          show: false // hide the horizontal grid lines
        },
        min: 0,
        // max: 24,
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
          color: RunTime.main// change this to the color you want
        },
        data: currentOperators.map(operator => {
          const operatorData = machineShiftsData.find(
            (data) => data.operatorId && !data.machineId && operator.id === +data.operatorId
          )
          if (!operatorData) {
            return 0
          }
          let totalProductionTime = 0;
          for (const date in operatorData) {
            if (date !== "operatorId" && date !== "rowBackgroundColor") {
              totalProductionTime += operatorData[date].total_production_duration;
            }
          }
          const averageProductionTime = totalProductionTime;
          const ProductionTimeInHrs = averageProductionTime / 60 / 60;
          return ProductionTimeInHrs.toFixed(2)
        }),
        tooltip: {
          valueFormatter(value) {
            if (!value) {
              return `00hr 00min`
            }
            return `${Math.floor(+value).toString().padStart(2, '0')}hr ${Math.floor((value.substr(-2) * 60) / 100).toString().padStart(2, '0')}min`
          }
        }
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
          color: IdleTime.main// change this to the color you want
        },
        data: currentOperators.map(operator => {
          const operatorData = machineShiftsData.find(
            (data) => data.operatorId && !data.machineId && operator.id === +data.operatorId
          )
          if (!operatorData) {
            return 0
          }
          let totalIdleTime = 0;
          for (const date in operatorData) {
            if (date !== "operatorId" && date !== "rowBackgroundColor") {
              totalIdleTime += operatorData[date].total_idle_duration;
            }
          }
          const averageIdleTime = totalIdleTime;
          const IdleTimeInHrs = averageIdleTime / 60 / 60;
          return IdleTimeInHrs.toFixed(2)
        }),
        tooltip: {
          valueFormatter(value) {
            if (!value) {
              return `00hr 00min`
            }
            return `${Math.floor(+value).toString().padStart(2, '0')}hr ${Math.floor((value.substr(-2) * 60) / 100).toString().padStart(2, '0')}min`
          }
        }
      },
    ]
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container display="flex" alignItems="center" mb={2}>
        <Grid item xs={12} md={5} sm={12} pr={2}>
          <Autocomplete
            value={selectedOptions}
            multiple
            id="grouped-demo"
            options={operatorsList || []}
            getOptionLabel={(option) => option.name}
            disableCloseOnSelect
            limitTags={2}
            renderTags={(value, getTagProps) =>
              selectedOptions.map((option, index) => (
                <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => <TextField {...params} label={translate("machineOperators")} />}
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
                  checked={selectedOptions.find((selOpt) => selOpt.id === option.id)}
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
                setSelectedOptions(newValue.filter((item) => item.id !== multipleItems[0].id));
              } else {
                setSelectedOptions(newValue);
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4} sm={12} pr={2} display="flex" justifyContent="center">
          <MDBox
            component="form"
            role="form"
            sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Tooltip title={translate("Previous Week")}>
              <KeyboardArrowLeftIcon
                onClick={() => {
                  setDate(moment(date).subtract(7, "days"));
                }}
                sx={classes.leftArrow}
              />
            </Tooltip>
            <LocalizationProvider dateAdapter={AdapterMoment} localeText="en">
              <WeekPicker value={date} setValue={setDate} />
            </LocalizationProvider>
            <Tooltip title={isCurrentWeek ? translate("cantChooseFutureWeek") : translate("Next Week")}>
              <KeyboardArrowRightIcon
                onClick={() => {
                  if (!isCurrentWeek) {
                    setDate(moment(date).add(7, "days"));
                  }
                }}
                sx={{ ...classes.rightArrow, ...(isCurrentWeek ? { color: 'grey' } : {}) }}
                style={{ cursor: isCurrentWeek ? 'not-allowed' : 'pointer' }}
              />
            </Tooltip>
          </MDBox>
        </Grid>
      </Grid>
      {
        isFetching ? <Skeleton height={500} width="100%" />
          : machineShiftsData.length !== 0 ? (<>
            <DataTable
              table={{
                columns,
                rows: selectedOptions?.length
                  ? machineShiftsData.filter((data) =>
                    selectedOptions.find((selOpt) => selOpt.id === +data.operatorId)
                  )
                  : machineShiftsData
              }}
              entriesPerPage={false}
              showTotalEntries={false}
            />
            <MDCard sx={{ margin: "10px 0", padding: "10px", overflow: "auto" }}>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color="text"
                textTransform="capitalize"
                textAlign="center"
              >
                {translate("Average OEE and Performance for the Week")}
              </MDTypography>
              <ReactEcharts
                option={Oee}
                style={{
                  minWidth: 668,
                  overflow: "auto"
                }}
              />
            </MDCard>
            <MDCard sx={{ margin: "10px 0", padding: "10px", overflow: "auto" }}>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color="text"
                textTransform="capitalize"
                textAlign="center"
              >
                {translate("Total Production Time and Total Idle Time for the Week")}
              </MDTypography>
              <ReactEcharts
                option={Durations}
                style={{
                  minWidth: 668,
                  overflow: "auto"
                }}
              />
            </MDCard>
          </>
          ) : <Typography style={{ color: 'white' }}>
                {translate('noDataMessage')}
              </Typography>
      }

    </DashboardLayout>
  );
}

export default PeakOptimizer;
