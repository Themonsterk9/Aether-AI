function loginAlertTemplate(user, deviceInfo) {
    const time = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Login Alert — Aether AI</title>
</head>
<body style="margin:0;padding:0;background:#0B1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1120;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:linear-gradient(145deg,#111827,#1a2235);border:1px solid #1E293B;border-radius:20px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#1D4ED8,#7C3AED);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">✦ Aether AI</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">New Sign-In Detected</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#F8FAFC;font-size:20px;font-weight:700;">New login to your account 🔔</h2>
          <p style="margin:0 0 24px;color:#94A3B8;font-size:15px;line-height:1.7;">Hi ${user.name}, we detected a new sign-in to your Aether AI account.</p>
          <table width="100%" style="background:#0B1120;border:1px solid #1E293B;border-radius:12px;overflow:hidden;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;border-bottom:1px solid #1E293B;">
              <span style="color:#64748B;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Time</span>
              <p style="margin:4px 0 0;color:#F8FAFC;font-size:14px;">${time}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid #1E293B;">
              <span style="color:#64748B;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">IP Address</span>
              <p style="margin:4px 0 0;color:#F8FAFC;font-size:14px;">${deviceInfo.ip || 'Unknown'}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid #1E293B;">
              <span style="color:#64748B;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Device</span>
              <p style="margin:4px 0 0;color:#F8FAFC;font-size:14px;">${deviceInfo.device || 'Unknown Device'}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;">
              <span style="color:#64748B;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Browser</span>
              <p style="margin:4px 0 0;color:#F8FAFC;font-size:14px;">${deviceInfo.browser || 'Unknown Browser'}</p>
            </td></tr>
          </table>
          <div style="padding:16px;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:10px;">
            <p style="margin:0;color:#FCD34D;font-size:13px;line-height:1.6;">🚨 If this wasn't you, secure your account immediately by resetting your password.</p>
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

module.exports = loginAlertTemplate;
