/* eslint-disable react/require-default-props */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/prop-types */
/**
=========================================================
* Material Dashboard 2 PRO React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDCard from "components/MDCard";
import { Tooltip } from "@mui/material";
import RatingPercentage from "components/rating";
import translate from "i18n/translate";

function ComplexStatisticsCard({
  color,
  title,
  count,
  percentage,
  icon,
  iconColor,
  image,
  tooltip,
  overallRating,
  currentRating,
  unit,
  iconStyle,
  tooltipTitle = ""
}) {
  return (
    <MDCard bgColor={color || ""} sx={{ height: "100%" }}>
      <MDBox display="flex" justifyContent="space-between" pt={1} px={2}>
        <Tooltip title={translate(tooltip.toLowerCase()) || ""}>
          <MDCard
            bgColor={color || ""}
            sx={{
              width: "64px",
              minWidth: "64px",
              minHeight: "64px",
              height: "64px",
              justifyContent: "center",
              marginTop: "-36px"
            }}
          >
            <MDBox
              color={color === "light" ? "dark" : "white"}
              coloredShadow={color}
              borderRadius="xl"
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="-webkit-fill-available"
              height="-webkit-fill-available"
            >
              {icon ? (
                <Icon
                  fontSize="medium"
                  color={iconColor ? `${iconColor}` : "inherit"}
                  style={iconStyle}
                >
                  {icon}
                </Icon>
              ) : (
                <MDBox
                  component="img"
                  src={image}
                  alt="Product Image"
                  width="24px"
                  height="24px"
                  sx={{
                    filter:
                      "invert(100%) sepia(100%) saturate(0%) hue-rotate(138deg) brightness(102%) contrast(102%)"
                  }}
                />
              )}
            </MDBox>
          </MDCard>
        </Tooltip>
        <MDBox textAlign="right" lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="light" color="text">
            {translate(title.toLowerCase())}
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox textAlign="right" lineHeight={1.25} pb={!percentage.label ? 3 : 0} px={2}>
        <MDTypography variant="h4" sx={{ display: "inline", marginRight: "6px" }}>
          {count}
        </MDTypography>
        <MDTypography variant="h6" sx={{ display: "inline" }}>
          {unit}
        </MDTypography>
        <MDBox sx={{ marginBottom: "10px" }} />
        <RatingPercentage
          overallRating={parseFloat(overallRating)}
          currentRating={parseFloat(currentRating)}
          title={tooltipTitle}
          direction={false}
        />
      </MDBox>
      {percentage.label && (
        <>
          <Divider />
          <MDBox pb={2} px={2}>
            <MDTypography component="p" variant="button" color="text" display="flex">
              <MDTypography
                component="span"
                variant="button"
                fontWeight="bold"
                color={percentage.color}
              >
                {percentage.amount}
              </MDTypography>
              &nbsp;{percentage.label}
            </MDTypography>
          </MDBox>
        </>
      )}
    </MDCard>
  );
}

// Setting default values for the props of ComplexStatisticsCard
ComplexStatisticsCard.defaultProps = {
  percentage: {
    color: "success",
    text: "",
    label: ""
  },
  icon: ""
};

// Typechecking props for the ComplexStatisticsCard
ComplexStatisticsCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white"
    ]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string
  }),
  icon: PropTypes.node.isRequired
};

export default ComplexStatisticsCard;
