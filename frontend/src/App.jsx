import React from "react";
import { Routes, Route} from "react-router-dom";

import Register from "./component/UserManagement/Register";
import Login from "./component/UserManagement/Login";
import UserProfile from "./component/UserManagement/UserProfile";


const App = () => {
  return (


      <main className="flex-grow p-6">
        <Routes>
         <Route path="/register" element={<Register />} />
         <Route path="/login" element={<Login />} />
         <Route path="/userProfile" element={<UserProfile />} />
        </Routes>
      </main>
  );
};

export default App;