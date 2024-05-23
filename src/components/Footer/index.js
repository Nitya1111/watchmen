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
import Link from "@mui/material/Link";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React base styles
import typography from "assets/theme/base/typography";
import translate from "i18n/translate";

function Footer({ light }) {
  const { size } = typography;

  return (
    <MDBox
      position="sticky"
      width="100%"
      bottom={0}
      left={0}
      pt={4}
      pb={1}
      pr={3}
      style={{ backgroundColor: "#222324", zIndex: 9 }}
    >
      <MDBox>
        <MDBox
          width="100%"
          display="flex"
          flexDirection={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems="center"
          px={1.5}
        >
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            color={light ? "white" : "text"}
            fontSize={size.sm}
          >
            &copy; {new Date().getFullYear()}, Watchmen AI Platform by
            <Link href="https://novoai.de/" target="_blank">
              <MDTypography variant="button" fontWeight="medium" color={light ? "white" : "dark"}>
                &nbsp; Novo AI &nbsp;
              </MDTypography>
            </Link>
          </MDBox>
          <MDBox
            component="ul"
            sx={({ breakpoints }) => ({
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              listStyle: "none",
              mt: 3,
              mb: 0,
              p: 0,

              [breakpoints.up("lg")]: {
                mt: 0
              }
            })}
          >
            <MDBox component="li" pr={2} lineHeight={1}>
              <Link href="https://novoai.de/" target="_blank">
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color={light ? "white" : "dark"}
                >
                  Novo AI
                </MDTypography>
              </Link>
            </MDBox>
            <MDBox component="li" px={2} lineHeight={1}>
              <Link href="https://novoai.de/about-us/" target="_blank">
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color={light ? "white" : "dark"}
                >
                  {translate("About Us")}
                </MDTypography>
              </Link>
            </MDBox>
            <MDBox component="li" px={2} lineHeight={1}>
              <Link href="https://novoai.de/blog/" target="_blank">
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color={light ? "white" : "dark"}
                >
                  {translate("Blog")}
                </MDTypography>
              </Link>
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

// Setting default props for the Footer
Footer.defaultProps = {
  light: false
};

// Typechecking props for the Footer
Footer.propTypes = {
  light: PropTypes.bool
};

export default Footer;
