import React, {useState} from 'react';
// import './App.css'
import { Routes, Route } from "react-router-dom";
import Navbar from "./navbar";
// import Body from './Components/Others/Body';
import Footer from './Footer';
import Home from './Components/Home/HomeSidebar';
import Transactions from './Components/Transactions/TransactionSidebar';
import Configuration from './Components/Configuration/Configration';
import User from './Components/Users/Users';
import RequestToken from './Components/Home/RequestToken';
import LoginPage from './loginPage';
import AddCustomer from './Components/Users/Customer/addCustomer';
import NotFound from './NotFound'

function App() {
  
  // const [login, setLogin] = useState(false);
  
  return (     
    <>
        {/* <Navbar login={login} setLogin={setLogin} /> */}
        <Navbar />
        <Routes>
          <Route path='/' element={ <Home/> }></Route>
          <Route path='/home' element={ <Home/> }></Route>
          <Route path='/transactions' element={ <Transactions/> }></Route>
          <Route path='/user' element={ <User /> }></Route>
          <Route path='/login' element={ <LoginPage /> }></Route>
          <Route path="*" element={<NotFound />} />
      
          
        </Routes>
        {/* <Body/> */}
        {/* <Footer/> */}
    </>
  )
}

export default App

