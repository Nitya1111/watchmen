import { Card } from "@mui/material";
import BasicLayout from "components/BasicLayout";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import translate from "i18n/translate";
import { useState } from "react";
import bgImage from "assets/images/login_bg.webp";
import brandWhite from "assets/images/newlogo.png";
import MDTypography from "components/MDTypography";
import { Link } from "react-router-dom";
import MDButton from "components/MDButton";
import { useMutation } from "react-query";
import { forgotPasswordApi } from "api/watchmenApi";
import axios from "api/axios";
import MDSnackbar from "components/MDSnackbar";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSuccessClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setSuccessMsg("");
    };

    const { mutate: forgotPassword, isLoading } = useMutation(
        (data) => forgotPasswordApi(axios, data),
        {
            onSuccess: ({ message }) => {
                setSuccessMsg(message);
                setErrorMsg('');
            },

            onError: (error) => {
                setErrorMsg(error.response.data.message || "An error occurred");
                setSuccessMsg('');
            }
        }
    )

    const handleSubmit = () => {
        const payload = {
            email
        }
        forgotPassword(payload)
    }
    return <>
        <MDSnackbar
            color="success"
            icon="check"
            title="Success"
            content={successMsg}
            open={!!successMsg}
            onClose={handleSuccessClose}
            close={handleSuccessClose}
            bgWhite
        />
        <MDSnackbar
            color="error"
            icon="error"
            title="Error"
            content={errorMsg}
            open={!!errorMsg}
            onClose={() => setErrorMsg('')}
            close={() => setErrorMsg('')}
            bgWhite
        />
        <BasicLayout image={bgImage}>
            <Card>
                <MDBox
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="dark"
                    mx={2}
                    mt={-3}
                    p={2}
                    mb={1}
                    textAlign="center"
                >
                    <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                        <MDBox display="flex" alignItems="center" justifyContent="center">
                            {brandWhite && (
                                <MDBox
                                    component="img"
                                    src={brandWhite}
                                    alt="Brand"
                                    margin="auto"
                                    width="50%"
                                    height="50%"
                                />
                            )}
                        </MDBox>
                        {translate("Forgot Password")}
                    </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={3} px={3}>
                    <MDBox mb={2} textAlign="center">
                        <MDTypography variant="body2" mb={2}>
                            {translate("forgotPasswordPrompt")}
                        </MDTypography>
                    </MDBox>
                    <MDInput
                        type="email"
                        label={translate("email")}
                        variant="outlined"
                        value={email}
                        fullWidth
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                    />
                    <MDBox mt={4} mb={1}>
                        <MDButton
                            variant="gradient"
                            color="info"
                            type="submit"
                            fullWidth
                            disabled={isLoading}
                            onClick={(e) => handleSubmit(e)}
                        >
                            {isLoading ? translate("Sending Email") : translate("Continue")}
                        </MDButton>
                    </MDBox>
                    <MDBox mb={1} textAlign="center">
                        <MDTypography variant="button" color="text">
                            {translate("Don't have an account?")}{" "}
                            <MDTypography
                                component={Link}
                                to="/signup"
                                variant="button"
                                color="info"
                                fontWeight="medium"
                                // textGradient
                            >
                                {translate("sign up")}
                            </MDTypography>
                        </MDTypography>
                    </MDBox>
                </MDBox>
            </Card>
        </BasicLayout>
    </>
}
export default ForgotPassword