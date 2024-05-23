import React, { useState } from 'react';
import { TextField, Button, Switch } from '@mui/material';
import MDBox from 'components/MDBox';
import MDCard from 'components/MDCard';
import MDTypography from 'components/MDTypography';
import { emailRequestOtp } from 'api/watchmenApi';
import Cookies from 'js-cookie';
import axios from "api/axios";
import { useMutation } from 'react-query';
import MDSnackbar from 'components/MDSnackbar';
import { otpVerification } from 'api/watchmenApi';
import useAuth from 'hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import BasicLayout from "components/BasicLayout";
import bgImage from "assets/images/login_bg.webp";
import translate from "i18n/translate";

function OTPForm() {
    const [values, setValues] = useState(Array(6).fill(''));
    const [successSB, setSuccessSB] = useState(null);
    const [errorSB, setErrorSB] = useState(null);
    const [isEmailVerify, setIsEmailVerify] = useState(false)
    const [trustDevice, setTrustDevice] = useState(false);
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();

    const closeSuccessSB = () => setSuccessSB(null);
    const closeErrorSB = () => setErrorSB(null);

    const handleTrustDevice = () => setTrustDevice(!trustDevice);

    const headers = {
        systemId: Cookies.get("systemId") // Assuming systemId is always present in your cookies by this time
    };

    const { mutate: sendOptOverMail, isLoading } = useMutation((data) => emailRequestOtp(axios, data), {
        onSuccess: (data) => {
            setSuccessSB(data)
            setIsEmailVerify(true)
        },
    });

    const { mutate: verifyOtp, isLoading: verifyingOtp } = useMutation((data) => otpVerification(axios, data, headers), {
        onSuccess: (data) => {
            const refreshToken = data?.refresh_token;
            const Token = data?.token;
            const roles = data?.user?.role;
            const UserCompanyId = data?.user?.company?.id;
            const Id = data?.user?.id;
            const role = data?.user?.role?.name;
            const setting = data?.user?.setting;
            const name = data?.user?.name;
            setAuth({ refreshToken, Token, roles });
            Cookies.set("tok", refreshToken, { expires: 15 });
            Cookies.set("id", Id);
            Cookies.set("companyid", UserCompanyId);
            Cookies.set("role", role);
            Cookies.set("setting", setting);
            Cookies.set("name", name);
            navigate(`dashboard/machines`, { replace: true });
        },
        onError: () => {
            setErrorSB({ message: 'The OTP you entered is incorrect. Please try again.' })
        }
    });

    const handleChange = (index, newValue) => {
        if (/^\d{0,1}$/.test(newValue)) {
            const newValues = [...values];
            newValues[index] = newValue;
            setValues(newValues);
            if (newValue !== '' && index < values.length - 1) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        }
    };

    const handleBackspace = (index, event) => {
        if (event.key === 'Backspace' && index > 0 && values[index] === '') {
            const newValues = [...values];
            newValues[index - 1] = '';
            setValues(newValues);
            document.getElementById(`otp-input-${index - 1}`).focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').split('').slice(0, 4);
        const newValues = [...values];
        pastedData.forEach((value, index) => {
            if (value && index < values.length) {
                newValues[index] = value;
            }
        });
        setValues(newValues);
        if (pastedData.length > 0) {
            document.getElementById(`otp-input-${Math.min(pastedData.length - 1, values.length - 1)}`).focus();
        }
    };

    const sendEmailOtpHandler = () => {
        const name = Cookies.get("username");
        const payload = {
            "name": name,
        }
        sendOptOverMail(payload);
    }

    const verifyOtpHandler = () => {
        const name = Cookies.get("username");
        const payload = {
            "name": name,
            // "email": "your_email",
            "auth_method": isEmailVerify ? "email" : "authenticator",
            "trust_device": trustDevice,
            "otp": parseInt(values.join(''), 10)
        }
        verifyOtp(payload)
    }

    return (
        <BasicLayout image={bgImage}>
            <MDBox
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '600px',
                    height: '100vh',
                    left: '50%',
                    position: 'relative',
                    transform: 'translateX(-50%)'

                }}
            >
                {/* <ParticleBackground /> */}
                <MDCard sx={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <MDTypography variant="h5">{translate(`${isEmailVerify ? "Email" : "Authenticator"} Verification`)}</MDTypography>
                    <MDTypography variant="body2">
                        {translate('Enter the 6-Digit Verification Code')}
                    </MDTypography>
                    <MDBox mt={2}>
                        {values.map((value, index) => (
                            <TextField
                                key={index}
                                id={`otp-input-${index}`}
                                type="text"
                                variant="outlined"
                                inputProps={{
                                    maxLength: 1,
                                    style: { textAlign: 'center' },
                                }}
                                value={value}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleBackspace(index, e)}
                                onPaste={handlePaste}
                                sx={{
                                    width: '70px',
                                    padding: '10px',
                                }}
                            />
                        ))}
                    </MDBox>
                    <MDBox display="flex" alignItems="center" ml={-1}>
                        <Switch checked={trustDevice} onChange={handleTrustDevice} />
                        <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                            onClick={handleTrustDevice}
                            sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                        >
                            &nbsp;&nbsp;{translate("Trust this device for next 30 days")}
                        </MDTypography>
                    </MDBox>
                    <MDBox mt={2} mb={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={verifyOtpHandler}
                            mt={4}
                        >
                            {translate("Verify Account")}
                        </Button>
                    </MDBox>

                    <MDTypography variant="body2">{isEmailVerify ? "" : translate("Is Your Authenticator Not Configured?")}
                        {
                            !isEmailVerify ?
                                <MDTypography
                                    variant="button"
                                    color="info"
                                    fontWeight="medium"
                                    textGradient

                                    onClick={sendEmailOtpHandler}
                                    sx={{
                                        display: 'inline',
                                        color: 'blue',
                                        cursor: 'pointer',
                                        marginLeft: '4px'
                                    }}>{translate('Send Email')}</MDTypography>
                                : <MDBox>
                                    <MDTypography
                                        variant="button"
                                        color="info"
                                        fontWeight="medium"
                                        textGradient
                                        onClick={sendEmailOtpHandler}
                                        sx={{
                                            display: 'inline',
                                            color: 'blue',
                                            cursor: 'pointer',
                                            marginLeft: '4px'
                                        }}>{translate('Resend Email')} /</MDTypography>
                                    <MDTypography
                                        variant="button"
                                        color="info"
                                        fontWeight="medium"
                                        textGradient

                                        onClick={() => setIsEmailVerify(false)}
                                        sx={{
                                            display: 'inline',
                                            color: 'blue',
                                            cursor: 'pointer',
                                            marginLeft: '4px'
                                        }}>{translate('Back to Authenticator Verification')}</MDTypography>
                                </MDBox>
                        }
                    </MDTypography>
                </MDCard>
            </MDBox>
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
            <MDSnackbar
                color="error"
                icon="check"
                title="Error"
                content={translate(errorSB?.message || '')}
                open={!!errorSB?.message}
                onClose={closeErrorSB}
                close={closeErrorSB}
                bgWhite
            />
        </BasicLayout>
    );
}

export default OTPForm;
