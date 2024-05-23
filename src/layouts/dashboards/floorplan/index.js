import { useTheme } from "@emotion/react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SaveIcon from "@mui/icons-material/Save";
import {
  Autocomplete,
  Box,
  CardMedia,
  Chip,
  Divider,
  FormControl,
  Grid,
  Icon,
  IconButton,
  Modal,
  Skeleton,
  Tooltip
} from "@mui/material";
import { enumQueryNames } from "api/reactQueryConstant";
import {
  getHallDetailApi,
  getMachineDetailsApi,
  getOeeCalculationApi,
  updateHallApi
} from "api/watchmenApi";
import MDBadge from "components/MDBadge";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDCard from "components/MDCard";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import MDTypography from "components/MDTypography";
import { setSuccessMsg, useMaterialUIController } from "context";
import Footer from "components/Footer";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import { floorplanIconButton, uploadIconButton } from "components/Navbars/DashboardNavbar/styles";
import useAuth from "hooks/useAuth";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import useMachine from "hooks/useMachine";
import useRefreshToken from "hooks/useRefreshToken";
import translate from "i18n/translate";
import LabeledProgress from "components/labeledProgress";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { useMutation, useQuery } from "react-query";
import "react-resizable/css/styles.css";
import { Link, useParams } from "react-router-dom";
import PlotlyChart from "components/graph";
import { Stack } from "@mui/system";
import { uploadImageApi } from "api/watchmenApi";

const ReactGridLayout = WidthProvider(RGL);

const defaultProps = {
  className: "layout",
  onLayoutChange() {},
  cols: 100
};

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
  const [mounted, setMounted] = useState(false);
  const [machineStatus, setMachineStatus] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [, setMenu] = useState(null);
  const [successSB, setSuccessSB] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPopup, setFilterPopup] = useState(false);
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  const { axiosPrivate, isAuthSet } = useAxiosPrivate();
  const classes = useStyle();
  const [layouts, setLayouts] = useState("");
  const { machines } = useMachine();
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;
  const [uploadImageMachineId, setUploadImageMachineId] = useState(null);
  const fileInputRef = useRef();
  const [machineStatusData, setMachineStatusData] = useState(null);
  const [machineDisplayIndex, setMachineDisplayIndex] = useState(0);

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
    const interval = setInterval(() => {
      setMachineDisplayIndex((index) => {
        if (index === 1000) {
          return 0;
        }
        return index + 1;
      });
    }, [10000]);
    return () => clearInterval(interval);
  }, []);

  const fetchMachineData = async (machineId) => {
    try {
      const machineDetail = await getMachineDetailsApi(axiosPrivate, machineId);
      return machineDetail;
    } catch (err) {
      return null;
    }
  };

  const { isFetching: hallDetailsFetching, data: hallDetails } = useQuery(
    [id],
    () => getHallDetailApi(axiosPrivate, id),
    {
      enabled: auth.Token && isAuthSet,
      refetchInterval: 300000,
      onSuccess: (hallDetail) => {
        if (hallDetail.floor_plan) {
          setLayouts(
            hallDetail.floor_plan.map((floorPlan) => ({
              ...floorPlan,
              minH: 10,
              minW: 10
            }))
          );
        } else {
          setLayouts(null);
        }
        Promise.all(
          hallDetail?.machine_list?.map((machinne) => fetchMachineData(machinne.id))
        ).then((promiseResponse) => {
          setMachineStatus({
            machines: hallDetail?.machine_list?.map((machinne, idx) => ({
              ...machinne,
              ...promiseResponse[idx],
              image:
                promiseResponse?.[idx]?.status === 1
                  ? promiseResponse?.[idx]?.machine?.settings?.image_path
                  : null
            }))
          });
          setMounted(true);
        });
      }
    }
  );

  useQuery(
    [enumQueryNames.CALCULATION_DETAILS],
    () =>
      getOeeCalculationApi(axiosPrivate, {
        machine_list: hallDetails.machine_list.map((machinne) => +machinne.id),
        // date: moment(startDate).format("YYYY-MM-DD"),
        date: "2023-09-13",
        pulse: true,
        timeline: true,
        anomalies: false,
        cycles: false,
        energy_data: false,
        extern: true
      }),
    {
      enabled: !!(auth.Token && isAuthSet && hallDetails),
      onSuccess: (dayDetails) => {
        setMachineStatusData(dayDetails);
      },
      refetchInterval: 15000
    }
  );
  useEffect(() => {
    refresh();
  }, []);

  const generateLayout = () => {
    const availableHandles = ["se"];
    return _.map(
      machineStatus?.machines.sort((a, b) => a.id - b.id || a.name.localeCompare(b.name)),
      (item, i) => ({
        x: (i * 3) % 12,
        y: Math.floor(i / 4) * 2,
        w: 25,
        h: 22,
        i: i.toString(),
        // resizeHandles: availableHandles,
        minW: 25,
        minH: 22,
        isResizable: false,
        isDraggable: true
      })
    );
  };

  useEffect(() => {
    if (machineStatus?.machines && mounted && layouts === null) {
      setLayouts(generateLayout());
    }
  }, [machineStatus, mounted, layouts]);

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

  const handleImageUpload = (event, machineId) => {
    event.preventDefault();
    setUploadImageMachineId(machineId);
    fileInputRef.current.click();
  };

  const { mutate: uploadImage } = useMutation(
    (formData) => uploadImageApi(axiosPrivate, uploadImageMachineId, formData),
    {
      onSuccess: (data) => {
        setMachineStatus({
          machines: machineStatus?.machines.map((machine) => {
            if (machine.id === uploadImageMachineId) {
              return {
                ...machine,
                meta_frontend: {
                  ...machine.meta_frontend,
                  image: data?.image_path
                }
              };
            }
            return machine;
          })
        });
      }
    }
  );

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && uploadImageMachineId) {
      const formData = new FormData();
      formData.append("file", file);
      setIsLoading(true);
      uploadImage(formData);

      setIsLoading(false);
    }
    const reader = new FileReader();
    reader.onload = () => {};
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const generateDOM = () => {
    const floormachines = machineStatus?.machines?.sort(
      (a, b) => a.id - b.id || a.name.localeCompare(b.name)
    );
    const floorplan = floormachines?.map((machine, i) => {
      const currentMachine = machines?.machines?.find(
        (machineinfo) => machineinfo.id === machine.id
      );
      const currentMachineDetails = machineStatusData?.find(
        (curMachine) => curMachine.id === machine.id
      );
      return (
        <MDCard
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          sx={{
            display:
              selectedTag.length && !currentMachine?.tags?.some((r) => selectedTag.indexOf(r) >= 0)
                ? "none"
                : "",
            // alignItems: "center",
            // justifyContent: "center",
            // marginBottom: '30px',
            // paddingTop: "30px",
            boxShadow: "unset",
            background:
              machine.state === 2
                ? "#00FF0030"
                : machine.state === 1
                ? "#FFFF0030"
                : machine.state === 3
                ? "#80808030"
                : "#ff000030",
            zIndex: 3
          }}
        >
          <Stack
            sx={{
              position: "absolute",
              top: 0,
              left: 0
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
                <LabeledProgress
                  value={machine.health * 100}
                  count={machine.health * 100}
                  size={50}
                  machineStatusData={currentMachineDetails?.day_data}
                  height={170}
                  width={170}
                  fontSize="12px"
                  hollowSize="20%"
                  label={false}
                />
              </Box>
            </Grid>
          </Stack>
          <Stack
            flexDirection="row-reverse"
            alignItems="center"
            //  top="-30px"
            position="relative"
            right="0px"
            width="100%"
            height="30px"
          >
            <IconButton
              size="small"
              color="inherit"
              // sx={uploadIconButton}
              sx={{ width: "fit-content", zIndex: 999 }}
              aria-controls="upload-menu"
              aria-haspopup="true"
              onClick={(e) => {
                handleImageUpload(e, currentMachineDetails?.id);
              }}
            >
              <MDBadge color="error" size="xs" circular>
                <Icon>upload</Icon>
              </MDBadge>
            </IconButton>
            <Link
              target="_blank"
              to={{
                pathname: `/machines/${machine?.id}`
              }}
              rel="noopener noreferrer"
              style={{ color: "unset" }}
            >
              <IconButton size="small" color="inherit">
                <Icon>visibility</Icon>
              </IconButton>
            </Link>

            <input
              id={currentMachine?.id}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              value={null}
              style={{ display: "none" }}
            />
          </Stack>
          <Stack flexDirection="row" width="100%" justifyContent="center" ml={5}>
            <Stack>
              <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                {machine.name}
                <Divider sx={{ margin: "0.5rem 0" }} />
              </MDTypography>
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                  {machine?.shift_start} - {machine?.shift_end}
                </MDTypography>
                <Divider sx={{ margin: "0.5rem 0" }} />
              </MDBox>
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                  {machine?.run_time ? machine.run_time : "-"}
                </MDTypography>
              </MDBox>
            </Stack>
          </Stack>
          <CardMedia
            component="div"
            height="194"
            sx={{
              position: "absolute",
              zIndex: -1,
              margin: 0,
              padding: 0,
              opacity: 0.3,
              backgroundImage: `url(http://45.79.125.115:5123/restx/machine/image/open/${machine?.meta_frontend?.image_path})`,
              backgroundSize: "cover",
              width: "50%",
              height: "50%",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)"
            }}
          />

          <MDBox
            sx={{
              // overflowX: "auto",
              // display: machineDisplayIndex % machineStatusData.length === index ? "" : "none"
              width: "-webkit-fill-available"
            }}
            // key={machine.id}
          >
            <PlotlyChart
              value={machine?.timeline}
              showTimeline={machine?.timeline}
              showPulseMovement={false}
              floorplan
            />
          </MDBox>
        </MDCard>
      );
    });
    return floorplan;
  };

  const closeSuccessSB = () => setSuccessSB(null);

  const onDragStop = (layout) => {
    setLayouts(layout);
  };

  const onResizeStop = (layout, oldItem, newItem) => {
    setLayouts(
      layout.map((updatedLayoutItem) => {
        const floormachines = machineStatus?.machines?.sort(
          (a, b) => a.id - b.id || a.name.localeCompare(b.name)
        );

        if (updatedLayoutItem.i === newItem.i && floormachines[newItem.i].image) {
          const imageUrl = `http://45.79.125.115:5123/restx/machine/image/open/${
            floormachines[newItem.i].image
          }`;
          const img = new Image();
          img.src = imageUrl;
          const heighRatio = img.height / img.width;
          return {
            ...updatedLayoutItem,
            h: Math.ceil(newItem.w * heighRatio),
            isResizable: false,
            isDraggable: true
          };
        }
        return {
          ...updatedLayoutItem
        };
      })
    );
  };

  const { mutate: updateHallDetails, isLoading: updatingHall } = useMutation(
    ({ hallId, data }) => updateHallApi(axiosPrivate, hallId, data),
    {
      onSuccess: ({ message }) => {
        setSuccessMsg(dispatch, message);
      }
    }
  );

  const saveLayoutHandler = async () => {
    const data = {
      ...hallDetails,
      floor_plan: layouts
    };
    delete data.id;
    updateHallDetails({ hallId: id, data });
  };

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
      {hallDetailsFetching || !mounted || updatingHall ? (
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
          <Box sx={{ marginBottom: "23px" }} display="flex" justifyContent="end">
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
              </MDButton>
            </Tooltip>
            <Tooltip title="Save">
              <MDButton variant="gradient" color="info" onClick={saveLayoutHandler}>
                <SaveIcon />
              </MDButton>
            </Tooltip>
          </Box>
          <Box style={{ overflowX: "auto" }}>
            {mounted && machineStatus?.machines && layouts && (
              <ReactGridLayout
                layout={layouts}
                useCSSTransforms
                // allowOverlap
                {...defaultProps}
                onDragStop={onDragStop}
                // onResizeStop={onResizeStop}
                cols={84}
                rowHeight={5}
                maxRows={72}
                style={{ width: "1280px" }}
              >
                {generateDOM()}
              </ReactGridLayout>
            )}
          </Box>

          {/* {machineStatusData?.map((machine, index) => (
            <MDBox
              mt={3}
              sx={{
                overflowX: "auto",
                display: machineDisplayIndex % machineStatusData.length === index ? "" : "none"
              }}
              key={machine.id}
            >
              <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                {machine.name}
                <Divider sx={{ margin: "0.5rem 0" }} />
              </MDTypography>
              <PlotlyChart
                value={machine?.timeline}
                showTimeline={machine?.timeline}
                showPulseMovement={false}
                floorplan
              />
            </MDBox>
          ))} */}

          <MDSnackbar
            color="success"
            icon="check"
            title={translate("Success")}
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
