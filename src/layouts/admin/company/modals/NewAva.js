import { Box, FormControl, InputLabel, MenuItem, Modal, Select } from "@mui/material";
import { apiUrls } from "api/reactQueryConstant";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { setOpenNewAvaForm, useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import { useEffect, useState } from "react";

function NewAva({ ava, setAva, currentCompany, setSuccessSB, refetch }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewAvaForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [avaName, setAvaName] = useState();
  const [macId, setMacId] = useState();
  const [identifier, setIdentifier] = useState();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState();
  const [companyList, setCompanyList] = useState([]);
  const [selectCompany, setSelectCompany] = useState();
  useEffect(() => {
    if (ava) {
      setAvaName(ava.name);
      setMacId(ava.mac_id);
      setIdentifier(ava.edge_id);
    }
  }, [ava]);

  const handleCloseAvaForm = () => {
    setOpenNewAvaForm(dispatch, !openNewAvaForm);
    setAva(null);
    setAvaName("");
    setMacId("");
    setSelectCompany("");
    setErrMsg("");
    setIdentifier("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (ava && (avaName === "" || macId === "")) {
      setErrMsg(translate("Fields cannot be empty"));
      setLoading(false);
    } else if (!ava && (avaName === "" || macId === "" || selectCompany === "")) {
      setErrMsg(translate("Fields cannot be empty"));
      setLoading(false);
    } else {
      try {
        if (ava) {
          const avaData = {
            name: avaName,
            mac_id: macId,
            edge_id: identifier,
            company_id: currentCompany?.id
          };
          const response = await axiosPrivate.put(apiUrls.sendAvaData + ava?.id, avaData);
          if (response.status === 200) {
            refetch();
            setAva(null);
            setSuccessSB({
              message: response.data.message
            });
          }
        } else {
          const avaData = {
            name: avaName,
            mac_id: macId,
            edge_id: identifier,
            hostname: avaName,
            company_id: selectCompany,
            meta_frontend: {
              acc: true,
              temp: true,
              mag: true,
              set_acc_warning: 0,
              set_acc_danger: 0,
              set_temp_warning: 0,
              set_temp_danger: 0,
              graph_acc: true,
              graph_temp: true,
              graph_mag: true,
              graph_mag3D: true,
              graph_scores: true,
              card_anomalies: true,
              card_cycles: true,
              card_temperature: true,
              card_availability: true
            }
          };
          const response = await await axiosPrivate.post(apiUrls.sendPostAvaData, avaData);
          if (response.status === 201) {
            refetch();
            setAva(null);
            setSuccessSB({
              message: response.data.message
            });
          }
        }

        handleCloseAvaForm();
        setLoading(false);
      } catch (err) {
        console.log("err", err);
        if (!err?.response) {
          setErrMsg(translate("No response from server"));
          setLoading(false);
        } else if (err?.response?.status === 400) {
          setErrMsg(translate("missing machine name or email"));
          setLoading(false);
        } else if (err?.response?.status === 401) {
          setErrMsg(translate("Unauthorized"));
          setLoading(false);
        } else {
          setErrMsg(translate("Unable to create a Company. Please try again in sometime"));
          setLoading(false);
        }
      }
    }
  };

  async function getCompanies() {
    try {
      const companyListData = await axiosPrivate.get(apiUrls.getSuperAdminDetails);
      setCompanyList(companyListData.data.company_list);
    } catch (err) {
      console.log("err", err);
      if (!err?.response) {
        setErrMsg(translate("No response from server"));
      }
    }
  }

  useEffect(() => {
    getCompanies();
  }, []);

  return (
    <Modal
      open={openNewAvaForm}
      onClose={handleCloseAvaForm}
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
        <MDBox pt={0.5} pb={3} px={3}>
          <MDTypography
            variant="button"
            color="light"
            fontWeight="medium"
            textGradient
            textAlign="center"
            px={10}
            fontSize="1.25rem"
          >
            {!ava ? translate("Add Ava") : translate("Update Ava")}
          </MDTypography>
          <MDBox mb={2}>
            <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
              {errMsg}
            </MDTypography>
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label={translate("Ava Name")}
              value={avaName}
              variant="outlined"
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setAvaName(e.target.value);
              }}
            />
          </MDBox>
          {!ava && (
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-company-label">{translate("Select company")}</InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={selectCompany}
                  onChange={(e) => setSelectCompany(e.target.value)}
                  label={translate("Select company")}
                  sx={{
                    minHeight: "45px"
                  }}
                  // inputProps={{
                  //   name: "age",
                  //   id: "uncontrolled-native",
                  // }}
                >
                  {companyList?.map((list) => (
                    <MenuItem value={list.id}>{list.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBox>
          )}

          <MDBox mb={2}>
            <MDInput
              type="text"
              label="Mac ID"
              variant="outlined"
              value={macId}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setMacId(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label="Edge ID"
              variant="outlined"
              value={identifier}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setIdentifier(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDButton
              color="dark"
              size="medium"
              // variant="gradient"
              variant={darkMode ? "contained" : "outlined"}
              onClick={handleSubmit}
            >
              {translate(
                ava
                  ? loading
                    ? "Updating Ava"
                    : "Update Ava"
                  : loading
                  ? "Creating Ava"
                  : "Create Ava"
              )}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewAva;
