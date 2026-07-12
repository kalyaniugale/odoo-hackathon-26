import { ArrowRight, LockKeyhole, Mail, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async ({ confirmPassword, ...payload }) => {
    setIsSubmitting(true);

    try {
      await signup(payload);
      toast.success("Account created successfully");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-screen signup-page">
      <section className="auth-shell">
        <div className="auth-brand-panel signup-brand-panel">
          <p className="auth-eyebrow">AssetFlow Access</p>
          <h1>Create your account</h1>
          <p className="auth-copy">
            Join the workspace to manage enterprise assets with role-aware
            workflows and secure access.
          </p>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <p className="auth-kicker">New user</p>
            <h2>Signup</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            <label className="auth-field">
              <span>Name</span>
              <div className="auth-input-wrap">
                <User size={18} strokeWidth={1.8} />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Full name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
              </div>
              {errors.name && (
                <small className="auth-error">{errors.name.message}</small>
              )}
            </label>

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
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
              </div>
              {errors.password && (
                <small className="auth-error">{errors.password.message}</small>
              )}
            </label>

            <label className="auth-field">
              <span>Confirm password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} strokeWidth={1.8} />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <small className="auth-error">
                  {errors.confirmPassword.message}
                </small>
              )}
            </label>

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Creating" : "Create account"}</span>
              <ArrowRight size={18} strokeWidth={1.8} />
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
