import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (payload) => {
    setIsSubmitting(true);

    try {
      await forgotPassword(payload);
      setSentTo(payload.email);
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-screen forgot-page">
      <section className="auth-shell">
        <div className="auth-brand-panel forgot-brand-panel">
          <p className="auth-eyebrow">Account recovery</p>
          <h1>Reset access</h1>
          <p className="auth-copy">
            Request a secure password reset link for your AssetFlow account.
          </p>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <p className="auth-kicker">Password reset</p>
            <h2>Forgot password</h2>
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

            {sentTo && (
              <p className="auth-success">
                Reset instructions were sent to {sentTo}.
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Sending" : "Send reset link"}</span>
              <ArrowRight size={18} strokeWidth={1.8} />
            </button>
          </form>

          <p className="auth-switch">
            Remembered your password? <Link to="/">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
