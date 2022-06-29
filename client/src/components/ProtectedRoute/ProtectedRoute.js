import React, { useState, useEffect } from "react";
import { Redirect, Route } from "react-router-dom";
import { loggedIn } from "../../utils/auth"
// import { auth } from '../utils/Actions'

function ProtectedRoute({ userLoggedIn, setUserLoggedIn, component: Component, ...restOfProps }) {
    const [checkFinished, setCheckFinished] = useState(false)
    useEffect(() => {
      setUserLoggedIn(loggedIn())
      setCheckFinished(true)
    }, [])

  if(checkFinished) {
    return (
      <Route
        {...restOfProps}
        render={(props) =>
          userLoggedIn ? <Component {...props} /> : <Redirect to="/login" />
        }
      />
    );
  } else {
    return(
      <div>
        Loading...
      </div>
    )
  }  
}

export default ProtectedRoute;