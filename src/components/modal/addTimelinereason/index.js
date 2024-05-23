/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
} from "@mui/material";
import { enumQueryNames } from "api/reactQueryConstant";
import { assignTimelineReasonApi } from "api/watchmenApi";
import { getTimelineReasonApi } from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import moment from "moment";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

function AddTimelineReason({
    timeDetailPopup,
    setTimeDetailPopup,
    refetch = () => { },
}) {
    const [timelineReasonId, setTimelineReasonId] = useState("");
    const [controller] = useMaterialUIController();
    const { darkMode } = controller;
    const [filterError, setFilterError] = useState("");
    const [successSB, setSuccessSB] = useState(null);

    useEffect(() => {
        setTimelineReasonId(timeDetailPopup?.timeLineReason?.id || "")
    }, [timeDetailPopup?.timeLineReason?.id])

    const { axiosPrivate } = useAxiosPrivate();

    const { data: timelineReasonList = [] } = useQuery([enumQueryNames.TIMELINE_REASON_LIST], () =>
        getTimelineReasonApi(axiosPrivate)
    );

    const closeSuccessSB = () => setSuccessSB(null);

    const assignTimelineReasonHandler = async () => {
        const payload = {
            "data": [
                {
                    "machine_id": timeDetailPopup.machineId,
                    "timeline_reason_id": timelineReasonId,
                    "start_timestamp": timeDetailPopup?.value[1],
                    "operation": "add"
                }
            ]
        }
        const response = await assignTimelineReasonApi(axiosPrivate, payload)
        setSuccessSB(response)
        refetch()
        setTimeDetailPopup(false)
    }

    return <><Modal
        open={timeDetailPopup}
        onClose={() => setTimeDetailPopup(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box
            sx={({ palette: { dark, white } }) => ({
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: darkMode ? "#0F141F" : "#eeeeee",
                border: "1px solid #000",
                borderRadius: "3%",
                boxShadow: 24,
                px: 4,
                pb: 4,
                color: darkMode ? white.main : dark.main,
                maxHeight: "90vh",
                overflow: "auto"
            })}
            className="customScroll"
        >
            <MDBox pb={3} px={3}>
                <MDBox>
                    <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                        {filterError}
                    </MDTypography>
                </MDBox>
                <MDTypography
                    variant="button"
                    color="light"
                    textGradient
                    fontWeight="medium"
                    textAlign="center"
                    fontSize="1rem"
                >
                    {timeDetailPopup && timeDetailPopup?.value.length ? (
                        <>
                            <FiberManualRecordIcon style={{ color: timeDetailPopup.itemStyle.color }} />
                            {timeDetailPopup.name} :{" "}
                            {moment(new Date(timeDetailPopup?.value[1])).format("HH:mm")} -{" "}
                            {moment(new Date(timeDetailPopup?.value[2])).format("HH:mm")}
                        </>
                    ) : (
                        ""
                    )}
                </MDTypography>
                <MDBox component="form" role="form" py={3}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="select-machine-label">Select Reason</InputLabel>
                        <Select
                            labelId="select-machine-label"
                            id="select-machine"
                            value={timelineReasonId}
                            label="Select Reason"
                            onChange={(e) => setTimelineReasonId(e.target.value)}
                            sx={{
                                minHeight: "45px"
                            }}
                        >
                            {timelineReasonList?.map((list) => (
                                <MenuItem value={list.id}>{list.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </MDBox>
                <MDBox sx={{ pr: 3, display: "inline" }} textAlign="center">
                    <MDButton variant="gradient" color="info" onClick={assignTimelineReasonHandler}>
                        {translate("Save")}
                    </MDButton>
                </MDBox>

                <MDBox sx={{ display: "inline" }} textAlign="center">
                    <MDButton variant="gradient" color="error" onClick={() => setTimeDetailPopup(false)}>
                        {translate("Cancel")}
                    </MDButton>
                </MDBox>
            </MDBox>

        </Box>
    </Modal>
        <MDSnackbar
            color="success"
            icon="check"
            title="Success"
            content={successSB?.message}
            open={!!successSB?.message}
            onClose={closeSuccessSB}
            close={closeSuccessSB}
            bgWhite
        />
    </>
}

export default AddTimelineReason