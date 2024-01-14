import { Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar/NavBar";
import Login from "./components/Login/login";
import Collections from "./components/Collections/collections";

function App() {
  return (
    <>
      <NavBar className="navbar" />
      <Routes>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route
          path="/collections"
          element={<Collections></Collections>}
        ></Route>
      </Routes>
    </>
  );
}

export default App;
