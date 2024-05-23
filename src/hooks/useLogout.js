// import axios from "api/axios";
import Cookies from "js-cookie";
import useAuth from "./useAuth";
import useAxiosPrivate from "./useAxiosPrivate";
import useMachine from "./useMachine";

function useLogout() {
  const { axiosPrivate } = useAxiosPrivate();
  const { setAuth } = useAuth();
  const { setMachines } = useMachine();

  const signout = async () => {
    try {
      await axiosPrivate("v2/logout");
      setAuth({});
      setMachines({});
      Cookies.set("tok", "");
    } catch (err) {
      console.log(err);
    }
  };

  return signout;
}

export default useLogout;
