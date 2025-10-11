//import logo from './logo.svg';
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Header";
import MainRegLog from "./MainRegLog";
import Footer from "./Footer";
import RegisteredPage from "./RegisteredPage";
import AccountPage from "./AccountPage";
import CreateAction from "./CreateAction";
import LogoutComponent from "./LogoutComponent";
import CompanySearch from "./CompanySearch"; // This is the page that does not require sign in and is used by the counter signer

function App() {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<MainRegLog />} />
          <Route path="RegisteredPage" element={<RegisteredPage />} />
          <Route path="AccountPage" element={<AccountPage />} /> 
          <Route path="CreateAction" element={<CreateAction />} />
          <Route path="LogoutComponent" component={LogoutComponent} />
          <Route path="CompanySearch" element={<CompanySearch />} /> {/*This is the page that does not require sign in and is used by the counter signer*/}
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
