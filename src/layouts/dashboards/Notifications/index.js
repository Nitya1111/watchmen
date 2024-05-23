/* eslint-disable no-shadow */
import { Card, Chip, Grid, Skeleton, Tab, Tabs } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "components/Navbars/DashboardNavbar";
import useAuth from "hooks/useAuth";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import useRefreshToken from "hooks/useRefreshToken";
import translate from "i18n/translate";
import { useEffect, useState } from "react";

// Material Dashboard 2 PRO React examples
import colors from "assets/theme-dark/base/colors";
import { useQuery } from "react-query";
import { enumQueryNames } from "api/reactQueryConstant";
import { whoAmIDetails } from "api/watchmenApi";
import { notificationListAPi } from "api/watchmenApi";
import { getNotificationTypesApi } from "api/watchmenApi";
import NotificationItem from "components/Items/NotificationItem";
import { useMaterialUIController } from "context";

// @mui material components
import MenuItem from "@mui/material/MenuItem";
import Link from "@mui/material/Link";

// custom styles for the NotificationItem
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { notificationColors } from "utils/constants";

const index = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [controller] = useMaterialUIController();
  const { language } = controller;
  const navigate = useNavigate()
  const { axiosPrivate, isAuthSet } = useAxiosPrivate();
  const { auth } = useAuth();
  const refresh = useRefreshToken();
  const [notifications, setNotifications] = useState([])

  const { data: userDetails } = useQuery(
    [enumQueryNames.WHO_AM_I],
    () => whoAmIDetails(axiosPrivate),
    {
      enabled: !!(isAuthSet && auth.Token),
    }
  );

  const { data: notificationTypes = [] } = useQuery([enumQueryNames.GET_NOTIFICATION_TYPE],
    () => getNotificationTypesApi(axiosPrivate),
    {
      enabled: !!(isAuthSet && auth.Token),
    }
  );

  const { isFetched: notificationFetched, refetch: fetchNotifications } = useQuery(
    [enumQueryNames.GET_NOTIFICATION_ALL],
    () => notificationListAPi(axiosPrivate, {
      "language": "en",
      // "start_date": "2024-05-01",
      // "end_date": "2024-05-01",
      "notification_type_ids": userDetails.user.subscription_list
        .filter(item => {
          const notificationGroup = tabValue === 0 ? 'notifications' : 'headlines'
          const currentGroupSubcriptions = notificationTypes.filter(type => type.meta_frontend.group === notificationGroup).map(type => type.id)
          return currentGroupSubcriptions.includes(item.id)
        })
        .map(item => item.id),
      "page": page,
      "per_page": 20
    }),
    {
      enabled: false,
      onSuccess: (data) => {
        setPage(prevPage => prevPage + 1);
        setNotifications((notification) => ([...notification, ...data?.notification_list]))
      }
    }
  );

  useEffect(() => {
    if (notificationTypes.length) {
      fetchNotifications()
    }
  }, [userDetails, notificationTypes, tabValue])

  useEffect(() => {
    refresh();
  }, []);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop <
      document.documentElement.offsetHeight - 1
    )
      return;
    fetchNotifications();
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {
        (!notificationFetched)
          ? <>
            <Skeleton height={100} />
            <Skeleton height={100} />
            <Skeleton height={100} />
            <Skeleton height={100} />
            <Skeleton height={100} />
          </>
          : <Grid item xs={12}>
            <Grid
              item
              spacing={3}
              display="flex"
              justifyContent="flex-end"
              mb={3}
              alignItems="center"
            >
              <Tabs
                orientation="horizontal"
                value={tabValue}
                onChange={(e, value) => {
                  setTabValue(value)
                  setNotifications([])
                  setPage(1)
                }}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: colors.info.main,
                    transition: "none"
                  }
                }}
              >
                <Tab
                  variant="gradient"
                  color="info"
                  sx={{
                    padding: "0 14px", height: "36px"
                  }}
                  label="Notification"
                />
                <Tab
                  variant="gradient"
                  color="info"
                  sx={{
                    padding: "0 14px", height: "36px"
                  }}
                  label="Headline"
                />
              </Tabs>
            </Grid>
            {notifications.length > 0 ? (
              notifications.map((data) => (
                <Card sx={{ marginBottom: '6px', borderRadius: '6px' }}>
                  <MenuItem sx={{ width: '-webkit-fill-available' }}>
                    <MDBox py={0.5} display="flex" alignItems="center" lineHeight={1}
                      sx={{ textWrap: 'pretty !important', width: '-webkit-fill-available' }}>
                      <Grid container>
                        <Grid item xs={10}>
                          <MDTypography variant="button" fontWeight="regular" sx={{ ml: 1 }} onClick={() => {
                            navigate(`/machines/${data.machine_id}?date=${moment(data.created_at)?.format("YYYY-MM-DD")}`)
                          }}>
                            {data?.payload[language?.substring(0, 2)] || ''}
                            <Chip
                              color={notificationColors[data.notification_type_id]}
                              sx={{
                                height: 'auto',
                                ml: 1,
                              }}
                              label={notificationTypes.find(not => not.id === data.notification_type_id)?.name} />
                          </MDTypography>
                        </Grid>
                        <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', textWrap: 'nowrap' }}>
                          <MDTypography variant="button" sx={{ ml: 1, fontSize: "smaller" }}>
                            {moment(data.created_at).format("D MMM HH:mm")}
                          </MDTypography>
                        </Grid>
                      </Grid>
                    </MDBox>
                  </MenuItem>
                </Card>
              ))
            ) : (
              <NotificationItem title={translate("No New Notifications")} />
            )}
          </Grid>
      }

    </DashboardLayout>
  );
};

export default index;
