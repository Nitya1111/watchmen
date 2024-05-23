/* eslint-disable no-unused-expressions */
/* eslint-disable react/prop-types */
import { Box, Divider, InputAdornment, Modal, Autocomplete, FormControl, Chip, Grid, Tooltip, IconButton } from "@mui/material";
import Icon from "@mui/material/Icon";
import { enumQueryNames } from "api/reactQueryConstant";
import {
  getMachineDetailsApi,
  getMachineRatingApi,
  updateMachineDetailsApi
} from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import MDTypography from "components/MDTypography";
import { setOpenTimelineRulesForm, useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import moment from "moment";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import AddIcon from '@mui/icons-material/Add';
import { display, fontWeight, width } from "@mui/system";
import { Close } from "@mui/icons-material";
import { getTimelineReasonApi } from "api/watchmenApi";
import { useEffect } from "react";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import colors from "assets/theme-dark/base/colors";

const { IdleTime, RunTime, StoppedTime, PreparationTime, UnknownTime } = colors;

function AddTimelineRules({ id, setTimelineRuleMachineId }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openTimelineRulesForm } = controller;
  const { axiosPrivate } = useAxiosPrivate();
  const [offTimelineReason, setoffTimelineReason] = useState({
    ids: [],
    rules: [],
    default: null,
    errMsg: []
  });
  const [idleTimelineReason, setIdleTimelineReason] = useState({
    ids: [],
    rules: [],
    default: null,
    errMsg: []
  })
  const [globalTimelineReason, setGlobalTimelineReason] = useState({
    ids: [],
    rules: [],
    default: null,
    errMsg: []
  })
  const [preparationTimelineReason, setPreparationTimelineReason] = useState({
    ids: [],
    rules: [],
    default: null,
    errMsg: []
  })

  const { isLoading } = useQuery(
    [enumQueryNames.MACHINE_DETAILS],
    () => getMachineDetailsApi(axiosPrivate, id),
    {
      enabled: !!id,
      onSuccess: (machinneDetails) => {
        machinneDetails?.meta_backend?.global_timeline_reason && setGlobalTimelineReason({ ...globalTimelineReason, ...machinneDetails.meta_backend.global_timeline_reason })
        machinneDetails?.meta_backend?.idle_timeline_reason && setIdleTimelineReason({ ...idleTimelineReason, ...machinneDetails.meta_backend.idle_timeline_reason })
        machinneDetails?.meta_backend?.off_timeline_reason && setoffTimelineReason({ ...offTimelineReason, ...machinneDetails.meta_backend.off_timeline_reason })
        machinneDetails?.meta_backend?.preparation_timeline_reason && setPreparationTimelineReason({ ...preparationTimelineReason, ...machinneDetails.meta_backend.preparation_timeline_reason })
      }
    }
  );

  const { data: timelineReasonList = [] } = useQuery([enumQueryNames.TIMELINE_REASON_LIST], () =>
    getTimelineReasonApi(axiosPrivate)
  );

  const handleCloseTimelineRules = () => {
    setTimelineRuleMachineId(null);
    setGlobalTimelineReason({
      ids: [],
      rules: [],
      default: null,
      errMsg: []
    })
    setIdleTimelineReason({
      ids: [],
      rules: [],
      default: null,
      errMsg: []
    })
    setoffTimelineReason({
      ids: [],
      rules: [],
      default: null,
      errMsg: []
    })
    setPreparationTimelineReason({
      ids: [],
      rules: [],
      default: null,
      errMsg: []
    })
    setOpenTimelineRulesForm(dispatch, false);
  }

  const { mutate: updateMachineMeta } = useMutation(
    (payload) => updateMachineDetailsApi(axiosPrivate, id, payload),
    {
      onSuccess: () => {
        handleCloseTimelineRules();
      }
    }
  );

  const globalTimelineRuleAddHandler = () => {
    setGlobalTimelineReason({
      ...globalTimelineReason,
      ids: [...globalTimelineReason.ids, null],
      rules: [...globalTimelineReason.rules, ['', '']]
    })
  }

  const idleStateTimelineRuleAddHandler = () => {
    setIdleTimelineReason({
      ...idleTimelineReason,
      ids: [...idleTimelineReason.ids, null],
      rules: [...idleTimelineReason.rules, ['', '']]
    })
  }

  const preparationStateTimelineRuleAddHandler = () => {
    setPreparationTimelineReason({
      ...preparationTimelineReason,
      ids: [...preparationTimelineReason.ids, null],
      rules: [...preparationTimelineReason.rules, ['', '']]
    })
  }

  const offStateTimelineRuleAddHandler = () => {
    setoffTimelineReason({
      ...offTimelineReason,
      ids: [...offTimelineReason.ids, null],
      rules: [...offTimelineReason.rules, ['', '']]
    })
  }

  const globalTimelineReasonRemoveHandler = (index) => {
    setGlobalTimelineReason({
      ...globalTimelineReason,
      ids: globalTimelineReason.ids.filter((_, i) => i !== index),
      rules: globalTimelineReason.rules.filter((_, i) => i !== index)
    })
  }

  const idleTimelineReasonRemoveHandler = (index) => {
    setIdleTimelineReason({
      ...idleTimelineReason,
      ids: idleTimelineReason.ids.filter((_, i) => i !== index),
      rules: idleTimelineReason.rules.filter((_, i) => i !== index)
    })
  }

  const preparationTimelineReasonRemoveHandler = (index) => {
    setPreparationTimelineReason({
      ...preparationTimelineReason,
      ids: preparationTimelineReason.ids.filter((_, i) => i !== index),
      rules: preparationTimelineReason.rules.filter((_, i) => i !== index)
    })
  }

  const offTimelineReasonRemoveHandler = (index) => {
    setoffTimelineReason({
      ...offTimelineReason,
      ids: offTimelineReason.ids.filter((_, i) => i !== index),
      rules: offTimelineReason.rules.filter((_, i) => i !== index)
    })
  }

  const globalChangeBetweenHandler = (e, index) => {
    const { value } = e.target;
    const rules = [...globalTimelineReason.rules]
    const errors = [...globalTimelineReason.errMsg];
    rules[index] = [value, rules[index][1]]
    errors[index] = ''
    setGlobalTimelineReason({
      ...globalTimelineReason,
      rules,
      errMsg: errors
    })
  }

  const idleChangeBetweenHandler = (e, index) => {
    const { value } = e.target;
    const rules = [...idleTimelineReason.rules]
    const errors = [...idleTimelineReason.errMsg];
    rules[index] = [value, rules[index][1]]
    errors[index] = ''
    setIdleTimelineReason({
      ...idleTimelineReason,
      rules,
      errMsg: errors
    })
  }

  const preparationChangeBetweenHandler = (e, index) => {
    const { value } = e.target;
    const rules = [...preparationTimelineReason.rules]
    const errors = [...preparationTimelineReason.errMsg];
    rules[index] = [value, rules[index][1]]
    errors[index] = ''
    setPreparationTimelineReason({
      ...preparationTimelineReason,
      rules,
      errMsg: errors
    })
  }

  const offChangeBetweenHandler = (e, index) => {
    const { value } = e.target;
    const rules = [...offTimelineReason.rules]
    const errors = [...offTimelineReason.errMsg];
    rules[index] = [value, rules[index][1]]
    errors[index] = ''
    setoffTimelineReason({
      ...offTimelineReason,
      rules,
      errMsg: errors
    })
  }

  const globalChangeAndHandler = (e, index) => {
    const { value } = e.target;
    const rules = [...globalTimelineReason.rules]
    const errors = [...globalTimelineReason.errMsg];
    rules[index] = [rules[index][0], value]
    errors[index] = ''
    setGlobalTimelineReason({
      ...globalTimelineReason,
      rules,
      errMsg: errors
    })
  }

  const idleChangeAndHandler = (e, index) => {
    const { value } = e.target;
    const rules = [...idleTimelineReason.rules]
    const errors = [...idleTimelineReason.errMsg];
    rules[index] = [rules[index][0], value]
    errors[index] = ''
    setIdleTimelineReason({
      ...idleTimelineReason,
      rules,
      errMsg: errors
    })
  }

  const preparationChangeAndHandler = (e, index) => {
    const { value } = e.target;
    const rules = [...preparationTimelineReason.rules]
    const errors = [...preparationTimelineReason.errMsg];
    rules[index] = [rules[index][0], value]
    errors[index] = ''
    setPreparationTimelineReason({
      ...preparationTimelineReason,
      rules,
      errMsg: errors
    })
  }

  const offChangeAndHandler = (e, index) => {
    const { value } = e.target;
    const rules = [...offTimelineReason.rules]
    const errors = [...offTimelineReason.errMsg];
    rules[index] = [rules[index][0], value]
    errors[index] = ''
    setoffTimelineReason({
      ...offTimelineReason,
      rules,
      errMsg: errors
    })
  }

  const validationHandler = () => {
    let isValid = true;
    const globalTimelineErrors = [...globalTimelineReason.errMsg]
    const idleTimelineErrors = [...idleTimelineReason.errMsg]
    const preparationTimelineErrors = [...preparationTimelineReason.errMsg]
    const offTimelineErrors = [...offTimelineReason.errMsg]
    globalTimelineReason.ids.forEach((id, index) => {
      if (id === null) {
        isValid = false
        globalTimelineErrors[index] = `Please select timeline rule.`
        return
      }
      if (globalTimelineReason.rules[index][0] === '') {
        isValid = false
        globalTimelineErrors[index] = `Start time is required`
        return
      }
      if (+globalTimelineReason.rules[index][0] < 0) {
        isValid = false
        globalTimelineErrors[index] = `Start time should be greater then or equal 0`
        return
      }
      if (globalTimelineReason.rules[index][1] === '') {
        isValid = false
        globalTimelineErrors[index] = `End time is required`
        return
      }
      if (+globalTimelineReason.rules[index][1] < 0) {
        isValid = false
        globalTimelineErrors[index] = `End time should be greater then or equal 0`
        return
      }
      if (+globalTimelineReason.rules[index][0] >= +globalTimelineReason.rules[index][1]) {
        isValid = false
        globalTimelineErrors[index] = `End time should be greater than start time`
        return
      }
      globalTimelineReason.rules.forEach((rule, i) => {
        if (i === index) {
          return
        }
        if (+rule[0] >= +globalTimelineReason.rules[index][0] && +rule[0] <= +globalTimelineReason.rules[index][1]) {
          isValid = false
          globalTimelineErrors[index] = `Start and end time can not overlap with other start time and end time`
        } else {
          globalTimelineErrors[index] = ''
        }
      })

    })
    idleTimelineReason.ids.forEach((id, index) => {
      if (id === null) {
        isValid = false
        idleTimelineErrors[index] = `Please select timeline rule.`
        return
      }
      if (idleTimelineReason.rules[index][0] === '') {
        isValid = false
        idleTimelineErrors[index] = `Start time is required`
        return
      }
      if (+idleTimelineReason.rules[index][0] < 0) {
        isValid = false
        idleTimelineErrors[index] = `Start time should be greater then or equal 0`
        return
      }
      if (idleTimelineReason.rules[index][1] === '') {
        isValid = false
        idleTimelineErrors[index] = `End time is required`
        return
      }
      if (+idleTimelineReason.rules[index][1] < 0) {
        isValid = false
        idleTimelineErrors[index] = `End time should be greater then or equal 0`
        return
      }
      if (+idleTimelineReason.rules[index][0] >= +idleTimelineReason.rules[index][1]) {
        isValid = false
        idleTimelineErrors[index] = `End time should be greater than start time`
        return
      }
      idleTimelineReason.rules.forEach((rule, i) => {
        if (i === index) {
          return
        }
        if (+rule[0] >= +idleTimelineReason.rules[index][0] && +rule[0] <= +idleTimelineReason.rules[index][1]) {
          isValid = false
          idleTimelineErrors[index] = `Start time and end time can not overlap with other start time and end time`
        } else {
          idleTimelineErrors[index] = ''
        }
      })
    })
    preparationTimelineReason.ids.forEach((id, index) => {
      if (id === null) {
        isValid = false
        preparationTimelineErrors[index] = `Please select timeline rule.`
        return
      }
      if (preparationTimelineReason.rules[index][0] === '') {
        isValid = false
        preparationTimelineErrors[index] = `Start time is required`
        return
      }
      if (+preparationTimelineReason.rules[index][0] < 0) {
        isValid = false
        preparationTimelineErrors[index] = `Start time should be greater then or equal 0`
        return
      }
      if (preparationTimelineReason.rules[index][1] === '') {
        isValid = false
        preparationTimelineErrors[index] = `End time is required`
        return
      }
      if (+preparationTimelineReason.rules[index][1] < 0) {
        isValid = false
        preparationTimelineErrors[index] = `End time should be greater then or equal 0`
        return
      }
      if (+preparationTimelineReason.rules[index][0] >= +preparationTimelineReason.rules[index][1]) {
        isValid = false
        preparationTimelineErrors[index] = `End time should be greater than start time`
        return
      }
      preparationTimelineReason.rules.forEach((rule, i) => {
        if (i === index) {
          return
        }
        if (+rule[0] >= +preparationTimelineReason.rules[index][0] && +rule[0] <= +preparationTimelineReason.rules[index][1]) {
          isValid = false
          preparationTimelineErrors[index] = `Start time and end time can not overlap with other start time and end time`
        } else {
          preparationTimelineErrors[index] = ''
        }
      })
    })
    offTimelineReason.ids.forEach((id, index) => {
      if (id === null) {
        isValid = false
        offTimelineErrors[index] = `Please select timeline rule.`
        return
      }
      if (offTimelineReason.rules[index][0] === '') {
        isValid = false
        offTimelineErrors[index] = `Start time is required`
        return
      }
      if (+offTimelineReason.rules[index][0] < 0) {
        isValid = false
        offTimelineErrors[index] = `Start time should be greater then or equal 0`
        return
      }
      if (offTimelineReason.rules[index][1] === '') {
        isValid = false
        offTimelineErrors[index] = `End time is required`
        return
      }
      if (+offTimelineReason.rules[index][1] < 0) {
        isValid = false
        offTimelineErrors[index] = `End time should be greater then or equal 0`
        return
      }
      if (+offTimelineReason.rules[index][0] >= +offTimelineReason.rules[index][1]) {
        isValid = false
        offTimelineErrors[index] = `End time should be greater than start time`
        return
      }
      offTimelineReason.rules.forEach((rule, i) => {
        if (i === index) {
          return
        }
        if (+rule[0] >= +offTimelineReason.rules[index][0] && +rule[0] <= +offTimelineReason.rules[index][1]) {
          isValid = false
          offTimelineErrors[index] = `Start time and end time can not overlap with other start time and end time`
        } else {
          offTimelineErrors[index] = ''
        }
      })
    })
    setGlobalTimelineReason({
      ...globalTimelineReason,
      errMsg: globalTimelineErrors
    })
    setIdleTimelineReason({
      ...idleTimelineReason,
      errMsg: idleTimelineErrors
    })
    setPreparationTimelineReason({
      ...preparationTimelineReason,
      errMsg: preparationTimelineErrors
    })
    setoffTimelineReason({
      ...offTimelineReason,
      errMsg: offTimelineErrors
    })
    return isValid
  }

  const updateRulesHandler = () => {
    const isValid = validationHandler()
    if (!isValid) return;
    const data = {
      "meta_backend": {
        "off_timeline_reason": {
          "ids": offTimelineReason.ids,
          "rules": offTimelineReason.rules.map(rule => ([parseInt(rule[0], 10), parseInt(rule[1], 10)])),
          "default": offTimelineReason.default
        },
        "idle_timeline_reason": {
          "ids": idleTimelineReason.ids,
          "rules": idleTimelineReason.rules.map(rule => ([parseInt(rule[0], 10), parseInt(rule[1], 10)])),
          "default": idleTimelineReason.default
        },
        "global_timeline_reason": {
          "ids": globalTimelineReason.ids,
          "rules": globalTimelineReason.rules.map(rule => ([parseInt(rule[0], 10), parseInt(rule[1], 10)])),
          "default": globalTimelineReason.default
        },
        "unknown_timeline_reason": {
          "ids": [],
          "rules": [],
          "default": null
        },
        "production_timeline_reason": {
          "ids": [],
          "rules": [],
          "default": null
        },
        "preparation_timeline_reason": {
          "ids": preparationTimelineReason.ids,
          "rules": preparationTimelineReason.rules.map(rule => ([parseInt(rule[0], 10), parseInt(rule[1], 10)])),
          "default": preparationTimelineReason.default
        }
      }
    }
    updateMachineMeta(data)
  }

  const timelineReasonOptions = [{ label: 'None', id: null }, ...timelineReasonList.map((item) => ({ label: item.name, id: item.id }))] || []

  return (
    <Modal
      open={openTimelineRulesForm}
      onClose={handleCloseTimelineRules}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={({ palette: { dark, white } }) => ({
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
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
          <MDBox textAlign="center">
            <MDTypography
              variant="button"
              color="light"
              fontWeight="medium"
              textGradient
              textAlign="center"
              mx="auto"
              fontSize="1.25rem"
            >
              {translate("Timeline Rules")}
            </MDTypography>
            <Tooltip title={translate("timelineRulesInfo")} style={{ marginLeft: 10 }}>
              <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
            </Tooltip>
          </MDBox>
          <MDBox mb={2}>
            <Grid container alignItems="center">
              <Grid item>
                <MDTypography variant="h6">
                  {translate("Global Timeline Rules")}
                </MDTypography>
              </Grid>
              <Grid item>
                <Tooltip title={translate("greenIcon")}>
                  <FiberManualRecordIcon sx={{ color: `${RunTime.main} !important`, marginLeft: '10px', marginRight: '5px' }} />
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title={translate("yellowIcon")}>
                  <FiberManualRecordIcon sx={{ color: `${IdleTime.main} !important`, marginLeft: '5px', marginRight: '5px' }} />
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title={translate("redIcon")}>
                  <FiberManualRecordIcon sx={{ color: `${StoppedTime.main} !important`, marginLeft: '5px', marginRight: '5px' }} />
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title={translate("blueIcon")}>
                  <FiberManualRecordIcon sx={{ color: `${PreparationTime.main} !important`, marginLeft: '5px', marginRight: '5px' }} />
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title={translate("greyIcon")}>
                  <FiberManualRecordIcon sx={{ color: `${UnknownTime.main} !important`, marginLeft: '5px', marginRight: '5px' }} />
                </Tooltip>
              </Grid>
            </Grid>
            <Grid container mt={2}>
              <Grid item sm={6} xs={6}>
                <FormControl
                  sx={({ palette: { dark, white } }) => ({
                    width: "100%",
                    color: darkMode ? white.main : dark.main
                  })}
                >
                  <Autocomplete
                    id="global-rules-filled"
                    options={timelineReasonOptions}
                    value={timelineReasonOptions.find((item) => item.id === globalTimelineReason.default)}
                    onChange={(event, newValue) => {
                      setGlobalTimelineReason({ ...globalTimelineReason, default: newValue.id });
                    }}
                    renderInput={(params) => (
                      <MDInput {...params} type="text" label={translate("defaultReason")} placeholder={translate("selectReason")} />
                    )}
                    clearIcon={false}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {
              globalTimelineReason.ids.map((id, index) => (
                <>
                  <Grid container mt={2}>
                    <Grid item sm={4} xs={4}>
                      <FormControl
                        sx={({ palette: { dark, white } }) => ({
                          width: "100%",
                          color: darkMode ? white.main : dark.main
                        })}
                      >
                        <Autocomplete
                          id="global-rules-filled"
                          options={timelineReasonOptions}
                          value={timelineReasonOptions.find((item) => item.id === id)}
                          onChange={(event, newValue) => {
                            const ids = [...globalTimelineReason.ids];
                            const errors = [...globalTimelineReason.errMsg];
                            ids[index] = newValue.id;
                            errors[index] = null;
                            setGlobalTimelineReason({ ...globalTimelineReason, ids, errMsg: errors });
                          }}
                          renderInput={(params) => (
                            <MDInput {...params} type="text" label={translate("selectReason")} placeholder={translate("selectReason")} />
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item sm={2} xs={2} display="flex" justifyContent="center" alignItems="center">
                      <MDTypography variant="body2">
                        {translate("between")}
                      </MDTypography>
                    </Grid>
                    <Grid item sm={2} xs={2}>
                      <MDInput
                        type="number"
                        value={globalTimelineReason.rules[index][0]}
                        fullWidth
                        onChange={(e) => globalChangeBetweenHandler(e, index)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <MDTypography variant="body2">Sec</MDTypography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item sm={1} xs={1} display="flex" justifyContent="center" alignItems="center">
                      <MDTypography variant="body2">
                        {translate("and")}
                      </MDTypography>
                    </Grid>
                    <Grid item sm={2} xs={2}>
                      <MDInput
                        type="number"
                        value={globalTimelineReason.rules[index][1]}
                        fullWidth
                        onChange={(e) => globalChangeAndHandler(e, index)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <MDTypography variant="body2">Sec</MDTypography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item sm={1} xs={1} display="flex" justifyContent="center" alignItems="center">
                      <Close
                        sx={{ cursor: 'pointer' }}
                        onClick={() => globalTimelineReasonRemoveHandler(index)} />
                    </Grid>
                  </Grid>
                  {
                    globalTimelineReason.errMsg[index] && <MDBox>
                      <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                        {translate(globalTimelineReason.errMsg[index])}
                      </MDTypography>
                    </MDBox>
                  }
                </>
              ))
            }
            <MDTypography
              onClick={globalTimelineRuleAddHandler}
              variant="buttom" sx={{ display: "flex", alignItems: "center", marginTop: '12px', fontSize: 'medium', cursor: 'pointer', width: 'fit-content' }}>
              <AddIcon /> {translate("Add new rule")}
            </MDTypography>
          </MDBox>
          <MDBox mb={2}>
            <Grid container alignItems="center">
              <Grid item>
                <MDTypography variant="h6">
                  {translate("Off state Timeline Rules")}
                </MDTypography>
              </Grid>
              <Grid item>
                <Tooltip title={translate("redIcon")}>
                  <FiberManualRecordIcon sx={{ color: `${StoppedTime.main} !important`, marginLeft: '5px', marginRight: '5px' }} />
                </Tooltip>
              </Grid>
            </Grid>
            <Grid container mt={2}>
              <Grid item sm={6} xs={6}>
                <FormControl
                  sx={({ palette: { dark, white } }) => ({
                    width: "100%",
                    color: darkMode ? white.main : dark.main
                  })}
                >
                  <Autocomplete
                    id="off-rules-filled"
                    options={timelineReasonOptions}
                    value={timelineReasonOptions.find((item) => item.id === offTimelineReason.default)}
                    onChange={(event, newValue) => {
                      setoffTimelineReason({ ...offTimelineReason, default: newValue.id });
                    }}
                    renderInput={(params) => (
                      <MDInput {...params} type="text" label={translate("defaultReason")} placeholder={translate("selectReason")} />
                    )}
                    clearIcon={false}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {
              offTimelineReason.ids.map((id, index) => (
                <>
                  <Grid container mt={2}>
                    <Grid item sm={4} xs={4}>
                      <FormControl
                        sx={({ palette: { dark, white } }) => ({
                          width: "100%",
                          color: darkMode ? white.main : dark.main
                        })}
                      >
                        <Autocomplete
                          id="global-rules-filled"
                          options={timelineReasonOptions}
                          value={timelineReasonOptions.find((item) => item.id === id)}
                          onChange={(event, newValue) => {
                            const ids = [...offTimelineReason.ids];
                            const errors = [...offTimelineReason.errMsg];
                            ids[index] = newValue.id;
                            errors[index] = null;
                            setoffTimelineReason({ ...offTimelineReason, ids, errMsg: errors });
                          }}
                          renderInput={(params) => (
                            <MDInput {...params} type="text" label={translate("selectReason")} placeholder={translate("selectReason")} />
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item sm={2} xs={2} display="flex" justifyContent="center" alignItems="center">
                      <MDTypography variant="body2">
                        {translate("between")}
                      </MDTypography>
                    </Grid>
                    <Grid item sm={2} xs={2}>
                      <MDInput
                        type="number"
                        value={offTimelineReason.rules[index][0]}
                        fullWidth
                        onChange={(e) => offChangeBetweenHandler(e, index)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <MDTypography variant="body2">Sec</MDTypography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item sm={1} xs={1} display="flex" justifyContent="center" alignItems="center">
                      <MDTypography variant="body2">
                        {translate("and")}
                      </MDTypography>
                    </Grid>
                    <Grid item sm={2} xs={2}>
                      <MDInput
                        type="number"
                        value={offTimelineReason.rules[index][1]}
                        fullWidth
                        onChange={(e) => offChangeAndHandler(e, index)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <MDTypography variant="body2">Sec</MDTypography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item sm={1} xs={1} display="flex" justifyContent="center" alignItems="center">
                      <Close
                        sx={{ cursor: 'pointer' }}
                        onClick={() => offTimelineReasonRemoveHandler(index)} />
                    </Grid>
                  </Grid>
                  {
                    offTimelineReason.errMsg[index] && <MDBox>
                      <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                        {translate(offTimelineReason.errMsg[index])}
                      </MDTypography>
                    </MDBox>
                  }
                </>
              ))
            }
            <MDTypography
              onClick={offStateTimelineRuleAddHandler}
              variant="buttom" sx={{ display: "flex", alignItems: "center", marginTop: '12px', fontSize: 'medium', cursor: 'pointer', width: 'fit-content' }}>
              <AddIcon />{translate("Add new rule")}
            </MDTypography>
          </MDBox>
          <MDBox mb={2}>
            <Grid container alignItems="center">
              <Grid item>
                <MDTypography variant="h6">
                  {translate("Idle state Timeline Rules")}
                </MDTypography>
              </Grid>
              <Grid item>
                <Tooltip title={translate("yellowIcon")}>
                  <FiberManualRecordIcon sx={{ color: `${IdleTime.main} !important`, marginLeft: '5px', marginRight: '5px' }} />
                </Tooltip>
              </Grid>
            </Grid>
            <Grid container mt={2}>
              <Grid item sm={6} xs={6}>
                <FormControl
                  sx={({ palette: { dark, white } }) => ({
                    width: "100%",
                    color: darkMode ? white.main : dark.main
                  })}
                >
                  <Autocomplete
                    id="idle-rules-filled"
                    options={timelineReasonOptions}
                    value={timelineReasonOptions.find((item) => item.id === idleTimelineReason.default)}
                    onChange={(event, newValue) => {
                      setIdleTimelineReason({ ...idleTimelineReason, default: newValue.id });
                    }}
                    renderInput={(params) => (
                      <MDInput {...params} type="text" label={translate("defaultReason")} placeholder={translate("selectReason")} />
                    )}
                    clearIcon={false}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {
              idleTimelineReason.ids.map((id, index) => (
                <>
                  <Grid container mt={2}>
                    <Grid item sm={4} xs={4}>
                      <FormControl
                        sx={({ palette: { dark, white } }) => ({
                          width: "100%",
                          color: darkMode ? white.main : dark.main
                        })}
                      >
                        <Autocomplete
                          id="idle-rules-filled"
                          options={timelineReasonOptions}
                          value={timelineReasonOptions.find((item) => item.id === id)}
                          onChange={(event, newValue) => {
                            const ids = [...idleTimelineReason.ids];
                            const errors = [...idleTimelineReason.errMsg];
                            ids[index] = newValue.id;
                            errors[index] = null;
                            setIdleTimelineReason({ ...idleTimelineReason, ids, errMsg: errors });
                          }}
                          renderInput={(params) => (
                            <MDInput {...params} type="text" label={translate("selectReason")} placeholder={translate("selectReason")} />
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item sm={2} xs={2} display="flex" justifyContent="center" alignItems="center">
                      <MDTypography variant="body2">
                        {translate("between")}
                      </MDTypography>
                    </Grid>
                    <Grid item sm={2} xs={2}>
                      <MDInput
                        type="number"
                        value={idleTimelineReason.rules[index][0]}
                        fullWidth
                        onChange={(e) => idleChangeBetweenHandler(e, index)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <MDTypography variant="body2">Sec</MDTypography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item sm={1} xs={1} display="flex" justifyContent="center" alignItems="center">
                      <MDTypography variant="body2">
                        {translate("and")}
                      </MDTypography>
                    </Grid>
                    <Grid item sm={2} xs={2}>
                      <MDInput
                        type="number"
                        value={idleTimelineReason.rules[index][1]}
                        fullWidth
                        onChange={(e) => idleChangeAndHandler(e, index)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <MDTypography variant="body2">Sec</MDTypography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item sm={1} xs={1} display="flex" justifyContent="center" alignItems="center">
                      <Close
                        sx={{ cursor: 'pointer' }}
                        onClick={() => idleTimelineReasonRemoveHandler(index)} />
                    </Grid>
                  </Grid>
                  {
                    idleTimelineReason.errMsg[index] && <MDBox>
                      <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                        {translate(idleTimelineReason.errMsg[index])}
                      </MDTypography>
                    </MDBox>
                  }
                </>
              ))
            }
            <MDTypography
              onClick={idleStateTimelineRuleAddHandler}
              variant="buttom" sx={{ display: "flex", alignItems: "center", marginTop: '12px', fontSize: 'medium', cursor: 'pointer', width: 'fit-content' }}>
              <AddIcon />Add new rule {translate("Add new rule")}
            </MDTypography>
          </MDBox>
          <MDBox mb={2}>
            <Grid container alignItems="center">
              <Grid item>
                <MDTypography variant="h6">
                  {translate("Preparation state timeline rules")}
                </MDTypography>
              </Grid>
              <Grid item>
                <Tooltip title={translate("blueIcon")}>
                  <FiberManualRecordIcon sx={{ color: `${PreparationTime.main} !important`, marginLeft: '5px', marginRight: '5px' }} />
                </Tooltip>
              </Grid>
            </Grid>
            <Grid container mt={2}>
              <Grid item sm={6} xs={6}>
                <FormControl
                  sx={({ palette: { dark, white } }) => ({
                    width: "100%",
                    color: darkMode ? white.main : dark.main
                  })}
                >
                  <Autocomplete
                    id="preparation-rules-filled"
                    options={timelineReasonOptions}
                    value={timelineReasonOptions.find((item) => item.id === preparationTimelineReason.default)}
                    onChange={(event, newValue) => {
                      setPreparationTimelineReason({ ...preparationTimelineReason, default: newValue.id });
                    }}
                    renderInput={(params) => (
                      <MDInput {...params} type="text" label={translate("defaultReason")} placeholder={translate("selectReason")} />
                    )}
                    clearIcon={false}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {
              preparationTimelineReason.ids.map((id, index) => (
                <>
                  <Grid container mt={2}>
                    <Grid item sm={4} xs={4}>
                      <FormControl
                        sx={({ palette: { dark, white } }) => ({
                          width: "100%",
                          color: darkMode ? white.main : dark.main
                        })}
                      >
                        <Autocomplete
                          id="preparation-rules-filled"
                          options={timelineReasonOptions}
                          value={timelineReasonOptions.find((item) => item.id === id)}
                          onChange={(event, newValue) => {
                            const ids = [...preparationTimelineReason.ids];
                            const errors = [...preparationTimelineReason.errMsg];
                            ids[index] = newValue.id;
                            errors[index] = null;
                            setPreparationTimelineReason({ ...preparationTimelineReason, ids, errMsg: errors });
                          }}
                          renderInput={(params) => (
                            <MDInput {...params} type="text" label={translate("selectReason")} placeholder={translate("selectReason")} />
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item sm={2} xs={2} display="flex" justifyContent="center" alignItems="center">
                      <MDTypography variant="body2">
                        {translate("between")}
                      </MDTypography>
                    </Grid>
                    <Grid item sm={2} xs={2}>
                      <MDInput
                        type="number"
                        value={preparationTimelineReason.rules[index][0]}
                        fullWidth
                        onChange={(e) => preparationChangeBetweenHandler(e, index)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <MDTypography variant="body2">Sec</MDTypography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item sm={1} xs={1} display="flex" justifyContent="center" alignItems="center">
                      <MDTypography variant="body2">
                        {translate("and")}
                      </MDTypography>
                    </Grid>
                    <Grid item sm={2} xs={2}>
                      <MDInput
                        type="number"
                        value={preparationTimelineReason.rules[index][1]}
                        fullWidth
                        onChange={(e) => preparationChangeAndHandler(e, index)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <MDTypography variant="body2">Sec</MDTypography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item sm={1} xs={1} display="flex" justifyContent="center" alignItems="center">
                      <Close
                        sx={{ cursor: 'pointer' }}
                        onClick={() => preparationTimelineReasonRemoveHandler(index)} />
                    </Grid>
                  </Grid>
                  {
                    preparationTimelineReason.errMsg[index] && <MDBox>
                      <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                        {translate(preparationTimelineReason.errMsg[index])}
                      </MDTypography>
                    </MDBox>
                  }
                </>
              ))
            }
            <MDTypography
              onClick={preparationStateTimelineRuleAddHandler}
              variant="buttom" sx={{ display: "flex", alignItems: "center", marginTop: '12px', fontSize: 'medium', cursor: 'pointer', width: 'fit-content' }}>
              <AddIcon />{translate("Add new rule")}
            </MDTypography>
          </MDBox>
          <MDBox textAlign='center'>
            <MDButton
              variant={darkMode ? "contained" : "outlined"}
              color="dark"
              size="medium"
              onClick={updateRulesHandler}
              sx={{ marginRight: "8px", mt: 1 }}
            >
              {translate("Update rules")}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default AddTimelineRules;
