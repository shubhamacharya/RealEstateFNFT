import React, { useState } from "react";
import NavBar from "./NavBar";
import { Button, Card, Form } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { MINT_RNFT } from "../mutations/Mutation";
import { create } from "ipfs-http-client";

function Mint() {
  const [mintNFT] = useMutation(MINT_RNFT);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [imagesObj, setImagesObj] = useState([]);
  const [tokenURI, setTokenURI] = useState("");

  const handleMinting = async (e) => {
    const ipfs = create(new URL("http://127.0.0.1:5001"));

    // Create Direcotry
    await ipfs.files.mkdir(`/RNFT/images/${name}`, { parents: true });

    for (const file of imagesObj) {
      await ipfs.files.write(
        `/RNFT/images/${name}/${name}_${file.name}`,
        file,
        {
          create: true,
        }
      );
    }
    setImageURI((await ipfs.files.stat(`/RNFT/images/${name}`)).cid.toString());

    const adminAccount = localStorage.getItem("account");
    await mintNFT({
      variables: {
        name: name,
        images: imageURI,
        tokenURI: tokenURI,
        price: parseInt(price),
        ownerAddress: ownerAddress,
        adminAddress: adminAccount,
      },
    });
  };

  return (
    <>
      <NavBar />
      <Card
        className="position-absolute top-50 start-50 translate-middle"
        style={{ width: "20rem", height: "auto" }}
      >
        <Card.Header className="text-center ">Mint NFT</Card.Header>
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
                onChange={(e) => setImagesObj(e.target.files)}
              />
            </Form.Group>
            <Form.Group className="mb-3 sm" controlId="mintRNFTURI">
              <Form.Label>URI</Form.Label>
              <Form.Control
                type="text"
                placeholder="URI of the RNFT"
                onChange={(e) => setTokenURI(e.target.value)}
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
