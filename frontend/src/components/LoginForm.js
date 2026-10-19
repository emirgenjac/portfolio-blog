import React, {useContext, useState} from "react";
import "../styles/LoginForm.css";
import { useNavigate } from "react-router-dom";
import {AuthContext} from "../context/AuthContext";
import API from "../api/axios";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

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

            if (status === 429) {
                alert(serverMessage || "Too many login attempts. Please try again later.");
            } else if (status === 401) {
                alert("Invalid credentials. Please try again.");
            } else {
                alert(serverMessage || "Login failed. Please try again.");
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