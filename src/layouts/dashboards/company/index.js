/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { AppBar, Grid, Icon, Tab, Tabs, Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/system";
import { enumQueryNames } from "api/reactQueryConstant";
import {
  analyticsDayCumulative,
  analyticsMonthCumulative,
  analyticsWeekCumulative,
  getCompanyApi,
  updateCompanyDetailsApi,
  uploadCompanyImageApi
} from "api/watchmenApi";
import NovoAiLogo from "assets/images/NovoAI.png";
import colors from "assets/theme-dark/base/colors";
import ProfileInfoCard from "components/Cards/InfoCards/ProfileInfoCard";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import Loader from "components/Loader";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { calculateTotal } from "utils";
import EnergyOverView from "./EnergyOverview";
import GraphView from "./GraphView";
import RealTimeOverview from "./RealTimeOverview";
import SustainabilityOverview from "./SustainabilityOverview";
import TimeOverview from "./TimeOverview";

const { EnergyConsumption, EnergyWastage, OEE, Availability, Productivity, RunTime } = colors;
export const useStyle = () => {
  const theme = useTheme();
  return {
    headerText: {
      color: "green",
      [theme.breakpoints.down("sm")]: {
        color: "orange"
      }
    },
    addButton: {
      marginTop: "2.5%",
      marginLeft: "2%",
      paddingLeft: "12%",
      paddingRight: "12%",
      marginBottom: "1.5%",
      [theme.breakpoints.down("lg")]: {
        marginLeft: "4%",
        marginTop: "3.2%",
        marginBottom: "2%"
      },
      [theme.breakpoints.down("md")]: {
        marginLeft: "4%",
        marginTop: "4.2%",
        marginBottom: "3%"
      }
    },
    cardIdleTime: {
      color: theme.palette.common.white,
      padding: "0 12px"
    },
    cardOffTime: {
      color: theme.palette.common.white,
      padding: "0 12px"
    },
    cardProductionTime: {
      color: theme.palette.common.white,
      border: "10px",
      padding: "0 12px"
    },
    cardTotalTime: {
      backgroundColor: theme.palette.info.main,
      color: "green"
    },
    skeleton: {
      transform: "unset",
      margin: "1% 0"
    },
    leftArror: { marginRight: "12px", cursor: "pointer", color: "#FFFFFF" },
    rightArror: { marginLeft: "12px", cursor: "pointer", color: "#FFFFFF" }
  };
};
const index = () => {
  const [companyDetails, setCompanyDetails] = useState({
    title: "",
    description: "",
    logo: null,
    timezone: { label: "UTC", value: "UTC" },
    addressline1: "",
    addressline2: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    hourly_revenue: 0,
    cost_per_hour: 0,
    currency: { label: "US Dollar - $", value: "USD", symbol: "$" },
    plant_area: 0, // area of the plant in sq.mts
    waste_percentage: 0, // percentage 0-100
    coolant_output: 0, // in lts.
    renewable_energy_usage: 0, // percentage 0-100
    transport_efficiency: 0, // percentage 0-100
    material_efficiency: 0 // percentage 0-100
  });
  const [consumptionTotal, setConsumptioTotal] = useState({
    today: {},
    week: {},
    month: {}
  });
  const [filter, setFilter] = useState("today");
  const [tabValue, setTabValue] = useState(0);
  const [tabShiftValue, setTabShiftValue] = useState(1);
  const [dateRangePickerChange, setDateRangePickerChange] = useState(false);
  const [dayCummulative, setDayCummulative] = useState([]);
  const [monthCummulative, setMonthCummulative] = useState([]);
  const [weekCummulative, setWeekCummulative] = useState([]);
  const [co2EmissionsOptions, setCo2EmissionsOptions] = useState();
  const [oeeOption, setOeeOption] = useState();
  const [plantEnergyOption, setPlantEnergyOption] = useState();
  const [show, setShow] = useState(false);
  const [startDate, setStartDate] = useState(
    tabValue === 0
      ? moment().subtract(1, "month")
      : tabValue === 1
      ? moment().subtract(2, "month").startOf("week")
      : moment().subtract(4, "month").startOf("month")
  );
  const [endDate, setEndDate] = useState(moment().subtract(1, "day"));
  const [logo, setLogo] = useState();
  const [error, setError] = useState();
  const { axiosPrivate } = useAxiosPrivate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const inputFile = useRef(null);
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("md"));

  const classes = useStyle();
  useQuery([enumQueryNames.COMPANY_DETAILS], () => getCompanyApi(axiosPrivate), {
    onSuccess: (currentCompany) => {
      setLogo(currentCompany?.company_data?.meta_frontend?.logo_path || null);
      setCompanyDetails({
        ...companyDetails,
        title: currentCompany.company_data.name,
        description: currentCompany.company_data.meta_frontend?.description || "-",
        logo: currentCompany?.company_data?.meta_frontend?.logo_path || null,
        timezone: currentCompany.company_data.meta_frontend?.timezone || {
          label: "UTC",
          value: "UTC"
        },
        currency: currentCompany.company_data.meta_frontend?.currency || {
          label: "US Dollar - $",
          value: "USD",
          symbol: "$"
        },
        addressline1: currentCompany.company_data.meta_frontend?.addressline1 || "-",
        addressline2: currentCompany.company_data.meta_frontend?.addressline2 || "-",
        city: currentCompany.company_data.meta_frontend?.city || "-",
        state: currentCompany.company_data.meta_frontend?.state || "-",
        country: currentCompany.company_data.meta_frontend?.country || "-",
        zipcode: currentCompany.company_data.meta_frontend?.zipcode || "-",
        hourly_revenue: currentCompany.company_data.meta_frontend?.hourly_revenue || "0",
        cost_per_hour: currentCompany.company_data.meta_frontend?.cost_per_hour || "0",
        ...currentCompany?.company_data?.sustainability_check
      });
    }
  });

  const { isLoading, refetch: refetchDayCummulative } = useQuery(
    [enumQueryNames.ANALYTICS_DAY_CUMULATIVE],
    () =>
      analyticsDayCumulative(axiosPrivate, {
        start_date: startDate.format("YYYY-MM-DD"),
        end_date: endDate.format("YYYY-MM-DD"),
        group_by: tabShiftValue === 1 ? "shift" : "day"
      }),
    {
      onSuccess: (analytics) => {
        setDayCummulative(analytics);
        const total = calculateTotal(analytics.day_cumulative, tabShiftValue !== 1);
        setConsumptioTotal(total);
      }
    }
  );

  const { refetch: refetchWeekCummulative } = useQuery(
    [enumQueryNames.ANALYTICS_WEEK_CUMULATIVE],
    () =>
      analyticsWeekCumulative(axiosPrivate, {
        start_date: startDate.format("YYYY-MM-DD"),
        end_date: endDate.format("YYYY-MM-DD"),
        group_by: tabShiftValue === 1 ? "shift" : "day"
      }),
    {
      onSuccess: (data) => {
        setWeekCummulative(data);
      }
    }
  );

  const { refetch: refetchMonthCummulative } = useQuery(
    [enumQueryNames.ANALYTICS_MONTH_CUMULATIVE],
    () =>
      analyticsMonthCumulative(axiosPrivate, {
        start_date: startDate.format("YYYY-MM-DD"),
        end_date: endDate.format("YYYY-MM-DD"),
        group_by: tabShiftValue === 1 ? "shift" : "day"
      }),
    {
      onSuccess: (data) => {
        setMonthCummulative(data);
      }
    }
  );
  const { mutate: updateCompany } = useMutation((formData) =>
    updateCompanyDetailsApi(axiosPrivate, formData)
  );

  useEffect(() => {
    if (startDate && endDate) {
      if (tabValue === 0) {
        setDayCummulative();
        setOeeOption();
        setPlantEnergyOption();
        setCo2EmissionsOptions();
        refetchDayCummulative();
      } else if (tabValue === 1) {
        setWeekCummulative();
        setOeeOption();
        setPlantEnergyOption();
        setCo2EmissionsOptions();
        setTimeout(() => {
          refetchWeekCummulative();
        }, 1000);
      } else if (tabValue === 2) {
        setMonthCummulative();
        setOeeOption();
        setPlantEnergyOption();
        setCo2EmissionsOptions();
        setTimeout(() => {
          refetchMonthCummulative();
        }, 1000);
      }
    }
  }, [startDate, endDate, tabValue, tabShiftValue, filter]);

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSetFilterValue = (event, newValue) => {
    setTabValue(0);
    setFilter(newValue);
  };

  const updateCompanyHandler = (imageLogo = companyDetails?.logo || logo) => {
    if (companyDetails?.waste_percentage > 100) {
      setError("Waste percentage is more than 100! ");
      return;
    }
    if (companyDetails?.renewable_energy_usage > 100) {
      setError("Renewable Energy Usage is more than 100! ");
      return;
    }
    if (companyDetails?.transport_efficiency > 100) {
      setError("Transport Efficiency is more than 100! ");
      return;
    }
    if (companyDetails?.material_efficiency > 100) {
      setError("Material efficiency is more than 100! ");
      return;
    }
    if (
      companyDetails?.transport_efficiency < 101 &&
      companyDetails?.transport_efficiency < 101 &&
      companyDetails?.renewable_energy_usage < 101 &&
      companyDetails?.waste_percentage < 101
    ) {
      const updatePayload = {
        name: companyDetails.title || "",
        active: true,
        meta_frontend: {
          logo_path: imageLogo || "",
          description: companyDetails?.description || "",
          addressline1: companyDetails?.addressline1 || "",
          addressline2: companyDetails?.addressline2 || "",
          city: companyDetails?.city || "",
          state: companyDetails?.state || "",
          country: companyDetails?.country || "",
          zipcode: companyDetails?.zipcode || "",
          hourly_revenue: companyDetails?.hourly_revenue || "0",
          cost_per_hour: companyDetails?.cost_per_hour || "0",
          timezone: companyDetails?.timezone || "",
          currency: companyDetails?.currency || ""
        },
        sustainability_check: {
          plant_area: parseInt(companyDetails?.plant_area, 10) || 0, // area of the plant in sq.mts
          waste_percentage: parseInt(companyDetails?.waste_percentage, 10) || 0, // percentage 0-100
          coolant_output: parseInt(companyDetails?.coolant_output, 10) || 0, // in lts.
          renewable_energy_usage: parseInt(companyDetails?.renewable_energy_usage, 10) || 0, // percentage 0-100
          transport_efficiency: parseInt(companyDetails?.transport_efficiency, 10) || 0, // percentage 0-100
          material_efficiency: parseInt(companyDetails?.material_efficiency, 10) || 0 // percentage 0-100
        }
      };
      updateCompany(updatePayload);
    }
  };
  const { mutate: uploadCompanyLogo } = useMutation(
    (formData) => uploadCompanyImageApi(axiosPrivate, formData),
    {
      onSuccess: (data) => {
        setLogo(data?.logo_path?.toString());
        setCompanyDetails({
          ...companyDetails,
          logo: data?.logo_path?.toString()
        });
        setError();
        updateCompanyHandler(data?.logo_path);
      }
    }
  );
  const handleUpload = (imageLogo) => {
    if (
      imageLogo &&
      (imageLogo?.type?.includes("png") ||
        imageLogo?.type?.includes("jpeg") ||
        imageLogo?.type?.includes("jpg"))
    ) {
      setError();
      const formData = new FormData();
      formData.append("file", imageLogo);
      uploadCompanyLogo(formData);
    } else {
      setError("Please upload image file.");
    }
  };

  const OEEGraphData = () => {
    let oeeTemp = [];
    let availabilityTemp = [];
    let performanceTemp = [];
    if (tabValue === 0) {
      oeeTemp = dateRangePickerChange
        ? Object.values(dayCummulative?.day_cumulative || {}).map(
            (data) => (data?.overall?.oee || 0) * 100
          )
        : Object.values(dayCummulative?.day_cumulative || {})
            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
            .map((data) => (data?.overall?.oee || 0) * 100);
      availabilityTemp = dateRangePickerChange
        ? Object.values(dayCummulative?.day_cumulative || {}).map(
            (data) => (data?.overall?.availability || 0) * 100
          )
        : Object.values(dayCummulative?.day_cumulative || {})
            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
            .map((data) => (data?.overall?.availability || 0) * 100);
      performanceTemp = dateRangePickerChange
        ? Object.values(dayCummulative?.day_cumulative || {}).map(
            (data) => (data?.overall?.performance || 0) * 100
          )
        : Object.values(dayCummulative?.day_cumulative || {})
            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
            .map((data) => (data?.overall?.performance || 0) * 100);
    } else if (tabValue === 1) {
      oeeTemp = Object.values(weekCummulative?.week_cumulative || {}).map(
        (data) => (data?.overall?.oee || 0) * 100
      );
      availabilityTemp = Object.values(weekCummulative?.week_cumulative || {}).map(
        (data) => (data?.overall?.availability || 0) * 100
      );
      performanceTemp = Object.values(weekCummulative?.week_cumulative || {}).map(
        (data) => (data?.overall?.performance || 0) * 100
      );
    } else {
      oeeTemp = Object.values(monthCummulative?.month_cumulative || {}).map(
        (data) => (data?.overall?.oee || 0) * 100
      );
      availabilityTemp = Object.values(monthCummulative?.month_cumulative || {}).map(
        (data) => (data?.overall?.availability || 0) * 100
      );
      performanceTemp = Object.values(monthCummulative?.month_cumulative || {}).map(
        (data) => (data?.overall?.performance || 0) * 100
      );
    }
    const OeeOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        data: ["Availability", "Performance", "OEE"],
        selected: {
          Availability: false,
          Performance: false,
          OEE: true
        },
        top: 25,
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          data:
            tabValue === 0
              ? dateRangePickerChange
                ? Object.keys(dayCummulative?.day_cumulative || {}) || []
                : Object.keys(dayCummulative?.day_cumulative || {}).slice(
                    filter === "today" ? -1 : filter === "week" ? -7 : -30
                  ) || []
              : tabValue === 1
              ? Object.keys(weekCummulative?.week_cumulative || {})
              : Object.keys(monthCummulative?.month_cumulative || {}),
          axisTick: {
            show: true,
            alignWithLabel: true
          },
          axisLine: {
            show: true // Hide the axis line
          },
          splitLine: {
            show: false // Hide the vertical grid lines
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          axisTick: {
            show: false // Hide the axis tick marks
          },
          axisLine: {
            show: true // Hide the axis line
          },
          splitLine: {
            show: false // Hide the vertical grid lines
          },
          axisLabel: {
            formatter: (value) => `${Math.trunc(value)} %`,
            color: darkMode ? "#ffffffcc" : "#7B809A"
          },
          min: 0
          // max: 100
        }
      ],
      series:
        tabShiftValue === 0
          ? [
              {
                name: "Availability",
                type: "bar",
                barGap: 0,
                emphasis: {
                  focus: "series"
                },
                itemStyle: {
                  color: darkMode ? Availability.dark : Availability.main // change this to the color you want
                },
                data: availabilityTemp || [],
                tooltip: {
                  valueFormatter(value) {
                    return `${Number(value).toFixed(2)}%`;
                  }
                }
              },
              {
                name: "Performance",
                type: "bar",
                barGap: 0,
                emphasis: {
                  focus: "series"
                },
                itemStyle: {
                  color: darkMode ? Productivity.main : Productivity.main // change this to the color you want
                },
                data: performanceTemp || [],
                tooltip: {
                  valueFormatter(value) {
                    return `${Number(value).toFixed(2)}%`;
                  }
                }
              },
              {
                name: "OEE",
                type: "bar",
                tooltip: {
                  valueFormatter(value) {
                    return `${Number(value)?.toFixed(2)}%`;
                  }
                },
                itemStyle: {
                  color: darkMode ? OEE.dark : OEE.main // change this to the color you want
                },
                data: oeeTemp,
                emphasis: {
                  // Show the value label on hover
                  label: {
                    show: true,
                    position: "top", // Customize the position of the label (top, inside, etc.)
                    formatter: "OEE",
                    color: "#FFF"
                  }
                }
              }
            ]
          : dayCummulative &&
            Object.keys(
              dayCummulative?.day_cumulative?.[moment().subtract(1, "day").format("YYYY-MM-DD")]
                ?.overall || {}
            )
              .map((key) => [
                {
                  name: "Availability",
                  type: "bar",
                  barGap: 0,
                  itemStyle: {
                    color: darkMode ? Availability.dark : Availability.main // change this to the color you want
                  },
                  data:
                    tabValue === 0
                      ? dateRangePickerChange
                        ? Object.values(dayCummulative?.day_cumulative || {}).map(
                            (data) => (data?.overall[key]?.availability || 0) * 100
                          )
                        : Object.values(dayCummulative?.day_cumulative || {})
                            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                            .map((data) => (data?.overall[key]?.availability || 0) * 100)
                      : tabValue === 1
                      ? Object.values(weekCummulative?.week_cumulative || {}).map(
                          (data) => (data?.overall[key]?.availability || 0) * 100
                        )
                      : Object.values(monthCummulative?.month_cumulative || {}).map(
                          (data) => (data?.overall[key]?.availability || 0) * 100
                        ),
                  tooltip: {
                    valueFormatter(value) {
                      return `${key} - ${Number(value).toFixed(2)}%`;
                    }
                  },
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: key,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "Performance",
                  type: "bar",
                  barGap: 0,
                  itemStyle: {
                    color: darkMode ? Productivity.main : Productivity.main // change this to the color you want
                  },
                  data:
                    tabValue === 0
                      ? dateRangePickerChange
                        ? Object.values(dayCummulative?.day_cumulative || {}).map(
                            (data) => (data?.overall[key]?.performance || 0) * 100
                          )
                        : Object.values(dayCummulative?.day_cumulative || {})
                            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                            .map((data) => (data?.overall[key]?.performance || 0) * 100)
                      : tabValue === 1
                      ? Object.values(weekCummulative?.week_cumulative || {}).map(
                          (data) => (data?.overall[key]?.performance || 0) * 100
                        )
                      : Object.values(monthCummulative?.month_cumulative || {}).map(
                          (data) => (data?.overall[key]?.performance || 0) * 100
                        ),
                  tooltip: {
                    valueFormatter(value) {
                      return `${key} - ${Number(value).toFixed(2)}%`;
                    }
                  },
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: key,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "OEE",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    valueFormatter(value) {
                      return `${key} - ${Number(value)?.toFixed(2)}%`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? OEE.dark : OEE.main // change this to the color you want
                  },
                  data:
                    tabValue === 0
                      ? dateRangePickerChange
                        ? Object.values(dayCummulative?.day_cumulative || {}).map(
                            (data) => (data?.overall[key]?.oee || 0) * 100
                          )
                        : Object.values(dayCummulative?.day_cumulative || {})
                            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                            .map((data) => (data?.overall[key]?.oee || 0) * 100)
                      : tabValue === 1
                      ? Object.values(weekCummulative?.week_cumulative || {}).map(
                          (data) => (data?.overall[key]?.oee || 0) * 100
                        )
                      : Object.values(monthCummulative?.month_cumulative || {}).map(
                          (data) => (data?.overall[key]?.oee || 0) * 100
                        ),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: key,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    show: false
                  },
                  barWidth: "5%",
                  itemStyle: {
                    color: "#FFFFFF" // change this to the color you want
                  },
                  data:
                    tabValue === 0
                      ? dateRangePickerChange
                        ? Object.values(dayCummulative?.day_cumulative || {}).map(() => 0)
                        : Object.values(dayCummulative?.day_cumulative || {})
                            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                            .map(() => 0)
                      : tabValue === 1
                      ? Object.values(weekCummulative?.week_cumulative || {}).map(() => 0)
                      : Object.values(monthCummulative?.month_cumulative || {}).map(() => 0)
                }
              ])
              .flat()
    };
    setOeeOption(OeeOption);
  };
  const PlantEnergyGraphData = () => {
    let energyConsumptionTemp = [];
    if (tabValue === 0) {
      energyConsumptionTemp = dateRangePickerChange
        ? Object.values(dayCummulative?.day_cumulative || {}).map(
            (data) => data.overall.energy_consumption
          )
        : Object.values(dayCummulative?.day_cumulative || {})
            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
            .map((data) => data.overall.energy_consumption);
    } else if (tabValue === 1) {
      energyConsumptionTemp = Object.values(weekCummulative?.week_cumulative || {}).map(
        (data) => data.overall.energy_consumption
      );
    } else {
      energyConsumptionTemp = Object.values(monthCummulative?.month_cumulative || {}).map(
        (data) => data.overall.energy_consumption
      );
    }

    let energyWastageTemp = [];
    if (tabValue === 0) {
      energyWastageTemp = dateRangePickerChange
        ? Object.values(dayCummulative?.day_cumulative || {}).map(
            (data) => data?.overall?.energy_wastage
          )
        : Object.values(dayCummulative?.day_cumulative || {})
            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
            .map((data) => data?.overall?.energy_wastage);
    } else if (tabValue === 1) {
      energyWastageTemp = Object.values(weekCummulative?.week_cumulative || {}).map(
        (data) => data?.overall?.energy_wastage
      );
    } else {
      energyWastageTemp = Object.values(monthCummulative?.month_cumulative || {}).map(
        (data) => data?.overall?.energy_wastage
      );
    }
    const PlantEnergyOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        data: ["Energy Consumption", "Energy Wastage"],
        top: 25,
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          data:
            tabValue === 0
              ? dateRangePickerChange
                ? Object.keys(dayCummulative?.day_cumulative || {}) || []
                : Object.keys(dayCummulative?.day_cumulative || {}).slice(
                    filter === "today" ? -1 : filter === "week" ? -7 : -30
                  ) || []
              : tabValue === 1
              ? Object.keys(weekCummulative?.week_cumulative || {})
              : Object.keys(monthCummulative?.month_cumulative || {}),
          axisTick: {
            show: true,
            alignWithLabel: true
          },
          axisLine: {
            show: true // Hide the axis line
          },
          splitLine: {
            show: false // Hide the vertical grid lines
          },

          formatter: (value) => moment(value).format("MMM DD"),
          axisLabel: {
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          axisTick: {
            show: false // Hide the axis tick marks
          },
          axisLine: {
            show: true // Hide the axis line
          },
          splitLine: {
            show: false // Hide the vertical grid lines
          },

          axisLabel: {
            formatter: "{value} kWh",
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      series:
        tabShiftValue === 0
          ? [
              {
                name: "Energy Consumption",
                type: "bar",
                barGap: 0,
                tooltip: {
                  valueFormatter(value) {
                    return `${Number(value)?.toFixed(2)}kWh`;
                  }
                },
                itemStyle: {
                  color: darkMode ? EnergyConsumption.dark : EnergyConsumption.main // change this to the color you want
                },
                data: energyConsumptionTemp,
                emphasis: {
                  // Show the value label on hover
                  label: {
                    show: true,
                    position: "top", // Customize the position of the label (top, inside, etc.)
                    formatter: "Energy Consumption",
                    color: "#FFF"
                  }
                }
              },
              {
                name: "Energy Wastage",
                type: "bar",
                barGap: 0,
                tooltip: {
                  valueFormatter(value) {
                    return `${Number(value)?.toFixed(2)}kWh`;
                  }
                },
                itemStyle: {
                  color: darkMode ? EnergyWastage.dark : EnergyWastage.main // change this to the color you want
                },
                data: energyWastageTemp,
                emphasis: {
                  // Show the value label on hover
                  label: {
                    show: true,
                    position: "top", // Customize the position of the label (top, inside, etc.)
                    formatter: "Energy Wastage",
                    color: "#FFF"
                  }
                }
              },
              {
                name: "",
                type: "bar",
                barGap: 0,
                tooltip: {
                  show: false
                },
                barWidth: "5%",
                itemStyle: {
                  color: "#FFFFFF" // change this to the color you want
                },
                data:
                  tabValue === 0
                    ? dateRangePickerChange
                      ? Object.values(dayCummulative?.day_cumulative || {}).map(() => 0)
                      : Object.values(dayCummulative?.day_cumulative || {})

                          .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                          .map(() => 0)
                    : tabValue === 1
                    ? Object.values(weekCummulative?.week_cumulative || {}).map(() => 0)
                    : Object.values(monthCummulative?.month_cumulative || {}).map(() => 0)
              }
            ]
          : Object.keys(
              dayCummulative?.day_cumulative?.[moment().subtract(1, "day").format("YYYY-MM-DD")]
                ?.overall || {}
            )
              .map((key) => [
                {
                  name: "Energy Consumption",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    valueFormatter(value) {
                      return `${key} - ${Number(value)?.toFixed(2)}kWh`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? EnergyConsumption.dark : EnergyConsumption.main // change this to the color you want
                  },
                  data:
                    tabValue === 0
                      ? dateRangePickerChange
                        ? Object.values(dayCummulative?.day_cumulative || {}).map(
                            (data) => data?.overall[key]?.energy_consumption
                          )
                        : Object.values(dayCummulative?.day_cumulative || {})
                            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                            .map((data) => data?.overall[key]?.energy_consumption)
                      : tabValue === 1
                      ? Object.values(weekCummulative?.week_cumulative || {}).map(
                          (data) => data?.overall[key]?.energy_consumption
                        )
                      : Object.values(monthCummulative?.month_cumulative || {}).map(
                          (data) => data?.overall[key]?.energy_consumption
                        ),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: key,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "Energy Wastage",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    valueFormatter(value) {
                      return `${key} - ${Number(value)?.toFixed(2)}kWh`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? EnergyWastage.dark : EnergyWastage.main // change this to the color you want
                  },
                  data:
                    tabValue === 0
                      ? dateRangePickerChange
                        ? Object.values(dayCummulative?.day_cumulative || {}).map(
                            (data) => data?.overall[key]?.energy_wastage
                          )
                        : Object.values(dayCummulative?.day_cumulative || {})

                            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                            .map((data) => data?.overall[key]?.energy_wastage)
                      : tabValue === 1
                      ? Object.values(weekCummulative?.week_cumulative || {}).map(
                          (data) => data?.overall[key]?.energy_wastage
                        )
                      : Object.values(monthCummulative?.month_cumulative || {}).map(
                          (data) => data?.overall[key]?.energy_wastage
                        ),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: key,
                      color: "#FFF"
                    }
                  }
                },
                {
                  name: "",
                  type: "bar",
                  barGap: 0,
                  tooltip: {
                    show: false
                  },
                  barWidth: "5%",
                  itemStyle: {
                    color: "#FFFFFF" // change this to the color you want
                  },
                  data:
                    tabValue === 0
                      ? dateRangePickerChange
                        ? Object.values(dayCummulative?.day_cumulative || {}).map(() => 0)
                        : Object.values(dayCummulative?.day_cumulative || {})

                            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                            .map(() => 0)
                      : tabValue === 1
                      ? Object.values(weekCummulative?.week_cumulative || {}).map(() => 0)
                      : Object.values(monthCummulative?.month_cumulative || {}).map(() => 0)
                }
              ])
              .flat()
    };
    setPlantEnergyOption(PlantEnergyOption);
  };
  const co2EmissionsOptionsTempGraphData = () => {
    let co2EmissionsTonsTemp = [];
    if (tabValue === 0) {
      co2EmissionsTonsTemp = dateRangePickerChange
        ? Object.values(dayCummulative?.day_cumulative || {}).map(
            (data) => data?.overall?.co2_emissions_tons
          )
        : Object.values(dayCummulative?.day_cumulative || {})
            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
            .map((data) => data?.overall?.co2_emissions_tons);
    } else if (tabValue === 1) {
      co2EmissionsTonsTemp = Object.values(weekCummulative?.week_cumulative || {}).map(
        (data) => data?.overall?.co2_emissions_tons
      );
    } else {
      co2EmissionsTonsTemp = Object.values(monthCummulative?.month_cumulative || {}).map(
        (data) => data?.overall?.co2_emissions_tons
      );
    }
    const co2EmissionsOptionsTemp = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        // data: ["Energy Consumption", "Energy Wastage"],
        top: 25,
        textStyle: {
          color: darkMode ? "#ffffffcc" : "#7B809A"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          data:
            tabValue === 0
              ? dateRangePickerChange
                ? Object.keys(dayCummulative?.day_cumulative || {}) || []
                : Object.keys(dayCummulative?.day_cumulative || {}).slice(
                    filter === "today" ? -1 : filter === "week" ? -7 : -30
                  ) || []
              : tabValue === 1
              ? Object.keys(weekCummulative?.week_cumulative || {})
              : Object.keys(monthCummulative?.month_cumulative || {}),
          axisTick: {
            show: true,
            alignWithLabel: true
          },
          axisLine: {
            show: true // Hide the axis line
          },
          splitLine: {
            show: false // Hide the vertical grid lines
          },

          formatter: (value) => moment(value).format("MMM DD"),
          axisLabel: {
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          axisTick: {
            show: false // Hide the axis tick marks
          },
          axisLine: {
            show: true // Hide the axis line
          },
          splitLine: {
            show: false // Hide the vertical grid lines
          },

          axisLabel: {
            formatter: "{value}",
            color: darkMode ? "#ffffffcc" : "#7B809A"
          }
        }
      ],
      series:
        tabShiftValue === 0
          ? {
              name: "Co2 Emissions Tons",
              type: "bar",
              tooltip: {
                valueFormatter(value) {
                  return `${Number(value)?.toFixed(2)}%`;
                }
              },
              itemStyle: {
                color: darkMode ? RunTime.dark : RunTime.main // change this to the color you want
              },
              data: co2EmissionsTonsTemp,
              emphasis: {
                // Show the value label on hover
                label: {
                  show: true,
                  position: "top", // Customize the position of the label (top, inside, etc.)
                  formatter: "Co2 Emissions Tons",
                  color: "#FFF"
                }
              }
            }
          : Object.keys(
              dayCummulative?.day_cumulative?.[moment().subtract(1, "day").format("YYYY-MM-DD")]
                ?.overall || {}
            )
              .map((key) => [
                {
                  name: "Co2 Emissions Tons",
                  type: "bar",
                  tooltip: {
                    valueFormatter(value) {
                      return `${key} - ${Number(value)?.toFixed(2)}`;
                    }
                  },
                  itemStyle: {
                    color: darkMode ? RunTime.dark : RunTime.main // change this to the color you want
                  },
                  data:
                    tabValue === 0
                      ? dateRangePickerChange
                        ? Object.values(dayCummulative?.day_cumulative || {}).map(
                            (data) => data?.overall[key]?.co2_emissions_tons
                          )
                        : Object.values(dayCummulative?.day_cumulative || {})
                            .slice(filter === "today" ? -1 : filter === "week" ? -7 : -30)
                            .map((data) => data?.overall[key]?.co2_emissions_tons)
                      : tabValue === 1
                      ? Object.values(weekCummulative?.week_cumulative || {}).map(
                          (data) => data?.overall[key]?.co2_emissions_tons
                        )
                      : Object.values(monthCummulative?.month_cumulative || {}).map(
                          (data) => data?.overall[key]?.co2_emissions_tons
                        ),
                  emphasis: {
                    // Show the value label on hover
                    label: {
                      show: true,
                      position: "top", // Customize the position of the label (top, inside, etc.)
                      formatter: key,
                      color: "#FFF"
                    }
                  }
                }
              ])
              .flat()
    };
    setCo2EmissionsOptions(co2EmissionsOptionsTemp);
  };
  useEffect(() => {
    if (dayCummulative && weekCummulative && monthCummulative) {
      OEEGraphData();
      PlantEnergyGraphData();
      co2EmissionsOptionsTempGraphData();
    }
  }, [dayCummulative, weekCummulative, monthCummulative, tabValue, filter]);
  console.log("filter", tabValue, filter);
  return (
    <DashboardLayout>
      <DashboardNavbar />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Grid container display="flex" justifyContent="space-evenly">
            <Grid item sm={12} md={3} position="relative">
              <MDBox
                onMouseOver={() => setShow(true)}
                onMouseOut={() => setShow(false)}
                key="logo"
                py={3}
                pr={2}
                pb={2}
                style={{
                  position: "absolute",
                  top: "28%",
                  right: 0,
                  display: show ? "block" : "none",
                  zIndex: 2
                }}
              >
                <input
                  type="file"
                  ref={inputFile}
                  style={{ display: "none" }}
                  label={translate("Logo")}
                  onChange={(e) => {
                    setCompanyDetails({
                      ...companyDetails,
                      logo: e.target.files[0]
                    });
                    handleUpload(e.target.files[0]);
                  }}
                />
                <MDButton
                  style={{ marginLeft: "10px", display: "none" }}
                  onClick={() => inputFile.current.click()}
                >
                  upload
                </MDButton>
                <Tooltip
                  onClick={() => inputFile.current.click()}
                  placement="top"
                  title={translate("Upload")}
                >
                  <Icon style={{ color: "#ffffff", cursor: "pointer" }}>upload</Icon>
                </Tooltip>
                <Tooltip
                  onClick={() => {
                    setLogo();
                    setCompanyDetails({
                      ...companyDetails,
                      logo: null
                    });
                    updateCompanyHandler(null);
                  }}
                  title={translate("Delete Logo")}
                  placement="top"
                >
                  <Icon style={{ color: "#ffffff", cursor: "pointer" }}>delete</Icon>
                </Tooltip>
              </MDBox>
              <Grid display="flex" justifyContent="center" alignItems="center" height="90%">
                <MDBox
                  onMouseOver={() => setShow(true)}
                  onMouseOut={() => setShow(false)}
                  component="img"
                  src={
                    (companyDetails?.logo &&
                      Object.keys(companyDetails?.logo)?.length > 0 &&
                      `${process.env.REACT_APP_BASE_URL}v2/company/logo/${logo}`) ||
                    NovoAiLogo
                  }
                  alt=""
                  width={smDown ? "50%" : "100%"}
                  // maxHeight="20%"
                  // height="100%"
                  position="relative"
                  zIndex={1}
                />
              </Grid>
            </Grid>
            <Grid sm={12} md={8} mt={smDown ? 3 : 0}>
              <ProfileInfoCard
                title={companyDetails.title}
                description={companyDetails.description}
                info={
                  {
                    // fullname: companyDetails.fullname,
                    // mobile: companyDetails.mobile,
                    // email: companyDetails.email,
                    // location: companyDetails.location,
                  }
                }
                logo={companyDetails.logo}
                timezone={companyDetails.timezone}
                currency={companyDetails.currency}
                addressline1={companyDetails.addressline1}
                addressline2={companyDetails.addressline2}
                city={companyDetails.city}
                state={companyDetails.state}
                country={companyDetails.country}
                zipcode={companyDetails.zipcode}
                hourly_revenue={companyDetails.hourly_revenue}
                cost_per_hour={companyDetails.cost_per_hour}
                plantArea={companyDetails.plant_area}
                wastePercentage={companyDetails.waste_percentage}
                coolantOutput={companyDetails.coolant_output}
                renewableEnergyUsage={companyDetails.renewable_energy_usage}
                transportEfficiency={companyDetails.transport_efficiency}
                materialEfficiency={companyDetails.material_efficiency}
                action={{ route: "", tooltip: translate("Edit Profile") }}
                shadow={false}
                setError={setError}
                setCompanyDetails={setCompanyDetails}
                saveHandler={updateCompanyHandler}
              />
              {error && (
                <MDTypography variant="h5" fontWeight="medium" style={{ color: "red" }}>
                  {error}
                </MDTypography>
              )}
            </Grid>
          </Grid>
          <RealTimeOverview dayCummulative={dayCummulative} />

          <SustainabilityOverview
            tabValue={tabValue}
            dayCummulative={dayCummulative}
            filter={filter}
            weekCummulative={weekCummulative}
            monthCummulative={monthCummulative}
            tabShiftValue={tabShiftValue}
          />

          <EnergyOverView
            isLoading={isLoading}
            tabShiftValue={tabShiftValue}
            handleSetTabShiftValue={(e, newValue) => setTabShiftValue(newValue)}
            startDate={startDate}
            endDate={endDate}
            setEndDate={(data) => {
              setDateRangePickerChange(true);
              setEndDate(data);
              setFilter("month");
            }}
            dateRangePickerChange={dateRangePickerChange}
            filter={filter}
            handleSetFilterValue={handleSetFilterValue}
            setStartDate={(data) => {
              setDateRangePickerChange(true);
              setFilter("month");
              setStartDate(data);
            }}
            setRefreshToggler={() => {
              setFilter("today");
              setDateRangePickerChange(false);
              setStartDate(
                tabValue === 0
                  ? moment().subtract(1, "month")
                  : tabValue === 1
                  ? moment().subtract(2, "month").startOf("week")
                  : moment().subtract(4, "month").startOf("month")
              );
              setEndDate(moment().subtract(1, "day"));
            }}
            consumptionTotal={consumptionTotal}
            companyDetails={companyDetails}
          />
          <TimeOverview
            filter={filter}
            consumptionTotal={consumptionTotal}
            classes={classes}
            smDown={smDown}
          />

          <MDBox display="flex" justifyContent="flex-end" mt={3}>
            <Grid item xs={12} md={6} lg={3} display="flex" alignItems="center" mr={4}>
              <Tooltip title={translate("chooseDay")} style={{ marginRight: 10 }}>
                <Icon style={{ color: "white", marginRight: "10px" }}>info</Icon>
              </Tooltip>
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
                  <Tab label="Day" sx={{ padding: "3px 14px", height: "36px" }} />
                  <Tab label="Week" sx={{ padding: "0 14px", height: "36px" }} />
                  <Tab label="Month" sx={{ padding: "0 14px", height: "36px" }} />
                </Tabs>
              </AppBar>
            </Grid>
          </MDBox>
          <GraphView
            oeeOption={oeeOption}
            plantEnergyOption={plantEnergyOption}
            co2EmissionsOptions={co2EmissionsOptions}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default index;
