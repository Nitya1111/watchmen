/* eslint-disable react/prop-types */
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import { useState } from "react";

// @material-ui core components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Settings page components
import { Delete, Edit, LibraryBooks, Stars, Cancel } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Skeleton,
  Switch,
  Tooltip
} from "@mui/material";
import { Box } from "@mui/system";
import { invalidateQuery } from "api/customReactQueryClient";
import { apiUrls, enumQueryNames } from "api/reactQueryConstant";
import {
  deleteEnergyPriceApi,
  deleteHallApi,
  deleteMachineApi,
  deleteOperatorsApi,
  deleteShiftApi,
  deleteTimelineReasonApi,
  getAdminPanelDataApi,
  productListApi,
  deleteProductApi,
  getOrderListApi,
  deleteOrderApi
} from "api/watchmenApi";
import DefaultCell from "components/DefaultCell";
import MDCard from "components/MDCard";
import ConfirmationDialog from "components/MDDialog/ConfirmationDialog";
import MDSnackbar from "components/MDSnackbar";
import DataTable from "components/Tables/DataTable";
import NewAva from "components/modal/addAva";
import NewEnergyPrice from "components/modal/addEnergyPrice";
import NewHall from "components/modal/addHall";
import AddMachine from "components/modal/addMachine";
import NewOperator from "components/modal/addOperator";
import AddRating from "components/modal/addRating";
import NewShiftGroup from "components/modal/addShiftGroup";
import NewShift from "components/modal/addShifts";
import NewTag from "components/modal/addTags";
import NewToken from "components/modal/addToken";
import TimelineRules from "components/modal/timlineRules";
import {
  setAddAvaSetup,
  setOpenAddEnergyPrice,
  setOpenMachineForm,
  setOpenNewHallForm,
  setOpenNewShiftForm,
  setOpenNewShiftGroupForm,
  setOpenNewTagForm,
  setOpenNewTimelineReasonForm,
  setOpenNewTokenForm,
  setOpenOperatorForm,
  setOpenRatingForm,
  setOpenTimelineRulesForm,
  setOpenProductForm,
  setOpenOrderForm,
  setSuccessMsg,
  useMaterialUIController
} from "context";
import useAuth from "hooks/useAuth";
import translate from "i18n/translate";
import Cookies from "js-cookie";
import TimelineReasons from "layouts/dashboards/machines/components/modal/addTimelineReason";
import moment from "moment";
import { useMutation, useQuery } from "react-query";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddProduct from "components/modal/addProduct";
import AddOrder from "components/modal/addOrder";

export const useStyle = () => ({
  skeleton: {
    transform: "unset",
    margin: "1% 0"
  }
});

function Index() {
  const [controller, dispatch] = useMaterialUIController();
  const { axiosPrivate, isAuthSet } = useAxiosPrivate();
  const [successSB, setSuccessSB] = useState(null);
  const { auth } = useAuth();
  const userRole = Cookies.get("role") || "admin";
  const [machineList, setMachinesList] = useState([]);
  const [shiftGroupDeleteConfirm, setShiftGroupDeleteConfirm] = useState(null);
  const [shiftDeleteConfirm, setShiftDeleteConfirm] = useState(null);
  const [hallDeleteConfirm, setHallDeleteConfirm] = useState(null);
  const [tokenDeleteConfirm, setTokenDeleteConfirm] = useState(null);
  const [timelineDeleteConfirm, setTimelineDeleteConfirm] = useState(null);
  const [operatorDeleteConfirm, setOperatorDeleteConfirm] = useState(null);
  const [avaDeleteConfirm, setAVADeleteConfirm] = useState(null);
  const [energyPriceDeleteConfirm, setEnergyPriceDeleteConfirm] = useState(null);
  const [machineDeleteConfirm, setMachineDeleteConfirm] = useState(null);
  const [productDeleteConfirm, setProductDeleteConfirm] = useState(null);
  const [orderDeleteConfirm, setOrderDeleteConfirm] = useState(null);

  const [tagDeleteConfirm, setTagDeleteConfirm] = useState(null);
  const [updateShift, setUpdateShift] = useState(null);
  const [updateProduct, setUpdateProduct] = useState(null);
  const [updateOrder, setUpdateOrder] = useState(null);

  const [updateShiftGroup, setUpdateShiftGroup] = useState(null);
  const [companyMachines, setCompanyMachines] = useState(null);
  const [editMachineId, setEditMachineId] = useState(null);
  const [viewRatingId, setViewRatingId] = useState(null);
  const [updateHall, setUpdateHall] = useState(false);
  const [updateTag, setUpdateTag] = useState(false);
  const [updateToken, setUpdateToken] = useState(false);
  const [updateEnergyPrice, setUpdateEnergyPrice] = useState(false);
  const [updateReason, setUpdateReason] = useState(false);
  const [updateOperator, setUpdateOperator] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState();
  const [energyPriceList, setEnergyPriceList] = useState([]);
  const [timelineRuleMachineId, setTimelineRuleMachineId] = useState(null);
  const [hallList, setHallList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [tokenList, setTokenList] = useState([]);
  const [operatorsList, setOperatorsList] = useState([]);
  const [avaList, setAvaList] = useState([]);
  const [timelineReasonList, setTimelineReasonList] = useState([]);
  const [shiftGroupList, setShiftGroupList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [orderList, setOrderList] = useState([]);

  const classes = useStyle();

  const {
    darkMode,
    openNewShiftForm,
    openNewShiftGroupForm,
    openMachineForm,
    openNewHallForm,
    openNewTagForm,
    openNewTimelineReasonForm,
    openOperatorForm,
    openNewTokenForm,
    openRatingForm,
    openAddEnergyPrice,
    openAddAvaForm,
    openNewProductForm,
    openNewOrderForm,
    openTimelineRulesForm
  } = controller;

  const closeSuccessSB = () => setSuccessSB(null);

  const { isLoading: isAdminPanelLoading, refetch: refetchAdminPanel } = useQuery(
    [enumQueryNames.ADMIN_PANEL],
    () => getAdminPanelDataApi(axiosPrivate),
    {
      enabled: auth.Token && isAuthSet,
      onSuccess: (data) => {
        setAvaList(data?.ava_list?.filter((item) => !item?.assigned));
        setMachinesList(data?.machine_list);
        setHallList(data?.hall_list);
        setShiftList(data?.shift_list);
        setTagList(data?.tag_list);
        setOperatorsList(data?.operator_list);
        setTokenList(data?.gen_token_list);
        setTimelineReasonList(data?.timeline_reasons_list);
        setEnergyPriceList(data?.pricing_records_list);
        setShiftGroupList(data?.shift_group_list);
      }
    }
  );

  const { isLoading: isProductLoader, refetch: refetchProductLoader } = useQuery(
    "",
    // [enumQueryNames.ADMIN_PANEL],
    () => productListApi(axiosPrivate),
    {
      enabled: auth.Token && isAuthSet,
      onSuccess: (data) => {
        setProductList(data?.product_list);
      }
    }
  );

  const { isLoading: isOrderLoader, refetch: refetchOrderLoader } = useQuery(
    "mmm",
    // [enumQueryNames.ADMIN_PANEL],
    () => getOrderListApi(axiosPrivate),
    {
      enabled: auth.Token && isAuthSet,
      onSuccess: (data) => {
        setOrderList(data?.timeline_record_list);
      }
    }
  );

  const { mutate: deleteShiftData, isLoading: deleteShiftLoading } = useMutation(
    (shiftId) => deleteShiftApi(axiosPrivate, shiftId),
    {
      onSuccess: ({ message }) => {
        setSuccessMsg(dispatch, message);
        setShiftDeleteConfirm(null);
        invalidateQuery([enumQueryNames.SHIFT_LIST, enumQueryNames.SHIFT_GROUP_LIST]);
      },
      onError: () => {
        setShiftDeleteConfirm(null);
      }
    }
  );

  const { mutate: deleteHallData, isLoading: deleteHallLoading } = useMutation(
    (hallId) => deleteHallApi(axiosPrivate, hallId),
    {
      onSuccess: ({ message }) => {
        setSuccessMsg(dispatch, message);
        setHallDeleteConfirm(null);
        invalidateQuery([enumQueryNames.HALL_LIST]);
      },
      onError: () => {
        setHallDeleteConfirm(null);
      }
    }
  );

  const deleteShiftHandler = async (confirm) => {
    if (confirm) {
      deleteShiftData(shiftDeleteConfirm);
    }
    setShiftDeleteConfirm(null);
  };

  const deleteHallHandler = async (confirm) => {
    if (confirm) {
      deleteHallData(hallDeleteConfirm);
    }
    setHallDeleteConfirm(null);
  };

  const deleteTokenHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await axiosPrivate.delete(`gen_token_v2`);
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        setTokenDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setTokenDeleteConfirm(null);
    }
  };

  const deleteEnergyPriceReasonHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await deleteEnergyPriceApi(axiosPrivate, energyPriceDeleteConfirm);
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        setEnergyPriceDeleteConfirm(null);
        setEnergyPriceList([
          ...energyPriceList.filter((item) => item.id !== energyPriceDeleteConfirm)
        ]);
      } catch (err) {
        console.log(err);
      }
    } else {
      setEnergyPriceDeleteConfirm(null);
    }
  };
  const deleteMachineReasonHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await deleteMachineApi(axiosPrivate, machineDeleteConfirm);
        if (response.status === 1) {
          setSuccessSB({
            message: response.message
          });
        }
        setMachinesList([...machineList.filter((item) => item.id !== machineDeleteConfirm)]);
        setMachineDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setMachineDeleteConfirm(null);
    }
  };

  const deleteProductReasonHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await deleteProductApi(axiosPrivate, productDeleteConfirm);
        if (response.status === 1) {
          setSuccessSB({
            message: response.message
          });
        }
        setProductList([...productList.filter((item) => item.id !== productDeleteConfirm)]);
        setProductDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setProductDeleteConfirm(null);
    }
  };

  const deleteOrderHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await deleteOrderApi(axiosPrivate, orderDeleteConfirm);
        if (response.status === 1) {
          setSuccessSB({
            message: response.message
          });
        }
        setOrderList([...orderList.filter((item) => item.id !== orderDeleteConfirm)]);
        setOrderDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setOrderDeleteConfirm(null);
    }
  };

  const deleteTimelineReasonHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await deleteTimelineReasonApi(axiosPrivate, timelineDeleteConfirm);
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        invalidateQuery([enumQueryNames.OPERATOR_LIST]);
        setTimelineDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setTimelineDeleteConfirm(null);
    }
  };

  const deleteOperatorReasonHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await deleteOperatorsApi(axiosPrivate, operatorDeleteConfirm);
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        setOperatorDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setOperatorDeleteConfirm(null);
    }
  };
  const deleteAvaReasonHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await axiosPrivate.put(apiUrls.machineListApi + avaDeleteConfirm, {
          ava_id: null
        });
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        setAVADeleteConfirm(null);
        refetchAdminPanel();
      } catch (err) {
        console.log(err);
      }
    } else {
      setAVADeleteConfirm(null);
    }
  };
  const deleteTagHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await axiosPrivate.deleteOperatorsApi(`tags/${tagDeleteConfirm}`);
        if (response.status === 200) {
          setSuccessSB({
            message: response.data.message
          });
        }
        setTagDeleteConfirm(null);
      } catch (err) {
        console.log(err);
      }
    } else {
      setTagDeleteConfirm(null);
    }
  };

  const deleteShiftGroupHandler = async (confirm) => {
    if (confirm) {
      try {
        const response = await axiosPrivate.delete(`shiftgroup/${shiftGroupDeleteConfirm}`);
        if (response.status === 200) {
          setShiftGroupDeleteConfirm(null);
          setSuccessSB({
            message: response.data.message
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      setShiftGroupDeleteConfirm(null);
    }
  };
  const handleUpdateAva = async (data) => {
    if (selectedMachine?.id && data) {
      const response = await axiosPrivate.put(apiUrls.machineListApi + selectedMachine?.id, {
        ava_id: data
      });
      setSuccessSB({
        message: response.data.message
      });
      refetchAdminPanel();
    }
  };
  const editShiftGroupHandler = (id) => {
    const filteredShiftGroup = shiftGroupList.find((shiftGroup) => shiftGroup.id === id);
    setUpdateShiftGroup(filteredShiftGroup);
    setOpenNewShiftGroupForm(dispatch, !openNewShiftGroupForm);
  };

  const editShiftHandler = (id) => {
    const filteredShift = shiftList.find((shift) => shift.id === id);
    setUpdateShift(filteredShift);
    setOpenNewShiftForm(dispatch, !openNewShiftForm);
  };

  const editHallHandler = (id) => {
    const filteredHall = hallList?.find((hall) => hall.id === id);
    setUpdateHall(filteredHall);
    setOpenNewHallForm(dispatch, !openNewHallForm);
  };

  const editTimelineReasonHandler = (id) => {
    const filteredTimelineReason = timelineReasonList.find(
      (timelineReason) => timelineReason.id === id
    );
    setUpdateReason(filteredTimelineReason);
    setOpenNewTimelineReasonForm(dispatch, !openNewTimelineReasonForm);
  };
  const editEnergyPriceHandler = (id) => {
    const filteredEnergyPrice = energyPriceList.find((energyToken) => energyToken.id === id);
    setUpdateEnergyPrice(filteredEnergyPrice);
    setOpenAddEnergyPrice(dispatch, !openAddEnergyPrice);
  };

  const updateOperatorHandler = (id) => {
    const filteredOperatorReason = operatorsList.find((operatorReason) => operatorReason.id === id);
    setUpdateOperator(filteredOperatorReason);
    setOpenOperatorForm(dispatch, !openOperatorForm);
  };

  const editTagHandler = (id) => {
    const filteredTag = tagList.find((tag) => tag.id === id);
    setUpdateTag(filteredTag);
    setOpenNewTagForm(dispatch, !openNewTagForm);
  };

  const changeMachineStatusHandler = async (id, checked) => {
    // eslint-disable-next-line prefer-const, no-shadow
    let machine = machineList.find((machine) => machine.id === id);
    machine.active = checked;
    const response = await axiosPrivate.put(apiUrls.machineListApi + id, { active: checked });
    if (response.status === 200) {
      setCompanyMachines(
        // eslint-disable-next-line no-shadow
        machineList.map((machine) => {
          if (machine.id === id) {
            return {
              ...machine,
              active: checked
            };
          }
          return machine;
        })
      );
    }
  };

  const editMachineHandler = (value) => {
    setOpenMachineForm(dispatch, !openMachineForm);
    setEditMachineId(value);
  };
  const removeAVAHandler = (value) => {
    setAVADeleteConfirm(value);
  };
  const viewRatingHandler = (value) => {
    setOpenRatingForm(dispatch, !openRatingForm);
    setViewRatingId(value);
  };

  const viewTimelineRulesHandler = (value) => {
    setOpenTimelineRulesForm(dispatch, !openTimelineRulesForm);
    setTimelineRuleMachineId(value);
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      {openMachineForm && (
        <AddMachine
          id={editMachineId}
          setEditMachineId={setEditMachineId}
          handleFetchMachine={() => refetchAdminPanel()}
        />
      )}
      {openRatingForm && <AddRating id={viewRatingId} />}
      {openTimelineRulesForm && (
        <TimelineRules
          id={timelineRuleMachineId}
          setTimelineRuleMachineId={setTimelineRuleMachineId}
        />
      )}
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
          <MDTypography variant="h5" fontWeight="medium" style={{ margin: "0 16px" }}>
            {translate("Configure Factory")}
          </MDTypography>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
        </Grid>
        {(userRole === "super_admin" || userRole === "admin") && hallList && (
          <Grid item xs={12}>
            <Accordion
              darkMode
              style={{
                background: "linear-gradient(195deg, #131313, #282828)",
                borderRadius: "0.75rem"
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <MDTypography variant="h5" fontWeight="medium">
                  {translate("Halls")}
                </MDTypography>
              </AccordionSummary>
              <AccordionDetails>
                <MDBox pb={3} display="flex" justifyContent="end">
                  <MDButton
                    variant={darkMode ? "contained" : "outlined"}
                    color="dark"
                    size="medium"
                    onClick={() => setOpenNewHallForm(dispatch, !openNewHallForm)}
                  >
                    {translate("Add Hall")}
                  </MDButton>
                </MDBox>
                <DataTable
                  table={{
                    columns: [
                      {
                        Header: "No.",
                        accessor: "id",
                        width: "50px",
                        Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                      },
                      {
                        Header: translate("name"),
                        accessor: "name",
                        Cell: ({ value }) => (
                          <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                        )
                      },
                      {
                        Header: translate("description"),
                        accessor: "description",
                        Cell: ({ value }) => <DefaultCell value={value ?? "-"} />
                      },
                      // {
                      //   Header: translate("company_id"),
                      //   accessor: "company_id",
                      //   Cell: ({ value }) => <DefaultCell value={value} />
                      // },
                      {
                        Header: translate("machines"),
                        accessor: "machine_list",
                        Cell: ({ value }) => {
                          const names = value.map((item) => item.name);
                          const commaSeparatedNames = names.join(", ");
                          return (
                            <Tooltip title={commaSeparatedNames}>
                              <Box
                                sx={{
                                  maxWidth: "45vw",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}
                              >
                                {commaSeparatedNames}
                              </Box>
                            </Tooltip>
                          );
                        }
                      },
                      {
                        Header: "",
                        id: "icons",
                        accessor: "id",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <>
                            <Edit
                              fontSize="small"
                              sx={{ margin: "0 10px", cursor: "pointer" }}
                              onClick={() => editHallHandler(value)}
                            />
                            <Delete
                              fontSize="small"
                              sx={{ cursor: "pointer", color: "red !important" }}
                              onClick={() => setHallDeleteConfirm(value)}
                            />
                          </>
                        )
                      }
                    ],
                    rows: hallList.sort((a, b) => a.id - b.id)
                  }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        {(userRole === "super_admin" || userRole === "admin") && tagList && (
          <Grid item xs={12}>
            <Accordion
              darkMode
              style={{
                background: "linear-gradient(195deg, #131313, #282828)",
                borderRadius: "0.75rem"
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <MDTypography variant="h5" fontWeight="medium">
                  {translate("Tags")}
                </MDTypography>
              </AccordionSummary>
              <AccordionDetails>
                <MDBox pb={3} display="flex" justifyContent="end">
                  <MDButton
                    variant={darkMode ? "contained" : "outlined"}
                    color="dark"
                    size="medium"
                    onClick={() => setOpenNewTagForm(dispatch, !openNewTagForm)}
                  >
                    {translate("Add Tags")}
                  </MDButton>
                </MDBox>
                <DataTable
                  table={{
                    columns: [
                      {
                        Header: "No.",
                        accessor: "id",
                        width: "50px",
                        Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                      },
                      {
                        Header: translate("name"),
                        accessor: "name",
                        Cell: ({ value }) => (
                          <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                        )
                      },
                      {
                        Header: translate("description"),
                        accessor: "description",
                        Cell: ({ value }) => <DefaultCell value={value ?? "-"} />
                      },
                      // {
                      //   Header: translate("company_id"),
                      //   accessor: "company_id",
                      //   Cell: ({ value }) => <DefaultCell value={value} />
                      // },
                      {
                        Header: translate("machines"),
                        accessor: "machine_list",
                        Cell: ({ value }) => {
                          const names = value.map((item) => item.name);
                          const commaSeparatedNames = names.join(", ");
                          return (
                            <Tooltip title={commaSeparatedNames}>
                              <Box
                                sx={{
                                  maxWidth: "40vw",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}
                              >
                                {commaSeparatedNames}
                              </Box>
                            </Tooltip>
                          );
                        }
                      },
                      {
                        Header: "",
                        id: "icons",
                        accessor: "id",
                        align: "right",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <>
                            <Edit
                              fontSize="small"
                              sx={{ margin: "0 10px", cursor: "pointer" }}
                              onClick={() => editTagHandler(value)}
                            />
                            <Delete
                              fontSize="small"
                              sx={{ cursor: "pointer", color: "red !important" }}
                              onClick={() => setTagDeleteConfirm(value)}
                            />
                          </>
                        )
                      }
                    ],
                    rows: tagList.sort((a, b) => a.id - b.id)
                  }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        {(userRole === "admin" || userRole === "super_admin") && machineList && (
          <Grid item xs={12}>
            <Accordion
              darkMode
              style={{
                background: "linear-gradient(195deg, #131313, #282828)",
                borderRadius: "0.75rem"
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <MDTypography variant="h5" fontWeight="medium">
                  {translate("machines")}
                </MDTypography>
              </AccordionSummary>
              <AccordionDetails>
                <MDBox pb={3} display="flex" justifyContent="end">
                  <MDButton
                    variant={darkMode ? "contained" : "outlined"}
                    color="dark"
                    size="medium"
                    onClick={() => {
                      setEditMachineId(null);
                      setOpenMachineForm(dispatch, !openMachineForm);
                    }}
                  >
                    {translate("Add Machine")}
                  </MDButton>
                </MDBox>
                <DataTable
                  table={{
                    columns: [
                      {
                        Header: "No.",
                        accessor: "id",
                        width: "50px",
                        Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                      },
                      {
                        Header: translate("name"),
                        accessor: "name",
                        Cell: ({ value }) => (
                          <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                        )
                      },
                      {
                        Header: translate("ava"),
                        accessor: "ava",
                        Cell: ({ row, value }) => {
                          if (value[0]?.name) {
                            return (
                              <MDBox display="flex" justifyContent="center">
                                <DefaultCell value={value[0]?.name} />
                                <Cancel
                                  fontSize="small"
                                  sx={{ margin: "0 10px", marginTop: "-3px", cursor: "pointer" }}
                                  onClick={() => removeAVAHandler(row.original.id)}
                                />
                              </MDBox>
                            );
                          }
                          return (
                            <MDButton
                              variant={darkMode ? "contained" : "outlined"}
                              color="dark"
                              size="medium"
                              onClick={() => {
                                setSelectedMachine(row?.original);
                                setAddAvaSetup(dispatch, !openAddAvaForm);
                              }}
                            >
                              {translate("Add Ava")}
                            </MDButton>
                          );
                        }
                      },
                      {
                        Header: translate("shift group"),
                        accessor: "shift_group",
                        Cell: ({ value }) => <DefaultCell value={value?.name} />
                      },
                      // {
                      //   Header: translate("tags"),
                      //   accessor: "tag_list",
                      //   Cell: ({ value }) => {
                      //     const names = value.map((item) => item.name);
                      //     const commaSeparatedNames = names.join(", ");
                      //     return (
                      //       <Tooltip title={commaSeparatedNames}>
                      //         <Box
                      //           sx={{
                      //             maxWidth: "40vw",
                      //             whiteSpace: "nowrap",
                      //             overflow: "hidden",
                      //             textOverflow: "ellipsis"
                      //           }}
                      //         >
                      //           {commaSeparatedNames}
                      //         </Box>
                      //       </Tooltip>
                      //     );
                      //   }
                      // },
                      {
                        Header: translate("active"),
                        accessor: "active",
                        isSortedColumn: false,
                        Cell: ({ row }) => (
                          <Switch
                            color="default"
                            checked={row.original.active}
                            onClick={(e) =>
                              changeMachineStatusHandler(row.original.id, e.target.checked)
                            }
                          />
                        )
                      },
                      {
                        Header: translate("Rating"),
                        id: "machineRating",
                        accessor: "id",
                        // align: "center",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <Stars
                            fontSize="small"
                            cursor="pointer"
                            onClick={() => viewRatingHandler(value)}
                          />
                        )
                      },
                      {
                        Header: translate("Timeline Rules"),
                        id: "timelineRules",
                        accessor: "id",
                        align: "center",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <LibraryBooks
                            fontSize="small"
                            cursor="pointer"
                            onClick={() => viewTimelineRulesHandler(value)}
                          />
                        )
                      },
                      {
                        Header: "",
                        id: "edit_icon",
                        accessor: "id",
                        align: "right",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <>
                            <Edit
                              fontSize="small"
                              sx={{ margin: "0 10px", cursor: "pointer" }}
                              onClick={() => editMachineHandler(value)}
                            />
                            <Delete
                              fontSize="small"
                              sx={{ cursor: "pointer", color: "red !important" }}
                              onClick={() => setMachineDeleteConfirm(value)}
                            />
                          </>
                        )
                      }
                    ],
                    rows: machineList.sort((a, b) => a.id - b.id)
                  }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        <Grid
          item
          xs={12}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
          <MDTypography variant="h5" fontWeight="medium" style={{ margin: "0 16px" }}>
            {translate("Products")}
          </MDTypography>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
        </Grid>
        {isProductLoader ? (
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
        ) : (
          (userRole === "super_admin" || userRole === "admin") &&
          productList && (
            <Grid item xs={12}>
              <Accordion
                darkMode
                style={{
                  background: "linear-gradient(195deg, #131313, #282828)",
                  borderRadius: "0.75rem"
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <MDTypography variant="h5" fontWeight="medium">
                    {translate("Products")}
                  </MDTypography>
                </AccordionSummary>
                <AccordionDetails>
                  <MDBox pb={3} display="flex" justifyContent="end">
                    <MDButton
                      variant={darkMode ? "contained" : "outlined"}
                      color="dark"
                      size="medium"
                      onClick={() => setOpenProductForm(dispatch, !openNewProductForm)}
                    >
                      {translate("Add Product")}
                    </MDButton>
                  </MDBox>
                  <DataTable
                    table={{
                      columns: [
                        {
                          Header: "No.",
                          accessor: "id",
                          width: "50px",
                          Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                        },
                        {
                          Header: translate("name"),
                          accessor: "product_name",
                          Cell: ({ value }) => (
                            <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                          )
                        },
                        {
                          Header: translate("ProductID"),
                          accessor: "ext_product_id",
                          Cell: ({ value }) => <DefaultCell value={value} />
                        },
                        {
                          Header: translate("OrderID"),
                          accessor: "ext_order_id",
                          Cell: ({ value }) => <DefaultCell value={value} />
                        },
                        {
                          Header: translate("Description"),
                          accessor: "description",
                          Cell: ({ value }) => <DefaultCell value={value} />
                        },
                        {
                          Header: translate("CPP"),
                          accessor: "cpp",
                          Cell: ({ value }) => <DefaultCell value={value} />
                        },
                        // {
                        //   Header: translate("active"),
                        //   accessor: "active",
                        //   Cell: ({ row }) => (
                        //     <Switch
                        //       checked={row.original.active}
                        //       onClick={(e) =>
                        //         chnageShiftStatusHandler(row.original.id, e.target.checked)
                        //       }
                        //     />
                        //   )
                        // },
                        // {
                        //   Header: translate("Shift group"),
                        //   accessor: "shift_group_list",
                        //   Cell: ({ value }) => {
                        //     const names = value.map((item) => item.name);
                        //     const commaSeparatedNames = names.join(", ");
                        //     return (
                        //       <Tooltip title={commaSeparatedNames}>
                        //         <Box
                        //           sx={{
                        //             maxWidth: "40vw",
                        //             whiteSpace: "nowrap",
                        //             overflow: "hidden",
                        //             textOverflow: "ellipsis"
                        //           }}
                        //         >
                        //           {commaSeparatedNames}
                        //         </Box>
                        //       </Tooltip>
                        //     );
                        //   }
                        // },
                        {
                          Header: "",
                          id: "icons",
                          accessor: "id",
                          align: "right",
                          isSortedColumn: false,
                          Cell: ({ value }) => (
                            <>
                              <Edit
                                fontSize="small"
                                sx={{ margin: "0 10px", cursor: "pointer" }}
                                onClick={() => editShiftHandler(value)}
                              />
                              <Delete
                                fontSize="small"
                                sx={{ cursor: "pointer", color: "red !important" }}
                                onClick={() => setProductDeleteConfirm(value)}
                              />
                            </>
                          )
                        }
                      ],
                      rows: productList.sort((a, b) => a.id - b.id)
                    }}
                    entriesPerPage={false}
                    showTotalEntries={false}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          )
        )}
        <Grid
          item
          xs={12}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
          <MDTypography variant="h5" fontWeight="medium" style={{ margin: "0 16px" }}>
            {translate("Orders")}
          </MDTypography>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
        </Grid>
        {isOrderLoader ? (
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
        ) : (
          (userRole === "super_admin" || userRole === "admin") &&
          orderList && (
            <Grid item xs={12}>
              <Accordion
                darkMode
                style={{
                  background: "linear-gradient(195deg, #131313, #282828)",
                  borderRadius: "0.75rem"
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <MDTypography variant="h5" fontWeight="medium">
                    {translate("Orders")}
                  </MDTypography>
                </AccordionSummary>
                <AccordionDetails>
                  <MDBox pb={3} display="flex" justifyContent="end">
                    <MDButton
                      variant={darkMode ? "contained" : "outlined"}
                      color="dark"
                      size="medium"
                      onClick={() => setOpenOrderForm(dispatch, !openNewOrderForm)}
                    >
                      {translate("Add Order")}
                    </MDButton>
                  </MDBox>
                  <DataTable
                    table={{
                      columns: [
                        {
                          Header: "No.",
                          accessor: "id",
                          width: "50px",
                          Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                        },
                        {
                          Header: translate("ProductID"),
                          accessor: "product_id",
                          Cell: ({ value }) => (
                            <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                          )
                        },
                        {
                          Header: translate("MachineID"),
                          accessor: "machine_id",
                          Cell: ({ value }) => <DefaultCell value={value} />
                        },
                        {
                          Header: translate("StartDateTime"),
                          accessor: "start",
                          Cell: ({ value }) => <DefaultCell value={value} />
                        },
                        {
                          Header: translate("EndDateTime"),
                          accessor: "end",
                          Cell: ({ value }) => <DefaultCell value={value} />
                        },
                        // {
                        //   Header: translate("active"),
                        //   accessor: "active",
                        //   Cell: ({ row }) => (
                        //     <Switch
                        //       checked={row.original.active}
                        //       onClick={(e) =>
                        //         chnageShiftStatusHandler(row.original.id, e.target.checked)
                        //       }
                        //     />
                        //   )
                        // },
                        // {
                        //   Header: translate("Shift group"),
                        //   accessor: "shift_group_list",
                        //   Cell: ({ value }) => {
                        //     const names = value.map((item) => item.name);
                        //     const commaSeparatedNames = names.join(", ");
                        //     return (
                        //       <Tooltip title={commaSeparatedNames}>
                        //         <Box
                        //           sx={{
                        //             maxWidth: "40vw",
                        //             whiteSpace: "nowrap",
                        //             overflow: "hidden",
                        //             textOverflow: "ellipsis"
                        //           }}
                        //         >
                        //           {commaSeparatedNames}
                        //         </Box>
                        //       </Tooltip>
                        //     );
                        //   }
                        // },
                        {
                          Header: "",
                          id: "icons",
                          accessor: "id",
                          align: "right",
                          isSortedColumn: false,
                          Cell: ({ value }) => (
                            <>
                              <Edit
                                fontSize="small"
                                sx={{ margin: "0 10px", cursor: "pointer" }}
                                onClick={() => editShiftHandler(value)}
                              />
                              <Delete
                                fontSize="small"
                                sx={{ cursor: "pointer", color: "red !important" }}
                                onClick={() => setOrderDeleteConfirm(value)}
                              />
                            </>
                          )
                        }
                      ],
                      rows: orderList.sort((a, b) => a.id - b.id)
                    }}
                    entriesPerPage={false}
                    showTotalEntries={false}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          )
        )}
        <Grid
          item
          xs={12}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
          <MDTypography variant="h5" fontWeight="medium" style={{ margin: "0 16px" }}>
            {translate("Configure Shifts and Scheduling")}
          </MDTypography>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
        </Grid>
        {deleteShiftLoading ? (
          <Skeleton height={200} width="100%" sx={classes.skeleton} />
        ) : (
          (userRole === "super_admin" || userRole === "admin") &&
          shiftList && (
            <Grid item xs={12}>
              <Accordion
                darkMode
                style={{
                  background: "linear-gradient(195deg, #131313, #282828)",
                  borderRadius: "0.75rem"
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <MDTypography variant="h5" fontWeight="medium">
                    {translate("Shifts")}
                  </MDTypography>
                </AccordionSummary>
                <AccordionDetails>
                  <MDBox pb={3} display="flex" justifyContent="end">
                    <MDButton
                      variant={darkMode ? "contained" : "outlined"}
                      color="dark"
                      size="medium"
                      onClick={() => setOpenNewShiftForm(dispatch, !openNewShiftForm)}
                    >
                      {translate("Add Shift")}
                    </MDButton>
                  </MDBox>
                  <DataTable
                    table={{
                      columns: [
                        {
                          Header: "No.",
                          accessor: "id",
                          width: "50px",
                          Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                        },
                        {
                          Header: translate("name"),
                          accessor: "name",
                          Cell: ({ value }) => (
                            <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                          )
                        },
                        {
                          Header: translate("start"),
                          accessor: "start_time",
                          Cell: ({ value }) => <DefaultCell value={value} />
                        },
                        {
                          Header: translate("end"),
                          accessor: "end_time",
                          Cell: ({ value }) => <DefaultCell value={value} />
                        },
                        // {
                        //   Header: translate("active"),
                        //   accessor: "active",
                        //   Cell: ({ row }) => (
                        //     <Switch
                        //       checked={row.original.active}
                        //       onClick={(e) =>
                        //         chnageShiftStatusHandler(row.original.id, e.target.checked)
                        //       }
                        //     />
                        //   )
                        // },
                        {
                          Header: translate("Shift group"),
                          accessor: "shift_group_list",
                          Cell: ({ value }) => {
                            const names = value.map((item) => item.name);
                            const commaSeparatedNames = names.join(", ");
                            return (
                              <Tooltip title={commaSeparatedNames}>
                                <Box
                                  sx={{
                                    maxWidth: "40vw",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                  }}
                                >
                                  {commaSeparatedNames}
                                </Box>
                              </Tooltip>
                            );
                          }
                        },
                        {
                          Header: "",
                          id: "icons",
                          accessor: "id",
                          align: "right",
                          isSortedColumn: false,
                          Cell: ({ value }) => (
                            <>
                              <Edit
                                fontSize="small"
                                sx={{ margin: "0 10px", cursor: "pointer" }}
                                onClick={() => editShiftHandler(value)}
                              />
                              <Delete
                                fontSize="small"
                                sx={{ cursor: "pointer", color: "red !important" }}
                                onClick={() => setShiftDeleteConfirm(value)}
                              />
                            </>
                          )
                        }
                      ],
                      rows: shiftList.sort((a, b) => a.id - b.id)
                    }}
                    entriesPerPage={false}
                    showTotalEntries={false}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          )
        )}
        {(userRole === "super_admin" || userRole === "admin") && shiftGroupList && (
          <Grid item xs={12}>
            <Accordion
              darkMode
              style={{
                background: "linear-gradient(195deg, #131313, #282828)",
                borderRadius: "0.75rem"
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <MDTypography variant="h5" fontWeight="medium">
                  {translate("Shift group")}
                </MDTypography>
              </AccordionSummary>
              <AccordionDetails>
                <MDBox mb={3} display="flex" justifyContent="end">
                  <MDButton
                    variant={darkMode ? "contained" : "outlined"}
                    color="dark"
                    size="medium"
                    onClick={() => setOpenNewShiftGroupForm(dispatch, !openNewShiftGroupForm)}
                  >
                    {translate("Add Shift Group")}
                  </MDButton>
                </MDBox>
                <DataTable
                  table={{
                    columns: [
                      {
                        Header: "No.",
                        accessor: "id",
                        width: "50px",
                        Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                      },
                      {
                        Header: translate("name"),
                        accessor: "name",
                        Cell: ({ value }) => (
                          <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                        )
                      },
                      {
                        Header: translate("machines"),
                        accessor: "machine_list",
                        Cell: ({ value }) => {
                          const names = value.map((item) => item.machine_name);
                          const commaSeparatedNames = names.join(", \n");
                          return (
                            <Tooltip title={commaSeparatedNames}>
                              <Box
                                sx={{
                                  maxWidth: "39vw",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}
                              >
                                {commaSeparatedNames}
                              </Box>
                            </Tooltip>
                          );
                        }
                      },
                      {
                        Header: translate("Shifts"),
                        accessor: "shift_list",
                        Cell: ({ value }) => {
                          const names = value.map((item) => item.name);
                          const commaSeparatedNames = names.join(", ");
                          return (
                            <Tooltip title={commaSeparatedNames}>
                              <Box
                                sx={{
                                  maxWidth: "40vw",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}
                              >
                                {commaSeparatedNames}
                              </Box>
                            </Tooltip>
                          );
                        }
                      },
                      {
                        Header: "",
                        id: "icons",
                        accessor: "id",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <>
                            <Edit
                              fontSize="small"
                              sx={{ margin: "0 10px", cursor: "pointer" }}
                              onClick={() => editShiftGroupHandler(value)}
                            />
                            <Delete
                              fontSize="small"
                              sx={{ cursor: "pointer", color: "red !important" }}
                              onClick={() => setShiftGroupDeleteConfirm(value)}
                            />
                          </>
                        )
                      }
                    ],
                    rows: shiftGroupList.sort((a, b) => a.id - b.id)
                  }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        {(userRole === "super_admin" || userRole === "admin") && operatorsList && (
          <Grid item xs={12}>
            <Accordion
              darkMode
              style={{
                background: "linear-gradient(195deg, #131313, #282828)",
                borderRadius: "0.75rem"
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <MDTypography variant="h5" fontWeight="medium">
                  {translate("machineOperators")}
                </MDTypography>
              </AccordionSummary>
              <AccordionDetails>
                <MDBox pb={3} display="flex" justifyContent="end">
                  <MDButton
                    variant={darkMode ? "contained" : "outlined"}
                    color="dark"
                    size="medium"
                    onClick={() => setOpenOperatorForm(dispatch, !openOperatorForm)}
                  >
                    {translate("Add Operator")}
                  </MDButton>
                </MDBox>

                <DataTable
                  table={{
                    columns: [
                      {
                        Header: "No.",
                        accessor: "id",
                        width: "50px",
                        Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                      },
                      {
                        Header: translate("name"),
                        accessor: "name",
                        Cell: ({ value }) => (
                          <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                        )
                      },
                      {
                        Header: translate("first name"),
                        accessor: "first_name",
                        isSortedColumn: false
                      },
                      {
                        Header: translate("last name"),
                        accessor: "last_name",
                        Cell: ({ value }) => <DefaultCell value={value} />
                      },
                      {
                        Header: translate("email"),
                        accessor: "email",
                        Cell: ({ value }) => <DefaultCell value={value} />
                      },
                      {
                        Header: "",
                        id: "icons",
                        accessor: "id",
                        align: "right",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <>
                            <Edit
                              fontSize="small"
                              sx={{ margin: "0 10px", cursor: "pointer" }}
                              onClick={() => updateOperatorHandler(value)}
                            />
                            <Delete
                              fontSize="small"
                              sx={{ cursor: "pointer", color: "red !important" }}
                              onClick={() => setOperatorDeleteConfirm(value)}
                            />
                          </>
                        )
                      }
                    ],
                    rows: operatorsList.sort((a, b) => a.id - b.id)
                  }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}{" "}
        <Grid
          item
          xs={12}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
          <MDTypography variant="h5" fontWeight="medium" style={{ margin: "0 16px" }}>
            {translate("Configure Analyzers")}
          </MDTypography>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
        </Grid>
        {(userRole === "super_admin" || userRole === "admin") && timelineReasonList && (
          <Grid item xs={12}>
            <Accordion
              darkMode
              style={{
                background: "linear-gradient(195deg, #131313, #282828)",
                borderRadius: "0.75rem"
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <MDTypography variant="h5" fontWeight="medium">
                  {translate("timelineReasons")}
                </MDTypography>
              </AccordionSummary>
              <AccordionDetails>
                <MDBox pb={3} display="flex" justifyContent="end">
                  <MDButton
                    variant={darkMode ? "contained" : "outlined"}
                    color="dark"
                    size="medium"
                    onClick={() =>
                      setOpenNewTimelineReasonForm(dispatch, !openNewTimelineReasonForm)
                    }
                  >
                    {translate("Add Timeline Reason")}
                  </MDButton>
                </MDBox>

                <DataTable
                  table={{
                    columns: [
                      {
                        Header: "No.",
                        accessor: "id",
                        width: "50px",
                        Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                      },
                      {
                        Header: translate("name"),
                        accessor: "name",
                        Cell: ({ value }) => (
                          <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                        )
                      },
                      {
                        Header: "",
                        accessor: "name_name",
                        isSortedColumn: false
                      },
                      {
                        Header: translate("reason"),
                        accessor: "reason",
                        Cell: ({ value }) => <DefaultCell value={value} />
                      },
                      {
                        Header: translate("level"),
                        accessor: "level",
                        Cell: ({ value }) => <DefaultCell value={value} />
                      },
                      {
                        Header: "",
                        accessor: "id_name",
                        isSortedColumn: false
                      },
                      {
                        Header: "",
                        id: "icons",
                        accessor: "id",
                        align: "right",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <>
                            <Edit
                              fontSize="small"
                              sx={{ margin: "0 10px", cursor: "pointer" }}
                              onClick={() => editTimelineReasonHandler(value)}
                            />
                            <Delete
                              fontSize="small"
                              sx={{ cursor: "pointer", color: "red !important" }}
                              onClick={() => setTimelineDeleteConfirm(value)}
                            />
                          </>
                        )
                      }
                    ],
                    rows: timelineReasonList.sort((a, b) => a.id - b.id)
                  }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        {(userRole === "super_admin" || userRole === "admin") && energyPriceList && (
          <Grid item xs={12}>
            <Accordion
              darkMode
              style={{
                background: "linear-gradient(195deg, #131313, #282828)",
                borderRadius: "0.75rem"
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <MDTypography variant="h5" fontWeight="medium">
                  {translate("energyPrice")}
                </MDTypography>
              </AccordionSummary>
              <AccordionDetails>
                <MDBox pb={3} display="flex" justifyContent="end">
                  <MDButton
                    variant={darkMode ? "contained" : "outlined"}
                    color="dark"
                    size="medium"
                    onClick={() => setOpenAddEnergyPrice(dispatch, !openAddEnergyPrice)}
                  >
                    {translate("Add Energy Price")}
                  </MDButton>
                </MDBox>

                <DataTable
                  table={{
                    columns: [
                      {
                        Header: "id",
                        accessor: "id",
                        width: "50px",
                        Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                      },
                      {
                        Header: translate("energyPrice"),
                        accessor: "price_per_kwh",
                        Cell: ({ value }) => (
                          <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                        )
                      },
                      {
                        Header: translate("fromDate"),
                        accessor: "start_date",
                        Cell: ({ value }) => <DefaultCell value={value} />
                      },
                      {
                        Header: translate("toDate"),
                        accessor: "end_date",
                        Cell: ({ value }) => <DefaultCell value={value} />
                      },
                      {
                        Header: "",
                        id: "icons",
                        accessor: "id",
                        align: "right",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <>
                            <Edit
                              fontSize="small"
                              sx={{ margin: "0 10px", cursor: "pointer" }}
                              onClick={() => editEnergyPriceHandler(value)}
                            />
                            <Delete
                              fontSize="small"
                              sx={{ cursor: "pointer", color: "red !important" }}
                              onClick={() => setEnergyPriceDeleteConfirm(value)}
                            />
                          </>
                        )
                      }
                    ],
                    rows: energyPriceList && energyPriceList?.sort((a, b) => a.id - b.id)
                  }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        <Grid
          item
          xs={12}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
          <MDTypography variant="h5" fontWeight="medium" style={{ margin: "0 16px" }}>
            {translate("Configure Security and API")}
          </MDTypography>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#CCCCCC" }}></div>
        </Grid>
        {(userRole === "super_admin" || userRole === "admin") && tokenList && (
          <Grid item xs={12}>
            <Accordion
              darkMode
              style={{
                background: "linear-gradient(195deg, #131313, #282828)",
                borderRadius: "0.75rem"
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <MDTypography variant="h5" fontWeight="medium">
                  {translate("Tokens")}
                </MDTypography>
              </AccordionSummary>
              <AccordionDetails>
                <MDBox pb={3} display="flex" justifyContent="end">
                  <MDButton
                    variant={darkMode ? "contained" : "outlined"}
                    color="dark"
                    size="medium"
                    onClick={() => setOpenNewTokenForm(dispatch, !openNewTokenForm)}
                  >
                    {translate("Add Tokens")}
                  </MDButton>
                </MDBox>
                <DataTable
                  table={{
                    columns: [
                      {
                        Header: "No.",
                        accessor: "id",
                        width: "50px",
                        Cell: ({ row }) => <DefaultCell value={row?.index + 1} />
                      },
                      {
                        Header: translate("name"),
                        accessor: "name",
                        Cell: ({ value }) => (
                          <DefaultCell fontSize="14px" fontWeight="medium" value={value} />
                        )
                      },
                      {
                        Header: "",
                        accessor: "name_id",
                        isSortedColumn: false
                      },
                      {
                        Header: translate("validTill"),
                        accessor: "valid_till",
                        Cell: ({ value }) => (
                          <DefaultCell
                            value={value ? moment(value).format("ddd, DD MMM YYYY") : "-"}
                          />
                        )
                      },
                      {
                        Header: "",
                        accessor: "id_name",
                        isSortedColumn: false
                      },
                      {
                        Header: "",
                        id: "icons",
                        accessor: "id",
                        align: "right",
                        isSortedColumn: false,
                        Cell: ({ value }) => (
                          <Delete
                            fontSize="small"
                            sx={{ cursor: "pointer", color: "red !important" }}
                            onClick={() => setTokenDeleteConfirm(value)}
                          />
                        )
                      }
                    ],
                    rows: tokenList.sort((a, b) => a.id - b.id)
                  }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
      {openNewShiftForm && (
        <NewShift
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateShift={updateShift}
          setUpdateShift={setUpdateShift}
        />
      )}
      {openNewProductForm && (
        <AddProduct
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateProduct={updateProduct}
          setUpdateProduct={setUpdateProduct}
        />
      )}
      {openNewOrderForm && (
        <AddOrder
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateOrder={updateOrder}
          setUpdateOrder={setUpdateOrder}
        />
      )}
      {openNewShiftGroupForm && (
        <NewShiftGroup
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateShiftGroup={updateShiftGroup}
          setUpdateShiftGroup={setUpdateShiftGroup}
        />
      )}
      {openNewHallForm && (
        <NewHall
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateHall={updateHall}
          setUpdateHall={setUpdateHall}
        />
      )}
      {openAddAvaForm && (
        <NewAva
          avaList={avaList}
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateHall={updateHall}
          setUpdateAva={handleUpdateAva}
        />
      )}
      {openNewTagForm && (
        <NewTag
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateTag={updateTag}
          setUpdateTag={setUpdateTag}
        />
      )}
      {openNewTokenForm && (
        <NewToken
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateToken={updateToken}
          setUpdateToken={setUpdateToken}
        />
      )}
      {openOperatorForm && (
        <NewOperator
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateOperator={updateOperator}
          setUpdateOperator={setUpdateOperator}
        />
      )}
      {openAddEnergyPrice && (
        <NewEnergyPrice
          refetch={() => refetchAdminPanel()}
          setSuccessSB={setSuccessSB}
          updateEnergyPrice={updateEnergyPrice}
          setUpdateToken={setUpdateEnergyPrice}
        />
      )}
      {openNewTimelineReasonForm && (
        <TimelineReasons
          setSuccessSB={setSuccessSB}
          updateReason={updateReason}
          setUpdateReason={setUpdateReason}
        />
      )}
      {shiftGroupDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this shift group?"
          open={shiftGroupDeleteConfirm}
          handleClose={deleteShiftGroupHandler}
        />
      )}
      {shiftDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this shift?"
          open={shiftDeleteConfirm}
          handleClose={deleteShiftHandler}
        />
      )}
      {hallDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this hall?"
          open={hallDeleteConfirm}
          handleClose={deleteHallHandler}
        />
      )}
      {tagDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this tag?"
          open={tagDeleteConfirm}
          handleClose={deleteTagHandler}
        />
      )}
      {tokenDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this token?"
          open={tokenDeleteConfirm}
          handleClose={deleteTokenHandler}
        />
      )}
      {timelineDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this reason?"
          open={timelineDeleteConfirm}
          handleClose={deleteTimelineReasonHandler}
        />
      )}
      {operatorDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this operator?"
          open={operatorDeleteConfirm}
          handleClose={deleteOperatorReasonHandler}
        />
      )}
      {avaDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to remove this ava?"
          open={avaDeleteConfirm}
          handleClose={deleteAvaReasonHandler}
        />
      )}
      {energyPriceDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this energy price?"
          open={energyPriceDeleteConfirm}
          handleClose={deleteEnergyPriceReasonHandler}
        />
      )}
      {machineDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this machine?"
          open={machineDeleteConfirm}
          handleClose={deleteMachineReasonHandler}
        />
      )}
      {productDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this Product?"
          open={productDeleteConfirm}
          handleClose={deleteProductReasonHandler}
        />
      )}
      {orderDeleteConfirm && (
        <ConfirmationDialog
          title="Are you sure you want to delete this Order?"
          open={orderDeleteConfirm}
          handleClose={deleteOrderHandler}
        />
      )}
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
    </DashboardLayout>
  );
}

export default Index;
