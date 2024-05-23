/* eslint-disable react/prop-types */
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import themeDark from "assets/theme-dark";
import MDButton from "components/MDButton";
import translate from "i18n/translate";

const useStyle = () => ({
  color_white: {
    // color: "black!important",
    padding: "24px"
  }
});

function ConfirmationDialog({ title, open, handleClose, cancelButton = false }) {
  const classes = useStyle();
  return (
    <div>
      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#0F141F",
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={classes.color_white}>
          {title}
        </DialogTitle>
        <DialogActions>
          {
            cancelButton && <MDButton
              variant="gradient"
              color="warning"
              size="medium"
              onClick={() => handleClose('cancel')}> {translate("Cancel")}</MDButton>
          }
          <MDButton
            variant="gradient"
            color="dark"
            size="medium"
            onClick={() => handleClose(true)} autoFocus>
            {translate("Yes")}
          </MDButton>
          <MDButton
            variant="gradient"
            color="error"
            size="medium"
            onClick={() => handleClose(false)} > {translate("No")}</MDButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ConfirmationDialog;
