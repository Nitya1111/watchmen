/* eslint-disable react/prop-types */
import { Box, Modal } from "@mui/material";
import { invalidateQuery } from "api/customReactQueryClient";
import { enumQueryNames } from "api/reactQueryConstant";
import { createOperatorsApi, updateOperatorsApi } from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { setOpenOperatorForm, setSuccessMsg, useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { getUpdatedKeysObject } from "utils/constants";

function NewOperator({ updateOperator, setUpdateOperator, refresh }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openOperatorForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [name, setName] = useState("");
  const [errMsg, setErrMsg] = useState();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (updateOperator) {
      setName(updateOperator.name);
      setFirstName(updateOperator.first_name);
      setLastName(updateOperator.last_name);
      setEmail(updateOperator.email);
    }
  }, [updateOperator]);

  const handleCloseHallForm = () => {
    setOpenOperatorForm(dispatch, !openOperatorForm);
    setName("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setErrMsg("");
    setUpdateOperator(null);
  };

  const { mutate: createOperatorsApi1, isLoading: createOperatorLoading } = useMutation(
    (data) => createOperatorsApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        refresh();
        handleCloseHallForm();
        invalidateQuery([enumQueryNames.OPERATOR_LIST]);
        setSuccessMsg(dispatch, message);
      }
    }
  );

  const { mutate: updateOperatorsApi1, isLoading: updateOperatorLoading } = useMutation(
    ({ id, data }) => updateOperatorsApi(axiosPrivate, id, data),
    {
      onSuccess: ({ message }) => {
        refresh();
        handleCloseHallForm();
        invalidateQuery([enumQueryNames.OPERATOR_LIST]);
        setSuccessMsg(dispatch, message);
      }
    }
  );

  const handleSubmit = async () => {
    if (name === "" || firstName === "" || lastName === "" || email === "") {
      setErrMsg("Please fill all the fields");
    } else if (updateOperator) {
      const operator = {
        name,
        first_name: firstName,
        last_name: lastName,
        email
      };
      const compareObjectsTemp = getUpdatedKeysObject(operator, updateOperator);
      if (Object.keys(compareObjectsTemp).length !== 0) {
        updateOperatorsApi1({ id: updateOperator.id, data: compareObjectsTemp });
      }
    } else {
      const operator = {
        name,
        first_name: firstName,
        last_name: lastName,
        email
      };
      createOperatorsApi1(operator);
    }
  };

  return (
    <Modal
      open={openOperatorForm}
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
        <MDBox pt={0.5} pb={5} px={2} display="flex" flexDirection="column">
          <MDTypography
            variant="button"
            color="light"
            fontWeight="medium"
            textGradient
            textAlign="center"
            px={8}
            fontSize="1.25rem"
          >
            {updateOperator ? "Update Operator" : "Add Operator"}
          </MDTypography>
          {errMsg && (
            <MDBox mb={2}>
              <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                {errMsg}
              </MDTypography>
            </MDBox>
          )}
          <MDBox mb={2} mt={3}>
            <MDInput
              type="text"
              label="Name"
              variant="outlined"
              value={name}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setName(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label="FirstName"
              variant="outlined"
              value={firstName}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setFirstName(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label="LastName"
              variant="outlined"
              value={lastName}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setLastName(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="email"
              label="Email"
              variant="outlined"
              value={email}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setEmail(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2} mt={2} display="flex" flexDirection="column">
            <MDButton
              color="dark"
              size="medium"
              variant={darkMode ? "contained" : "outlined"}
              onClick={handleSubmit}
            >
              {updateOperator
                ? updateOperatorLoading
                  ? "Updating Operator"
                  : "Update Operator"
                : createOperatorLoading
                ? "Creating Operator"
                : "Create Operator"}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewOperator;
