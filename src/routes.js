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
  All of the routes for the Material Dashboard 2 PRO React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 PRO React layouts
// import Analytics from "layouts/dashboards/analytics";
// import Sales from "layouts/dashboards/sales";
// import AllProjects from "layouts/pages/profile/all-projects";
// import NewUser from "layouts/pages/users/new-user";
// import Billing from "layouts/pages/account/billing";
// import Invoice from "layouts/pages/account/invoice";
// import Timeline from "layouts/pages/projects/timeline";
// import PricingPage from "layouts/pages/pricing-page";
// import Widgets from "layouts/pages/widgets";
// import RTL from "layouts/pages/rtl";
// import Charts from "layouts/pages/charts";
// import Notifications from "layouts/pages/notifications";
// import Kanban from "layouts/applications/kanban";
// import Wizard from "layouts/applications/wizard";
// import DataTables from "layouts/applications/data-tables";
// import Calendar from "layouts/applications/calendar";
// import NewProduct from "layouts/ecommerce/products/new-product";
// import EditProduct from "layouts/ecommerce/products/edit-product";
// import ProductPage from "layouts/ecommerce/products/product-page";
// import OrderList from "components//order-list";
// import OrderDetails from "components//order-details";
// import SignInBasic from "layouts/authentication/sign-in/";
// import SignInCover from "layouts/authentication/sign-in/cover";
// import SignInIllustration from "layouts/authentication/sign-in/illustration";
// import SignUpCover from "layouts/authentication/sign-up";
// import ResetCover from "layouts/authentication/reset-password/cover";

// @mui icons
import Icon from "@mui/material/Icon";

// Images
import { AdminPanelSettings } from "@mui/icons-material";
import Cookies from "js-cookie";
import Commander from "layouts/admin/commander";
import Company from "layouts/admin/company";
import Shifts from "layouts/admin/shifts";
import Analysis from "layouts/dashboards/analysis";
import CompanyDetail from "layouts/dashboards/company";
import CompareMachines from "layouts/dashboards/compareMachine";
import MachineShifts from "layouts/dashboards/machineShifts";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EventIcon from "@mui/icons-material/Event";
import ShuffleOnIcon from "@mui/icons-material/ShuffleOn";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import PeakOptimizer from "layouts/dashboards/peakOptimizer";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import Leaderboard from "layouts/dashboards/leaderboard";
import Machines from "layouts/dashboards/machines";

const routes = () => {
  const role = Cookies.get("role");
  const myRoutes = [
    {
      type: "collapse",
      name: "Dashboard",
      key: "dashboard",
      icon: <Icon fontSize="medium">dashboard</Icon>,
      route: "/dashboard",
      component: <Machines />,
      noCollapse: true,
      index: 1
    },
    role === "super_admin" || role === "admin"
      ? {
        index: 5,
        type: "collapse",
        name: "Admin Panel",
        key: "admin-panel",
        icon: <Icon fontSize="medium">ballot</Icon>,
        route: "/admin-panel", //done refresh
        component: <Shifts />,
        noCollapse: true
      }
      : null,
    role === "super_admin"
      ? {
        type: "collapse",
        name: "admin",
        key: "admin",
        icon: <AdminPanelSettings />,
        collapse: [
          {
            name: "Company",
            key: "company",
            route: "/super-admin", //done refresh
            component: <Company />
          },
          {
            name: "Commander",
            key: "commander",
            route: "/admin/commander", //done refresh
            component: <Commander />
          }
        ]
      }
      : null,
    // Commented for deployment need to work
    (role === "super_admin" || role === "admin") && {
      index: 3,
      type: "collapse",
      name: "Org Stats",
      key: "company",
      icon: <RocketLaunchIcon />,
      route: "/org-stats", //done refresh
      component: <CompanyDetail />,
      noCollapse: true
    },
    {
      index: 9,
      type: "collapse",
      name: "Versus",
      key: "1v1",
      icon: <ShuffleOnIcon />,
      route: "/versus", //done refresh
      component: <CompareMachines />,
      noCollapse: true
    },
    {
      index: 10,
      type: "collapse",
      name: "Reports",
      key: "reports",
      icon: <AnalyticsIcon />,
      route: "/reports", //done refresh
      component: <Analysis />,
      noCollapse: true
    },
    role === "super_admin" ||
    (role === "admin" && {
      index: 4,
      type: "collapse",
      name: "Scheduler",
      key: "scheduler",
      icon: <EventIcon />,
      route: "/scheduler", //done refresh
      component: <MachineShifts />,
      noCollapse: true
    }),
    {
      index: 8,
      type: "collapse",
      name: "Peak Optimizer",
      key: "peakOptimizer",
      icon: <ArrowCircleUpIcon />,
      route: "/peakOptimizer", //done refresh
      component: <PeakOptimizer />,
      noCollapse: true
    },
    (role === "super_admin" || role === "admin") && {
      index: 7,
      type: "collapse",
      name: "Leader Board",
      key: "leaderboard",
      icon: <WorkspacePremiumIcon />,
      route: "/leaderboard", //done refresh
      component: <Leaderboard />,
      noCollapse: true
    }
  ];
  return myRoutes.filter((val) => val);
};

export default routes;
