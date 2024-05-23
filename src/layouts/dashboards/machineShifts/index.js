/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/prop-types */
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Checkbox, Chip, Grid, Skeleton, Typography, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box, Stack } from "@mui/system";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { invalidateQuery } from "api/customReactQueryClient";
import { enumQueryNames } from "api/reactQueryConstant";
import { getHallListApi, getShiftPlanApi, shiftPlanAssignApi } from "api/watchmenApi";
import MDButton from "components/MDButton";
import Footer from "components/Footer";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import DataTable from "components/Tables/DataTable";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import useMachine from "hooks/useMachine";
import translate from "i18n/translate";
import DefaultCell from "components/DefaultCell";
import moment from "moment";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { shiftPlanningTableDateFormat } from "utils";
import ShiftCheckBoxColumn from "./shiftCheckboxColumn";
import WeekPicker from "./weekPicker";
import MachineShiftTable from "./machineShiftTable";

export const useStyle = () => ({
  skeleton: {
    transform: "unset",
    margin: "1.5%",
    display: "inline-block"
  },
  leftArrow: {
    marginRight: "12px",
    cursor: "pointer",
    color: "#FFFFFF",
    width: "18px",
    height: "18px"
  },
  rightArrow: {
    marginLeft: "12px",
    cursor: "pointer",
    color: "#FFFFFF",
    width: "18px",
    height: "18px"
  }
});

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function MachineShifts() {
  const [machineShiftsData, setMachineShiftsData] = useState(null);
  const [columanDates, setColumnDates] = useState([]);
  const [updateShiftsData, setUpdateShiftsData] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState(null);
  const [weekEndDate, setWeekEndDate] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [operatorList, setOperatorList] = useState([]);
  const [date, setDate] = useState(moment());
  const { axiosPrivate } = useAxiosPrivate();
  const classes = useStyle();
  const { machines } = useMachine();

  const {
    data: originalMahcineShiftData,
    refetch,
    isFetching
  } = useQuery(
    [enumQueryNames.SHIFT_ASSIGN_DETAILS],
    () =>
      getShiftPlanApi(axiosPrivate, {
        machine_list:
          selectedOptions?.length > 0
            ? selectedOptions.map((option) => +option.id)
            : machines?.map((machine) => +machine.id),
        start_date: weekStartDate.format("YYYY-MM-DD"),
        end_date: weekEndDate.format("YYYY-MM-DD")
      }),
    {
      enabled: false,
      onSuccess: (shiftPlan) => {
        const operators = [];
        if (shiftPlan.operator_list) {
          for (const [key, value] of Object.entries(shiftPlan.operator_list)) {
            operators.push({
              id: key,
              ...value
            });
          }
        }
        setOperatorList(operators);
        const formatedMachineShiftData = shiftPlanningTableDateFormat(shiftPlan);
        setMachineShiftsData(formatedMachineShiftData);
        const allColumns =
          (formatedMachineShiftData.length > 0 && Object.keys(formatedMachineShiftData?.[0])) || [];
        const columns = allColumns.filter((item) => item !== "machineName" && item !== "machineId");
        setColumnDates(columns || []);
      }
    }
  );

  useEffect(() => {
    const startDate = moment(date).startOf("week");
    const endDate = moment(date).endOf("week");
    setWeekEndDate(endDate);
    setWeekStartDate(startDate);
    setTimeout(() => {
      refetch();
    });
  }, [date]);

  const searchMahcineData = () => {
    if (selectedOptions.length === 0) {
      setMachineShiftsData(null);
      return;
    }
    refetch();
  };

  const { data: hallList = [] } = useQuery([enumQueryNames.HALL_LIST], () =>
    getHallListApi(axiosPrivate)
  );

  const options = hallList
    ?.map((option) =>
      option?.machine_list?.map((machine) => ({
        firstLetter: option.name,
        hallId: option.id,
        id: machine.id,
        name: machine.name
      }))
    )
    .flat();

  const goToPreviosWeek = () => {
    const weekNumber = moment(weekStartDate).week() - 1;
    const startDate = moment().week(weekNumber).startOf("isoWeek");
    const endDate = moment().week(weekNumber).endOf("isoWeek");
    setWeekEndDate(endDate);
    setWeekStartDate(startDate);
  };

  const goToNextWeek = () => {
    const weekNumber = moment(weekStartDate).week() + 1;
    const startDate = moment().week(weekNumber).startOf("isoWeek");
    const endDate = moment().week(weekNumber).endOf("isoWeek");
    setWeekEndDate(endDate);
    setWeekStartDate(startDate);
  };

  const { mutate: assignShiftPlan, isLoading } = useMutation(
    (formData) => shiftPlanAssignApi(axiosPrivate, formData),
    {
      onSuccess: () => {
        setUpdateShiftsData([]);
        invalidateQuery([enumQueryNames.SHIFT_ASSIGN_DETAILS]);
      }
    }
  );

  const assignShiftPlanHandler = (assignData) => {
    const assignShhiftData = {
      data: assignData
    };
    assignShiftPlan(assignShhiftData);
  };

  const handleUpdateShiftDataClick = () => {
    if (updateShiftsData.length) {
      assignShiftPlanHandler(updateShiftsData);
    }
  };

  const clearUpdateShiftDataHandler = () => {
    const formatedMachineShiftData = shiftPlanningTableDateFormat(originalMahcineShiftData);
    setMachineShiftsData(formatedMachineShiftData);
    setUpdateShiftsData([]);
  };

  const columns = [
    {
      Header: translate("Machines"),
      accessor: "machineName",
      Cell: ({ value }) => <DefaultCell value={value} />
    },
    {
      Header: translate("Shifts"),
      accessor: columanDates[0],
      id: "shift",
      Cell: ({ value }) =>
        Object.entries(value).map(([key]) => (
          <Stack
            key={key}
            flexDirection="column"
            justifyContent="center"
            sx={{
              minHeight: "45px"
            }}
          >
            <DefaultCell value={key} />
          </Stack>
        ))
    },
    {
      Header: moment(columanDates[0]).format("dddd"),
      accessor: columanDates[0],
      Cell: ({ value, row }) => (
        <ShiftCheckBoxColumn
          value={value}
          row={row}
          date={columanDates[0]}
          originalMahcineShiftData={originalMahcineShiftData}
          updateShiftsData={updateShiftsData}
          setUpdateShiftsData={setUpdateShiftsData}
          machineShiftsData={machineShiftsData}
          setMachineShiftsData={setMachineShiftsData}
          operatorList={operatorList}
          carryForward
        />
      ),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[0]).format("dddd"))}</p>
          <p>{moment(columanDates[0]).format("DD-MM-YYYY")}</p>
        </Box>
      )
      // LeftArrow: () => (
      //   <KeyboardArrowLeftIcon
      //     onClick={(e) => {
      //       e.preventDefault();
      //       e.stopPropagation();
      //       goToPreviosWeek();
      //     }}
      //     sx={classes.leftArrow}
      //   />
      // )
    },
    {
      Header: moment(columanDates[1]).format("dddd"),
      accessor: columanDates[1],
      Cell: ({ value, row }) => (
        <ShiftCheckBoxColumn
          value={value}
          row={row}
          date={columanDates[1]}
          originalMahcineShiftData={originalMahcineShiftData}
          updateShiftsData={updateShiftsData}
          setUpdateShiftsData={setUpdateShiftsData}
          machineShiftsData={machineShiftsData}
          setMachineShiftsData={setMachineShiftsData}
          operatorList={operatorList}
        />
      ),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[1]).format("dddd"))}</p>
          <p>{moment(columanDates[1]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[2]).format("dddd"),
      accessor: columanDates[2],
      Cell: ({ value, row }) => (
        <ShiftCheckBoxColumn
          value={value}
          row={row}
          date={columanDates[2]}
          originalMahcineShiftData={originalMahcineShiftData}
          updateShiftsData={updateShiftsData}
          setUpdateShiftsData={setUpdateShiftsData}
          machineShiftsData={machineShiftsData}
          setMachineShiftsData={setMachineShiftsData}
          operatorList={operatorList}
        />
      ),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[2]).format("dddd"))}</p>
          <p>{moment(columanDates[2]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[3]).format("dddd"),
      accessor: columanDates[3],
      Cell: ({ value, row }) => (
        <ShiftCheckBoxColumn
          value={value}
          row={row}
          date={columanDates[3]}
          originalMahcineShiftData={originalMahcineShiftData}
          updateShiftsData={updateShiftsData}
          setUpdateShiftsData={setUpdateShiftsData}
          machineShiftsData={machineShiftsData}
          setMachineShiftsData={setMachineShiftsData}
          operatorList={operatorList}
        />
      ),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[3]).format("dddd"))}</p>
          <p>{moment(columanDates[3]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[4]).format("dddd"),
      accessor: columanDates[4],
      Cell: ({ value, row }) => (
        <ShiftCheckBoxColumn
          value={value}
          row={row}
          date={columanDates[4]}
          originalMahcineShiftData={originalMahcineShiftData}
          updateShiftsData={updateShiftsData}
          setUpdateShiftsData={setUpdateShiftsData}
          machineShiftsData={machineShiftsData}
          setMachineShiftsData={setMachineShiftsData}
          operatorList={operatorList}
        />
      ),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[4]).format("dddd"))}</p>
          <p>{moment(columanDates[4]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[5]).format("dddd"),
      accessor: columanDates[5],
      Cell: ({ value, row }) => (
        <ShiftCheckBoxColumn
          value={value}
          row={row}
          date={columanDates[5]}
          originalMahcineShiftData={originalMahcineShiftData}
          updateShiftsData={updateShiftsData}
          setUpdateShiftsData={setUpdateShiftsData}
          machineShiftsData={machineShiftsData}
          setMachineShiftsData={setMachineShiftsData}
          operatorList={operatorList}
        />
      ),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[5]).format("dddd"))}</p>
          <p>{moment(columanDates[5]).format("DD-MM-YYYY")}</p>
        </Box>
      )
    },
    {
      Header: moment(columanDates[6]).format("dddd"),
      accessor: columanDates[6],
      Cell: ({ value, row }) => (
        <ShiftCheckBoxColumn
          value={value}
          row={row}
          date={columanDates[6]}
          originalMahcineShiftData={originalMahcineShiftData}
          updateShiftsData={updateShiftsData}
          setUpdateShiftsData={setUpdateShiftsData}
          machineShiftsData={machineShiftsData}
          setMachineShiftsData={setMachineShiftsData}
          operatorList={operatorList}
        />
      ),
      headerCell: () => (
        <Box flexDirection="column" display="flex" alignItems="center">
          <p>{translate(moment(columanDates[6]).format("dddd"))}</p>
          <p>{moment(columanDates[6]).format("DD-MM-YYYY")}</p>
        </Box>
      )
      // RightArrow: () => (
      //   <KeyboardArrowRightIcon
      //     onClick={(e) => {
      //       e.preventDefault();
      //       e.stopPropagation();
      //       goToNextWeek();
      //     }}
      //     sx={classes.rightArrow}
      //   />
      // )
    }
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container display="flex" alignItems="center" mb={2}>
        <Grid item xs={12} md={5} sm={12} pr={2}>
          <Autocomplete
            value={selectedOptions}
            multiple
            id="grouped-demo"
            options={options?.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter)) || []}
            groupBy={(option) => option.firstLetter}
            getOptionLabel={(option) => option.name}
            disableCloseOnSelect
            limitTags={2}
            renderTags={(value, getTagProps) =>
              selectedOptions.map((option, index) => (
                <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => <TextField {...params} label={translate("Machines")} />}
            renderGroup={(params) => (
              <li key={params.key}>
                <Typography style={{ color: "#FFFFFF" }}>{params.group}</Typography>
                {params.children}
              </li>
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selectedOptions.find((selOpt) => selOpt.id === option.id)}
                />
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    e.stopPropagation();
                  }}
                >
                  {option.name}
                </span>
              </li>
            )}
            onChange={(event, newValue) => {
              const multipleItems = newValue.filter(
                (item) => item.id === newValue[newValue.length - 1].id
              );
              if (multipleItems.length > 1) {
                setSelectedOptions(newValue.filter((item) => item.id !== multipleItems[0].id));
              } else {
                setSelectedOptions(newValue);
              }
            }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={3}
          sm={12}
          pr={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ marginTop: { md: 0, xs: "15px" }, marginBottom: { md: 0, xs: "15px" } }}
        >
          <Tooltip title={translate("Previous Week")}>
            <KeyboardArrowLeftIcon
              onClick={() => {
                setDate(moment(date).subtract(7, "day"));
              }}
              sx={classes.leftArrow}
            />
          </Tooltip>
          <LocalizationProvider dateAdapter={AdapterMoment} localeText="en">
            <WeekPicker value={date} setValue={setDate} />
          </LocalizationProvider>
          <Tooltip title={translate("Next Week")}>
            <KeyboardArrowRightIcon
              onClick={() => {
                setDate(moment(date).add(7, "day"));
              }}
              sx={classes.rightArrow}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12} md={4} sm={12} pr={1}>
          <Grid container spacing={2}>
            <Grid item>
              <MDButton
                id="basic-button"
                onClick={searchMahcineData}
                variant="gradient"
                color="info"
              >
                {translate("Search")}
              </MDButton>
            </Grid>
            <Grid item>
              <MDButton
                id="basic-button"
                onClick={clearUpdateShiftDataHandler}
                variant="gradient"
                color="warning"
              >
                {translate("Reset")}
              </MDButton>
            </Grid>
            <Grid item>
              <MDButton
                id="basic-button"
                onClick={handleUpdateShiftDataClick}
                variant="gradient"
                color="info"
              >
                {translate("Save")}
              </MDButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {isFetching || isLoading ? (
        <Skeleton width="100%" height={600} sx={classes.skeleton} />
      ) : (
        machineShiftsData?.length > 0 && (
          <MachineShiftTable
            columns={columns}
            rows={
              selectedOptions?.length
                ? machineShiftsData.filter((machine) =>
                    selectedOptions.find((selOpt) => selOpt.id === +machine.machineId)
                  )
                : machineShiftsData
            }
          />
        )
      )}
    </DashboardLayout>
  );
}

export default MachineShifts;
