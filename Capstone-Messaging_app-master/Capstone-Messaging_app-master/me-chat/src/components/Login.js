import React from "react";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import {
     useSignInWithGoogle,
     useSignInWithGithub,
     useSignInWithFacebook,
} from "react-firebase-hooks/auth";
import { auth } from "src/utils/firebase";

function Login() {

     // Authentication hooks for different sign-in methods
     const [signInWithGoogle] = useSignInWithGoogle(auth)
     const [signInWithGithub] = useSignInWithGithub(auth)
     const [signInWithFacebook] = useSignInWithFacebook(auth)

     return (
          <div className="welcome-container">
               {/* Paper component for styling the login container */}
               <Paper
                    elevation={8}
                    sx={{
                         margin: "auto",
                         borderRadius: "20px",
                         backgroundColor: "transparent",
                         backdropFilter: "blur(5px)",
                         width: "500px",
                         height: "600px",
                         display: "flex",
                         alignItems: "center",
                         justifycontent: "space-evenly",
                         flexDirection: "column",
                    }}
               >
                    <div className="loginIcon">
                         <img
                              src="/logo.png"
                              alt="logo"
                              style={{ height: "300px", width: "300px" }}
                         ></img>
                    </div>

                    {/* Login options with buttons for different authentication providers */}
                    <div className="loginOptions">
                         <Button
                              variant="outlined"
                              sx={{ width: "250px", color: "black", border: "2px solid" }}
                              onClick={() => signInWithGoogle()}
                         >
                              Login with Google
                         </Button>

                         {/* Button for signing in with Facebook */}
                         <Button
                              variant="outlined"
                              sx={{ width: "250px", color: "black", border: "2px solid" }}
                              onClick={() => signInWithFacebook()}
                         >
                              Login with Facebook
                         </Button>

                         {/* Button for signing in with Github */}
                         <Button
                              variant="outlined"
                              sx={{ width: "250px", color: "black", border: "2px solid" }}
                              onClick={() => signInWithGithub()}
                         >
                              Login with Github
                         </Button>
                    </div>
               </Paper>
          </div>
     );
}

export default Login;
