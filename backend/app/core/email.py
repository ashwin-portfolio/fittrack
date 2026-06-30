import sys

from app.core.config import settings

_PASSWORD_RESET_HTML = """\
<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#111">Reset your FitTrack password</h2>
  <p>We received a request to reset the password for your account.</p>
  <p style="margin:24px 0">
    <a href="{url}"
       style="background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
      Reset password
    </a>
  </p>
  <p style="color:#666;font-size:14px">
    This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
  </p>
</div>
"""

_VERIFY_HTML = """\
<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#111">Verify your FitTrack email</h2>
  <p>Thanks for signing up! Please verify your email address to complete your account setup.</p>
  <p style="margin:24px 0">
    <a href="{url}"
       style="background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
      Verify email
    </a>
  </p>
  <p style="color:#666;font-size:14px">This link expires in <strong>24 hours</strong>.</p>
</div>
"""


def _send(to: str, subject: str, html: str) -> None:
    if not settings.RESEND_API_KEY:
        # Development fallback — print the email to stderr so the token is visible
        print(
            f"\n[DEV EMAIL]\nTo: {to}\nSubject: {subject}\n\n{html}\n",
            file=sys.stderr,
        )
        return

    import resend  # type: ignore[import-untyped]
    resend.api_key = settings.RESEND_API_KEY
    resend.Emails.send({
        "from": settings.FROM_EMAIL,
        "to": [to],
        "subject": subject,
        "html": html,
    })


def send_password_reset_email(to: str, token: str) -> None:
    url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    _send(to, "Reset your FitTrack password", _PASSWORD_RESET_HTML.format(url=url))


def send_verification_email(to: str, token: str) -> None:
    url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    _send(to, "Verify your FitTrack email address", _VERIFY_HTML.format(url=url))
