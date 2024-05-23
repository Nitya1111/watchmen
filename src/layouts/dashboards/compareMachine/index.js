/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
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
  useTheme
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { enumQueryNames } from "api/reactQueryConstant";
import { getHallListApi, getOeeCalculationApi } from "api/watchmenApi";
import colors from "assets/theme-dark/base/colors";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import moment from "moment";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import MachinCompareCard from "./machineCompareCard";
import { ThemeProvider, useMediaQuery } from "@mui/system";
import { calenderDarkTheme } from "../machineShifts/rangepicker";
import PlotlyChart from "components/graph";
import AddTimelineReason from "components/modal/addTimelinereason";
import { getTimelineReasonApi } from "api/watchmenApi";
import breakpoints from "assets/theme/base/breakpoints";
import MDCard from "components/MDCard";

moment.updateLocale("en", {
  week: {
    dow: 1
  }
});

export const useStyle = () => ({
  skeleton: {
    transform: "unset",
    margin: "1.5%",
    display: "inline-block"
  },
  leftArrow: { marginRight: "12px", cursor: "pointer", color: "#FFFFFF" },
  rightArrow: { marginLeft: "12px", cursor: "pointer", color: "#FFFFFF" }
});

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const COLORS = [
  colors.primary.main,
  colors.secondary.main,
  colors.info.main,
  colors.success.main,
  colors.warning.main
];

function CompareMachine() {
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [selectedMachinesData, setSelectedMachinesData] = useState({});
  const [originalMachineData, setOriginalMachineData] = useState([]);
  const [startDate, setStartDate] = useState(moment());
  const { axiosPrivate } = useAxiosPrivate();
  const [isPerShift, setIsPerShift] = useState(false);
  const [machineTimelineData, setMachineTimelineData] = useState([]);
  const [timeDetailPopup, setTimeDetailPopup] = useState(null);
  const [shiftDetails, setShiftDetails] = useState({});
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);

  const shadow = true;
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const lgDown = useMediaQuery(theme.breakpoints.down("lg"));

  const classes = useStyle();
  const isToday = moment(startDate).isSame(moment(), "day");

  const { data: hallList = [] } = useQuery([enumQueryNames.HALL_LIST], () =>
    getHallListApi(axiosPrivate)
  );

  const { data: timelineReasonList = [] } = useQuery([enumQueryNames.TIMELINE_REASON_LIST], () =>
    getTimelineReasonApi(axiosPrivate)
  );

  const { isFetching: machinesDataFetching, refetch } = useQuery(
    [enumQueryNames.DASHBOARD_STATUS],
    () =>
      getOeeCalculationApi(axiosPrivate, {
        machine_list: selectedMachines.map((machine) => +machine.id),
        date: moment(startDate).format("YYYY-MM-DD"),
        pulse: false,
        timeline: true,
        anomalies: false,
        cycles: false,
        energy_data: true,
        extern: false
      }),
    {
      enabled: false,
      onSuccess: (data) => {
        let allShiftsDetails = {};
        data.forEach((machine) => {
          if (Object.keys(machine?.shift_data).length !== 0) {
            allShiftsDetails = {
              ...allShiftsDetails,
              ...machine.shift_data
            };
          } else if (Object.keys(machine?.day_data).length !== 0) {
            allShiftsDetails = {
              ...allShiftsDetails,
              day: machine.day_data
            };
          }
        });
        setShiftDetails(allShiftsDetails);
        setOriginalMachineData(
          data.map((machine) => ({
            ...machine,
            ...machine.day_data,
            machineName: machine.name,
            machine_id: machine.id
          }))
        );
        // eslint-disable-next-line prefer-const
        let shifts = {};
        if (isPerShift) {
          setSelectedMachinesData({
            "All Data": data.map((machine) => ({
              ...machine,
              ...machine.day_data,
              machineName: machine.name,
              machine_id: machine.id
            }))
          });
          return;
        }
        for (const item of data) {
          if (Object.keys(item.shift_data).length > 0) {
            for (const shift of Object.keys(item.shift_data)) {
              if (!shifts[shift]) {
                shifts[shift] = [];
              }
            }
          } else if (Object.keys(item.day_data).length > 0) {
            shifts["AllShift"] = [];
          }
        }

        for (const item of data) {
          if (Object.keys(item.shift_data).length > 0) {
            Object.keys(shifts).forEach((shiftName) => {
              const shift = item.shift_data[shiftName];
              if (shift) {
                shifts[shiftName] = [
                  ...shifts[shiftName],
                  { ...shift, machineName: item.name, machine_id: item.id }
                ];
              } else {
                shifts[shiftName] = [...shifts[shiftName], null];
              }
            });
          } else if (Object.keys(item.day_data).length > 0) {
            shifts.AllShift = [
              ...shifts.AllShift,
              { ...item.day_data, machineName: item.name, machine_id: item.id }
            ];
          }
        }
        setSelectedMachinesData(shifts);
        setMachineTimelineData(
          data.map((machine) => ({
            timeline: machine.timeline,
            name: machine.name,
            id: machine.id
          }))
        );
      }
    }
  );

  useEffect(() => {
    if (isPerShift) {
      setSelectedMachinesData({ "All Data": originalMachineData });
    } else {
      // eslint-disable-next-line prefer-const
      let shifts = {};
      for (const item of originalMachineData) {
        for (const shift of Object.keys(item.shift_data)) {
          if (!shifts[shift]) {
            shifts[shift] = [];
          }
        }
      }
      for (const item of originalMachineData) {
        Object.keys(shifts).forEach((shiftName) => {
          const shift = item.shift_data[shiftName];
          if (shift) {
            shifts[shiftName] = [
              ...shifts[shiftName],
              { ...shift, machineName: item.name, machine_id: item.id }
            ];
          } else {
            shifts[shiftName] = [...shifts[shiftName], null];
          }
        });
      }
      setSelectedMachinesData(shifts);
    }
  }, [isPerShift]);

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

  useEffect(() => {
    if (startDate && selectedMachines.length) {
      refetch();
    }
  }, [startDate]);

  const applyFilterHandler = () => {
    refetch();
  };

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
    setTabValue(newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <AddTimelineReason
        timeDetailPopup={timeDetailPopup}
        setTimeDetailPopup={setTimeDetailPopup}
        refetch={refetch}
      />
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        <Grid item md={5} sm={12} sx={{ width: "-webkit-fill-available" }}>
          <Autocomplete
            id="machine-list"
            value={selectedMachines}
            multiple
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
            renderInput={(params) => <TextField {...params} label={translate("Machines")} />}
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
        <Grid item xs={12} md={4} sm={12}>
          <MDBox
            component="form"
            role="form"
            sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
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
              <LocalizationProvider dateAdapter={AdapterMoment} localeText="en">
                <DesktopDatePicker
                  label={translate("Select date")}
                  format="DD/MM/YYYY"
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                  }}
                  sx={{
                    svg: { color: "#ffffff" }
                  }}
                  maxDate={moment()}
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
        </Grid>
        <Grid
          item
          xs={12}
          md={3}
          sm={12}
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
            1 V 1 Analyze
          </MDButton>
        </Grid>
        {/* <Grid
          item
          md={4}
          sm={12}
          pr={2}
          justifyContent="center"
          display="flex"
          height="fit-content"
          alignItems="center"
        >
          <MDTypography color="text" fontWeight="medium" fontSize="1rem">
            Per-shift
          </MDTypography>
          <Switch checked={isPerShift} onChange={() => setIsPerShift(!isPerShift)} />
          <MDTypography color="text" fontWeight="medium" fontSize="1rem">
            Per-day
          </MDTypography>
        </Grid> */}
      </Grid>
      {machinesDataFetching ? (
        <>
          <Skeleton width="30%" height={400} sx={classes.skeleton} />
          <Skeleton width="30%" height={400} sx={classes.skeleton} />
          <Skeleton width="30%" height={400} sx={classes.skeleton} />
        </>
      ) : (
        selectedMachinesData &&
        Object.values(selectedMachinesData)[0]?.length && (
          <MDBox sx={{ overflow: "auto" }}>
            {Object.keys(selectedMachinesData).map((shift) => (
              <MDBox display="flex" sx={{ alignItems: "center" }} mt={3}>
                <MDBox
                  bgColor="orange"
                  width="max-content"
                  px={4}
                  pt={0}
                  mx="auto"
                  mt={-1.375}
                  borderRadius="section"
                  lineHeight={1}
                  sx={{
                    position: "absolute",
                    zIndex: "1",
                    left: "-75px",
                    rotate: "270deg",
                    width: "200px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <MDTypography
                    variant="caption"
                    textTransform="uppercase"
                    fontWeight="medium"
                    color="white"
                  >
                    {shift}
                  </MDTypography>
                </MDBox>
                {selectedMachinesData[shift].map((curShift, index) => {
                  const color = COLORS[index % 5];
                  const badge = {
                    color
                  };
                  return (
                    <MDBox display="flex">
                      <MachinCompareCard
                        color="black"
                        shadow={shadow}
                        badge={badge}
                        machinedata={curShift}
                        date={startDate}
                        ratings={originalMachineData[index]?.ratings}
                      />
                    </MDBox>
                  );
                })}
              </MDBox>
            ))}
          </MDBox>
        )
      )}
      {Object.keys(shiftDetails).length !== 0 && (
        <Grid
          container
          justifyContent={lgDown ? "center" : "space-between"}
          flexDirection={smDown ? "column" : "row"}
          ml={1}
          mb={1}
          mt={3}
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
                <Tab label="All Shifts" sx={{ padding: "3px 14px", height: "36px" }} />
                {Object.keys(shiftDetails).map(
                  (shift) =>
                    shift !== "day" && (
                      <Tab label={shift} sx={{ padding: "0 14px", height: "36px" }} />
                    )
                )}
              </Tabs>
            </AppBar>
            <Tooltip title={translate("selectedTabs")}>
              <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
            </Tooltip>
          </Grid>
        </Grid>
      )}
      {machineTimelineData?.map((data) => (
        <MDCard style={{ width: "100%", margin: "10px 0 12px 0" }} key={data.id}>
          <MDTypography
            variant="button"
            fontWeight="bold"
            color="text"
            textTransform="capitalize"
            sx={{
              paddingTop: "10px",
              paddingLeft: "8px"
            }}
          >
            {data.name}
          </MDTypography>
          {data?.timeline ? (
            <PlotlyChart
              value={data.timeline}
              showTimeline={data.timeline}
              showPulseMovement={false}
              floorplan
              date={moment(startDate).format("YYYY-MM-DD")}
              startTime={
                tabValue !== 0
                  ? moment(
                      Object.values(shiftDetails)[tabValue - 1]?.shift_start,
                      "YYYY-MM-DD HH:mm:ss"
                    )
                  : null
              }
              endTime={
                tabValue !== 0
                  ? moment(
                      Object.values(shiftDetails)[tabValue - 1]?.shift_end,
                      "YYYY-MM-DD HH:mm:ss"
                    )
                  : null
              }
              showAxisLabel={false}
              setTimeDetailPopup={setTimeDetailPopup}
              addTimelineReason
              machineId={data.id}
              timelineReasonList={timelineReasonList}
            />
          ) : (
            <MDTypography
              variant="button"
              fontWeight="bold"
              color="text"
              textTransform="capitalize"
              sx={{
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingTop: "8px",
                paddingLeft: "8px",
                paddingBottom: "10px"
              }}
            >
              No data found in the selected day.
            </MDTypography>
          )}
        </MDCard>
      ))}
    </DashboardLayout>
  );
}

export default CompareMachine;
