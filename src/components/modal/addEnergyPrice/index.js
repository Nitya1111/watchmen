/* eslint-disable react/prop-types */
import { Box, Modal, TextField } from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenAddEnergyPrice, setSuccessMsg } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import React, { useEffect, useState } from "react";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import colors from "assets/theme-dark/base/colors";
import moment from "moment";
import { enumQueryNames } from "api/reactQueryConstant";
import { useMutation } from "react-query";
import { invalidateQuery } from "api/customReactQueryClient";
import translate from "i18n/translate";
import { calenderDarkTheme } from "layouts/dashboards/machineShifts/rangepicker";
import { ThemeProvider } from "@mui/system";
import { addEnergyPriceApi, updateEnergyPriceApi } from "api/watchmenApi";
import { getUpdatedKeysObject } from "utils/constants";

function NewEnergyPrice({ updateEnergyPrice, refresh }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openAddEnergyPrice } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [pricePerKWH, setPricePerKWH] = useState(0);
  const [errMsg, setErrMsg] = useState();
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());

  useEffect(() => {
    if (updateEnergyPrice) {
      setPricePerKWH(updateEnergyPrice.price_per_kwh);
      setStartDate(moment(updateEnergyPrice.start_date));
      setEndDate(moment(updateEnergyPrice.end_date));
    }
  }, [updateEnergyPrice]);
  const handleCloseTokenForm = () => {
    setOpenAddEnergyPrice(dispatch, !openAddEnergyPrice);
    setPricePerKWH("");
    setEndDate();
    setStartDate();
    setErrMsg("");
  };

  const { mutate: createEnergyPrice, isLoading: createEnergyPriceLoading } = useMutation(
    (data) => addEnergyPriceApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        refresh();
        setSuccessMsg(dispatch, message);
        handleCloseTokenForm();
        invalidateQuery([enumQueryNames.ENERGY_PRICE]);
      }
    }
  );
  const { mutate: updateEnergyPriceData, isLoading: updateEnergyPriceLoading } = useMutation(
    ({ priceId, data }) => updateEnergyPriceApi(axiosPrivate, priceId, data),
    {
      onSuccess: ({ message }) => {
        refresh();
        setSuccessMsg(dispatch, message);
        handleCloseTokenForm();
        invalidateQuery([enumQueryNames.ENERGY_PRICE]);
      }
    }
  );

  const handleSubmit = async () => {
    if (!pricePerKWH || !endDate || !startDate) {
      setErrMsg("Please fill all the fields");
      return;
    }
    if (updateEnergyPrice) {
      const tag = {
        price_per_kwh: parseFloat(pricePerKWH),
        end_date: moment(endDate).format("YYYY-MM-DD"),
        start_date: moment(startDate).format("YYYY-MM-DD")
      };
      const compareObjectsTemp = getUpdatedKeysObject(tag, updateEnergyPrice);
      if (Object.keys(compareObjectsTemp).length !== 0) {
        updateEnergyPriceData({ priceId: updateEnergyPrice.id, data: compareObjectsTemp });
      }
    } else {
      const formData = {
        price_per_kwh: parseFloat(pricePerKWH),
        end_date: moment(endDate).format("YYYY-MM-DD"),
        start_date: moment(startDate).format("YYYY-MM-DD")
      };
      createEnergyPrice(formData);
    }
  };

  return (
    <Modal
      open={openAddEnergyPrice}
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
            px={2}
            pb={4}
            fontSize="1.25rem"
          >
            {translate("addEnergyPrice")}
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
              type="number"
              label={translate("Price per kWh (€)")}
              variant="outlined"
              value={pricePerKWH}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setPricePerKWH(e.target.value);
              }}
            />
          </MDBox>
          <ThemeProvider theme={calenderDarkTheme}>
            <LocalizationProvider dateAdapter={AdapterMoment} localeText="en">
              <DesktopDatePicker
                label={translate("Select start date")}
                format="DD/MM/YYYY"
                value={startDate || moment()}
                onChange={(date) => {
                  setErrMsg("");
                  setStartDate(date);
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
          <MDBox mb={2} />
          <ThemeProvider theme={calenderDarkTheme}>
            <LocalizationProvider dateAdapter={AdapterMoment} localeText="en">
              <DesktopDatePicker
                label={translate("Select end date")}
                format="DD/MM/YYYY"
                value={endDate || moment()}
                onChange={(date) => {
                  setErrMsg("");
                  setEndDate(date);
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
              {updateEnergyPrice
                ? updateEnergyPriceLoading
                  ? "Updating Energy Price"
                  : "Update Energy Price"
                : createEnergyPriceLoading
                ? "Creating Energy Price"
                : "Create Energy Price"}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewEnergyPrice;
