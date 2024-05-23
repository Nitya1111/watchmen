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
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

import brandWhite from "assets/images/newlogo.png";

// Authentication layout components

// Images
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import bgImage from "assets/images/login_bg.webp";
import BasicLayout from "components/BasicLayout";
import translate from "i18n/translate";
import { useState } from "react";

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [license, setLicense] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (terms) {
      setLoading(true);

      if (name === "" || email === "" || password === "" || license === "") {
        setErrMsg("Fields cannot be empty");
        setLoading(false);
      } else {
        try {
          // const userData = {
          //   name,
          //   password,
          //   license,
          //   email
          // };
          // const response = await axios.post("user/", userData);
          setName("");
          setEmail("");
          setLicense("");
          setPassword("");
          setLoading(false);
        } catch (err) {
          if (!err?.response) {
            setErrMsg("No response from server");
            setLoading(false);
          } else if (err?.response?.status === 400) {
            setErrMsg("missing username or password");
            setLoading(false);
          } else if (err?.response?.status === 401) {
            setErrMsg("Unauthorized");
            setLoading(false);
          } else {
            setErrMsg("Unable to create a User. Please try again in sometime");
            setLoading(false);
          }
        }
      }
    } else {
      setErrMsg("select terms first");
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
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
            {translate("sign up")}
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            {translate("Enter your email and password to register")}
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox mb={2}>
            <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
              {errMsg}
            </MDTypography>
          </MDBox>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                variant="outlined"
                value={name}
                fullWidth
                onChange={(e) => setName(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="outlined"
                value={email}
                fullWidth
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Password"
                variant="outlined"
                value={password}
                fullWidth
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => {
                          setShowPassword(!showPassword);
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
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="License"
                variant="outlined"
                value={license}
                fullWidth
                onChange={(e) => setLicense(e.target.value)}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox onChange={(e) => setTerms(e.target.checked)} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;{translate("I agree the")}&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                {translate("Terms and Conditions")}
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                type="submit"
                disabled={loading}
                fullWidth
                onClick={(e) => handleSubmit(e)}
              >
                {loading ? translate("signing up") : translate("sign up")}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                {translate("Already have an account?")}{" "}
                <MDTypography
                  component={Link}
                  to="/signin"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  {translate("sign in")}
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Cover;
