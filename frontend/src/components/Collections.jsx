import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER_COLLECTIONS } from "../queries/Query";
import { SELL_NFT } from "../mutations/Mutation";
import { Button, Card, Carousel, Col, Row } from "react-bootstrap";
import { readFolderContent } from "../utils/ipfsOp";
import NavBar from "./NavBar";
import { getAlert } from "../utils/alerts";

function Collections() {
  const [index, setIndex] = useState(0);
  const [imgs, setImgs] = useState([]);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const account = localStorage.getItem("account");
  const { loading, error, data } = useQuery(GET_USER_COLLECTIONS, {
    variables: {
      ownerAddress: account,
    },
  });
  const [sellNFT] = useMutation(SELL_NFT);

  if (loading) return <h1>Loading....</h1>;
  if (error) return <p>Something Went Wrong.</p>;
  if (!loading && !error && data.collectionsOfUser.length === 0)
    return (
      <>
        <NavBar />
        <p>No Collections</p>
      </>
    );

  const getImagesURL = async (cid) => {
    let tempArr = await readFolderContent(cid);
    setImgs((imgs) => (imgs = tempArr));
  };

  const handleSell = async (tokenId) => {
    let ownerAddress = localStorage.getItem("account");
    const { data, error, loading } = await sellNFT({
      variables: {
        tokenId: tokenId,
        ownerAddress: ownerAddress,
      },
    });
    if (loading) return <p>Creating New NFT</p>;
    if (error)
      getAlert(
        "Error!",
        "Something went wrong while adding NFT for sell",
        "error",
        "OK"
      );
    if (!loading && !error && data)
      getAlert("Success", "Token Added For Sale", "success", "OK");
  };

  return (
    <>
      <NavBar />
      <Row xs={1} md={6} className="g-4">
        {!loading &&
          !error &&
          data !== undefined &&
          data.collectionsOfUser.map((collection) => {
            getImagesURL(collection.tokenImg);
            return (
              <Col key={collection.id}>
                <Card
                  style={{ width: "18rem", top: "5rem" }}
                  key={collection.id}
                >
                  <Card.Body>
                    <Carousel activeIndex={index} onSelect={handleSelect}>
                      {imgs.map((ele, i) => (
                        <Carousel.Item key={`item${i}`}>
                          <img
                            className="d-block w-100 h-50"
                            src={ele}
                            alt={i}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                    <Card.Title>{collection.name}</Card.Title>
                    <Card.Text>Token Id : {collection.tokenId}</Card.Text>
                    <Card.Text>
                      Price : {collection.price}
                      <img src="..\images\eth.png" alt="ethLogo" />
                    </Card.Text>
                    <Button
                      variant="primary"
                      onClick={() => handleSell(collection.tokenId)}
                    >
                      Sell
                    </Button>
                    <Button variant="primary">Fraction</Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
      </Row>
    </>
  );
}

export default Collections;
