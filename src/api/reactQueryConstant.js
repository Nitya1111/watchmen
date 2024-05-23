export const enumQueryNames = {
  HALL_LIST: "hallList",
  SHIFT_LIST: "shiftList",
  SHIFT_GROUP_LIST: "shiftGroupList",
  MACHINE_LIST: "machineList",
  TAG_LIST: "tagList",
  TOKEN_LIST: "tokenList",
  DASHBOARD_STATUS: "dashboardStatus",
  MACHINE_DETAILS: "machineDetails",
  CALCULATION_DETAILS: "calculationDetails",
  COMPANY_DETAILS: "companyDetails",
  SHIFT_ASSIGN_DETAILS: "shiftAssignDetails",
  ANALYTICS_DAY_CUMULATIVE: "analyticsDayCumulative",
  ANALYTICS_WEEK_CUMULATIVE: "analyticsWeekCumulative",
  ANALYTICS_MONTH_CUMULATIVE: "analyticsMonthCumulative",
  MACHINE_RATINGS: "machineRatings",
  OPERATOR_LIST: "operatorList",
  OPERATORS_DAY: "operatorsDay",
  COMPANY_RANK: "companyRank",
  ADD_TIMELINE_REASON: "addTimelineReason",
  GET_TIMELINE_REASON: "getTimelineReason",
  IMAGE_UPLOAD: "imageUpload",
  ENERGY_PRICE: "energyPrice",
  LOGO: "logo",
  QR_AUTHENTICATOR: "qrAuthenticator",
  GET_NOTIFICATION_TYPE: "getNotificationType",
  USER_SUBSCRIPTION: "userSubscription",
  AVA_LIST: "avaList",
  ADMIN_PANEL: "adminPanelDetails",
  FORGOT_PASSWORD: "forgotPassword",
  RESET_PASSWORD: "resetPassword",
  GET_NOTIFICATION: "getNotification",
  GET_NOTIFICATION_ALL: "getNotificationAll",
  WHO_AM_I: "whoAmI"
};

const prefix = "/v2";

export const apiUrls = {
  loginUserApi: `${prefix}/login`,
  hallListApi: `${prefix}/halls/`,
  deleteHallApi: `${prefix}/halls/`,
  createHallApi: `${prefix}/halls/`,
  updateHallApi: `${prefix}/halls/`,
  shiftListApi: `${prefix}/shift/`,
  deleteShiftApi: `${prefix}/shift/`,
  shiftGroupListApi: `${prefix}/shift_group/`,
  machineListApi: `${prefix}/machine/`,
  tagListApi: `${prefix}/tags/`,
  tokenListApi: `${prefix}/gen_token_v2/api-keys`,
  getOeeCalculationApi: `${prefix}/analytics/day`,
  getOeeCalculationDaysApi: `${prefix}/analytics/days`,
  getOeeCalculationWeeksApi: `${prefix}/analytics/weeks`,
  getCompanyDetails: `${prefix}/company/admin_panel`,
  getSuperAdminDetails: `${prefix}/sa/company`,
  getSuperAdminAVADetails: `${prefix}/sa/ava?unassigned=true`,
  updateCompanyDetails: `${prefix}/company/`,
  getShiftPlanApi: `${prefix}/shiftplan/`,
  shiftPlanAssignApi: `${prefix}/shiftplan/assign`,
  analyticsDayCumulative: `${prefix}/analytics/day_cumulative`,
  analyticsWeekCumulative: `${prefix}/analytics/week_cumulative`,
  analyticsMonthCumulative: `${prefix}/analytics/month_cumulative`,
  machineRating: `${prefix}/analytics/machine_rating`,
  getOperatorsApi: `${prefix}/operator/`,
  getOperatorsDayApi: `${prefix}/analytics/operator-days`,
  getCompanyRankApi: `${prefix}/analytics/company_rank`,
  addTimelineReasonApi: `${prefix}/timeline/reason_assign`,
  uploadImageApi: `${prefix}/machine/upload/`,
  uploadCompanyImageApi: `${prefix}/company/upload`,
  getTimelineReasonApi: `${prefix}/timeline_reason/`,
  updateTimelineReasonApi: `${prefix}/timeline_reason/`,
  deleteTimelineReasonApi: `${prefix}/timeline_reason/`,
  assignTimelineReasonApi: `${prefix}/timeline_reason/assign`,
  whoAmI: `${prefix}/who_am_i`,
  ava: `${prefix}/ava/`,
  tess: `${prefix}/tess/`,
  refreshToken: `${prefix}/refresh_token/`,
  addMachine: `${prefix}/`,
  saveUser: `${prefix}/user/`,
  dataPoints: `${prefix}/analytics/datapoints`,
  energyPrice: `${prefix}/company/energy_price`,
  logo: `${prefix}/company/logo/`,
  createQRAuthenticator: `${prefix}/user/gen_authenticator_qr`,
  emailRequestOtp: `${prefix}/email_request_otp`,
  otpVerification: `${prefix}/otp_verification`,
  sendAvaData: `${prefix}/sa/ava/`,
  sendPostAvaData: `${prefix}/sa/ava`,
  updatePassword: `${prefix}/user/`,
  getNotificationTypesApi: `${prefix}/notification_type/`,
  userSubscriptionApi: `${prefix}/user/subscriptions`,
  adminPanelDataApi: `${prefix}/company/admin_panel`,
  forgotPassword: `${prefix}/user/request_reset_password`,
  resetPassword: `${prefix}/confirmation/reset_password?reset_token=`,
  registerUser: `${prefix}/confirmation/registration?token=`,
  getNotificationsApi: `${prefix}/notification/`,
  getProductsApi: `${prefix}/product/`,
  getProductDeleteApi: `${prefix}/product/`
};