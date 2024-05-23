/* eslint-disable react/prop-types */
import { Box, Divider, InputAdornment, Modal } from "@mui/material";
import { enumQueryNames } from "api/reactQueryConstant";
import {
  getMachineDetailsApi,
  getMachineRatingApi,
  updateMachineDetailsApi
} from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import MDTypography from "components/MDTypography";
import { setOpenRatingForm, useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import moment from "moment";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import Grid from "@mui/material/Grid";
import LockIcon from '@mui/icons-material/Lock';


function AddRating({ id }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openRatingForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();

  const [errMsg, setErrMsg] = useState("");
  const [successSB, setSuccessSB] = useState(null);
  const [oee, setOee] = useState("");
  const [performance, setPerformance] = useState("");
  const [availability, setAvailability] = useState("");
  const [productionPerHour, setProductionPerHour] = useState("");
  const [idlePerHour, setIdlePerHour] = useState("");
  const [offPerHour, setOffPerHour] = useState("");
  const [energyConsumption, setEnergyConsumption] = useState("");
  const [energyWastage, setEnergyWastage] = useState("");
  const [loadRating, setLoadRating] = useState(false);
  const closeSuccessSB = () => setSuccessSB(null);

  useQuery([enumQueryNames.MACHINE_DETAILS], () => getMachineDetailsApi(axiosPrivate, id), {
    enabled: !!id && openRatingForm,
    onSuccess: (data) => {
      setOee(data?.ratings?.oee?.toString() || "");
      setPerformance(data?.ratings?.performance?.toString() || "");
      setAvailability(data?.ratings?.availability?.toString() || "");
      setProductionPerHour(data?.ratings?.production_per_hour?.toString() || "");
      setIdlePerHour(data?.ratings?.idle_per_hour?.toString() || "");
      setOffPerHour(data?.ratings?.off_per_hour?.toString() || "");
      setEnergyConsumption(data?.ratings?.energy_consumption?.toString() || "");
      setEnergyWastage(data?.ratings?.energy_wastage?.toString() || "");
    }
  });

  const { data: machineRating } = useQuery(
    [enumQueryNames.MACHINE_RATINGS],
    () =>
      getMachineRatingApi(axiosPrivate, {
        machine_list: [+id],
        start_date: moment().subtract(46, "days").format("YYYY-MM-DD"),
        end_date: moment().subtract(1, "days").format("YYYY-MM-DD")
      }),
    {
      enabled: loadRating,
      onSuccess: (data) => {
        setLoadRating(false);
        setOee(data.ratings[id]?.oee?.toString() || "");
        setPerformance(data.ratings[id]?.performance?.toString() || "");
        setAvailability(data.ratings[id]?.availability?.toString() || "");
        // setProductionPerHour(data.ratings[id]?.production_per_hour?.toString() || "");
        // setIdlePerHour(data.ratings[id]?.idle_per_hour?.toString() || "");
        // setOffPerHour(data.ratings[id]?.off_per_hour?.toString() || "");
        setEnergyConsumption(data.ratings[id]?.energy_consumption?.toString() || "");
        setEnergyWastage(data.ratings[id]?.energy_wastage?.toString() || "");
      }
    }
  );

  const handleCloseRatingForm = () => {
    setOee("");
    setPerformance("");
    setAvailability("");
    setProductionPerHour("");
    setIdlePerHour("");
    setOffPerHour("");
    setEnergyConsumption("");
    setEnergyWastage("");
    setOpenRatingForm(dispatch, false);
  };

  const { mutate: updateMachineRating } = useMutation(
    (payload) => updateMachineDetailsApi(axiosPrivate, id, payload),
    {
      onSuccess: () => {
        handleCloseRatingForm();
      }
    }
  );

  const loadRatingHandler = () => {
    setLoadRating(true);
  };

  const updateRatingHandler = () => {
    const payload = {
      ratings: {
        oee: +oee,
        performance: +performance,
        availability: +availability,
        // production_per_hour: +productionPerHour,
        // idle_per_hour: +idlePerHour,
        // off_per_hour: +offPerHour,
        energy_consumption: +energyConsumption,
        energy_wastage: +energyWastage
        // "name": machineRating.ratings[id]?.machine_name
      },
      name: machineRating?.ratings?.[id]?.machine_name
    };
    updateMachineRating(payload);
  };

  return (
    <>
      <Modal
        open={openRatingForm}
        onClose={handleCloseRatingForm}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={({ palette: { dark, white } }) => ({
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 720,
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
            <MDBox textAlign="center">
              <MDTypography
                variant="button"
                color="light"
                fontWeight="medium"
                textGradient
                textAlign="center"
                mx="auto"
                fontSize="1.25rem"
              >
                {translate("Machine rating")}
              </MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                {errMsg}
              </MDTypography>
            </MDBox>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <MDInput
                  type="number"
                  label={translate("OEE")}
                  value={(oee * 100).toFixed(2)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MDTypography fontSize="15px">%</MDTypography>
                      </InputAdornment>
                    )
                  }}
                  onChange={(e) => {
                    setErrMsg("");
                    setOee(e.target.value / 100);
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <MDInput
                  type="number"
                  label={translate("Performance")}
                  value={(performance * 100).toFixed(2)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MDTypography fontSize="15px">%</MDTypography>
                      </InputAdornment>
                    )
                  }}
                  onChange={(e) => {
                    setErrMsg("");
                    setPerformance(e.target.value / 100);
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <MDInput
                  type="number"
                  label={translate("Availability")}
                  value={(availability * 100).toFixed(2)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MDTypography fontSize="15px">%</MDTypography>
                      </InputAdornment>
                    )
                  }}
                  onChange={(e) => {
                    setErrMsg("");
                    setAvailability(e.target.value / 100);
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <MDInput
                  type="number"
                  label={translate("Production / hour")}
                  value={productionPerHour}
                  fullWidth
                  disabled
                  sx={{ backgroundColor: 'transparent !important' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <LockIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <MDInput
                  type="number"
                  label={translate("Idle / hour")}
                  value={idlePerHour}
                  fullWidth
                  disabled
                  sx={{ backgroundColor: 'transparent !important' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <LockIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <MDInput
                  type="number"
                  label={translate("Off / hour")}
                  value={offPerHour}
                  fullWidth
                  disabled
                  sx={{ backgroundColor: 'transparent !important' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <LockIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MDTypography fontSize="15px">kWh</MDTypography>
                      </InputAdornment>
                    )
                  }}
                  type="number"
                  label={translate("energy consumption")}
                  value={energyConsumption}
                  fullWidth
                  onChange={(e) => {
                    setErrMsg("");
                    setEnergyConsumption(e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MDTypography fontSize="15px">kWh</MDTypography>
                      </InputAdornment>
                    )
                  }}
                  type="number"
                  label="Energy Wastage"
                  value={energyWastage}
                  fullWidth
                  onChange={(e) => {
                    setErrMsg("");
                    setEnergyWastage(e.target.value);
                  }}
                />
              </Grid>
            </Grid>
            <Divider />
            <MDBox>
              <MDButton
                variant={darkMode ? "contained" : "outlined"}
                color="dark"
                size="medium"
                onClick={loadRatingHandler}
                sx={{ marginRight: "8px", mt: 1 }}
              >
                {translate("Load rating")}
              </MDButton>
              <MDButton
                sx={{ mt: 1 }}
                variant={darkMode ? "contained" : "outlined"}
                color="dark"
                size="medium"
                onClick={updateRatingHandler}
              >
                {translate("Update rating")}
              </MDButton>
            </MDBox>
          </MDBox>
        </Box>
      </Modal>
      <MDSnackbar
        color="success"
        icon="check"
        title="Success"
        content={successSB?.message}
        open={!!successSB?.message}
        onClose={closeSuccessSB}
        close={closeSuccessSB}
        bgWhite
      />
    </>
  );
}

export default AddRating;
