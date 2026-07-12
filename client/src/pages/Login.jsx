import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      await login(values);
      toast.success("Login successful");
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-screen login-page">
      <section className="auth-shell">
        <div className="auth-brand-panel">
          <p className="auth-eyebrow">Enterprise Asset Management</p>
          <h1>AssetFlow</h1>
          <p className="auth-copy">
            Control assets, allocations, audits, bookings, and maintenance from
            a single operational workspace.
          </p>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <p className="auth-kicker">Secure access</p>
            <h2>Login</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            <label className="auth-field">
              <span>Email</span>
              <div className="auth-input-wrap">
                <Mail size={18} strokeWidth={1.8} />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <small className="auth-error">{errors.email.message}</small>
              )}
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} strokeWidth={1.8} />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
              </div>
              {errors.password && (
                <small className="auth-error">{errors.password.message}</small>
              )}
            </label>

            <div className="auth-row">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Signing in" : "Sign in"}</span>
              <ArrowRight size={18} strokeWidth={1.8} />
            </button>
          </form>

          <p className="auth-switch">
            New to AssetFlow? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
