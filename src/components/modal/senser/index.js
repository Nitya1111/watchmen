import MDButton from "components/MDButton"
import { useMaterialUIController, setOpenSenser, setOpenAvaSetup, setOpenTessSetup } from "context"
// import { useState } from "react";

import {
  Modal,
  Box,
  Stack
  // Paper, BottomNavigation, BottomNavigationAction
} from "@mui/material"
import MDBox from "components/MDBox"
import MDTypography from "components/MDTypography"
import translate from "i18n/translate"

function Senser() {
  const [controller, dispatch] = useMaterialUIController()
  const { darkMode, openSenser, openAvaSetup, openTessSetup } = controller
  // const [value, setValue] = useState();

  const handleCloseSenser = () => setOpenSenser(dispatch, false)
  const handleAvaSenser = () => setOpenAvaSetup(dispatch, !openAvaSetup)
  const handleTessSenser = () => setOpenTessSetup(dispatch, !openTessSetup)

  return (
    <Modal
      open={openSenser}
      onClose={handleCloseSenser}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={({ palette: { dark, white } }) => ({
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: darkMode ? "#0F141F" : "#eeeeee",
          border: "1px solid #000",
          borderRadius: "3%",
          boxShadow: 24,
          p: 2,
          color: darkMode ? white.main : dark.main,
          maxHeight: "90vh",
          overflow: "auto"
        })}
        className="customScroll"
      >
        {/* <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
          >
            <BottomNavigationAction label="AVA" />
            <BottomNavigationAction label="TESS" />
          </BottomNavigation>
        </Paper> */}
        {/* <MDBox> */}
        <MDBox pb={2} display="flex" flexDirection="column">
          <MDTypography fontWeight="medium">{translate("Select Senser")}</MDTypography>
        </MDBox>
        <Stack spacing={2} direction="row" sx={{ justifyContent: "center" }}>
          <MDButton color={darkMode ? "dark" : "primary"} onClick={handleAvaSenser}>
            ava
          </MDButton>
          <MDButton color={darkMode ? "dark" : "primary"} onClick={handleTessSenser}>
            tess
          </MDButton>
        </Stack>
        {/* </MDBox> */}
      </Box>
    </Modal>
  )
}

export default Senser
