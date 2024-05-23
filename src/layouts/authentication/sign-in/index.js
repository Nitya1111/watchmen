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

import { useState } from "react";

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

import brandWhite from "assets/images/newlogo.png";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

// Authentication layout components
import BasicLayout from "components/BasicLayout";

// Images
import axios from "api/axios";
import bgImage from "assets/images/login_bg.webp";
import useAuth from "hooks/useAuth";
import Cookies from "js-cookie";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import { loginUser } from "api/watchmenApi";
import { setErrorMsg, useMaterialUIController } from "context";
import translate from "i18n/translate";
import { useMutation } from "react-query";
import { v4 as uuidv4 } from 'uuid';

function Basic() {
  const navigate = useNavigate();

  const { setAuth } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState(false);
  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const [showPassword, setShowPassword] = useState(false);
  const [, dispatch] = useMaterialUIController();

  const systemId = Cookies.get("systemId") || uuidv4()
  Cookies.set("systemId", systemId)
  const headers = {
    systemId
  }

  const { mutate: logginInUser, isLoading } = useMutation((data) => loginUser(axios, data, headers), {
    onSuccess: (data) => {
      if (data.redirect === '2fa') {
        setAuth({ user, password })
        Cookies.set("username", user);
        navigate(`/verifyOTP`, { replace: true });
        return
      }
      
      const refreshToken = data?.refresh_token;
      const Token = data?.token;
      const roles = data?.user?.role;
      const UserCompanyId = data?.user?.company?.id;
      const Id = data?.user?.id;
      const role = data?.user?.role?.name;
      const setting = data?.user?.setting;
      const name = data?.user?.name;
      const rooms = data?.user?.rooms_to_join
      setAuth({ user, password, refreshToken, Token, roles });
      Cookies.set("tok", refreshToken, { expires: 15 });
      Cookies.set("id", Id);
      Cookies.set("companyid", UserCompanyId);
      Cookies.set("role", role);
      Cookies.set("setting", setting);
      Cookies.set("name", name);
      Cookies.set("rooms",rooms)
      setUser("");
      setPassword("");
      navigate(`dashboard/machines`, { replace: true });
    },
    onError: (error) => {
      setErrorMsg(dispatch, error?.response?.data?.message || error?.message);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user === "" || password === "") {
      setErrMsg(translate("name and password cannot be empty"));
      return; // Exit early if validation fails
    }
    const isEmail = user.includes('@');
    const payload = isEmail ? { email: user, password } : { name: user, password };
    logginInUser(payload);
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="dark"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            <MDBox display="flex" alignItems="center" justifyContent="center">
              {brandWhite && (
                <MDBox
                  component="img"
                  src={brandWhite}
                  alt="Brand"
                  margin="auto"
                  width="50%"
                  height="50%"
                />
              )}
            </MDBox>
            {translate("sign in")}
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                {errMsg}
              </MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label={translate("username / email")}
                value={user}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setUser(e.target.value);
                }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type={showPassword ? "text" : "password"}
                label={translate("Password")}
                value={password}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setPassword(e.target.value);
                }}
                sx={{ borderRadius: "unset" }}
                InputProps={{
                  // <-- This is where the toggle button is added.
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => {
                          setShowPassword(!showPassword);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseUp={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {!showPassword ? (
                          <VisibilityOff sx={{ fill: "white" }} />
                        ) : (
                          <Visibility sx={{ fill: "white" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;{translate("Remember me")}
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                type="submit"
                fullWidth
                disabled={isLoading}
                onClick={(e) => handleSubmit(e)}
              >
                {isLoading ? translate("signing in") : translate("sign in")}
              </MDButton>
            </MDBox>
            <MDBox mt={3} textAlign="center">
              <MDTypography
                component={Link}
                to="/forgotPassword"
                variant="button"
                color="info"
                fontWeight="medium"
              // textGradient
              >
                {translate("Forgot password")}
              </MDTypography>
            </MDBox>
            <MDBox mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                {translate("Don't have an account?")}{" "}
                <MDTypography
                  component={Link}
                  to="/signup"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                // textGradient
                >
                  {translate("sign up")}
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
