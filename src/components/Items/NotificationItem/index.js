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

import { forwardRef } from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import MenuItem from "@mui/material/MenuItem";
import Link from "@mui/material/Link";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// custom styles for the NotificationItem
import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import moment from "moment";

const NotificationItem = forwardRef(({ icon, title, time, machineId, ...rest }, ref) => {
  const navigate = useNavigate()
  return <MenuItem {...rest} ref={ref}>
    <MDBox py={0.5} display="flex" alignItems="center" lineHeight={1}
      onClick={() => {
        navigate(`/machines/${machineId}?date=${moment(time)?.format("YYYY-MM-DD")}`)
      }}
    >
      {/* <MDTypography variant="body1" color="secondary" lineHeight={0.75}>
        {icon}
      </MDTypography> */}
      <Grid container>
        <Grid item xs={10}>
          <MDTypography
            sx={{
              textWrap: 'pretty',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              display: '-webkit-box',
            }}
            variant="button" fontWeight="regular" >
            {title}
          </MDTypography>
        </Grid>
        <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center' }}>
          <MDTypography variant="button" sx={{
            ml: 1,
            fontSize: "smaller",
          }}>
            {moment(time).format("D MMM HH:mm")}
          </MDTypography>
        </Grid>
      </Grid>


    </MDBox>
  </MenuItem>
});

// Typechecking props for the NotificationItem
NotificationItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  machineId: PropTypes.string.isRequired
};

export default NotificationItem;
