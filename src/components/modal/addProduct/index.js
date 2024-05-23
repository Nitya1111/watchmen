/* eslint-disable react/prop-types */
import { Autocomplete, Box, Chip, FormControl, Modal } from "@mui/material";
import { updateProductApi } from "api/watchmenApi";
import { createProductApi } from "api/watchmenApi";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useMaterialUIController, setOpenProductForm, setSuccessMsg } from "context";
import translate from "i18n/translate";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { getUpdatedKeysObject } from "utils/constants";

function AddProduct({ setUpdateProduct, productList, refetch }) {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode, openNewProductForm } = controller;
  const [productName, setProductName] = useState("");
  const [productID, setProductID] = useState("");
  const [orderID, setOrderID] = useState("");
  const [cpp, setCPP] = useState("");
  const [description, setDescription] = useState("");
  const [errMsg, setErrMsg] = useState();

  useEffect(() => {
    if (productList) {
      setProductName(productList.product_name);
      setProductID(productList.ext_product_id);
      setOrderID(productList.ext_order_id);
      setCPP(productList.cpp);
      setDescription(productList.description);
    }
  }, [productList]);

  const handleCloseProductForm = () => {
    setOpenProductForm(dispatch, !openNewProductForm);
    setProductName("");
    setProductID("");
    setOrderID("");
    setCPP("");
    setDescription("");
    setUpdateProduct(null);
  };

  const { mutate: createProduct, isLoading: createProductLoading } = useMutation(
    (data) => createProductApi(axiosPrivate, data),
    {
      onSuccess: ({ message }) => {
        refetch();
        setSuccessMsg(dispatch, message);
        handleCloseProductForm();
      }
    }
  );

  const { mutate: updateProductDetails, isLoading: updateProductLoading } = useMutation(
    ({ productId, data }) => updateProductApi(axiosPrivate, productId, data),
    {
      onSuccess: ({ message }) => {
        refetch();
        setSuccessMsg(dispatch, message);
        handleCloseProductForm();
      }
    }
  );

  const handleSubmit = async () => {
    if (
      productName === "" ||
      productID === "" ||
      orderID === "" ||
      cpp === "" ||
      description === ""
    ) {
      setErrMsg("Please fill all the fields");
    } else if (productList) {
      const product = {
        product_name: productName,
        ext_product_id: productID,
        ext_order_id: orderID,
        cpp: cpp,
        description: description
      };
      const compareObjectsTemp = getUpdatedKeysObject(product, productList);
      if (Object.keys(compareObjectsTemp).length !== 0) {
        updateProductDetails({ id: productList.id, data: compareObjectsTemp });
      }
    } else {
      const product = {
        product_name: productName,
        ext_product_id: productID,
        ext_order_id: orderID,
        cpp: cpp,
        description: description
      };
      createProduct(product);
    }
  };

  console.log("openNewProductForm", openNewProductForm);
  return (
    <Modal
      open={openNewProductForm}
      onClose={handleCloseProductForm}
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
            Add Product
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
                type="text"
                label={translate("Product Name")}
                variant="outlined"
                value={productName}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setProductName(e.target.value);
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
                label={translate("Order ID")}
                variant="outlined"
                value={orderID}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setOrderID(e.target.value);
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
                label={translate("CPP")}
                variant="outlined"
                value={cpp}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setCPP(e.target.value);
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
                type="text"
                label={translate("Description")}
                variant="outlined"
                value={description}
                fullWidth
                onChange={(e) => {
                  setErrMsg("");
                  setDescription(e.target.value);
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
              {/* Add Product */}
              {translate(
                productList
                  ? updateProductLoading
                    ? "Updating product"
                    : "Update product"
                  : createProductLoading
                  ? "Creating product"
                  : "Create product"
              )}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

export default AddProduct;
