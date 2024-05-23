/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from "react";
import useMachine from "hooks/useMachine";
import useRefreshToken from "hooks/useRefreshToken";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import useAuth from "hooks/useAuth";
import MDTypography from "components/MDTypography";
import {
  Autocomplete,
  Box,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Icon,
  IconButton,
  Modal,
  Radio,
  RadioGroup,
  Skeleton
} from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { useTheme } from "@emotion/react";
import { useParams, Link } from "react-router-dom";
import { useMaterialUIController, setMiniSidenav } from "context";
import translate from "i18n/translate";
import Footer from "components/Footer";
import MDCard from "components/MDCard";
import MDInput from "components/MDInput";
import LabeledProgress from "components/labeledProgress";
import { useMutation, useQuery } from "react-query";
import { getHallDetailApi, getOeeCalculationApi } from "api/watchmenApi";
import { enumQueryNames } from "api/reactQueryConstant";
import PlotlyChart from "components/graph";
import { Stack } from "@mui/system";
import moment from "moment";
import Timer from "./timer";
import { updateHallApi } from "api/watchmenApi";

const useStyle = () => {
  const theme = useTheme();
  return {
    mainCard: {
      "& .MuiGrid-root": {
        "& .MuiGrid-item": {
          backgroundColor: "red",
          color: "green"
        }
      }
    },
    labeledProgressGrid: {
      [theme.breakpoints.down("lg")]: {
        display: "flex",
        justifyContent: "center"
      },
      [theme.breakpoints.down("md")]: {
        marginLeft: "20%"
      },
      [theme.breakpoints.down("sm")]: {
        marginLeft: 0
      },
      zIndex: "-1"
    },
    skeleton: {
      transform: "unset",
      margin: "1.66%",
      display: "inline-block"
    }
  };
};

function Index() {
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [, setMenu] = useState(null);
  const [successSB, setSuccessSB] = useState(null);
  const [filterPopup, setFilterPopup] = useState(false);
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  const { axiosPrivate, isAuthSet } = useAxiosPrivate();
  const classes = useStyle();
  const { machines } = useMachine();
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, miniSidenav } = controller;
  const [hallDetails, setHallDetails] = useState();
  const [loading, setLoading] = useState(true);
  const [machineStatusData, setMachineStatusData] = useState(null);
  const [toggleHover, setToggleHover] = useState({
    machineId: null,
    shiftIndex: null
  });
  const [valuePreference, setValuePreference] = useState("oee");

  const { id } = useParams();
  const tag = "";
  useEffect(() => {
    if (tag) {
      setSelectedTag([`#${tag}`]);
    } else {
      setSelectedTag([]);
    }
  }, [tag]);

  useEffect(() => {
    if (!miniSidenav) {
      setMiniSidenav(dispatch, true);
    }
  }, []);

  const { isFetching: isMachineLoading, refetch: fetchMachineDataQuery } = useQuery(
    [enumQueryNames.CALCULATION_DETAILS],
    () =>
      getOeeCalculationApi(axiosPrivate, {
        machine_list: hallDetails.machine_list.map((machinne) => +machinne.id),
        date: moment().format("YYYY-MM-DD"),
        pulse: false,
        timeline: true,
        anomalies: false,
        cycles: false,
        energy_data: false,
        extern: false
      }),
    {
      enabled: false,
      onSuccess: (dayDetails) => {
        setMachineStatusData(dayDetails);
        setLoading(false);
      },
      refetchInterval: 180000
    }
  );

  const { isFetching: hallDetailsFetching } = useQuery(
    [id],
    () => getHallDetailApi(axiosPrivate, id),
    {
      enabled: auth.Token && isAuthSet,
      onSuccess: (hallDetail) => {
        setHallDetails(hallDetail);
        setValuePreference(hallDetail.meta_frontend.valuePreference || "oee");
      }
    }
  );

  const { mutate: updateHallDetails, isLoading: updateHallLoading } = useMutation(({ data }) =>
    updateHallApi(axiosPrivate, id, data)
  );

  useEffect(() => {
    setLoading(true);
  }, [id]);

  useEffect(() => {
    if (!auth.token || !isAuthSet) {
      refresh();
    }
  }, []);

  useEffect(() => {
    hallDetails && fetchMachineDataQuery();
  }, [hallDetails]);

  useEffect(() => {
    if (machines?.machines) {
      const machineTags = machines.machines
        .map(({ tags }) => tags)
        .flat()
        .reduce((arr, curr) => {
          if (!arr.includes(curr)) arr.push(curr);
          return arr;
        }, []);
      setTagOptions(machineTags);
    }
  }, [machines]);

  const changeValuePreference = (event) => {
    const hallmeta = {
      name: hallDetails.name,
      meta_frontend: {
        valuePreference: event.target.value
      }
    };
    setValuePreference(event.target.value);
    updateHallDetails({ data: hallmeta });
  };

  let timeoutId;

  const generateDOM = () => {
    const floormachines = machineStatusData?.sort(
      (a, b) => a.id - b.id || a.name.localeCompare(b.name)
    );
    const floorplan = floormachines?.map((machine, i) => {
      const currentMachine = machines?.machines?.find(
        (machineinfo) => machineinfo.id === machine.id
      );

      let curMachineStatusData = machine?.shift_data
        ? Object.values(machine?.shift_data || {})[
            Object.keys(machine?.shift_data).findIndex((item) => item.includes(machine?.live_shift))
          ] || Object.values(machine?.shift_data || {})[Object.keys(machine?.shift_data).length - 1]
        : null;

      if (toggleHover.machineId === machine.id) {
        curMachineStatusData = Object.values(machine?.shift_data || {})[toggleHover.shiftIndex];
      }

      const handleMouseOver = (item) => {
        timeoutId = setTimeout(() => {
          setToggleHover(item);
        }, 500);
      };

      const handleMouseOut = () => {
        clearTimeout(timeoutId);
        setToggleHover({
          machineId: null,
          shiftIndex: null
        });
      };

      return (
        <Grid item xs={12} sm={6} md={6} lg={4} xxxl={3}>
          <MDCard
            // eslint-disable-next-line react/no-array-index-key
            sx={{
              minHeight: "150px",
              display:
                selectedTag.length &&
                !currentMachine?.tags?.some((r) => selectedTag.indexOf(r) >= 0)
                  ? "none"
                  : "",
              boxShadow: "unset",
              border: 2,
              borderRadius: 1,
              borderColor:
                machine?.state === 2
                  ? "green"
                  : machine?.state === 1
                  ? "yellow"
                  : machine?.state === 4
                  ? "gray"
                  : machine?.state === 3
                  ? "blue"
                  : "red",
              zIndex: 3
            }}
          >
            <Stack
              sx={{
                position: "absolute",
                top: 15,
                left: 15
              }}
            >
              <Grid sx={classes.labeledProgressGrid} item my={0.5} textAlign="center">
                <Box
                  sx={{
                    display: "inline-flex",
                    width: "115px",
                    height: "115px",
                    alignItems: "center",
                    borderRadius: "50%",
                    justifyContent: "center"
                  }}
                >
                  {curMachineStatusData && (
                    <LabeledProgress
                      value={machine.health * 100}
                      count={machine.health * 100}
                      size={50}
                      machineStatusData={curMachineStatusData}
                      height={200}
                      width={200}
                      fontSize="12px"
                      hollowSize="20%"
                      label={false}
                      valuePreference={valuePreference}
                    />
                  )}
                </Box>
              </Grid>
            </Stack>
            <Stack
              flexDirection="row-reverse"
              alignItems="center"
              position="relative"
              right="0px"
              width="100%"
              height="30px"
            >
              <Link
                target="_blank"
                to={{
                  pathname: `/machines/${machine?.id}`
                }}
                rel="noopener noreferrer"
                style={{ color: "unset" }}
              >
                <IconButton size="small" color="white">
                  <Icon>visibility</Icon>
                </IconButton>
              </Link>
            </Stack>
            <Stack
              flexDirection="column"
              width="100%"
              justifyContent="center"
              alignItems="center"
              ml={9}
              mt={4}
            >
              <MDTypography
                variant="h6"
                fontWeight="medium"
                textTransform="capitalize"
                sx={{ maxWidth: 180 }}
              >
                {machine.name}
              </MDTypography>
            </Stack>
            <MDBox mt={8} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              {Object.keys(machine?.shift_data || {}).map((item, index) => (
                <MDBox
                  onMouseOut={handleMouseOut}
                  onMouseOver={() => handleMouseOver({ machineId: machine.id, shiftIndex: index })}
                  variant="gradient"
                  sx={({ palette: { background } }) => ({
                    cursor: "pointer",
                    background: darkMode && background.card,
                    p: "10px 15px",
                    marginRight: "5px",
                    border: item === machine?.live_shift ? 2 : 0,
                    borderRadius: "10px",
                    borderColor:
                      machine?.state === 2
                        ? "green"
                        : machine?.state === 1
                        ? "yellow"
                        : machine?.state === 4
                        ? "gray"
                        : machine?.state === 3
                        ? "blue"
                        : "red"
                  })}
                >
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    color="text"
                    textTransform="capitalize"
                  >
                    {item}
                  </MDTypography>
                </MDBox>
              ))}
            </MDBox>
            <MDBox sx={{ position: "relative", left: "-22px" }}>
              <PlotlyChart
                value={machine?.timeline}
                showTimeline={machine?.timeline}
                showPulseMovement={false}
                setTimeDetailPopup={() => {}}
                floorplan
                endTime={moment()._d}
                startTime={moment().subtract(3, "hours")._d}
                last3Hrs
                showAxisLabel={false}
              />
            </MDBox>
          </MDCard>
        </Grid>
      );
    });
    return floorplan;
  };

  const closeSuccessSB = () => setSuccessSB(null);

  const closeMenu = () => {
    setMenu(null);
  };

  const onRemoveFilter = () => {
    setSelectedTag([]);
    setMenu(null);
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box
        sx={{ marginBottom: "23px" }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Timer />
        <FormControl>
          {/* <FormLabel id="demo-row-radio-buttons-group-label">Preference</FormLabel> */}
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={valuePreference}
            onChange={changeValuePreference}
          >
            <FormControlLabel value="oee" control={<Radio />} label="OEE" />
            <FormControlLabel value="performance" control={<Radio />} label="Performance" />
          </RadioGroup>
        </FormControl>
      </Box>
      {hallDetailsFetching || isMachineLoading || loading || updateHallLoading ? (
        <>
          <Skeleton width="30%" height={200} sx={classes.skeleton} />
          <Skeleton width="30%" height={200} sx={classes.skeleton} />
          <Skeleton width="30%" height={200} sx={classes.skeleton} />
          <Skeleton width="30%" height={200} sx={classes.skeleton} />
          <Skeleton width="30%" height={200} sx={classes.skeleton} />
          <Skeleton width="30%" height={200} sx={classes.skeleton} />
          <Skeleton width="96.6%" height={200} sx={classes.skeleton} />
        </>
      ) : (
        <>
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
                maxHeight: "100vh",
                overflow: "auto"
              })}
              className="customScroll"
            >
              <MDBox p={3}>
                <FormControl fullWidth variant="outlined">
                  <Autocomplete
                    multiple
                    id="select-company"
                    options={tagOptions}
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
                <Divider sx={{ margin: "0.5rem 0" }} />
                <MDButton
                  variant="gradient"
                  color="error"
                  onClick={() => {
                    closeMenu();
                    setFilterPopup(false);
                    onRemoveFilter();
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
          {/* <Box sx={{ marginBottom: "23px" }} display="flex" justifyContent="end"> */}
          {/* <Tooltip title="Filter">
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => setFilterPopup(true)}
                sx={{
                  mx: 1
                }}
              >
                <FilterAltIcon />
              </MDButton>
            </Tooltip>
            <Tooltip title="Save">
              <MDButton variant="gradient" color="info" onClick={saveLayoutHandler}>
                <SaveIcon />
              </MDButton>
            </Tooltip> */}
          {/* </Box> */}

          <Box>
            {machineStatusData && valuePreference && (
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {generateDOM()}
              </Grid>
            )}
          </Box>
          <MDSnackbar
            color="success"
            icon="check"
            title="Success"
            content={successSB?.message}
            open={!!successSB?.message}
            onClose={closeSuccessSB}
            close={closeSuccessSB}
            bgWhite
          />
        </>
      )}
    </DashboardLayout>
  );
}

export default Index;
