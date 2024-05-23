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

import { useState, useEffect } from "react";

// react-router components
import { useLocation, NavLink, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
// import MDInput from "components/MDInput";
import MDBadge from "components/MDBadge";
import Cookies from "js-cookie";
// Material Dashboard 2 PRO React examples
import Breadcrumbs from "components/Breadcrumbs";
import NotificationItem from "components/Items/NotificationItem";
import { LOCALES } from "i18n/locales";
import ReactCountryFlag from "react-country-flag";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarDesktopMenu,
  navbarMobileMenu
} from "components/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 PRO React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setLanguage
} from "context";
import { MenuItem } from "@mui/material";
import { socket } from "App";
import useAuth from "hooks/useAuth";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import moment from "moment";
import useLogout from "hooks/useLogout";
import translate from "i18n/translate";
import { parseJsonPayload } from "utils";
import { v4 as uuidv4 } from 'uuid';
import { enumQueryNames } from "api/reactQueryConstant";
import { notificationListAPi } from "api/watchmenApi";
import { axiosPrivate } from "api/axios";
import { useQuery } from "react-query";
import { whoAmIDetails } from "api/watchmenApi";
import { getNotificationTypesApi } from "api/watchmenApi";
import { Tooltip } from "@mui/material";

function DashboardNavbar({ absolute, light, isMini }) {
  const id = Cookies.get("id");
  const companyid = Cookies.get("companyid");
  const navigate = useNavigate();
  const jointopic = `notification.${companyid}.${id}`;
  const signout = useLogout();

  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode, language } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [openLanguageMenu, setOpenLanguageMenu] = useState(false);
  const location = useLocation();
  const { auth } = useAuth();
  const { isAuthSet } = useAxiosPrivate();
  const route = location.pathname.split("/").slice(1);
  const [locationName, setLocationName] = useState(null);

  useEffect(() => {
    if (location.state?.name) setLocationName(location.state.name);
  }, [location.state?.name]);

  const [notification, setNotification] = useState({ list: [] });

  const { data: userDetails } = useQuery(
    [enumQueryNames.WHO_AM_I],
    () => whoAmIDetails(axiosPrivate),
    {
      enabled: !!(isAuthSet && auth.Token),
    }
  );

  const { data: notificationTypes = [] } = useQuery([enumQueryNames.GET_NOTIFICATION_TYPE],
    () => getNotificationTypesApi(axiosPrivate),
    {
      enabled: !!(isAuthSet && auth.Token),
    }
  );

  const { data: notificationList, isFetched: notificationFetched, refetch: fetchNotifications } = useQuery(
    [enumQueryNames.GET_NOTIFICATION],
    () => notificationListAPi(axiosPrivate, {
      "language": "en",
      "notification_type_ids": userDetails.user.subscription_list
        .filter(item => {
          const notificationGroup = 'notifications'
          const currentGroupSubcriptions = notificationTypes.filter(type => type.meta_frontend.group === notificationGroup).map(type => type.id)
          return currentGroupSubcriptions.includes(item.id)
        })
        .map(item => item.id),
      "page": 1,
      "per_page": 5
    }),
    {
      enabled: false,
      onSuccess: (data) => {
        // eslint-disable-next-line no-shadow
        setNotification((notification) => ({
          list: data.notification_list.map(curNotification => ({
            color: curNotification?.color,
            description: curNotification?.payload[language?.substring(0, 2)] || '',
            time: curNotification?.created_at,
            id: uuidv4(),
            machineId: curNotification?.machine_id
          }))
        }));
      },
    }
  );

  const getNotification = async () => {
    // const res = await axiosPrivate.get("notification/")
    // if (res.status === 200) {
    //   setNotification({
    //     // eslint-disable-next-line no-shadow
    //     list: res.data.notifications.map((notification) => ({
    //       color: notification?.payload_json?.color,
    //       description: notification?.payload_json?.description,
    //       time: notification?.created_at,
    //       id: notification?.id
    //     }))
    //   })
    // }
  };

  useEffect(() => {
    if (notificationTypes.length) {
      fetchNotifications()
    }
  }, [userDetails, notificationTypes])

  useEffect(() => {
    // socket.emit("join_room", jointopic);
    socket.on("notification_message", (message) => {
      const notificationMesage = parseJsonPayload(message.payload)
      const notification1 = {
        color: message?.notification?.payload_json?.color,
        description: notificationMesage?.payload[language?.substring(0, 2)] || '',
        time: notificationMesage?.created_at,
        id: uuidv4(),
        machineId: notificationMesage?.machine_id
      };

      // eslint-disable-next-line no-shadow
      setNotification((notification) => ({ list: [notification1, ...notification.list] }));
    });

    // socket.on("notification", (message) => {
    //   const notification1 = {
    //     color: message?.notification?.payload_json?.color,
    //     description: message?.notification?.payload_json?.description,
    //     time: message?.notification?.created_at,
    //     id: message?.notification?.id
    //   };
    //   // eslint-disable-next-line no-shadow
    //   setNotification((notification) => ({ list: [notification1, ...notification.list] }));
    // });
  }, []);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    // window.addEventListener("scroll", handleTransparentNavbar)

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    // return () => window.removeEventListener("scroll", handleTransparentNavbar)
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleOpenLanguageMenu = (event) => setOpenLanguageMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);
  const handleCloseLanguageMenu = () => setOpenLanguageMenu(false);

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left"
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={({ breakpoints }) => ({
        mt: 2,
        '& .MuiPaper-root': {
          [breakpoints.up("md")]: {
            width: '50%'
          }
        }
      })
      }
    >
      {notification?.list.length > 0 ? (
        notification?.list.map((data) => (
          <NotificationItem
            key={data.time}
            title={data.description}
            time={data.time}
            machineId={data.machineId}
          />
        ))
      ) : (
        <NotificationItem title={translate("No New Notifications")} />
      )}
      <MDBox
        component={NavLink}
        to="/notifications"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mt={1}
        sx={{color:'orange'}}
      >
        {" "}
        {translate("Load More")}
      </MDBox>
    </Menu>
  );
  // Render the notifications menu
  const renderLanguageMenu = () => (
    <Menu
      anchorEl={openLanguageMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center"
      }}
      transformOrigin={{
        vertical: 'top',    // The menu grows downwards from the top
        horizontal: 'center' // The menu should be centered horizontally
      }}
      open={Boolean(openLanguageMenu)}
      onClose={handleCloseLanguageMenu}
      sx={{ mt: 2 }}
    >
      <MenuItem
        onClick={() => {
          setLanguage(dispatch, LOCALES.ENGLISH);
          handleCloseLanguageMenu();
        }}
        selected={language === LOCALES.ENGLISH}
      >
        <ReactCountryFlag countryCode="GB" svg style={{ marginRight: '10px', width: '20px', height: '15px' }} />
        English
      </MenuItem>
      <MenuItem
        onClick={() => {
          setLanguage(dispatch, LOCALES.FRENCH);
          handleCloseLanguageMenu();
        }}
        selected={language === LOCALES.FRENCH}
      >
        <ReactCountryFlag countryCode="FR" svg style={{ marginRight: '10px', width: '20px', height: '15px' }} />
        Français
      </MenuItem>
      <MenuItem
        onClick={() => {
          setLanguage(dispatch, LOCALES.GERMAN);
          handleCloseLanguageMenu();
        }}
        selected={language === LOCALES.GERMAN}
      >
        <ReactCountryFlag countryCode="DE" svg style={{ marginRight: '10px', width: '20px', height: '15px' }} />
        Deutsch
      </MenuItem>
    </Menu>
  );

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.9) : text.main;
      }

      return colorValue;
    }
  });

  const handleLogout = async () => {
    Cookies.remove("tok");
    Cookies.remove("id");
    Cookies.remove("companyid");
    Cookies.remove("role");
    Cookies.remove("setting");

    await signout();
    navigate("/signin");
  };

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs
            icon="home"
            title={locationName ? locationName : route[route.length - 1]}
            route={route}
            light={light ? "white" : "inherit"}
          />
          <IconButton sx={navbarDesktopMenu} onClick={handleMiniSidenav} size="small" disableRipple>
            <Icon fontSize="medium" sx={iconsStyle}>
              {miniSidenav ? "menu_open" : "menu"}
            </Icon>
          </IconButton>
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox color={light ? "white" : "inherit"}>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              <Tooltip title={translate("Languages")}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenLanguageMenu}
                >
                  <MDBadge color="error" size="xs" circular>
                    {/* Render flag based on selected language */}
                    <ReactCountryFlag 
                      countryCode={
                        language === LOCALES.ENGLISH ? "GB" :
                        language === LOCALES.FRENCH ? "FR" :
                        "DE" // Default to German if neither English nor French
                      } 
                      svg 
                      style={{ width: '24px', height: '16px' }}
                    />
                  </MDBadge>
                </IconButton>
              </Tooltip>
              <Tooltip title={translate("Notifications")}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenMenu}
                >
                  <MDBadge color="error" size="xs" circular>
                    <Icon sx={iconsStyle}>notifications</Icon>
                  </MDBadge>
                </IconButton>
              </Tooltip>
              <Tooltip title={translate("profile")}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={() => navigate("/user/profile")}
                >
                  <AccountCircleIcon sx={iconsStyle} />
                </IconButton>
              </Tooltip>
              <Tooltip title={translate("logout")}>
                <IconButton
                  size="small"
                  disableRipple
                  color="error"
                  sx={navbarIconButton}
                  onClick={() => handleLogout()}
                >
                  <Icon fontSize="medium">logout</Icon>
                </IconButton>
              </Tooltip>

              {renderMenu()}
              {renderLanguageMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool
};

export default DashboardNavbar;
