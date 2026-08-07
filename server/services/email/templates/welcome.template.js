function welcomeTemplate(user) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Aether AI 🎉</title>
</head>
<body style="margin:0;padding:0;background:#0B1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1120;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:linear-gradient(145deg,#111827,#1a2235);border:1px solid #1E293B;border-radius:20px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#10B981,#059669,#0891B2);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">✦ Aether AI</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Welcome to Aether AI 🎉</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 12px;color:#94A3B8;font-size:15px;">Hello ${user.name || 'User'},</p>
          <p style="margin:0 0 20px;color:#F8FAFC;font-size:16px;font-weight:600;">Your account has been successfully verified.</p>
          <p style="margin:0 0 16px;color:#94A3B8;font-size:15px;">You can now access:</p>
          
          <div style="background:#0B1120;border:1px solid #1E293B;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
            <ul style="margin:0;padding:0 0 0 20px;color:#CBD5E1;font-size:15px;line-height:2.0;">
              <li><strong style="color:#A78BFA;">• AI Chat</strong></li>
              <li><strong style="color:#A78BFA;">• Memory</strong></li>
              <li><strong style="color:#A78BFA;">• Learning</strong></li>
              <li><strong style="color:#A78BFA;">• Document Upload</strong></li>
              <li><strong style="color:#A78BFA;">• Knowledge Search</strong></li>
            </ul>
          </div>

          <p style="margin:0 0 24px;color:#94A3B8;font-size:15px;">Thank you for joining Aether AI.</p>

          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 24px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#10B981,#059669);color:#fff;font-size:16px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.02em;">Start Using Aether AI</a>
          </td></tr></table>

          <div style="border-top:1px solid #1E293B;padding-top:24px;">
            <p style="margin:0;color:#94A3B8;font-size:14px;line-height:1.6;">Regards,<br><strong style="color:#F8FAFC;">Aether AI Team</strong></p>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px 32px;text-align:center;border-top:1px solid #1E293B;">
          <p style="margin:0;color:#475569;font-size:12px;">Aether AI · Private AI Assistant · Built with Google Gemini</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = welcomeTemplate;
