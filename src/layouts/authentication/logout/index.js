import useLogout from "hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Cookies from "js-cookie";

function Logout() {
  const navigate = useNavigate();
  const signout = useLogout();

  useEffect(() => {
    const logout = async () => {
      Cookies.remove("tok");
      Cookies.remove("id");
      Cookies.remove("companyid");
      Cookies.remove("role");
      Cookies.remove("setting");
      await signout();
      navigate("/signin");
    };

    logout();
  }, []);

  return <p>Logging out</p>;
}

export default Logout;
