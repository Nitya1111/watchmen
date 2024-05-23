/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/prop-types */
import { useTheme } from "@emotion/react";
import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import colors from "assets/theme-dark/base/colors";
import MDBox from "components/MDBox";
import RatingPercentage from "components/rating";
import { useMaterialUIController } from "context";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";

const { background, white, grey } = colors;

function LabeledProgress({
  value = 0,
  size = "",
  count = 0,
  tess,
  machineStatusData,
  width,
  height = 250,
  fontSize = "18px",
  hollowSize = "35%",
  label = true,
  style = {},
  overallRating = 0,
  tooltipTitle = "",
  overallPerformance = 0,
  tooltipTitlePer = "",
  valuePreference = null
}) {
  const [controller] = useMaterialUIController();
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { darkMode } = controller;

  const state = {
    series:
      // (machineStatusData.oee * 100).toFixed(1) === "0.0"
      //   ? ZERO_PROGRESS
      //   :
      [
        ((machineStatusData?.performance || 0) * 100).toFixed(1),
        ((machineStatusData?.availability || 0) * 100).toFixed(1),
        ((machineStatusData?.oee || 0) * 100).toFixed(1)
      ],
    options: {
      chart: {
        type: "radialBar",
        margin: 0
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: hollowSize
          },
          track: {
            background: darkMode
              ? !machineStatusData?.oee
                ? grey[700]
                : background.sidenav
              : white.main
          },
          dataLabels: {
            name: {
              fontSize,
              offsetY: -7
            },
            value: {
              fontSize,
              color: darkMode ? "#FFF" : "#7b809a",
              offsetY: label ? -4 : -10
            },
            total: {
              show: true,
              label: label ? "OEE" : "",
              fontSize,
              color: darkMode ? "#FFF" : "#59c185",
              formatter: (w) => `${w.config.series[valuePreference === "performance" ? 0 : 2]}%`
            }
          }
        }
      },
      labels: label ? ["PRO", "AVL", "OEE"] : ["", "", ""],
      colors: [
        darkMode ? colors.Productivity.dark : colors.Productivity.main,
        darkMode ? colors.Availability.dark : colors.Availability.main,
        darkMode ? colors.OEE.dark : colors.OEE.main
      ]
    }
  };

  return (
    <Box sx={{ position: "relative", display: "inline-flex", ...style }}>
      {machineStatusData ? (
        <>
          <MDBox sx={{ position: "absolute", right: "8px", top: "8px" }}>
            <RatingPercentage
              overallRating={overallRating}
              currentRating={machineStatusData?.oee || 0}
              title={tooltipTitle}
            />
          </MDBox>
          <MDBox sx={{ position: "absolute", right: "-22%", top: "8px" }}>
            <RatingPercentage
              overallRating={overallPerformance}
              currentRating={machineStatusData?.performance || 0}
              title={tooltipTitlePer}
            />
          </MDBox>
          {smDown ? (
            <Chart
              options={state.options}
              series={state.series}
              type="radialBar"
              height={height}
              width={width || 200}
            />
          ) : (
            <Chart
              options={state.options}
              series={state.series}
              type="radialBar"
              height={height}
              width={width || 300}
            />
          )}
        </>
      ) : (
        <>
          <CircularProgress
            variant="determinate"
            value={value}
            size={size}
            color={value >= 75 ? "success" : value < 75 && value >= 35 ? "warning" : "error"}
            thickness="5"
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Typography
              variant="h6"
              component="div"
              color={value >= 75 ? "green" : value < 75 && value >= 35 ? "#FB8C00" : "red"}
            >
              {`${Math.round(count || 0)}${tess ? "" : "%"}`}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

// Setting default values for the props of LabeledProgress
LabeledProgress.defaultProps = {
  value: 0,
  count: 0,
  tess: false
};

LabeledProgress.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number,
  count: PropTypes.number,
  size: PropTypes.number.isRequired,
  tess: PropTypes.bool
};

export default LabeledProgress;
