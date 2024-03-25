import { Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar/NavBar";
import Login from "./components/Login/login";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Collections from "./components/Collections/collections";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setLoggedIn(!!Cookies.get("jwt"));
    console.log(`After change ==> `, loggedIn);
  }, [loggedIn]);
  return (
    <>
      <NavBar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <Routes>
        <Route
          path="/login"
          element={<Login setLoggedIn={setLoggedIn}></Login>}
        ></Route>
        <Route
          path="/home"
          element={<Collections isHome={true}></Collections>}
        ></Route>
        <Route
          path="/collections"
          element={<Collections></Collections>}
        ></Route>
      </Routes>
    </>
  );
}

export default App;
