/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/control-has-associated-label */
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { AppBar, Grid, Icon, Tab, Tabs, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import energyConsumptionSvg from "assets/images/energy_consumption.svg";
import energyWastageSvg from "assets/images/energy_wastage.svg";
import colors from "assets/theme-dark/base/colors";
import ComplexStatisticsCard from "components/Cards/StatisticsCards/ComplexStatisticsCard";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";
import translate from "i18n/translate";
import RangePicker from "../machineShifts/rangepicker";

const { EnergyConsumption, EnergyWastage } = colors;

function EnergyOverView({
  tabShiftValue,
  handleSetTabShiftValue,
  startDate,
  endDate,
  setEndDate,
  filter,
  handleSetFilterValue,
  setStartDate,
  consumptionTotal,
  companyDetails,
  dateRangePickerChange,
  setRefreshToggler
}) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  return (
    <>
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" mt={3} mb={5}>
        <MDBox>
          <MDTypography variant="h5" fontWeight="medium">
            {translate("Energy Overview")}
          </MDTypography>
        </MDBox>
        <MDBox display="flex">
          <Grid item display="flex" justifyContent="center" alignItems="center">
            <AppBar position="static">
              <Tabs
                orientation="horizontal"
                value={tabShiftValue}
                onChange={handleSetTabShiftValue}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: colors.info.main
                  }
                }}
              >
                <Tab label={translate("All Day")} key={0} sx={{ padding: "5px 14px" }} />
                <Tab label={translate("Planned")} key={1} sx={{ padding: "5px 14px" }} />
              </Tabs>
            </AppBar>
          </Grid>
          <Tooltip title="Refresh">
            <MDButton
              variant="gradient"
              color="info"
              onClick={() => setRefreshToggler(true)}
              sx={{
                mx: 1
              }}
            >
              <AutorenewIcon />
            </MDButton>
          </Tooltip>
          <Grid item md={6} sm={12} xs={12}>
            <MDBox sx={{ display: "flex", alignItems: "center" }}>
              <RangePicker
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                // rangeChange={(newValue) => {
                //   setStartDate(newValue?.startDate ?? null)
                //   setEndDate(newValue?.endDate ?? null)
                // }}
              />
            </MDBox>
          </Grid>
          <MDBox display="flex" alignItems="center" mr={4} ml={2}>
            <Tooltip title={translate("SelectTabsOrg")} style={{ marginRight: 10 }}>
              <Icon style={{ color: "white", marginRight: "10px" }}>info</Icon>
            </Tooltip>
            <AppBar position="static">
              <Tabs
                orientation="horizontal"
                value={filter}
                onChange={handleSetFilterValue}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: colors.info.main
                  }
                }}
              >
                <Tab
                  label="1D"
                  value="today"
                  sx={{ padding: "3px 14px", height: "36px" }}
                  disabled={dateRangePickerChange}
                />
                <Tab
                  label="1W"
                  value="week"
                  sx={{ padding: "0 14px", height: "36px" }}
                  disabled={dateRangePickerChange}
                />
                <Tab
                  label="1M"
                  value="month"
                  sx={{ padding: "0 14px", height: "36px" }}
                  disabled={dateRangePickerChange}
                />
              </Tabs>
            </AppBar>
          </MDBox>
        </MDBox>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <ComplexStatisticsCard
            title="Energy consumption"
            count={`${consumptionTotal?.[filter]?.energy_consumption?.toFixed(2) || 0}`}
            unit="kWh"
            image={energyConsumptionSvg}
            color={darkMode ? EnergyConsumption?.dark : EnergyConsumption?.main}
            tooltip="Energy consumption"
            overallRating={consumptionTotal?.[filter]?.rating_energy_consumption?.toFixed(2)}
            tooltipTitle={`Compared to machine rating ${consumptionTotal?.[
              filter
            ]?.rating_energy_consumption?.toFixed(2)} kWh`}
            currentRating={consumptionTotal?.[filter]?.energy_consumption}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <ComplexStatisticsCard
            title="Energy wastage"
            count={`${consumptionTotal?.[filter]?.energy_wastage?.toFixed(2) || 0}`}
            unit="kWh"
            image={energyWastageSvg}
            color={darkMode ? EnergyWastage?.dark : EnergyWastage?.main}
            tooltip="Energy wastage"
            overallRating={consumptionTotal?.[filter]?.rating_energy_wastage?.toFixed(2)}
            tooltipTitle={`Compared to machine rating ${consumptionTotal?.[
              filter
            ]?.rating_energy_wastage?.toFixed(2)}
                kWh`}
            currentRating={consumptionTotal?.[filter]?.energy_wastage}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={3} mt={2}>
          <ComplexStatisticsCard
            title="Consumption costs"
            count={`${consumptionTotal?.[filter]?.energy_consumption_cost?.toFixed(2) || 0}`}
            unit={companyDetails?.currency?.symbol || "$"}
            image={energyConsumptionSvg}
            color={darkMode ? EnergyConsumption?.dark : EnergyConsumption?.main}
            tooltip="Energy consumption costs"
            overallRating={0}
            currentRating={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={3} mt={2}>
          <ComplexStatisticsCard
            title="Wastage costs"
            count={`${consumptionTotal?.[filter]?.energy_wastage_cost?.toFixed(2) || 0}`}
            unit={companyDetails?.currency?.symbol || "$"}
            image={energyWastageSvg}
            color={darkMode ? EnergyWastage.dark : EnergyWastage.main}
            tooltip="Energy waste costs"
            overallRating={0}
            currentRating={0}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default EnergyOverView;
