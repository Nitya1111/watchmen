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

import { useState } from "react"

// react-router-dom components
import { Link, useNavigate } from "react-router-dom"

// @mui material components
import Card from "@mui/material/Card"
import Switch from "@mui/material/Switch"

import brandWhite from "assets/images/newlogo.png"

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox"
import MDTypography from "components/MDTypography"
import MDInput from "components/MDInput"
import MDButton from "components/MDButton"

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout"

// Images
import bgImage from "assets/images/login_bg.webp"
import axios from "api/axios"
import useAuth from "hooks/useAuth"
import Cookies from "js-cookie"

import { Visibility, VisibilityOff } from "@mui/icons-material"
import { IconButton, InputAdornment } from "@mui/material"
import translate from "i18n/translate"
import { loginUser } from "api/watchmenApi"
import { useMutation } from "react-query"
import { setErrorMsg, useMaterialUIController } from "context"

function Basic() {
  const navigate = useNavigate()

  const { setAuth } = useAuth()
  const [rememberMe, setRememberMe] = useState(false)

  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")
  const [errMsg, setErrMsg] = useState(false)
  const handleSetRememberMe = () => setRememberMe(!rememberMe)
  const [showPassword, setShowPassword] = useState(false)
  const [, dispatch] = useMaterialUIController()

  const { mutate: logginInUser, isLoading } = useMutation((data) => loginUser(axios, data), {
    onSuccess: (data) => {
      const refreshToken = data?.refresh_token
      const Token = data?.token
      const roles = data?.user?.role
      const UserCompanyId = data?.user?.company?.id
      const Id = data?.user?.id
      const role = data?.user?.role?.name
      const setting = data?.user?.setting
      const name = data?.user?.name
      setAuth({ user, password, refreshToken, Token, roles })
      Cookies.set("tok", refreshToken, { expires: 15 })
      Cookies.set("id", Id)
      Cookies.set("companyid", UserCompanyId)
      Cookies.set("role", role)
      Cookies.set("seeting", setting)
      Cookies.set("name", name)
      setUser("")
      setPassword("")
      navigate(`dashboard/machines`, { replace: true })
    },
    onError: (error) => {
      setErrorMsg(dispatch, error?.response?.data?.message || error?.message)
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (user === "" || password === "") {
      setErrMsg("name and password cannot be empty")
    } else {
      logginInUser({ name: user, password })
    }
  }

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
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
                label="Email"
                value={user}
                fullWidth
                onChange={(e) => {
                  setErrMsg("")
                  setUser(e.target.value)
                }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                fullWidth
                onChange={(e) => {
                  setErrMsg("")
                  setPassword(e.target.value)
                }}
                sx={{ borderRadius: "unset" }}
                InputProps={{
                  // <-- This is where the toggle button is added.
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => {
                          setShowPassword(!showPassword)
                        }}
                        onMouseDown={(e) => e.preventDefault()}
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
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                {translate("Don't have an account?")}{" "}
                <MDTypography
                  component={Link}
                  to="/signup"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  {translate("sign up")}
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  )
}

export default Basic
