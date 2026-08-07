function otpTemplate(user, otp) {
    // Split OTP into individual digits for display
    const digits = otp.split('').map(d => `<span style="display:inline-block;width:44px;height:52px;line-height:52px;text-align:center;background:#0B1120;border:2px solid #7C3AED;border-radius:10px;font-size:28px;font-weight:800;color:#A78BFA;margin:0 4px;font-family:monospace;">${d}</span>`).join('');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Login Code — Aether AI</title>
</head>
<body style="margin:0;padding:0;background:#0B1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1120;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:linear-gradient(145deg,#111827,#1a2235);border:1px solid #1E293B;border-radius:20px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#7C3AED,#2563EB,#06B6D4);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">✦ Aether AI</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your Login Verification Code</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;color:#94A3B8;font-size:14px;">Hello, ${user.name}</p>
          <h2 style="margin:0 0 16px;color:#F8FAFC;font-size:20px;font-weight:700;">Your one-time login code</h2>
          <p style="margin:0 0 28px;color:#94A3B8;font-size:15px;line-height:1.7;">Use this code to complete your sign-in to Aether AI. Do not share this code with anyone.</p>
          <div style="text-align:center;padding:24px 0;">
            ${digits}
          </div>
          <div style="margin:24px 0;padding:16px;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:10px;text-align:center;">
            <p style="margin:0;color:#A78BFA;font-size:24px;font-weight:800;letter-spacing:8px;font-family:monospace;">${otp}</p>
          </div>
          <div style="border-top:1px solid #1E293B;padding-top:24px;">
            <p style="margin:0;color:#64748B;font-size:13px;line-height:1.6;">⏱ This code expires in <strong style="color:#94A3B8;">5 minutes</strong>.<br>🔒 Never share this code. Aether AI staff will never ask for it.<br>🚫 Didn't request this? Your account may be at risk — change your password immediately.</p>
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

module.exports = otpTemplate;
