import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Transaction from "layouts/pages/account/billing/components/Transaction";
import { getCompanyRankApi } from "api/watchmenApi";
import { useMutation, useQuery } from "react-query";
import { enumQueryNames } from "api/reactQueryConstant";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import {
  AppBar,
  Button,
  CardContent,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  Tab,
  Tabs,
  TextField
} from "@mui/material";
import MDAvatar from "components/MDAvatar";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Stack, ThemeProvider } from "@mui/system";
import moment from "moment";
import monthsList from "utils/months";
import { useEffect, useState } from "react";
import { calenderDarkTheme } from "layouts/dashboards/machineShifts/rangepicker";
import { convertHMS } from "utils/constants";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import translate from "i18n/translate";
import colors from "assets/theme-dark/base/colors";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import CountUp from "react-countup";

function Leaderboard() {
  const { axiosPrivate } = useAxiosPrivate();
  const [selectedMonth, setSelectedMonth] = useState();
  const [startDate, setStartDate] = useState(moment());
  const [filterError, setFilterError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [filterData, setFilterData] = useState({
    reverse: [],
    more: []
  });
  const {
    data: companyRank,
    isLoading: isFetching,
    mutate: fetchCompanyRank
  } = useMutation([enumQueryNames.COMPANY_RANK], (formData) =>
    getCompanyRankApi(axiosPrivate, formData)
  );

  useEffect(() => {
    fetchCompanyRank({
      group_by: tabValue === 1 ? "shift" : "day",
      start_date: moment().subtract(31, "day").format("YYYY-MM-DD"),
      end_date: moment().subtract(1, "day").format("YYYY-MM-DD")
    });
  }, [tabValue]);
  useEffect(() => {
    if (selectedMonth) {
      if (
        moment(selectedMonth, "M").month() === moment().month() &&
        moment(selectedMonth).year() === moment().year()
      ) {
        fetchCompanyRank({
          group_by: tabValue === 1 ? "shift" : "day",
          start_date: moment(selectedMonth, "M").startOf("month").format("YYYY-MM-DD"),
          end_date: moment().subtract(1, "day").format("YYYY-MM-DD")
        });
      } else {
        fetchCompanyRank({
          group_by: tabValue === 1 ? "shift" : "day",
          start_date: moment(selectedMonth, "M").startOf("month").format("YYYY-MM-DD"),
          end_date: moment(selectedMonth, "M").endOf("month").format("YYYY-MM-DD")
        });
      }
    }
  }, [selectedMonth]);
  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox sx={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <Grid item spacing={3} display="flex" justifyContent="center" alignItems="center">
          <AppBar position="static">
            <Tabs
              orientation="horizontal"
              value={tabValue}
              onChange={handleSetTabValue}
              TabIndicatorProps={{
                style: {
                  backgroundColor: colors.info.main
                }
              }}
            >
              <Tab label={translate("All Day")} key={0} sx={{ padding: "5px 14px" }} />
              <Tab label={translate("Planned")} key={1} sx={{ padding: "5px 14px" }} />
            </Tabs>
          </AppBar>
        </Grid>
        <ThemeProvider theme={calenderDarkTheme}>
          <LocalizationProvider dateAdapter={AdapterMoment} localeText="en">
            <DesktopDatePicker
              label={translate("Select date")}
              value={startDate}
              onChange={(date) => {
                setFilterError("");
                setSelectedMonth(date?._d);
                // eslint-disable-next-line no-underscore-dangle
              }}
              sx={{
                svg: { color: "#ffffff" }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{
                    svg: { color: "#ffffff" }
                  }}
                />
              )}
              disableFuture
              views={["year", "month"]}
              minDate={moment().subtract(1, "year").endOf("month")}
              maxDate={moment()}
              inputFormat="MM"
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
      </MDBox>
      {isFetching ? (
        <Skeleton height={200} width="100%" />
      ) : (
        <MDBox
          sx={{
            justifyContent: "center",
            display: "flex",
            alignItems: "starch",
            marginBottom: "24px",
            marginTop: "40px"
          }}
        >
          <Card
            sx={{
              height: "100%",
              padding: "0px 12px",
              width: "50%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#3078AB"
            }}
          >
            <MDAvatar
              bgColor="info"
              sx={{
                position: "relative",
                top: "-24px",
                background: "#3078AB",
                borderColor: "white",
                borderStyle: "solid",
                borderWidth: "1px"
              }}
            >
              <MilitaryTechIcon fontSize="large" />
            </MDAvatar>
            <MDTypography>{translate("OEE Rank")}</MDTypography>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              mt={1}
              sx={{ marginBottom: "40px", minHeight: "120px" }}
            >
              <MDBox
                sx={{
                  display: "flex",
                  width: "30%",
                  justifyContent: "center"
                }}
              >
                <MDTypography variant="h1" fontWeight="regular">
                  <CountUp end={companyRank?.oee_rank_category?.rank} />
                </MDTypography>
                <MDTypography variant="h5" sx={{ marginLeft: "6px" }}>
                  th
                </MDTypography>
              </MDBox>
              <Stack
                sx={{
                  display: "flex",
                  width: "70%",
                  justifyContent: "center"
                }}
              >
                <MDTypography variant="caption" fontWeight="bold">
                  Name :
                  <MDTypography variant="button" sx={{ marginLeft: "6px" }}>
                    {companyRank?.oee_rank_category?.name}{" "}
                  </MDTypography>
                </MDTypography>
                <MDTypography variant="caption" fontWeight="bold">
                  Focus :
                  <MDTypography variant="button" sx={{ marginLeft: "6px" }}>
                    {companyRank?.oee_rank_category?.focus}{" "}
                  </MDTypography>
                </MDTypography>
                <MDTypography variant="caption" fontWeight="bold">
                  Characteristics :
                  <MDTypography variant="button" sx={{ marginLeft: "6px" }}>
                    {companyRank?.oee_rank_category?.characteristics}{" "}
                  </MDTypography>
                </MDTypography>

                <MDTypography variant="caption" fontWeight="bold">
                  Overall Oee :
                  <MDTypography variant="button" sx={{ marginLeft: "6px" }}>
                    {(companyRank?.oee_rank_category?.overall_oee * 100).toFixed(2)}
                    {"%"}
                  </MDTypography>
                </MDTypography>
              </Stack>
            </Stack>
          </Card>
          <Card
            sx={{
              marginLeft: "22px",
              height: "100%",
              padding: "0px 12px",
              width: "50%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#ff9700"
            }}
          >
            <MDAvatar
              bgColor="info"
              sx={{
                position: "relative",
                top: "-24px",
                background: "#ff9700",
                borderColor: "white",
                borderStyle: "solid",
                borderWidth: "1px"
              }}
            >
              <MilitaryTechIcon fontSize="large" />
            </MDAvatar>
            <MDTypography> {translate("Performance Rank")}</MDTypography>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              mt={1}
              sx={{ marginBottom: "40px", minHeight: "120px" }}
            >
              <MDBox
                sx={{
                  display: "flex",
                  width: "30%",
                  justifyContent: "center"
                }}
              >
                <MDTypography variant="h1" fontWeight="regular">
                  <CountUp end={companyRank?.performance_rank_category?.rank} />
                </MDTypography>
                <MDTypography variant="h5" sx={{ marginLeft: "6px" }}>
                  th
                </MDTypography>
              </MDBox>
              <Stack
                sx={{
                  display: "flex",
                  width: "70%",
                  justifyContent: "center"
                }}
              >
                <MDTypography variant="caption" fontWeight="bold">
                  Name :
                  <MDTypography variant="button" sx={{ marginLeft: "6px" }}>
                    {companyRank?.performance_rank_category?.name}{" "}
                  </MDTypography>
                </MDTypography>
                <MDTypography variant="caption" fontWeight="bold">
                  Focus :
                  <MDTypography variant="button" sx={{ marginLeft: "6px" }}>
                    {companyRank?.performance_rank_category?.focus}{" "}
                  </MDTypography>
                </MDTypography>
                <MDTypography variant="caption" fontWeight="bold">
                  Characteristics :
                  <MDTypography variant="button" sx={{ marginLeft: "6px" }}>
                    {companyRank?.performance_rank_category?.characteristics}{" "}
                  </MDTypography>
                </MDTypography>

                <MDTypography variant="caption" fontWeight="bold">
                  Overall Performance :
                  <MDTypography variant="button" sx={{ marginLeft: "6px" }}>
                    {(companyRank?.performance_rank_category?.overall_performance * 100).toFixed(2)}
                    {"%"}
                  </MDTypography>
                </MDTypography>
              </Stack>
            </Stack>
          </Card>
        </MDBox>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ marginBottom: "12px" }}>
            {isFetching ? (
              <Skeleton height={400} width="100%" />
            ) : (
              <>
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pt={3}
                  px={2}
                >
                  <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                    {translate("Top OEE Machines")}
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} pb={2} px={2}>
                  <MDBox
                    component="ul"
                    display="flex"
                    flexDirection="column"
                    p={0}
                    m={0}
                    sx={{ listStyle: "none", height: "310px", overflowY: "auto" }}
                  >
                    {companyRank?.oee_machine_list
                      ?.slice(
                        0,
                        filterData?.more.includes("oee") ? companyRank?.oee_machine_list?.length : 5
                      )
                      ?.map((machine) => (
                        <Transaction
                          color="success"
                          icon="expand_less"
                          name={machine?.machine_name}
                          description=""
                          direction
                          tooltipTitle={`Compared to last month's ${(
                            (machine?.oee_previous || 0) * 100
                          ).toFixed(2)}%`}
                          originalValue={machine.oee}
                          value={machine.oee ? `${(machine.oee * 100).toFixed(2)}%` : `0%`}
                          value1={machine?.oee_previous}
                        />
                      ))}
                  </MDBox>
                </MDBox>
                {companyRank?.oee_machine_list?.length > 5 && (
                  <MDBox display="flex" justifyContent="flex-end" alignItems="center" pb={3} pr={2}>
                    <Button
                      sx={{ pr: 2 }}
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.reverse.filter((item) => item !== "oee")]
                        })
                      }
                    >
                      {translate("Load Less")}
                    </Button>
                    <Button
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.more, "oee"]
                        })
                      }
                    >
                      {translate("Load More")}
                    </Button>
                  </MDBox>
                )}
              </>
            )}
          </Card>
          <Card sx={{ marginBottom: "12px" }}>
            {isFetching ? (
              <Skeleton height={400} width="100%" />
            ) : (
              <>
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pt={3}
                  px={2}
                >
                  <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                    {translate("Top Performance Machines")}
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} pb={2} px={2}>
                  <MDBox
                    component="ul"
                    display="flex"
                    flexDirection="column"
                    p={0}
                    m={0}
                    sx={{ listStyle: "none", height: "310px", overflowY: "auto" }}
                  >
                    {companyRank?.performance_machine_list
                      ?.slice(
                        0,
                        filterData?.more.includes("performance")
                          ? companyRank?.performance_machine_list?.length
                          : 5
                      )
                      ?.map((performance) => (
                        <Transaction
                          color="success"
                          icon="expand_less"
                          name={performance?.machine_name}
                          description=""
                          direction
                          tooltipTitle={`Compared to last month's ${(
                            (performance?.performance_previous || 0) * 100
                          ).toFixed(2)}%`}
                          originalValue={performance?.performance}
                          value={
                            performance.performance
                              ? `${(performance.performance * 100).toFixed(2)}%`
                              : `0%`
                          }
                          value1={performance?.performance_previous}
                        />
                      ))}
                  </MDBox>
                </MDBox>
                {companyRank?.performance_machine_list?.length > 5 && (
                  <MDBox display="flex" justifyContent="flex-end" alignItems="center" pb={3} pr={2}>
                    <Button
                      sx={{ pr: 2 }}
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.reverse.filter((item) => item !== "performance")]
                        })
                      }
                    >
                      {translate("Load Less")}
                    </Button>
                    <Button
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.more, "performance"]
                        })
                      }
                    >
                      {translate("Load More")}
                    </Button>
                  </MDBox>
                )}
              </>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ marginBottom: "12px" }}>
            {isFetching ? (
              <Skeleton height={400} width="100%" />
            ) : (
              <>
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pt={3}
                  px={2}
                >
                  <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                    {translate("Top Energy Consumption")}
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} pb={2} px={2}>
                  <MDBox
                    component="ul"
                    display="flex"
                    flexDirection="column"
                    p={0}
                    m={0}
                    sx={{ listStyle: "none", height: "310px", overflowY: "auto" }}
                  >
                    {companyRank?.energy_consumption_machine_list
                      ?.slice(
                        0,
                        filterData?.more.includes("energy_consumption")
                          ? companyRank?.energy_consumption_machine_list?.length
                          : 5
                      )
                      ?.map((machine) => (
                        <Transaction
                          color="success"
                          icon="expand_less"
                          name={machine?.machine_name}
                          description=""
                          tooltipTitle={`Compared to last month's ${machine?.energy_consumption_previous}kWh`}
                          originalValue={machine?.energy_consumption}
                          value={`${machine?.energy_consumption}kWh`}
                          value1={machine?.energy_consumption_previous}
                        />
                      ))}
                  </MDBox>
                </MDBox>
                {companyRank?.energy_consumption_machine_list?.length > 5 && (
                  <MDBox display="flex" justifyContent="flex-end" alignItems="center" pb={3} pr={2}>
                    <Button
                      sx={{ pr: 2 }}
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [
                            ...filterData.reverse.filter((item) => item !== "energy_consumption")
                          ]
                        })
                      }
                    >
                      {translate("Load Less")}
                    </Button>
                    <Button
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.more, "energy_consumption"]
                        })
                      }
                    >
                      {translate("Load More")}
                    </Button>
                  </MDBox>
                )}
              </>
            )}
          </Card>
          <Card>
            {isFetching ? (
              <Skeleton height={400} width="100%" />
            ) : (
              <>
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pt={3}
                  px={2}
                >
                  <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                    {translate("Top Energy Wastage")}
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} pb={2} px={2}>
                  <MDBox
                    component="ul"
                    display="flex"
                    flexDirection="column"
                    p={0}
                    m={0}
                    sx={{ listStyle: "none", height: "310px", overflowY: "auto" }}
                  >
                    {companyRank?.energy_wastage_machine_list
                      ?.slice(
                        0,
                        filterData?.more.includes("energy_wastage")
                          ? companyRank?.energy_wastage_machine_list?.length
                          : 5
                      )
                      ?.map((machine) => (
                        <Transaction
                          color="success"
                          icon="expand_less"
                          name={machine?.machine_name}
                          description=""
                          tooltipTitle={`Compared to last month's ${machine?.energy_wastage_previous}kWh`}
                          originalValue={machine?.energy_wastage}
                          value={`${machine?.energy_wastage}kWh`}
                          value1={machine?.energy_wastage_previous}
                        />
                      ))}
                  </MDBox>
                </MDBox>
                {companyRank?.energy_wastage_machine_list?.length > 5 && (
                  <MDBox display="flex" justifyContent="flex-end" alignItems="center" pb={3} pr={2}>
                    <Button
                      sx={{ pr: 2 }}
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.reverse.filter((item) => item !== "energy_wastage")]
                        })
                      }
                    >
                      {translate("Load Less")}
                    </Button>
                    <Button
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.more, "energy_wastage"]
                        })
                      }
                    >
                      {translate("Load More")}
                    </Button>
                  </MDBox>
                )}
              </>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            {isFetching ? (
              <Skeleton height={400} width="100%" />
            ) : (
              <>
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pt={3}
                  px={2}
                >
                  <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                    {translate("Top OEE Operators")}
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} pb={2} px={2}>
                  <MDBox
                    component="ul"
                    display="flex"
                    flexDirection="column"
                    p={0}
                    m={0}
                    sx={{ listStyle: "none", height: "310px", overflowY: "auto" }}
                  >
                    {companyRank?.oee_operators_list
                      ?.slice(
                        0,
                        filterData?.more.includes("oee_operators")
                          ? companyRank?.oee_operators_list?.length
                          : 5
                      )
                      ?.map((machine) => (
                        <Transaction
                          color="success"
                          icon="expand_less"
                          name={machine?.operator_name}
                          description=""
                          direction
                          // tooltipTitle={`Compare by ${machine?.oee}and${machine?.operator_previous}`}
                          originalValue={machine.oee}
                          value={machine.oee ? `${(machine.oee * 100).toFixed(2)}%` : `0%`}
                          // value1={machine?.operator_previous}
                        />
                      ))}
                  </MDBox>
                </MDBox>
                {companyRank?.oee_operators_list?.length > 5 && (
                  <MDBox display="flex" justifyContent="flex-end" alignItems="center" pb={3} pr={2}>
                    <Button
                      sx={{ pr: 2 }}
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.more.filter((item) => item !== "oee_operators")]
                        })
                      }
                    >
                      {translate("Load Less")}
                    </Button>
                    <Button
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.more, "oee_operators"]
                        })
                      }
                    >
                      {translate("Load More")}
                    </Button>
                  </MDBox>
                )}
              </>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            {isFetching ? (
              <Skeleton height={400} width="100%" />
            ) : (
              <>
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pt={3}
                  px={2}
                >
                  <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
                    {translate("Top Performance Operators")}
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} pb={2} px={2}>
                  <MDBox
                    component="ul"
                    display="flex"
                    flexDirection="column"
                    p={0}
                    m={0}
                    sx={{ listStyle: "none", height: "310px", overflowY: "auto" }}
                  >
                    {companyRank?.performance_operators_list
                      ?.slice(
                        0,
                        filterData?.more.includes("performance_operators")
                          ? companyRank?.performance_operators_list?.length
                          : 5
                      )
                      ?.map((machine) => (
                        <Transaction
                          color="success"
                          icon="expand_less"
                          name={machine?.operator_name}
                          description=""
                          direction
                          // tooltipTitle={`Compare by ${machine?.oee}and${machine?.operator_previous}`}
                          originalValue={machine.performance}
                          value={
                            machine.performance
                              ? `${(machine.performance * 100).toFixed(2)}%`
                              : `0%`
                          }
                          // value1={machine?.operator_previous}
                        />
                      ))}
                  </MDBox>
                </MDBox>
                {companyRank?.performance_operators_list?.length > 5 && (
                  <MDBox display="flex" justifyContent="flex-end" alignItems="center" pb={3} pr={2}>
                    <Button
                      sx={{ pr: 2 }}
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [
                            ...filterData.more.filter((item) => item !== "performance_operators")
                          ]
                        })
                      }
                    >
                      {translate("Load Less")}
                    </Button>
                    <Button
                      onClick={() =>
                        setFilterData({
                          ...filterData,
                          more: [...filterData.more, "performance_operators"]
                        })
                      }
                    >
                      {translate("Load More")}
                    </Button>
                  </MDBox>
                )}
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default Leaderboard;
