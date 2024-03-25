/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function MintForm({ openMintForm, setOpenMintForm }) {
  //   const handleClickOpenMintForm = () => {
  //     setOpenMintForm(true);
  //   };

  const handleCloseMintForm = () => {
    setOpenMintForm(false);
  };

  return (
    <div>
      <React.Fragment>
        <Dialog
          fullScreen
          open={openMintForm}
          onClose={handleCloseMintForm}
          TransitionComponent={Transition}
        >
          <AppBar sx={{ position: "relative", backgroundColor: "#1A1A2E" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleCloseMintForm}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Create / Mint New Property on Blockchain
              </Typography>
              <Button autoFocus color="#ffff" onClick={handleCloseMintForm}>
                Mint
              </Button>
            </Toolbar>
          </AppBar>
          <List>
            <ListItemButton>
              <ListItemText primary="Phone ringtone" secondary="Titania" />
            </ListItemButton>
            <Divider />
            <ListItemButton>
              <ListItemText
                primary="Default notification ringtone"
                secondary="Tethys"
              />
            </ListItemButton>
          </List>
        </Dialog>
      </React.Fragment>
    </div>
  );
}

export default MintForm;
