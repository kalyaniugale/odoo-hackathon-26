import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(form);

    alert("Frontend Login Successful");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>AssetFlow</h1>
        <p>Asset Management System</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="forgot">
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}