/* eslint-disable react/prop-types */
import { Grid } from "@mui/material";
import DefaultStatisticsCard from "components/Cards/StatisticsCards/DefaultStatisticsCard";
import PropTypes from "prop-types";

function Counts({ name, count, onClick, xs, sm, md, fontSize, tooltip }) {
  return (
    <Grid item xs={xs} sm={sm} md={md} >
      <DefaultStatisticsCard title={name} count={count} fontSize={fontSize} tooltip={tooltip} onClick={onClick} />
    </Grid>
  );
}

// Setting default props for the AuthProvider
Counts.defaultProps = {
  name: "",
  count: 0,
  onClick: "",
  xs: 12,
  sm: 3,
  md: 3,
};

// Typechecking props for the AuthProvider
Counts.propTypes = {
  name: PropTypes.string,
  count: PropTypes.number,
  onClick: PropTypes.string,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
};

export default Counts;
