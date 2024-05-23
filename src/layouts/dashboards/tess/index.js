import { Box, Divider, Grid, Modal, useMediaQuery, useTheme } from "@mui/material";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";
import { socket } from "App";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";
import Footer from "components/Footer";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import Loader from "components/Loader";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import DataTable from "components/Tables/DataTable";
import useAxiosLocal from "hooks/useAxiosLocal";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import {
  useEffect,
  // useMemo,
  useState
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrls } from "api/reactQueryConstant";

function Tess() {
  const { tessId } = useParams();
  const { mode } = useParams();
  const navigate = useNavigate();
  const [tessData, setTessData] = useState("");
  const { axiosPrivate } = useAxiosPrivate();
  const axiosLocal = useAxiosLocal();
  const [controller, dispatch] = useMaterialUIController();
  const [setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [VideoData, setVideoData] = useState();
  const [CameraMode, setCameraMode] = useState(false);
  const [CamState, setCamState] = useState();
  const [MacAddress, setMacAddress] = useState("");
  const [ManualTriggerData, setManualTriggerData] = useState("");
  const { darkMode, openMachineForm } = controller;
  // const { columns: pColumns, rows: pRows } = projectsTableData();
  const [CameraOn, setCameraOn] = useState(false);
  const handlesetCameraOn = () => setCameraOn(!CameraOn);
  const [Grows, setGrows] = useState({ rows: [] });
  const [GtotalProgress, setGtotalProgress] = useState();
  const theme = useTheme();
  const xxxlOnly = useMediaQuery(theme.breakpoints.only("xxxl"));
  let rows = [];
  // let grows =[];

  const columns = [
    { Header: "Id", accessor: "id", width: "30%", align: "left" },
    { Header: translate("Measure"), accessor: "measure", align: "left" },
    { Header: translate("Feature"), accessor: "feature", align: "center" },
    { Header: translate("Image"), accessor: "image", align: "center" }
  ];

  if (ManualTriggerData != "" && ManualTriggerData != "undefined") {
    ManualTriggerData?.results.map((table) => {
      rows.push({
        id: (
          <MDTypography component="a" href="#" variant="button" color="text" fontWeight="medium">
            {table.id}
          </MDTypography>
        ),
        measure: (
          <MDTypography component="a" href="#" variant="button" color="text" fontWeight="medium">
            {table.measure}
          </MDTypography>
        ),
        feature: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            {table.feature}
          </MDTypography>
        ),
        image: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            <img
              width="100"
              height="100"
              alt="image"
              src={`data:image/jpeg;base64,${table.image}`}
            />
          </MDTypography>
        )
      });
    });
  }
  const fetchTess = async () => {
    try {
      const response = await axiosPrivate.get(apiUrls.tess + tessId);
      setIsPageLoading(false);
      setTessData(response.data);
    } catch (err) {
      // setErrMsg(err?.message);
      setIsPageLoading(false);
      console.log(err?.message);
    }
  };

  const fetchCamstate = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/camera/cam_state?serial_number=${tessData?.tess?.mac_address}`
      );
      let Data = await response.json();
      // setCamState(Data);
    } catch (err) {
      setCamState(null);
    }
  };

  if (CamState != "" && CamState != undefined) {
    if (CamState?.cam_state == "on") {
      setCameraOn(true);
    }
  }

  // const fetchVideoData = async () => {
  //     try {
  //         // const response = await axiosLocal.get(`camera/image_stream`);
  //         const response = await axiosLocal.get(`camera/image_stream?serial_number=${tessData?.tess?.mac_address}`);
  //         setVideoData(response.data);

  //     } catch (err) {
  //         // setErrMsg(err?.message);
  //         console.log(err?.message)
  //     }
  // };

  const ManualTrigger = async () => {
    try {
      const response = await fetch(
        // `http://127.0.0.1:5000/api/camera/measure?serial_number=${tessData?.tess?.mac_address}`
        `http://127.0.0.1:5000/api/camera/measure?serial_number=0c1we792bf37`
      );

      let actualData = await response.json();
      setManualTriggerData(actualData);
    } catch (err) {
      setManualTriggerData(null);
    }
  };

  const getGlobal = () => {
    setTimeout(() => {
      socket.emit("join_topic", "1.t.0c1we792bf37.stream");

      socket.on("stream", (message) => {
        setGtotalProgress(message?.total_processed);
        message?.results.map((data) => {
          let table1 = {
            id: (
              <MDTypography
                component="a"
                href="#"
                variant="button"
                color="text"
                fontWeight="medium"
              >
                {data?.id}
              </MDTypography>
            ),
            measure: (
              <MDTypography
                component="a"
                href="#"
                variant="button"
                color="text"
                fontWeight="medium"
              >
                {data?.measure}
              </MDTypography>
            ),
            feature: (
              <MDTypography
                component="a"
                href="#"
                variant="caption"
                color="text"
                fontWeight="medium"
              >
                {data?.feature}
              </MDTypography>
            ),
            image: (
              <MDTypography
                component="a"
                href="#"
                variant="caption"
                color="text"
                fontWeight="medium"
              >
                <img
                  width="100"
                  height="100"
                  alt="image"
                  src={`data:image/jpeg;base64,${data?.image}`}
                />
              </MDTypography>
            )
          };
          let list = [...Grows.rows, table1];
          setGrows((Grows) => ({ rows: [...Grows.rows, table1] }));
        });
      });
    }, 3000);
  };

  if (CameraOn == true) {
    const checke = "checked";
  } else {
    const checke = "";
  }

  useEffect(() => {
    const controllers = new AbortController();
    // fetchTess()
    return () => {
      controllers.abort();
    };
  }, []);

  useEffect(() => {
    const controllers = new AbortController();
    if (tessData?.tess?.mac_address != "" && tessData?.tess?.mac_address != undefined) {
      fetchCamstate();
      if (mode == "Global") {
        getGlobal();
      }
      setVideoData(
        `http://127.0.0.1:5000/api/camera/image_stream?serial_number=${tessData?.tess?.mac_address}`
      );
      // fetchVideoData();
    }

    return () => {
      controllers.abort();
    };
  }, [tessData, mode]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {isPageLoading ? (
        <Loader />
      ) : (
        <>
          <Modal
            open={CameraMode}
            onClose={false}
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
                  {translate("Camera")}
                </MDTypography>

                <MDBox mb={2}>
                  <MDTypography
                    variant="button"
                    fontWeight="regular"
                    color="text"
                    sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                  >
                    {translate("Off")}
                  </MDTypography>
                  <Switch checke onChange={handlesetCameraOn} />
                  <MDTypography
                    variant="button"
                    fontWeight="regular"
                    color="text"
                    sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                  >
                    {translate("On")}
                  </MDTypography>
                </MDBox>

                <MDBox mb={2}>
                  <MDButton
                    variant="outlined"
                    color={darkMode ? "light" : "dark"}
                    onClick={() =>
                      navigate(`/machines/tess/local/${tessId}`, {
                        state: { name: tessData?.tess?.name }
                      })
                    }
                  >
                    {loading ? "Local" : "Done"}
                  </MDButton>
                </MDBox>
              </MDBox>
            </Box>
          </Modal>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <MDTypography
              //   variant="v4"
              fontWeight="bold"
              color="text"
              textTransform="capitalize"
            >
              <h3>
                {tessData.tess?.name}
                <MDBox
                  className="d_box"
                  lineHeight={xxxlOnly ? 2 : 1}
                  sx={{
                    backgroundColor: tessData?.status == 1 ? "green" : "red",
                    color: tessData?.status == 1 ? "green" : "red",
                    borderRadius: "50px 50px 50px 50px",
                    width: "20px",
                    height: "20px",
                    display: "inline-block",
                    marginLeft: "10px"
                    // marginLeft: mdDown ? smDown ? "-14px" : "30px" : "25px",
                  }}
                ></MDBox>
              </h3>
            </MDTypography>
          </Grid>

          {(() => {
            if (mode == "local") {
              return (
                <div>
                  <MDBox mb={2} textAlign="center">
                    <MDButton
                      variant="outlined"
                      color={darkMode ? "light" : "dark"}
                      onClick={ManualTrigger}
                    >
                      {loading ? "Creating Machine" : "Manual-trigger"}
                    </MDButton>
                    <Icon
                      fontSize="small"
                      color="inherit"
                      onClick={() => {
                        setCameraMode(true);
                      }}
                      style={{ marginLeft: "5%", marginTop: "1%", color: "#ffff" }}
                    >
                      {translate("settings")}
                    </Icon>
                  </MDBox>
                  <MDBox></MDBox>
                  {/* <Card  > */}
                  <Grid
                    margin="0 auto"
                    display="flex"
                    justifyContent="center"
                    xs={8}
                    sm={8}
                    lg={8}
                    container
                    spacing={0}
                    // alignItems="center"
                    // justifyContent="start"
                    pl={2}
                    py={0}
                    style={{ cursor: "pointer" }}
                  >
                    <Grid item md={10}>
                      <MDBox lineHeight={2.3}>
                        <MDTypography
                          variant="button"
                          fontWeight="bold"
                          color="text"
                          textTransform="capitalize"
                        >
                          {/* { (() => {
                                                            if(CamState?.cam_state == "on") {
                                                                return (
                                                                    <img
                                                                    width="500"
                                                                    height="500"
                                                                    alt="stream"
                                                                    src={VideoData}
                                                                />
                                                                )
                                                            }else{
                                                                return (
                                                                    <img
                                                                    width="500"
                                                                    height="500"
                                                                    alt="stream"
                                                                    src={""}
                                                                />
                                                                )
                                                            }
                                                         } )} */}

                          {/* {CamState?.cam_state == "on" ? */}
                          <img width="500" height="500" alt="stream" src={VideoData} />
                          {/* :
                                                        <img
                                                            width="500"
                                                            height="500"
                                                            alt="stream"
                                                            src={""}
                                                        />
                                                    } */}
                        </MDTypography>
                        <Grid item mx={0} my={0.5}>
                          <MDBox
                            lineHeight={1}
                            textAlign="center"
                            marginBottom="45px"
                            fontSize="2.25rem"
                          >
                            <MDTypography
                              variant="v4"
                              fontWeight="bold"
                              color="text"
                              textTransform="capitalize"
                            ></MDTypography>
                          </MDBox>
                        </Grid>
                      </MDBox>
                    </Grid>
                  </Grid>
                  {/* </Card> */}
                  <Divider />
                  <Grid item xs={12} mt={6} mb={6}>
                    <Card>
                      <MDBox
                        mx={2}
                        mt={-3}
                        py={3}
                        px={2}
                        variant="gradient"
                        bgColor="dark"
                        borderRadius="lg"
                        coloredShadow="dark"
                      >
                        <MDTypography variant="h6" color="white">
                          {translate("FeatureResponse")}
                        </MDTypography>
                      </MDBox>
                      <MDBox pt={3}>
                        <DataTable
                          table={{ columns: columns, rows: rows }}
                          isSorted={false}
                          entriesPerPage={false}
                          showTotalEntries={false}
                          noEndBorder
                        />
                      </MDBox>
                    </Card>
                  </Grid>
                  <Grid item xs={4} sm={4} md={12} lg={4} justifyContent="center">
                    <MDBox mb={2} lineHeight={1}>
                      <Card xs={8} sm={8} md={8} lg={8}>
                        <Grid
                          container
                          spacing={0}
                          alignItems="center"
                          justifyContent="start"
                          pl={2}
                          py={0}
                          style={{ cursor: "pointer" }}
                        >
                          <Grid item md={12}>
                            <MDBox lineHeight={2.3}>
                              <MDTypography
                                variant="button"
                                fontWeight="bold"
                                color="text"
                                textTransform="capitalize"
                              >
                                {translate("Total Processed")}
                              </MDTypography>
                              <br></br>
                              <Grid item mx={0} my={0.5}>
                                <MDBox
                                  lineHeight={1}
                                  textAlign="center"
                                  marginBottom=""
                                  fontSize="2.25rem"
                                >
                                  <MDTypography
                                    variant="v4"
                                    fontWeight="bold"
                                    color="text"
                                    textTransform="capitalize"
                                  >
                                    {ManualTriggerData?.total_processed}
                                  </MDTypography>
                                </MDBox>
                              </Grid>
                              <br></br>
                            </MDBox>
                          </Grid>
                        </Grid>
                      </Card>
                    </MDBox>
                  </Grid>
                </div>
              );
            } else {
              return (
                <div>
                  <Grid item xs={12} mt={6} mb={6}>
                    <Card>
                      <MDBox
                        mx={2}
                        mt={-3}
                        py={3}
                        px={2}
                        variant="gradient"
                        bgColor="dark"
                        borderRadius="lg"
                        coloredShadow="dark"
                      >
                        <MDTypography variant="h6" color="white">
                          {translate("FeatureResponse")}
                        </MDTypography>
                      </MDBox>
                      <MDBox pt={3}>
                        <DataTable
                          table={{ columns: columns, rows: Grows.rows }}
                          isSorted={false}
                          entriesPerPage={false}
                          showTotalEntries={false}
                          noEndBorder
                        />
                      </MDBox>
                    </Card>
                  </Grid>

                  <Grid item xs={4} sm={4} md={12} lg={4} justifyContent="center">
                    <MDBox mb={2} lineHeight={1}>
                      <Card xs={8} sm={8} md={8} lg={8}>
                        <Grid
                          container
                          spacing={0}
                          alignItems="center"
                          justifyContent="start"
                          pl={2}
                          py={0}
                          style={{ cursor: "pointer" }}
                        >
                          <Grid item md={12}>
                            <MDBox lineHeight={2.3}>
                              <MDTypography
                                variant="button"
                                fontWeight="bold"
                                color="text"
                                textTransform="capitalize"
                              >
                                {translate("Total Processed")}
                              </MDTypography>
                              <br></br>
                              <Grid item mx={0} my={0.5}>
                                <MDBox
                                  lineHeight={1}
                                  textAlign="center"
                                  marginBottom=""
                                  fontSize="2.25rem"
                                >
                                  <MDTypography
                                    variant="v4"
                                    fontWeight="bold"
                                    color="text"
                                    textTransform="capitalize"
                                  >
                                    {GtotalProgress}
                                  </MDTypography>
                                </MDBox>
                              </Grid>
                              <br></br>
                            </MDBox>
                          </Grid>
                        </Grid>
                      </Card>
                    </MDBox>
                  </Grid>
                </div>
              );
            }
          })()}
        </>
      )}
    </DashboardLayout>
  );
}

export default Tess;
