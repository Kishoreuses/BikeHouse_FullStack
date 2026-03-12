import React from 'react';

const bikeImages = [
  'https://wallpapers.com/images/hd/bike-background-n3lcqq8hkgc12ivw.jpg',
  'https://i.pinimg.com/736x/e6/ec/a9/e6eca9e180b4d7d9767558a63843e20c.jpg',
  'https://www.godigit.com/content/dam/godigit/directportal/en/motorcycle.jpg',
];

const imgLabels = ['Premium Bikes', 'Adventure Rides', 'Urban Classics'];

const companyMembers = [
  { name: 'KISHORE S', role: 'Founder & CEO', photo: 'https://randomuser.me/api/portraits/men/32.jpg', info: 'Visionary leader with 10+ years in the bike industry. Passionate about connecting riders and sellers.' },
  { name: 'SANJAY V S', role: 'Operations Head', photo: 'https://randomuser.me/api/portraits/women/44.jpg', info: 'Ensures smooth transactions and customer satisfaction. Loves long rides and classic bikes.' },
  { name: 'ANANDAKUMAR K J', role: 'Lead Developer', photo: 'https://randomuser.me/api/portraits/men/65.jpg', info: 'Tech enthusiast building secure and user-friendly experiences for BikeHouse.' },
  { name: 'Admin Team', role: 'Support & Verification', photo: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png', info: 'Dedicated team for platform safety, verification, and support.' },
];

const contactInfo = [
  { icon: '✉️', label: 'Email', value: 'support@bikehouse.com', href: 'mailto:support@bikehouse.com' },
  { icon: '📞', label: 'Phone', value: '+91-9677871881', href: 'tel:+919677871881' },
  { icon: '🔑', label: 'Admin', value: 'kishoreuses@gmail.com', href: 'mailto:kishoreuses@gmail.com' },
  { icon: '📍', label: 'Address', value: 'BikeHouse HQ, TamilNadu, India', href: null },
];

function About() {
  return (
    <div className="bh-page" style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1117 0%,#0f1923 100%)', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem,6vw,3.2rem)', fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 10 }}>
            About <span style={{ background: 'linear-gradient(135deg,#f7931e,#ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>BIKEHOUSE</span>
          </h1>
          <div style={{ width: 70, height: 3, background: 'linear-gradient(90deg,#f7931e,#ffd700)', margin: '0 auto 1.5rem', borderRadius: 2 }} />
          <p style={{ color: '#8b949e', fontSize: '1.05rem', maxWidth: 680, margin: '0 auto', lineHeight: 1.7 }}>
            BIKEHOUSE is India's most trusted platform for buying and selling second-hand bikes. We connect passionate riders and sellers, offering a seamless, secure, and transparent experience.
          </p>
        </div>

        {/* Mission Card */}
        <div style={glassCard}>
          <p style={{ color: '#c9d1d9', textAlign: 'center', fontSize: '1rem', lineHeight: 1.75, margin: 0, maxWidth: 780, marginLeft: 'auto', marginRight: 'auto' }}>
            Our platform offers advanced search, secure transactions, and a dedicated admin team to keep everything running smoothly. Whether you want to upgrade your ride or find a great deal, BIKEHOUSE is the place for you!
          </p>
        </div>

        {/* Bike Images */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
          {bikeImages.map((img, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', background: '#131c27', border: '1px solid rgba(255,255,255,0.09)', height: 200 }}>
              <img src={img} alt={imgLabels[i]} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)', transition: 'all 0.35s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.filter = 'brightness(0.80)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'brightness(0.65)'; }}
              />
              <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                <span style={{ background: 'linear-gradient(135deg,#f7931e,#ffd700)', color: '#000', fontWeight: 800, borderRadius: 20, padding: '4px 14px', fontSize: '0.85rem' }}>
                  {imgLabels[i]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ ...glassCard, marginBottom: '2.5rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.4rem' }}>
            📬 Contact & Company Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
            {contactInfo.map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem 1.2rem', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <div style={{ color: '#6e7681', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>{c.label}</div>
                  {c.href ? (
                    <a href={c.href} style={{ color: '#f7931e', fontWeight: 600, textDecoration: 'none', fontSize: '0.88rem' }}>{c.value}</a>
                  ) : (
                    <span style={{ color: '#c9d1d9', fontWeight: 600, fontSize: '0.88rem' }}>{c.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.4rem' }}>
            👥 Meet Our Team
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.2rem' }}>
            {companyMembers.map((member, i) => (
              <div key={i} style={{
                background: '#131c27', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 18, padding: '1.8rem 1.2rem', textAlign: 'center',
                transition: 'all 0.25s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(247,147,30,0.28)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.40)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 1rem' }}>
                  <img src={member.photo} alt={member.name} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(247,147,30,0.60)', boxShadow: '0 4px 20px rgba(247,147,30,0.25)' }} />
                </div>
                <h5 style={{ color: '#fff', fontWeight: 800, marginBottom: 4, fontSize: '0.95rem', letterSpacing: 0.3 }}>{member.name}</h5>
                <span style={{ background: 'linear-gradient(135deg,#f7931e,#ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700, fontSize: '0.82rem', display: 'block', marginBottom: 10 }}>
                  {member.role}
                </span>
                <p style={{ color: '#8b949e', margin: 0, fontSize: '0.82rem', lineHeight: 1.6 }}>{member.info}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const glassCard = {
  background: 'rgba(22,27,34,0.80)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '2rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.30)', marginBottom: '2.5rem',
};

export default About;