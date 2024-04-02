/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import styled from "@emotion/styled";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";
import MobileStepper from "@mui/material/MobileStepper";
import Switch from "@mui/material/Switch";
import ClearIcon from "@mui/icons-material/Clear";
import ethIcon from "../../assets/ethLogo.svg";
import { MINT_RNFT } from "../../mutations/Mutation";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

import image1 from "../../assets/image (1).png";
import image2 from "../../assets/image (2).png";
import image3 from "../../assets/image (3).png";

import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import axios from "axios";
import Cookies from "js-cookie";

const items = [
  {
    image: image1,
    tokenName: "token1",
    tokenId: 1,
    tokenPrice: 0.1,
    tokenFractions: 0.3,
  },
  {
    image: image2,
    tokenName: "token2",
    tokenId: 2,
    tokenPrice: 0.1,
    tokenFractions: 0.3,
  },
  {
    image: image3,
    tokenName: "token3",
    tokenId: 3,
    tokenPrice: 0.1,
    tokenFractions: 0.3,
  },
  {
    image: image1,
    tokenName: "token4",
    tokenId: 4,
    tokenPrice: 0.1,
    tokenFractions: 0.3,
  },
  {
    image: image2,
    tokenName: "token5",
    tokenId: 5,
    tokenPrice: 0.1,
    tokenFractions: 0.3,
  },
  {
    image: image3,
    tokenName: "token6",
    tokenId: 6,
    tokenPrice: 0.1,
    tokenFractions: 0.3,
  },
];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function MintForm({ openMintForm, setOpenMintForm }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [fractionSwitch, setFractionSwitch] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [mintForm, setMintForm] = React.useState({
    tokenName: "",
    tokenPrice: "",
    tokenFraction: "",
  });

  //   const handleClickOpenMintForm = () => {
  //     setOpenMintForm(true);
  //   };

  const handleCloseMintForm = () => {
    setOpenMintForm(false);
  };

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleCancel = (event) => {
    console.log("Cancel Event Target ==> ", event.target);
    if (event.target.id == "docUploadCancel") {
      setSelectedFile(null);
    } else if (event.target.id == "imageUploadCancel") {
      setSelectedImages([]);
    }
  };

  // Function to handle file selection
  const handleFileChange = (event) => {
    console.log("Event Target ==> ", event.target);
    if (event.target.id == "docUpload") {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file);
      }
    } else if (event.target.id == "imgUpload") {
      setSelectedImages([...event.target.files]);
    }
  };

  const handleMintOperation = async (event) => {
    event.preventDefault();
    const base64ImagesPromises = selectedImages.map((img) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(img);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    });

    const base64FilesPromises = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    const base64ImagesStrings = await Promise.all(base64ImagesPromises);
    const base64FileStrings = await base64FilesPromises;

    try {
      const {
        data: { data },
      } = await axios({
        method: "post",
        url: process.env.REACT_APP_GRAPHQL_URL,
        headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        data: {
          query: MINT_RNFT,
          variables: {
            name: mintForm.tokenName,
            images: base64ImagesStrings,
            docs: base64FileStrings,
            price: mintForm.tokenPrice,
            ownerAddress: "0x00000000000",
            operation: "mintNFT",
          },
        },
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleMintFormChange = (event) => {
    console.log(event.target.name);
    if (event.target.name === "tokenName") {
      setMintForm((mintForm) => {
        return { ...mintForm, tokenName: event.target.value };
      });
    } else if (event.target.name === "tokenPrice") {
      setMintForm((mintForm) => {
        return { ...mintForm, tokenPrice: event.target.value };
      });
    } else if (event.target.name === "tokenFraction") {
      setMintForm((mintForm) => {
        return { ...mintForm, lastName: event.target.value };
      });
    }
  };

  return (
    <div>
      <React.Fragment>
        <Dialog
          fullScreen
          open={openMintForm}
          onClose={handleCloseMintForm}
          TransitionComponent={Transition}
          sx={{ backgroundColor: "#191919" }}
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
              <Button variant="outlined" onClick={handleMintOperation}>
                Create
              </Button>
            </Toolbar>
          </AppBar>
          <Card
            sx={{
              maxWidth: 1500,
              maxHeight: 1000,
              alignSelf: "center",
              margin: 6,
              backgroundColor: "#DAD8D7",
            }}
          >
            <CardActionArea>
              <CardContent>
                <Stack direction="row" spacing={10}>
                  <Stack direction="column" spacing={2}>
                    <TextField
                      fullWidth
                      required
                      id="token-name"
                      label="Token Name"
                      name="tokenName"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={handleMintFormChange}
                    />
                    <TextField
                      fullWidth
                      required
                      id="token-price"
                      label="Token Price"
                      type="number"
                      name="tokenPrice"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={handleMintFormChange}

                      // TODO: Add ethereum icon before / after price
                      // InputProps={{
                      //   startAdornment: (
                      //     <InputAdornment position="start">
                      //       <SvgIcon component={ethIcon} />
                      //     </InputAdornment>
                      //   ),
                      // }}
                    />
                    {/* Fraction NFT option */}
                    <FormControlLabel
                      control={
                        <Switch
                          label="Fraction the NFT"
                          onChange={(event) =>
                            setFractionSwitch(event.target.checked)
                          }
                        />
                      }
                      label="Fraction the NFT"
                    ></FormControlLabel>
                    {fractionSwitch && (
                      <TextField
                        fullWidth
                        required
                        id="token-fractions"
                        label="Token Fractions"
                        type="number"
                        name="tokenFractions"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onChange={handleMintFormChange}
                      />
                    )}
                    <Grid container spacing={2}>
                      <Grid>
                        <Typography>
                          Upload Document related to property
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <input
                          accept="pdf/*" // Specify the accepted file types
                          id="docUpload"
                          type="file"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                        <label htmlFor="docUpload">
                          <Button variant="outlined" component="span">
                            Select File
                          </Button>
                        </label>
                      </Grid>
                      {selectedFile && (
                        <Typography variant="body1">
                          Selected File: {selectedFile.name}
                          <IconButton color="error" onClick={handleCancel}>
                            <ClearIcon id="docUploadCancel" />
                          </IconButton>
                        </Typography>
                      )}
                    </Grid>
                  </Stack>
                  <Stack direction="column" spacing={2}>
                    {/* Carsoule */}
                    <Box sx={{ maxHeight: 500, maxWidth: 350, flexGrow: 1 }}>
                      {selectedImages.length > 0 && (
                        <>
                          <AutoPlaySwipeableViews
                            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                            index={activeStep}
                            onChangeIndex={handleStepChange}
                            enableMouseEvents
                          >
                            {selectedImages.map((step, index) => (
                              <div key={step.name}>
                                {Math.abs(activeStep - index) <= 2 ? (
                                  <Box
                                    component="img"
                                    sx={{
                                      height: 350,
                                      display: "block",
                                      maxWidth: 650,
                                      overflow: "hidden",
                                      width: "100%",
                                    }}
                                    src={URL.createObjectURL(step)}
                                    alt={step.name}
                                  />
                                ) : null}
                              </div>
                            ))}
                          </AutoPlaySwipeableViews>
                          <MobileStepper
                            steps={selectedImages.length}
                            position="static"
                            activeStep={activeStep}
                            nextButton={
                              <Button
                                size="small"
                                onClick={handleNext}
                                disabled={
                                  activeStep === selectedImages.length - 1
                                }
                              >
                                {theme.direction === "rtl" ? (
                                  <KeyboardArrowLeft />
                                ) : (
                                  <KeyboardArrowRight />
                                )}
                              </Button>
                            }
                            backButton={
                              <Button
                                size="small"
                                onClick={handleBack}
                                disabled={activeStep === 0}
                              >
                                {theme.direction === "rtl" ? (
                                  <KeyboardArrowRight />
                                ) : (
                                  <KeyboardArrowLeft />
                                )}
                              </Button>
                            }
                          />
                        </>
                      )}

                      {/* Images Uploads */}
                      <Box
                        sx={{
                          flexGrow: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          component="label"
                          role={undefined}
                          variant="text"
                          tabIndex={-1}
                          startIcon={<CloudUploadIcon />}
                        >
                          Upload token images
                          <VisuallyHiddenInput
                            multiple
                            type="file"
                            id="imgUpload"
                            onChange={handleFileChange}
                          />
                        </Button>
                        {selectedImages.length > 0 && (
                          <IconButton color="error" onClick={handleCancel}>
                            <ClearIcon id="imageUploadCancel" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Dialog>
      </React.Fragment>
    </div>
  );
}

export default MintForm;
