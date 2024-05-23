import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  Icon,
  Menu,
  MenuItem,
  Modal,
  Skeleton,
  Tooltip,
  useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
// Material Dashboard 2 PRO React components
import MDAlert from "components/MDAlert";
import MDBox from "components/MDBox";
import MDCard from "components/MDCard";
import MDTypography from "components/MDTypography";
// Material Dashboard 2 PRO React examples
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
// import { useEffect, useState } from "react";
import { SwapVert } from "@mui/icons-material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { socket } from "App";
import { enumQueryNames } from "api/reactQueryConstant";
import { getOeeCalculationApi } from "api/watchmenApi";
import breakpoints from "assets/theme/base/breakpoints";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import Counts from "components/counts";
import NewButton from "components/dashboardaddbtn";
import MachineInfo from "components/machineInfo";
import { useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import Cookies from "js-cookie";
import moment from "moment";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

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
    }
  };
};

function Machines() {
  const id = Cookies.get("id");
  const companyid = Cookies.get("companyid");
  const role = Cookies.get("role");
  const jointopic = `notification.${companyid}.${id}`;
  const mystyle = {
    textAlign: "right",
    position: "absolute",
    bottom: "0",
    right: "0",
    fontSize: "10px",
    marginTop: "20px",
    marginRight: "10px"
  };
  const [notification, setNotification] = useState({ list: [] });
  const [, setMenu] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [filterPopup, setFilterPopup] = useState(false);
  const { axiosPrivate } = useAxiosPrivate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [sortBy, setSortBy] = useState({
    field: "OEE",
    type: "dec"
  });

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeSortMenu = () => {
    setAnchorEl(null);
  };

  const handleSortClose = (sort) => {
    setAnchorEl(null);
    if (sort === sortBy.field) {
      if (sortBy.type === "dec") {
        setSortBy({
          field: " ",
          type: ""
        });
      } else if (sortBy.type === "asc") {
        setSortBy({
          ...sortBy,
          type: "dec"
        });
      } else {
        setSortBy({
          field: "",
          type: ""
        });
      }
    } else {
      setSortBy({
        field: sort,
        type: "asc"
      });
    }
  };

  const navigate = useNavigate();

  const { isLoading: dashboardStatusLoading, data: dashboardStatusData = [] } = useQuery(
    [enumQueryNames.DASHBOARD_STATUS],
    () =>
      getOeeCalculationApi(axiosPrivate, {
        // machine_list: machines?.map((x) => +x.id),
        date: moment(new Date()).format("YYYY-MM-DD"),
        pulse: false,
        timeline: false,
        anomalies: false,
        cycles: false,
        energy_data: false,
        extern: false
      }),
    {
      refetchInterval: 180000,
      onSuccess: (data) => {
        const tags = data.reduce((acc, cur) => {
          cur.tag_list.forEach((tag) => {
            if (!acc.includes(tag)) {
              acc.push(tag);
            }
          });
          return acc;
        }, []);
        setTagOptions(tags);
      }
    }
  );
  useEffect(() => {
    socket.emit("join_room", jointopic);
    socket.on("notification", (message) => {
      const notification1 = {
        color: message?.notification?.payload_json?.color,
        description: message?.notification?.payload_json?.description,
        time: message?.notification?.created_at,
        id: message?.notification?.id
      };

      // eslint-disable-next-line no-shadow
      setNotification((notification) => ({ list: [notification1, ...notification.list] }));
    });
  }, []);

  const closeMenu = () => {
    setMenu(null);
  };

  const onRemoveFilter = () => {
    setSelectedTag([]);
    setMenu(null);
  };

  const [tabsOrientation, setTabsOrientation] = useState("horizontal");

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
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Modal
        open={filterPopup}
        onClose={() => setFilterPopup(false)}
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
          <MDBox p={3}>
            <FormControl fullWidth variant="outlined">
              <Autocomplete
                multiple
                id="select-company"
                options={tagOptions.map((item) => item?.name)}
                value={selectedTag}
                onChange={(e, newValue) => setSelectedTag(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <MDInput {...params} type="text" label="Floor" placeholder="Floor" />
                )}
              />
            </FormControl>
            <MDButton
              variant="gradient"
              color="info"
              onClick={() => {
                onRemoveFilter();
                closeMenu();
                setFilterPopup(false);
              }}
              sx={{
                mt: 2
              }}
            >
              {translate("Remove Filter")}
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Tooltip title="Sort">
            <MDButton
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleSortClick}
              variant="gradient"
              color="info"
            >
              {sortBy.type && (
                <Icon fontSize="large" sx={{ marginRight: "5px" }}>
                  sort
                </Icon>
              )}
              <SwapVert />
            </MDButton>
          </Tooltip>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => closeSortMenu("")}
            MenuListProps={{
              "aria-labelledby": "basic-button"
            }}
          >
            <MenuItem onClick={() => handleSortClose("machineName")}>
              {sortBy.field === "machineName" && (
                <Icon fontSize="small" sx={{ marginRight: "5px" }}>
                  {sortBy.type === "asc" ? "south" : "north"}
                </Icon>
              )}
              {translate("Machine name")}
            </MenuItem>
            <MenuItem onClick={() => handleSortClose("runTime")}>
              {sortBy.field === "runTime" && (
                <Icon fontSize="small" sx={{ marginRight: "5px" }}>
                  {sortBy.type === "asc" ? "south" : "north"}
                </Icon>
              )}
              {translate("Run time")}
            </MenuItem>
            <MenuItem onClick={() => handleSortClose("productionTime")}>
              {sortBy.field === "productionTime" && (
                <Icon fontSize="small" sx={{ marginRight: "5px" }}>
                  {sortBy.type === "asc" ? "south" : "north"}
                </Icon>
              )}
              {translate("Production time")}
            </MenuItem>
            <MenuItem onClick={() => handleSortClose("offTime")}>
              {sortBy.field === "offTime" && (
                <Icon fontSize="small" sx={{ marginRight: "5px" }}>
                  {sortBy.type === "asc" ? "south" : "north"}
                </Icon>
              )}
              {translate("Off time")}
            </MenuItem>
            <MenuItem onClick={() => handleSortClose("OEE")}>
              {sortBy.field === "OEE" && (
                <Icon fontSize="small" sx={{ marginRight: "5px" }}>
                  {sortBy.type === "asc" ? "south" : "north"}
                </Icon>
              )}
              {translate("OEE")}
            </MenuItem>
          </Menu>
        </Grid>
        <Grid item>
          <MDBox sx={{ display: "flex", justifyContent: "end" }} textAlign="center">
            <Tooltip title="Filter">
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => setFilterPopup(true)}
                sx={{
                  mx: 1
                }}
              >
                <FilterAltIcon />
                {/* {translate("Filter")} */}
              </MDButton>
            </Tooltip>
          </MDBox>
        </Grid>
      </Grid>
      {/* </Grid> */}

      <MDBox py={3}>
        <MDBox mb={3} id="a">
          <Grid container spacing={3}>
            {dashboardStatusLoading ? (
              <>
                <Grid item xs={12} sm={4} md={3}>
                  <Skeleton height={137} />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <Skeleton height={137} />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <Skeleton height={137} />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <Skeleton height={137} />
                </Grid>
              </>
            ) : (
              <>
                <Counts
                  name="Production"
                  tooltip="Number of machines currently MACHINING on the production floor"
                  count={
                    (dashboardStatusData.length > 0 &&
                      dashboardStatusData?.filter((machine) => machine?.state === 2)?.length) ||
                    0
                  }
                  xs={12}
                  sm={6}
                  md={3}
                />
                <Counts
                  name="Idle"
                  tooltip="Number of machines currently IDLE on the production floor"
                  count={
                    (dashboardStatusData.length > 0 &&
                      dashboardStatusData?.filter((machine) => machine?.state === 1)?.length) ||
                    0
                  }
                  xs={12}
                  sm={6}
                  md={3}
                />
                <Counts
                  name="Off"
                  tooltip="Number of machines currently OFF on the production floor"
                  count={
                    (dashboardStatusData.length > 0 &&
                      dashboardStatusData?.filter((machine) => machine?.state === 0)?.length) ||
                    0
                  }
                  xs={12}
                  sm={6}
                  md={3}
                />
                <Counts
                  name="Preparation"
                  tooltip="Number of machines currently in PREPARATION on the production floor"
                  count={
                    (dashboardStatusData.length > 0 &&
                      dashboardStatusData?.filter(
                        (machine) => machine?.state === 4 || machine?.state === 3
                      )?.length) ||
                    0
                  }
                  xs={12}
                  sm={6}
                  md={3}
                />
              </>
            )}
          </Grid>
        </MDBox>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={8} id="b">
              {dashboardStatusLoading ? (
                <Skeleton variant="rectangular" height={267} width="100%" />
              ) : (
                <Grid container spacing={3} justifyContent="start">
                  {dashboardStatusData?.length > 0
                    ? dashboardStatusData
                        .sort((a, b) => {
                          let AmachineStatusData = a;
                          AmachineStatusData = AmachineStatusData?.live_shift
                            ? AmachineStatusData?.shift_data?.[AmachineStatusData?.live_shift]
                            : Object.values(AmachineStatusData?.shift_data)?.[
                                Object.keys.length - 1
                              ];
                          let BmachineStatusData = b;
                          BmachineStatusData = BmachineStatusData?.live_shift
                            ? BmachineStatusData?.shift_data?.[BmachineStatusData?.live_shift]
                            : Object.values(BmachineStatusData?.shift_data)[Object.keys.length - 1];
                          if (sortBy.field === "machineName") {
                            if (sortBy.type === "asc") {
                              return a.name.localeCompare(b.name);
                            }
                            return b.name.localeCompare(a.name);
                          }
                          if (
                            sortBy.field === "runTime" &&
                            AmachineStatusData &&
                            BmachineStatusData
                          ) {
                            if (sortBy.type === "asc") {
                              return (
                                AmachineStatusData.on_duration - BmachineStatusData.on_duration
                              );
                            }
                            return BmachineStatusData.on_duration - AmachineStatusData.on_duration;
                          }
                          if (sortBy.field === "OEE" && AmachineStatusData && BmachineStatusData) {
                            if (sortBy.type === "asc") {
                              return AmachineStatusData.oee - BmachineStatusData.oee;
                            }
                            return BmachineStatusData.oee - AmachineStatusData.oee;
                          }
                          if (
                            sortBy.field === "productionTime" &&
                            AmachineStatusData &&
                            BmachineStatusData
                          ) {
                            if (sortBy.type === "asc") {
                              return (
                                AmachineStatusData.production_duration -
                                BmachineStatusData.production_duration
                              );
                            }
                            return (
                              BmachineStatusData.production_duration -
                              AmachineStatusData.production_duration
                            );
                          }
                          if (
                            sortBy.field === "offTime" &&
                            AmachineStatusData &&
                            BmachineStatusData
                          ) {
                            if (sortBy.type === "asc") {
                              return (
                                AmachineStatusData.off_duration - BmachineStatusData.off_duration
                              );
                            }
                            return (
                              BmachineStatusData.off_duration - AmachineStatusData.off_duration
                            );
                          }
                          return "";
                        })
                        .map((machine) => {
                          const machineStatusData =
                            dashboardStatusData &&
                            dashboardStatusData?.find((x) => x.id === machine.id);
                          const machineInfo = (
                            <MachineInfo
                              name={machine?.name}
                              model={machine?.model}
                              description={machine?.description}
                              tess={machine?.tess_count}
                              ava={machine?.ava_count}
                              tags={machine?.tag_list}
                              hall={machine?.hall}
                              key={machine?.id}
                              state={machineStatusData?.state}
                              shiftGroup={machine?.shift_group}
                              onClick={() =>
                                navigate(`/machines/${machine?.id}`, {
                                  state: { name: machine?.name }
                                })
                              }
                              machineStatusData={machineStatusData}
                            />
                          );
                          if (selectedTag.length) {
                            if (machine?.tag_list?.some((r) => selectedTag.indexOf(r.name) >= 0)) {
                              return machineInfo;
                            }
                            return null;
                          }
                          return machineInfo;
                        })
                    : null}
                </Grid>
              )}
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={4} id="c">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {dashboardStatusLoading ? (
                    <Skeleton variant="rectangular" height={120} width="100%" />
                  ) : (
                    <>
                      {/* <MDAlert color="info">
                        <MDTypography
                          component="a"
                          variant="body2"
                          fontWeight="medium"
                          color="white"
                        >
                          {translate('WatchMen Platform is currently in debug mode. Future updates will be posted here')}
                        </MDTypography>
                      </MDAlert> */}
                      <MDCard>
                        <MDBox p={2}>
                          <MDTypography variant="h5">{translate("alerts")}</MDTypography>
                        </MDBox>
                        <MDBox pt={0} px={2}>
                          {notification?.list.length > 0 ? (
                            notification?.list.map((data) => (
                              // var time = new Date(data.time);
                              <MDAlert color={data.color} dismissible>
                                <MDTypography
                                  style={{ lineBreak: "anywhere" }}
                                  variant="body2"
                                  fontWeight="medium"
                                  color="white"
                                >
                                  {data.description}
                                  <MDTypography
                                    variant="body2"
                                    fontWeight="medium"
                                    color="white"
                                    marginLeft="0"
                                    style={mystyle}
                                  >
                                    {/* { new Date(1662843720000)} */}
                                    {new Intl.DateTimeFormat("en-US", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit"
                                    }).format(parseInt(data.time, 10) * 1000)}
                                  </MDTypography>
                                </MDTypography>
                              </MDAlert>
                            ))
                          ) : (
                            <MDAlert color="primary" dismissible>
                              <MDTypography
                                component="a"
                                variant="body2"
                                fontWeight="medium"
                                color="white"
                              >
                                {translate("No New Notifications")}
                              </MDTypography>
                            </MDAlert>
                          )}
                        </MDBox>
                      </MDCard>
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      {role === "admin" || role === "super_admin" ? <NewButton /> : ""}
    </DashboardLayout>
  );
}

export default Machines;
