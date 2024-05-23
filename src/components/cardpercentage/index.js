import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import PropTypes from "prop-types";

import { Grid, Icon, Tooltip, useTheme } from "@mui/material";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import translate from "i18n/translate";
import LabeledProgress from "../labeledProgress";

export const useStyle = () => {
  const theme = useTheme();
  return {
    mainCard: {
      "& .MuiGrid-root": {
        "& .MuiGrid-item": {
          backgroundColor: "red",
          color: "green"
        }
      }
    },
    labeledProgressGrid: {
      [theme.breakpoints.down("lg")]: {
        display: "flex",
        justifyContent: "center"
      }
      // [theme.breakpoints.down("md")]: {
      //   marginLeft: "20%"
      // },
      // [theme.breakpoints.down("sm")]: {
      //   marginLeft: 0
      // },
    }
  };
};

function CardPercentage({ value, count = 0, size, name, tooltip = "tooltip" }) {
  const classes = useStyle();

  return (
    <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
      <MDBox mb={2} lineHeight={1}>
        <Card style={{ cursor: "pointer" }}>
          <Grid item spacing={3} alignItems="center" justifyContent="center" pl={2} py={0}>
            {/* <Grid item md={12} xs={12} sm={12} className={classes.mainCard}> */}
            <MDBox lineHeight={2}>
              <Grid item textAlign="start">
                <MDBox mt={1} mr={1} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    color="text"
                    textTransform="capitalize"
                  >
                    {name}
                  </MDTypography>
                  <Tooltip title={translate(tooltip)} placement="top" arrow>
                    <MDButton variant="outlined" color="secondary" size="small" circular iconOnly>
                      <Icon>priority_high</Icon>
                    </MDButton>
                  </Tooltip>
                </MDBox>
                <Grid sx={classes.labeledProgressGrid} item textAlign="center" minHeight={100}>
                  {/* <Grid sx={classes.labeledProgressGrid} item mx={12} my={0.5} textAlign="center"  > */}
                  <LabeledProgress value={value} count={count} size={size} />
                </Grid>
              </Grid>
            </MDBox>
            {/* </Grid> */}
          </Grid>
        </Card>
      </MDBox>
    </Grid>
  );
}

CardPercentage.defaultProps = {
  value: 0,
  count: 0,
  name: "",
  size: 0,
  tooltip: "tooltip"
};

// Typechecking props for the AuthProvider
CardPercentage.propTypes = {
  name: PropTypes.string,
  tooltip: PropTypes.string,
  value: PropTypes.number,
  size: PropTypes.number,
  count: PropTypes.number
  // xs: PropTypes.number,
  // sm: PropTypes.number,
  // md: PropTypes.number
};
export default CardPercentage;
