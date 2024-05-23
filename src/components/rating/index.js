/* eslint-disable react/jsx-no-useless-fragment */
import { Icon, Tooltip } from "@mui/material";
import MDTypography from "components/MDTypography";

/* eslint-disable react/prop-types */
function RatingPercentage({
  overallRating,
  title = "",
  currentRating,
  direction = true,
  display = "block"
}) {
  if (!overallRating || !currentRating) return <></>;
  const up = currentRating > overallRating;
  const percentageDifference = (currentRating * 100) / overallRating - 100;

  return (
    <MDTypography
      variant="caption"
      color="text"
      fontWeight="regular"
      sx={{ display, justifyContent: "center", alignItem: "center" }}
    >
      <Tooltip title={title} placement="top" arrow>
        <span
          style={{
            position: "relative",
            zIndex: 1,
            whiteSpace: "nowrap",
            background: direction
              ? up
                ? "linear-gradient(195deg,#459548, #375D38)"
                : "linear-gradient(195deg,#CF3F32, #68312D)"
              : up
              ? "linear-gradient(195deg,#CF3F32, #68312D)"
              : "linear-gradient(195deg,#459548, #375D38)",
            borderRadius: "0.375rem",
            padding: "4px",
            cursor: "default"
          }}
        >
          <MDTypography display="inline" variant="caption" verticalAlign="middle">
            {up ? (
              <Icon
                sx={{
                  color: "#FFF"
                }}
              >
                arrow_upward
              </Icon>
            ) : (
              <Icon
                sx={{
                  color: "#FFF"
                }}
              >
                arrow_downward
              </Icon>
            )}
          </MDTypography>
          <MDTypography variant="caption" color="#FFF" fontWeight="medium" ml="3px">
            {Math.abs(percentageDifference)?.toFixed(2)}%
          </MDTypography>
        </span>
      </Tooltip>
    </MDTypography>
  );
}

export default RatingPercentage;
