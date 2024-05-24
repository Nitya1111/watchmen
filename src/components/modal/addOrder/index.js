/* eslint-disable react/prop-types */
import { Autocomplete, Box, Chip, FormControl, Modal } from "@mui/material";
import { axiosPrivate } from "api/axios";
import { updateOrderApi } from "api/watchmenApi";
import { createOrderApi } from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenOrderForm, setSuccessMsg } from "context";
import translate from "i18n/translate";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { getUpdatedKeysObject } from "utils/constants";

function AddOrder({ setUpdateOrder, orderList, refetch }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewOrderForm } = controller;
  const [orderStartDate, setOrderStartDate] = useState("");
  const [orderEndDate, setOrderEndDate] = useState("");
  const [productID, setProductID] = useState("");
  const [machineID, setMachineID] = useState("");
  const [errMsg, setErrMsg] = useState();

  useEffect(() => {
    if (orderList) {
      setOrderStartDate(orderList.start_datetime.slice(0, -3));
      setOrderEndDate(orderList.end_datetime.slice(0, -3));
      setProductID(orderList.product_id);
      setMachineID(orderList.machine_id);
    }
  }, [orderList]);

  const handleCloseOrderForm = () => {
    setOpenOrderForm(dispatch, !openNewOrderForm);
    setOrderStartDate(null);
    setOrderEndDate(null);
    setProductID("");
    setMachineID("");
    setUpdateOrder(null);
  };

  const { mutate: createOrder, isLoading: createOrderLoading } = useMutation(
    (data) => createOrderApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        refetch();
        setSuccessMsg(dispatch, message);
        handleCloseOrderForm();
      }
    }
  );

  const { mutate: updateOrderDetails, isLoading: updateOrderLoading } = useMutation(
    ({ orderId, data }) => updateOrderApi(axiosPrivate, orderId, data),
    {
      onSuccess: ({ message }) => {
        refetch();
        setSuccessMsg(dispatch, message);
        handleCloseOrderForm();
      }
    }
  );

  const handleSubmit = async () => {
    if (orderStartDate === "" || orderEndDate === "" || productID === "" || machineID === "") {
      setErrMsg("Please fill all the fields");
    } else if (orderList) {
      const order = {
        start_datetime: `${orderStartDate}:00`,
        end_datetime: `${orderEndDate}:00`,
        product_id: productID,
        machine_id: machineID
      };
      const compareObjectsTemp = getUpdatedKeysObject(order, orderList);
      if (Object.keys(compareObjectsTemp).length !== 0) {
        updateOrderDetails({ id: orderList.id, data: compareObjectsTemp });
      }
    } else {
      const order = {
        start_datetime: orderStartDate,
        end_datetime: orderEndDate,
        product_id: productID,
        machine_id: machineID
      };
      createOrder(order);
    }
  };

  console.log("openNewOrderForm", openNewOrderForm);
  return (
    <Modal
      open={openNewOrderForm}
      onClose={handleCloseOrderForm}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={({ palette: { dark, white } }) => ({
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: darkMode ? "#0F141F" : "#eeeeee",
          border: "1px solid #000",
          borderRadius: "3%",
          boxShadow: 24,
          p: 4,
          color: darkMode ? white.main : dark.main,
          maxHeight: "90vh",
          overflow: "auto"
        })}
        className="customScroll"
      >
        <MDBox pt={0.5} pb={3} px={3} display="flex" flexDirection="column">
          <MDTypography
            variant="button"
            color="light"
            fontWeight="medium"
            textGradient
            textAlign="center"
            px={8}
            fontSize="1.25rem"
          >
            {orderList ? "Update Order" : "Add Order"}
          </MDTypography>
          {errMsg && (
            <MDBox mb={2}>
              <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                {errMsg}
              </MDTypography>
            </MDBox>
          )}
          <MDBox mb={2}>
            <FormControl
              sx={({ palette: { dark, white } }) => ({
                width: "100%",
                color: darkMode ? white.main : dark.main
              })}
            >
              <MDInput
                type="date"
                label={translate("Order Start DateTime")}
                variant="outlined"
                value={orderStartDate}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setOrderStartDate(e.target.value);
                }}
                // onChange={(e) => {}}
              />
            </FormControl>
          </MDBox>

          <MDBox mb={2}>
            <FormControl
              sx={({ palette: { dark, white } }) => ({
                width: "100%",
                color: darkMode ? white.main : dark.main
              })}
            >
              <MDInput
                type="date"
                label={translate("Order End DateTime")}
                variant="outlined"
                value={orderEndDate}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setOrderEndDate(e.target.value);
                }}
                // onChange={(e) => {}}
              />
            </FormControl>
          </MDBox>

          <MDBox mb={2}>
            <FormControl
              sx={({ palette: { dark, white } }) => ({
                width: "100%",
                color: darkMode ? white.main : dark.main
              })}
            >
              <MDInput
                type="number"
                label={translate("Product ID")}
                variant="outlined"
                value={productID}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setProductID(e.target.value);
                }}
                // onChange={(e) => {}}
              />
            </FormControl>
          </MDBox>

          <MDBox mb={2}>
            <FormControl
              sx={({ palette: { dark, white } }) => ({
                width: "100%",
                color: darkMode ? white.main : dark.main
              })}
            >
              <MDInput
                type="number"
                label={translate("Machine ID")}
                variant="outlined"
                value={machineID}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setMachineID(e.target.value);
                }}
                // onChange={(e) => {}}
              />
            </FormControl>
          </MDBox>

          <MDBox mb={2} display="flex" flexDirection="column">
            <MDButton
              color="dark"
              size="medium"
              variant={darkMode ? "contained" : "outlined"}
              onClick={handleSubmit}
            >
              {/* Add Order */}
              {translate(
                orderList
                  ? updateOrderLoading
                    ? "Updating order"
                    : "Update order"
                  : createOrderLoading
                  ? "Creating order"
                  : "Create order"
              )}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default AddOrder;
