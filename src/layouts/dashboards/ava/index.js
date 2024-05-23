import { useMediaQuery, useTheme } from "@mui/material";
import Card from "@mui/material/Card";
import { socket } from "App";
import { apiUrls } from "api/reactQueryConstant";
import colors from "assets/theme-dark/base/colors";
import Footer from "components/Footer";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import Loader from "components/Loader";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import Plotly from "plotly.js-basic-dist-min";
import {
  useEffect,
  // useMemo,
  useState
} from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import { useParams } from "react-router-dom";

const Plot = createPlotlyComponent(Plotly);
const { background } = colors;
// import LineChart from "./line";

const useStyle = () => {
  return {
    graphCard: {
      // [theme.breakpoints.down("md")]: {
      //   width: "530px"
      // },
      // [theme.breakpoints.down("sm")]: {
      //   width: "350px"
      // },
      // backgroundColor: 'green',
      width: "fit-content",
      margin: "20px 0 ",
      display: "flex",
      flexDirection: "column"
    }
  };
};

function Ava() {
  const { avaId } = useParams();
  const { axiosPrivate } = useAxiosPrivate();
  const [setErrMsg] = useState("");
  const [avaData, setAvaData] = useState("");
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const [vibrationData, setVibrationData] = useState({
    mag_3D_stream: [],
    mag_2D_stream: [],
    rms_vib_stream: [[], [], []],
    temp_stream: []
  });
  const [rms_stream, setRms_stream] = useState({
    mag_3D_stream: [],
    mag_2D_stream: [],
    rms_vib_stream: [[], [], []],
    temp_stream: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const classes = useStyle();
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  let points = smDown ? 16 : mdDown ? 31 : 61;
  let x_label = [...Array(points).keys()];
  x_label.shift();

  const fetchAva = async () => {
    try {
      const response = await axiosPrivate.get(apiUrls.ava + avaId);
      setIsLoading(false);
      setAvaData(response.data);
    } catch (err) {
      setIsLoading(false);
      setErrMsg(err?.message);
    }
  };

  const handleJoinTopic = () => {
    socket.emit("join_room", avaData?.ava?.topic);
    socket.emit("join_topic", avaData?.ava?.topic);
  };

  const screenWidth = window.innerWidth;

  // socket.on("rms_stream", (message) => {
  //   console.log("mess", message);
  //   console.log("mess", socket.id);
  //   // message.rms_vib_stream.map(
  //   //   (vib) => console.log("vibrations", vib)
  //   // setVibrationData((previous) => [
  //   //   ...previous,
  //   //   {
  //   //     year: Date.now(),
  //   //     type: "x",
  //   //     value: vib[0],
  //   //   },
  //   //   {
  //   //     year: Date.now(),
  //   //     type: "y",
  //   //     value: vib[1],
  //   //   },
  //   //   {
  //   //     year: Date.now(),
  //   //     type: "z",
  //   //     value: vib[2],
  //   //   },
  //   // ])
  //   // );
  // });
  // console.log("vibdata", vibrationData);

  const handleLeaveTopic = () => {
    socket.emit("leave_topic", avaData?.ava?.topic);
  };

  useEffect(() => {
    socket.on("rms_stream", (message) => {
      setRms_stream({ ...message });
    });
  }, []);

  // socket.on("rms_stream", (message) => {
  //   console.log("mess", message);

  //   // message.rms_vib_stream.map((vib) => {
  //   //   const newState = vibrationData.datasets.map((obj) => {
  //   //     // 👇️ if  lable is x, update data property
  //   //     if (obj.label === "x") {
  //   //       return { ...obj, data: [...obj.data, vib[0]] };
  //   //     }
  //   //     // 👇️ if lable is y, update data property
  //   //     if (obj.label === "y") {
  //   //       return { ...obj, data: [...obj.data, vib[1]] };
  //   //     }
  //   //     // 👇️ if lable is z, update data property
  //   //     if (obj.label === "z") {
  //   //       return { ...obj, data: [...obj.data, vib[2]] };
  //   //     }

  //   //     // 👇️ otherwise return object as is
  //   //     return obj;
  //   //   });

  //   //   return setVibrationData((previous) => ({ ...previous, datasets: newState }));
  //   // });
  // });

  // useMemo(
  //   () =>
  //     socket.on("rms_stream", (message) => {
  //       console.log("mess", message);

  //       message.rms_vib_stream.map(
  //         (vib) => {
  //           console.log("vib", vib[0]);
  //           console.log("vib", vib[1]);
  //           console.log("vib", vib[2]);
  //           // setVibrationData((previous) => ({ datasets: { ...previous.datasets,   data: vib[0] } }))
  //           // setVibrationData({
  //           //   ...vibrationData,
  //           //   datasets: [...vibrationData.datasets, vibrationData.datasets[0].data.concat(vib[0])],
  //           // });
  //           // return console.log(vib);

  //           const newState = vibrationData.datasets.map((obj) => {
  //             // 👇️ if  lable is x, update data property
  //             if (obj.label === "x") {
  //               return { ...obj, data: [...obj.data, vib[0]] };
  //             }
  //             // 👇️ if lable is y, update data property
  //             if (obj.label === "y") {
  //               return { ...obj, data: [...obj.data, vib[1]] };
  //             }
  //             // 👇️ if lable is z, update data property
  //             if (obj.label === "z") {
  //               return { ...obj, data: [...obj.data, vib[2]] };
  //             }

  //             // 👇️ otherwise return object as is
  //             return obj;
  //           });

  //           return setVibrationData((previous) => ({ ...previous, datasets: newState }));
  //         }
  //         // vibrationData.datasets[0].data.concat(vib[0])
  //       );

  //       // setVibrationData(message.rms_vib_stream[0]);
  //       // if (vibrationData.length < 149) {
  //       console.log("less");
  //       console.log("less", vibrationData);
  //       // message.rms_vib_stream.map((vib) =>
  //       //   setVibrationData((previous) => [
  //       //     ...previous,
  //       //     {
  //       //       year: Date.now(),
  //       //       type: "x",
  //       //       value: vib[0],
  //       //     },
  //       //     {
  //       //       year: Date.now(),
  //       //       type: "y",
  //       //       value: vib[1],
  //       //     },
  //       //     {
  //       //       year: Date.now(),
  //       //       type: "z",
  //       //       value: vib[2],
  //       //     },
  //       //   ])
  //       // );
  //       // } else {
  //       //   console.log("more");
  //       //   setVibrationData([]);
  //       //   message.rms_vib_stream.map((vib) =>
  //       //     setVibrationData((previous) => [
  //       //       ...previous,
  //       //       {
  //       //         year: Date.now(),
  //       //         type: "x",
  //       //         value: vib[0],
  //       //       },
  //       //       {
  //       //         year: Date.now(),
  //       //         type: "y",
  //       //         value: vib[1],
  //       //       },
  //       //       {
  //       //         year: Date.now(),
  //       //         type: "z",
  //       //         value: vib[2],
  //       //       },
  //       //     ])
  //       //   );
  //       // }
  //     }),
  //   []
  // );

  // if (vibrationData?.length < 153) {
  // useMemo(
  //   () =>
  //     socket.on("rms_stream", (message) => {
  //       message.rms_vib_stream.map(
  //         (vib) => console.log(vib)
  // setVibrationData((previous) => [
  //   ...previous,
  //   {
  //     year: Date.now(),
  //     type: "x",
  //     value: vib[0],
  //   },
  //   {
  //     year: Date.now(),
  //     type: "y",
  //     value: vib[1],
  //   },
  //   {
  //     year: Date.now(),
  //     type: "z",
  //     value: vib[2],
  //   },
  // ])
  //       );
  //     }),
  //   []
  // );
  // } else {
  //   setVibrationData([]);
  //   console.log("newlen", vibrationData.length);
  //   console.log("closed");
  // }

  useEffect(() => {
    const controllers = new AbortController();

    fetchAva();

    return () => {
      controllers.abort();
    };
  }, []);

  // console.log("vib", vibrationData);

  // const defaultLineChartData = {
  //   labels: ["Apr", "May", "Jun"],
  //   datasets: [
  //     {
  //       label: "Organic Search",
  //       color: "info",
  //       data: [50, 40, 300],
  //     },
  //     {
  //       label: "Referral",
  //       color: "dark",
  //       data: [30, 90, 40],
  //     },
  //     {
  //       label: "Direct",
  //       color: "primary",
  //       data: [40, 80, 70],
  //     },
  //   ],
  // };

  useEffect(() => {
    let mag_2D_stream = [];
    let mag_3D_stream = [];
    let temp_stream = [];
    let rms_vib_stream = [[], [], []];
    if (vibrationData.mag_2D_stream.length > points) {
      let current_mag_2D_stream = vibrationData.mag_2D_stream.slice(1);
      mag_2D_stream = [...current_mag_2D_stream, ...rms_stream.mag_2D_stream];
    } else {
      mag_2D_stream = [...vibrationData.mag_2D_stream, ...rms_stream.mag_2D_stream];
    }
    if (vibrationData.mag_3D_stream.length > points) {
      let current_mag_3D_stream = vibrationData.mag_3D_stream.slice(3);
      mag_3D_stream = [...current_mag_3D_stream, ...rms_stream.mag_3D_stream];
    } else {
      mag_3D_stream = [...vibrationData.mag_3D_stream, ...rms_stream.mag_3D_stream];
    }
    if (vibrationData.temp_stream.length > points) {
      let current_temp_stream = vibrationData.temp_stream.slice(1);
      temp_stream = [...current_temp_stream, ...rms_stream.temp_stream];
    } else {
      temp_stream = [...vibrationData.temp_stream, ...rms_stream.temp_stream];
    }

    if (vibrationData.rms_vib_stream[0].length > points) {
      rms_vib_stream = [
        [...vibrationData.rms_vib_stream[0].slice(3), ...rms_stream.rms_vib_stream[0]],
        [...vibrationData.rms_vib_stream[1].slice(3), ...rms_stream.rms_vib_stream[1]],
        [...vibrationData.rms_vib_stream[2].slice(3), ...rms_stream.rms_vib_stream[2]]
      ];
    } else {
      rms_vib_stream = [
        [...vibrationData.rms_vib_stream[0], ...rms_stream.rms_vib_stream[0]],
        [...vibrationData.rms_vib_stream[1], ...rms_stream.rms_vib_stream[1]],
        [...vibrationData.rms_vib_stream[2], ...rms_stream.rms_vib_stream[2]]
      ];
    }
    setVibrationData({
      mag_2D_stream: mag_2D_stream,
      mag_3D_stream: mag_3D_stream,
      temp_stream: temp_stream,
      rms_vib_stream: rms_vib_stream
    });
  }, [rms_stream]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <MDTypography
            //   variant="v4"
            fontWeight="bold"
            color="text"
            textTransform="capitalize"
          >
            <h3>
              {avaData.ava?.name}
              <MDBox
                className="d_box"
                sx={{
                  backgroundColor: avaData?.status == 1 ? "green" : "red",
                  color: avaData?.status == 1 ? "green" : "red",
                  borderRadius: "50px 50px 50px 50px",
                  width: "20px",
                  height: "20px",
                  display: "inline-block",
                  marginLeft: "10px"
                }}
              ></MDBox>
            </h3>
            {/* <p>Id: {avaId}</p> */}
          </MDTypography>

          <MDBox
            sx={{
              display: "flex",
              justifyContent: "space-evenly"
            }}
          >
            <MDBox mb={3}>
              <MDButton onClick={handleJoinTopic} color="primary">
                {translate("Live Data")}
              </MDButton>
            </MDBox>
            <MDBox mb={3}>
              <MDButton onClick={handleLeaveTopic}>{translate("Stop Live Data")}</MDButton>
            </MDBox>
          </MDBox>
          {/* {avaData?.ava?.settings?.graph_acc && vibrationData && (
        <MDBox mb={3}>
          <LineChart vibrationData={vibrationData} />
        </MDBox> */}
          {/* <MDBox mb={6}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DefaultLineChart chart={{
              labels: mag_2d_labels,
              datasets: [
                {
                  label: "x",
                  color: "info",
                  data: vibrationData.mag_2D_stream,
                }]
            }
            } />
          </Grid>
        </Grid>
      </MDBox> */}
          <Card sx={classes.graphCard}>
            <MDTypography
              variant="button"
              fontWeight="bold"
              color="text"
              textTransform="capitalize"
              pl={3}
              pt={4}
            >
              {translate("Vibration")}
            </MDTypography>
            <Plot
              data={[
                {
                  x: x_label,
                  y: vibrationData.rms_vib_stream[0],
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "#80CAF6" }
                },
                {
                  x: x_label,
                  y: vibrationData.rms_vib_stream[1],
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "#DF56F1" }
                },
                {
                  x: x_label,
                  y: vibrationData.rms_vib_stream[2],
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "#FFFFFF" }
                }
              ]}
              layout={{
                xaxis: { range: [-1, 60], rangemode: "tozero" },
                yaxis: { rangemode: "tozero" },
                paper_bgcolor: background.card,
                plot_bgcolor: background.card,
                font: {
                  color: "#f0f2f5"
                },
                showlegend: false,
                autosize: true,
                width:
                  screenWidth > 1200
                    ? miniSidenav
                      ? screenWidth - 200
                      : screenWidth - 350
                    : screenWidth - 100,
                margin: smDown
                  ? {
                      l: 20,
                      r: 20,
                      b: 70,
                      t: 50
                    }
                  : {
                      l: 70,
                      r: 70,
                      b: 70,
                      t: 50
                    }
              }}
            />
          </Card>

          <Card sx={classes.graphCard}>
            <MDTypography
              variant="button"
              fontWeight="bold"
              color="text"
              textTransform="capitalize"
              pl={3}
              pt={4}
            >
              {translate("Temperature")}
            </MDTypography>
            <Plot
              data={[
                {
                  x: x_label,
                  y: vibrationData.temp_stream,

                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "#80CAF6" }
                }
              ]}
              layout={{
                xaxis: { range: [-1, 60], rangemode: "tozero" },
                yaxis: { rangemode: "tozero" },
                paper_bgcolor: background.card,
                plot_bgcolor: background.card,
                font: {
                  color: "#f0f2f5"
                },
                showlegend: false,
                width:
                  screenWidth > 1200
                    ? miniSidenav
                      ? screenWidth - 200
                      : screenWidth - 350
                    : screenWidth - 100,
                margin: smDown
                  ? {
                      l: 20,
                      r: 20,
                      b: 70,
                      t: 50
                    }
                  : {
                      l: 70,
                      r: 70,
                      b: 70,
                      t: 50
                    }
              }}
            />
          </Card>

          <Card sx={classes.graphCard} my={2}>
            <MDTypography
              variant="button"
              fontWeight="bold"
              color="text"
              textTransform="capitalize"
              pl={3}
              pt={4}
            >
              Mag_2D
            </MDTypography>
            <Plot
              data={[
                {
                  x: x_label,
                  y: vibrationData.mag_2D_stream,
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "#80CAF6" }
                }
              ]}
              layout={{
                xaxis: { range: [-1, 60], rangemode: "tozero" },
                yaxis: { rangemode: "tozero" },
                paper_bgcolor: background.card,
                plot_bgcolor: background.card,
                font: {
                  color: "#f0f2f5"
                },
                showlegend: false,
                width:
                  screenWidth > 1200
                    ? miniSidenav
                      ? screenWidth - 200
                      : screenWidth - 350
                    : screenWidth - 100,
                margin: smDown
                  ? {
                      l: 20,
                      r: 20,
                      b: 70,
                      t: 50
                    }
                  : {
                      l: 70,
                      r: 70,
                      b: 70,
                      t: 50
                    }
              }}
            />
          </Card>

          <Card sx={classes.graphCard} my={2}>
            <MDTypography
              variant="button"
              fontWeight="bold"
              color="text"
              textTransform="capitalize"
              pl={3}
              pt={4}
            >
              Mag_3D
            </MDTypography>
            <Plot
              data={[
                {
                  x: x_label,
                  y: vibrationData.mag_3D_stream,
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "#80CAF6" }
                }
              ]}
              layout={{
                xaxis: { range: [-1, 60], rangemode: "tozero" },
                yaxis: { rangemode: "tozero" },
                autosize: true,
                paper_bgcolor: background.card,
                plot_bgcolor: background.card,
                font: {
                  color: "#f0f2f5"
                },
                showlegend: false,
                width:
                  screenWidth > 1200
                    ? miniSidenav
                      ? screenWidth - 200
                      : screenWidth - 350
                    : screenWidth - 100,
                margin: smDown
                  ? {
                      l: 20,
                      r: 20,
                      b: 70,
                      t: 50
                    }
                  : {
                      l: 70,
                      r: 70,
                      b: 70,
                      t: 50
                    }
              }}
            />
          </Card>
        </>
      )}

      {/* )} */}
      {/* <p>socket: {socketMessage?.rms_vib_stream}</p> */}
      {/* <MDBox mb={3}>{graphData.render()}</MDBox> */}
    </DashboardLayout>
  );
}

export default Ava;
