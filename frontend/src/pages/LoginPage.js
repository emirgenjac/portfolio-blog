import LoginForm from "../components/LoginForm";
import "../styles/LoginForm.css";
import "../styles/EditPost.css";



const LoginPage = () => {
  return (
    <div className="main-container">
      <h1 className="login-page-title">Admin Login</h1>
      <LoginForm />
    </div>
  );
};


export default LoginPage;