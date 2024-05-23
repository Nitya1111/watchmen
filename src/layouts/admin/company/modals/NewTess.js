import { Box, FormControl, InputLabel, MenuItem, Modal, Select } from "@mui/material";
import { apiUrls } from "api/reactQueryConstant";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenNewTessForm } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import React, { useEffect, useState } from "react";

function NewTess({ tess, setTess, currentCompany, setSuccessSB, refetch }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewTessForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [tessName, setTessName] = useState("");
  const [macId, setMacId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState();
  const [companyList, setCompanyList] = useState([]);
  const [selectCompany, setSelectCompany] = useState("");

  useEffect(() => {
    if (tess) {
      setTessName(tess?.name);
      setMacId(tess?.mac_address);
    }
  }, [tess]);

  const handleCloseTessForm = () => {
    setOpenNewTessForm(dispatch, !openNewTessForm);
    setTess(null);
    setTessName("");
    setMacId("");
    setSelectCompany("");
    setErrMsg("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (tess && (tessName === "" || macId === "")) {
      setErrMsg("Fields cannot be empty");
      setLoading(false);
    } else if (!tess && (tessName === "" || macId === "" || selectCompany === "")) {
      setErrMsg("Fields cannot be empty");
      setLoading(false);
    } else {
      try {
        if (tess) {
          const tessData = {
            name: tessName,
            mac_address: macId,
            company_id: currentCompany?.id
          };
          const response = await axiosPrivate.put(apiUrls.tess + tess?.id, tessData);
          if (response.status === 200) {
            refetch();
            setSuccessSB({
              message: response.data.message
            });
          }
        } else {
          const tessData = {
            name: tessName,
            mac_address: macId,
            company_id: selectCompany,
            settings: {
              volume: true,
              barcode: true,
              counting: true,
              card_total: true,
              card_pass: true,
              card_fail: true
            }
          };
          const response = await axiosPrivate.post(apiUrls.tess, tessData);
          if (response.status === 200) {
            refetch();
            setSuccessSB({
              message: response.data.message
            });
          }
        }
        setLoading(false);
        handleCloseTessForm();
      } catch (err) {
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
      setCompanyList(companyListData.data.companies);
    } catch (err) {
      setErrMsg(err.message);
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
      open={openNewTessForm}
      onClose={handleCloseTessForm}
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
            {translate("Add Tess")}
          </MDTypography>
          <MDBox mb={2}>
            <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
              {errMsg}
            </MDTypography>
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label={translate("Tess Name")}
              variant="outlined"
              value={tessName}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setTessName(e.target.value);
              }}
            />
          </MDBox>
          {!tess && (
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
            <MDButton
              color="dark"
              size="medium"
              // variant="gradient"
              variant={darkMode ? "contained" : "outlined"}
              onClick={handleSubmit}
            >
              {translate(
                tess
                  ? loading
                    ? "Updating Tess"
                    : "Update Tess"
                  : loading
                  ? "Creating Tess"
                  : "Create Tess"
              )}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewTess;
