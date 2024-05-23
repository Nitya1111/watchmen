import axios from "axios";

const BASE_URL = "http://45.79.125.115:5123/restx/";
const LOCAL_URL = "http://127.0.0.1:5000/api/";
const PRODUCTION_V2_URL = process.env.REACT_APP_BASE_URL || "https://watchmen-api-dev.novoai.de/";
// const PRODUCTION_V2_URL = "https://watchmen-api.novoai.de/";

export default axios.create({
  baseURL: PRODUCTION_V2_URL
});

export const axiosPrivate = axios.create({
  baseURL: PRODUCTION_V2_URL
});

export const axiosLocal = axios.create({
  baseURL: PRODUCTION_V2_URL
});

// export const axiosP = axios.create({
//   baseURL: BASE_URL,
// });
