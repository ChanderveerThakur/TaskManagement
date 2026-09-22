import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./accounts/Register";
import Login from "./accounts/Login";
import Logout from "./accounts/Logout";

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />

      </Routes>

    </BrowserRouter>
  );
};

export default App;