/* eslint-disable no-underscore-dangle */
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import { Fragment, useEffect, useState } from "react";

// @material-ui core components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

// Settings page components
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Checkbox, FormControlLabel, IconButton, InputAdornment, Switch } from "@mui/material";
import { apiUrls } from "api/reactQueryConstant";
import DefaultCell from "components/DefaultCell";
import Footer from "components/Footer";
import FormField from "components/FormField";
import Loader from "components/Loader";
import MDSnackbar from "components/MDSnackbar";
import DataTable from "components/Tables/DataTable";
import useAuth from "hooks/useAuth";
import useRefreshToken from "hooks/useRefreshToken";
import translate from "i18n/translate";
import Cookies from "js-cookie";
import { createQRAuthenticator, updatePasswordApi } from "api/watchmenApi";
import { enumQueryNames } from "api/reactQueryConstant";
import { useMutation, useQuery } from "react-query";
import { getNotificationTypesApi } from "api/watchmenApi";
import { useMaterialUIController } from "context";
import { userSubscriptionApi } from "api/watchmenApi";
import { socket } from "App";

function Profile() {
  const [companyUsers, setCompanyUsers] = useState(null);
  const { axiosPrivate, isAuthSet } = useAxiosPrivate();
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLatsName] = useState("");
  const [userId, setUserId] = useState(null);
  const [changesFields, setChangesFields] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [loading, setLoading] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [basicInfoErrMsg, setBasicInfoErrMsg] = useState("");
  const [successSB, setSuccessSB] = useState(null);
  const { auth } = useAuth();
  const refresh = useRefreshToken();
  const userRole = Cookies.get("role");
  const [isLoading, setIsloading] = useState(true);
  const [checked, setChecked] = useState([]);
  const [imageFromAPI, setImageFromAPI] = useState("")

  const [controller] = useMaterialUIController();
  const {
    language
  } = controller
  const closeSuccessSB = () => setSuccessSB(null);

  const { mutate: getNotificationList, data: notificationTypes = [] } = useMutation(
    () => getNotificationTypesApi(axiosPrivate),
    {
      onSuccess: () => { },
    }
  );

  const { mutate: updateSubcriptionHandler, isLoading: subscriptionUpdating } = useMutation(
    (formData) => userSubscriptionApi(axiosPrivate, formData),
    {
      onSuccess: (data) => { 
        data?.rooms_to_join.forEach(room => {
          socket.emit('enter_room', { room_name: room })
        })
        data?.rooms_to_leave.forEach(room => {
          socket.emit('leave_room', { room_name: room })
        })
      },
    }
  );

  const getUserHandler = async () => {
    try {
      const response = await axiosPrivate.get(apiUrls.whoAmI);
      setIsloading(false);
      setName(response.data.user.name);
      setEmail(response.data.user.email);
      setRole(response.data.user.role.name);
      setFirstName(response.data.user.first_name);
      setLatsName(response.data.user.last_name);
      setUserId(response.data.user.id);
      setCompanyUsers(response.data.user.comp);
      setTwoFA(response.data.user._2fa);
      setChecked(response.data.user.subscription_list?.map(item => item.id));
    } catch (err) {
      setIsloading(false);
    }
  };

  const getCompanyUserDetails = async () => {
    // try {
    //     let response = await axiosPrivate.get(apiUrls.user)
    //     if (response.status === 200) {
    //         setCompanyUsers(response.data.users)
    //     }
    // } catch (err) {
    //     console.log(err);
    // }
  };

  // const getCompanyMachineDetails = async () => {
  //     try {
  //         let response = await axiosPrivate.get(`machine/`)
  //         if (response.status === 200) {
  //             setCompanyMachines(response.data.machines)
  //         }
  //     } catch (err) {
  //         console.log(err);
  //     }
  // }

  // const getCompanyDetails = async () => {
  //     try {
  //         let response = await axiosPrivate.get(`company/${companyId}`)
  //         if (response.status === 200) {
  //             console.log(response.data);
  //             // setCompanyDetails(response.data.company)
  //         }
  //     } catch (err) {
  //         console.log(err);
  //     }
  // }

  // useEffect(() => {
  //   refresh();
  // }, []);
  useEffect(() => {
    if (auth.Token && isAuthSet) {
      getUserHandler();
      getNotificationList()
      // if (userRole === "super_admin" || userRole === "admin" && companyId) {
      //     getCompanyDetails()
      // }
      if (userRole === "super_admin" || userRole === "admin") {
        getCompanyUserDetails();
      }
      // if (userRole === "admin") {
      //     getCompanyMachineDetails()
      // }
    } else if (Cookies.get("tok")) {
      refresh();
    }
  }, [auth, isAuthSet]);

  const update2FAHandler = async (status) => {
    try {
      setSavingUser(true);
      const data = {
        _2fa: status
      };
      const response = await axiosPrivate.put(apiUrls.saveUser + userId, data);
      if (response.status === 200) {
        setTwoFA(status)
        setSuccessSB({
          message: response.data.message
        });
      }
      setSavingUser(false);
    } catch (err) {
      setSavingUser(false);
    }
  };

  const { refetch: generateQRCode, isFetching: isQRGenerating } = useQuery(
    [enumQueryNames.QR_AUTHENTICATOR],
    () => createQRAuthenticator(axiosPrivate),
    {
      enabled: false,
      onSuccess: (qrcode) => {
        setImageFromAPI(qrcode.qr_img)
        update2FAHandler(true);
      }
    }
  );

  const passwordRequirements = [
    "Min 8 characters",
    "One special characters",
    "One number (2 are recommended)",
    "One uppercase letter",
    "One lowercase letter",
    "Change it often"
  ];

  const renderPasswordRequirements = passwordRequirements.map((item, key) => {
    const itemKey = `element-${key}`;

    return (
      <MDBox key={itemKey} component="li" color="text" fontSize="1.25rem" lineHeight={1}>
        <MDTypography variant="button" color="text" fontWeight="regular" verticalAlign="middle">
          {translate(item)}
        </MDTypography>
      </MDBox>
    );
  });

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const changePasswordHandler = async () => {
    if (currentPassword === "" || newPassword === "" || confirmNewPassword === "") {
      setErrMsg(translate("Please fill all fields"));
      return;
    }
    if (!validatePassword(newPassword)) {
      setErrMsg(translate('Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrMsg(translate("Confirm password does not match"));
      return;
    }
    try {
      setLoading(true);
      const data = {
        password: currentPassword,
        new_password: newPassword
      };
      const response = await updatePasswordApi(axiosPrivate, userId, data);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      if (response.status === 200) {
        setSuccessSB({
          message: response.data.message
        });
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const saveUserHandler = async () => {
    // if (name === "" || firstName === "" || lastName === "") {
    //   setErrMsg(translate("Please fill all fields"));
    //   return;
    // }
    try {

      const data = {
        first_name: firstName,
        last_name: lastName,
        name,
      };
      Object.keys(data).forEach(key => {
        if (!changesFields.includes(key)) {
          delete data[key]
        }
      })
      let hasError = false
      Object.values(data).forEach(key => {
        if (!key) {
          setBasicInfoErrMsg(translate("Please fill all fields"));
          hasError = true;
        }
      })
      if (hasError) return
      setSavingUser(true);
      const response = await axiosPrivate.put(apiUrls.saveUser + userId, data);
      if (response.status === 200) {
        setSuccessSB({
          message: response.data.message
        });
      }
      setSavingUser(false);
    } catch (err) {
      setSavingUser(false);
      console.log(err);
    }
  };

  const subscrribeNotificationHandler = async () => {

    try {
      const allNotificationIds = notificationTypes.map(item => item.id);
      const unSubscribed = allNotificationIds.filter(item => !checked.includes(item));
      const payload = {
        subscribe: checked,
        unsubscribe: unSubscribed,
      };
      updateSubcriptionHandler(payload)
    } catch (err) {
      console.log(err);
    }
  };

  const notificationCheckBoxHandler = (id) => {
    if (checked.includes(id)) {
      setChecked(checked.filter((item) => item !== id))
    } else {
      setChecked([...checked, id]);
    }
  };

  const handleCheckAll = () => {
    if (checked.length === notificationTypes.length) {
      setChecked([])
    } else {
      setChecked(notificationTypes.map(item => item.id));
    }
  }

  const notificationCheckBox = (
    <MDBox sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
      {
        notificationTypes.map((item, key) => {
          const itemKey = `element-${key}`;
          return (
            <Fragment key={itemKey}>
              <FormControlLabel
                label={item.display_name[language.slice(0, 2)]}
                control={<Checkbox checked={checked.includes(item.id)} onChange={() => notificationCheckBoxHandler(item.id)} />}
              />
              <MDTypography variant="body2" sx={{ fontSize: '0.800rem' }}>{item.description[language.slice(0, 2)]}</MDTypography>
            </Fragment>
          )
        })
      }
    </MDBox>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {isLoading && (userRole === "super_admin" ? !companyUsers : true) ? (
        <Loader />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card id="basic-info" sx={{ overflow: "visible" }}>
                <MDBox
                  p={3}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-end"
                  flexWrap="wrap"
                >
                  <MDTypography variant="h5">{translate("basic info")}</MDTypography>
                  <MDBox ml="auto">
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={saveUserHandler}
                      sx={{
                        mx: 1
                      }}
                    >
                      {savingUser ? translate("Saving user") : translate("save user")}
                    </MDButton>
                  </MDBox>
                </MDBox>
                <MDBox component="form" pb={3} px={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={12}>
                      <FormField
                        label={translate("username")}
                        placeholder="Username"
                        value={name}
                        onChange={({ target }) => {
                          setChangesFields([...changesFields, 'name'])
                          setName(target.value)
                          setBasicInfoErrMsg('')
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label={translate("first name")}
                        placeholder="First name"
                        value={firstName}
                        onChange={({ target }) => {
                          setChangesFields([...changesFields, 'first_name'])
                          setFirstName(target.value)
                          setBasicInfoErrMsg('')
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label={translate("last name")}
                        placeholder="Last name"
                        value={lastName}
                        onChange={({ target }) => {
                          setChangesFields([...changesFields, 'last_name'])
                          setLatsName(target.value)
                          setBasicInfoErrMsg('')
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label={translate("email")}
                        placeholder="example@email.com"
                        inputProps={{ type: "email" }}
                        value={email}
                        disabled
                        sx={{ backgroundColor: 'transparent !important' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        disabled
                        label={translate("role")}
                        placeholder="Thompson"
                        value={role}
                        sx={{ backgroundColor: 'transparent !important' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        sx={{
                          display: 'flex',
                          justifyContent: 'start',
                          width: 'fit-content'
                        }}
                        control={
                          <Switch
                            checked={twoFA}
                            onChange={(event) => update2FAHandler(event.target.checked)}
                            name="2fa" />
                        }
                        label={translate("Activate 2FA")}
                        labelPlacement="start"
                      />
                    </Grid>
                  </Grid>
                  {
                    basicInfoErrMsg &&
                    <MDBox mb={2}>
                      <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                        {basicInfoErrMsg}
                      </MDTypography>
                    </MDBox>
                  }

                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card id="authenticator">
                <MDBox component="form" p={3}>
                  <Grid container>
                    <Grid item xs={12} sm={8}>
                      <MDBox>
                        <MDTypography variant="h5">{translate("Authenticator")}</MDTypography>
                      </MDBox>
                      <MDBox mb={1}>
                        <MDTypography variant="body2" color="text">
                          {translate("Please follow this guide for Two-factor authentication")}
                        </MDTypography>
                      </MDBox>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-end"
                        flexWrap="wrap"
                      >
                        <MDBox component="ul" m={0} pl={3.25} mb={{ xs: 8, sm: 0 }}>
                          <MDBox component="li" color="text" fontSize="1.25rem" lineHeight={1}>
                            <MDTypography variant="button" color="text" fontWeight="regular" verticalAlign="middle">
                              {translate("Download a supported authentication app to your device (such as Google Authenticator, Microsoft Authenticator etc).")}
                            </MDTypography>
                          </MDBox>
                          <MDBox component="li" color="text" fontSize="1.25rem" lineHeight={1}>
                            <MDTypography variant="button" color="text" fontWeight="regular" verticalAlign="middle">
                              {translate("Generate a QR code.")}
                            </MDTypography>
                            <MDButton variant="gradient" color="info" onClick={generateQRCode} sx={{ height: 'fit-content', marginTop: '8px', marginBottom: '8px', display: 'block' }}>
                              {isQRGenerating ? translate("Generating QR code") : translate("Generate QR code")}
                            </MDButton>
                          </MDBox>
                          <MDBox component="li" color="text" fontSize="1.25rem" lineHeight={1}>
                            <MDTypography variant="button" color="text" fontWeight="regular" verticalAlign="middle">
                              {translate("Scan the QR code with your authentication app.")}
                            </MDTypography>
                          </MDBox>
                          <MDBox component="li" color="text" fontSize="1.25rem" lineHeight={1}>
                            <MDTypography variant="button" color="text" fontWeight="regular" verticalAlign="middle">
                              {translate("Use the authentication code provided by your authentication app from your next login.")}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={4} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                      {
                        imageFromAPI &&
                        <img
                          src={`data:image/png;base64,${imageFromAPI}`}
                          style={{ width: '200px', height: '200px' }}
                        />
                      }
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card id="basic-info" sx={{ overflow: "visible" }}>
                <MDBox
                  p={3}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-end"
                  flexWrap="wrap"
                >
                  <MDTypography variant="h5">{translate("Subscription List")}</MDTypography>
                  <MDBox ml="auto">
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={subscrribeNotificationHandler}
                      sx={{
                        mx: 1
                      }}
                    >
                      {subscriptionUpdating ? translate("Subscribing") : translate("Save Subscription")}
                    </MDButton>
                  </MDBox>
                </MDBox>
                <MDBox pl={3} pb={1}>
                  <FormControlLabel
                    label={translate("Subscribe to all")}
                    control={
                      <Checkbox
                        checked={checked.length === notificationTypes.length}
                        indeterminate={checked.length !== notificationTypes.length}
                        onChange={handleCheckAll}
                      />
                    }
                  />
                  {
                    notificationCheckBox
                  }
                </MDBox>
              </Card>
            </Grid>
            {(userRole === "super_admin" || userRole === "admin") && companyUsers && (
              <Grid item xs={12}>
                <Card>
                  <MDBox ml={2} p={3}>
                    <MDTypography variant="h5" fontWeight="medium">
                      {translate("users")}
                    </MDTypography>
                  </MDBox>
                  <DataTable
                    table={{
                      columns: [
                        {
                          Header: translate("name"),
                          accessor: "name",
                          Cell: (value) => <DefaultCell value={value} />
                        },
                        {
                          Header: translate("email"),
                          accessor: "email",
                          Cell: (value) => <DefaultCell value={value} />
                        },
                        {
                          Header: translate("role"),
                          accessor: "role",
                          Cell: (value) => <DefaultCell value={translate(value)} />
                        },
                        {
                          Header: translate("active"),
                          accessor: "active",
                          Cell: (row) => <Switch checked={row.original.active} disabled />
                        }
                      ],
                      rows: companyUsers.sort((a, b) => a.id - b.id)
                    }}
                    entriesPerPage={false}
                    showTotalEntries={false}
                  />
                </Card>
              </Grid>
            )}
            <Grid item xs={12}>
              <Card id="change-password">
                <MDBox p={3}>
                  <MDTypography variant="h5">{translate("change password")}</MDTypography>
                </MDBox>
                <MDBox component="form" pb={3} px={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        type={showCurrentPassword ? "text" : "password"}
                        label={translate("current password")}
                        onChange={(e) => {
                          setErrMsg("");
                          setCurrentPassword(e.target.value);
                        }}
                        value={currentPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {
                                  setShowCurrentPassword(!showCurrentPassword);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                edge="end"
                              >
                                {!showCurrentPassword ? (
                                  <VisibilityOff sx={{ fill: "white" }} />
                                ) : (
                                  <Visibility sx={{ fill: "white" }} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        label={translate("new password")}
                        onChange={(e) => {
                          setErrMsg("");
                          setNewPassword(e.target.value);
                        }}
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {
                                  setShowNewPassword(!showNewPassword);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                edge="end"
                              >
                                {!showNewPassword ? (
                                  <VisibilityOff sx={{ fill: "white" }} />
                                ) : (
                                  <Visibility sx={{ fill: "white" }} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        label={translate("confirm new password")}
                        onChange={(e) => {
                          setErrMsg("");
                          setConfirmNewPassword(e.target.value);
                        }}
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {
                                  setShowConfirmNewPassword(!showConfirmNewPassword);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                edge="end"
                              >
                                {!showConfirmNewPassword ? (
                                  <VisibilityOff sx={{ fill: "white" }} />
                                ) : (
                                  <Visibility sx={{ fill: "white" }} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                  <MDBox mb={2}>
                    <MDTypography variant="button" color="error" fontWeight="medium" textGradient>
                      {errMsg}
                    </MDTypography>
                  </MDBox>
                  <MDBox mt={6} mb={1}>
                    <MDTypography variant="h5">{translate("Password requirements")}</MDTypography>
                  </MDBox>
                  <MDBox mb={1}>
                    <MDTypography variant="body2" color="text">
                      {translate("Please follow this guide for a strong password")}
                    </MDTypography>
                  </MDBox>
                  <MDBox
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    flexWrap="wrap"
                  >
                    <MDBox component="ul" m={0} pl={3.25} mb={{ xs: 8, sm: 0 }}>
                      {renderPasswordRequirements}
                    </MDBox>
                    <MDBox ml="auto">
                      <MDButton variant="gradient" color="info" onClick={changePasswordHandler}>
                        {loading ? translate("updating password") : translate("update password")}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
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

export default Profile;
