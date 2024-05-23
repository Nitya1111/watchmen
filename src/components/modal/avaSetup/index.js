/* eslint-disable no-unused-expressions */
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Step,
  StepButton,
  Stepper,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { apiUrls } from "api/reactQueryConstant";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { setOpenAvaSetup, useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AvaSetup() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openAvaSetup } = controller;
  const { axiosPrivate } = useAxiosPrivate();

  const [machineList, setMachineList] = useState([]);
  const [avaList, setAvaList] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  // Inputs

  const [selectMachine, setSelectMachine] = useState("");
  const [selectAva, setSelectAva] = useState("");
  const [accelerometerValue, setAccelerometerValue] = useState(false);
  const [temperatureValue, setTemperatureValue] = useState(false);
  const [magnometerValue, setMagnometerValue] = useState(false);
  const [accelerometerWarning, setAccelerometerWarning] = useState(0);
  const [accelerometerCritical, setAccelerometerCritical] = useState(0);
  const [temperatureWarning, setTemperatureWarning] = useState(0);
  const [temperatureCritical, setTemperatureCritical] = useState(0);
  const [anomaliesValue, setAnomaliesValue] = useState(false);
  const [cyclesValue, setCyclesValue] = useState(false);
  const [temperatureSwitchValue, setTemperatureSwitchValue] = useState(false);
  const [avabilityValue, setAvabilityValue] = useState(false);
  const [graphScoresValue, setGraphScoresValue] = useState(false);
  const [graphAccValue, setGraphAccValue] = useState(false);
  const [graphMagValue, setGraphMagValue] = useState(false);
  const [graphMag3DValue, setGraphMag3DValue] = useState(false);
  const [graphTempValue, setGraphTempValue] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});

  const navigate = useNavigate();
  const role = Cookies.get("role");
  // Get datas

  async function getMachines() {
    try {
      const machineListData = await axiosPrivate.get(apiUrls.machineListApi);
      setMachineList(machineListData.data.machines);
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No response from server");
      }
    }
  }
  async function getAvas() {
    try {
      const avaListData = await axiosPrivate.get(apiUrls.ava);
      setAvaList(avaListData.data.ava);
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No response from server");
      }
    }
  }

  useEffect(() => {
    getMachines();
    if (role === "super_admin") {
      getAvas();
    }
  }, []);

  useEffect(() => {
    errMsg && setErrMsg("");
  }, [selectMachine, selectAva]);

  const handleCloseAvaSetup = () => {
    setSelectMachine("");
    setSelectAva("");
    setAccelerometerValue(false);
    setTemperatureValue(false);
    setMagnometerValue(false);
    setAccelerometerWarning(0);
    setAccelerometerCritical(0);
    setTemperatureWarning(0);
    setTemperatureCritical(0);
    setAnomaliesValue(false);
    setCyclesValue(false);
    setTemperatureSwitchValue(false);
    setAvabilityValue(false);
    setGraphScoresValue(false);
    setGraphAccValue(false);
    setGraphMagValue(false);
    setGraphMag3DValue(false);
    setGraphTempValue(false);
    setActiveStep(0);
    setCompleted({});
    setOpenAvaSetup(dispatch, false);
  };

  const steps = ["Details", "Sensors", "Machine Page", "Ava Page"];

  function totalSteps() {
    return steps.length;
  }

  function completedSteps() {
    return Object.keys(completed).length;
  }

  function isLastStep() {
    return activeStep === totalSteps() - 1;
  }

  function allStepsCompleted() {
    return completedSteps() === totalSteps();
  }

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const handleComplete = async () => {
    if (!selectMachine || !selectAva) {
      setErrMsg("Please select machine and ava!");
      return;
    }
    if (completedSteps() === totalSteps() - 1) {
      const selectedAva = avaList.find((ava) => ava.name === selectAva);
      const selectedMachine = machineList.find((machine) => machine.name === selectMachine);
      const avaData = {
        name: selectedAva?.name,
        mac_address: selectedAva?.mac_address,
        company_id: selectedAva?.company_id,
        identifier: selectedAva?.identifier,
        machine_id: selectedMachine?.id,
        settings: {
          acc: accelerometerValue,
          temp: temperatureValue,
          mag: magnometerValue,
          set_acc_warning: accelerometerWarning,
          set_acc_danger: accelerometerCritical,
          set_temp_warning: temperatureWarning,
          set_temp_danger: temperatureCritical,
          graph_acc: graphAccValue,
          graph_temp: graphTempValue,
          graph_mag: graphMagValue,
          graph_mag3D: graphMag3DValue,
          graph_scores: graphScoresValue,
          card_anomalies: anomaliesValue,
          card_cycles: cyclesValue,
          card_temperature: temperatureSwitchValue,
          card_availability: avabilityValue
        }
      };
      const response = await axiosPrivate.put(apiUrls.ava + selectedAva.id, avaData);
      if (response.status === 200) {
        navigate(0);
      }
    } else {
      const newCompleted = completed;
      newCompleted[activeStep] = true;
      setCompleted(newCompleted);
      handleNext();
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  return (
    <Modal
      open={openAvaSetup}
      onClose={handleCloseAvaSetup}
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
        <Stepper nonLinear alternativeLabel activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <div>
          {allStepsCompleted() ? (
            <>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you&apos;re finished
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </>
          ) : (
            <>
              <Typography sx={{ mt: 2, mb: 1 }}>
                {errMsg && (
                  <MDBox mb={2}>
                    <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                      {errMsg}
                    </MDTypography>
                  </MDBox>
                )}
                {activeStep === 0 ? (
                  <MDBox mb={3}>
                    <MDBox mb={3}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="select-machine-label">Select Machine</InputLabel>
                        <Select
                          labelId="select-machine-label"
                          id="select-machine"
                          value={selectMachine}
                          onChange={(e) => setSelectMachine(e.target.value)}
                          // inputProps={{
                          //   name: "age",
                          //   id: "uncontrolled-native",
                          // }}
                        >
                          {machineList?.map((list) => (
                            <MenuItem value={list.name}>{list.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </MDBox>
                    <MDBox mb={3}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="select-ava-label">Select Ava</InputLabel>
                        <Select
                          labelId="select-ava-label"
                          id="select-ava"
                          value={selectAva}
                          onChange={(e) => setSelectAva(e.target.value)}
                        >
                          {avaList?.map((list) => (
                            <MenuItem value={list.name}>{list.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </MDBox>
                    {selectAva && (
                      <MDBox mb={3}>
                        <TextField
                          id="standard-basic"
                          label="Ava Name"
                          variant="outlined"
                          defaultValue={selectAva}
                          InputProps={{
                            readOnly: true
                          }}
                          fullWidth
                        />
                      </MDBox>
                    )}
                  </MDBox>
                ) : activeStep === 1 ? (
                  <MDBox mb={3}>
                    <MDBox mb={3}>
                      <FormControl component="fieldset">
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={accelerometerValue}
                              onChange={() => setAccelerometerValue(!accelerometerValue && true)}
                            />
                          }
                          label="Accelerometer"
                          labelPlacement="start"
                        />
                        <MDBox mb={3}>
                          <TextField
                            label="Warning"
                            variant="outlined"
                            fullWidth
                            value={accelerometerWarning}
                            onChange={(e) => setAccelerometerWarning(e.target.value)}
                          />
                          <TextField
                            label="Critical"
                            variant="outlined"
                            fullWidth
                            value={accelerometerCritical}
                            onChange={(e) => setAccelerometerCritical(e.target.value)}
                          />
                        </MDBox>
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={temperatureValue}
                              onChange={() => setTemperatureValue(!temperatureValue && true)}
                            />
                          }
                          label="Temperature"
                          labelPlacement="start"
                        />
                        <MDBox mb={3}>
                          <TextField
                            label="Warning"
                            variant="outlined"
                            fullWidth
                            value={temperatureWarning}
                            onChange={(e) => setTemperatureWarning(e.target.value)}
                          />
                          <TextField
                            label="Critical"
                            variant="outlined"
                            fullWidth
                            value={temperatureCritical}
                            onChange={(e) => setTemperatureCritical(e.target.value)}
                          />
                        </MDBox>
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={magnometerValue}
                              onChange={() => setMagnometerValue(!magnometerValue && true)}
                            />
                          }
                          label="Magnometer"
                          labelPlacement="start"
                        />
                      </FormControl>
                    </MDBox>
                  </MDBox>
                ) : activeStep === 2 ? (
                  <MDBox mb={3}>
                    <MDBox mb={3}>
                      <FormControl component="fieldset">
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={anomaliesValue}
                              onChange={() => setAnomaliesValue(!anomaliesValue && true)}
                            />
                          }
                          label={translate("Anomalies")}
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={cyclesValue}
                              onChange={() => setCyclesValue(!cyclesValue && true)}
                            />
                          }
                          label={translate("Cycles")}
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={temperatureSwitchValue}
                              onChange={() =>
                                setTemperatureSwitchValue(!temperatureSwitchValue && true)
                              }
                            />
                          }
                          label={translate("Temperature")}
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={avabilityValue}
                              onChange={() => setAvabilityValue(!avabilityValue && true)}
                            />
                          }
                          label={translate("Avability")}
                          labelPlacement="start"
                        />
                      </FormControl>
                    </MDBox>
                  </MDBox>
                ) : activeStep === 3 ? (
                  <MDBox mb={3}>
                    <MDBox mb={3}>
                      <FormControl component="fieldset">
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={graphScoresValue}
                              onChange={() => setGraphScoresValue(!graphScoresValue && true)}
                            />
                          }
                          label="Graph Scores"
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={graphAccValue}
                              onChange={() => setGraphAccValue(!graphAccValue && true)}
                            />
                          }
                          label="Graph Acc"
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={graphMagValue}
                              onChange={() => setGraphMagValue(!graphMagValue && true)}
                            />
                          }
                          label="Graph Mag"
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={graphMag3DValue}
                              onChange={() => setGraphMag3DValue(!graphMag3DValue && true)}
                            />
                          }
                          label="Graph Mag 3D"
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={graphTempValue}
                              onChange={() => setGraphTempValue(!graphTempValue && true)}
                            />
                          }
                          label="Graph Temp"
                          labelPlacement="start"
                        />
                      </FormControl>
                    </MDBox>
                  </MDBox>
                ) : (
                  completedSteps()
                )}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleNext} sx={{ mr: 1 }}>
                  Next
                </Button>
                {activeStep !== steps.length &&
                  (completed[activeStep] ? (
                    <Typography variant="caption" sx={{ display: "inline-block" }}>
                      Step {activeStep + 1} already completed
                    </Typography>
                  ) : (
                    <Button onClick={handleComplete}>
                      {completedSteps() === totalSteps() - 1 ? "Finish" : "Complete Step"}
                    </Button>
                  ))}
              </Box>
            </>
          )}
        </div>
      </Box>
    </Modal>
  );
}

export default AvaSetup;
