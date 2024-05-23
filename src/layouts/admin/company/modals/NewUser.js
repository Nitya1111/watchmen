import { Box, FormControl, InputLabel, MenuItem, Modal, Select } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenNewUserForm } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import React, { useEffect, useState } from "react";

const roleList = [
  { name: "super_admin", id: "super_admin" },
  { name: "admin", id: "admin" },
  { name: "user", id: "user" }
];

function NewUser({ user, setUser, setSuccessSB, refetch }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewUserForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [license, setLicense] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (user) {
      setName(user?.name);
      setEmail(user?.email);
      setRole(user?.role);
    }
  }, [user]);
  const handleCloseUserForm = () => {
    setOpenNewUserForm(dispatch, !openNewUserForm);
    setUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setLicense("");
    setErrMsg("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (user && (name === "" || email === "" || role === "")) {
      setErrMsg("Fields cannot be empty");
      setLoading(false);
    } else if (
      !user &&
      (name === "" || email === "" || password === "" || license === "" || role === "")
    ) {
      setErrMsg("Fields cannot be empty");
      setLoading(false);
    } else {
      try {
        if (user) {
          const userData = {
            name,
            email,
            role
          };
          const response = await axiosPrivate.put(`v2/user/${user.id}`, userData);
          if (response.status === 200) {
            refetch();
            setSuccessSB({
              message: response.data.message
            });
          }
        } else {
          const userData = {
            name,
            password,
            license,
            email,
            role
          };
          const response = await axiosPrivate.post("v2/user/", userData);
          if (response.status === 200) {
            refetch();
            setSuccessSB({
              message: response.data.message
            });
          }
        }
        setLoading(false);
        handleCloseUserForm();
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
      open={openNewUserForm}
      onClose={handleCloseUserForm}
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
            {!user ? translate("Add User") : translate("Update User")}
          </MDTypography>
          <MDBox mb={2}>
            <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
              {errMsg}
            </MDTypography>
          </MDBox>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput
                type="text"
                label={translate("name")}
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
                type="email"
                label={translate("email")}
                variant="outlined"
                value={email}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setEmail(e.target.value);
                }}
              />
            </MDBox>
            <MDBox mb={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-role-label">Select role</InputLabel>
                <Select
                  labelId="select-role-label"
                  id="select-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label={translate("Select role")}
                  sx={{
                    minHeight: "45px"
                  }}
                >
                  {roleList?.map((list) => (
                    <MenuItem value={list.id}>{list.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBox>
            {!user && (
              <MDBox mb={2}>
                <MDInput
                  type="password"
                  label={translate("Password")}
                  variant="outlined"
                  value={password}
                  fullWidth
                  onChange={(e) => {
                    setErrMsg("");
                    setPassword(e.target.value);
                  }}
                />
              </MDBox>
            )}
            {!user && (
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
            )}
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
                user
                  ? loading
                    ? "Updating User"
                    : "Update User"
                  : loading
                  ? "Creating User"
                  : "Create User"
              )}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewUser;
