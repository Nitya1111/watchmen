/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { Grid, Skeleton, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import colors from "assets/theme-dark/base/colors";
import MDBox from "components/MDBox";
import MDCard from "components/MDCard";
import MDTypography from "components/MDTypography";
import translate from "i18n/translate";
import { convertHMS } from "utils/constants";

const { StoppedTime, IdleTime, RunTime } = colors;

function TimeOverview({ consumptionTotal, filter, classes, smDown }) {
  return (
    <Stack mt={2}>
      <MDTypography variant="h5" fontWeight="medium" mb={2}>
        {translate("Time Overview")}
      </MDTypography>
      <Grid container spacing={3}>
        {/* {machineData?.machine?.settings?.card_productiontime && */}
        <Grid item xs={6} md={4} lg={3}>
          {consumptionTotal ? (
            <Tooltip title={translate("Total Production time")}>
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
                    {consumptionTotal?.[filter]?.production_duration !== 0
                      ? convertHMS(
                          new Date(
                            Math.floor(consumptionTotal?.[filter]?.production_duration)
                          ).getTime()
                        )
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
          {consumptionTotal ? (
            <Tooltip title={translate("Total Idle time")}>
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
                    {consumptionTotal?.[filter]?.idle_duration !== 0
                      ? convertHMS(
                          new Date(Math.floor(consumptionTotal?.[filter]?.idle_duration)).getTime()
                        )
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
          {consumptionTotal ? (
            <Tooltip title={translate("Total Off time")}>
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
                    {consumptionTotal?.[filter]?.off_duration !== 0
                      ? convertHMS(
                          new Date(Math.floor(consumptionTotal?.[filter]?.off_duration)).getTime()
                        )
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
    </Stack>
  );
}

export default TimeOverview;
