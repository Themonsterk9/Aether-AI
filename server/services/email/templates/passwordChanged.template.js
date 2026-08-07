function passwordChangedTemplate(user) {
    const time = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Password Changed — Aether AI</title>
</head>
<body style="margin:0;padding:0;background:#0B1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1120;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:linear-gradient(145deg,#111827,#1a2235);border:1px solid #1E293B;border-radius:20px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#059669,#0891B2);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">✦ Aether AI</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Password Changed Successfully</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#F8FAFC;font-size:20px;font-weight:700;">Your password was changed ✅</h2>
          <p style="margin:0 0 24px;color:#94A3B8;font-size:15px;line-height:1.7;">Hi ${user.name}, your Aether AI account password was successfully changed on <strong style="color:#F8FAFC;">${time}</strong>.</p>
          <div style="padding:20px;background:rgba(5,150,105,0.1);border:1px solid rgba(5,150,105,0.3);border-radius:12px;margin-bottom:24px;">
            <p style="margin:0;color:#6EE7B7;font-size:14px;line-height:1.6;">✅ If you made this change, no further action is needed.<br><br>🚨 If you did NOT change your password, your account may be compromised. Please contact support immediately and reset your password.</p>
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

module.exports = passwordChangedTemplate;
