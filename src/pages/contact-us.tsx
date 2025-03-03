import { Email, Phone, LocationOn } from '@mui/icons-material';
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {
  ssr: false,
}) as unknown as typeof import('react-google-recaptcha');

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.message.trim()) newErrors.message = 'Message cannot be empty';
    if (!captchaValue) newErrors.captcha = "Please verify you're not a robot";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setStatus('Sending...');

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, captcha: captchaValue }),
    });

    setLoading(false);

    if (response.ok) {
      setStatus('Message sent successfully!');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      setCaptchaValue(null);
    } else {
      setStatus('Failed to send message.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={5}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ textAlign: { xs: 'center', md: 'left' } }}
          >
            Contact Us
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            mb={3}
            sx={{ textAlign: { xs: 'center', md: 'left' } }}
          >
            Have a question or need assistance? Feel free to reach out using the form or email, and
            we’ll get back to you as soon as possible.
          </Typography>

          <Box mb={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              mb={1}
            >
              <Phone sx={{ color: 'black', mr: 1 }} />
              <Typography variant="body1">+1 (647) 221-6308</Typography>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              mb={1}
            >
              <Phone sx={{ color: 'black', mr: 1 }} />
              <Typography variant="body1">+1 (587) 988-3121</Typography>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              mb={1}
            >
              <Email sx={{ color: 'black', mr: 1 }} />
              <Typography variant="body1">contact@skyscopetech.com</Typography>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
            >
              <LocationOn sx={{ color: 'black', mr: 1 }} />
              <Typography variant="body1">Toronto, Canada</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right Side (Form) */}
        <Grid item xs={12} md={7}>
          <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  fullWidth
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  fullWidth
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone (optional)"
                  name="phone"
                  fullWidth
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  name="message"
                  required
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  error={!!errors.message}
                  helperText={errors.message}
                />
              </Grid>

              {/* reCAPTCHA */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <ReCAPTCHA sitekey={process.env.RECAPTCHA_SITE_KEY} onChange={setCaptchaValue} />
                {errors.captcha && <Typography color="error">{errors.captcha}</Typography>}
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: 'black',
                    color: 'white',
                    '&:hover': { backgroundColor: '#333' },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </Box>
          {status && (
            <Typography variant="body2" mt={2} color={status.includes('success') ? 'green' : 'red'}>
              {status}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
