/* eslint-disable react/prop-types */
// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// Material Dashboard 2 PRO React components
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import MDCard from "components/MDCard";
import { useMaterialUIController } from "context";
import { useEffect, useState } from "react";
import LabeledProgress from "../labeledProgress";

export const useStyle = () => {
  const theme = useTheme();
  return {
    progressBox: {
      [theme.breakpoints.up("xl")]: {
        padding: "10px 0"
      }
    }
  };
};

function MachineInfo({
  name,
  model,
  description,
  tags,
  hall,
  health,
  onClick,
  state,
  machineStatusData
}) {
  const theme = useTheme();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedMachineStatusValue, setSelectedMachineStatusValue] = useState([]);

  const handleMouseOver = (item) => {
    setSelectedMachineStatusValue(item);
  };

  const handleMouseOut = () => {
    let currentShiftIndex = Object.keys(machineStatusData?.shift_data || {}).length - 1;

    Object.values(machineStatusData?.shift_data || {}).map((data, index) => {
      const currentShift = Object.keys(machineStatusData.shift_data)[index];
      if (currentShift === machineStatusData?.live_shift) {
        currentShiftIndex = index;
      }
      return null;
    });
    setSelectedMachineStatusValue({
      data: Object.values(machineStatusData?.shift_data)?.[currentShiftIndex],
      index: currentShiftIndex
    });
  };
  useEffect(() => {
    if (machineStatusData?.shift_data) {
      handleMouseOut();
    }
  }, [machineStatusData]);
  // eslint-disable-next-line no-unused-vars

  const machineShiftKey = Object.keys(machineStatusData?.shift_data || {});
  const machineStatusValue =
    machineStatusData?.shift_data && Object.values(machineStatusData?.shift_data);

  return (
    <Grid item xs={12} sm={12} md={12} lg={12} width="100%" minHeight="250px">
      <MDBox mb={2} lineHeight={1} height="-webkit-fill-available">
        <MDCard
          xs={12}
          sm={12}
          md={12}
          lg={12}
          onClick={onClick}
          sx={{
            pb: 2,
            pt: 2,
            border: 2,
            borderRadius: 1,
            borderColor:
              state === 1
                ? "yellow"
                : state === 2
                ? "green"
                : state === 3
                ? "blue"
                : state === 4
                ? "gray"
                : "red",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "-webkit-fill-available"
          }}
        >
          <Grid
            container
            alignItems="center"
            justifyContent="start"
            py={0}
            style={{ cursor: "pointer" }}
          >
            {smDown ? (
              <>
                <Grid container display="flex" justifyContent="center" xs={12} md={4} lg={4}>
                  <MDBox lineHeight={1} className="MachineInfo">
                    {selectedMachineStatusValue && (
                      <LabeledProgress
                        value={health * 100}
                        count={health * 100}
                        machineStatusData={selectedMachineStatusValue.data}
                        height={240}
                        width={240}
                        fontSize="18px"
                        hollowSize="35%"
                        // label={selectedMachineStatusValue.index !== 0}
                      />
                    )}
                  </MDBox>
                </Grid>
                <Grid display="flex" sx={{ width: "100%" }} xs={12}>
                  <Grid item xs={8} sx={{ px: "1rem" }} md={5} lg={5}>
                    <MDBox mb={0.5} lineHeight={1}>
                      <MDTypography
                        variant="h5"
                        fontWeight="medium"
                        color="text"
                        textTransform="capitalize"
                      >
                        {name}
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={0.5} lineHeight={1}>
                      <MDTypography
                        variant="button"
                        fontWeight="medium"
                        color="text"
                        textTransform="capitalize"
                      >
                        {model}
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={0.5} lineHeight={1}>
                      <MDTypography
                        variant="button"
                        fontWeight="medium"
                        color="text"
                        textTransform="capitalize"
                      >
                        {description}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={4} md={2} lg={2}>
                    {hall.id && (
                      <MDBox mb={0.5} lineHeight={1} key={hall.id}>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          textTransform="capitalize"
                          sx={{
                            background: "linear-gradient(90deg, rgb(31 50 59), rgb(40, 40, 40))",
                            whiteSpace: "noWrap",
                            borderRadius: "0.5rem",
                            padding: "2px 5px"
                          }}
                        >
                          {hall.name}
                        </MDTypography>
                      </MDBox>
                    )}

                    {tags.map((tag) => (
                      <MDBox mb={0.5} lineHeight={1} key={tag.id}>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          textTransform="capitalize"
                          sx={{
                            background: `linear-gradient(195deg, #640101, rgb(51, 51, 51))`,
                            whiteSpace: "noWrap",
                            borderRadius: "0.5rem",
                            padding: "2px 5px"
                          }}
                        >
                          {tag.name}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </Grid>
                </Grid>
                <Grid container display="flex" justifyContent="center" alignItems="center" mt={3}>
                  <Grid item xs={10}>
                    {machineShiftKey.map((item, index) => (
                      <MDBox
                        variant="gradient"
                        sx={({ palette: { background } }) => ({
                          background: darkMode && background.card,
                          p: "10px 15px",
                          borderRadius: "10px",
                          marginRight: "5px"
                        })}
                      >
                        <MDTypography
                          onMouseOver={() =>
                            handleMouseOver({ data: machineStatusValue[index], index })
                          }
                          onMouseOut={handleMouseOut}
                          variant="button"
                          fontWeight="medium"
                          color="text"
                          textTransform="capitalize"
                        >
                          {machineShiftKey.length > 2 ? `${item.substring(0, 5)}...` : item}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </Grid>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={5} md={5} lg={5} flexDirection="row" display="flex">
                  {selectedMachineStatusValue && (
                    <LabeledProgress
                      value={health * 100}
                      count={health * 100}
                      machineStatusData={selectedMachineStatusValue.data}
                      height={240}
                      width={240}
                      fontSize="18px"
                      hollowSize="35%"
                      // label={selectedMachineStatusValue.index !== 0}
                    />
                  )}
                </Grid>
                <Grid container xs={7} ms={7} lg={7}>
                  <Grid item xs={6} md={6} lg={7}>
                    <MDBox mb={0.5} lineHeight={1}>
                      <MDTypography
                        fontWeight="medium"
                        variant="h5"
                        color="text"
                        textTransform="capitalize"
                      >
                        {name}
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={0.5} lineHeight={1}>
                      <MDTypography
                        variant="button"
                        fontWeight="medium"
                        color="text"
                        textTransform="capitalize"
                      >
                        {model}
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={0.5} lineHeight={1}>
                      <MDTypography
                        variant="button"
                        fontWeight="medium"
                        color="text"
                        textTransform="capitalize"
                      >
                        {description}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={2} md={2} lg={2}>
                    {hall.id && (
                      <MDBox mb={0.5} lineHeight={1} key={hall.id}>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          textTransform="capitalize"
                          sx={{
                            background: "linear-gradient(90deg, rgb(31 50 59), rgb(40, 40, 40))",
                            whiteSpace: "noWrap",
                            borderRadius: "0.5rem",
                            padding: "2px 5px"
                          }}
                        >
                          {hall.name}
                        </MDTypography>
                      </MDBox>
                    )}

                    {tags.map((tag) => (
                      <MDBox mb={0.5} lineHeight={1} key={tag.id}>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          textTransform="capitalize"
                          sx={{
                            background: `linear-gradient(195deg, #640101, rgb(51, 51, 51))`,
                            whiteSpace: "noWrap",
                            borderRadius: "0.5rem",
                            padding: "2px 5px"
                          }}
                        >
                          {tag.name}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </Grid>
                  <Grid container justifyContent="start" spacing={3}>
                    <Grid item display="flex" mt={2}>
                      {machineShiftKey.map((item, index) => (
                        <MDBox
                          variant="gradient"
                          sx={({ palette: { background } }) => ({
                            background: background.card,
                            border: `1px solid ${
                              selectedMachineStatusValue.index === index
                                ? state === 1
                                  ? "yellow"
                                  : state === 2
                                  ? "green"
                                  : state === 3
                                  ? "blue"
                                  : state === 4
                                  ? "gray"
                                  : "red"
                                : "transparent"
                            }`,
                            p: "10px 15px",
                            borderRadius: "10px",
                            marginRight: "5px"
                          })}
                        >
                          <MDTypography
                            onMouseOver={() =>
                              handleMouseOver({ data: machineStatusValue[index], index })
                            }
                            onMouseOut={handleMouseOut}
                            variant="button"
                            fontWeight="medium"
                            color="text"
                            textTransform="capitalize"
                          >
                            {machineShiftKey.length > 2 ? `${item.substring(0, 5)}...` : item}
                          </MDTypography>
                        </MDBox>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </MDCard>
      </MDBox>
    </Grid>
  );
}

// Declaring default props for DefaultNavbar
MachineInfo.defaultProps = {
  // id: "",
  onClick: "",
  health: 0,
  name: "",
  model: "",
  description: "",
  tags: [],
  state: ""
};

// Typechecking props for the ComplexStatisticsCard
MachineInfo.propTypes = {
  // id: PropTypes.number,
  onClick: PropTypes.func,
  health: PropTypes.number,
  name: PropTypes.string,
  model: PropTypes.string,
  description: PropTypes.string,
  state: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string)
};

export default MachineInfo;
