/* eslint-disable no-plusplus */
/* eslint-disable react/prop-types */
/* eslint-disable no-restricted-syntax */
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from "@mui/material";
import { Stack } from "@mui/system";
import ConfirmationDialog from "components/MDDialog/ConfirmationDialog";
import translate from "i18n/translate";
import moment from "moment";
import { memo, useState } from "react";
import { updateOperatorHandler, updateShiftDataHandler } from "utils";

const ShiftCheckBoxColumn = memo(({
    value,
    row,
    date,
    originalMahcineShiftData,
    updateShiftsData,
    setUpdateShiftsData,
    machineShiftsData,
    setMachineShiftsData,
    operatorList,
    carryForward = false,
}) => Object.entries(value).map(([key, shiftStatus]) => {
    const [weekCarryForward, setWeekCarryForward] = useState(null)
    const [operatorCarryForward, setOperatorCarryForward] = useState(null)

    const choiceSelectionHandler = (confirm) => {
        if (confirm === 'cancel') {
            setWeekCarryForward(null)
            return
        }
        if (confirm) {

            let newUpdatedData = machineShiftsData
            if (weekCarryForward.change) {
                const updatedItems = []
                for (let index = 0; index < 7; index++) {
                    // eslint-disable-next-line no-shadow
                    const date = moment(weekCarryForward.date).add(index, 'days').format("YYYY-MM-DD")
                    updatedItems.push({
                        "machine_id": weekCarryForward.machine_id,
                        "shift_id": weekCarryForward.shift_id,
                        "date": date,
                        "operation": weekCarryForward.operation
                    })
                    newUpdatedData = updateShiftDataHandler(newUpdatedData, weekCarryForward.machine_id, date, weekCarryForward.key, weekCarryForward.operation === "add")
                }
                setUpdateShiftsData([...updateShiftsData, ...updatedItems])
            } else {
                let updatedItems = [...updateShiftsData]
                for (let index = 0; index < 7; index++) {
                    // eslint-disable-next-line no-shadow
                    const date = moment(weekCarryForward.date).add(index, 'days').format("YYYY-MM-DD")
                    updatedItems = updatedItems.filter(item => item.shift_id !== +weekCarryForward.shift_id || item.machine_id !== +weekCarryForward.machine_id || item.date !== date)
                    newUpdatedData = updateShiftDataHandler(newUpdatedData, weekCarryForward.machine_id, date, weekCarryForward.key, weekCarryForward.operation === "add")
                }
                setUpdateShiftsData([...updatedItems])
            }
            setMachineShiftsData(newUpdatedData)
            setWeekCarryForward(null)
        } else {
            // eslint-disable-next-line no-shadow
            const date = moment(weekCarryForward.date).format("YYYY-MM-DD")
            if (updateShiftsData.find(item => item.shift_id === +weekCarryForward.shift_id && item.machine_id === +weekCarryForward.machine_id && item.date === date)) {
                setUpdateShiftsData(updateShiftsData.filter(item => item.shift_id !== +weekCarryForward.shift_id || item.machine_id !== +row.original.machineId || item.date !== date))
                const updatedData = updateShiftDataHandler(machineShiftsData, +row.original.machineId, date, key, weekCarryForward.operation === "add")
                setMachineShiftsData(updatedData)
            } else {
                setUpdateShiftsData([...updateShiftsData,
                {
                    "machine_id": +row.original.machineId,
                    "shift_id": weekCarryForward.shift_id,
                    "date": date,
                    "operation": weekCarryForward.operation
                }
                ])
                const updatedData = updateShiftDataHandler(machineShiftsData, +row.original.machineId, date, key, weekCarryForward.operation === "add")
                setMachineShiftsData(updatedData)
            }
            setWeekCarryForward(null)
        }
    }

    const operatorSelectionHandler = (confirm) => {
        if (confirm === 'cancel') {
            setOperatorCarryForward(null)
            return
        }
        if (confirm) {
            let newUpdatedData = machineShiftsData
            if (operatorCarryForward.change) {
                const updatedItems = []
                for (let index = 0; index < 7; index++) {
                    // eslint-disable-next-line no-shadow
                    const date = moment(operatorCarryForward.date).add(index, 'days').format("YYYY-MM-DD")
                    let curitem = {
                        "machine_id": operatorCarryForward.machine_id,
                        "shift_id": operatorCarryForward.shift_id,
                        "date": date,
                        "operation": "add",
                    }
                    operatorCarryForward.operator_id && (curitem["operator_id"] = +operatorCarryForward.operator_id)
                    if (row.original[date][operatorCarryForward.key].status) {
                        updatedItems.push(curitem)
                    }
                    newUpdatedData = updateOperatorHandler(newUpdatedData, operatorCarryForward.machine_id, date, operatorCarryForward.key, operatorCarryForward.operator_id)
                }
                setUpdateShiftsData([...updateShiftsData, ...updatedItems])
            } else {
                let updatedItems = [...updateShiftsData]
                for (let index = 0; index < 7; index++) {
                    // eslint-disable-next-line no-shadow
                    const date = moment(operatorCarryForward.date).add(index, 'days').format("YYYY-MM-DD")
                    updatedItems = updatedItems.map(item => {
                        if (item.shift_id !== +operatorCarryForward.shift_id || item.machine_id !== +row.original.machineId || item.date !== date) {
                            if (operatorCarryForward.operator_id && row.original[item.date][operatorCarryForward.key].status) {
                                return {
                                    ...item,
                                    operator_id: +operatorCarryForward.operator_id
                                }
                            }
                        }
                        return item
                    })
                    newUpdatedData = updateOperatorHandler(newUpdatedData, operatorCarryForward.machine_id, date, operatorCarryForward.key, operatorCarryForward.operator_id)
                }
                setUpdateShiftsData([...updatedItems])
            }
            setMachineShiftsData(newUpdatedData)
            setOperatorCarryForward(null)
        } else {
            // eslint-disable-next-line no-shadow
            const date = moment(operatorCarryForward.date).format("YYYY-MM-DD")
            if (updateShiftsData.find(item => item.shift_id === +operatorCarryForward.shift_id && item.machine_id === +row.original.machineId && item.date === date)) {
                setUpdateShiftsData(updateShiftsData.map(item => {
                    if (item.shift_id !== +operatorCarryForward.shift_id || item.machine_id !== +row.original.machineId || item.date !== date) {
                        if (operatorCarryForward.operator_id) {
                            return {
                                ...item,
                                operator_id: +operatorCarryForward.operator_id
                            }
                        }
                        return item
                    }
                    return item
                }))
                const updatedData = updateOperatorHandler(machineShiftsData, +row.original.machineId, date, key, operatorCarryForward.operator_id)
                setMachineShiftsData(updatedData)
            } else {
                const curitem = {
                    "machine_id": +row.original.machineId,
                    "shift_id": +operatorCarryForward.shift_id,
                    "date": date,
                    "operation": "add",
                }
                operatorCarryForward.operator_id && (curitem["operator_id"] = +operatorCarryForward.operator_id)
                setUpdateShiftsData([...updateShiftsData, curitem])
                const updatedData = updateOperatorHandler(machineShiftsData, +row.original.machineId, date, key, operatorCarryForward.operator_id)
                setMachineShiftsData(updatedData)
            }
        }
    }

    let curentShiftId = null
    for (const shifts of Object.entries(originalMahcineShiftData.shift_list)) {
        if (shifts[1].shift_name === key) {
            // eslint-disable-next-line prefer-destructuring
            curentShiftId = shifts[0]
        }
    }
    const currentItem = updateShiftsData.find(item => item.shift_id === +curentShiftId && item.machine_id === +row.original.machineId && item.date === date)
    return <Stack
        key={key}
        flexDirection="column"
        justifyContent="center"
        mb={1}
    >
        <ConfirmationDialog
            title={translate("Do you want to carry forward this choice for entire week?")}
            open={weekCarryForward}
            handleClose={choiceSelectionHandler}
            cancelButton={true}
        />
        <ConfirmationDialog
            title={translate("Do you want to carry forward this choice for entire week?")}
            open={operatorCarryForward}
            handleClose={operatorSelectionHandler}
            cancelButton={true}
        />
        <Stack
            flexDirection="row"
            alignItems="center"
            sx={{
                minWidth: '150px',
                border: currentItem?.operation === "add" || currentItem?.operation === "delete" ? "1px solid" : "none",
                borderColor: currentItem?.operation === "add" ? "green" : currentItem?.operation === "delete" ? "red" : ""
            }}
        >
            <Checkbox
                checked={shiftStatus.status}
                onClick={(e) => {
                    if (updateShiftsData.find(item => item.shift_id === +curentShiftId && item.machine_id === +row.original.machineId && item.date === date)) {
                        if (carryForward) {
                            const item = {
                                "machine_id": +row.original.machineId,
                                "shift_id": +curentShiftId,
                                "date": date,
                                "operation": e.target.checked ? "add" : "delete"
                            }
                            setWeekCarryForward({ ...item, key, change: false })
                            return
                        }
                        setUpdateShiftsData(updateShiftsData.filter(item => item.shift_id !== +curentShiftId || item.machine_id !== +row.original.machineId || item.date !== date))
                        const updatedData = updateShiftDataHandler(machineShiftsData, +row.original.machineId, date, key, e.target.checked)
                        setMachineShiftsData(updatedData)
                    } else {
                        const item = {
                            "machine_id": +row.original.machineId,
                            "shift_id": +curentShiftId,
                            "date": date,
                            "operation": e.target.checked ? "add" : "delete"
                        }
                        if (carryForward) {
                            setWeekCarryForward({ ...item, key, change: true })
                            return
                        }
                        setUpdateShiftsData([...updateShiftsData, item])
                        const updatedData = updateShiftDataHandler(machineShiftsData, +row.original.machineId, date, key, e.target.checked)
                        setMachineShiftsData(updatedData)

                    }
                }} />
            {/* <ListItemText
                primaryTypographyProps={{ fontSize: "14px" }}
                primary={key}
                sx={{ color: currentItem?.operation === "add" ? "green" : currentItem?.operation === "delete" ? "red" : "" }}
            /> */}
            {
                shiftStatus.status && <FormControl fullWidth variant="outlined" >
                    <InputLabel id="select-operator-label">{translate("selectOperator")}</InputLabel>
                    <Select
                        labelId="select-operator-label"
                        id="select-operator"
                        value={shiftStatus.operatorId || ''}
                        onChange={(e) => {
                            if (updateShiftsData.find(item => item.shift_id === +curentShiftId && item.machine_id === +row.original.machineId && item.date === date)) {
                                if (carryForward) {
                                    const item = {
                                        "machine_id": +row.original.machineId,
                                        "shift_id": +curentShiftId,
                                        "date": date,
                                        "operator_id": e.target.value ? +e.target.value : null
                                    }
                                    setOperatorCarryForward({ ...item, key, change: false })
                                    return
                                }
                                setUpdateShiftsData(updateShiftsData.map(item => {
                                    if (item.shift_id !== +curentShiftId || item.machine_id !== +row.original.machineId || item.date !== date) {
                                        return {
                                            ...item,
                                            operator_id: e.target.value ? +e.target.value : null
                                        }
                                    }
                                    return item
                                }))
                                // setUpdateShiftsData(updateShiftsData.filter(item => item.shift_id !== +curentShiftId || item.machine_id !== +row.original.machineId || item.date !== date))
                                const updatedData = updateOperatorHandler(machineShiftsData, +row.original.machineId, date, key, e.target.value)
                                setMachineShiftsData(updatedData)
                            } else {
                                if (carryForward) {
                                    const item = {
                                        "machine_id": +row.original.machineId,
                                        "shift_id": +curentShiftId,
                                        "date": date,
                                        "operation": "add",
                                        "operator_id": e.target.value ? +e.target.value : null
                                    }
                                    setOperatorCarryForward({ ...item, key, change: true })
                                    return
                                }
                                setUpdateShiftsData([...updateShiftsData,
                                {
                                    "machine_id": +row.original.machineId,
                                    "shift_id": +curentShiftId,
                                    "date": date,
                                    "operation": "add",
                                    "operator_id": e.target.value ? +e.target.value : null
                                }
                                ])
                                const updatedData = updateOperatorHandler(machineShiftsData, +row.original.machineId, date, key, e.target.value)
                                setMachineShiftsData(updatedData)
                            }
                        }}
                        label={translate("selectOperator")}
                        sx={{
                            minHeight: "45px"
                        }}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {operatorList?.map((list) => (
                            <MenuItem value={+list.id} key={list.id}>
                                {list.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            }
        </Stack>
    </Stack>
}));



export default ShiftCheckBoxColumn;