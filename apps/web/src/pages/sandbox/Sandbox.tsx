import { useState } from "react";
import Navbar from "../../components/navbar";
import SignIn from "../../components/signin/Signin";

function New() {
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const onClaim = () => {
    setSignInModalOpen(true);
  };
  const isAuthenticated = !!localStorage.getItem("token");
  return (
    <>
      <div className="flex flex-col min-h-screen bg-base-100">
        <Navbar withLogo title="" project="lucky-quietude" />
        {!isAuthenticated && (
          <div
            className="alert alert-soft alert-warning flex items-center bg-warning/10 border-none"
            role="alert"
          >
            <div className="flex-1">
              This is a temporary project (what's this?) and will be deleted in
              24 hours. Claim it to make it yours.
            </div>

            <button
              onClick={onClaim}
              className="btn btn-md btn-primary font-semibold ml-4"
            >
              Claim Project
            </button>
          </div>
        )}
      </div>
      <SignIn
        isOpen={signInModalOpen}
        onClose={() => {
          setSignInModalOpen(false);
        }}
      />
    </>
  );
}

export default New;
