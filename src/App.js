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

import { useEffect, useMemo, useState } from "react";
import "style.css";
// react-router components
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

// @mui material components
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import { ThemeProvider } from "@mui/material/styles";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";

// Material Dashboard 2 PRO React examples
import Configurator from "components/Configurator";
import Sidenav from "components/Sidenav";

// Material Dashboard 2 PRO React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 PRO React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "stylis-plugin-rtl";

// Material Dashboard 2 PRO React routes
import appRoutes from "routes";

// Material Dashboard 2 PRO React contexts
import {
  setErrorMsg,
  setLanguage,
  setMiniSidenav,
  setOpenConfigurator,
  setSuccessMsg,
  useMaterialUIController
} from "context";

// Images
import brandDark from "assets/images/WatchMen_dark_logo_reduced.png";
import brandWhite from "assets/images/newlogo.png";
import useAuth from "hooks/useAuth";
import useMachine from "hooks/useMachine";
import Basic from "layouts/authentication/sign-in";
import Cover from "layouts/authentication/sign-up";
import Ava from "layouts/dashboards/ava";
import MachineDetails from "components/machineDetails";
import MachineHistory from "components/machineHistory";
import AddMachine from "components/modal/addMachine";
import Tess from "layouts/dashboards/tess";
import PersistLogin from "utils/PersistLogin";
import RequireAuth from "utils/RequireAuth";
// import NewButton from "components/dashboardaddbtn";
import { enumQueryNames } from "api/reactQueryConstant";
import { getMachineListApi } from "api/watchmenApi";
import MDSnackbar from "components/MDSnackbar";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import { LOCALES } from "i18n/locales";
import Cookies from "js-cookie";
import Notifications from "layouts/dashboards/Notifications";
import Profile from "layouts/dashboards/User/profile";
import FloorPlan from "layouts/dashboards/floorplan";
import MachinePulse from "components/machinePulse";
import { useMutation } from "react-query";
import Hallplan from "layouts/dashboards/hallplan";
import { io } from "socket.io-client";
import OTPForm from "layouts/authentication/otp";
import CompanyDetail from "layouts/dashboards/company";
import CompareMachines from "layouts/dashboards/compareMachine";
import Shifts from "layouts/admin/shifts";
import Analysis from "layouts/dashboards/analysis";
import MachineShifts from "layouts/dashboards/machineShifts";
import PeakOptimizer from "layouts/dashboards/peakOptimizer";
import Leaderboard from "layouts/dashboards/leaderboard";
import Company from "layouts/admin/company";
import Commander from "layouts/admin/commander";
import ForgotPassword from "layouts/authentication/forgot-password";
import ResetPassword from "layouts/authentication/forgot-passwords-reset";
import RegistrationConfirmation from "layouts/authentication/registration-confirmation";

const token = Cookies.get("tok")
export const socket = io(process.env.REACT_APP_SOCKET_URL, {
  auth: {
    Authorization: `Bearer ${token}`
  }
});


export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
    errorMsg,
    successMsg
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const { setMachines } = useMachine();
  const { auth } = useAuth();
  const { axiosPrivate, isAuthSet } = useAxiosPrivate();
  const [routes, setRoutes] = useState([]);

  const userRooms = Cookies.get('rooms')
  userRooms?.split(',').forEach(room => {
    socket.emit('enter_room', { room_name: room })
  })

  const { mutate: fetchMachineListApi } = useMutation(
    [enumQueryNames.MACHINE_LIST],
    () => getMachineListApi(axiosPrivate),
    {
      enabled: auth.Token && isAuthSet,
      onSuccess: (data) => setMachines(data)
    }
  );
  useEffect(() => {
    setRoutes(appRoutes());
    if (auth?.Token) {
      // fetchMachineListApi();
    }
  }, [auth]);
  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin]
    });

    setRtlCache(cacheRtl);
    const userSetting = Cookies.get("userSettings")
      ? JSON.parse(Cookies.get("userSettings"))
      : null;
    if (userSetting?.language) {
      setLanguage(dispatch, userSetting.language);
      return;
    }
    const { languages } = navigator;
    let locale = LOCALES.ENGLISH;
    languages.every((lang) => {
      const language = lang.split("-")[0];
      if (language === "en") {
        locale = LOCALES.ENGLISH;
        return false;
      }
      if (language === "fr") {
        locale = LOCALES.FRENCH;
        return false;
      }
      if (language === "de") {
        locale = LOCALES.GERMAN;
        return false;
      }
      return true;
    });

    setLanguage(dispatch, locale);
  }, []);

  let hoverTimeout;

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    hoverTimeout = setTimeout(() => {
      if (miniSidenav && !onMouseEnter) {
        setMiniSidenav(dispatch, false);
        setOnMouseEnter(true);
      }
    }, 2000);
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    clearTimeout(hoverTimeout);
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  // const handleMachineFormOpen = () => setOpenMachineForm(dispatch, !openMachineForm);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  const handleErrClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setErrorMsg(dispatch, "");
  };

  const handleSuccessClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessMsg(dispatch, "");
  };

  const errorToast = () => (
    <MDSnackbar
      color="error"
      icon="check"
      title="Error"
      content={errorMsg}
      open={!!errorMsg}
      onClose={handleErrClose}
      close={handleErrClose}
      bgWhite
    />
  );

  const successToast = () => (
    <MDSnackbar
      color="success"
      icon="check"
      title="Success"
      content={successMsg}
      open={!!successMsg}
      onClose={handleSuccessClose}
      close={handleSuccessClose}
      bgWhite
    />
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline enableColorScheme />
        {errorToast()}
        {successToast()}
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              // brandName="Watchmen"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth />}>{getRoutes(routes)}</Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline enableColorScheme />
      {errorToast()}
      {successToast()}
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            // brandName="Watchmen"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          <AddMachine />
          {/* {configsButton} */}
          {/* {newButton} */}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth />}>{getRoutes(routes)}</Route>
          <Route path="/machines/:machineId" element={<MachineDetails />} />
          <Route path="/machines/:machineId/machineHistory" element={<MachineHistory />} />
          <Route path="/machines/:machineId/machinePulse" element={<MachinePulse />} />
          <Route path="/machines/ava/:avaId" element={<Ava />} />
          <Route path="/machines/tess/:mode/:tessId" element={<Tess />} />
          <Route exact path="/org-stats" element={<CompanyDetail />} />
          <Route exact path="/versus" element={CompareMachines} />
          <Route exact path="/admin-panel" element={<Shifts />} />
          <Route exact path="/reports" element={<Analysis />} />
          <Route exact path="/machineShifts" element={<MachineShifts />} />
          <Route exact path="/peakOptimizer" element={<PeakOptimizer />} />
          <Route exact path="/leaderboard" element={<Leaderboard />} />
          <Route exact path="/super-admin" element={<Company />} />
          <Route exact path="/admin/commander" element={<Commander />} />
        </Route>
        <Route path="/user/profile" element={<Profile />} />
        {/* <Route path="/floorPlan" element={<FloorPlan />} /> */}
        {/* <Route path="/floorPlan/:id" element={<FloorPlan />} /> */}
        <Route path="/hallPlan/:id" element={<Hallplan />} />
        <Route path="/signin" element={<Basic />} />
        <Route path="/signup" element={<Cover />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/registrationConfirmation" element={<RegistrationConfirmation />} />
        <Route path="/verifyOTP" element={<OTPForm />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ThemeProvider>
  );
}
