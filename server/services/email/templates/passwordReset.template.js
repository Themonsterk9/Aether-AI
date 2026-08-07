function passwordResetTemplate(user, resetUrl) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Your Password — Aether AI</title>
</head>
<body style="margin:0;padding:0;background:#0B1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1120;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:linear-gradient(145deg,#111827,#1a2235);border:1px solid #1E293B;border-radius:20px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#7C3AED,#2563EB,#06B6D4);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">✦ Aether AI</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Password Reset Request</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;color:#94A3B8;font-size:14px;">Hello, ${user.name}</p>
          <h2 style="margin:0 0 16px;color:#F8FAFC;font-size:20px;font-weight:700;">Reset your password 🔑</h2>
          <p style="margin:0 0 24px;color:#94A3B8;font-size:15px;line-height:1.7;">We received a request to reset the password for your Aether AI account. Click the button below to choose a new password.</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 32px;">
            <a href="${resetUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#7C3AED,#2563EB);color:#fff;font-size:16px;font-weight:700;text-decoration:none;border-radius:12px;">Reset My Password</a>
          </td></tr></table>
          <p style="margin:0 0 8px;color:#64748B;font-size:13px;">Or copy this link into your browser:</p>
          <p style="margin:0 0 32px;padding:12px 16px;background:#0B1120;border:1px solid #1E293B;border-radius:8px;color:#7C3AED;font-size:12px;word-break:break-all;">${resetUrl}</p>
          <div style="border-top:1px solid #1E293B;padding-top:24px;">
            <p style="margin:0;color:#64748B;font-size:13px;line-height:1.6;">⏱ This link expires in <strong style="color:#94A3B8;">15 minutes</strong>.<br>🔒 If you didn't request a password reset, ignore this email — your password remains unchanged.</p>
          </div>
        </td></tr>
        <tr><td style="padding:20px 40px 32px;text-align:center;border-top:1px solid #1E293B;">
          <p style="margin:0;color:#475569;font-size:12px;">Aether AI · Private AI Assistant · Built with Google Gemini</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = passwordResetTemplate;
