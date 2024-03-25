/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./collections.css";
import CollectionCard from "../CollectionCard/CollectionCard";
import image1 from "../../assets/image (1).png";
import image2 from "../../assets/image (2).png";
import image3 from "../../assets/image (3).png";
import { Pagination } from "@mui/material";

const CardsPerPage = 4;

const allCardsData = [
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

function Collections({ isHome }) {
  useEffect(() => {}, []);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * CardsPerPage;
  const endIndex = startIndex + CardsPerPage;
  const displayedCards = allCardsData.slice(startIndex, endIndex);
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };
  return isHome ? (
    <>
      <div className="collectionCards">
        {displayedCards.map((cardData) => (
          <CollectionCard
            key={cardData.tokenId}
            image={cardData.image}
            tokenName={cardData.tokenName}
            tokenId={cardData.tokenId}
            tokenPrice={cardData.tokenPrice}
            tokenFractions={cardData.tokenFractions}
          />
        ))}
      </div>
      <Pagination
        count={Math.ceil(allCardsData.length / CardsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        sx={{
          "& .MuiPaginationItem-root": { color: "#fff" },
          "& .MuiPaginationItem-icon": { color: "#fff" },
        }}
        className="pagination"
      />
    </>
  ) : (
    <>
      <h1>Personal Collection</h1>
      <div className="collectionCards">
        <CollectionCard
          image={image1}
          tokenName={"token1"}
          tokenId={1}
          tokenPrice={0.1}
          tokenFractions={3}
        />
        <CollectionCard
          image={image2}
          tokenName={"token2"}
          tokenId={2}
          tokenPrice={0.6}
          tokenFractions={7}
        />
        <CollectionCard
          image={image3}
          tokenName={"token3"}
          tokenId={3}
          tokenPrice={0.8}
          tokenFractions={5}
        />
      </div>
    </>
  );
}

export default Collections;
