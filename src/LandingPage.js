import React from 'react';

export default function LandingPage() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.logo}>Time<span style={styles.lot}>Lot</span>™</h1>
        <p style={styles.tagline}>
          There is one resource. It is you.<br />
          And it has exactly 24 hours per day.
        </p>
        <a href="/login" style={styles.ctaButton}>Get Started</a>
      </div>

      <div style={styles.features}>
        <div style={styles.feature}>
          <h2 style={styles.featureTitle}>Priority-Driven Scheduling</h2>
          <p style={styles.featureText}>
            TimeLot™ uses a mathematical engine to compute when your activities
            should happen — based on importance, urgency, deadlines, and progress.
          </p>
        </div>
        <div style={styles.feature}>
          <h2 style={styles.featureTitle}>Calendar Integration</h2>
          <p style={styles.featureText}>
            Your schedule is committed to your Google Calendar as real time blocks —
            only after you approve. TimeLot™ never touches your calendar without
            your explicit confirmation.
          </p>
        </div>
        <div style={styles.feature}>
          <h2 style={styles.featureTitle}>Whole-Life Scheduling</h2>
          <p style={styles.featureText}>
            Define scheduling windows for Work, Family, Personal, and Sleep.
            TimeLot™ respects your life — every dimension of it.
          </p>
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          &copy; 2026 High Performing Systems Engineering LLC (DBA HPS Engineering)
        </p>
        <a href="/privacy" style={styles.privacyLink}>Privacy Policy</a>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: '100vh',
    backgroundColor: '#0f0f1a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px 60px',
    textAlign: 'center',
  },
  logo: {
    fontSize: '56px',
    fontWeight: '800',
    margin: '0 0 16px 0',
    color: '#ffffff',
    letterSpacing: '-1px',
  },
  lot: {
    color: '#6c63ff',
  },
  tagline: {
    fontSize: '20px',
    color: '#a0a0b0',
    lineHeight: '1.6',
    maxWidth: '500px',
    margin: '0 0 40px 0',
  },
  ctaButton: {
    backgroundColor: '#6c63ff',
    color: '#ffffff',
    padding: '16px 48px',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  },
  features: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '24px',
    padding: '40px 20px',
    maxWidth: '1000px',
  },
  feature: {
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '280px',
    flex: '1 1 250px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#6c63ff',
    margin: '0 0 12px 0',
  },
  featureText: {
    fontSize: '15px',
    color: '#a0a0b0',
    lineHeight: '1.6',
    margin: '0',
  },
  footer: {
    marginTop: 'auto',
    padding: '40px 20px',
    textAlign: 'center',
    borderTop: '1px solid #2a2a3e',
    width: '100%',
  },
  footerText: {
    color: '#606070',
    fontSize: '14px',
    margin: '0 0 8px 0',
  },
  privacyLink: {
    color: '#6c63ff',
    fontSize: '14px',
    textDecoration: 'none',
  },
};