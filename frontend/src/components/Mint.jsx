import React, { useState } from "react";
import NavBar from "./NavBar";
import { Button, Card, Form } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { MINT_RNFT } from "../mutations/Mutation";
import { uploadImageToIPFS } from "../utils/ipfsOp";
import { getAlert } from "../utils/alerts";

function Mint() {
  const [mintNFT, { data, loading, error }] = useMutation(MINT_RNFT);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [imagesObj, setImagesObj] = useState([]);
  const [tokenURI, setTokenURI] = useState("");

  const handleMinting = async (e) => {
    let tempImageURI = await uploadImageToIPFS(name, imagesObj);

    const adminAccount = localStorage.getItem("account");
    await mintNFT({
      variables: {
        name: name,
        images: tempImageURI.cid.toString(),
        tokenURI: tokenURI,
        price: parseInt(price),
        ownerAddress: ownerAddress,
        adminAddress: adminAccount,
      },
    });

    if (loading) return <p>Creating New NFT</p>;
    if (error)
      getAlert(
        "Error!",
        "Something went wrong while minting NFT",
        "error",
        "OK"
      );
    if (!loading && !error && data)
      getAlert("Success", "Created Token Successfully", "success", "OK");
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
                value={name}
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
            {/* <Form.Group className="mb-3 sm" controlId="mintRNFTURI">
              <Form.Label>URI</Form.Label>
              <Form.Control
                type="text"
                placeholder="URI of the RNFT"
                value={tokenURI}
                onChange={(e) => setTokenURI(e.target.value)}
              />
            </Form.Group> */}
            <Form.Group className="mb-3" controlId="mintRNFTPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price for RNFT here"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="mintRNFTOwnerAddress">
              <Form.Label>Owner Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter owner of RNFT here"
                value={ownerAddress}
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
