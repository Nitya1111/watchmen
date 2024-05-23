import Card from "@mui/material/Card"

import MDBox from "components/MDBox"
import PropTypes from "prop-types"

import { Grid, Icon, Tooltip, useMediaQuery, useTheme } from "@mui/material"
import MDButton from "components/MDButton"
import MDTypography from "components/MDTypography"
// import LabeledProgress from "../labeledProgress";
// import Counts from "../counts";
import { useMaterialUIController } from "context"
import translate from "i18n/translate"
import Chart from "react-apexcharts"

export const useStyle = (colorCard) => {
  const theme = useTheme()
  return {
    cardName: {
      color: colorCard && theme.palette.common.white,
      [theme.breakpoints.down("sm")]: {
        fontSize: "0.875rem",
        display: "block",
        width: "100%",
        wordWrap: "break-word",
        pt: "15px"
      }
    },
    cardValue: {
      color: colorCard && theme.palette.common.white
    }
  }
}

function NewCount({
  count = 0,
  name,
  onClick,
  cardSx,
  type = null,
  tooltip = "tooltip",
  colorCard
}) {
  const classes = useStyle(colorCard)
  const theme = useTheme()
  const smDown = useMediaQuery(theme.breakpoints.down("sm"))
  const [controller] = useMaterialUIController()
  const { darkMode } = controller

  const state = {
    series: [count],
    options: {
      chart: {
        type: "radialBar",
        offsetY: -20,
        sparkline: {
          enabled: true
        }
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: "#e7e7e7",
            strokeWidth: "97%",
            margin: 5, // margin is in pixels
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              color: "#999",
              opacity: 1,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              formatter: function (val) {
                const degrees = new Intl.NumberFormat("en-US", {
                  style: "unit",
                  unit: "celsius"
                })
                return degrees.format(val)
              },
              color: darkMode ? "#FFF" : "#7b809a",
              fontSize: "22px",
              show: true,
              fontWeight: 700
            }
            // value: {
            //   offsetY: -2,
            //   fontSize: '22px'
            // }
          }
        }
      },
      grid: {
        padding: {
          top: -10
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91]
        }
      },
      labels: ["Average Results"]
    }
  }

  return (
    <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
      <MDBox mb={2} lineHeight={1}>
        <Card sx={cardSx}>
          <Grid container pl={2} py={0} style={{ cursor: "pointer" }}>
            <Grid item md={12} xs={12} sm={12} onClick={onClick}>
              <MDBox lineHeight={smDown ? 1.2 : 2.3}>
                <MDTypography
                  variant="button"
                  fontWeight="bold"
                  color="text"
                  textTransform="capitalize"
                  sx={classes.cardName}
                >
                  {name}
                </MDTypography>
                <Tooltip
                  sx={{ position: "absolute", right: "8px", top: "8px" }}
                  title={translate(tooltip)}
                  placement="top"
                  arrow
                >
                  <MDButton variant="outlined" color="secondary" size="small" circular iconOnly>
                    <Icon>priority_high</Icon>
                  </MDButton>
                </Tooltip>
                <MDBox minHeight={100} pt={2}>
                  {type === "gauge" ? (
                    <Chart options={state.options} series={state.series} type="radialBar" />
                  ) : (
                    <Grid item mx={0} my={0.5}>
                      <MDBox
                        lineHeight={1}
                        textAlign="center"
                        marginBottom=""
                        fontSize={smDown ? "1.50rem" : "2.25rem"}
                      >
                        <MDTypography
                          variant="v4"
                          fontWeight="bold"
                          color="text"
                          textTransform="capitalize"
                          sx={classes.cardValue}
                        >
                          {count}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  )}
                </MDBox>
              </MDBox>
            </Grid>
          </Grid>
        </Card>
      </MDBox>
    </Grid>
  )
}
NewCount.defaultProps = {
  type: "",
  onClick: "",
  count: 0,
  name: "",
  tooltip: "",
  colorCard: "",
  cardSx: ""
}

// Typechecking props for the AuthProvider
NewCount.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  count: PropTypes.number,
  tooltip: PropTypes.string,
  onClick: PropTypes.string,
  colorCard: PropTypes.string,
  cardSx: PropTypes.string
}
export default NewCount
