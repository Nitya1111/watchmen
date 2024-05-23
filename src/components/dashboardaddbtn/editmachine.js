/* eslint-disable react/jsx-no-useless-fragment */
import Icon from "@mui/material/Icon"
import MDBox from "components/MDBox"
import { setOpenMachineForm, useMaterialUIController } from "context"

function EditButton() {
  const [controller, dispatch] = useMaterialUIController()
  const { openMachineForm } = controller

  const handleMachineFormOpen = () => setOpenMachineForm(dispatch, !openMachineForm)

  const newButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="1rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleMachineFormOpen}
    >
      <Icon fontSize="small" color="inherit">
        create
      </Icon>
    </MDBox>
  )
  return <>{newButton}</>
}

export default EditButton
