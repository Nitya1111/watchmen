/* eslint-disable react/prop-types */
import { Autocomplete, Box, Chip, FormControl, Modal } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { setAddAvaSetup, useMaterialUIController } from "context";
import { useState } from "react";

function NewAva({ setUpdateAva, avaList }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openAddAvaForm } = controller;
  const [selectedAva, setSelectedAva] = useState();
  const [errMsg, setErrMsg] = useState();

  const handleCloseAvaForm = () => {
    setAddAvaSetup(dispatch, !openAddAvaForm);
    setSelectedAva();
  };

  const handleSubmit = async () => {
    setUpdateAva(avaList.find((item) => item?.name === selectedAva)?.id);
    setAddAvaSetup(dispatch, !openAddAvaForm);
  };
  const handleAddAva = (event, newValue) => {
    setSelectedAva(newValue);
  };
  return (
    <Modal
      open={openAddAvaForm}
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
            Add Ava
          </MDTypography>
          {errMsg && (
            <MDBox mb={2}>
              <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                {errMsg}
              </MDTypography>
            </MDBox>
          )}
          <MDBox mb={2}>
            <FormControl
              sx={({ palette: { dark, white } }) => ({
                width: "100%",
                color: darkMode ? white.main : dark.main
              })}
            >
              <Autocomplete
                id="tags-filled"
                options={avaList?.map((item) => item?.name) || []}
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
                  <MDInput {...params} type="text" label="Ava" placeholder="Ava" />
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

export default NewAva;
