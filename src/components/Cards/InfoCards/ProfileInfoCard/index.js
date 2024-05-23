/* eslint-disable arrow-body-style */
/* eslint-disable react/prop-types */
/**
=========================================================
* Material Dashboard 2 PRO React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-routers components
import { Link } from "react-router-dom";

// @mui material components
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React base styles
import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";
import { useState } from "react";
import MDInput from "components/MDInput";
import { Autocomplete, Grid, InputAdornment, Stack, TextField } from "@mui/material";
import { useMaterialUIController } from "context";
import translate from "i18n/translate";
import MDCard from "components/MDCard";
import { CurrencyOptions, Timezones } from "utils/timezone";

function ProfileInfoCard({
  title,
  description,
  info,
  social,
  action,
  shadow,
  setCompanyDetails,
  timezone,
  addressline1,
  addressline2,
  city,
  state,
  country,
  zipcode,
  hourly_revenue,
  cost_per_hour,
  saveHandler,
  currency,
  setError,
  plantArea,
  wastePercentage,
  coolantOutput,
  renewableEnergyUsage,
  transportEfficiency,
  materialEfficiency
}) {
  const labels = [];
  const values = [];
  const { socialMediaColors, white } = colors;
  const { size } = typography;
  const [edit, setEdit] = useState(false);
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  // Convert this form `objectKey` of the object key in to this `object key`
  Object.keys(info).forEach((el) => {
    if (el.match(/[A-Z\s]+/)) {
      const uppercaseLetter = Array.from(el).find((i) => i.match(/[A-Z]+/));
      const newElement = el.replace(uppercaseLetter, ` ${uppercaseLetter.toLowerCase()}`);

      labels.push(newElement);
    } else {
      labels.push(el);
    }
  });

  // Push the object values into the values array
  Object.values(info).forEach((el) => values.push(el));

  const onChangeHandler = (field, value) => {
    setCompanyDetails((prev) => {
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Render the card info items
  const renderItems = labels.map((label, key) => (
    <MDBox key={label} display="flex" alignItems="center" py={1} pr={2}>
      {edit ? (
        <MDInput
          label={translate(label)}
          type="text"
          variant="outlined"
          value={values[key]}
          onChange={(e) => onChangeHandler(label, e.target.value)}
        />
      ) : (
        <>
          <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
            {translate(label)}: &nbsp;
          </MDTypography>
          <MDTypography variant="button" fontWeight="regular" color="text">
            &nbsp;{values[key]}
          </MDTypography>
        </>
      )}
    </MDBox>
  ));

  // Render the card social media icons
  const renderSocial = social?.map(({ link, icon, color }) => (
    <MDBox
      key={color}
      component="a"
      href={link}
      target="_blank"
      rel="noreferrer"
      fontSize={size.lg}
      color={socialMediaColors[color].main}
      pr={1}
      pl={0.5}
      lineHeight={1}
    >
      {icon}
    </MDBox>
  ));

  const editHandler = () => {
    setError();
    setEdit(!edit);
  };

  return (
    <MDCard sx={{ height: "100%", boxShadow: !shadow && "none" }}>
      <MDBox display="flex" justifyContent="flex-end" pt={2} px={2}>
        <MDTypography
          component={Link}
          to={action.route}
          variant="body2"
          color="secondary"
          onClick={editHandler}
        >
          {!edit ? (
            <Tooltip title={action.tooltip} placement="top">
              <Icon>edit</Icon>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Save Profile" placement="top">
                <Icon onClick={() => saveHandler()}>save as</Icon>
              </Tooltip>{" "}
              <Tooltip title="Cancel" placement="top">
                <Icon sx={{ marginRight: "5px" }}>cancel</Icon>
              </Tooltip>
            </>
          )}
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {edit ? (
          <MDInput
            type="text"
            label="Company Name"
            variant="outlined"
            value={title}
            fullWidth
            multiline
            inputProps={{ style: { color: darkMode ? white.main : "" } }}
            onChange={(e) => onChangeHandler("title", e.target.value)}
          />
        ) : (
          <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
            {title && translate(title)}
          </MDTypography>
        )}
      </MDBox>
      <MDBox p={2}>
        <MDBox mb={2} lineHeight={1}>
          {edit ? (
            <MDInput
              type="text"
              label="Description"
              variant="outlined"
              value={description}
              fullWidth
              multiline
              inputProps={{ style: { color: darkMode ? white.main : "" } }}
              onChange={(e) => onChangeHandler("description", e.target.value)}
            />
          ) : (
            <MDTypography variant="button" color="text" fontWeight="light">
              {description}
            </MDTypography>
          )}
        </MDBox>
        <MDBox opacity={0.5}>
          <Divider />
        </MDBox>
        <MDBox>
          {renderItems}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox key={timezone} display="flex" alignItems="center" py={1} pr={2}>
                {edit ? (
                  <Autocomplete
                    defaultValue={{ label: "UTC", value: "UTC" }}
                    value={timezone}
                    options={Timezones.map((time) => ({ label: time, value: time }))}
                    renderInput={(params) => (
                      <TextField {...params} label={translate("Timezone")} />
                    )}
                    onChange={(e, newValue) => {
                      onChangeHandler("timezone", newValue);
                    }}
                    sx={{ width: 300 }}
                  />
                ) : (
                  <>
                    <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
                      {translate("Timezone")}: &nbsp;
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      &nbsp;{timezone.value ?? ""}
                    </MDTypography>
                  </>
                )}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox key={currency} display="flex" alignItems="center" py={1} pr={2}>
                {edit ? (
                  <Autocomplete
                    defaultValue={{ label: "US Dollar - $", value: "USD", symbol: "$" }}
                    value={currency}
                    options={CurrencyOptions}
                    renderInput={(params) => (
                      <TextField {...params} label={translate("Currency")} />
                    )}
                    sx={{ width: 300 }}
                    onChange={(e, newValue) => onChangeHandler("currency", newValue)}
                  />
                ) : (
                  <>
                    <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
                      {translate("Currency")}: &nbsp;
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      &nbsp;{currency.label ?? ""}
                    </MDTypography>
                  </>
                )}
              </MDBox>
            </Grid>
          </Grid>

          <Grid container spacing={2} mt={1}>
            <Grid item sm={12} md={6} lg={4}>
              {edit ? (
                <MDInput
                  label="Address line 1"
                  type="text"
                  variant="outlined"
                  value={addressline1}
                  onChange={(e) => onChangeHandler("addressline1", e.target.value)}
                />
              ) : (
                <>
                  <MDTypography
                    variant="button"
                    fontWeight="bold"
                    textTransform="capitalize"
                    display="block"
                  >
                    {translate("Address line 1")}: &nbsp;
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="regular" color="text">
                    &nbsp;{addressline1}
                  </MDTypography>
                </>
              )}
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              {edit ? (
                <MDInput
                  label="Address line 2"
                  type="text"
                  variant="outlined"
                  value={addressline2}
                  onChange={(e) => onChangeHandler("addressline2", e.target.value)}
                />
              ) : (
                <>
                  <MDTypography
                    variant="button"
                    fontWeight="bold"
                    textTransform="capitalize"
                    display="block"
                  >
                    {translate("Address line 2")}
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="regular" color="text">
                    &nbsp;{addressline2}
                  </MDTypography>
                </>
              )}
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              {edit ? (
                <MDInput
                  label="City"
                  type="text"
                  variant="outlined"
                  value={city}
                  onChange={(e) => onChangeHandler("city", e.target.value)}
                />
              ) : (
                <>
                  <MDTypography
                    variant="button"
                    fontWeight="bold"
                    textTransform="capitalize"
                    display="block"
                  >
                    {translate("City")}
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="regular" color="text">
                    &nbsp;{city}
                  </MDTypography>
                </>
              )}
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              {edit ? (
                <MDInput
                  label="State"
                  type="text"
                  variant="outlined"
                  value={state}
                  onChange={(e) => onChangeHandler("state", e.target.value)}
                />
              ) : (
                <>
                  <MDTypography
                    variant="button"
                    fontWeight="bold"
                    textTransform="capitalize"
                    display="block"
                  >
                    {translate("State")}
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="regular" color="text">
                    &nbsp;{state}
                  </MDTypography>
                </>
              )}
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              {edit ? (
                <MDInput
                  label="Country"
                  type="text"
                  variant="outlined"
                  value={country}
                  onChange={(e) => onChangeHandler("country", e.target.value)}
                />
              ) : (
                <>
                  <MDTypography
                    variant="button"
                    fontWeight="bold"
                    textTransform="capitalize"
                    display="block"
                  >
                    {translate("Country")}
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="regular" color="text">
                    &nbsp;{country}
                  </MDTypography>
                </>
              )}
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              {edit ? (
                <MDInput
                  label="Zipcode"
                  type="text"
                  variant="outlined"
                  value={zipcode}
                  onChange={(e) => onChangeHandler("zipcode", e.target.value)}
                />
              ) : (
                <>
                  <MDTypography
                    variant="button"
                    fontWeight="bold"
                    textTransform="capitalize"
                    display="block"
                  >
                    {translate("Zipcode")}
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="regular" color="text">
                    &nbsp;{zipcode}
                  </MDTypography>
                </>
              )}
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              {edit ? (
                <MDInput
                  label="Est. Hourly Revenue"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MDTypography variant="button"> €/hr.</MDTypography>
                      </InputAdornment>
                    )
                  }}
                  variant="outlined"
                  value={hourly_revenue}
                  onChange={(e) => onChangeHandler("hourly_revenue", parseFloat(e.target.value))}
                />
              ) : (
                <>
                  <MDTypography
                    variant="button"
                    fontWeight="bold"
                    textTransform="capitalize"
                    display="block"
                  >
                    {translate("Est. Hourly Revenue")}
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="regular" color="text">
                    &nbsp;{hourly_revenue} €/hr.
                  </MDTypography>
                </>
              )}
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              {edit ? (
                <MDInput
                  label="Est. Hourly Cost"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MDTypography variant="button"> €/hr.</MDTypography>
                      </InputAdornment>
                    )
                  }}
                  variant="outlined"
                  value={cost_per_hour}
                  onChange={(e) => onChangeHandler("cost_per_hour", parseFloat(e.target.value))}
                />
              ) : (
                <>
                  <MDTypography
                    variant="button"
                    fontWeight="bold"
                    textTransform="capitalize"
                    display="block"
                  >
                    {translate("Est. Hourly Cost")}
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="regular" color="text">
                    &nbsp;{cost_per_hour} €/hr.
                  </MDTypography>
                </>
              )}
            </Grid>
          </Grid>
          <MDBox opacity={0.5}>
            <Divider />
          </MDBox>
          <Stack mt={2}>
            <MDTypography variant="h5" fontWeight="medium">
              {translate("Sustainability Check")}
              <Tooltip title={translate("SustainabilityCheckInfo")} style={{ marginLeft: 10 }}>
                <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
              </Tooltip>
            </MDTypography>
            <Grid container spacing={2} mt={1}>
              <Grid item sm={12} md={6} lg={4}>
                {edit ? (
                  <MDInput
                    label="Factory Area"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MDTypography variant="button">sq.mt</MDTypography>
                          <Tooltip title={translate("PlantAreaInfo")} style={{ marginLeft: 10 }}>
                            <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                    variant="outlined"
                    value={plantArea}
                    onChange={(e) => onChangeHandler("plant_area", e.target.value)}
                  />
                ) : (
                  <>
                    <MDTypography
                      variant="button"
                      fontWeight="bold"
                      textTransform="capitalize"
                      display="block"
                    >
                      {translate("Factory Area")}
                      <Tooltip title={translate("PlantAreaInfo")} style={{ marginLeft: 10 }}>
                        <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                      </Tooltip>
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      &nbsp;{plantArea} sq.mt
                    </MDTypography>
                  </>
                )}
              </Grid>
              <Grid item sm={12} md={6} lg={4}>
                {edit ? (
                  <MDInput
                    label="Output Waste Percentage"
                    type="number"
                    variant="outlined"
                    value={wastePercentage}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MDTypography variant="button">%</MDTypography>
                          <Tooltip
                            title={translate("WastePercentageInfo")}
                            style={{ marginLeft: 10 }}
                          >
                            <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                    onChange={(e) =>
                      onChangeHandler("waste_percentage", parseInt(e.target.value, 10))
                    }
                  />
                ) : (
                  <>
                    <MDTypography
                      variant="button"
                      fontWeight="bold"
                      textTransform="capitalize"
                      display="block"
                    >
                      {translate("Output Waste Percentage")}
                      <Tooltip title={translate("WastePercentageInfo")} style={{ marginLeft: 10 }}>
                        <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                      </Tooltip>
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      &nbsp;{wastePercentage} %
                    </MDTypography>
                  </>
                )}
              </Grid>

              <Grid item sm={12} md={6} lg={4}>
                {edit ? (
                  <MDInput
                    label="Renewable Energy Percentage"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MDTypography variant="button">%</MDTypography>
                          <Tooltip
                            title={translate("RenewablePercentageInfo")}
                            style={{ marginLeft: 10 }}
                          >
                            <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                    variant="outlined"
                    value={renewableEnergyUsage}
                    onChange={(e) =>
                      onChangeHandler("renewable_energy_usage", parseInt(e.target.value, 10))
                    }
                  />
                ) : (
                  <>
                    <MDTypography
                      variant="button"
                      fontWeight="bold"
                      textTransform="capitalize"
                      display="block"
                    >
                      {translate("Renewable Energy Percentage")}
                      <Tooltip
                        title={translate("RenewablePercentageInfo")}
                        style={{ marginLeft: 10 }}
                      >
                        <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                      </Tooltip>
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      &nbsp;{renewableEnergyUsage} %
                    </MDTypography>
                  </>
                )}
              </Grid>
              <Grid item sm={12} md={6} lg={4}>
                {edit ? (
                  <MDInput
                    label="Coolant Output (in lts.)"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MDTypography variant="button">lts.</MDTypography>
                          <Tooltip
                            title={translate("CoolantOutputInfo")}
                            style={{ marginLeft: 10 }}
                          >
                            <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                    variant="outlined"
                    value={coolantOutput}
                    onChange={(e) => onChangeHandler("coolant_output", e.target.value)}
                  />
                ) : (
                  <>
                    <MDTypography
                      variant="button"
                      fontWeight="bold"
                      textTransform="capitalize"
                      display="block"
                    >
                      {translate("Coolant Output (in lts.)")}
                      <Tooltip title={translate("CoolantOutputInfo")} style={{ marginLeft: 10 }}>
                        <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                      </Tooltip>
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      &nbsp;{coolantOutput} lts.
                    </MDTypography>
                  </>
                )}
              </Grid>
              <Grid item sm={12} md={6} lg={4}>
                {edit ? (
                  <MDInput
                    label="Transport Efficiency"
                    type="number"
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MDTypography variant="button">%</MDTypography>
                          <Tooltip
                            title={translate("TransportEfficiencyInfo")}
                            style={{ marginLeft: 10 }}
                          >
                            <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                    value={transportEfficiency}
                    onChange={(e) =>
                      onChangeHandler("transport_efficiency", parseInt(e.target.value, 10))
                    }
                  />
                ) : (
                  <>
                    <MDTypography
                      variant="button"
                      fontWeight="bold"
                      textTransform="capitalize"
                      display="block"
                    >
                      {translate("Transport Efficiency")}
                      <Tooltip
                        title={translate("TransportEfficiencyInfo")}
                        style={{ marginLeft: 10 }}
                      >
                        <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                      </Tooltip>
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      &nbsp;{transportEfficiency} %
                    </MDTypography>
                  </>
                )}
              </Grid>
              <Grid item sm={12} md={6} lg={4}>
                {edit ? (
                  <MDInput
                    label="Material Efficiency"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MDTypography variant="button">%</MDTypography>
                          <Tooltip
                            title={translate("MaterialEfficiencyInfo")}
                            style={{ marginLeft: 10 }}
                          >
                            <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                    variant="outlined"
                    value={materialEfficiency}
                    onChange={(e) =>
                      onChangeHandler("material_efficiency", parseInt(e.target.value, 10))
                    }
                  />
                ) : (
                  <>
                    <MDTypography
                      variant="button"
                      fontWeight="bold"
                      textTransform="capitalize"
                      display="block"
                    >
                      {translate("Material Efficiency")}
                      <Tooltip
                        title={translate("MaterialEfficiencyInfo")}
                        style={{ marginLeft: 10 }}
                      >
                        <Icon style={{ color: "white", marginLeft: "10px" }}>info</Icon>
                      </Tooltip>
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      &nbsp;{materialEfficiency} %
                    </MDTypography>
                  </>
                )}
              </Grid>
            </Grid>
          </Stack>

          {social && (
            <MDBox display="flex" py={1} pr={2}>
              <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
                social: &nbsp;
              </MDTypography>
              {renderSocial}
            </MDBox>
          )}
        </MDBox>
      </MDBox>
    </MDCard>
  );
}

// Setting default props for the ProfileInfoCard
ProfileInfoCard.defaultProps = {
  shadow: true
};

export default ProfileInfoCard;
