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

// react-router-dom components
import { Link, useLocation } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import translate from "i18n/translate";

function Breadcrumbs({ icon, title, route, light }) {
  const routes = route.slice(0, -1);
  const location = useLocation();
  
  return (
    <MDBox mr={{ xs: 0, xl: 8 }}>
      <MuiBreadcrumbs
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color: ({ palette: { white, grey } }) => (light ? white.main : grey[600])
          }
        }}
      >
        <Link to="/">
          <MDTypography
            component="span"
            variant="body2"
            color={light ? "white" : "dark"}
            opacity={light ? 0.8 : 0.5}
            sx={{ lineHeight: 0 }}
          >
            <Icon>{icon}</Icon>
          </MDTypography>
        </Link>
        {routes.map((el, index) => {
          if (
            (location.pathname.includes("machineHistory") ||
              location.pathname.includes("machinePulse")) &&
            index === 1
          ) {
            return (
              <Link to={`/machines/${el}`} state={{ name: location.state?.machineName }} key={el}>
                <MDTypography
                  component="span"
                  variant="button"
                  fontWeight="regular"
                  textTransform="capitalize"
                  color={light ? "white" : "dark"}
                  opacity={light ? 0.8 : 0.5}
                  sx={{ lineHeight: 0 }}
                >
                  {location.state?.machineName &&
                    translate(location.state?.machineName?.toLowerCase())}
                </MDTypography>
              </Link>
            );
          }
          return (
            <Link to={`/${el}`} key={el}>
              <MDTypography
                component="span"
                variant="button"
                fontWeight="regular"
                textTransform="capitalize"
                color={light ? "white" : "dark"}
                opacity={light ? 0.8 : 0.5}
                sx={{ lineHeight: 0 }}
              >
                {translate(el.toLowerCase())}
              </MDTypography>
            </Link>
          );
        })}
        {title && title !== "machines" && (
          <MDTypography
            variant="button"
            fontWeight="regular"
            textTransform="capitalize"
            color={light ? "white" : "dark"}
            sx={{ lineHeight: 0 }}
          >
            {translate(title?.replace("-", " ").toLowerCase())}
          </MDTypography>
        )}
      </MuiBreadcrumbs>
    </MDBox>
  );
}

// Setting default values for the props of Breadcrumbs
Breadcrumbs.defaultProps = {
  light: false
};

// Typechecking props for the Breadcrumbs
Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  light: PropTypes.bool
};

export default Breadcrumbs;
