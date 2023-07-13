import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_USER_COLLECTIONS } from "../queries/Query";
import { Button, Card, Carousel } from "react-bootstrap";
import { readFolderContent } from "../utils/ipfsOp";
import NavBar from "./NavBar";

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

  if (loading) return <h1>Loading....</h1>;
  if (error) return <p>Something Went Wrong.</p>;

  const getImagesURL = async (cid) => {
    let tempArr = await readFolderContent(cid);
    setImgs((imgs) => (imgs = tempArr));
  };

  return (
    <>
      <NavBar />
      {!loading &&
        !error &&
        data.collectionsOfUser.map((collection) => {
          getImagesURL(collection.tokenImg);
          return (
            <Card style={{ width: "18rem", top: "5rem" }} key={collection.id}>
              <Card.Body>
                <Carousel activeIndex={index} onSelect={handleSelect}>
                  {imgs.map((ele, i) => (
                    <Carousel.Item key={`item${i}`}>
                      <img className="d-block w-100 h-50" src={ele} alt={i} />
                    </Carousel.Item>
                  ))}
                </Carousel>
                <Card.Title>{collection.name}</Card.Title>
                <Card.Text>{collection.tokenId}</Card.Text>
                <Card.Text>{collection.price}</Card.Text>
                <Button variant="primary">Go somewhere</Button>
              </Card.Body>
            </Card>
          );
        })}
    </>
  );
}

export default Collections;
