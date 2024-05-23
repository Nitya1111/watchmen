/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
// Material Dashboard 2 PRO React components
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Grid, Tooltip } from "@mui/material";
import anomalySvg from "assets/images/anomaly.svg";
import cyclesSvg from "assets/images/cycles.svg";
import energyConsumptionSvg from "assets/images/energy_consumption.svg";
import energyWastageSvg from "assets/images/energy_wastage.svg";
import colors from "assets/theme-dark/base/colors";
import MDBox from "components/MDBox";
import MDCard from "components/MDCard";
import MDProgress from "components/MDProgress";
import MDTypography from "components/MDTypography";
import RatingPercentage from "components/rating";
import useMachine from "hooks/useMachine";
import moment from "moment";
import { Link } from "react-router-dom";
import LabeledProgress from "components/labeledProgress";

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

function MachinCompareCard({ color, badge, shadow, machinedata, date, ratings }) {
  const totalSeconds = machinedata?.total_duration;
  const totalDuration =
    machinedata?.total_duration?.toString() &&
    moment.duration(machinedata?.total_duration, "seconds");
  const totalDurationStr =
    totalDuration &&
    `${(totalDuration.days() * 24 + totalDuration.hours())
      .toString()
      .padStart(2, "0")}:${totalDuration.minutes().toString().padStart(2, "0")}:${totalDuration
        .seconds()
        .toString()
        .padStart(2, "0")}`;
  const productionSeconds = machinedata?.production_duration;
  const productionDuration =
    machinedata?.production_duration?.toString() &&
    moment.duration(machinedata?.production_duration, "seconds");
  const productionDurationStr =
    productionDuration &&
    `${productionDuration?.hours()?.toString().padStart(2, "0")}:${productionDuration
      ?.minutes()
      ?.toString()
      .padStart(2, "0")}:${productionDuration?.seconds()?.toString().padStart(2, "0")}`;
  const idleSeconds = machinedata?.idle_duration;
  const idleDuration =
    machinedata?.idle_duration?.toString() &&
    moment.duration(machinedata?.idle_duration, "seconds");
  const idleDurationStr =
    idleDuration &&
    `${idleDuration?.hours()?.toString().padStart(2, "0")}:${idleDuration
      ?.minutes()
      ?.toString()
      .padStart(2, "0")}:${idleDuration?.seconds()?.toString().padStart(2, "0")}`;
  const offSeconds = machinedata?.off_duration;
  const offDuration =
    machinedata?.off_duration?.toString() &&
    moment.duration(machinedata?.off_duration, "seconds");
  const offDurationStr =
    offDuration &&
    `${offDuration?.hours()?.toString().padStart(2, "0")}:${offDuration
      ?.minutes()
      ?.toString()
      .padStart(2, "0")}:${offDuration?.seconds()?.toString().padStart(2, "0")}`;
  const productionPercentage = (productionSeconds / totalSeconds) * 100;
  const idleTimePercentage = (idleSeconds / totalSeconds) * 100;
  const offTimePercentage = (offSeconds / totalSeconds) * 100;

  const { machines } = useMachine();
  const currentMachine = machines?.machines?.find((machine) => machine.id === machinedata?.machine_id);
  const { RunTime: RunTimeColor, IdleTime: IdleTimeColor, StoppedTime: StoppedTimeColor } = colors;

  return (
    <MDCard
      sx={{
        boxShadow: ({ boxShadows: { lg } }) => (shadow ? lg : "none"),
        width: "300px",
        minWidth: "300px",
        margin: "12px",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {machinedata && (
        <MDBox variant={color !== "white" ? "contained" : "gradient"} borderRadius="xl" sx={{ textAlign: 'center' }}>
          <MDBox
            bgColor={badge.color}
            width="max-content"
            px={4}
            pt={0.5}
            pb={0.5}
            mx="auto"
            mt={-1.375}
            mb={1}
            borderRadius="section"
            lineHeight={1}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column"
            }}
          >
            <MDTypography
              variant="caption"
              textTransform="uppercase"
              fontWeight="medium"
              color={badge.color === "light" ? "dark" : "white"}
              display="block"
            >
              {currentMachine?.shift_group?.name ?? ""}
            </MDTypography>
            <MDTypography
              variant="caption"
              textTransform="uppercase"
              fontWeight="medium"
              color={badge.color === "light" ? "dark" : "white"}
              sx={{
                display: "flex",
                alignItems: "center"
              }}
            >
              {machinedata?.machineName}
              <Tooltip title="More info">
                <Link
                  target="_blank"
                  to={{
                    pathname: `/machines/${machinedata?.machine_id}?date=${moment(date._d)?.format("YYYY-MM-DD") ?? ""
                      }`
                  }}
                  rel="noopener noreferrer"
                  style={{ display: "flex", color: "white" }}
                >
                  <OpenInNewIcon sx={{ marginLeft: "6px", cursor: "pointer" }} />
                </Link>
              </Tooltip>
            </MDTypography>
          </MDBox>
          <LabeledProgress
            size={90}
            machineStatusData={machinedata}
            overallRating={ratings?.oee || 0}
            tooltipTitle={`Compared to machine rating ${(ratings?.oee || 0) * 100}%`}
          />
          <Grid container mx={2}>
            <Grid item>
              <MDTypography
                variant="caption"
                textTransform="uppercase"
                fontWeight="medium"
                color={badge.color === "light" ? "dark" : "white"}
              >
                Production time {`(${productionDurationStr} / ${totalDurationStr})`}
              </MDTypography>
            </Grid>
            <Grid item sm={12} mr={3}>
              <MDProgress
                value={productionPercentage ? productionPercentage?.toFixed() : 0}
                sx={{
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: RunTimeColor.main,
                    height: "12px",
                    borderRadius: "6px"
                  },
                  height: "12px"
                }}
              />
            </Grid>
          </Grid>
          <Grid container mx={2}>
            <Grid item>
              <MDTypography
                variant="caption"
                textTransform="uppercase"
                fontWeight="medium"
                color={badge.color === "light" ? "dark" : "white"}
              >
                Idle time {`(${idleDurationStr} / ${totalDurationStr})`}
              </MDTypography>
            </Grid>
            <Grid item sm={12} mr={3}>
              <MDProgress
                value={idleTimePercentage ? idleTimePercentage?.toFixed() : 0}
                sx={{
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: IdleTimeColor.main,
                    height: "12px",
                    borderRadius: "6px"
                  },
                  height: "12px"
                }}
              />
            </Grid>
          </Grid>
          <Grid container mx={2}>
            <Grid item>
              <MDTypography
                variant="caption"
                textTransform="uppercase"
                fontWeight="medium"
                color={badge.color === "light" ? "dark" : "white"}
              >
                OFF time {`(${offDurationStr} / ${totalDurationStr})`}
              </MDTypography>
            </Grid>
            <Grid item sm={12} mr={3}>
              <MDProgress
                value={offTimePercentage ? offTimePercentage?.toFixed() : 0}
                sx={{
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: StoppedTimeColor.main,
                    height: "12px",
                    borderRadius: "6px"
                  },
                  height: "12px"
                }}
              />
            </Grid>
          </Grid>
          <MDBox display="flex" alignItems="center" mt={1} p={1} sx={{ justifyContent: "center" }}>
            <MDBox
              component="img"
              src={energyConsumptionSvg}
              alt="Product Image"
              width="20px"
              height="20px"
              sx={{
                filter:
                  "invert(100%) sepia(100%) saturate(0%) hue-rotate(138deg) brightness(102%) contrast(102%)",
                margin: "0 4px"
              }}
            />
            <MDTypography
              variant="body2"
              color={color === "white" ? "text" : "white"}
              fontWeight="regular"
              style={{ marginRight: "6px" }}
            >
              {machinedata?.energy_consumption ?? 0} kWh
            </MDTypography>
            <RatingPercentage
              overallRating={machinedata?.rating_energy_consumption || 0}
              currentRating={machinedata?.energy_consumption || 0}
              direction={false}
              title={`Compared to machine rating ${machinedata?.rating_energy_consumption} kWh`}
            />
          </MDBox>
          <MDBox display="flex" alignItems="center" p={1} sx={{ justifyContent: "center" }}>
            <MDBox
              component="img"
              src={energyWastageSvg}
              alt="Product Image"
              width="20px"
              height="20px"
              sx={{
                filter:
                  "invert(100%) sepia(100%) saturate(0%) hue-rotate(138deg) brightness(102%) contrast(102%)",
                margin: "0 4px"
              }}
            />
            <MDTypography
              variant="body2"
              color={color === "white" ? "text" : "white"}
              fontWeight="regular"
              style={{ marginRight: "6px" }}
            >
              {machinedata?.energy_wastage ?? 0} kWh
            </MDTypography>
            <RatingPercentage
              overallRating={machinedata?.rating_energy_wastage || 0}
              currentRating={machinedata?.energy_wastage || 0}
              direction={false}
              title={`Compared to machine rating ${machinedata?.rating_energy_wastage} kWh`}
            />
          </MDBox>
          <MDBox display="flex" alignItems="center" p={1} sx={{ justifyContent: "center" }}>
            <MDBox
              component="img"
              src={cyclesSvg}
              alt="Product Image"
              width="20px"
              height="20px"
              sx={{
                filter:
                  "invert(100%) sepia(100%) saturate(0%) hue-rotate(138deg) brightness(102%) contrast(102%)",
                margin: "0 4px"
              }}
            />
            <MDTypography
              variant="body2"
              color={color === "white" ? "text" : "white"}
              fontWeight="regular"
            >
              {getCycleCount(machinedata?.cycles)}
            </MDTypography>
          </MDBox>
          <MDBox display="flex" alignItems="center" p={1} sx={{ justifyContent: "center" }}>
            <MDBox
              component="img"
              src={anomalySvg}
              alt="Product Image"
              width="20px"
              height="20px"
              sx={{
                filter:
                  "invert(100%) sepia(100%) saturate(0%) hue-rotate(138deg) brightness(102%) contrast(102%)",
                margin: "0 4px"
              }}
            />
            <MDTypography
              variant="body2"
              color={color === "white" ? "text" : "white"}
              fontWeight="regular"
            >
              {machinedata?.anomalies ?? 0}
            </MDTypography>
          </MDBox>
        </MDBox>
      )}
    </MDCard>
  );
}

export default MachinCompareCard;
