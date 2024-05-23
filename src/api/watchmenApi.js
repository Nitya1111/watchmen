/* eslint-disable import/prefer-default-export */
/* eslint-disable no-return-await */
import { apiUrls } from "./reactQueryConstant";

// login
export const loginUser = async (axiosInstance, loginPayload, headers) =>
  await axiosInstance
    .post(`${apiUrls.loginUserApi}`, loginPayload, { headers })
    .then(({ data }) => data);

export const createQRAuthenticator = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.createQRAuthenticator}`).then(({ data }) => data);

export const emailRequestOtp = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.emailRequestOtp}`, payload).then(({ data }) => data);

export const otpVerification = async (axiosInstance, payload, headers) =>
  await axiosInstance
    .post(`${apiUrls.otpVerification}`, payload, { headers })
    .then(({ data }) => data);

// Halls Apis
export const getHallListApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.hallListApi}`).then(({ data }) => data?.hall_list);

export const getHallDetailApi = async (axiosInstance, hallId) =>
  await axiosInstance.get(`${apiUrls.hallListApi}${hallId}`).then(({ data }) => data.hall);

export const createHallApi = async (axiosInstance, hallPayload) =>
  await axiosInstance.post(`${apiUrls.createHallApi}`, hallPayload).then(({ data }) => data);

export const updateHallApi = async (axiosInstance, hallId, hallPayload) =>
  await axiosInstance
    .put(`${apiUrls.updateHallApi}${hallId}`, hallPayload)
    .then(({ data }) => data);

export const deleteHallApi = async (axiosInstance, hallId) =>
  await axiosInstance.delete(`${apiUrls.deleteHallApi}${hallId}`).then(({ data }) => data);

// Shifts Apis

export const getShiftListApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.shiftListApi}`).then(({ data }) => data?.shift_list);

export const deleteShiftApi = async (axiosInstance, shiftId) =>
  await axiosInstance.delete(`${apiUrls.shiftListApi}${shiftId}`).then(({ data }) => data);

export const createShiftApi = async (axiosInstance, shiftPayload) =>
  await axiosInstance.post(`${apiUrls.shiftListApi}`, shiftPayload).then(({ data }) => data);

export const updateShiftApi = async (axiosInstance, shiftId, shiftPayload) =>
  await axiosInstance
    .put(`${apiUrls.shiftListApi}${shiftId}`, shiftPayload)
    .then(({ data }) => data);

// Shift Group Apis

export const getShiftGroupListApi = async (axiosInstance) =>
  await axiosInstance
    .get(`${apiUrls.shiftGroupListApi}`)
    .then(({ data }) => data?.shift_group_list);

export const deleteShiftGroupApi = async (axiosInstance, shiftGroupId) =>
  await axiosInstance
    .delete(`${apiUrls.shiftGroupListApi}${shiftGroupId}`)
    .then(({ data }) => data);

export const createShiftGroupApi = async (axiosInstance, shiftGropuPayload) =>
  await axiosInstance
    .post(`${apiUrls.shiftGroupListApi}`, shiftGropuPayload)
    .then(({ data }) => data);

export const updateShiftGroupApi = async (axiosInstance, shiftGroupId, shiftGropuPayload) =>
  await axiosInstance
    .put(`${apiUrls.shiftGroupListApi}${shiftGroupId}`, shiftGropuPayload)
    .then(({ data }) => data);

// Machine Apis

export const getMachineListApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.machineListApi}`).then(({ data }) => data?.machine_list);

export const getMachineListTrueApi = async (axiosInstance) =>
  await axiosInstance
    .get(`${apiUrls.machineListApi}?all=true`)
    .then(({ data }) => data?.machine_list);

export const getMachineDetailsApi = async (axiosInstance, machineId) =>
  await axiosInstance.get(`${apiUrls.machineListApi}${machineId}`).then(({ data }) => data.machine);

export const getMachineRatingApi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.machineRating}`, payload).then(({ data }) => data);

export const updateMachineDetailsApi = async (axiosInstance, machineId, payload) =>
  await axiosInstance
    .put(`${apiUrls.machineListApi}${machineId}`, payload)
    .then(({ data }) => data.machine);

// Tags Apis

export const getTagsListApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.tagListApi}`).then(({ data }) => data?.tag_list);

export const deleteTagApi = async (axiosInstance, tagId) =>
  await axiosInstance.delete(`${apiUrls.tagListApi}${tagId}`).then(({ data }) => data);

export const createTagApi = async (axiosInstance, tagPayload) =>
  await axiosInstance.post(`${apiUrls.tagListApi}`, tagPayload).then(({ data }) => data);

export const updateTagApi = async (axiosInstance, tagId, tagPayload) =>
  await axiosInstance.put(`${apiUrls.tagListApi}${tagId}`, tagPayload).then(({ data }) => data);

// Tokens Apis

export const getTokenListApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.tokenListApi}`).then(({ data }) => data?.gen_token_list);

export const deleteTokenApi = async (axiosInstance, tokenId) =>
  await axiosInstance.delete(`${apiUrls.tokenListApi}${tokenId}`).then(({ data }) => data);

export const createTokenApi = async (axiosInstance, shiftGropuPayload) =>
  await axiosInstance.post(`${apiUrls.tokenListApi}`, shiftGropuPayload).then(({ data }) => data);

// OEE calculation api
export const getOeeCalculationApi = async (axiosInstance, reqFilter) =>
  await axiosInstance
    .post(`${apiUrls.getOeeCalculationApi}`, reqFilter)
    .then(({ data }) => Object.values(data.machine_dict));

export const getOeeCalculationDaysApi = async (axiosInstance, reqFilter) =>
  await axiosInstance
    .post(`${apiUrls.getOeeCalculationDaysApi}`, reqFilter)
    .then(({ data }) => data.days);
export const getOeeCalculationWeeksApi = async (axiosInstance, reqFilter) =>
  await axiosInstance
    .post(`${apiUrls.getOeeCalculationWeeksApi}`, reqFilter)
    .then(({ data }) => data.weeks);
// company
export const getCompanyDetailsApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.getCompanyDetails}`).then(({ data }) => data?.company);

export const updateCompanyDetailsApi = async (axiosInstance, companyData) =>
  await axiosInstance
    .put(`${apiUrls.updateCompanyDetails}`, companyData)
    .then(({ data }) => data?.company);

export const getCompanyApi = async (axiosInstance, companyData) =>
  await axiosInstance.get(`${apiUrls.updateCompanyDetails}`, companyData).then(({ data }) => data);
// Shift plan getShiftPlan

export const getShiftPlanApi = async (axiosInstance, reqFilter) =>
  await axiosInstance.post(`${apiUrls.getShiftPlanApi}`, reqFilter).then(({ data }) => data);

export const shiftPlanAssignApi = async (axiosInstance, assignData) =>
  await axiosInstance.post(`${apiUrls.shiftPlanAssignApi}`, assignData).then(({ data }) => data);

// analytics Day cummulative
export const analyticsDayCumulative = async (axiosInstance, reqFilter) =>
  await axiosInstance.post(`${apiUrls.analyticsDayCumulative}`, reqFilter).then(({ data }) => data);

export const analyticsWeekCumulative = async (axiosInstance, reqFilter) =>
  await axiosInstance
    .post(`${apiUrls.analyticsWeekCumulative}`, reqFilter)
    .then(({ data }) => data);

export const analyticsMonthCumulative = async (axiosInstance, reqFilter) =>
  await axiosInstance
    .post(`${apiUrls.analyticsMonthCumulative}`, reqFilter)
    .then(({ data }) => data);

// Operator
export const getOperatorsApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.getOperatorsApi}`).then(({ data }) => data.operator_list);

export const deleteOperatorsApi = async (axiosInstance, operatorId) =>
  await axiosInstance.delete(`${apiUrls.getOperatorsApi}${operatorId}`).then(({ data }) => data);

export const updateOperatorsApi = async (axiosInstance, operatorId, payload) =>
  await axiosInstance
    .put(`${apiUrls.getOperatorsApi}${operatorId}`, payload)
    .then(({ data }) => data);

export const createOperatorsApi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.getOperatorsApi}`, payload).then(({ data }) => data);

export const getOperatorsDayApi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.getOperatorsDayApi}`, payload).then(({ data }) => data);

// Company rank
export const getCompanyRankApi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.getCompanyRankApi}`, payload).then(({ data }) => data);

// timeline reason
export const getTimelineReasonApi = async (axiosInstance) =>
  await axiosInstance
    .get(`${apiUrls.getTimelineReasonApi}`)
    .then(({ data }) => data?.timeline_reason_list);

export const addTimelineReasonApi = async (axiosInstance, tagPayload) =>
  await axiosInstance.post(`${apiUrls.addTimelineReasonApi}`, tagPayload).then(({ data }) => data);

export const updateTimelineReasonApi = async (axiosInstance, reasonId, tagPayload) =>
  await axiosInstance
    .put(`${apiUrls.updateTimelineReasonApi}${reasonId}`, tagPayload)
    .then(({ data }) => data);

export const deleteTimelineReasonApi = async (axiosInstance, reasonId) =>
  await axiosInstance
    .delete(`${apiUrls.deleteTimelineReasonApi}${reasonId}`)
    .then(({ data }) => data);

export const assignTimelineReasonApi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.assignTimelineReasonApi}`, payload).then(({ data }) => data);

// image upload
export const uploadImageApi = async (axiosInstance, machineId, payload) =>
  await axiosInstance
    .post(`${apiUrls.uploadImageApi}${machineId}`, payload)
    .then(({ data }) => data);

// data points
export const postDataPoints = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.dataPoints}`, payload).then(({ data }) => data);
export const uploadCompanyImageApi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.uploadCompanyImageApi}`, payload).then(({ data }) => data);

// energyPrice
export const getEnergyPriceApi = async (axiosInstance, payload) =>
  await axiosInstance.get(`${apiUrls.energyPrice}`, payload).then(({ data }) => data);
export const addEnergyPriceApi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.energyPrice}`, payload).then(({ data }) => data);
export const updateEnergyPriceApi = async (axiosInstance, id, payload) =>
  await axiosInstance.put(`${apiUrls.energyPrice}/${id}`, payload).then(({ data }) => data);
export const deleteEnergyPriceApi = async (axiosInstance, id, payload) =>
  await axiosInstance.delete(`${apiUrls.energyPrice}/${id}`, payload).then(({ data }) => data);

export const getLogoUrl = async (axiosInstance, payload) =>
  await axiosInstance.get(`${apiUrls.logo}${payload.id}`).then(({ data }) => data);

export const getAva = async (axiosInstance, payload) =>
  await axiosInstance.get(`${apiUrls.ava}?unassigned=true`, payload).then(({ data }) => data);

export const deleteMachineApi = async (axiosInstance, id, payload) =>
  await axiosInstance.delete(`${apiUrls.machineListApi}${id}`, payload).then(({ data }) => data);

export const updatePasswordApi = async (axiosInstance, id, payload) =>
  await axiosInstance.put(`${apiUrls.updatePassword}${id}`, payload).then(({ data }) => data);

export const getNotificationTypesApi = async (axiosInstance) =>
  await axiosInstance
    .get(`${apiUrls.getNotificationTypesApi}`)
    .then(({ data }) => data?.notification_type_list);

export const userSubscriptionApi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.userSubscriptionApi}`, payload).then(({ data }) => data);

export const getAdminPanelDataApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.adminPanelDataApi}`).then(({ data }) => data?.company);

export const forgotPasswordApi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.forgotPassword}`, payload).then(({ data }) => data);

export const resetPasswordApi = async (axiosInstance, token, payload) =>
  await axiosInstance.post(`${apiUrls.resetPassword}${token}`, payload).then(({ data }) => data);

export const registerUserApi = async (axiosInstance, token) =>
  await axiosInstance.get(`${apiUrls.registerUser}${token}`).then(({ data }) => data);

export const notificationListAPi = async (axiosInstance, payload) =>
  await axiosInstance.post(`${apiUrls.getNotificationsApi}`, payload).then(({ data }) => data);

export const whoAmIDetails = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.whoAmI}`).then(({ data }) => data);

// Product
export const productListApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.getProductsApi}`).then(({ data }) => data);

export const deleteProductApi = async (axiosInstance, productId) =>
  await axiosInstance.delete(`${apiUrls.getProductDeleteApi}${productId}`).then(({ data }) => data);

export const createProductApi = async (axiosInstance, productPayload) =>
  await axiosInstance.post(`${apiUrls.productListApi}`, productPayload).then(({ data }) => data);

export const updateProductApi = async (axiosInstance, productId, productPayload) =>
  await axiosInstance
    .put(`${apiUrls.productListApi}${productId}`, productPayload)
    .then(({ data }) => data);

// Order
export const getOrderListApi = async (axiosInstance) =>
  await axiosInstance.get(`${apiUrls.getOrderListApi}`).then(({ data }) => data);

export const deleteOrderApi = async (axiosInstance, orderId) =>
  await axiosInstance.delete(`${apiUrls.getOrderDeleteApi}${orderId}`).then(({ data }) => data);

export const createOrderApi = async (axiosInstance, orderPayload) =>
  await axiosInstance.post(`${apiUrls.orderListApi}`, orderPayload).then(({ data }) => data);

export const updateOrderApi = async (axiosInstance, orderId, orderPayload) =>
  await axiosInstance
    .put(`${apiUrls.orderListApi}${orderId}`, orderPayload)
    .then(({ data }) => data);
