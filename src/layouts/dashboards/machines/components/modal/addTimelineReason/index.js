/* eslint-disable react/prop-types */
import { Box, FormControl, InputLabel, MenuItem, Modal, Select } from "@mui/material";
import { invalidateQuery } from "api/customReactQueryClient";
import { enumQueryNames } from "api/reactQueryConstant";
import { addTimelineReasonApi } from "api/watchmenApi";
import { updateTimelineReasonApi } from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenNewTimelineReasonForm, setSuccessMsg } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { getUpdatedKeysObject } from "utils/constants";
import { timelineReasonLevel } from "utils/constants";

function TimelineReasons({ updateReason, setUpdateReason }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewTimelineReasonForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState(1);
  const [errMsg, setErrMsg] = useState();

  useEffect(() => {
    if (updateReason) {
      setReason(updateReason.name);
      setDescription(updateReason.reason);
      setLevel(updateReason.level);
    }
  }, [updateReason]);

  const handleCloseTimelineReasonForm = () => {
    setOpenNewTimelineReasonForm(dispatch, !openNewTimelineReasonForm);
    setReason("");
    setDescription("");
    setLevel(1);
    setErrMsg("");
    setUpdateReason(null);
  };

  const { mutate: createTimelineReason, isLoading: createReasonLoading } = useMutation(
    (data) => addTimelineReasonApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        setSuccessMsg(dispatch, message);
        handleCloseTimelineReasonForm();
        invalidateQuery([enumQueryNames.TIMELINE_REASON_LIST]);
      }
    }
  );

  const { mutate: updateTimelineReason, isLoading: updateReasonLoading } = useMutation(
    ({ reasonId, data }) => updateTimelineReasonApi(axiosPrivate, reasonId, data),
    {
      onSuccess: ({ message }) => {
        setSuccessMsg(dispatch, message);
        handleCloseTimelineReasonForm();
        invalidateQuery([enumQueryNames.TIMELINE_REASON_LIST]);
      }
    }
  );

  const handleSubmit = async () => {
    if (reason === "") {
      setErrMsg("Please enter timeline reason");
    } else if (level === "") {
      setErrMsg("Please select level");
    } else {
      try {
        if (updateReason) {
          const timelineReasonPayload = {
            name: reason,
            reason: description,
            level
          };
          const compareObjectsTemp = getUpdatedKeysObject(timelineReasonPayload, updateReason);
          if (Object.keys(compareObjectsTemp).length !== 0) {
            updateTimelineReason({ reasonId: updateReason.id, data: compareObjectsTemp });
          }
        } else {
          const timelineReasonPayload = {
            name: reason,
            reason: description,
            level,
            meta_frontend: {},
            meta_backend: {}
          };
          createTimelineReason(timelineReasonPayload);
        }
      } catch (err) {
        setErrMsg("Unable to create a timeline reason. Please try again in sometime");
      }
    }
  };

  return (
    <Modal
      open={openNewTimelineReasonForm}
      onClose={handleCloseTimelineReasonForm}
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
            px={4}
            mb={2}
            fontSize="1.25rem"
          >
            Add Timeline Reason
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
              label="Reason"
              variant="outlined"
              value={reason}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setReason(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label="Reason Description"
              variant="outlined"
              value={description}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setDescription(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="select-machine-label">Select Level</InputLabel>
              <Select
                labelId="select-machine-label"
                id="select-machine"
                value={level}
                label="Select Level"
                onChange={(e) => setLevel(e.target.value)}
                sx={{
                  minHeight: "45px"
                }}
              >
                {timelineReasonLevel?.map((list) => (
                  <MenuItem value={list.value}>{list.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBox>
          <MDBox mb={2} display="flex" flexDirection="column">
            <MDButton
              color="dark"
              size="medium"
              variant={darkMode ? "contained" : "outlined"}
              onClick={handleSubmit}
            >
              {updateReason
                ? updateReasonLoading
                  ? "Updating reason"
                  : "Update reason"
                : createReasonLoading
                ? "Adding reason"
                : "Add reason"}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default TimelineReasons;
