import { createContext, useMemo, useState } from "react";

import PropTypes from "prop-types";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({});
  const value = useMemo(
    () => ({
      auth,
      setAuth
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Setting default props for the AuthProvider
AuthProvider.defaultProps = {
  children: ""
};

// Typechecking props for the AuthProvider
AuthProvider.propTypes = {
  children: PropTypes.node
};

export default AuthContext;
