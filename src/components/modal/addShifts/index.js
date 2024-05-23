/* eslint-disable react/prop-types */
import { Box, Button, Grid, Modal } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenNewShiftForm, setSuccessMsg } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { enumQueryNames } from "api/reactQueryConstant";
import { useMutation } from "react-query";
import { createShiftApi, updateShiftApi } from "api/watchmenApi";
import { invalidateQuery } from "api/customReactQueryClient";
import translate from "i18n/translate";
import { getUpdatedKeysObject } from "utils/constants";

function NewShift({ updateShift, setUpdateShift, refetch }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewShiftForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [shiftName, setShiftName] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [shiftEndTime, setShiftEndTime] = useState(null);
  const [errMsg, setErrMsg] = useState();
  const [breakTime, setBreakTime] = useState([
    {
      start: "",
      end: "",
      time: ""
    }
  ]);

  useEffect(() => {
    if (updateShift) {
      setShiftName(updateShift.name);
      setShiftStartTime(updateShift.start_time.slice(0, -3));
      setShiftEndTime(updateShift.end_time.slice(0, -3));
      setBreakTime(updateShift.meta_frontend.break_time || []);
    }
  }, [updateShift]);

  const handleCloseShiftForm = () => {
    setOpenNewShiftForm(dispatch, !openNewShiftForm);
    setShiftName("");
    setShiftEndTime(null);
    setShiftStartTime(null);
    setErrMsg("");
    setBreakTime([
      {
        start: "",
        end: "",
        time: ""
      }
    ]);
    setUpdateShift(null);
  };

  const { mutate: createShift, isLoading: createShiftLoading } = useMutation(
    (data) => createShiftApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        refetch();
        setSuccessMsg(dispatch, message);
        handleCloseShiftForm();
      }
    }
  );

  const { mutate: updateShiftDetails, isLoading: updateShiftLoading } = useMutation(
    ({ shiftId, data }) => updateShiftApi(axiosPrivate, shiftId, data),
    {
      onSuccess: ({ message }) => {
        refetch();
        setSuccessMsg(dispatch, message);
        handleCloseShiftForm();
      }
    }
  );

  const handleSubmit = async () => {
    if (shiftName === "" || shiftStartTime === null || shiftEndTime === null) {
      setErrMsg("Please fill all the fields");
    } else {
      try {
        let totalTime = 0;

        const shift = {
          name: shiftName,
          start_time: `${shiftStartTime}:00`,
          end_time: `${shiftEndTime}:00`,
          meta_frontend: {
            break_time: breakTime.map((brk) => {
              const breakTimeMinutes =
                brk.end.split(":")[0] * 60 +
                +brk.end.split(":")[1] -
                (brk.start.split(":")[0] * 60 + +brk.start.split(":")[1]);
              const breakHrs = Math.floor(breakTimeMinutes / 60);
              const breakMins = breakTimeMinutes - breakHrs * 60;
              totalTime += breakTimeMinutes;
              return {
                ...brk,
                time: `${String(breakHrs).padStart(2, "0")}:${String(breakMins).padStart(
                  2,
                  "0"
                )}:00`
              };
            }),
            break_time_total: `${String(Math.floor(totalTime / 60)).padStart(2, "0")}:${
              totalTime - Math.floor(totalTime / 60) * 60
            }:00`
          }
        };
        if (updateShift) {
          shift.active = updateShift?.active;
          const compareObjectsTemp = getUpdatedKeysObject(shift, updateShift);
          if (Object.keys(compareObjectsTemp).length !== 0) {
            updateShiftDetails({ shiftId: updateShift.id, data: compareObjectsTemp });
          }
        } else {
          shift.active = true;
          createShift(shift);
        }
      } catch (err) {
        setErrMsg("Unable to create a shift. Please try again in sometime");
      }
    }
  };

  const clockSx = {
    '& input[type="time"]::-webkit-calendar-picker-indicator': {
      filter: darkMode
        ? "invert(100%) sepia(100%) saturate(1%) hue-rotate(2deg) brightness(104%) contrast(101%)"
        : "invert(58%) sepia(4%) saturate(2121%) hue-rotate(193deg) brightness(87%) contrast(86%)"
    }
  };

  const breakTimeHandler = (label, value, index) => {
    const breaktimeUpdated = breakTime.map((brk, ind) => {
      if (ind === index) {
        return {
          ...brk,
          [label]: `${value}:00`
        };
      }
      return brk;
    });
    setBreakTime(breaktimeUpdated);
  };

  const removeBreakHandler = (index) => {
    setBreakTime(breakTime.filter((val, ind) => index !== ind));
  };

  const addBreakHandler = () => {
    setBreakTime([
      ...breakTime,
      {
        start: "",
        end: "",
        time: ""
      }
    ]);
  };

  return (
    <Modal
      open={openNewShiftForm}
      onClose={handleCloseShiftForm}
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
            {updateShift ? "Update Shift" : "Add Shift"}
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
              value={shiftName}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setShiftName(e.target.value);
              }}
            />
          </MDBox>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <MDInput
                type="time"
                label={translate("Shift Start time")}
                variant="outlined"
                value={shiftStartTime}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setShiftStartTime(e.target.value);
                }}
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  step: 300
                }}
                sx={clockSx}
              />
            </Grid>
            <Grid item xs={6}>
              <MDInput
                type="time"
                label={translate("Shift End time")}
                variant="outlined"
                value={shiftEndTime}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setShiftEndTime(e.target.value);
                }}
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  step: 300
                }}
                sx={clockSx}
              />
            </Grid>
          </Grid>
          {breakTime.length
            ? breakTime.map((time, index) => (
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={5}>
                    <MDInput
                      type="time"
                      label={translate("Break Start time")}
                      variant="outlined"
                      value={time.start}
                      fullWidth
                      onChange={(e) => {
                        setErrMsg("");
                        breakTimeHandler("start", e.target.value, index);
                      }}
                      InputLabelProps={{
                        shrink: true
                      }}
                      inputProps={{
                        step: 300
                      }}
                      sx={clockSx}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <MDInput
                      type="time"
                      label={translate("Break End time")}
                      variant="outlined"
                      value={time.end}
                      fullWidth
                      onChange={(e) => {
                        setErrMsg("");
                        breakTimeHandler("end", e.target.value, index);
                      }}
                      InputLabelProps={{
                        shrink: true
                      }}
                      inputProps={{
                        step: 300
                      }}
                      sx={clockSx}
                    />
                  </Grid>
                  <Grid item xs={2} display="flex" justifyContent="center" alignItems="center">
                    <DeleteIcon onClick={() => removeBreakHandler(index)} />
                  </Grid>
                </Grid>
              ))
            : null}
          <Button onClick={addBreakHandler}>
            <AddIcon /> add break
          </Button>
          <MDBox mb={2} display="flex" flexDirection="column">
            <MDButton
              color="dark"
              size="medium"
              variant={darkMode ? "contained" : "outlined"}
              onClick={handleSubmit}
            >
              {translate(
                updateShift
                  ? updateShiftLoading
                    ? "Updating shift"
                    : "Update shift"
                  : createShiftLoading
                  ? "Creating shift"
                  : "Create shift"
              )}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewShift;
