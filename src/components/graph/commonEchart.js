/* eslint-disable prefer-arrow-callback */
/* eslint-disable react/prop-types */
import { Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import * as echarts from "echarts";
import ReactEcharts from "echarts-for-react";
import { memo } from "react";

const CommonEchart = memo(function CommonEchart({
  echartsReact,
  option,
  onEvents,
  style,
  last3Hrs
}) {
  return (
    <Grid item mx={0}>
      <MDBox
        lineHeight={1}
        textAlign="center"
        marginBottom="45px"
        fontSize="2.25rem"
        sx={{ minWidth: last3Hrs ? "fit-content" : "768px", overflow: "auto" }}
      >
        <MDTypography variant="v4" fontWeight="bold" color="text" textTransform="capitalize">
          <ReactEcharts
            ref={echartsReact}
            option={option}
            echarts={echarts}
            onEvents={{ click: onEvents }}
            style={style}
            minWidth={768}
          />
        </MDTypography>
      </MDBox>
    </Grid>
  );
});

export default CommonEchart;
