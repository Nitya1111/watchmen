import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "components/Footer";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import { useEffect, useState } from "react";
import { apiUrls } from "api/reactQueryConstant";

function Commander() {
  const [companyList, setCompanyList] = useState([]);
  const [selectCompany, setSelectCompany] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [selectDevice, setSelectDevice] = useState("");
  const [commandList, setCommandList] = useState([]);
  const [selectCommand, setSelectCommand] = useState("");
  const [directoryList, setDirectoryList] = useState([]);
  const [selectDirectory, setSelectDirectory] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const { axiosPrivate } = useAxiosPrivate();

  async function getCommanderData() {
    try {
      const commanderData = await axiosPrivate.get(apiUrls.getSuperAdminDetails);
      setCompanyList(commanderData.data.companies);
      setCommandList(commanderData.data.com_list);
      setDirectoryList(commanderData.data.dir_list);
    } catch (err) {
      console.log("err", err);
      if (!err?.response) {
        setErrMsg(translate("No response from server"));
      }
    }
  }

  useEffect(() => {
    const contro = new AbortController();
    getCommanderData();

    return () => {
      contro.abort();
    };
  }, []);
  useEffect(() => {
    const contro = new AbortController();

    setDeviceList([]);
    companyList?.filter(
      (company) => company.id === selectCompany && setDeviceList(company?.ava.concat(company?.tess))
    );

    return () => {
      contro.abort();
    };
  }, [selectCompany]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={0.5} pb={3} px={3}>
        <MDBox mb={2}>
          <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
            {errMsg}
          </MDTypography>
        </MDBox>
        <MDBox mb={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="select-company-label">{translate("Select company")}</InputLabel>
            <Select
              labelId="select-company-label"
              id="select-company"
              value={selectCompany}
              onChange={(e) => {
                setSelectCompany(e.target.value);
              }}
              label={translate("Select company")}
              sx={{
                minHeight: "45px"
              }}
            >
              {companyList?.map((list) => (
                <MenuItem value={list.id} key={list.name}>
                  {list.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MDBox>
        {selectCompany && (
          <MDBox mb={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="select-device-label">{translate("Select Device")}</InputLabel>
              <Select
                labelId="select-device-label"
                id="select-device"
                value={selectDevice}
                onChange={(e) => setSelectDevice(e.target.value)}
                label={translate("Select device")}
                sx={{
                  minHeight: "45px"
                }}
              >
                {deviceList?.map((list) => (
                  <MenuItem value={list.name} key={list.name}>
                    {list.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBox>
        )}
        <MDBox mb={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="select-command-label">{translate("Select Command")}</InputLabel>
            <Select
              labelId="select-command-label"
              id="select-command"
              value={selectCommand}
              onChange={(e) => setSelectCommand(e.target.value)}
              label={translate("Select command")}
              sx={{
                minHeight: "45px"
              }}
            >
              {commandList?.map((list) => (
                <MenuItem value={list} key={list}>
                  {list}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MDBox>
        <MDBox mb={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="select-directory-label">{translate("Select Directory")}</InputLabel>
            <Select
              labelId="select-directory-label"
              id="select-directory"
              value={selectDirectory}
              onChange={(e) => setSelectDirectory(e.target.value)}
              label={translate("Select directory")}
              sx={{
                minHeight: "45px"
              }}
            >
              {directoryList?.map((list) => (
                <MenuItem value={list} key={list}>
                  {list}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Commander;
