import axios from "api/axios";
import Cookies from "js-cookie";
import useAuth from "./useAuth";

function useRefreshToken() {
  const { setAuth } = useAuth();
  const refreshToken = Cookies.get("tok");

  const refresh = async () => {
    const response = await axios.get("/v2/refresh_token", {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    });
    setAuth((prev) => ({ ...prev, Token: response?.data?.token }));
    return response?.data?.token;
  };
  return refresh;
}

export default useRefreshToken;
