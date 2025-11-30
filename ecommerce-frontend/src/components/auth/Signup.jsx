import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/appTheme.css";

export default function Signup() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		// TODO: replace with real signup call
		console.log("signup", { name, email, password });
		navigate("/home");
	};

	return (
		<div className="app-bg">
			<div className="app-card">
				<div className="app-bar">
					<div className="brand">
						<div className="brand-logo">E</div>
						<div>
							<div className="app-title">Create Account</div>
							<div style={{ fontSize: 12, opacity: 0.9 }}>Join E-Shop</div>
						</div>
					</div>
				</div>

				<div className="card-body">
					<form onSubmit={handleSubmit}>
						<input className="input" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
						<input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
						<input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />

						<button type="submit" className="btn">Create account</button>

						<Link to="/login" className="btn-ghost" style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>
							Already have an account? Sign in
						</Link>

						<div className="note" style={{ textAlign: "center" }}>
							We’ll never share your details.
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}