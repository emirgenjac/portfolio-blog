import React, {useContext, useState} from "react";
import "../styles/LoginForm.css";
import {AuthContext} from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import API from "../api/axios";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const { showAlert } = useModal();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post("/auth/login", { email, password });

            if (response.status === 200) {
                login();
            }
        } catch (error) {
            const status = error.response?.status;
            const serverMessage = error.response?.data?.message;
            const isRawValidation =
                typeof serverMessage === "string" &&
                /validation failed for object=/i.test(serverMessage);

            if (status === 429) {
                await showAlert({
                    title: "Too many attempts",
                    message: serverMessage || "Too many login attempts. Please try again later.",
                    variant: "error",
                });
            } else if (status === 401 || status === 400) {
                await showAlert({
                    title: "Login failed",
                    message:
                        status === 400 && serverMessage && !isRawValidation
                            ? serverMessage
                            : "Invalid credentials. Please try again.",
                    variant: "error",
                });
            } else {
                await showAlert({
                    title: "Login failed",
                    message:
                        serverMessage && !isRawValidation
                            ? serverMessage
                            : "Login failed. Please try again.",
                    variant: "error",
                });
            }
        }
    };

    return (
        <div className="login-form-card">
            <h2 className="login-form-heading">Login</h2>

            <form className="login-form" onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button className="login-submit-btn" type="submit">
                    Login
                </button>
            </form>
        </div>
    );
}

export default LoginForm;
