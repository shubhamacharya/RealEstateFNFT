/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import "./collectioncard.css";
import ethLogo from "../../assets/ethLogo.svg";

import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import { Button, Table, TableCell, TableHead, TableRow } from "@mui/material";
import TablePagination from "@mui/material/TablePagination";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function CollectionCard({
  image,
  tokenId,
  tokenName,
  tokenFractions,
  tokenPrice,
}) {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const [page, setPage] = React.useState(2);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Card sx={{ maxWidth: 350, maxHeight: 650, margin: 2 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
              R
            </Avatar>
          }
          title={tokenName.toUpperCase()}
          subheader="Token Creation Date and Time Displayed here"
        />
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt="Paella dish"
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            <Table
              sx={{ minWidth: 250 }}
              aria-label="simple table"
              size="small"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="left">Token Id:</TableCell>
                  <TableCell align="right">#{tokenId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left">Name:</TableCell>
                  <TableCell align="right">{tokenName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left">Fractions:</TableCell>
                  <TableCell align="right">{tokenFractions}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left">Price:</TableCell>
                  <TableCell align="right">
                    {tokenPrice}
                    <img src={ethLogo} className="ethLogo"></img>
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <Button variant="text">Buy</Button>
          <IconButton sx={{ flex: 1 }} aria-label="add to favorites">
            <FavoriteIcon />
          </IconButton>
          <IconButton sx={{ flex: 1 }} aria-label="share">
            <ShareIcon />
          </IconButton>

          {/* <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore> */}
        </CardActions>
      </Card>
    </>
    // <Card className="collectionCard">
    //   <Card.Img className={"collectionCardImg"} variant="top" src={image} />
    //   <Card.Body>
    //     <Card.Title>Card Title</Card.Title>
    //     <Card.Text>
    //       <Table className="collectionCardTable">
    //         <tbody>
    //           <tr>
    //             <td>Token Id: </td>
    //             <td>#{tokenId}</td>
    //           </tr>
    //           <tr>
    //             <td>Name:</td>
    //             <td>{tokenName}</td>
    //           </tr>
    //           <tr>
    //             <td>Fractions:</td>
    //             <td>{tokenFractions}</td>
    //           </tr>
    //           <tr>
    //             <td>Price:</td>
    //             <td>
    //               {tokenPrice}
    //               <img src={ethLogo} className="ethLogo"></img>
    //             </td>
    //           </tr>
    //         </tbody>
    //       </Table>
    //     </Card.Text>
    //   </Card.Body>
    //   <Card.Footer>
    //     <Button className="collectionCardBtn">See More</Button>
    //   </Card.Footer>
    // </Card>
  );
}

export default CollectionCard;
