/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
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
import { useMaterialUIController, setOpenTessSetup } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TessSetup() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openTessSetup } = controller;
  const { axiosPrivate } = useAxiosPrivate();

  const [machineList, setMachineList] = useState([]);
  const [tessList, setTessList] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  // Inputs

  const [selectMachine, setSelectMachine] = useState("");
  const [selectTess, setSelectTess] = useState("");
  const [volumeValue, setVolumeValue] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState(false);
  const [countingValue, setCountingValue] = useState(false);
  const [totalValue, setTotalValue] = useState(false);
  const [passedValue, setPassedValue] = useState(false);
  const [failedValue, setFailedValue] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});

  const navigate = useNavigate();

  // Get datas

  async function getMachines() {
    try {
      const machineListData = await axiosPrivate.get(apiUrls.machineListApi);
      setMachineList(machineListData.data.machines);
    } catch (err) {
      if (!err?.response) {
        setErrMsg(translate("No response from server"));
      }
    }
  }
  async function getTess() {
    try {
      const tessListData = await axiosPrivate.get(apiUrls.tess);
      setTessList(tessListData.data.tess);
    } catch (err) {
      if (!err?.response) {
        setErrMsg(translate("No response from server"));
      }
    }
  }

  useEffect(() => {
    getMachines();
    // getTess()
  }, []);

  useEffect(() => {
    errMsg && setErrMsg("");
  }, [selectMachine, selectTess]);

  const handleCloseTessSetup = () => {
    setSelectMachine("");
    setSelectTess("");
    setVolumeValue(false);
    setBarcodeValue(false);
    setCountingValue(false);
    setTotalValue(false);
    setPassedValue(false);
    setFailedValue(false);
    setActiveStep(0);
    setCompleted({});
    setOpenTessSetup(dispatch, false);
  };

  const steps = ["Details", "Sensors", "Machine Page"];

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
    if (!selectMachine || !selectTess) {
      setErrMsg("Please select machine and tess!");
      return;
    }
    if (completedSteps() === totalSteps() - 1) {
      const selectedTess = tessList.find((tess) => tess.name === selectTess);
      const tessData = {
        name: selectTess?.name,
        mac_address: selectTess?.mac_address,
        company_id: selectTess?.company_id,
        settings: {
          volume: volumeValue,
          barcode: barcodeValue,
          counting: countingValue,
          card_total: totalValue,
          card_pass: passedValue,
          card_fail: failedValue
        }
      };
      const response = await axiosPrivate.put(apiUrls.tess, tessData);
      navigate(0);
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
      open={openTessSetup}
      onClose={handleCloseTessSetup}
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
                {translate(label)}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <div>
          {allStepsCompleted() ? (
            <>
              <Typography sx={{ mt: 2, mb: 1 }}>
                {translate("All steps completed - you're finished")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset}>{translate("reset")}</Button>
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
                        <InputLabel id="select-machine-label">
                          {translate("Select Machine")}
                        </InputLabel>
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
                        <InputLabel id="select-tess-label">{translate("Select Tess")}</InputLabel>
                        <Select
                          labelId="select-tess-label"
                          id="select-tess"
                          value={selectTess}
                          onChange={(e) => setSelectTess(e.target.value)}
                        >
                          {tessList?.map((list) => (
                            <MenuItem value={list.name}>{list.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </MDBox>
                    {selectTess && (
                      <MDBox mb={3}>
                        <TextField
                          id="standard-basic"
                          label="Tess Name"
                          variant="outlined"
                          defaultValue={selectTess}
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
                              checked={volumeValue}
                              onChange={() => setVolumeValue(!volumeValue && true)}
                            />
                          }
                          label="Volume"
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={barcodeValue}
                              onChange={() => setBarcodeValue(!barcodeValue && true)}
                            />
                          }
                          label="Barcode"
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={countingValue}
                              onChange={() => setCountingValue(!countingValue && true)}
                            />
                          }
                          label="Counting"
                          labelPlacement="start"
                        />
                        {/* <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={testingValue}
                              onChange={() => setTestingValue(!testingValue && true)}
                            />
                          }
                          label="Testing"
                          labelPlacement="start"
                        /> */}
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
                              checked={totalValue}
                              onChange={() => setTotalValue(!totalValue && true)}
                            />
                          }
                          label="Total Count"
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={passedValue}
                              onChange={() => setPassedValue(!passedValue && true)}
                            />
                          }
                          label="Passed"
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          value="start"
                          control={
                            <Switch
                              color="primary"
                              checked={failedValue}
                              onChange={() => setFailedValue(!failedValue && true)}
                            />
                          }
                          label="Failed"
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
                  {translate("back")}
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleNext} sx={{ mr: 1 }}>
                  {translate("next")}
                </Button>
                {activeStep !== steps.length &&
                  (completed[activeStep] ? (
                    <Typography variant="caption" sx={{ display: "inline-block" }}>
                      {translate("Step")} {activeStep + 1} already completed
                    </Typography>
                  ) : (
                    <Button onClick={handleComplete}>
                      {translate(
                        completedSteps() === totalSteps() - 1 ? "Finish" : "Complete Step"
                      )}
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

export default TessSetup;
