import React from "react";
import { Routes, Route } from "react-router-dom";
import Register from "./component/UserManagement/Register";
import Login from "./component/UserManagement/Login";
import UserProfile from "./component/UserManagement/UserProfile";
import UserList from "./component/UserManagement/UserList";

//CookingPlansManagement
import AddCookingPlans from "./component/CookingPlansManagement/AddCookingPlans";
import DisplayCookingPlans from "./component/CookingPlansManagement/DisplayCookingPlans";

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/users" element={<UserList />} />
          <Route path="/AddCookingPlans" element={<AddCookingPlans />} />
          <Route path="/DisplayCookingPlans" element={<DisplayCookingPlans />} />
      </Routes>
    </div>
  )
}

export default App;