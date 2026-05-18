import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Link to="/" style={styles.back}>← Back to TimeLot™</Link>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.effective}>Effective Date: May 17, 2026</p>

        <p style={styles.intro}>
          TimeLot™ is operated by High Performing Systems Engineering LLC (DBA HPS Engineering),
          a Missouri limited liability company. This Privacy Policy explains how we collect,
          use, and protect your information when you use the TimeLot™ application and related services.
        </p>

        <h2 style={styles.h2}>1. Information We Collect</h2>
        <p style={styles.p}>We collect the following types of information:</p>
        <ul style={styles.ul}>
          <li><strong>Account information:</strong> Your email address and password when you register.</li>
          <li><strong>Activity data:</strong> Tasks, priorities, due dates, and scheduling preferences you enter into the app.</li>
          <li><strong>Calendar data:</strong> With your explicit permission, we access your Google Calendar to read availability and write scheduled time blocks.</li>
          <li><strong>Usage data:</strong> Basic interaction data to improve the application experience.</li>
        </ul>

        <h2 style={styles.h2}>2. How We Use Your Information</h2>
        <ul style={styles.ul}>
          <li>To provide and operate the TimeLot™ scheduling service.</li>
          <li>To calculate priority scores and suggest optimal scheduling windows.</li>
          <li>To write confirmed time blocks to your connected calendar.</li>
          <li>To send transactional emails such as account confirmation and password reset.</li>
          <li>To improve and develop the TimeLot™ service.</li>
        </ul>

        <h2 style={styles.h2}>3. Google Calendar Integration</h2>
        <p style={styles.p}>
          TimeLot™ requests access to your Google Calendar solely to read your existing events
          for availability detection and to write time blocks you explicitly approve through
          the TimeLot™ confirmation loop. We do not share your calendar data with any third party.
          You may revoke calendar access at any time through your Google Account settings at
          myaccount.google.com/permissions.
        </p>
        <p style={styles.p}>
          TimeLot™'s use of Google Calendar data is limited to the purposes described in this
          policy and complies with the Google API Services User Data Policy, including the
          Limited Use requirements.
        </p>

        <h2 style={styles.h2}>4. Data Storage and Security</h2>
        <p style={styles.p}>
          Your data is stored securely using Supabase, a SOC 2 compliant cloud database provider.
          Authentication is handled via industry-standard JWT tokens. We use HTTPS for all
          data transmission. We implement reasonable technical and organizational measures
          to protect your information.
        </p>

        <h2 style={styles.h2}>5. Data Sharing</h2>
        <p style={styles.p}>
          We do not sell, rent, or share your personal information with third parties for
          marketing purposes. We may share data with service providers who assist in operating
          the application (such as Supabase for database hosting and Google for calendar
          integration) solely to provide the TimeLot™ service.
        </p>

        <h2 style={styles.h2}>6. Data Retention</h2>
        <p style={styles.p}>
          We retain your account and activity data for as long as your account is active.
          You may request deletion of your account and associated data at any time by
          contacting us at privacy@timelot.app.
        </p>

        <h2 style={styles.h2}>7. Your Rights</h2>
        <ul style={styles.ul}>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your account and data.</li>
          <li>Revoke calendar or other third-party permissions at any time.</li>
        </ul>

        <h2 style={styles.h2}>8. Children's Privacy</h2>
        <p style={styles.p}>
          TimeLot™ is not intended for use by children under the age of 13. We do not
          knowingly collect personal information from children under 13.
        </p>

        <h2 style={styles.h2}>9. Changes to This Policy</h2>
        <p style={styles.p}>
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes by posting the new policy at timelot.app/privacy with
          an updated effective date.
        </p>

        <h2 style={styles.h2}>10. Contact Us</h2>
        <p style={styles.p}>
          If you have questions about this Privacy Policy or your data, please contact us at:
        </p>
        <p style={styles.p}>
          <strong>High Performing Systems Engineering LLC</strong><br />
          DBA HPS Engineering<br />
          Email: privacy@timelot.app
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    color: '#f0ede6',
    fontFamily: 'Georgia, serif',
    padding: '40px 20px',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  back: {
    color: '#c8b97a',
    textDecoration: 'none',
    fontSize: '0.9rem',
    display: 'inline-block',
    marginBottom: '24px',
  },
  title: {
    fontSize: '2rem',
    color: '#f0ede6',
    marginBottom: '8px',
  },
  effective: {
    color: '#888',
    marginBottom: '32px',
    fontSize: '0.9rem',
  },
  intro: {
    color: '#ccc',
    lineHeight: '1.7',
    marginBottom: '24px',
  },
  h2: {
    color: '#c8b97a',
    fontSize: '1.2rem',
    marginTop: '32px',
    marginBottom: '12px',
  },
  p: {
    color: '#ccc',
    lineHeight: '1.7',
    marginBottom: '16px',
  },
  ul: {
    color: '#ccc',
    lineHeight: '1.9',
    paddingLeft: '24px',
    marginBottom: '16px',
  },
};