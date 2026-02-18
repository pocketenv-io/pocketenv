import { useState } from "react";
import Navbar from "../../components/navbar";
import SignIn from "../../components/signin/Signin";
import { useLocation, useNavigate } from "@tanstack/react-router";

function New() {
  const isAuthenticated = !!localStorage.getItem("token");
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const navigate = useNavigate();
  const onClaim = () => {
    if (isAuthenticated) {
      navigate({
        to: "/did:plc:pyzvvyrh6eudle55nhqe62tv/sandbox/3mezx5ymmjs26",
      });
      return;
    }
    setSignInModalOpen(true);
  };
  const location = useLocation();

  return (
    <>
      <div className="flex flex-col min-h-screen bg-base-100">
        <Navbar withLogo title="" project="lucky-quietude" />
        {location.pathname.startsWith("/sandbox") && (
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
        <div className="p-4">
          <div className="mt-[50px] flex space-between">
            <div className="flex-1"></div>
            <button className="btn btn-outline btn-lg hover:text-white">
              <span className="icon-[tabler--player-stop-filled] size-5 shrink-0"></span>
              Stop Sandbox
            </button>
          </div>
        </div>
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
