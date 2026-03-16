// WELCOME EMAIL
export function generateWelcomeEmail({ userName, loginUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@media only screen and (max-width: 600px) {
  .email-container { width: 100% !important; }
  .email-content { padding: 24px !important; }
  h1 { font-size: 24px !important; }
  .cta-button { padding: 12px 32px !important; font-size: 14px !important; }
}
</style>
</head>
<body style="
  margin:0;
  padding:0;
  background:#f5f5f4;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  color:#1c1917;
">

<div style="display:none">
Welcome to Momentum - Start your journey today
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr>
<td align="center">

<table class="email-container" width="560" cellpadding="0" cellspacing="0" style="
  background:#ffffff;
  border-radius:12px;
  overflow:hidden;
  max-width:100%;
">

<tr>
<td class="email-content" style="padding:40px">

<h1 style="
  margin:0;
  text-align:center;
  font-size:32px;
  font-weight:700;
  font-family:Georgia,'Times New Roman',Times,serif;
  letter-spacing:-0.5px;
  color:#1c1917;
">
Momentum
</h1>

<div style="
  height:4px;
  background:#87a96b;
  margin:16px 0 40px;
"></div>

<p style="
  font-size:16px;
  margin:0 0 24px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  color:#1c1917;
">
Hi <strong>${userName}</strong>,
</p>

<p style="
  font-size:15px;
  margin:0 0 12px;
  color:#57534e;
  line-height:1.6;
">
Welcome to Momentum! We're excited to have you here.
</p>

<p style="
  font-size:15px;
  margin:0 0 28px;
  color:#57534e;
  line-height:1.6;
">
Building lasting habits is a journey, and we're here to support you every step of the way. With Momentum, you'll be able to track your progress, stay consistent, and celebrate your wins.
</p>

<div style="
  background:#f5f5f4;
  border-left:4px solid #87a96b;
  padding:16px;
  margin:0 0 32px 0;
  border-radius:4px;
">
<p style="
  font-size:14px;
  color:#57534e;
  margin:0;
  line-height:1.5;
  font-style:italic;
  font-family:Georgia,'Times New Roman',Times,serif;
">
"The secret of getting ahead is getting started." <span style="font-style:normal;color:#87a96b;font-weight:600;font-size:12px;">— Mark Twain</span>
</p>
</div>

<table cellpadding="0" cellspacing="0" width="100%">
<tr>
<td align="center" style="padding:0 0 16px 0">
<a href="${loginUrl}" class="cta-button" style="
  display:inline-block;
  background:#87a96b;
  color:#ffffff;
  font-size:15px;
  font-weight:600;
  text-decoration:none;
  padding:14px 40px;
  border-radius:8px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
">
Get Started
</a>
</td>
</tr>
</table>

<div style="
  margin-top:16px;
  padding:16px;
  text-align:center;
  background:#87a96b;
  color:#ffffff;
  font-size:12px;
  border-radius:8px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
">
© 2025 Momentum. All rights reserved.
</div>

</td>
</tr>
</table>

</td>
</tr>
</table>

</body>
</html>
`;
}

// OTP EMAIL
export function generateOTPEmail({ userName, otpCode, expiryMinutes = 10 }) {
  const digits = otpCode.split("");

  const digitBoxes = digits
    .map(
      (digit) => `
      <td style="
        width:48px;
        height:56px;
        text-align:center;
        font-size:24px;
        font-weight:700;
        color:#1c1917;
        background:#ffffff;
        border:2px solid #87a96b;
        border-radius:8px;
        font-family:'Courier New',Courier,monospace;
      ">
        ${digit}
      </td>
    `,
    )
    .join(`<td width="8"></td>`);

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@media only screen and (max-width: 600px) {
  .email-container { width: 100% !important; }
  .email-content { padding: 24px !important; }
  h1 { font-size: 24px !important; }
  .otp-digit {
    width: 40px !important;
    height: 48px !important;
    font-size: 20px !important;
  }
}
</style>
</head>
<body style="
  margin:0;
  padding:0;
  background:#f5f5f4;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  color:#1c1917;
">

<div style="display:none">
Your verification code is ${otpCode}
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr>
<td align="center">

<table class="email-container" width="560" cellpadding="0" cellspacing="0" style="
  background:#ffffff;
  border-radius:12px;
  overflow:hidden;
  max-width:100%;
">

<tr>
<td class="email-content" style="padding:40px">

<h1 style="
  margin:0;
  text-align:center;
  font-size:32px;
  font-weight:700;
  font-family:Georgia,'Times New Roman',Times,serif;
  letter-spacing:-0.5px;
  color:#1c1917;
">
Momentum
</h1>

<div style="
  height:4px;
  background:#87a96b;
  margin:16px 0 32px;
"></div>

<p style="
  font-size:16px;
  margin:0 0 12px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  color:#1c1917;
">
Hi <strong>${userName}</strong>,
</p>

<p style="
  font-size:15px;
  margin:0 0 24px;
  color:#57534e;
">
Use the verification code below to continue:
</p>

<table align="center" cellpadding="0" cellspacing="0">
<tr>
${digitBoxes}
</tr>
</table>

<p style="
  text-align:center;
  font-size:13px;
  color:#57534e;
  margin-top:16px;
">
This code expires in ${expiryMinutes} minutes
</p>

<p style="
  color:#e07a5f;
  font-weight:600;
  margin-top:24px;
  font-size:14px;
">
Never share this code with anyone.
</p>

<p style="
  font-size:13px;
  color:#57534e;
  margin-top:16px;
">
If you didn't request this email, you can safely ignore it.
</p>

<div style="
  margin-top:32px;
  padding:16px;
  text-align:center;
  background:#87a96b;
  color:#ffffff;
  font-size:12px;
  border-radius:8px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
">
© 2025 Momentum. All rights reserved.
</div>

</td>
</tr>
</table>

</td>
</tr>
</table>

</body>
</html>
`;
}

// TASK REMINDER EMAIL
export function generateTaskReminderEmail({
  userName,
  taskName,
  scheduledDate,
  scheduledTime,
  frequency,
  reminderOffsetDays = 0,
}) {
  const reminderPlural = reminderOffsetDays === 1 ? "" : "s";
  const reminderCopy =
    reminderOffsetDays > 0
      ? "Reminder set " +
        reminderOffsetDays +
        " day" +
        reminderPlural +
        " before"
      : "Scheduled for today";

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="
  margin:0;
  padding:0;
  background:#f5f5f4;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  color:#1c1917;
">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 20px">
<tr>
<td align="center">

<table width="560" cellpadding="0" cellspacing="0" style="
  background:#ffffff;
  border-radius:12px;
  overflow:hidden;
  max-width:100%;
">

<tr>
<td style="padding:36px">

<h1 style="
  margin:0 0 12px 0;
  text-align:center;
  font-size:28px;
  font-weight:700;
  font-family:Georgia,'Times New Roman',Times,serif;
  letter-spacing:-0.5px;
  color:#1c1917;
">
Momentum
</h1>

<div style="
  height:4px;
  background:#87a96b;
  margin:12px 0 28px;
"></div>

<p style="font-size:15px;margin:0 0 12px;color:#57534e;">
Hi <strong>${userName}</strong>,
</p>

<p style="font-size:15px;margin:0 0 20px;color:#57534e;line-height:1.6;">
Here is your reminder for the task:
</p>

<div style="
  border:1px solid #e5e7eb;
  border-radius:10px;
  padding:16px;
  margin-bottom:20px;
">
  <p style="margin:0 0 6px 0;font-size:16px;font-weight:600;color:#1c1917;">
    ${taskName}
  </p>
  <p style="margin:0;font-size:14px;color:#57534e;">
    ${scheduledDate} at ${scheduledTime}
  </p>
  <p style="margin:8px 0 0 0;font-size:13px;color:#7c7c7c;">
    ${frequency} • ${reminderCopy}
  </p>
</div>

<p style="font-size:14px;margin:0;color:#57534e;line-height:1.6;">
You can complete this task during its ${frequency} window in Momentum.
</p>

</td>
</tr>
</table>

</td>
</tr>
</table>

</body>
</html>
`;
}
