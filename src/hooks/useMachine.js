import { useContext } from "react";
import MachineContext from "context/MachineProvider";

function useMachine() {
  return useContext(MachineContext);
}

export default useMachine;
