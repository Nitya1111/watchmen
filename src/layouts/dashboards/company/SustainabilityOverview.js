/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Co2Icon from "@mui/icons-material/Co2";
import { Grid } from "@mui/material";
import ComplexStatisticsCard from "components/Cards/StatisticsCards/ComplexStatisticsCard";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import translate from "i18n/translate";

function SustainabilityOverview({
  tabValue,
  dayCummulative,
  filter,
  weekCummulative,
  monthCummulative,
  tabShiftValue
}) {
  return (
    <MDBox mt={3}>
      <MDTypography variant="h5" fontWeight="medium">
        {translate("Sustainability Overview")}
      </MDTypography>
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <ComplexStatisticsCard
            title="Co2 emissions"
            count={`${
              tabValue === 0
                ? Object.values(dayCummulative?.day_cumulative || {})
                    .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                    .map((data) =>
                      tabShiftValue === 1
                        ? Object.values(data.overall)
                            .map((temp) => temp?.co2_emissions_tons)
                            .reduce((sum, diff) => sum + diff, 0)
                        : data.overall.co2_emissions_tons
                    )
                    .reduce((sum, diff) => sum + diff, 0)
                    .toFixed(2)
                : tabValue === 1
                ? Object.values(weekCummulative?.week_cumulative || {})
                    .map((data) =>
                      tabShiftValue === 1
                        ? Object.values(data.overall)
                            .map((temp) => temp?.co2_emissions_tons)
                            .reduce((sum, diff) => sum + diff, 0)
                        : data.overall.co2_emissions_tons
                    )
                    .reduce((sum, diff) => sum + diff, 0)
                    .toFixed(2)
                : Object.values(monthCummulative?.month_cumulative || {})
                    .map((data) =>
                      tabShiftValue === 1
                        ? Object.values(data.overall)
                            .map((temp) => temp?.co2_emissions_tons)
                            .reduce((sum, diff) => sum + diff, 0)
                        : data.overall.co2_emissions_tons
                    )
                    .reduce((sum, diff) => sum + diff, 0)
                    .toFixed(2) || 0
            }`}
            iconStyle={{ width: "35px", height: "35px" }}
            unit="Tons"
            icon={<Co2Icon style={{ width: "35px", height: "35px" }} />}
            color="#748EDD"
            tooltip="Co2 emissions"
            // overallRating={
            //   filter === "today"
            //     ? dayCummulative?.factory_ratings?.energy_consumption
            //     : filter === "week"
            //     ? weekCummulative?.factory_ratings?.energy_consumption
            //     : monthCummulative?.factory_ratings?.energy_consumption
            // }
            // tooltipTitle={`Compared to machine rating ${consumptionTotal?.[
            //   filter
            // ]?.rating_energy_consumption?.toFixed(2)} kWh`}
            // currentRating={consumptionTotal?.[filter]?.energy_consumption}
          />
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default SustainabilityOverview;
