import React, { useState } from "react";
import NavBar from "./NavBar";
import { Button, Card, Form } from "react-bootstrap";

function Mint() {
  const handleImageUpload = (e) => {
    e.target.files.forEach((img) =>
      setImages(...images, URL.createObjectURL(img))
    );
  };

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [images, setImages] = useState([]);

  const handleMinting = (e) => {
    
  } 

  return (
    <>
      <NavBar />
      <Card
        className="position-absolute top-50 start-50 translate-middle"
        style={{ width: "20rem", height: "auto" }}
      >
        <Card.Header className="text-center ">Login</Card.Header>
        <Card.Body>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              handleMinting();
            }}
          >
            <Form.Group className="mb-3 sm" controlId="mintRNFTName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name of the RNFT"
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3 sm" controlId="mintRNFTImages">
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                placeholder="Name of the RNFT"
                onChange={handleImageUpload}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="mintRNFTPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price for RNFT here"
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="mintRNFTOwnerAddress">
              <Form.Label>Owner Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter owner of RNFT here"
                onChange={(e) => setOwnerAddress(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Mint
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

export default Mint;
