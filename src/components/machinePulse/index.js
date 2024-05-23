/* eslint-disable no-underscore-dangle */
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Grid, Skeleton, TextField } from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import colors from "assets/theme-dark/base/colors";
import Footer from "components/Footer";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import moment from "moment";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import ExternalData from "../externalData";
import PlotlyChart from "../graph";
import { calenderDarkTheme } from "layouts/dashboards/machineShifts/rangepicker";
import { ThemeProvider } from "@mui/system";

export const useStyle = () => ({
  skeleton: {
    transform: "unset",
    margin: "1% 0"
  },
  leftArror: { marginRight: "12px", cursor: "pointer", color: "#FFFFFF" },
  rightArror: { marginLeft: "12px", cursor: "pointer", color: "#FFFFFF" }
});

moment.updateLocale("en", {
  week: {
    dow: 1
  }
});

function MachinePulse() {
  const { machineId } = useParams();
  const classes = useStyle();
  const { axiosPrivate } = useAxiosPrivate();
  const location = useLocation();
  const [machineStatusV4Data, setMachineStatusV4Data] = useState();
  const [externDataColumns, setExternalDataColumns] = useState([]);
  const [externDataRows, setExternDataRows] = useState([]);
  const [startDate, setStartDate] = useState(moment().subtract(1, "day"));
  const [loading, setLoading] = useState(false);

  const fetchMachineStatus = async () => {
    try {
      setLoading(true);
      const body = {
        date: moment(startDate).format("YYYY-MM-DD"),
        machine_id: Number(machineId)
      };
      const response = await axiosPrivate.post(`/v4/machine/status`, body);
      location.state = {
        ...location.state,
        machineName: response.data.day_data.machine_name
      };
      setExternalDataColumns(
        response?.data?.extern_data?.columns?.length
          ? response?.data?.extern_data?.columns.map((columnId) => ({
            Header: columnId,
            accessor: columnId
          }))
          : []
      );
      setExternDataRows(
        response?.data?.extern_data?.data?.length
          ? response?.data?.extern_data?.data.map((data) =>
            response?.data?.extern_data?.columns.reduce((obj, key, index) => {
              obj[key] = data[index]; // Set initial value as empty string, or you can set it to any default value
              return obj;
            }, {})
          )
          : []
      );
      setMachineStatusV4Data(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    if (startDate) fetchMachineStatus();
  }, [startDate]);
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container justifyContent="space-between" mb={5}>
        <MDBox
          sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}
          textAlign="center"
        >
          <KeyboardArrowLeftIcon
            onClick={() => {
              setStartDate(moment(startDate).subtract(1, "day"));
            }}
            sx={classes.leftArror}
          />
          <ThemeProvider theme={calenderDarkTheme}>
            <LocalizationProvider dateAdapter={AdapterMoment} localeText="en">
              <DesktopDatePicker
                label={translate("Select date")}
                format="DD/MM/YYYY"
                value={startDate}
                onChange={(date) => {
                  setStartDate(moment(date?._d));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      svg: { color: "#ffffff" }
                    }}
                  />
                )}
                maxDate={new Date()}
                componentsProps={{
                  actionBar: {
                    actions: ["clear"]
                  }
                }}
                PaperProps={{
                  sx: {
                    "& .Mui-selected": {
                      backgroundColor: `${colors.info.main} !important`
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </ThemeProvider>
          <KeyboardArrowRightIcon
            onClick={() => {
              if (moment(startDate).isSame(new Date(), "day")) return;
              setStartDate(moment(startDate).add(1, "day"));
            }}
            sx={classes.rightArror}
          />
        </MDBox>
      </Grid>
      {machineStatusV4Data && !loading ? (
        <PlotlyChart
          pulse={machineStatusV4Data?.pulse?.data}
          showTimeline={false}
          showPulseMovement
          date={startDate}
          selectPulsePoints
        />
      ) : (
        <Skeleton height={300} width="100%" sx={classes.skeleton} />
      )}
      {machineStatusV4Data && !loading ? (
        <ExternalData externDataColumns={externDataColumns} externDataRows={externDataRows} />
      ) : (
        <Skeleton height={150} width="100%" sx={classes.skeleton} />
      )}
    </DashboardLayout>
  );
}

export default MachinePulse;
