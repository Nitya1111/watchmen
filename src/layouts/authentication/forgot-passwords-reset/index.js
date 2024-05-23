import { Card } from "@mui/material";
import BasicLayout from "components/BasicLayout";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import translate from "i18n/translate";
import { useState } from "react";
import bgImage from "assets/images/login_bg.webp";
import brandWhite from "assets/images/newlogo.png";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMutation } from "react-query";
import { resetPasswordApi } from "api/watchmenApi";
import axios from "api/axios";
import MDSnackbar from "components/MDSnackbar";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [resetToken] = useState(new URLSearchParams(window.location.search).get('reset_token'));
    const navigate = useNavigate()

    const handleSuccessClose = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }
        setSuccessMsg("");
      };

    const { mutate: resetPassword, isLoading } = useMutation(
        (payload) => resetPasswordApi(axios, resetToken, payload),
        {
            onSuccess: ({ message }) => {
                setSuccessMsg(message)
                setTimeout(() => {
                    navigate('/signin')
                },2000)
            },
            onError: (error) => {
                setErrMsg(error?.response?.data?.message)
            }
        }
    )

    const handleSubmit = (event) => {
        event.preventDefault();
        if (
            newPassword === '' ||
            confirmPassword === ''
        ) {
            setErrMsg("Please fill all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrMsg("Passwords do not match. Please try again.");
            return;
        }

        const formData = { new_password: newPassword }
        try {
            resetPassword(formData)
        } catch (error) {
            console.log(error);
        }
        // fetch(`${window.location.origin}/v2/confirmation/reset_password?reset_token=${resetToken}`, {
        //     method: 'POST',
        //     body: formData
        // }).then(response => {
        //     if (response.ok) {
        //         alert('Password reset successfully');
        //         // window.location.href = '/login';
        //     } else {
        //         alert('Failed to reset password');
        //     }
        // });
    };

    return (<>
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
                        {translate("Reset Password")}
                    </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={3} px={3}>
                    <MDBox mb={1}>
                        <MDInput
                            type="password"
                            label={translate("New password")}
                            variant="outlined"
                            value={newPassword}
                            fullWidth
                            onChange={(e) => {
                                setErrMsg('')
                                setNewPassword(e.target.value)
                            }}
                            placeholder="New Password"
                        />
                    </MDBox>
                    <MDInput
                        type="password"
                        label={translate("Confirm password")}
                        variant="outlined"
                        value={confirmPassword}
                        fullWidth
                        onChange={(e) => {
                            setErrMsg('')
                            setConfirmPassword(e.target.value)
                        }}
                        placeholder="Confirm New Password"
                    />
                    {
                        errMsg &&
                        <MDBox>
                            <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                                {errMsg}
                            </MDTypography>
                        </MDBox>
                    }
                </MDBox>
                <MDBox mb={3} mx={3}>
                    <MDButton
                        variant="gradient"
                        color="info"
                        type="submit"
                        fullWidth
                        disabled={isLoading}
                        onClick={(e) => handleSubmit(e)}
                    >
                        {isLoading ? translate("Resetting Password") : translate("Reset Password")}
                    </MDButton>
                </MDBox>
            </Card>
        </BasicLayout>
    </>
    );
}

export default ResetPassword;
