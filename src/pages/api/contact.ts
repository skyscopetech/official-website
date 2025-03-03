import sendgrid from '@sendgrid/mail';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { firstName, lastName, email, message, captcha } = req.body;

  // Step 1: Verify reCAPTCHA
  const recaptchaVerify = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
  });

  const recaptchaData = await recaptchaVerify.json();
  if (!recaptchaData.success) {
    return res.status(400).json({ message: 'Failed reCAPTCHA verification' });
  }

  // Step 2: Send Email via SendGrid
  try {
    const emailMessage = {
      to: process.env.SKYSCOPE_CONTACT_EMAIL as string,
      from: process.env.SKYSCOPE_CONTACT_EMAIL as string,
      replyTo: email,
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nMessage: ${message}`,
    };

    await sendgrid.send(emailMessage);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('SendGrid Error:', error);
    return res.status(500).json({ message: 'Error sending email' });
  }
}
