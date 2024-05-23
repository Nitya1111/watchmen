import { useEffect, useState } from "react";
import { setErrorMsg, useMaterialUIController } from "context";
import { axiosPrivate } from "../api/axios";
import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";

function useAxiosPrivate() {
  const { auth } = useAuth();
  const [, dispatch] = useMaterialUIController();
  const refresh = useRefreshToken();
  const [isAuthSet, setIsAuthSet] = useState(false);

  useEffect(() => {
    if (auth.Token && !isAuthSet) {
      setIsAuthSet(true);
    } else if (!auth.Token && isAuthSet) {
      setIsAuthSet(false);
    }
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${auth?.Token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.data?.message) {
          setErrorMsg(dispatch, error.response.data.message);
        } else if (error?.message) {
          setErrorMsg(dispatch, error.message);
        }
        const prevRequest = error?.config;
        if (
          (error?.response?.status === 403 || error?.response?.status === 401) &&
          !prevRequest?.sent
        ) {
          prevRequest.sent = true;
          const newToken = await refresh();
          prevRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.response.eject(responseIntercept);
      axiosPrivate.interceptors.request.eject(requestIntercept);
    };
  }, [auth, refresh]);

  return { axiosPrivate, isAuthSet };
}

export default useAxiosPrivate;
