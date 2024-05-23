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

import { useEffect, useState } from "react";

// react-router-dom components
import { NavLink, useLocation, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Link from "@mui/material/Link";
import List from "@mui/material/List";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import SidenavCollapse from "components/Sidenav/SidenavCollapse";
import SidenavItem from "components/Sidenav/SidenavItem";
import SidenavList from "components/Sidenav/SidenavList";

// Custom styles for the Sidenav
import SidenavRoot from "components/Sidenav/SidenavRoot";

// Material Dashboard 2 PRO React context
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import GridViewIcon from "@mui/icons-material/GridView";
import { enumQueryNames } from "api/reactQueryConstant";
import { getHallListApi } from "api/watchmenApi";
import novoAi from "assets/images/NovoAI.png";
import novoAiVertical from "assets/images/NovoAIVertical.png";
import MachineDetails from "components/machineDetails";
import {
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
  useMaterialUIController
} from "context";
import useAuth from "hooks/useAuth";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import { useMutation } from "react-query";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const { auth } = useAuth();
  const [openCollapse, setOpenCollapse] = useState(false);
  const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
  const [controller, dispatch] = useMaterialUIController();
  const { axiosPrivate } = useAxiosPrivate();
  const [hallList, setHallList] = useState([]);
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();
  const { pathname } = location;
  const collapseName = pathname.split("/").slice(1)[0];
  const items = pathname.split("/").slice(1);
  const itemParentName = items[1];
  const itemName = items[1];
  const navigate = useNavigate();
  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    setOpenCollapse(collapseName);
    setOpenNestedCollapse(itemParentName);
  }, []);

  const { mutate: fetchHallList } = useMutation(
    [enumQueryNames.HALL_LIST],
    () => getHallListApi(axiosPrivate),
    {
      onSuccess: (data) => {
        setHallList(data);
      }
    }
  );

  useEffect(() => {
    if (auth?.Token) {
      fetchHallList();
    }
  }, [auth?.Token]);

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      // setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // Render all the nested collapse items from the routes.js
  const renderNestedCollapse = (collapse) => {
    const template = collapse.map(({ name, route, key, href, state }) =>
      href ? (
        <Link
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavItem name={name} nested />
        </Link>
      ) : (
        <SidenavItem
          sx={{ whiteSpace: "break-spaces" }}
          name={name}
          active={route === pathname}
          nested
          key={key}
          onClick={() => navigate(`${route}`, { state })}
        />
      )
    );

    return template;
  };
  // Render the all the collpases from the routes.js
  const renderCollapse = (collapses) =>
    collapses.map(({ name, collapse, route, href, key, state }) => {
      let returnValue;
      if (collapse) {
        returnValue = (
          <SidenavItem
            key={key}
            color={color}
            name={name}
            active={
              key === itemParentName || collapse.find((item) => item.key === itemParentName)
                ? "isParent"
                : false
            }
            open={openNestedCollapse === key}
            onClick={({ currentTarget }) =>
              openNestedCollapse === key && currentTarget.classList.contains("MuiListItem-root")
                ? setOpenNestedCollapse(false)
                : setOpenNestedCollapse(key)
            }
          >
            {renderNestedCollapse(collapse)}
          </SidenavItem>
        );
      } else {
        returnValue = href ? (
          <Link
            href={href}
            key={key}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <SidenavItem color={color} name={name} active={key === itemName} />
          </Link>
        ) : (
          <SidenavItem
            key={key}
            color={color}
            name={name}
            active={key === itemName}
            onClick={() => navigate(`${route}`, { state })}
          />
        );
      }
      return <SidenavList key={key}>{returnValue}</SidenavList>;
    });

  // Render all the routes from the routes.js (All the visible items on the Sidenav)

  const renderRoutes = [
    ...routes,
    // {
    //   index: 6,
    //   type: "collapse",
    //   name: "Floorplan",
    //   key: "floorplan",
    //   route: "floorPlan",
    //   icon: <GridViewIcon />,
    //   collapse: hallList.map((hall) => ({
    //     name: hall.name,
    //     key: hall.id,
    //     route: `floorPlan/${hall.id}`
    //   }))
    // },
    {
      index: 6,
      type: "collapse",
      name: "Hallplan",
      key: "hallplan",
      route: "hallPlan",
      icon: <GridViewIcon />,
      collapse: hallList.map((hall) => ({
        name: hall.name,
        key: hall.id,
        route: `hallPlan/${hall.id}`,
        state: { name: hall.name }
      }))
    },
    {
      index: 2,
      type: "collapse",
      name: "Machines",
      key: "machines",
      icon: <AutoAwesomeMotionIcon style={{ color: "white" }} />,
      collapse: hallList.map((hall) => ({
        type: "collapse",
        name: hall.name,
        key: hall.id,
        collapse: hall.machine_list.map((machine) => ({
          name: machine.name,
          key: machine.id.toString(),
          route: `/machines/${machine.id}`,
          component: <MachineDetails />,
          state: { name: machine.name }
        }))
      }))
    }
  ]
    .sort((a, b) => a.index - b.index)
    .map(({ type, name, icon, title, collapse, noCollapse, key, href, route }) => {
      let returnValue;
      if (type === "collapse") {
        if (href) {
          returnValue = (
            <Link
              href={href}
              key={key}
              target="_blank"
              rel="noreferrer"
              sx={{ textDecoration: "none" }}
            >
              <SidenavCollapse
                name={name}
                icon={icon}
                active={key === collapseName}
                noCollapse={noCollapse}
              />
            </Link>
          );
        } else if (noCollapse && route) {
          returnValue = (
            <NavLink to={route} key={key}>
              <SidenavCollapse
                name={name}
                icon={icon}
                noCollapse={noCollapse}
                active={key === collapseName}
              >
                {collapse ? renderCollapse(collapse) : null}
              </SidenavCollapse>
            </NavLink>
          );
        } else {
          returnValue = (
            <SidenavCollapse
              key={key}
              name={name}
              icon={icon}
              active={key === collapseName}
              open={openCollapse === key}
              onClick={() => (openCollapse === key ? setOpenCollapse(false) : setOpenCollapse(key))}
            >
              {collapse ? renderCollapse(collapse) : null}
            </SidenavCollapse>
          );
        }
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }

      return returnValue;
    });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox
          component={NavLink}
          to="/"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {brand && (
            <MDBox
              component="img"
              src={brand}
              alt="Brand"
              margin="auto"
              width={miniSidenav ? "62px" : "50%"}
              height={miniSidenav ? "21px" : "50%"}
            />
          )}
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List sx={{ overflowY: "auto", overflowX: "hidden" }}>{renderRoutes}</List>
      {miniSidenav ? (
        <MDBox
          p={2}
          mt="auto"
          component="img"
          src={novoAiVertical}
          alt="NOVOAI"
          borderRadius="lg"
          shadow="md"
          position="relative"
          zIndex={1}
          width="5rem"
          alignSelf="center"
        />
      ) : (
        <MDBox
          p={2}
          mt="auto"
          component="img"
          src={novoAi}
          alt="NOVOAI"
          borderRadius="lg"
          shadow="md"
          position="relative"
          zIndex={1}
          width="12rem"
          alignSelf="center"
        />
      )}
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "error",
  brand: "",
  brandName: ""
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string
};

export default Sidenav;
