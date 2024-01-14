/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import "./collectioncard.css";
import ethLogo from "../../assets/ethLogo.svg";

function CollectionCard({
  image,
  tokenId,
  tokenName,
  tokenFractions,
  tokenPrice,
}) {
  return (
    <Card className="collectionCard">
      <Card.Img className={"collectionCardImg"} variant="top" src={image} />
      <Card.Body>
        <Card.Title>Card Title</Card.Title>
        <Card.Text>
          <Table className="collectionCardTable">
            <tbody>
              <tr>
                <td>Token Id: </td>
                <td>#{tokenId}</td>
              </tr>
              <tr>
                <td>Name:</td>
                <td>{tokenName}</td>
              </tr>
              <tr>
                <td>Fractions:</td>
                <td>{tokenFractions}</td>
              </tr>
              <tr>
                <td>Price:</td>
                <td>
                  {tokenPrice}
                  <img src={ethLogo} className="ethLogo"></img>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        <Button className="collectionCardBtn">See More</Button>
      </Card.Footer>
    </Card>
  );
}

export default CollectionCard;
