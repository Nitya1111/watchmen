import Card from "@mui/material/Card"

import MDBox from "components/MDBox"
import PropTypes from "prop-types"

import { Grid, useTheme } from "@mui/material"
import MDTypography from "components/MDTypography"
// import LabeledProgress from "../labeledProgress";
// import Counts from "../counts";

export const useStyle = () => {
  const theme = useTheme()
  return {
    mainCard: {
      // [theme.breakpoints.down("sm")]: {
      //     width: "112px",
      // },
    },
    mainGrid: {
      [theme.breakpoints.down("md")]: {
        width: "85px"
      },
      [theme.breakpoints.down("sm")]: {
        width: "60px"
      }
    },
    endOfText: {
      [theme.breakpoints.down("sm")]: {
        position: "absolute",
        marginLeft: "-15px",
        marginTop: "-64px"
      }
    },
    text: {
      [theme.breakpoints.down("sm")]: {
        fontSize: "0.875rem",
        display: "block",
        wordWrap: "break-word",
        pt: "15px"
        // textAlign: 'center'
      }
      // [theme.breakpoints.down("sm")]: {
      //     fontSize: "0.650rem"
      // },
    }
  }
}

function AvaCount({ count = 0, name, onClick }) {
  const classes = useStyle()
  return (
    <Grid item xs={12} sm={4} md={4} lg={4}>
      <MDBox mb={2} lineHeight={1}>
        <Card sx={classes.mainCard} sm={8} md={8} lg={8} onClick={onClick}>
          <Grid
            container
            spacing={0}
            alignItems="center"
            justifyContent="start"
            pl={2}
            py={0}
            sx={{
              border: "2px solid",
              borderColor: count == 1 ? "green" : count == 2 && count == 3 ? "#FB8C00" : "red"
            }}
          >
            <Grid sx={classes.mainGrid} item md={10} xs={10}>
              <MDBox lineHeight={2.3}>
                <MDTypography
                  variant="button"
                  fontWeight="bold"
                  color="text"
                  textTransform="capitalize"
                  sx={classes.text}
                >
                  {name}
                </MDTypography>
                <Grid item mx={0} my={0.5}>
                  <MDBox lineHeight={1} textAlign="center" marginBottom="45px">
                    <MDTypography
                      variant="v4"
                      fontWeight="bold"
                      color="text"
                      textTransform="capitalize"
                    >
                      {count}
                    </MDTypography>
                  </MDBox>
                </Grid>
              </MDBox>
            </Grid>
            {/* <Grid item xs={2} md={2} lg={0} justifyContent="end" direction="row" display="flex">
              <MDBox
                lineHeight={1}
                sx={{
                  backgroundColor:
                    count == 1 ? "green" : count == 2 && count == 3 ? "#FB8C00" : "red",
                  color: count == 1 ? "green" : count == 2 && count == 3 ? "#FB8C00" : "red",
                  borderRadius: "0 10px 10px 0",
                  width: "30px",
                  // marginLeft: mdDown ? smDown ? "240px" : "30px" : "25px",
                  height: "130px"
                }}
                className={classes.endOfText}
              >
                testtest
              </MDBox>
            </Grid> */}
          </Grid>
        </Card>
      </MDBox>
    </Grid>
  )
}
AvaCount.defaultProps = {
  name: "",
  count: 0,
  onClick: () => {}
}

// Typechecking props for the AuthProvider
AvaCount.propTypes = {
  count: PropTypes.number,
  name: PropTypes.string,
  onClick: PropTypes.string
}
export default AvaCount
