import "./Login.css";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Login({ setPage }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const submit = (e) => {
    e.preventDefault();
    login(email, pass);
    setPage("home");
  };

  return (
    <div className="login-container">
      <h2>PPS Login</h2>

      <form onSubmit={submit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={pass} 
          onChange={(e) => setPass(e.target.value)} 
        />

        <button className="login-btn">Login</button>
      </form>
    </div>
  );
}
