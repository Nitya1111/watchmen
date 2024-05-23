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

import App from "App";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

// Material Dashboard 2 PRO React Context Provider
import reactQueryClient from "api/customReactQueryClient";
import { MaterialUIControllerProvider } from "context";
import { AuthProvider } from "context/AuthProvider";
import { MachineProvider } from "context/MachineProvider";
import { QueryClientProvider } from "react-query";
import { I18nProvider } from "./i18n";

ReactDOM.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <AuthProvider>
        <MachineProvider>
          <I18nProvider>
            <QueryClientProvider client={reactQueryClient}>
              <App />
            </QueryClientProvider>
          </I18nProvider>
        </MachineProvider>
      </AuthProvider>
    </MaterialUIControllerProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
