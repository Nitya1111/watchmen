/* eslint-disable react/prop-types */
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select
} from "@mui/material";
import { apiUrls } from "api/reactQueryConstant";
import { getAva } from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { setAddCompany, useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";

function AddAVACompany({ refetch, originalCompanyList, ava }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openAddCompanyForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [selectedAva, setSelectedAva] = useState();
  const [companyList, setCompanyList] = useState();

  const handleCloseAvaForm = () => {
    setAddCompany(dispatch, !openAddCompanyForm);
    setCompanyList();
    setSelectedAva();
  };
  useEffect(() => {
    if (originalCompanyList) {
      setCompanyList(originalCompanyList?.map((item) => item?.name));
    }
  }, [originalCompanyList]);

  const handleSubmit = async () => {
    const id = originalCompanyList.find((item) => item.name === selectedAva)?.id;
    const response = await axiosPrivate.put(apiUrls.sendAvaData + ava?.id, {
      company_id: id
    });
    refetch();
    setAddCompany(dispatch, !openAddCompanyForm);
  };
  const handleAddAva = (event, newValue) => {
    setSelectedAva(newValue);
  };
  return (
    <Modal
      open={openAddCompanyForm}
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
            Add Company
          </MDTypography>

          <MDBox mb={2}>
            <MDTypography variant="button" color="light" fontWeight="medium" textGradient>
              AVA Name: {ava?.name}
            </MDTypography>
          </MDBox>
          <MDBox mb={2}>
            <FormControl
              sx={({ palette: { dark, white } }) => ({
                width: "100%",
                color: darkMode ? white.main : dark.main
              })}
            >
              <Autocomplete
                id="tags-filled"
                options={companyList || []}
                freeSolo
                value={selectedAva}
                onChange={(event, newValue) => handleAddAva(event, newValue)}
                renderTags={(value, getTagProps) =>
                  value?.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option?.name || option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <MDInput {...params} type="text" label="Company" placeholder="Company" />
                )}
              />
            </FormControl>
          </MDBox>
          <MDBox mb={2} display="flex" flexDirection="column">
            <MDButton
              color="dark"
              size="medium"
              variant={darkMode ? "contained" : "outlined"}
              onClick={handleSubmit}
            >
              Add Ava
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default AddAVACompany;
