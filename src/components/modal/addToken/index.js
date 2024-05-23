/* eslint-disable react/prop-types */
import { Box, Modal, TextField } from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenNewTokenForm, setSuccessMsg } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import React, { useState } from "react";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import colors from "assets/theme-dark/base/colors";
import moment from "moment";
import { createTokenApi } from "api/watchmenApi";
import { enumQueryNames } from "api/reactQueryConstant";
import { useMutation } from "react-query";
import { invalidateQuery } from "api/customReactQueryClient";
import translate from "i18n/translate";
import { calenderDarkTheme } from "layouts/dashboards/machineShifts/rangepicker";
import { ThemeProvider } from "@mui/system";

function NewToken({ refresh }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewTokenForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [tokenName, setTokenName] = useState("");
  const [errMsg, setErrMsg] = useState();
  const [expirationDate, setExpirationDate] = useState();
  const [createdToken, setCreatedToken] = useState("");

  const handleCloseTokenForm = () => {
    setOpenNewTokenForm(dispatch, !openNewTokenForm);
    setTokenName("");
    setErrMsg("");
    setCreatedToken("");
  };

  const { mutate: createToken, isLoading: createTokenLoading } = useMutation(
    (data) => createTokenApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        refresh();
        setSuccessMsg(dispatch, message);
        handleCloseTokenForm();
        invalidateQuery([enumQueryNames.TOKEN_LIST]);
      }
    }
  );

  const handleSubmit = async () => {
    if (!tokenName || !expirationDate) {
      setErrMsg("Please fill all the fields");
      return;
    }
    const token = {
      name: tokenName,
      valid_till: moment(expirationDate).format("DD-MM-YYYY")
    };
    createToken(token);
  };

  return (
    <Modal
      open={openNewTokenForm}
      onClose={handleCloseTokenForm}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={({ palette: { dark, white } }) => ({
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: darkMode ? "#0F141F" : "#eeeeee",
          border: "1px solid #000",
          borderRadius: "3%",
          boxShadow: 24,
          p: 4,
          color: darkMode ? white.main : dark.main,
          maxHeight: "90vh",
          overflow: "auto"
        })}
        className="customScroll"
      >
        <MDBox pt={0.5} pb={3} px={3} display="flex" flexDirection="column">
          <MDTypography
            variant="button"
            color="light"
            fontWeight="medium"
            textGradient
            textAlign="center"
            px={8}
            fontSize="1.25rem"
          >
            {translate("Add Token")}
          </MDTypography>
          {errMsg && (
            <MDBox mb={2}>
              <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                {errMsg}
              </MDTypography>
            </MDBox>
          )}
          <MDBox mb={2}>
            <MDInput
              type="text"
              label={translate("name")}
              variant="outlined"
              value={tokenName}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setTokenName(e.target.value);
              }}
            />
          </MDBox>
          <ThemeProvider theme={calenderDarkTheme}>
            <LocalizationProvider dateAdapter={AdapterMoment} localeText="en">
              <DesktopDatePicker
                label={translate("Select date")}
                format="DD/MM/YYYY"
                value={expirationDate || moment()}
                onChange={(date) => {
                  setErrMsg("");
                  setExpirationDate(date);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      svg: { color: "#ffffff" }
                    }}
                  />
                )}
                sx={{
                  width: "-webkit-fill-available"
                }}
                maxDate={new Date().setFullYear(new Date().getFullYear() + 1)}
                minDate={new Date()}
                PaperProps={{
                  sx: {
                    "& .Mui-selected": {
                      backgroundColor: `${colors.info.main} !important`
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </ThemeProvider>
          <MDBox my={2} textAlign="center" display="flex" flexDirection="column">
            <MDButton
              color="dark"
              size="medium"
              variant={darkMode ? "contained" : "outlined"}
              onClick={handleSubmit}
            >
              {createTokenLoading ? "Creating token" : "Create token"}
            </MDButton>
          </MDBox>
          {createdToken && (
            <MDBox mb={2}>
              <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                {translate("Please copy this token. won't be able to copy it again.")}
              </MDTypography>
              <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                {createdToken}
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewToken;
