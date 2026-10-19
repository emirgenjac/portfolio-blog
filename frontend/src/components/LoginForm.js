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
            console.log("Login error:", error);
            alert("Invalid credentials. Please try again.");
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