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

/**
  This file is used for controlling the global states of the components,
  you can customize the states for the different components here.
*/

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";
import Cookies from "js-cookie";

// The Material Dashboard 2 PRO React main context
const MaterialUI = createContext();

// Setting custom name for the context which is visible on react dev tools
MaterialUI.displayName = "MaterialUIContext";

// Material Dashboard 2 PRO React reducer
function reducer(state, action) {
  switch (action.type) {
    case "MINI_SIDENAV": {
      return { ...state, miniSidenav: action.value };
    }
    case "TRANSPARENT_SIDENAV": {
      return { ...state, transparentSidenav: action.value };
    }
    case "WHITE_SIDENAV": {
      return { ...state, whiteSidenav: action.value };
    }
    case "SIDENAV_COLOR": {
      return { ...state, sidenavColor: action.value };
    }
    case "TRANSPARENT_NAVBAR": {
      return { ...state, transparentNavbar: action.value };
    }
    case "FIXED_NAVBAR": {
      return { ...state, fixedNavbar: action.value };
    }
    case "OPEN_CONFIGURATOR": {
      return { ...state, openConfigurator: action.value };
    }
    case "OPEN_MACHINE_FORM": {
      return { ...state, openMachineForm: action.value };
    }
    case "OPEN_RATING_FORM": {
      return { ...state, openRatingForm: action.value };
    }
    case "OPEN_TIMELINE_RULES_FORM": {
      return { ...state, openTimelineRulesForm: action.value };
    }
    case "OPEN_MACHINE_EDIT_FORM": {
      return { ...state, openMachineEditForm: action.value };
    }
    case "OPEN_SENSER": {
      return { ...state, openSenser: action.value };
    }
    case "OPEN_AVA_SETUP": {
      return { ...state, openAvaSetup: action.value };
    }
    case "OPEN_ADD_AVA_SETUP": {
      return { ...state, openAddAvaForm: action.value };
    }
    case "OPEN_TESS_SETUP": {
      return { ...state, openTessSetup: action.value };
    }
    case "OPEN_NEW_SHIFT_FORM": {
      return { ...state, openNewShiftForm: action.value };
    }
    case "OPEN_NEW_SHIFT_GROUP_FORM": {
      return { ...state, openNewShiftGroupForm: action.value };
    }
    case "OPEN_NEW_HALL_FORM": {
      return { ...state, openNewHallForm: action.value };
    }
    case "OPEN_NEW_TOKEN_FORM": {
      return { ...state, openNewTokenForm: action.value };
    }
    case "OPEN_NEW_ENERGY_PRICE": {
      return { ...state, openAddEnergyPrice: action.value };
    }
    case "OPEN_NEW_TAG_FORM": {
      return { ...state, openNewTagForm: action.value };
    }
    case "OPEN_NEW_TIMELINE_REASON_FORM": {
      return { ...state, openNewTimelineReasonForm: action.value };
    }
    case "OPEN_NEW_USER_FORM": {
      return { ...state, openNewUserForm: action.value };
    }
    case "OPEN_NEW_COMPANY_FORM": {
      return { ...state, openNewCompanyForm: action.value };
    }
    case "OPEN_NEW_AVA_FORM": {
      return { ...state, openNewAvaForm: action.value };
    }
    case "OPEN_NEW_TESS_FORM": {
      return { ...state, openNewTessForm: action.value };
    }
    case "OPEN_OPERATOR_FORM": {
      return { ...state, openOperatorForm: action.value };
    }
    case "DIRECTION": {
      return { ...state, direction: action.value };
    }
    case "LAYOUT": {
      return { ...state, layout: action.value };
    }
    case "DARKMODE": {
      return { ...state, darkMode: action.value };
    }
    case "LANGUAGE": {
      return { ...state, language: action.value };
    }
    case "FETCH_MACHINE": {
      return { ...state, fetchMachine: action.value };
    }
    case "ERROR_MSG": {
      return { ...state, errorMsg: action.value };
    }
    case "ADD_COMPANY": {
      return { ...state, openAddCompanyForm: action.value };
    }
    case "SUCCESS_MSG": {
      return { ...state, successMsg: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const DefaultInitialState = {
  miniSidenav: false,
  transparentSidenav: false,
  whiteSidenav: false,
  sidenavColor: "info",
  transparentNavbar: true,
  fixedNavbar: false,
  openConfigurator: false,
  openMachineForm: false,
  openRatingForm: false,
  openTimelineRulesForm: false,
  openMachineEditForm: false,
  openNewCompanyForm: false,
  openNewUserForm: false,
  openNewAvaForm: false,
  openAddAvaForm: false,
  openNewTessForm: false,
  openOperatorForm: false,
  openSenser: false,
  openAvaSetup: false,
  openTessSetup: false,
  direction: "ltr",
  layout: "dashboard",
  darkMode: true,
  language: "",
  fetchMachine: false,
  openNewShiftForm: false,
  openNewShiftGroupForm: false,
  openAddEnergyPrice: false,
  openNewHallForm: false,
  openNewTagForm: false,
  openNewTimelineReasonForm: false,
  openAddCompanyForm: false,
  errorMsg: "",
  successMsg: ""
};

// Material Dashboard 2 PRO React context provider
function MaterialUIControllerProvider({ children }) {
  const initialState = Cookies.get("userSettings")
    ? JSON.parse(Cookies.get("userSettings"))
    : DefaultInitialState;
  const [controller, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    if (JSON.stringify(controller) !== Cookies.get("userSettings")) {
      Cookies.set("userSettings", JSON.stringify(controller));
    }
  }, [controller]);

  const value = useMemo(() => [controller, dispatch], [controller, dispatch]);

  return <MaterialUI.Provider value={value}>{children}</MaterialUI.Provider>;
}

// Material Dashboard 2 PRO React custom hook for using context
function useMaterialUIController() {
  const context = useContext(MaterialUI);

  if (!context) {
    throw new Error(
      "useMaterialUIController should be used inside the MaterialUIControllerProvider."
    );
  }

  return context;
}

// Typechecking props for the MaterialUIControllerProvider
MaterialUIControllerProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Context module functions
const setMiniSidenav = (dispatch, value) => dispatch({ type: "MINI_SIDENAV", value });
const setTransparentSidenav = (dispatch, value) => dispatch({ type: "TRANSPARENT_SIDENAV", value });
const setWhiteSidenav = (dispatch, value) => dispatch({ type: "WHITE_SIDENAV", value });
const setSidenavColor = (dispatch, value) => dispatch({ type: "SIDENAV_COLOR", value });
const setTransparentNavbar = (dispatch, value) => dispatch({ type: "TRANSPARENT_NAVBAR", value });
const setFixedNavbar = (dispatch, value) => dispatch({ type: "FIXED_NAVBAR", value });
const setOpenConfigurator = (dispatch, value) => dispatch({ type: "OPEN_CONFIGURATOR", value });
const setOpenMachineForm = (dispatch, value) => dispatch({ type: "OPEN_MACHINE_FORM", value });
const setOpenRatingForm = (dispatch, value) => dispatch({ type: "OPEN_RATING_FORM", value });
const setOpenTimelineRulesForm = (dispatch, value) => dispatch({ type: "OPEN_TIMELINE_RULES_FORM", value });
const setOpenMachineEditForm = (dispatch, value) =>
  dispatch({ type: "OPEN_MACHINE_EDIT_FORM", value });
const setOpenNewCompanyForm = (dispatch, value) =>
  dispatch({ type: "OPEN_NEW_COMPANY_FORM", value });
const setOpenNewUserForm = (dispatch, value) => dispatch({ type: "OPEN_NEW_USER_FORM", value });
const setOpenOperatorForm = (dispatch, value) => dispatch({ type: "OPEN_OPERATOR_FORM", value });
const setOpenNewAvaForm = (dispatch, value) => dispatch({ type: "OPEN_NEW_AVA_FORM", value });
const setOpenNewTessForm = (dispatch, value) => dispatch({ type: "OPEN_NEW_TESS_FORM", value });
const setOpenAddEnergyPrice = (dispatch, value) =>
  dispatch({ type: "OPEN_NEW_ENERGY_PRICE", value });
const setOpenSenser = (dispatch, value) => dispatch({ type: "OPEN_SENSER", value });
const setOpenAvaSetup = (dispatch, value) => dispatch({ type: "OPEN_AVA_SETUP", value });
const setAddAvaSetup = (dispatch, value) => dispatch({ type: "OPEN_ADD_AVA_SETUP", value });
const setOpenTessSetup = (dispatch, value) => dispatch({ type: "OPEN_TESS_SETUP", value });
const setDirection = (dispatch, value) => dispatch({ type: "DIRECTION", value });
const setLayout = (dispatch, value) => dispatch({ type: "LAYOUT", value });
const setDarkMode = (dispatch, value) => dispatch({ type: "DARKMODE", value });
const setLanguage = (dispatch, value) => dispatch({ type: "LANGUAGE", value });
const setFetchMachine = (dispatch, value) => dispatch({ type: "FETCH_MACHINE", value });
const setOpenNewShiftForm = (dispatch, value) => dispatch({ type: "OPEN_NEW_SHIFT_FORM", value });
const setOpenNewShiftGroupForm = (dispatch, value) =>
  dispatch({ type: "OPEN_NEW_SHIFT_GROUP_FORM", value });
const setOpenNewHallForm = (dispatch, value) => dispatch({ type: "OPEN_NEW_HALL_FORM", value });
const setOpenNewTokenForm = (dispatch, value) => dispatch({ type: "OPEN_NEW_TOKEN_FORM", value });
const setOpenNewTagForm = (dispatch, value) => dispatch({ type: "OPEN_NEW_TAG_FORM", value });
const setOpenNewTimelineReasonForm = (dispatch, value) =>
  dispatch({ type: "OPEN_NEW_TIMELINE_REASON_FORM", value });
const setErrorMsg = (dispatch, value) => dispatch({ type: "ERROR_MSG", value });
const setSuccessMsg = (dispatch, value) => dispatch({ type: "SUCCESS_MSG", value });
const setAddCompany = (dispatch, value) => dispatch({ type: "ADD_COMPANY", value });
export {
  setOpenAddEnergyPrice,
  MaterialUIControllerProvider,
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
  setSidenavColor,
  setTransparentNavbar,
  setFixedNavbar,
  setOpenConfigurator,
  setOpenMachineForm,
  setOpenRatingForm,
  setOpenTimelineRulesForm,
  setOpenMachineEditForm,
  setOpenNewCompanyForm,
  setOpenNewUserForm,
  setOpenOperatorForm,
  setOpenNewAvaForm,
  setOpenNewTessForm,
  setOpenSenser,
  setOpenAvaSetup,
  setOpenTessSetup,
  setDirection,
  setLayout,
  setDarkMode,
  setLanguage,
  setFetchMachine,
  setOpenNewShiftForm,
  setOpenNewShiftGroupForm,
  setOpenNewHallForm,
  setOpenNewTagForm,
  setOpenNewTimelineReasonForm,
  setOpenNewTokenForm,
  setErrorMsg,
  setAddAvaSetup,
  setSuccessMsg,
  setAddCompany
};
