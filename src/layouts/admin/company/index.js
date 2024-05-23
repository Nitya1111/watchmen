/* eslint-disable no-shadow */
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveIcon from "@mui/icons-material/Remove";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { apiUrls } from "api/reactQueryConstant";
import DefaultCell from "components/DefaultCell";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import Loader from "components/Loader";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import ConfirmationDialog from "components/MDDialog/ConfirmationDialog";
import MDSnackbar from "components/MDSnackbar";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import DataTable from "components/Tables/DataTable";
import AddAVACompany from "components/modal/addAVACompany";
import {
  setAddCompany,
  setOpenNewAvaForm,
  setOpenNewCompanyForm,
  setOpenNewTessForm,
  setOpenNewUserForm,
  useMaterialUIController
} from "context";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import translate from "i18n/translate";
import { useEffect, useState } from "react";
import NewAva from "./modals/NewAva";
import NewCompany from "./modals/NewCompany";
import NewTess from "./modals/NewTess";
import NewUser from "./modals/NewUser";

// function createData(name, calories, fat, carbs, protein) {
//   return { name, calories, fat, carbs, protein };
// }

// const rows = [
//   createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
//   createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
//   createData("Eclair", 262, 16.0, 24, 6.0),
//   createData("Cupcake", 305, 3.7, 67, 4.3),
//   createData("Gingerbread", 356, 16.0, 49, 3.9)
// ];

function Company() {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [controller, dispatch] = useMaterialUIController();
  const {
    darkMode,
    openNewCompanyForm,
    openNewAvaForm,
    openNewTessForm,
    openNewUserForm,
    openAddCompanyForm
  } = controller;

  const { axiosPrivate } = useAxiosPrivate();
  const [companyData, setCompanyData] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [AVACompany, setAVACompany] = useState(null);
  const [updateUser, setUpdateUser] = useState(null);
  const [updateAva, setUpdateAva] = useState(null);
  const [updateTess, setUpdateTess] = useState(null);
  const [refetch, setRefetch] = useState(false);
  const [userDeleteConfirm, setUserDeleteConfirm] = useState(null);
  const [avaUnassignedDeleteConfirm, setAvaUnassignedDeleteConfirm] = useState(null);
  const [avaDeleteConfirm, setAvaDeleteConfirm] = useState(null);
  const [avaCompanyDeleteConfirm, setAvaCompanyDeleteConfirm] = useState(null);
  const [successSB, setSuccessSB] = useState(null);
  const [isLicenseShow, setLicenseShow] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const closeSuccessSB = () => setSuccessSB(null);

  useEffect(() => {
    let isMounted = true;
    const contro = new AbortController();
    const data = async () => {
      try {
        const response = await axiosPrivate.get(apiUrls.getSuperAdminDetails, {
          signal: contro.signal
        });
        if (isMounted) {
          setIsLoading(false);
          setCompanyData(response.data);
          if (currentCompany) {
            setCurrentCompany(
              response.data.company_list.find((company) => company.id === currentCompany.id)
            );
          } else {
            setCurrentCompany(response.data.company_list[0]);
          }
        }
      } catch (err) {
        setIsLoading(false);
        console.log(err);
      }
      try {
        const responseAva = await axiosPrivate.get(apiUrls.getSuperAdminAVADetails);
        if (responseAva.data.status === 1) {
          setIsLoading(false);
          setAVACompany(responseAva.data.ava_list);
        }
      } catch (err) {
        setIsLoading(false);
        console.log(err);
      }
    };

    data();

    return () => {
      isMounted = false;
      contro.abort();
    };
  }, [refetch]);

  const changeCompanyHandler = (id) => {
    const company = companyData.company_list.find((company) => company.id === id);
    setCurrentCompany(company);
  };

  const editUserHandler = (id) => {
    const user = currentCompany.user_list.find((user) => user.id === id);
    setUpdateUser(user);
    setOpenNewUserForm(dispatch, !openNewUserForm);
  };

  const editAvaHandler = (id, isUnassigned) => {
    if (isUnassigned) {
      const ava = AVACompany.find((ava) => ava.id === id);
      setUpdateAva(ava);
      setOpenNewAvaForm(dispatch, !openNewAvaForm);
      return;
    }
    const ava = currentCompany.ava_list.find((ava) => ava.id === id);
    setUpdateAva(ava);
    setOpenNewAvaForm(dispatch, !openNewAvaForm);
  };

  const addAvaHandler = (id) => {
    const ava = AVACompany.find((ava) => ava.id === id);
    setUpdateAva(ava);
    setAddCompany(dispatch, !openAddCompanyForm);
  };

  const deleteUserHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await axiosPrivate.delete(`v2/user/${userDeleteConfirm}`);
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        setRefetch(!refetch);
        setUserDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setUserDeleteConfirm(null);
    }
  };

  const deleteAvaUnassignedHandler = async (confirm) => {
    if (confirm) {
      try {
        const data = {
          company_id: currentCompany.id
        };
        const response = await axiosPrivate.delete(
          apiUrls.sendAvaData + avaUnassignedDeleteConfirm,
          {
            data
          }
        );
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        setRefetch(!refetch);
        setAvaUnassignedDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setAvaUnassignedDeleteConfirm(null);
    }
  };
  const deleteAvaCompanyHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await axiosPrivate.put(apiUrls.sendAvaData + avaCompanyDeleteConfirm, {
          company_id: null
        });
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        setRefetch(!refetch);
        setAvaCompanyDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setAvaCompanyDeleteConfirm(null);
    }
  };
  const deleteAvaHandler = async (confirm) => {
    if (confirm) {
      try {
        const data = {
          company_id: currentCompany.id
        };
        const response = await axiosPrivate.delete(apiUrls.sendAvaData + avaDeleteConfirm, {
          data
        });
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        setRefetch(!refetch);
        setAvaDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setAvaDeleteConfirm(null);
    }
  };

  const activeUserHandler = async (id, active) => {
    const userData = {
      active: !active
    };
    const response = await axiosPrivate.put(`v2/user/${id}`, userData);
    if (response.status === 200) {
      setRefetch(!refetch);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <MDBox mb={1} mt={3} ml={2}>
            <MDTypography variant="h5" fontWeight="medium">
              Ava Unassigned
            </MDTypography>
          </MDBox>
          {AVACompany && (
            <DataTable
              table={{
                columns: [
                  {
                    Header: "name",
                    accessor: "name",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },

                  {
                    Header: "mac_id",
                    accessor: "mac_id",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  {
                    Header: "edge_id",
                    accessor: "edge_id",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  {
                    Header: "hostname",
                    accessor: "hostname",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  // {
                  //   Header: "machine name",
                  //   id: "machine_name",
                  //   accessor: "machine_id",
                  //   Cell: ({ value }) => {
                  //     const machine = currentCompany?.machine_list?.find(
                  //       (machine) => machine.id === value
                  //     );
                  //     return <DefaultCell value={machine ? machine.name : ""} />;
                  //   }
                  // },
                  // {
                  //   Header: "machine id",
                  //   accessor: "machine_id",
                  //   Cell: ({ value }) => <DefaultCell value={value} />
                  // },
                  {
                    Header: "",
                    id: "delete_icon",
                    accessor: "id",
                    align: "right",
                    width: "50px",
                    isSortedColumn: false,
                    Cell: ({ value }) => (
                      <>
                        <EditIcon onClick={() => editAvaHandler(value, true)} />
                        <DeleteIcon
                          sx={{ margin: "0 10px", cursor: "pointer" }}
                          onClick={() => setAvaUnassignedDeleteConfirm(value)}
                        />
                        <AddIcon
                          sx={{ margin: "0", cursor: "pointer" }}
                          onClick={() => addAvaHandler(value)}
                        />
                      </>
                    )
                  }
                ],
                rows: AVACompany.sort((a, b) => a.id - b.id)
              }}
              entriesPerPage={false}
              showTotalEntries={false}
            />
          )}

          {/* <MDBox py={3}>
            <MDBox mb={3}>Logged in as</MDBox>
          </MDBox> */}

          <MDBox mt={4} mb={3} display="flex" justifyContent="space-between">
            <Stack spacing={2} direction={smDown ? "column" : "row"}>
              <MDBox display="flex" sx={{ alignItems: "center" }}>
                {companyData && currentCompany && (
                  <FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="select-company-label">{translate("Company")}</InputLabel>
                    <Select
                      labelId="select-company-label"
                      id="select-company-label"
                      value={currentCompany.id}
                      onChange={(e) => changeCompanyHandler(e.target.value)}
                      sx={{
                        minHeight: "45px"
                      }}
                      label={translate("Company")}
                    >
                      {companyData.company_list.map((company) => (
                        <MenuItem value={company.id} key={company.name}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {currentCompany?.license && (
                  <>
                    {isLicenseShow ? (
                      <MDBox display="flex" sx={{ alignItems: "center" }}>
                        <MDTypography
                          variant="h6"
                          sx={{ marginLeft: "10px", marginTop: "5px", fontWeight: "normal" }}
                        >
                          {currentCompany?.license?.split("")?.map(() => "*")}
                        </MDTypography>
                        <VisibilityIcon
                          sx={{ marginLeft: "10px" }}
                          onClick={() => setLicenseShow(false)}
                        />
                      </MDBox>
                    ) : (
                      <MDBox display="flex" sx={{ alignItems: "center" }}>
                        <MDTypography
                          variant="h6"
                          sx={{ marginLeft: "10px", fontWeight: "normal" }}
                        >
                          {currentCompany?.license}
                        </MDTypography>
                        <VisibilityOffIcon
                          sx={{ marginLeft: "10px" }}
                          onClick={() => setLicenseShow(true)}
                        />{" "}
                      </MDBox>
                    )}
                  </>
                )}
              </MDBox>
            </Stack>
            <Stack
              spacing={2}
              direction={smDown ? "column" : "row"}
              justifyContent="end"
              sx={{ minHeight: "43px", height: "43px" }}
            >
              <MDButton
                variant={darkMode ? "contained" : "outlined"}
                color="dark"
                size="medium"
                // variant="gradient"
                onClick={() => setOpenNewCompanyForm(dispatch, !openNewCompanyForm)}
              >
                {translate("Add Company")}
              </MDButton>
              <MDButton
                variant={darkMode ? "contained" : "outlined"}
                color="dark"
                size="medium"
                onClick={() => setOpenNewAvaForm(dispatch, !openNewAvaForm)}
              >
                {translate("Add Ava")}
              </MDButton>
              {/* <MDButton
                variant={darkMode ? "contained" : "outlined"}
                color="dark"
                size="medium"
                onClick={() => setOpenNewTessForm(dispatch, !openNewTessForm)}
              >
                {translate("Add Tess")}
              </MDButton> */}
              <MDButton
                variant={darkMode ? "contained" : "outlined"}
                color="dark"
                size="medium"
                onClick={() => setOpenNewUserForm(dispatch, !openNewUserForm)}
              >
                {translate("Add User")}
              </MDButton>
            </Stack>
          </MDBox>

          <MDBox mb={1} ml={2} mt={3}>
            <MDTypography variant="h5" fontWeight="medium">
              {translate("users")}
            </MDTypography>
          </MDBox>
          {currentCompany && (
            <DataTable
              table={{
                columns: [
                  {
                    Header: "name",
                    accessor: "name",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  {
                    Header: "email",
                    accessor: "email",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  {
                    Header: "role",
                    accessor: "role",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  {
                    Header: "active",
                    accessor: "active",
                    Cell: ({ row }) => (
                      <Switch
                        checked={row?.original?.active}
                        onClick={() => activeUserHandler(row?.original?.id, row?.original?.active)}
                      />
                    )
                  },
                  {
                    Header: "",
                    id: "delete_icon",
                    accessor: "id",
                    align: "right",
                    width: "50px",
                    isSortedColumn: false,
                    Cell: ({ value }) => (
                      <>
                        <EditIcon onClick={() => editUserHandler(value)} />
                        <DeleteIcon
                          sx={{ margin: "0 10px", cursor: "pointer" }}
                          onClick={() => setUserDeleteConfirm(value)}
                        />
                      </>
                    )
                  }
                ],
                rows: currentCompany?.user_list.sort((a, b) => a.id - b.id)
              }}
              entriesPerPage={false}
              showTotalEntries={false}
            />
          )}

          <MDBox mb={1} mt={3} ml={2}>
            <MDTypography variant="h5" fontWeight="medium">
              Ava
            </MDTypography>
          </MDBox>
          {currentCompany && (
            <DataTable
              table={{
                columns: [
                  {
                    Header: "name",
                    accessor: "name",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },

                  {
                    Header: "mac_id",
                    accessor: "mac_id",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  {
                    Header: "edge_id",
                    accessor: "edge_id",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  {
                    Header: "hostname",
                    accessor: "hostname",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  {
                    Header: "machine name",
                    id: "machine_name",
                    accessor: "machine_id",
                    Cell: ({ value }) => {
                      const machine = currentCompany?.machine_list?.find(
                        (machine) => machine.id === value
                      );
                      return <DefaultCell value={machine ? machine.name : ""} />;
                    }
                  },
                  {
                    Header: "machine id",
                    accessor: "machine_id",
                    Cell: ({ value }) => <DefaultCell value={value} />
                  },
                  {
                    Header: "",
                    id: "delete_icon",
                    accessor: "id",
                    align: "right",
                    width: "50px",
                    isSortedColumn: false,
                    Cell: ({ value }) => (
                      <>
                        <EditIcon onClick={() => editAvaHandler(value, false)} />
                        <DeleteIcon
                          sx={{ margin: "0 10px", cursor: "pointer" }}
                          onClick={() => setAvaDeleteConfirm(value)}
                        />
                        <RemoveIcon
                          sx={{ margin: "0", cursor: "pointer" }}
                          onClick={() => setAvaCompanyDeleteConfirm(value)}
                        />
                      </>
                    )
                  }
                ],
                rows: currentCompany?.ava_list.sort((a, b) => a.id - b.id)
              }}
              entriesPerPage={false}
              showTotalEntries={false}
            />
          )}

          <NewCompany />
          <NewAva
            ava={updateAva}
            setAva={setUpdateAva}
            setSuccessSB={setSuccessSB}
            currentCompany={currentCompany}
            refetch={() => setRefetch(!refetch)}
          />
          <NewTess
            tess={updateTess}
            setTess={setUpdateTess}
            setSuccessSB={setSuccessSB}
            currentCompany={currentCompany}
            refetch={() => setRefetch(!refetch)}
          />
          <NewUser
            user={updateUser}
            setUser={setUpdateUser}
            setSuccessSB={setSuccessSB}
            refetch={() => setRefetch(!refetch)}
          />
          <AddAVACompany
            ava={updateAva}
            setUser={setUpdateUser}
            setSuccessSB={setSuccessSB}
            refetch={() => setRefetch(!refetch)}
            originalCompanyList={companyData?.company_list || []}
          />
          <ConfirmationDialog
            title="Are you sure you want to delete this user?"
            open={userDeleteConfirm}
            handleClose={deleteUserHandler}
          />
          <ConfirmationDialog
            title="Are you sure you want to delete this ava?"
            open={avaDeleteConfirm}
            handleClose={deleteAvaHandler}
          />
          <ConfirmationDialog
            title="Are you sure you want to delete this ava unassigned?"
            open={avaUnassignedDeleteConfirm}
            handleClose={deleteAvaUnassignedHandler}
          />
          <ConfirmationDialog
            title="Are you sure you want to delete this ava company?"
            open={avaCompanyDeleteConfirm}
            handleClose={deleteAvaCompanyHandler}
          />
          <MDSnackbar
            color="success"
            icon="check"
            title="Success"
            content={successSB?.message}
            open={!!successSB?.message}
            onClose={closeSuccessSB}
            close={closeSuccessSB}
            bgWhite
          />
        </>
      )}
    </DashboardLayout>
  );
}

export default Company;
