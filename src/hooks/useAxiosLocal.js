import { useEffect } from "react";
import { axiosLocal } from "../api/axios";

import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";

function useAxiosLocal() {
  const { auth } = useAuth();
  const refresh = useRefreshToken();

  useEffect(() => {
    const requestIntercept = axiosLocal.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${auth?.Token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosLocal.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (
          (error?.response?.status === 403 || error?.response?.status === 401) &&
          !prevRequest?.sent
        ) {
          prevRequest.sent = true;
          const newToken = await refresh();
          prevRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosLocal(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosLocal.interceptors.response.eject(responseIntercept);
      axiosLocal.interceptors.request.eject(requestIntercept);
    };
  }, [auth, refresh]);

  return axiosLocal;
}

export default useAxiosLocal;
