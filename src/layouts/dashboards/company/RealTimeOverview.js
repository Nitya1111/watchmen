/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Counts from "components/counts";
import translate from "i18n/translate";

function RealTimeOverview({ dayCummulative }) {
  return (
    <>
      <MDBox mt={3}>
        <MDTypography variant="h5" fontWeight="medium">
          {translate("Real time overview")}
        </MDTypography>
      </MDBox>
      <Grid container spacing={3} mt={0}>
        <Counts
          name="Production"
          tooltip="Number of machines currently MACHINING on the production floor"
          count={dayCummulative?.overview?.production}
          xs={12}
          sm={6}
          md={3}
        />
        <Counts
          name="Idle"
          tooltip="Number of machines currently IDLE on the production floor"
          count={dayCummulative?.overview?.idle}
          xs={12}
          sm={6}
          md={3}
        />
        <Counts
          name="Off"
          tooltip="Number of machines currently OFF on the production floor"
          count={dayCummulative?.overview?.stopped}
          xs={12}
          sm={6}
          md={3}
        />
        <Counts
          name="Preparation"
          tooltip="Number of machines currently in PREPARATION on the production floor"
          count={dayCummulative?.overview?.preparation}
          xs={12}
          sm={6}
          md={3}
        />
      </Grid>
    </>
  );
}

export default RealTimeOverview;
