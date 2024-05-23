import { Box, Modal } from "@mui/material";
import { axiosPrivate } from "api/axios";
import { apiUrls } from "api/reactQueryConstant";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenNewCompanyForm } from "context";
import translate from "i18n/translate";
import React, { useState } from "react";

function NewCompany() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewCompanyForm } = controller;
  // const { axiosPrivate } = useAxiosPrivate();

  const [companyName, setCompanyName] = useState();
  const [license, setLicense] = useState();
  const [adminEmail, setAdminEmail] = useState();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState();

  const handleCloseCompanyForm = () => setOpenNewCompanyForm(dispatch, !openNewCompanyForm);

  const handleSubmit = async () => {
    setLoading(true);
    if (companyName === "") {
      setErrMsg("Company Name cannot be empty");
      setLoading(false);
    } else {
      try {
        const companyData = {
          name: companyName,
          license,
          email: adminEmail
        };
        const response = await axiosPrivate.post(apiUrls.getSuperAdminDetails, companyData);
        setCompanyName("");
        setLicense("");
        setAdminEmail("");
        setOpenNewCompanyForm(dispatch, !openNewCompanyForm);
        setLoading(false);
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

  return (
    <Modal
      open={openNewCompanyForm}
      onClose={handleCloseCompanyForm}
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
            px={8}
            fontSize="1.25rem"
          >
            {translate("Add Company")}
          </MDTypography>
          <MDBox mb={2}>
            <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
              {errMsg}
            </MDTypography>
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label={translate("Company Name")}
              variant="outlined"
              value={companyName}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setCompanyName(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label={translate("License")}
              variant="outlined"
              value={license}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setLicense(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label={translate("Admin Email")}
              variant="outlined"
              value={adminEmail}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setAdminEmail(e.target.value);
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
              {translate(loading ? "Creating Company" : "Create Company")}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewCompany;
