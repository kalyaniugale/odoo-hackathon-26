import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/authService";
import "./ResetPassword.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async ({ confirmPassword, ...payload }) => {
    setIsSubmitting(true);

    try {
      await resetPassword(token, payload);
      toast.success("Password reset successful");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-screen reset-page">
      <section className="auth-shell">
        <div className="auth-brand-panel reset-brand-panel">
          <p className="auth-eyebrow">Secure credential update</p>
          <h1>Set new password</h1>
          <p className="auth-copy">
            Complete the reset flow with a new password for your AssetFlow
            account.
          </p>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <p className="auth-kicker">Reset password</p>
            <h2>New credentials</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
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
              <span>{isSubmitting ? "Resetting" : "Reset password"}</span>
              <ArrowRight size={18} strokeWidth={1.8} />
            </button>
          </form>

          <p className="auth-switch">
            Return to <Link to="/">login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
