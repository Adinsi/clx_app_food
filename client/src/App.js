import { CssBaseline } from "@mui/material";
import React from "react";
import MuiBootm from "./componets/MuiBootm";
import MuiTypography from "./componets/MuiTypography";
import SignUp from "./componets/SignUp";

const App = () => {
  return (
    <div>
      <CssBaseline />
      <MuiTypography />
      <MuiBootm />
      {/* <SignUp/> */}
    </div>
  );
};

export default App;
