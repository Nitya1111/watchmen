/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-plusplus */
/* eslint-disable react/prop-types */
import { Grid, useTheme } from "@mui/material";
import colors from "assets/theme-dark/base/colors";
import MDBox from "components/MDBox";
import MDCard from "components/MDCard";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";
import * as echarts from "echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/dataZoom";
import "echarts/lib/component/grid";
import "echarts/lib/component/legend";
import "echarts/lib/component/tooltip";
import translate from "i18n/translate";
import moment from "moment";
import { memo, useRef, useState } from "react";
import { machineState } from "utils/constants";
import CommonEchart from "./commonEchart";

export const useStyle = () => {
  const theme = useTheme();
  return {
    graphCard: {
      width: "fit-content"
    },
    rootGraphGrid: {
      cursor: "pointer",
      [theme.breakpoints.down("lg")]: {
        backgroundColor: "leman"
      },
      [theme.breakpoints.down("md")]: {
        backgroundColor: "orange"
      }
    }
  };
};

const PlotlyChart = memo(function PlotlyChart({
  value,
  date,
  startTime,
  endTime,
  pulse,
  showPulseMovement,
  showTimeline,
  floorplan = false,
  setTimeDetailPopup,
  last3Hrs = false,
  showAxisLabel = true,
  cyclesDataRows = [],
  handleSelectedCycles,
  cyclesSelectedDataRows,
  isAddNewCycles = false,
  timelineReasonList = [],
  addTimelineReason,
  machineId
}) {
  const classes = useStyle();
  const [controller] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;
  const screenWidth = window.innerWidth;
  const { RunTime, IdleTime, StoppedTime, PreparationTime, UnknownTime } = colors;
  const [selectedPulse, setSelectedPulse] = useState([]);
  let MAXPULSE = 100;
  const echartsReact = useRef();
  const Good = [
    {
      name: "off",
      data: [
        {
          y: [],
          x: "m1",
          mode: "lines",
          name: "Off",
          line: {
            color: StoppedTime.main,
            width: 100
          }
        }
      ]
    },
    {
      name: "Production",
      data: []
    },
    {
      name: "idle",
      data: []
    },
    {
      name: "preparation",
      data: []
    },
    {
      name: "unknown",
      data: []
    }
  ];
  const startTimestamp = value?.columns?.findIndex((val) => val === "start_timestamp");
  const endTimestamp = value?.columns?.findIndex((val) => val === "end_timestamp");
  const timeLineReasonId = value?.columns?.findIndex((val) => val === "timeline_reason_id");
  const timeLineStateId = value?.columns?.findIndex((val) => val === "state");

  if (startTimestamp && endTimestamp && startTimestamp !== -1 && endTimestamp !== -1) {
    value?.data?.forEach((time) => {
      if (time[timeLineStateId] === machineState.STOPPED) {
        Good[0].data.push({
          y: [
            new Date(Math.floor(time[startTimestamp] * 1000)).getTime(),
            new Date(Math.floor(time[endTimestamp] * 1000)).getTime()
          ],
          x: "m1",
          mode: "lines",
          name: "Off",
          line: {
            color: StoppedTime.main,
            width: 100
          },
          timeLineReason:
            timelineReasonList?.find((item) => item?.id === time[timeLineReasonId]) || ""
        });
      } else if (time[timeLineStateId] === machineState.PRODUCTION) {
        Good[1].data.push({
          y: [
            new Date(Math.floor(time[startTimestamp] * 1000)).getTime(),
            new Date(Math.floor(time[endTimestamp] * 1000)).getTime()
          ],
          x: "m1",
          mode: "lines",
          name: "Production",
          line: {
            color: RunTime.main,
            width: 100
          },
          timeLineReason:
            timelineReasonList?.find((item) => item?.id === time?.[timeLineReasonId]) || ""
        });
      } else if (time[timeLineStateId] === machineState.IDLE) {
        Good[2].data.push({
          y: [
            new Date(Math.floor(time[startTimestamp] * 1000)).getTime(),
            new Date(Math.floor(time[endTimestamp] * 1000)).getTime()
          ],
          x: "m1",
          mode: "lines",
          name: "Idle",
          line: {
            color: IdleTime.main,
            width: 100
          },
          timeLineReason:
            timelineReasonList?.find((item) => item?.id === time?.[timeLineReasonId]) || ""
        });
      } else if (time[timeLineStateId] === machineState.PREPARATION) {
        Good[3].data.push({
          y: [
            new Date(Math.floor(time[startTimestamp] * 1000)).getTime(),
            new Date(Math.floor(time[endTimestamp] * 1000)).getTime()
          ],
          x: "m1",
          mode: "lines",
          name: "Preparation",
          line: {
            color: PreparationTime.main,
            width: 100
          }
        });
      } else if (time[timeLineStateId] === machineState.UNKNOWN) {
        Good[4].data.push({
          y: [
            new Date(Math.floor(time[startTimestamp] * 1000)).getTime(),
            new Date(Math.floor(time[endTimestamp] * 1000)).getTime()
          ],
          x: "m1",
          mode: "lines",
          name: "Unknown",
          line: {
            color: UnknownTime.main,
            width: 100
          },
          timeLineReason:
            timelineReasonList?.find((item) => item?.id === time?.[timeLineReasonId]) || ""
        });
      }
    });
  }

  const time = date ? new Date(date) : new Date();
  const momentStartTime = startTime ? moment(startTime) : null;
  const momentEndTime = endTime ? moment(endTime) : null;
  const lastMidnight = startTime
    ? new Date(
      time.setHours(momentStartTime.hour(), momentStartTime.minute(), momentStartTime.second(), 0)
    )
    : new Date(time.setHours(0, 0, 0, 0));
  const nextMidnight = endTime
    ? new Date(
      time.setHours(momentEndTime.hour(), momentEndTime.minute(), momentEndTime.second(), 0)
    )
    : new Date(time.setHours(24, 0, 0, 0));
  pulse?.forEach((onePulse) => {
    if (onePulse[1] > MAXPULSE) {
      [, MAXPULSE] = onePulse;
    }
  });

  // eslint-disable-next-line prefer-const
  let data = [];
  const categories = ["M1"];

  // Generate mock data
  Good.forEach((typeItem, index) => {
    for (let i = 0; i < typeItem.data.length; i++) {
      if (typeItem.data[i].y.length) {
        data.push({
          name: typeItem.name,
          value: [index, typeItem.data[i].y[0], typeItem.data[i].y[1], typeItem.data[i].y[0]],
          itemStyle: {
            normal: {
              color: typeItem.data[0].line.color
            }
          },
          timeLineReason: typeItem.data[i].timeLineReason || ""
        });
      }
    }
  });

  function renderItem(params, api) {
    const categoryIndex = api.value(0);
    const start = api.coord([api.value(1), categoryIndex]);
    const end = api.coord([api.value(2), categoryIndex]);
    const height = api.size([0, 1])[1] * 0.6;
    const rectShape = echarts.graphic.clipRectByRect(
      {
        x: start[0],
        y: start[1] - height / 2,
        width: end[0] - start[0],
        height
      },
      {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height
      }
    );
    return (
      rectShape && {
        type: "rect",
        transition: ["shape"],
        shape: rectShape,
        style: api.style()
      }
    );
  }
  const option = {
    // tooltip: {
    //   trigger: "axis",
    //   position(pt) {
    //     return [pt[0], "10%"];
    //   },

    // },
    tooltip: {
      trigger: "axis",
      position(pt) {
        return [pt[0], "10%"];
      }
    },
    grid: {
      height: 100,
      show: false,
      left: 50,
      right: 10,
      top: 1,
      bottom: 0,
      tooltip: {
        show: true,
        trigger: "item",
        formatter(params) {
          return `${params.marker + params.name}: ${moment(new Date(params.value[1])).format(
            "HH:mm"
          )} - ${moment(new Date(params.value[2])).format("HH:mm")}<br>${params?.data?.timeLineReason?.reason || ''
            }`;
        }
      }
    },
    xAxis: {
      min: lastMidnight.getTime(),
      max: nextMidnight?.getTime(),
      axisLabel: {
        formatter(val) {
          return moment(val).format("HH:mm");
        },
        color: darkMode ? "#ffffffcc" : "#7B809A"
      },
      axisTick: {
        show: true
      },
      axisLine: {
        show: false // Hide the axis line
      },
      splitLine: {
        show: false // Hide the vertical grid lines
      }
    },
    yAxis: {
      data: categories,
      axisLabel: {
        show: showAxisLabel,
        color: darkMode ? "#ffffffcc" : "#7B809A"
      },
      axisTick: {
        show: false // Hide the axis tick marks
      },
      axisLine: {
        show: false // Hide the axis line
      },
      splitLine: {
        show: false // Hide the vertical grid lines
      }
    },
    series: [
      {
        type: "custom",
        renderItem,
        itemStyle: {
          opacity: 1
        },
        encode: {
          x: [0, 0],
          y: 0
        },
        data
      }
    ]
  };

  const pulseOption = {
    tooltip: {
      trigger: "axis",
      position(pt) {
        return [pt[0], "10%"];
      }
    },
    toolbox: {
      feature: {
        dataZoom: {},
        restore: {},
        saveAsImage: {}
      }
    },
    grid: [
      {
        height: 100,
        show: false,
        left: 50,
        right: 50,
        top: 20,
        tooltip: {
          show: true,
          trigger: "item",
          formatter(params) {
            return `${params.marker + params.name}: ${moment(new Date(params.value[1])).format(
              "HH:mm"
            )} - ${moment(new Date(params.value[2])).format("HH:mm")}<br>${params?.data?.timeLineReason?.reason || ''
              }`;
          }
        }
      },
      {
        height: 500,
        show: false,
        left: 50,
        right: 50,
        bottom: 80,
        tooltip: {
          show: true,
          trigger: "axis"
        },
        position(pt) {
          return [pt[0], "10%"];
        }
      }
    ],
    xAxis: [
      {
        // type: "time",
        min: lastMidnight.getTime(),
        max: nextMidnight?.getTime(),
        axisLabel: {
          formatter(val) {
            return moment(val).format("HH:mm");
          },
          color: darkMode ? "#ffffffcc" : "#7B809A"
        },
        axisTick: {
          show: true
        },
        axisLine: {
          show: false // Hide the axis line
        },
        splitLine: {
          show: false // Hide the vertical grid lines
        }
      },
      {
        type: "time",
        // boundaryGap: false,
        min: lastMidnight.getTime(),
        max: nextMidnight?.getTime(),
        axisLabel: {
          formatter(val) {
            return moment(val).format("HH:mm");
          },
          color: darkMode ? "#ffffffcc" : "#7B809A"
        },
        axisTick: {
          show: true
        },
        gridIndex: 1,
        axisLine: {
          show: false // Hide the axis line
        },
        splitLine: {
          show: false // Hide the vertical grid lines
        }
      }
    ],
    yAxis: [
      {
        data: categories,
        axisLabel: {
          show: showAxisLabel,
          color: darkMode ? "#ffffffcc" : "#7B809A"
        },
        axisTick: {
          show: false // Hide the axis tick marks
        },
        axisLine: {
          show: false // Hide the axis line
        },
        splitLine: {
          show: false // Hide the vertical grid lines
        }
      },
      {
        // type: "value",
        // boundaryGap: [0, "100%"],
        min: 0,
        gridIndex: 1,
        max: MAXPULSE,
        axisLabel: {
          show: showAxisLabel,
          color: darkMode ? "#ffffffcc" : "#7B809A"
        },
        axisTick: {
          show: false // Hide the axis tick marks
        },
        axisLine: {
          show: false // Hide the axis line
        },
        splitLine: {
          show: false // Hide the vertical grid lines
        }
      }
    ],
    series: [
      {
        type: "custom",
        renderItem,
        itemStyle: {
          opacity: 1
        },
        xAxisIndex: 0,
        yAxisIndex: 0,
        event: "click",
        encode: {
          x: [0, 0],
          y: 0
        },
        data
      },
      isAddNewCycles && {
        name: "Selected Pulse",
        type: "line",
        z: 2,
        symbol: "roundRect",
        select: {
          itemStyle: {
            color: "#FF0000"
          }
        },
        itemStyle: {
          color: "#889BD9"
        },
        areaStyle: {
          silent: false,
          color: "#889BD9"
        },
        lineStyle: { color: "#889BD9" },
        selectedMode: "multiple",
        event: "click",
        data: pulse?.map((singlePulse) => [
          new Date(Math.floor(singlePulse[0]) * 1000).getTime(),
          singlePulse[1]
        ]),
        xAxisIndex: 1,
        yAxisIndex: 1,
        emphasis: {
          focus: "series" // Highlight the whole series when clicked
        }
      },
      {
        name: "Pulse",
        type: "line",
        z: 1,
        smooth: true,
        symbol: "none",
        areaStyle: {
          silent: false,
          color: "#889BD9"
        },
        lineStyle: { color: "#889BD9" },
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: pulse?.map((singlePulse) => [
          new Date(Math.floor(singlePulse[0]) * 1000).getTime(),
          singlePulse[1]
        ]),
        event: "click"
      },
      {
        name: "Cycles",
        type: "scatter",
        symbolSize: 6,
        z: 2,
        smooth: true,
        data: cyclesSelectedDataRows?.map((singlePulse) => {
          const dataItem = singlePulse.split("-");
          return [new Date(Math.floor(dataItem[0]) * 1000).getTime(), dataItem[2]];
        }),
        xAxisIndex: 1,
        yAxisIndex: 1,
        event: "click",
        itemStyle: {
          // Add this itemStyle property to change the point color
          color: "#ff0000", // Change the point color (same as line color)
          borderColor: "#ff0000" // Border color of the symbols
        }
      },
      {
        name: "Cycles",
        type: "scatter",
        symbolSize: 6,
        z: 2,
        xAxisIndex: 1,
        yAxisIndex: 1,
        smooth: true,
        data: cyclesDataRows?.map((singlePulse) => [
          new Date(Math.floor(singlePulse[0]) * 1000).getTime(),
          singlePulse[2]
        ]),
        event: "click",
        emphasis: {
          focus: "series" // Highlight the whole series when clicked
        },
        itemStyle: {
          // Add this itemStyle property to change the point color
          color: "#50C878", // Change the point color (same as line color)
          borderColor: "#50C878" // Border color of the symbols
        }
      },
      {
        name: "Duration",
        type: "scatter",
        symbolSize: 0,
        z: 0,
        xAxisIndex: 1,
        yAxisIndex: 1,
        event: "click",
        smooth: true,
        data: cyclesDataRows?.map((singlePulse) => [
          new Date(Math.floor(singlePulse[0]) * 1000).getTime(),
          singlePulse[1]
        ])
      }
    ],
    dataZoom: [
      {
        type: "slider",
        xAxisIndex: [0, 1],
        zoomOnMouseWheel: "ctrl",
        moveOnMouseWheel: true,
        filterMode: "none"
      },
      {
        type: "inside",
        xAxisIndex: [0, 1],
        zoomOnMouseWheel: "ctrl",
        moveOnMouseWheel: true,
        filterMode: "none"
      },
      {
        type: "slider",
        yAxisIndex: 1,
        zoomOnMouseWheel: "ctrl",
        moveOnMouseWheel: true,
        filterMode: "none"
      },
      {
        type: "inside",
        yAxisIndex: [0, 1],
        zoomOnMouseWheel: "ctrl",
        moveOnMouseWheel: true,
        filterMode: "none"
      }
    ]
  };

  const onChartClick = (params) => {
    if (addTimelineReason && params.componentSubType === "custom") {
      setTimeDetailPopup({ ...params?.data, machineId });
    }
  };

  const onPulseChartClick = (params) => {
    if (params.componentSubType === "custom") {
      setTimeDetailPopup({ ...params?.data, machineId });
    } else if (isAddNewCycles) {
      handleSelectedCycles(params);
    }
    // if (selectPulsePoints) setSelectedPulse([...selectedPulse, params.data]);
  };

  return floorplan && showTimeline ? (
    <CommonEchart
      option={option}
      onEvents={onChartClick}
      style={{
        minWidth: last3Hrs ? "fit-content" : "",
        width: last3Hrs
          ? "auto"
          : screenWidth > 1200
            ? miniSidenav
              ? screenWidth - 200
              : screenWidth - 350
            : screenWidth > 800
              ? screenWidth - 100
              : 768,
        height: "120px",
        overflow: "auto"
      }}
      last3Hrs={last3Hrs}
    />
  ) : (
    <Grid item xs={4} sm={12} md={12} lg={10} xl={12}>
      <MDBox lineHeight={1}>
        <MDCard sx={classes.graphCard} style={{ width: "100%" }}>
          <Grid
            container
            spacing={0}
            alignItems="center"
            justifyContent="start"
            px={2}
            py={0}
            style={{ cursor: "pointer" }}
          >
            <Grid item md={12}>
              <MDBox lineHeight={2.3}>
                {/* {showTimeline && (
                  <>
                    <MDTypography
                      variant="button"
                      fontWeight="bold"
                      color="text"
                      textTransform="capitalize"
                    >
                      {translate("Timeline")}
                    </MDTypography>
                    <CommonEchart
                      option={option}
                      onEvents={onChartClick}
                      style={{
                        width: "99%",
                        height: "120px",
                        overflow: "auto"
                      }}
                    />
                  </>
                )} */}
                {showPulseMovement && (
                  <>
                    <MDBox
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "12px"
                      }}
                    >
                      <MDTypography
                        variant="button"
                        fontWeight="bold"
                        color="text"
                        textTransform="capitalize"
                      >
                        {translate("Pulse")}
                      </MDTypography>
                      {selectedPulse.length !== 0 && (
                        <MDBox
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        >
                          <MDBox sx={{ marginRight: "12px" }}>
                            <MDInput label="Probability" type="number" variant="outlined" />
                          </MDBox>
                          <MDTypography
                            variant="button"
                            fontWeight="bold"
                            textTransform="capitalize"
                            sx={{ marginRight: "8px" }}
                          >
                            {translate("Save")}
                          </MDTypography>
                          <MDTypography
                            variant="button"
                            fontWeight="bold"
                            textTransform="capitalize"
                            sx={{ marginRight: "8px" }}
                            onClick={() => setSelectedPulse([])}
                          >
                            {translate("Clear")}
                          </MDTypography>
                        </MDBox>
                      )}
                    </MDBox>
                    <CommonEchart
                      echartsReact={echartsReact}
                      option={pulseOption}
                      onEvents={onPulseChartClick}
                      style={{
                        width: "100%",
                        height: "750px",
                        overflow: "auto"
                      }}
                    />
                  </>
                )}
              </MDBox>
            </Grid>
          </Grid>
        </MDCard>
      </MDBox>
    </Grid>
  );
});

export default PlotlyChart;
