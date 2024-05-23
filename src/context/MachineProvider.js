import { createContext, useMemo, useState } from "react";

import PropTypes from "prop-types";

const MachineContext = createContext({});

export function MachineProvider({ children }) {
  const [machines, setMachines] = useState({});

  const value = useMemo(
    () => ({
      machines,
      setMachines
    }),
    [machines]
  );

  return <MachineContext.Provider value={value}>{children}</MachineContext.Provider>;
}

MachineProvider.defaultProps = {
  children: ""
};

MachineProvider.propTypes = {
  children: PropTypes.node
};

export default MachineContext;
