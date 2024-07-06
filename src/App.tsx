import React, { useState } from "react";
import Navbar from "./components/navbar";
import Search from "./components/search";
import Modal from "./components/UI/Modal";
import Home from "./components/home";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Navbar setIsOpen={setIsOpen} />
      <Home/>
      {isOpen && (
        <Modal isOpen={true} onClose={() => setIsOpen(false)}>
          <Search />
        </Modal>
      )}
    </>
  );
};

export default App;
