// /* eslint-disable react/prop-types */
// /* eslint-disable no-unused-vars */
// import React, { useEffect } from "react";
// import Button from "react-bootstrap/Button";
// import Card from "react-bootstrap/Card";
// import "./collections.css";
// import CollectionCard from "../CollectionCard/CollectionCard";
// import image1 from "../../assets/image (1).png";
// import image2 from "../../assets/image (2).png";
// import image3 from "../../assets/image (3).png";

// function Collections({ isHome }) {
//   useEffect(() => {

//   }, [])

//   return isHome ? (
//     <div className="collectionCards">
//       <CollectionCard
//         image={image1}
//         tokenName={"token1"}
//         tokenId={1}
//         tokenPrice={0.1}
//         tokenFractions={3}
//       />
//       <CollectionCard
//         image={image2}
//         tokenName={"token2"}
//         tokenId={2}
//         tokenPrice={0.6}
//         tokenFractions={7}
//       />
//       <CollectionCard
//         image={image3}
//         tokenName={"token3"}
//         tokenId={3}
//         tokenPrice={0.8}
//         tokenFractions={5}
//       />
//     </div>
//   ) : (
//     <>
//       <h1>Personal Collection</h1>
//       <div className="collectionCards">
//         <CollectionCard
//           image={image1}
//           tokenName={"token1"}
//           tokenId={1}
//           tokenPrice={0.1}
//           tokenFractions={3}
//         />
//         <CollectionCard
//           image={image2}
//           tokenName={"token2"}
//           tokenId={2}
//           tokenPrice={0.6}
//           tokenFractions={7}
//         />
//         <CollectionCard
//           image={image3}
//           tokenName={"token3"}
//           tokenId={3}
//           tokenPrice={0.8}
//           tokenFractions={5}
//         />
//       </div>
//     </>
//   );
// }

// export default Collections;
