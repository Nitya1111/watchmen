import useAuth from "hooks/useAuth";
import useRefreshToken from "hooks/useRefreshToken";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

function PersistLogin() {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!auth?.Token) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  return isLoading ? <p>...Loading...</p> : <Outlet />;
}

export default PersistLogin;
