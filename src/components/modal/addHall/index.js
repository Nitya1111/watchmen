/* eslint-disable react/prop-types */
import { Box, Modal } from "@mui/material";
import { invalidateQuery } from "api/customReactQueryClient";
import { enumQueryNames } from "api/reactQueryConstant";
import { createHallApi, updateHallApi } from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { setOpenNewHallForm, setSuccessMsg, useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { getUpdatedKeysObject } from "utils/constants";

function NewHall({ updateHall, setUpdateHall, refetch }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewHallForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [hallName, setHallName] = useState("");
  const [errMsg, setErrMsg] = useState();
  const [hallDescription, setHallDescription] = useState("");

  useEffect(() => {
    if (updateHall) {
      setHallName(updateHall.name);
      setHallDescription(updateHall.description);
    }
  }, [updateHall]);

  const handleCloseHallForm = () => {
    setOpenNewHallForm(dispatch, !openNewHallForm);
    setHallName("");
    setErrMsg("");
    setUpdateHall(null);
  };

  const { mutate: createHall, isLoading: createHallLoading } = useMutation(
    (data) => createHallApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        refetch();
        setSuccessMsg(dispatch, message);
        handleCloseHallForm();
        invalidateQuery([enumQueryNames.HALL_LIST]);
      }
    }
  );

  const { mutate: updateHallDetails, isLoading: updateHallLoading } = useMutation(
    ({ hallId, data }) => updateHallApi(axiosPrivate, hallId, data),
    {
      onSuccess: ({ message }) => {
        refetch();
        setSuccessMsg(dispatch, message);
        handleCloseHallForm();
        invalidateQuery([enumQueryNames.HALL_LIST]);
      }
    }
  );
  const handleSubmit = async () => {
    if (hallName === "" || hallDescription === "") {
      setErrMsg("Please fill all the fields");
    } else if (updateHall) {
      const hall = {
        name: hallName,
        description: hallDescription
      };
      const compareObjectsTemp = getUpdatedKeysObject(hall, updateHall);
      if (Object.keys(compareObjectsTemp).length !== 0) {
        updateHallDetails({ hallId: updateHall.id, data: compareObjectsTemp });
      }
    } else {
      const hall = {
        name: hallName,
        active: true,
        description: hallDescription,
        meta_frontend: {},
        machine_id: []
      };
      createHall(hall);
    }
  };

  return (
    <Modal
      open={openNewHallForm}
      onClose={handleCloseHallForm}
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
            {updateHall ? "Update Hall" : "Add Hall"}
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
              value={hallName}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setHallName(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label="Description"
              variant="outlined"
              value={hallDescription}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setHallDescription(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2} display="flex" flexDirection="column">
            <MDButton
              color="dark"
              size="medium"
              variant={darkMode ? "contained" : "outlined"}
              onClick={handleSubmit}
            >
              {updateHall
                ? updateHallLoading
                  ? "Updating hall"
                  : "Update hall"
                : createHallLoading
                ? "Creating hall"
                : "Create hall"}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewHall;
