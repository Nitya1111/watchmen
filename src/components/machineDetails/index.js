/* eslint-disable no-underscore-dangle */
import { History } from "@mui/icons-material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CircleIcon from "@mui/icons-material/Circle";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  AppBar,
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
  Button
} from "@mui/material";
import { DesktopDatePicker, deDE, enUS, frFR } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enumQueryNames } from "api/reactQueryConstant";
import Icon from "@mui/material/Icon";
import {
  getMachineDetailsApi,
  getOeeCalculationApi,
  getTimelineReasonApi,
  postDataPoints
} from "api/watchmenApi";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import TableHead from "@mui/material/TableHead";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import anomalySvg from "assets/images/anomaly.svg";
import cyclesSvg from "assets/images/cycles.svg";
import energyConsumptionSvg from "assets/images/energy_consumption.svg";
import energyWastageSvg from "assets/images/energy_wastage.svg";
import colors from "assets/theme-dark/base/colors";
import breakpoints from "assets/theme/base/breakpoints";
import ComplexStatisticsCard from "components/Cards/StatisticsCards/ComplexStatisticsCard";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDCard from "components/MDCard";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import EditButton from "components/dashboardaddbtn/editmachine";
import { setOpenSenser, useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import { calenderDarkTheme } from "layouts/dashboards/machineShifts/rangepicker";
import moment from "moment";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { convertHMS } from "utils/constants";
import NewCount from "../counts/newcount";
import ExternalData from "../externalData";
import PlotlyChart from "../graph";
import LabeledProgress from "../labeledProgress";
import AvaSetup from "../modal/avaSetup";
import Senser from "../modal/senser";
import TessSetup from "../modal/tessSetup";
import { ThemeProvider } from "@mui/system";
import { LOCALES } from "i18n";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddTimelineReason from "components/modal/addTimelinereason";

moment.updateLocale("en", {
  week: {
    dow: 1
  }
});

export const useStyle = () => {
  const theme = useTheme();
  return {
    headerText: {
      color: "green",
      [theme.breakpoints.down("sm")]: {
        color: "orange"
      }
    },
    addButton: {
      marginTop: "2.5%",
      marginLeft: "2%",
      paddingLeft: "12%",
      paddingRight: "12%",
      marginBottom: "1.5%",
      [theme.breakpoints.down("lg")]: {
        marginLeft: "4%",
        marginTop: "3.2%",
        marginBottom: "2%"
      },
      [theme.breakpoints.down("md")]: {
        marginLeft: "4%",
        marginTop: "4.2%",
        marginBottom: "3%"
      }
    },
    cardIdleTime: {
      color: theme.palette.common.white,
      padding: "0 12px"
    },
    cardOffTime: {
      color: theme.palette.common.white,
      padding: "0 12px"
    },
    cardProductionTime: {
      color: theme.palette.common.white,
      border: "10px",
      padding: "0 12px"
    },
    cardTotalTime: {
      backgroundColor: theme.palette.info.main,
      color: "green"
    },
    skeleton: {
      transform: "unset",
      margin: "1% 0"
    },
    leftArrow: { marginRight: "12px", cursor: "pointer", color: "#FFFFFF" },
    rightArrow: { marginLeft: "12px", cursor: "pointer", color: "#FFFFFF" }
  };
};

function getCycleCount(cycles) {
  // Check if cycles is directly a number
  if (typeof cycles === 'number') {
    return cycles;
  }

  // If cycles is an object, try to get the count
  if (cycles && typeof cycles === 'object') {
    return cycles.count ?? 0;
  }

  // Default to 0 if none of the above conditions are met
  return 0;
}

function MachineDetails() {
  const [controller, dispatch] = useMaterialUIController();
  const { openSenser, darkMode, language } = controller;
  const [loading] = useState(false);
  const [TessMode] = useState(false);
  const [TessId] = useState("");
  const [TessName] = useState("");
  const [errMsg] = useState("");
  const { machineId } = useParams();
  const navigate = useNavigate();
  const { axiosPrivate } = useAxiosPrivate();
  const [machineStatusV4Data, setMachineStatusV4Data] = useState();
  const [machineShiftData, setMachineShiftData] = useState();
  const [startDate, setStartDate] = useState();
  const [filterError, setFilterError] = useState("");
  const [timeDetailPopup, setTimeDetailPopup] = useState(false);
  const [refreshToggler, setRefreshToggler] = useState(false);
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);
  const [tabMValue, setTabMValue] = useState(0);
  const [initialShiftSet, setInitialShiftSet] = useState(false);
  const classes = useStyle();
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const lgDown = useMediaQuery(theme.breakpoints.down("lg"));
  const { EnergyConsumption, EnergyWastage, StoppedTime, IdleTime, RunTime } = colors;
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [timelineReasonId, setTimelineReasonId] = useState("");
  // const [selectedCycles, setSelectedCycles] = useState([]);
  const [probability, setProbability] = useState("1.0");
  const [durationSec, setDurationSec] = useState("1.0");
  const [selectedRemoveCycles, setSelectedRemoveCycles] = useState([]);
  const [isAddNewCycles, setAddNewCycles] = useState(false);
  const [selectedCyclesTotal, setSelectedCyclesTotal] = useState({
    probability: 0,
    duration_sec: 0,
    min_cycle: 0,
    max_cycle: 0
  });
  const [isFirstTime, setFirstTime] = useState(true);
  const [windowPeriod, setWindowPeriod] = useState("1m");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  var selectedCycles = [];
  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const locale = language === LOCALES.GERMAN ? deDE : language === LOCALES.FRENCH ? frFR : enUS;

  useEffect(() => {
    if (searchParams.get("date")) {
      setStartDate(moment(searchParams.get("date")));
    } else {
      setStartDate(moment());
    }
  }, []);

  const setMachineShiftDataHandler = (id, data) => {
    // eslint-disable-next-line no-shadow
    let machineData = machineStatusV4Data;
    if (data) {
      machineData = data;
    }
    if (!id) {
      setMachineShiftData(machineData);
    } else if (machineData?.shift_data) {
      const shifts = Object?.values(machineData?.shift_data || null);
      const shiftMachineData = shifts?.find((shift, index) => index === id - 1);

      setMachineShiftData({
        ...machineData,
        day_data: {
          ...shiftMachineData
        }
      });
    } else {
      const shifts = Object?.values(machineData?.day_data || null);
      const shiftMachineData = shifts?.find((shift, index) => index === id - 1);
      setTabValue(-1);
      setMachineShiftData({
        ...machineData,
        day_data: {
          ...shiftMachineData
        }
      });
    }
  };

  // Utility function to format MAC address
  const formatMacAddress = (mac) => {
    return mac.match(/.{1,2}/g).join(':');
  };

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const isToday = moment(startDate).isSame(moment(), "day");

  const { mutate: refetch } = useMutation(
    [enumQueryNames.CALCULATION_DETAILS],
    () =>
      getOeeCalculationApi(axiosPrivate, {
        machine_list: [+machineId],
        date: moment(startDate).format("YYYY-MM-DD"),
        // date: "2023-09-13",
        pulse: true,
        timeline: true,
        anomalies: true,
        cycles: true,
        energy_data: true,
        extern: true,
        window_period: windowPeriod || "1m"
      }),
    {
      enabled: !!machineId,
      onSuccess: (dayDetails) => {
        setMachineStatusV4Data(dayDetails[0]);
        setRefreshToggler(false);
        setFirstTime(false);
        // setTabValue((value) => {
        //   let currentShiftIndex = Object.keys(dayDetails[0]?.shift_data || {}).length - 1;

        //   Object.values(dayDetails[0]?.shift_data || {}).map((data, index) => {
        //     const currentShift = Object.keys(dayDetails[0].shift_data)[index];
        //     if (currentShift === dayDetails[0].live_shift) {
        //       currentShiftIndex = index;
        //     }
        //     return null;
        //   });
        //   setMachineStatusV4Data(dayDetails[currentShiftIndex]);
        //   setMachineShiftDataHandler(
        //     isFirstTime ? currentShiftIndex + 1 : value,
        //     dayDetails[currentShiftIndex]
        //   );
        //   return isFirstTime ? currentShiftIndex + 1 : value;
        // });
        const currentShifts = Object.keys(dayDetails[0]?.shift_data || {});
        const currentShiftIndex = currentShifts.findIndex(
          (shift) => shift === dayDetails[0]?.live_shift
        );
        setTabValue((value) => {
          setMachineShiftDataHandler(currentShiftIndex + 1, dayDetails[0]);
          return currentShiftIndex + 1;
        });
      },
      refetchInterval: 180000
    }
  );

  const { data: machineData, refetch: refetchMachine } = useQuery(
    [enumQueryNames.MACHINE_DETAILS],
    () => getMachineDetailsApi(axiosPrivate, machineId),
    {
      enabled: !!machineId,
      onSuccess: (machineDetail) => {
        location.state = {
          ...location.state,
          name: machineDetail.name
        };
      }
    }
  );

  const { data: timelineReasonList = [] } = useQuery([enumQueryNames.TIMELINE_REASON_LIST], () =>
    getTimelineReasonApi(axiosPrivate)
  );
  const { mutate: addDataPoints } = useMutation(
    (payload) => postDataPoints(axiosPrivate, payload),
    {
      onSuccess: () => {
        selectedCycles = [];
        setSelectedRemoveCycles([]);
        refetch();
      }
    }
  );
  // eslint-disable-next-line no-unused-vars
  const handleAddSensors = () => {
    // setOpenAvaSetup(dispatch, !openAvaSetup);
    setOpenSenser(dispatch, !openSenser);
  };

  useEffect(() => {
    if (refreshToggler) refetch();
  }, [refreshToggler]);

  const applyDateFilterHandler = () => {
    if (startDate) {
      refetch();
      setTimeDetailPopup(false);
    }
  };
  useEffect(() => {
    if (location?.pathname && startDate) {
      refetchMachine();
      refetch();
    }
  }, [location]);

  useEffect(() => {
    applyDateFilterHandler();
  }, [startDate]);

  const resetDateFilterHandler = () => {
    setFilterError("");
    setStartDate(null);
    setTimeDetailPopup(false);
    refetch();
  };

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    /**
     The event listener that's calling the handleTabsOrientation function when resizing the window.
    */
    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const handleSetTabValue = (event, newValue) => {
    setMachineShiftDataHandler(newValue);
    setTabValue(newValue);
  };
  const handleSetTabMValue = (event, newValue) => {
    let temp = "1M";
    switch (newValue) {
      case 0:
        temp = "1m";
        break;
      case 1:
        temp = "30s";
        break;
      case 2:
        temp = "5s";
        break;
      case 3:
        temp = "1s";
        break;

      default:
        temp = "1m";
        break;
    }
    setWindowPeriod(temp);
    setTabMValue(newValue);
    setTimeout(() => {
      refetch();
    });
  };

  useEffect(() => {
    if (!initialShiftSet && machineShiftData) {
      const currentTime = moment().format("HH:mm:ss");
      // Iterate through the shifts and check if the current time falls within the start and end times
      let currentShiftIndex = null;
      // eslint-disable-next-line no-plusplus
      for (
        let index = 0;
        index < Object.values(machineShiftData?.shift_data || {}).length;
        index++
      ) {
        const shift = Object.values(machineShiftData?.shift_data || {})[index];
        const startTime = shift.shift_start_time;
        const endTime = shift.shift_end_time;
        if (currentTime >= startTime && currentTime <= endTime) {
          currentShiftIndex = index;
          break;
        }
      }
      if (currentShiftIndex !== null) {
        setMachineShiftDataHandler(currentShiftIndex + 1);
        setTabValue(currentShiftIndex + 1);
      }
      setInitialShiftSet(true);
    }
  }, [initialShiftSet, machineShiftData]);

  const externDataColumns = machineStatusV4Data?.extern?.columns?.length
    ? machineStatusV4Data.extern?.columns.map((columnId) => ({
      Header: columnId,
      accessor: columnId
    }))
    : [];
  const cyclesDataColumns = [];
  cyclesDataColumns.push({
    headerName: "time",
    field: "time",
    minWidth: 250,
    colSpan: ({ row }) => {
      if (row.id === "TOTAL") {
        return 2;
      }
      return undefined;
    }
  });
  machineShiftData?.cycles?.columns?.map((columnId, index) => {
    return cyclesDataColumns.push({
      headerName: columnId,
      field: columnId,
      minWidth: 250
    });
  });

  const externDataRows = machineStatusV4Data?.extern?.data?.length
    ? machineStatusV4Data.extern?.data.map((data) =>
      machineStatusV4Data.extern?.columns.reduce((obj, key, index) => {
        obj[key] = data[index]; // Set initial value as empty string, or you can set it to any default value
        return obj;
      }, {})
    )
    : [];
  const cyclesDataRows = machineShiftData?.cycles?.data?.length
    ? machineShiftData?.cycles?.data.map((data) =>
      machineShiftData?.cycles?.columns.reduce((obj, key, index) => {
        obj.time = moment(data[0] * 1000).format("HH:mm:ss");
        obj[key] = data[index]; // Set initial value as empty string, or you can set it to any default value
        obj.id = `${obj._time}-${obj.duration_sec}-${obj.probability}`;
        return obj;
      }, {})
    )
    : [];
  const handleRemoveCycles = () => {
    selectedCycles = [];
    setAddNewCycles(false);
  };
  const handleAddAndRemoveCycles = (isAdd) => {
    const payload = {
      operation: isAdd ? "add" : "delete",
      type: "cycles",
      machine_id: machineShiftData?.id,
      datapoints: !isAdd
        ? selectedRemoveCycles.map((item) => {
          const data = item?.split("-");
          return {
            _time: parseInt(data?.[0]) || 0,
            duration_sec: parseFloat(data?.[1]) || 0,
            probability: parseFloat(data?.[2]) || 0
          };
        })
        : selectedCycles.map((item) => {
          const data = item?.split("-");
          return {
            _time: parseInt(data?.[0]) || 0,
            duration_sec: parseFloat(durationSec) || 0,
            probability: parseFloat(probability) || 0
          };
        })
    };
    if (isAdd) setAddNewCycles(false);
    addDataPoints(payload);
  };

  const handleSelectedCycles = (item) => {
    const itemData =
      parseInt(item?.value[0].toString().slice(0, -3)) +
      "-" +
      windowPeriod.toString().slice(0, -1) +
      "-" +
      item?.value[1];
    selectedCycles.push(itemData);
    // setSelectedCycles((prevState) => [...prevState, itemData]);
  };

  // const assignTimelineReasonHandler = async () => {
  //   const payload = {
  //     "data": [
  //       {
  //         "machine_id": +machineId,
  //         "timeline_reason_id": timelineReasonId,
  //         "start_timestamp": timeDetailPopup?.value[1],
  //         "operation": "add"
  //       }
  //     ]
  //   }
  //   const response = await assignTimelineReasonApi(axiosPrivate, payload)
  //   setTimeDetailPopup(false)
  // }
  // useEffect(() => {
  //   if (machineShiftData?.cycles?.data) {
  //     const temp = [];
  //     machineShiftData?.cycles?.data?.map((singlePulse) => {
  //       const itemData = singlePulse[0] + "-" + singlePulse[1] + "-" + singlePulse[2];
  //       temp.push(itemData);
  //     });
  //     setSelectedCycles(temp);
  //   }
  // }, [machineShiftData?.cycles?.data]);
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <>
        {/* <Modal
          open={timeDetailPopup}
          onClose={() => setTimeDetailPopup(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={({ palette: { dark, white } }) => ({
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: darkMode ? "#0F141F" : "#eeeeee",
              border: "1px solid #000",
              borderRadius: "3%",
              boxShadow: 24,
              px: 4,
              pb: 4,
              color: darkMode ? white.main : dark.main,
              maxHeight: "90vh",
              overflow: "auto"
            })}
            className="customScroll"
          >
            <MDBox pb={3} px={3}>
              <MDBox>
                <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                  {filterError}
                </MDTypography>
              </MDBox>
              <MDTypography
                variant="button"
                color="light"
                textGradient
                fontWeight="medium"
                textAlign="center"
                fontSize="1rem"
              >
                {timeDetailPopup && timeDetailPopup?.value.length ? (
                  <>
                    <FiberManualRecordIcon style={{ color: timeDetailPopup.itemStyle.color }} />
                    {timeDetailPopup.name} :{" "}
                    {moment(new Date(timeDetailPopup?.value[1])).format("HH:mm")} -{" "}
                    {moment(new Date(timeDetailPopup?.value[2])).format("HH:mm")}
                  </>
                ) : (
                  ""
                )}
              </MDTypography>
              <MDBox component="form" role="form" py={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="select-machine-label">Select Reason</InputLabel>
                  <Select
                    labelId="select-machine-label"
                    id="select-machine"
                    value={timelineReasonId}
                    onChange={(e) => setTimelineReasonId(e.target.value)}
                    sx={{
                      minHeight: "45px"
                    }}
                  >
                    {timelineReasonList?.map((list) => (
                      <MenuItem value={list.id}>{list.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MDBox>
              <MDBox sx={{ pr: 3, display: "inline" }} textAlign="center">
                <MDButton variant="gradient" color="info" onClick={() => applyDateFilterHandler()}>
                  {translate("Add")}
                </MDButton>
              </MDBox>

              <MDBox sx={{ display: "inline" }} textAlign="center">
                <MDButton variant="gradient" color="error" onClick={() => resetDateFilterHandler()}>
                  {translate("Cancel")}
                </MDButton>
              </MDBox>
            </MDBox>
          </Box>
        </Modal> */}
        <AddTimelineReason
          timeDetailPopup={timeDetailPopup}
          setTimeDetailPopup={setTimeDetailPopup}
          refetch={refetch}
        // timelineReasonId={timelineReasonId}
        // setTimelineReasonId={setTimelineReasonId}
        />
        <Modal
          open={TessMode}
          onClose
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={({ palette: { dark, white } }) => ({
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: darkMode ? "#0F141F" : "#eeeeee",
              border: "1px solid #000",
              borderRadius: "3%",
              boxShadow: 24,
              p: 4,
              color: darkMode ? white.main : dark.main,
              maxHeight: "90vh",
              overflow: "auto"
            })}
            className="customScroll"
          >
            <MDBox pt={0.5} pb={3} px={3}>
              <MDTypography
                variant="button"
                color="light"
                fontWeight="medium"
                textGradient
                textAlign="center"
                px={10}
                fontSize="1.25rem"
              >
                {translate("Select Mode")}
              </MDTypography>
              <MDBox mb={2}>
                <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                  {errMsg}
                </MDTypography>
              </MDBox>
              <MDBox mb={2}>
                <MDInput type="text" label="IP" value="192.168.0.143:5100" fullWidth readOnly />
              </MDBox>

              <MDBox mb={2} textAlign="center">
                <MDButton
                  color="dark"
                  size="medium"
                  marginRight="10px"
                  variant={darkMode ? "contained" : "outlined"}
                  onClick={() =>
                    navigate(`/machines/tess/local/${TessId}`, { state: { name: TessName } })
                  }
                >
                  {loading ? "Local" : "Local"}
                </MDButton>
                <MDButton
                  color="dark"
                  size="medium"
                  variant={darkMode ? "contained" : "outlined"}
                  onClick={() =>
                    navigate(`/machines/tess/Global/${TessId}`, { state: { name: TessName } })
                  }
                >
                  {loading ? "Global" : "Global"}
                </MDButton>
              </MDBox>

              <MDBox mb={2} />
            </MDBox>
          </Box>
        </Modal>
        <Grid
          container
          justifyContent={lgDown ? "center" : "space-between"}
          flexDirection={smDown ? "column" : "row"}
          mb={5}
          spacing={3}
        >
          <Grid item display="flex" justifyContent="center" alignItems="center">
            <AppBar position="static">
              <Tabs
                orientation={tabsOrientation}
                value={tabValue}
                onChange={handleSetTabValue}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: colors.info.main
                  }
                }}
              >
                <Tab label={"All Shifts"} sx={{ padding: "3px 14px", height: "36px" }} />
                {machineShiftData &&
                  Object.keys(machineShiftData.shift_data).map((shift) => (
                    <Tab label={shift} sx={{ padding: "0 14px", height: "36px" }} />
                  ))}
              </Tabs>
            </AppBar>
            <Tooltip title={translate("selectedTabs")}>
              <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
            </Tooltip>
          </Grid>
          <Grid item display="flex" justifyContent="center">
            {machineShiftData?.day_data?.shift_start && machineShiftData?.day_data?.shift_end && (
              <MDBox
                ml={2}
                sx={{
                  background: colors.info.main,
                  whiteSpace: "noWrap",
                  borderRadius: "0.5rem",
                  padding: "2px 5px",
                  display: "flex",
                  alignItems: "center",
                  minHeight: "44px",
                  width: "fit-content"
                }}
              >
                <MDTypography variant="button" fontWeight="regular" color="white">
                  {machineShiftData?.day_data?.shift_start?.slice(-8)}
                  {" - "}
                  {machineShiftData?.day_data?.shift_end?.slice(-8)}
                </MDTypography>
              </MDBox>
            )}
          </Grid>
          <Grid
            item
            display="flex"
            flexDirection={smDown ? "column" : "row"}
            justifyContent="center"
            alignItems="center"
          >
            <MDBox
              sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}
              textAlign="center"
            >
              <Tooltip title={translate("previousDay")}>
                <KeyboardArrowLeftIcon
                  onClick={() => {
                    setStartDate(moment(startDate).subtract(1, "day"));
                  }}
                  sx={classes.leftArrow}
                />
              </Tooltip>
              <ThemeProvider theme={calenderDarkTheme}>
                <LocalizationProvider
                  dateAdapter={AdapterMoment}
                  localeText={locale.components.MuiLocalizationProvider.defaultProps.localeText}
                >
                  <DesktopDatePicker
                    label={translate("Select date")}
                    format="DD/MM/YYYY"
                    value={startDate}
                    onChange={(date) => {
                      setFilterError("");
                      setWindowPeriod("1m");
                      setTabMValue(0);
                      // eslint-disable-next-line no-underscore-dangle
                      setStartDate(moment(date?._d));
                    }}
                    sx={{
                      svg: { color: "#ffffff" }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        sx={{
                          svg: { color: "#ffffff" }
                        }}
                      />
                    )}
                    maxDate={moment()}
                    componentsProps={{
                      actionBar: {
                        actions: ["clear"]
                      }
                    }}
                    PaperProps={{
                      sx: {
                        "& .Mui-selected": {
                          backgroundColor: `${colors.info.main} !important`
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </ThemeProvider>
              <Tooltip title={isToday ? translate("cantChooseFutureDate") : translate("nextDay")}>
                <KeyboardArrowRightIcon
                  onClick={() => {
                    if (!isToday) {
                      setStartDate(moment(startDate).add(1, "day"));
                    }
                  }}
                  sx={{ ...classes.rightArrow, ...(isToday ? { color: 'grey' } : {}) }}
                  style={{ cursor: isToday ? 'not-allowed' : 'pointer' }}
                />
              </Tooltip>
            </MDBox>
            <MDBox mt={smDown ? 2 : 0}>
              <Tooltip title={translate("Machine History")}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={() => {
                    navigate(`machineHistory`, { state: { machineName: location.state?.name } });
                  }}
                  sx={{
                    mx: 1,
                    ml: 2
                  }}
                >
                  <History />
                </MDButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={() => setRefreshToggler(true)}
                  sx={{
                    mx: 1
                  }}
                >
                  <AutorenewIcon />
                </MDButton>
              </Tooltip>
            </MDBox>
          </Grid>
        </Grid>
        <Grid container display="flex" alignItems="center" justifyContent="center">
          <Grid
            item
            sm={12}
            md={4}
            lg={6}
            display="flex"
            justifyContent="center"
            alignContent="center"
          >
            {machineData && machineShiftData ? (
              <LabeledProgress
                size={90}
                tooltipTitle={`OEE compared to machine rating ${(
                  (machineData?.ratings?.oee || 0) * 100
                ).toFixed(1)}%`}
                tooltipTitlePer={`Performance compared to machine rating ${(
                  (machineData?.ratings?.performance || 0) * 100
                ).toFixed(2)}%`}
                machineStatusData={machineShiftData?.day_data || 0}
                overallRating={machineData?.ratings?.oee || 0}
                overallPerformance={machineData?.ratings?.performance || 0}
              />
            ) : (
              <Skeleton variant="circular" height={200} width={200} sx={classes.skeleton} />
            )}
          </Grid>
          <Grid item xs={12} lg={6}>
            {machineShiftData ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <ComplexStatisticsCard
                    title="Energy consumption"
                    count={`${machineShiftData?.day_data?.energy_consumption ?? 0}`}
                    unit="kWh"
                    image={energyConsumptionSvg}
                    color={darkMode ? EnergyConsumption.dark : EnergyConsumption.main}
                    tooltip="Energy consumption"
                    tooltipTitle={`Compared to machine rating ${machineShiftData?.day_data?.rating_energy_consumption} kWh`}
                    overallRating={machineShiftData?.day_data?.rating_energy_consumption || 0}
                    currentRating={machineShiftData?.day_data?.energy_consumption || 0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <ComplexStatisticsCard
                    title="Energy wastage"
                    count={`${machineShiftData?.day_data?.energy_wastage ?? 0}`}
                    unit="kWh"
                    image={energyWastageSvg}
                    color={darkMode ? EnergyWastage.dark : EnergyWastage.main}
                    tooltip="Energy wastage"
                    tooltipTitle={`Compared to machine rating ${machineShiftData?.day_data?.rating_energy_wastage} kWh`}
                    overallRating={machineShiftData?.day_data?.rating_energy_wastage || 0}
                    currentRating={machineShiftData?.day_data?.energy_wastage || 0}
                  />
                </Grid>
                {machineData?.meta_frontend?.cycles && (
                  <Grid item xs={12} sm={6} md={6} lg={6} mt={2}>
                    <ComplexStatisticsCard
                      title="Cycles"
                      count={getCycleCount(machineShiftData?.day_data?.cycles)}
                      image={cyclesSvg}
                      tooltip="Cycles"
                    />
                  </Grid>
                )}
                {machineData?.meta_frontend?.anomalies && (
                  <Grid item xs={12} sm={6} md={6} lg={6} mt={2}>
                    <ComplexStatisticsCard
                      title="Anomalies"
                      count={machineShiftData?.day_data?.anomalies ?? 0}
                      image={anomalySvg}
                      tooltip="Anomalies"
                    />
                  </Grid>
                )}
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
            {machineData && machineShiftData ? (
              <Tooltip title={translate("Production time")}>
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
                      {machineShiftData?.day_data?.production_duration !== 0
                        ? convertHMS(
                          new Date(
                            Math.floor(machineShiftData?.day_data?.production_duration || 0)
                          ).getTime()
                        ) || 0
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
            {machineData && machineShiftData ? (
              <Tooltip title={translate("Idle time")}>
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
                      {machineShiftData?.day_data?.idle_duration !== 0
                        ? convertHMS(
                          new Date(
                            Math.floor(machineShiftData?.day_data?.idle_duration || 0)
                          ).getTime()
                        ) || 0
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
            {machineData && machineShiftData ? (
              <Tooltip title={translate("Off time")}>
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
                      {machineShiftData?.day_data?.off_duration !== 0
                        ? convertHMS(
                          new Date(
                            Math.floor(machineShiftData?.day_data?.off_duration || 0)
                          ).getTime()
                        ) || 0
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
        <MDBox py={3} sx={{ overflowX: "auto" }}>
          <Senser />
          <AvaSetup />
          <TessSetup />
          {machineShiftData?.machine?.tess?.length > 0 && (
            <MDBox mb={3}>
              <Grid container spacing={3}>
                <NewCount
                  name={translate("Product Count")}
                  count={machineShiftData?.machine?.tess[0]?.data?.total}
                  xs={12}
                  sm={4}
                  md={4}
                />
                <NewCount
                  name={translate("Good Count")}
                  count={machineShiftData?.machine?.tess[0]?.data?.pass}
                  xs={12}
                  sm={4}
                  md={4}
                />
                <NewCount
                  name={translate("Bad Count")}
                  count={machineShiftData?.machine?.tess[0]?.data?.fail}
                  xs={12}
                  sm={4}
                  md={4}
                />
              </Grid>
            </MDBox>
          )}
          <Grid
            item
            spacing={3}
            display="flex"
            justifyContent="flex-end"
            mb={3}
            alignItems="center"
          >
            <Tooltip title={translate("SelectResolution")}>
              <Icon style={{ color: "white", marginRight: "10px" }}>info</Icon>
            </Tooltip>
            <Tabs
              orientation={tabsOrientation}
              value={tabMValue}
              onChange={handleSetTabMValue}
              TabIndicatorProps={{
                style: {
                  backgroundColor: colors.info.main,
                  transition: "none"
                }
              }}
            >
              <Tab
                variant="gradient"
                color="info"
                sx={{
                  mx: 1
                }}
                label="1m"
              />
              <Tab
                variant="gradient"
                color="info"
                sx={{
                  mx: 1
                }}
                label="30s"
              />
              <Tab
                variant="gradient"
                color="info"
                sx={{
                  mx: 1
                }}
                label="5s"
              />
              <Tab
                variant="gradient"
                color="info"
                sx={{
                  mx: 1
                }}
                label="1s"
              />
            </Tabs>
          </Grid>
          {machineData && machineShiftData && selectedCycles ? (
            <PlotlyChart
              timelineReasonList={timelineReasonList}
              value={machineShiftData?.timeline}
              pulse={machineStatusV4Data?.pulse?.data}
              startTime={machineShiftData?.day_data?.shift_start}
              endTime={machineShiftData?.day_data?.shift_end}
              date={startDate}
              isAddNewCycles={isAddNewCycles}
              handleSelectedCycles={handleSelectedCycles}
              cyclesSelectedDataRows={selectedCycles}
              cyclesDataRows={machineShiftData?.cycles?.data}
              machineState={machineShiftData?.day_data?.machine_state}
              showTimeline={machineData?.meta_frontend?.timeline}
              showPulseMovement={machineData?.meta_frontend?.pulseMovement}
              setTimeDetailPopup={setTimeDetailPopup}
              machineId={machineId}
            />
          ) : (
            <Skeleton height={300} width="100%" sx={classes.skeleton} />
          )}
        </MDBox>

        {/* <ExternalData externDataColumns={cyclesDataColumns} externDataRows={cyclesDataRows} /> */}

        <Accordion
          darkMode
          style={{
            background: "linear-gradient(195deg, #131313, #282828)",
            borderRadius: "0.75rem"
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            Cycles
          </AccordionSummary>
          <AccordionDetails>
            <MDBox sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              {isAddNewCycles ? (
                <>
                  <MDBox width="50%" display="flex">
                    <MDInput
                      type="text"
                      label="Duration Sec"
                      variant="outlined"
                      value={durationSec}
                      fullWidth
                      onChange={(e) => setDurationSec(e.target.value)}
                    />
                    <MDInput
                      type="text"
                      label="Probability"
                      variant="outlined"
                      value={probability}
                      fullWidth
                      sx={{ mx: 2 }}
                      onChange={(e) => setProbability(e.target.value)}
                    />
                  </MDBox>
                  <Button variant="contained" onClick={() => handleAddAndRemoveCycles(true)}>
                    Upload Cycles
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ ml: 2 }}
                    onClick={() => handleRemoveCycles(true)}
                  >
                    Delete Cycles
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => setAddNewCycles(true)}>
                  Add Cycles (graph)
                </Button>
              )}
              {machineData && machineShiftData?.cycles && cyclesDataRows?.length > 0 && (
                <Button
                  variant="contained"
                  onClick={() => handleAddAndRemoveCycles(false)}
                  sx={{ ml: 2 }}
                >
                  Delete Cycles (table)
                </Button>
              )}
            </MDBox>
            {machineData && machineShiftData?.cycles ? (
              cyclesDataRows?.length > 0 && (
                <MDBox>
                  <DataGrid
                    rows={cyclesDataRows}
                    columns={cyclesDataColumns}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10 }
                      }
                    }}
                    onRowSelectionModelChange={(newRowSelectionModel) => {
                      // Calculate differences between consecutive timestamps
                      const differences = [];
                      for (let i = 0; i < newRowSelectionModel.length - 1; i++) {
                        differences.push(
                          Math.abs(
                            newRowSelectionModel[i + 1].split("-")[0] -
                            newRowSelectionModel[i].split("-")[0]
                          )
                        );
                      }
                      // Calculate minimum, maximum, and average differences
                      const minDifference = Math.min(...differences);
                      const maxDifference = Math.max(...differences);
                      const avgDifference =
                        differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
                      setSelectedCyclesTotal({
                        duration_sec: newRowSelectionModel.length > 1 ? avgDifference : 0,

                        probability:
                          newRowSelectionModel.length > 1
                            ? newRowSelectionModel.reduce(
                              (res, item) => res + parseFloat(item?.split("-")[0]),
                              newRowSelectionModel[0]?.split("-")[0]
                            ) / newRowSelectionModel.length
                            : newRowSelectionModel[0]?.split("-")[0],
                        max_cycle: newRowSelectionModel.length > 1 ? maxDifference : 0,
                        min_cycle: newRowSelectionModel.length > 1 ? minDifference : 0
                      });
                      setSelectedRemoveCycles(newRowSelectionModel);
                    }}
                    pageSizeOptions={[10, 20]}
                    checkboxSelection
                  />
                  <Table aria-label="spanning table">
                    <TableBody>
                      <TableHead sx={{ display: "none" }}>
                        <TableCell align="center">test</TableCell>
                        <TableCell align="center">test</TableCell>
                        <TableCell align="center">test</TableCell>
                        <TableCell align="right">test</TableCell>
                        <TableCell align="right">test</TableCell>
                      </TableHead>
                      {selectedCyclesTotal?.duration_sec !== 0 && (
                        <TableRow>
                          <TableCell colSpan={3}></TableCell>
                          <TableCell align="right">Average cycle time</TableCell>
                          <TableCell colSpan={3} align="left">
                            {Math.abs(selectedCyclesTotal?.duration_sec) + "secs"} (
                            {Math.floor(selectedCyclesTotal?.duration_sec / 3600) !== 0
                              ? Math.floor(selectedCyclesTotal?.duration_sec / 3600) + "h "
                              : ""}
                            {Math.floor(
                              Math.abs((selectedCyclesTotal?.duration_sec % 3600) / 60)
                            ) !== 0
                              ? Math.floor(
                                Math.abs((selectedCyclesTotal?.duration_sec % 3600) / 60)
                              ) + "mins)"
                              : ")"}
                          </TableCell>
                        </TableRow>
                      )}
                      {selectedCyclesTotal?.min_cycle !== 0 && (
                        <TableRow>
                          <TableCell colSpan={3}></TableCell>
                          <TableCell align="right">Minimum cycle time</TableCell>
                          <TableCell colSpan={3} align="left">
                            {Math.abs(selectedCyclesTotal?.min_cycle) + "secs"} (
                            {Math.floor(selectedCyclesTotal?.min_cycle / 3600) !== 0
                              ? Math.floor(selectedCyclesTotal?.min_cycle / 3600) + "h "
                              : ""}
                            {Math.floor(Math.abs((selectedCyclesTotal?.min_cycle % 3600) / 60)) !==
                              0
                              ? Math.floor(Math.abs((selectedCyclesTotal?.min_cycle % 3600) / 60)) +
                              "mins)"
                              : ")"}
                          </TableCell>
                        </TableRow>
                      )}
                      {selectedCyclesTotal?.max_cycle !== 0 && (
                        <TableRow>
                          <TableCell colSpan={3}></TableCell>
                          <TableCell align="right">Maximum cycle time</TableCell>
                          <TableCell colSpan={3} align="left">
                            {Math.abs(selectedCyclesTotal?.max_cycle) + "secs"} (
                            {Math.floor(selectedCyclesTotal?.max_cycle / 3600) !== 0
                              ? Math.floor(selectedCyclesTotal?.max_cycle / 3600) + "h "
                              : ""}
                            {Math.floor(Math.abs((selectedCyclesTotal?.max_cycle % 3600) / 60)) !==
                              0
                              ? Math.floor(Math.abs((selectedCyclesTotal?.max_cycle % 3600) / 60)) +
                              "mins)"
                              : ")"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </MDBox>
              )
            ) : (
              <Skeleton height={150} width="100%" sx={classes.skeleton} />
            )}
          </AccordionDetails>
        </Accordion>

        <Grid container mt={2} />
        <Accordion
          darkMode
          style={{
            background: "linear-gradient(195deg, #131313, #282828)",
            borderRadius: "0.75rem"
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            External Data
          </AccordionSummary>
          <AccordionDetails>
            {machineData && machineShiftData?.extern ? (
              machineData?.meta_frontend?.externalData && (
                <ExternalData
                  externDataColumns={externDataColumns}
                  externDataRows={externDataRows}
                />
              )
            ) : (
              <Skeleton height={150} width="100%" sx={classes.skeleton} />
            )}
          </AccordionDetails>
        </Accordion>

        <Grid container mt={3}>
          {machineData && machineStatusV4Data && machineData?.ava_list?.length ? (
            <Grid item xs={12} sm={6} md={4}>
              <MDCard sx={{ height: "100%" }}>
                <MDBox pt={2} px={2} lineHeight={1}>
                  <MDTypography variant="h6" fontWeight="medium">
                    {translate("AVA Details")}
                  </MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <MDBox ml={2} mt={0.5} lineHeight={1.4}>
                    <MDTypography display="inline" variant="button" fontWeight="medium">
                      {translate("name")}
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      {":  "}
                      {machineData?.ava_list[0].name ?? ""}
                    </MDTypography>
                  </MDBox>
                  <MDBox ml={2} mt={0.5} lineHeight={1.4}>
                    <MDTypography display="inline" variant="button" fontWeight="medium">
                      {translate("Hostname")}
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      {":  "}
                      {machineData?.ava_list[0].host_name ?? ""}
                      <ContentCopyIcon
                        onClick={() => copyToClipboard(machineData?.ava_list[0].host_name)}
                        sx={{ marginLeft: 1, cursor: 'pointer' }}
                        fontSize="small"
                      />
                    </MDTypography>
                  </MDBox>
                  <MDBox ml={2} mt={0.5} lineHeight={1.4}>
                    <MDTypography display="inline" variant="button" fontWeight="medium">
                      {translate("MAC address")}
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      {':  '}
                      {machineData?.ava_list[0].mac_id ? formatMacAddress(machineData?.ava_list[0].mac_id) : ''}
                      <ContentCopyIcon
                        onClick={() => copyToClipboard(formatMacAddress(machineData?.ava_list[0].mac_id))}
                        sx={{ marginLeft: 1, cursor: 'pointer' }}
                        fontSize="small"
                      />
                    </MDTypography>
                  </MDBox>
                  <MDBox ml={2} mt={0.5} lineHeight={1.4}>
                    <MDTypography display="inline" variant="button" fontWeight="medium">
                      {translate("EdgeID")}
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      {":  "}
                      {machineData?.ava_list[0].edge_id ?? ""}
                    </MDTypography>
                  </MDBox>
                  <MDBox ml={2} mt={0.5} lineHeight={1.4}>
                    <MDTypography display="inline" variant="button" fontWeight="medium">
                      {translate("Status")}
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      <CircleIcon
                        sx={{
                          marginLeft: "8px",
                          color:
                            machineStatusV4Data?.state === 1
                              ? "yellow !important"
                              : machineStatusV4Data?.state === 2
                                ? "green !important"
                                : machineStatusV4Data?.state === 3
                                  ? "blue !important"
                                  : machineStatusV4Data?.state === 4
                                    ? "gray !important"
                                    : "red !important"
                        }}
                      />
                    </MDTypography>
                  </MDBox>
                  <MDBox ml={2} mt={0.5} lineHeight={1.4}>
                    <MDTypography display="inline" variant="button" fontWeight="medium">
                      {translate("Last Heartbeat")}
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      {":  "}
                      {machineData?.ava_list[0].last_heartbeat ?? ""}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDCard>
            </Grid>
          ) : (
            <Grid item xs={12} sm={6} md={4}>
              <Skeleton height={100} width="100%" sx={classes.skeleton} />
            </Grid>
          )}
        </Grid>
      </>
      <EditButton />
    </DashboardLayout>
  );
}

export default MachineDetails;
