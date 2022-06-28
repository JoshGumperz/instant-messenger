import React from 'react'
import LoginBox from '../../components/LoginBox/LoginBox'
import './Login.css'

function Login() {
  return (
    <div className='login-container'>
      <LoginBox loginOrSignup={'login'}/>
    </div>
  )
}

export default Login