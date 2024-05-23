/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  Icon,
  IconButton,
  Modal,
  Switch
} from "@mui/material";
import { Stack } from "@mui/system";
import { enumQueryNames, apiUrls } from "api/reactQueryConstant";
import { getAva } from "api/watchmenApi";
import { uploadImageApi } from "api/watchmenApi";
import { getHallListApi, getShiftGroupListApi, getTagsListApi } from "api/watchmenApi";
import MDBadge from "components/MDBadge";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import MDTypography from "components/MDTypography";
import { setOpenMachineForm, useMaterialUIController } from "context";
import useAuth from "hooks/useAuth";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useLocation } from "react-router-dom";
import { getUpdatedKeysObject } from "utils/constants";

function AddMachine({ id, setEditMachineId, handleFetchMachine }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openMachineForm } = controller;

  const { axiosPrivate, isAuthSet } = useAxiosPrivate();

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [machineName, setMachineName] = useState("");
  const [machineModal, setMachineModal] = useState("");
  const [machineCurrent, setMachineCurrent] = useState(0);
  const [machineVoltage, setMachineVoltage] = useState(0);
  const [machineDescription, setMachineDescription] = useState("");
  const [anomalies, setAnomalies] = useState(true);
  const [cycles, setCycles] = useState(true);
  const [timeline, setTimeLine] = useState(true);
  const [pulseMovement, setPulseMovement] = useState(true);
  const [externalData, setExternalData] = useState(true);
  const [successSB, setSuccessSB] = useState(null);
  const [currentSettings, setCurrentSettings] = useState({});
  const [selectedMachineHalls, setSelectedMachineHalls] = useState([]);
  const [selectedMachineAva, setSelectedMachineAva] = useState([]);
  const [selectedMachineTags, setSelectedMachineTags] = useState([]);
  const [shiftGroupsList, setShiftGroupsList] = useState([]);
  const [selectedMachineShiftGroup, setSelectedMachineShiftGroup] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [hallsList, setHallsList] = useState([]);
  const [machineImage, setMachineImage] = useState(null);
  const [machineAllData, setMachineAllData] = useState(null);
  const [machineImageUrl, setMachineImageUrl] = useState(null);
  const [imageFormData, setImageFormData] = useState(null);
  const [isImageUpdate, setImageUpdate] = useState(false);
  const { auth } = useAuth();
  const fileInputRef = useRef();

  const handleCloseMachineForm = () => {
    if (setEditMachineId) {
      setEditMachineId("");
    }
    setMachineName("");
    setMachineModal("");
    setMachineDescription("");
    setSelectedMachineHalls([]);
    setSelectedMachineTags([]);
    setSelectedMachineAva([]);
    setMachineImage(null);
    setImageFormData(null);
    setCycles(true);
    setAnomalies(true);
    setTimeLine(true);
    setPulseMovement(true);
    setExternalData(true);
    setLoading(false);
    setOpenMachineForm(dispatch, false);
    setMachineCurrent(0);
    setMachineVoltage(0);
    setImageUpdate(false);
  };

  const location = useLocation();

  const { mutate: fetchTagsList } = useMutation(
    [enumQueryNames.TAG_LIST],
    () => getTagsListApi(axiosPrivate),
    {
      onSuccess: (tags) => {
        setTagList(tags);
      }
    }
  );

  const { mutate: fetchAVAsList, data: avaList } = useMutation([enumQueryNames.AVA_LIST], () =>
    getAva(axiosPrivate)
  );

  const { mutate: fetchHallsList } = useMutation(
    [enumQueryNames.HALL_LIST],
    () => getHallListApi(axiosPrivate),
    {
      onSuccess: (halls) => {
        setHallsList(halls);
      }
    }
  );
  const { mutate: fetchShiftGroupsList } = useMutation(
    [enumQueryNames.SHIFT_GROUP_LIST],
    () => getShiftGroupListApi(axiosPrivate),
    {
      enabled: auth.Token && isAuthSet,
      onSuccess: (shiftGroups) => {
        setShiftGroupsList(shiftGroups);
      }
    }
  );
  const handleAddTags = (event, newValue) => {
    setSelectedMachineTags(newValue);
  };
  const handleAddHalls = (event, newValue) => {
    setSelectedMachineHalls(newValue);
  };
  const handleAddAva = (event, newValue) => {
    setSelectedMachineAva(newValue);
  };
  const handleAddShiftGroups = (event, newValue) => {
    setSelectedMachineShiftGroup(newValue);
  };

  const closeSuccessSB = () => setSuccessSB(null);

  // eslint-disable-next-line no-shadow
  const getMachineDetailsHandler = async (id) => {
    try {
      const response = await axiosPrivate.get(apiUrls.machineListApi + id);
      if (response.status === 200) {
        const { name, current, voltage, meta_frontend, model, hall, tag_list, description } =
          response.data.machine;
        setMachineAllData(response.data.machine);
        setCurrentSettings(meta_frontend);
        setMachineCurrent(parseInt(current, 10));
        setMachineVoltage(parseInt(voltage, 10));
        setMachineName(name);
        setMachineModal(model);
        setSelectedMachineHalls(hall.name || []);
        setSelectedMachineShiftGroup(hall?.shift_group_id || 0);
        setMachineDescription(description);
        setSelectedMachineTags(tag_list.map((item) => item.name) || []);
        setAnomalies(meta_frontend.anomalies);
        setCycles(meta_frontend.cycles);
        setTimeLine(meta_frontend.timeline);
        setPulseMovement(meta_frontend.pulseMovement);
        setExternalData(meta_frontend.externalData);
        setMachineImageUrl(meta_frontend?.image_path);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (auth.Token && isAuthSet) {
      const role = Cookies.get("role");
      if (role === "super_admin" || role === "admin") {
        fetchHallsList();
        fetchTagsList();
        fetchShiftGroupsList();
        fetchAVAsList();
      }
      if (id) {
        const locations = location.pathname.split("/");
        const machineId = id || locations[locations.length - 1];
        getMachineDetailsHandler(machineId);
      }
    }
  }, [auth, isAuthSet, id]);

  const { mutate: uploadImage } = useMutation(({ formData, uploadImageMachineId }) =>
    uploadImageApi(axiosPrivate, uploadImageMachineId, formData)
  );

  const handleSubmit = async () => {
    setLoading(true);
    if (machineName === "") {
      setErrMsg("Machine Name cannot be empty");
      setLoading(false);
    } else {
      try {
        const machineData = {
          name: machineName,
          model: machineModal,
          description: machineDescription,
          tags:
            selectedMachineTags?.length !== 0
              ? selectedMachineTags?.map(
                  (item) => tagList?.find((item1) => item1?.name === item)?.id
                )
              : undefined,
          halls_id: hallsList?.find((item) => item?.name === selectedMachineHalls)?.id,
          ava_id: avaList?.ava_list?.find((item) => item?.name === selectedMachineAva)?.id,
          shift_group_id: shiftGroupsList?.find((item) => item?.name === selectedMachineShiftGroup)
            ?.id,
          current: machineCurrent,
          voltage: machineVoltage,
          meta_frontend: {
            ...currentSettings,
            anomalies,
            cycles,
            timeline,
            pulseMovement,
            externalData
          }
        };
        if (location.state?.name || id) {
          const locations = location.pathname.split("/");
          const machineId = id || locations[locations.length - 1];
          const compareObjectsTemp = getUpdatedKeysObject(machineData, machineAllData);
          if (Object.keys(compareObjectsTemp).length !== 0) {
            const response = await axiosPrivate.put(
              apiUrls.machineListApi + machineId,
              compareObjectsTemp
            );
            if (isImageUpdate && imageFormData) {
              uploadImage({
                formData: imageFormData,
                uploadImageMachineId: id
              });
            }
            setSuccessSB({
              message: response.data.message
            });
            if (handleFetchMachine) {
              handleFetchMachine();
            }
            handleCloseMachineForm();
          }
        } else {
          const response = await axiosPrivate.post(apiUrls.machineListApi, machineData);
          uploadImage({
            formData: imageFormData,
            uploadImageMachineId: response.data.machine_id
          });
          setSuccessSB({
            message: response.data.message
          });
          if (handleFetchMachine) {
            handleFetchMachine();
          }
          handleCloseMachineForm();
        }
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
          setErrMsg("Unable to create a machine. Please try again in sometime");
          setLoading(false);
        }
      }
    }
  };

  const handleImageUpload = (event) => {
    event.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setImageUpdate(true);
      setImageFormData(formData);
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMachineImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Modal
        open={openMachineForm}
        onClose={handleCloseMachineForm}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={({ palette: { dark, white } }) => ({
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
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
                {location.state?.name || id ? translate("editMachine") : translate("Add Machine")}
              </MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                {errMsg}
              </MDTypography>
            </MDBox>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack
                  // flexDirection="row-reverse"
                  alignItems="center"
                  //  top="-30px"
                  position="relative"
                  right="0px"
                  width="100%"
                  minHeight="100%"
                  justifyContent="center"
                >
                  {machineImage || machineImageUrl ? (
                    <>
                      <img
                        width="100%"
                        src={
                          machineImageUrl
                            ? `${process.env.REACT_APP_BASE_URL}v2/machine/img/${machineImageUrl}`
                            : machineImage
                        }
                      />
                      <IconButton
                        size="small"
                        color="inherit"
                        // sx={uploadIconButton}
                        sx={{
                          width: "fit-content",
                          zIndex: 999,
                          position: "absolute",
                          top: "5px",
                          right: "5px"
                        }}
                        aria-controls="upload-menu"
                        aria-haspopup="true"
                        onClick={(e) => {
                          setMachineImage(null);
                          setMachineImageUrl(null);
                        }}
                      >
                        <MDBadge color="error" size="xs" circular>
                          <Icon sx={{ marginLeft: "5px" }}>close</Icon>
                        </MDBadge>
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        size="small"
                        color="white"
                        // sx={uploadIconButton}
                        sx={{ width: "fit-content", zIndex: 999 }}
                        aria-controls="upload-menu"
                        aria-haspopup="true"
                        onClick={(e) => {
                          handleImageUpload(e);
                        }}
                      >
                        <MDBadge
                          color="error"
                          size="xs"
                          circular
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          Image <Icon sx={{ marginLeft: "5px" }}>upload</Icon>
                        </MDBadge>
                      </IconButton>
                      <input
                        id={"akjs"}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        value={null}
                        style={{ display: "none" }}
                      />
                    </>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label={translate("Name")}
                      value={machineName}
                      fullWidth
                      onChange={(e) => {
                        setErrMsg("");
                        setMachineName(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label={translate("machineModel")}
                      value={machineModal}
                      fullWidth
                      onChange={(e) => {
                        setErrMsg("");
                        setMachineModal(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label={translate("Description")}
                      value={machineDescription}
                      fullWidth
                      onChange={(e) => {
                        setErrMsg("");
                        setMachineDescription(e.target.value);
                      }}
                      multiline
                      rows={5}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <MDInput
                      type="number"
                      label={translate("Voltage")}
                      value={machineVoltage}
                      fullWidth
                      onChange={(e) => {
                        setErrMsg("");
                        setMachineVoltage(parseInt(e.target.value, 10));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="number"
                      label={translate("Current")}
                      value={machineCurrent}
                      fullWidth
                      onChange={(e) => {
                        setErrMsg("");
                        setMachineCurrent(parseInt(e.target.value, 10));
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl
                      sx={({ palette: { dark, white } }) => ({
                        width: "100%",
                        color: darkMode ? white.main : dark.main
                      })}
                    >
                      <Autocomplete
                        multiple
                        id="tags-filled"
                        options={tagList?.map((item) => item?.name) || []}
                        freeSolo
                        value={selectedMachineTags}
                        onChange={(event, newValue) => handleAddTags(event, newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option.name || option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <MDInput {...params} type="text" label={translate("Tags")} />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl
                      sx={({ palette: { dark, white } }) => ({
                        width: "100%",
                        color: darkMode ? white.main : dark.main
                      })}
                    >
                      <Autocomplete
                        id="halls-filled"
                        options={hallsList?.map((item) => item?.name) || []}
                        value={selectedMachineHalls}
                        onChange={(event, newValue) => handleAddHalls(event, newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option.name || option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <MDInput {...params} type="text" label={translate("Halls")} />
                        )}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              {!(location.state?.name || id) ? (
                <>
                  <Grid item xs={12}>
                    <MDTypography>Pre-configrations</MDTypography>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl
                      sx={({ palette: { dark, white } }) => ({
                        width: "100%",
                        color: darkMode ? white.main : dark.main
                      })}
                    >
                      <Autocomplete
                        id="avas-filled"
                        options={avaList?.ava_list?.map((item) => item?.name) || []}
                        value={selectedMachineAva}
                        onChange={(event, newValue) => handleAddAva(event, newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option.name || option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <MDInput
                            {...params}
                            type="text"
                            label={translate("AVAs")}
                            placeholder={translate("AVAs")}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl
                      sx={({ palette: { dark, white } }) => ({
                        width: "100%",
                        color: darkMode ? white.main : dark.main
                      })}
                    >
                      <Autocomplete
                        id="tags-filled"
                        options={shiftGroupsList?.map((item) => item?.name) || []}
                        value={selectedMachineShiftGroup}
                        onChange={(event, newValue) => handleAddShiftGroups(event, newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option.name || option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <MDInput
                            {...params}
                            type="text"
                            label={translate("Shift group")}
                            placeholder={translate("Shift group")}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                </>
              ) : null}

              <Grid item xs={12}>
                <MDTypography>Page-configrations</MDTypography>
              </Grid>

              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pulseMovement}
                      onChange={() => setPulseMovement(!pulseMovement)}
                    />
                  }
                  label={translate("Pulse")}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={<Switch checked={cycles} onChange={() => setCycles(!cycles)} />}
                  label={translate("cycles")}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={externalData}
                      onChange={() => setExternalData(!externalData)}
                    />
                  }
                  label={translate("External date")}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={<Switch checked={anomalies} onChange={() => setAnomalies(!anomalies)} />}
                  label={translate("anomalies")}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={<Switch checked={timeline} onChange={() => setTimeLine(!timeline)} />}
                  label={translate("Timeline")}
                />
              </Grid>
            </Grid>
            <MDBox mb={2} mt={2} textAlign="center">
              <MDButton
                variant={darkMode ? "contained" : "outlined"}
                color="dark"
                size="medium"
                onClick={handleSubmit}
              >
                {location.state?.name || id
                  ? loading
                    ? "Updating Machine"
                    : "Update Machine"
                  : loading
                  ? "Creating Machine"
                  : "Create Machine"}
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

export default AddMachine;
