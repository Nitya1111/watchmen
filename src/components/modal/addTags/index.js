/* eslint-disable react/prop-types */
import { Box, Modal } from "@mui/material";
import { invalidateQuery } from "api/customReactQueryClient";
import { enumQueryNames } from "api/reactQueryConstant";
import { updateTagApi, createTagApi } from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenNewTagForm, setSuccessMsg } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { getUpdatedKeysObject } from "utils/constants";

function NewTag({ updateTag, setUpdateTag, refresh }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewTagForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [tagName, setTagName] = useState("");
  const [errMsg, setErrMsg] = useState();
  const [tagDescription, setTagDescription] = useState("");

  useEffect(() => {
    if (updateTag) {
      setTagName(updateTag.name);
      setTagDescription(updateTag.description);
    }
  }, [updateTag]);

  const handleCloseTagForm = () => {
    setOpenNewTagForm(dispatch, !openNewTagForm);
    setTagName("");
    setErrMsg("");
    setUpdateTag(null);
  };

  const { mutate: createTag, isLoading: createTagLoading } = useMutation(
    (data) => createTagApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        refresh();
        setSuccessMsg(dispatch, message);
        handleCloseTagForm();
        invalidateQuery([enumQueryNames.TAG_LIST]);
      }
    }
  );

  const { mutate: updateTagDetails, isLoading: updateTagLoading } = useMutation(
    ({ tagId, data }) => updateTagApi(axiosPrivate, tagId, data),
    {
      onSuccess: ({ message }) => {
        refresh();
        setSuccessMsg(dispatch, message);
        handleCloseTagForm();
        invalidateQuery([enumQueryNames.TAG_LIST]);
      }
    }
  );

  const handleSubmit = async () => {
    if (tagName === "" || tagDescription === "") {
      setErrMsg("Please fill all the fields");
    } else {
      try {
        if (updateTag) {
          const tag = {
            name: tagName,
            description: tagDescription
          };
          const compareObjectsTemp = getUpdatedKeysObject(tag, updateTag);
          if (Object.keys(compareObjectsTemp).length !== 0) {
            updateTagDetails({ tagId: updateTag.id, data: tag });
          }
        } else {
          const tag = {
            name: tagName,
            active: true,
            description: tagDescription,
            meta_frontend: {},
            machine_id: []
          };
          createTag(tag);
        }
      } catch (err) {
        setErrMsg("Unable to create a tag. Please try again in sometime");
      }
    }
  };

  return (
    <Modal
      open={openNewTagForm}
      onClose={handleCloseTagForm}
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
            {translate("Add Tag")}
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
              label={translate("name")}
              variant="outlined"
              value={tagName}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setTagName(e.target.value);
              }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label={translate("description")}
              variant="outlined"
              value={tagDescription}
              fullWidth
              onChange={(e) => {
                setErrMsg("");
                setTagDescription(e.target.value);
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
              {translate(
                updateTag
                  ? updateTagLoading
                    ? "Updating tag"
                    : "Update tag"
                  : createTagLoading
                  ? "Creating tag"
                  : "Create tag"
              )}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default NewTag;
