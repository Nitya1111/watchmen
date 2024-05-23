import { Card } from "@mui/material";
import BasicLayout from "components/BasicLayout";
import MDBox from "components/MDBox";
import translate from "i18n/translate";
import { useEffect, useState } from "react";
import bgImage from "assets/images/login_bg.webp";
import brandWhite from "assets/images/newlogo.png";
import MDTypography from "components/MDTypography";
import { Link } from "react-router-dom";
import { useMutation } from "react-query";
import { registerUserApi } from "api/watchmenApi";
import axios from "api/axios";

function RegistrationConfirmation() {
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { mutate: confirmUser } = useMutation(
        (token) => registerUserApi(axios, token),
        {
            onSuccess: () => {
                setMessage('Registration successful.');
            },
            onError: (error) => {
                setErrorMessage(error?.response?.data?.message)
            }
        }
    )

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        confirmUser(token)
    }, []);

    return (
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
                        {translate("User comfirmation")}
                    </MDTypography>
                </MDBox>
                <MDBox m={2}>
                {message && <MDTypography variant="body2">{message}</MDTypography>}
                {
                    message &&
                    <MDBox pt={4} pb={3} px={3} textAlign="center">
                        <MDTypography
                            component={Link}
                            to="/signup"
                            variant="button"
                            color="info"
                            fontWeight="medium"
                            textGradient
                        >
                            {translate("Continue to Login")}
                        </MDTypography>
                    </MDBox>
                }
                {errorMessage && <MDTypography variant="body2">{errorMessage}</MDTypography>}
                </MDBox>
            </Card>
        </BasicLayout>
    );
}

export default RegistrationConfirmation;
