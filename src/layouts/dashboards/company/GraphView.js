/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Loader from "components/Loader";
import MDBox from "components/MDBox";
import MDCard from "components/MDCard";
import MDTypography from "components/MDTypography";
import ReactEcharts from "echarts-for-react";
import translate from "i18n/translate";

function GraphView({ oeeOption, plantEnergyOption, co2EmissionsOptions }) {
  return (
    <>
      <MDCard sx={{ margin: "10px 0", padding: "10px" }}>
        <MDTypography sx={{ marginTop: "10px" }} textAlign="center">
          {translate("Plant OEE")}
        </MDTypography>
        {oeeOption ? (
          <ReactEcharts option={oeeOption} />
        ) : (
          <MDBox>
            <Loader />
          </MDBox>
        )}
      </MDCard>

      <MDCard sx={{ margin: "10px 0", padding: "10px" }}>
        <MDTypography sx={{ marginTop: "10px" }} textAlign="center">
          {translate("Plant energy")}
        </MDTypography>
        {plantEnergyOption ? (
          <ReactEcharts option={plantEnergyOption} />
        ) : (
          <MDBox>
            <Loader />
          </MDBox>
        )}
      </MDCard>
      <MDCard sx={{ margin: "10px 0", padding: "10px" }}>
        <MDTypography sx={{ marginTop: "10px" }} textAlign="center">
          {translate("co2_emissions in tons")}
        </MDTypography>
        {co2EmissionsOptions ? (
          <ReactEcharts option={co2EmissionsOptions} />
        ) : (
          <MDBox>
            <Loader />
          </MDBox>
        )}
      </MDCard>
    </>
  );
}

export default GraphView;
