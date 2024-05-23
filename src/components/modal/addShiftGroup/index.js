/* eslint-disable react/prop-types */
import {
  Box,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  Checkbox,
  Skeleton
} from "@mui/material";
import { invalidateQuery } from "api/customReactQueryClient";
import { enumQueryNames } from "api/reactQueryConstant";
import {
  updateShiftGroupApi,
  createShiftGroupApi,
  getMachineListApi,
  getShiftListApi
} from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { setOpenNewShiftGroupForm, useMaterialUIController, setSuccessMsg } from "context";
import useAuth from "hooks/useAuth";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { getUpdatedKeysObject } from "utils/constants";

export const useStyle = () => ({
  skeleton: {
    transform: "unset",
    margin: "1% 0"
  }
});

function NewShiftGroup({ updateShiftGroup, setUpdateShiftGroup, refetch }) {
  const { auth } = useAuth();
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewShiftGroupForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [shift, setShift] = useState([]);
  const [shiftGroupName, setShiftGroupName] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [mondayShifts, setMondayShifts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [tuesdayShifts, setTuesdayShifts] = useState([]);
  const [wednesdayShifts, setWednesdayShifts] = useState([]);
  const [thursdayShifts, setThursdayShifts] = useState([]);
  const [fridayShifts, setFridayShifts] = useState([]);
  const [saturdayShifts, setSaturdayShifts] = useState([]);
  const [sundayShifts, setSundayShifts] = useState([]);
  const classes = useStyle();

  useEffect(() => {
    if (updateShiftGroup) {
      setShiftGroupName(updateShiftGroup.name);
      setShift(updateShiftGroup.shift_list.map((curShift) => curShift.id));
      setSelectedMachines(updateShiftGroup.machine_list.map((machine) => machine.id));
      setMondayShifts(updateShiftGroup.meta_backend.shift_days?.monday_shift || []);
      setTuesdayShifts(updateShiftGroup.meta_backend.shift_days?.tuesday_shift || []);
      setWednesdayShifts(updateShiftGroup.meta_backend.shift_days?.wednesday_shift || []);
      setThursdayShifts(updateShiftGroup.meta_backend.shift_days?.thursday_shift || []);
      setFridayShifts(updateShiftGroup.meta_backend.shift_days?.friday_shift || []);
      setSaturdayShifts(updateShiftGroup.meta_backend.shift_days?.saturday_shift || []);
      setSundayShifts(updateShiftGroup.meta_backend.shift_days?.sunday_shift || []);
    }
  }, [updateShiftGroup]);

  const handleCloseShiftGroupForm = () => {
    setOpenNewShiftGroupForm(dispatch, !openNewShiftGroupForm);
    setShiftGroupName("");
    setShift([]);
    setSelectedMachines([]);
    setErrMsg("");
    setUpdateShiftGroup(null);
    setMondayShifts([]);
    setTuesdayShifts([]);
    setWednesdayShifts([]);
    setThursdayShifts([]);
    setFridayShifts([]);
    setSaturdayShifts([]);
    setSundayShifts([]);
  };

  const setShiftHandler = (value) => {
    setErrMsg("");
    setShift(value);
    setMondayShifts(value);
    setTuesdayShifts(value);
    setWednesdayShifts(value);
    setThursdayShifts(value);
    setFridayShifts(value);
    setSaturdayShifts(value);
    setSundayShifts(value);
  };

  const { isFetching: shiftFetching, data: shifts = [] } = useQuery(
    [enumQueryNames.SHIFT_LIST],
    () => getShiftListApi(axiosPrivate),
    {
      enabled: openNewShiftGroupForm
    }
  );

  const { isLoading: machineFetching, mutate: fetchMachineListApi } = useMutation(
    [enumQueryNames.MACHINE_LIST],
    () => getMachineListApi(axiosPrivate),
    {
      enabled: openNewShiftGroupForm,
      onSuccess: (data) => {
        setMachines(data);
      }
    }
  );
  useEffect(() => {
    if (auth?.Token) {
      fetchMachineListApi();
    }
  }, [auth?.Token]);

  const { mutate: createShiftGroup, isLoading: createShiftGroupLoading } = useMutation(
    (data) => createShiftGroupApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        refetch();
        setSuccessMsg(dispatch, message);
        handleCloseShiftGroupForm();
        invalidateQuery([enumQueryNames.SHIFT_GROUP_LIST]);
      }
    }
  );

  const { mutate: updateShiftGroupDetails, isLoading: updateShiftGroupLoading } = useMutation(
    ({ shiftGroupId, data }) => updateShiftGroupApi(axiosPrivate, shiftGroupId, data),
    {
      onSuccess: ({ message }) => {
        setSuccessMsg(dispatch, message);
        handleCloseShiftGroupForm();
        invalidateQuery([enumQueryNames.SHIFT_GROUP_LIST]);
        refetch();
      }
    }
  );

  const handleSubmit = async () => {
    if (shiftGroupName === "" || !shift.length) {
      setErrMsg("Please fill all the fields");
    } else {
      try {
        const shiftGroup = {
          name: shiftGroupName,
          meta_backend: {
            shift_days: {
              monday_shift: mondayShifts,
              tuesday_shift: tuesdayShifts,
              wednesday_shift: wednesdayShifts,
              thursday_shift: thursdayShifts,
              friday_shift: fridayShifts,
              saturday_shift: saturdayShifts,
              sunday_shift: sundayShifts
            }
          },
          shifts: shift
        };
        if (selectedMachines.length) {
          shiftGroup.machines = selectedMachines;
        }
        if (updateShiftGroup) {
          const compareObjectsTemp = getUpdatedKeysObject(shiftGroup, updateShiftGroup);
          if (Object.keys(compareObjectsTemp).length !== 0) {
            updateShiftGroupDetails({
              shiftGroupId: updateShiftGroup.id,
              data: compareObjectsTemp
            });
          }
        } else {
          createShiftGroup(shiftGroup);
        }
      } catch (err) {
        setErrMsg("Unable to create a shift. Please try again in sometime");
      }
    }
  };

  return (
    <Modal
      open={openNewShiftGroupForm}
      onClose={handleCloseShiftGroupForm}
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
        {shiftFetching || machineFetching ? (
          <Skeleton height={500} width="100%" sx={classes.skeleton} />
        ) : (
          <MDBox pt={0.5} pb={3} px={1}>
            <MDTypography
              variant="button"
              color="light"
              fontWeight="medium"
              textGradient
              textAlign="center"
              px={8}
              fontSize="1.25rem"
            >
              Add Shift Group
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
                label="Name"
                variant="outlined"
                value={shiftGroupName}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setShiftGroupName(e.target.value);
                }}
              />
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">Select Machines</InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={selectedMachines}
                  label="Select Machines"
                  sx={{
                    minHeight: "45px"
                  }}
                  multiple
                  onChange={(e) => {
                    setErrMsg("");
                    setSelectedMachines(e.target.value);
                  }}
                  renderValue={(selected) =>
                    selected
                      .map((selId) => machines?.find((machine) => machine.id === selId)?.name)
                      .join(", ")
                  }
                >
                  {machines?.map((machine) => (
                    <MenuItem value={machine.id} key={machine.id}>
                      <Checkbox checked={selectedMachines.indexOf(machine.id) > -1} />
                      <ListItemText
                        primaryTypographyProps={{ fontSize: "14px" }}
                        primary={machine.name}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">Select Shifts</InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={shift}
                  multiple
                  onChange={(e) => setShiftHandler(e.target.value)}
                  renderValue={(selected) =>
                    selected
                      .map((selId) => shifts?.find((curShift) => curShift.id === selId)?.name)
                      .join(", ")
                  }
                  label="Select Shifts"
                  sx={{
                    minHeight: "45px"
                  }}
                >
                  {shifts?.map((curshift) => (
                    <MenuItem value={curshift.id} key={curshift.id}>
                      <Checkbox checked={shift.indexOf(curshift.id) > -1} />
                      <ListItemText
                        primaryTypographyProps={{ fontSize: "14px" }}
                        primary={curshift.name}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">
                  {translate("Select monday shifts")}
                </InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={mondayShifts}
                  multiple
                  onChange={(e) => {
                    setErrMsg("");
                    setMondayShifts(e.target.value);
                  }}
                  renderValue={(selected) =>
                    selected
                      .map((selId) => shifts?.find((curShift) => curShift.id === selId)?.name)
                      .join(", ")
                  }
                  label={translate("Select monday shifts")}
                  sx={{
                    minHeight: "45px"
                  }}
                >
                  {shifts?.map((curshift) => {
                    if (shift.includes(curshift.id)) {
                      return (
                        <MenuItem value={curshift.id} key={curshift.id}>
                          <Checkbox checked={mondayShifts.indexOf(curshift.id) > -1} />
                          <ListItemText
                            primaryTypographyProps={{ fontSize: "14px" }}
                            primary={curshift.name}
                          />
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">
                  {translate("Select tuesday shifts")}
                </InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={tuesdayShifts}
                  multiple
                  onChange={(e) => {
                    setErrMsg("");
                    setTuesdayShifts(e.target.value);
                  }}
                  renderValue={(selected) =>
                    selected
                      .map((selId) => shifts.find((curShift) => curShift.id === selId)?.name)
                      .join(", ")
                  }
                  label={translate("Select tuesday shifts")}
                  sx={{
                    minHeight: "45px"
                  }}
                >
                  {shifts?.map((curshift) => {
                    if (shift.includes(curshift.id)) {
                      return (
                        <MenuItem value={curshift.id} key={curshift.id}>
                          <Checkbox checked={tuesdayShifts.indexOf(curshift.id) > -1} />
                          <ListItemText
                            primaryTypographyProps={{ fontSize: "14px" }}
                            primary={curshift.name}
                          />
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">
                  {translate("Select wednesday shifts")}
                </InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={wednesdayShifts}
                  multiple
                  onChange={(e) => {
                    setErrMsg("");
                    setWednesdayShifts(e.target.value);
                  }}
                  renderValue={(selected) =>
                    selected
                      .map((selId) => shifts.find((curShift) => curShift.id === selId)?.name)
                      .join(", ")
                  }
                  label={translate("Select wednesday shifts")}
                  sx={{
                    minHeight: "45px"
                  }}
                >
                  {shifts?.map((curshift) => {
                    if (shift.includes(curshift.id)) {
                      return (
                        <MenuItem value={curshift.id} key={curshift.id}>
                          <Checkbox checked={wednesdayShifts.indexOf(curshift.id) > -1} />
                          <ListItemText
                            primaryTypographyProps={{ fontSize: "14px" }}
                            primary={curshift.name}
                          />
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">
                  {translate("Select thursday shifts")}
                </InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={thursdayShifts}
                  multiple
                  onChange={(e) => {
                    setErrMsg("");
                    setThursdayShifts(e.target.value);
                  }}
                  renderValue={(selected) =>
                    selected
                      .map((selId) => shifts.find((curShift) => curShift.id === selId)?.name)
                      .join(", ")
                  }
                  label={translate("Select thursday shifts")}
                  sx={{
                    minHeight: "45px"
                  }}
                >
                  {shifts?.map((curshift) => {
                    if (shift.includes(curshift.id)) {
                      return (
                        <MenuItem value={curshift.id} key={curshift.id}>
                          <Checkbox checked={thursdayShifts.indexOf(curshift.id) > -1} />
                          <ListItemText
                            primaryTypographyProps={{ fontSize: "14px" }}
                            primary={curshift.name}
                          />
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">
                  {translate("Select friday shifts")}
                </InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={fridayShifts}
                  multiple
                  onChange={(e) => {
                    setErrMsg("");
                    setFridayShifts(e.target.value);
                  }}
                  renderValue={(selected) =>
                    selected
                      .map((selId) => shifts.find((curShift) => curShift.id === selId)?.name)
                      .join(", ")
                  }
                  label={translate("Select friday shifts")}
                  sx={{
                    minHeight: "45px"
                  }}
                >
                  {shifts?.map((curshift) => {
                    if (shift.includes(curshift.id)) {
                      return (
                        <MenuItem value={curshift.id} key={curshift.id}>
                          <Checkbox checked={fridayShifts.indexOf(curshift.id) > -1} />
                          <ListItemText
                            primaryTypographyProps={{ fontSize: "14px" }}
                            primary={curshift.name}
                          />
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">
                  {translate("Select saturday shifts")}
                </InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={saturdayShifts}
                  multiple
                  onChange={(e) => {
                    setErrMsg("");
                    setSaturdayShifts(e.target.value);
                  }}
                  renderValue={(selected) =>
                    selected
                      .map((selId) => shifts.find((curShift) => curShift.id === selId)?.name)
                      .join(", ")
                  }
                  label={translate("Select saturday shifts")}
                  sx={{
                    minHeight: "45px"
                  }}
                >
                  {shifts?.map((curshift) => {
                    if (shift.includes(curshift.id)) {
                      return (
                        <MenuItem value={curshift.id} key={curshift.id}>
                          <Checkbox checked={saturdayShifts.indexOf(curshift.id) > -1} />
                          <ListItemText
                            primaryTypographyProps={{ fontSize: "14px" }}
                            primary={curshift.name}
                          />
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">
                  {translate("Select sunday shifts")}
                </InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={sundayShifts}
                  multiple
                  onChange={(e) => {
                    setErrMsg("");
                    setSundayShifts(e.target.value);
                  }}
                  renderValue={(selected) =>
                    selected
                      .map((selId) => shifts.find((curShift) => curShift.id === selId)?.name)
                      .join(", ")
                  }
                  label={translate("Select sunday shifts")}
                  sx={{
                    minHeight: "45px"
                  }}
                >
                  {shifts?.map((curshift) => {
                    if (shift.includes(curshift.id)) {
                      return (
                        <MenuItem value={curshift.id} key={curshift.id}>
                          <Checkbox checked={sundayShifts.indexOf(curshift.id) > -1} />
                          <ListItemText
                            primaryTypographyProps={{ fontSize: "14px" }}
                            primary={curshift.name}
                          />
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={2} display="flex" flexDirection="column">
              <MDButton
                color="dark"
                size="medium"
                variant={darkMode ? "contained" : "outlined"}
                onClick={handleSubmit}
              >
                {translate(
                  updateShiftGroup
                    ? updateShiftGroupLoading
                      ? "Updating shift group"
                      : "Update shift group"
                    : createShiftGroupLoading
                    ? "Creating shift group"
                    : "Create shift group"
                )}
              </MDButton>
            </MDBox>
          </MDBox>
        )}
      </Box>
    </Modal>
  );
}

export default NewShiftGroup;
