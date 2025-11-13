import React, { useState } from "react";
import "../styles/PostForm.css"; // reuse same styling for consistency
import { useNavigate } from "react-router-dom";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                alert("Login successful!");
                navigate("/blog");
            } else {
                alert("Invalid credentials. Please try again.");
            }
        } catch (error) {
            console.log("Login error:", error);
            alert("Something went wrong. Try again later.");
        }
    };

    return (
        <div className="main-container">
            <h2 style={{ marginBottom : "5rem" }}>Login</h2>
            <form className="container" onSubmit={handleSubmit}>
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

                <button className="submitBtn" type="submit">
                    Login
                </button>
            </form>
        </div>
    );
}

export default LoginForm;
