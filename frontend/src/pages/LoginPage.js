import LoginForm from "../components/LoginForm";
import "../styles/LoginForm.css";
import "../styles/EditPost.css";
import { useDocumentMeta } from "../seo/useDocumentMeta";
import { DEFAULT_DESCRIPTION, pageTitle } from "../seo/site";



const LoginPage = () => {
  useDocumentMeta({
    title: pageTitle("Login"),
    description: DEFAULT_DESCRIPTION,
    path: "/auth/login",
    robots: "noindex, nofollow",
  });

  return (
    <div className="main-container">
      <h1 className="login-page-title">Admin Login</h1>
      <LoginForm />
    </div>
  );
};


export default LoginPage;