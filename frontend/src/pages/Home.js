import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api/api';

const carouselImages = [
  { src: 'https://wallpapers.com/images/hd/bike-background-n3lcqq8hkgc12ivw.jpg', caption: 'Find Your Dream Bike' },
  { src: 'https://www.beepkart.com/images/Buy-new-banner-19-june-mob.webp', caption: 'Best Deals, Trusted Sellers' },
  { src: 'https://www.godigit.com/content/dam/godigit/directportal/en/motorcycle.jpg', caption: 'Buy & Sell Bikes Easily' },
  { src: 'https://i.pinimg.com/736x/e6/ec/a9/e6eca9e180b4d7d9767558a63843e20c.jpg', caption: 'Ride with Confidence' },
];

const testimonials = [
  { name: 'KISHORE S', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'BikeHouse made selling my bike super easy and quick. Highly recommended!', rating: 5 },
  { name: 'SANJAY V S', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'I found my dream bike at a great price. The process was smooth and safe.', rating: 5 },
  { name: 'THIYANESH S', avatar: 'https://randomuser.me/api/portraits/men/65.jpg', text: 'Excellent platform with verified sellers. I felt confident buying here.', rating: 5 },
];

const partners = [
  { name: 'Hero', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Hero_MotoCorp.svg/1200px-Hero_MotoCorp.svg.png' },
  { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg' },
  { name: 'Yamaha', logo: 'https://media.licdn.com/dms/image/v2/D4D0BAQFn5nXc5RQGzg/company-logo_200_200/company-logo_200_200/0/1739344299214/yamaha_motor_company_logo?e=2147483647&v=beta&t=CXm6g9nyqmUNJ3x98tz3PW5BduK3d8v7JMudjmplBxU' },
  { name: 'Royal Enfield', logo: 'https://images.seeklogo.com/logo-png/36/1/royal-enfield-logo-png_seeklogo-361484.png' },
];

const stats = [
  { icon: '📈', value: '100K+', label: 'Bikes Sold' },
  { icon: '😊', value: '50K+', label: 'Happy Users' },
  { icon: '🛡️', value: '100%', label: 'Verified Dealers' },
];

const howItWorks = [
  { num: '01', icon: '👤', title: 'Sign Up', desc: 'Create your account in seconds and join our bike community.' },
  { num: '02', icon: '🔍', title: 'Browse & Search', desc: 'Find the perfect bike or list yours for sale with ease.' },
  { num: '03', icon: '🤝', title: 'Connect & Ride', desc: 'Connect with verified sellers and buyers. Enjoy your ride!' },
];

const whyUs = [
  { icon: '🛡️', title: 'Verified Sellers', desc: 'All sellers are verified for trust and safety.' },
  { icon: '💎', title: 'Best Prices', desc: 'Get the best deals on bikes across all price ranges.' },
  { icon: '⚡', title: 'Easy Process', desc: 'Buy or sell in just a few clicks. Fast and hassle-free.' },
];

function Home() {
  const [bikes, setBikes] = useState([]);
  const [search, setSearch] = useState({ location: '', model: '' });
  const [price, setPrice] = useState([0, 100000]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/bikes`).then(res => setBikes(res.data)).finally(() => setLoading(false));
  }, []);

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams({ ...search, minPrice: price[0], maxPrice: price[1] }).toString();
    const res = await axios.get(`${API_URL}/api/bikes?${params}`);
    setBikes(res.data);
    setLoading(false);
  };

  const featuredBikes = [...bikes].sort((a, b) => b.price - a.price).slice(0, 3);

  return (
    <div className="bh-page" style={{ background: 'linear-gradient(180deg,#0d1117 0%,#0f1923 100%)', minHeight: '100vh' }}>

      {/* ── HERO CAROUSEL ── */}
      <section style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: '62vh', minHeight: 340, boxShadow: '0 24px 64px rgba(0,0,0,0.65)' }}>
            <div id="homeCarousel" className="carousel slide h-100" data-bs-ride="carousel">
              <div className="carousel-inner h-100">
                {carouselImages.map((item, idx) => (
                  <div className={`carousel-item h-100${idx === 0 ? ' active' : ''}`} key={idx}>
                    <img src={item.src} className="d-block w-100 h-100" alt={item.caption}
                      style={{ objectFit: 'cover', filter: 'brightness(0.45)' }} />
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(0deg,rgba(13,17,23,0.70) 0%,transparent 60%)',
                      padding: '0 2rem',
                    }}>
                      <h1 style={{
                        fontSize: 'clamp(1.8rem,5vw,3.5rem)', fontWeight: 900, color: '#fff',
                        letterSpacing: -1, textAlign: 'center', marginBottom: '1.2rem',
                        textShadow: '0 4px 24px rgba(0,0,0,0.7)',
                        animation: 'fadeInUp 0.6s ease both',
                      }}>{item.caption}</h1>
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>

            {/* CTA Button */}
            <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <button
                onClick={() => window.location.href = '/sale'}
                style={{
                  background: 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)',
                  border: 'none', borderRadius: 50, padding: '0.85rem 2.4rem',
                  color: '#000', fontWeight: 800, fontSize: '1.05rem',
                  boxShadow: '0 8px 32px rgba(247,147,30,0.55)',
                  cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                  transition: 'all 0.22s ease', letterSpacing: 0.5,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(247,147,30,0.65)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(247,147,30,0.55)'; }}
              >
                🏍️ &nbsp;Sell Your Bike
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT / STATS ── */}
      <section style={{ padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={glassCard}>
            <h2 className="bh-section-title text-center" style={{ marginBottom: 8 }}>About BikeHouse</h2>
            <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#f7931e,#ffd700)', margin: '0 auto 1.5rem', borderRadius: 2 }} />
            <p style={{ color: '#8b949e', textAlign: 'center', fontSize: '1.05rem', maxWidth: 680, margin: '0 auto 2rem', lineHeight: 1.7 }}>
              BikeHouse is India's most trusted platform for buying and selling bikes. We connect passionate riders and sellers, offering a seamless, secure, and transparent experience.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1.5rem', textAlign: 'center' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 6 }}>{s.icon}</div>
                  <div className="bh-stat-number">{s.value}</div>
                  <div style={{ color: '#8b949e', marginTop: 4, fontSize: '0.88rem', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section style={{ padding: '0 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...glassCard, padding: '1.8rem 2rem' }}>
            <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', textAlign: 'center', fontSize: '1.2rem' }}>
              🔍 &nbsp;Find Your Perfect Bike
            </h3>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={labelS}>📍 Location</label>
                  <input type="text" className="bh-input" style={searchInput} placeholder="Enter city..."
                    value={search.location} onChange={e => setSearch({ ...search, location: e.target.value })} />
                </div>
                <div>
                  <label style={labelS}>🏍️ Model</label>
                  <input type="text" className="bh-input" style={searchInput} placeholder="Enter model..."
                    value={search.model} onChange={e => setSearch({ ...search, model: e.target.value })} />
                </div>
                <div>
                  <label style={labelS}>💰 Price Range (₹)</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="number" className="bh-input" style={searchInput} min="0" max="100000" value={price[0]}
                      onChange={e => setPrice([+e.target.value, price[1]])} />
                    <span style={{ color: '#8b949e' }}>–</span>
                    <input type="number" className="bh-input" style={searchInput} min="0" max="100000" value={price[1]}
                      onChange={e => setPrice([price[0], +e.target.value])} />
                  </div>
                </div>
                <button type="submit" style={{
                  background: 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)',
                  border: 'none', borderRadius: 50, padding: '0.75rem 2rem',
                  color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                  boxShadow: '0 4px 16px rgba(247,147,30,0.35)', fontFamily: 'Poppins, sans-serif',
                  transition: 'all 0.22s ease',
                }}>Search</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── FEATURED BIKES ── */}
      <section style={{ padding: '0 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionTitle icon="⭐" title="Featured Bikes" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.2rem' }}>
            {featuredBikes.map(bike => (
              <BikeCard key={bike._id} bike={bike} size="lg" />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '0 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionTitle icon="⚙️" title="How It Works" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.2rem' }}>
            {howItWorks.map((step, i) => (
              <div key={i} style={{ ...glassCard, textAlign: 'center', padding: '2rem 1.5rem' }}
                className="bh-card">
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#f7931e,#ffd700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', fontSize: '1.4rem',
                  boxShadow: '0 6px 20px rgba(247,147,30,0.35)',
                }}>{step.icon}</div>
                <div style={{ color: '#f7931e', fontWeight: 800, fontSize: '0.75rem', letterSpacing: 2, marginBottom: 6 }}>STEP {step.num}</div>
                <h5 style={{ color: '#fff', fontWeight: 700, marginBottom: 8, fontSize: '1.1rem' }}>{step.title}</h5>
                <p style={{ color: '#8b949e', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '0 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionTitle icon="💬" title="What Our Users Say" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.2rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ ...glassCard, textAlign: 'center', padding: '2rem 1.5rem' }} className="bh-card">
                <img src={t.avatar} alt={t.name} style={{
                  width: 78, height: 78, borderRadius: '50%', objectFit: 'cover',
                  border: '3px solid rgba(247,147,30,0.65)',
                  boxShadow: '0 4px 20px rgba(247,147,30,0.25)',
                  marginBottom: '1rem',
                }} />
                <div style={{ color: '#f7931e', marginBottom: 8, fontSize: '1rem' }}>{'★'.repeat(t.rating)}</div>
                <p style={{ color: '#c9d1d9', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.65, fontSize: '0.92rem' }}>"{t.text}"</p>
                <h5 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.95rem', letterSpacing: 0.5 }}>{t.name}</h5>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL BIKES ── */}
      <section style={{ padding: '0 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionTitle icon="🏍️" title="All Bikes" />
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner-border" style={{ width: 56, height: 56, color: '#f7931e', borderWidth: 3 }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.2rem' }}>
              {bikes.map(bike => <BikeCard key={bike._id} bike={bike} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{ padding: '0 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={glassCard}>
            <SectionTitle icon="🏆" title="Why Choose BikeHouse?" centered />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem', marginTop: '1.2rem' }}>
              {whyUs.map((w, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{w.icon}</div>
                  <h5 style={{ color: '#fff', fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>{w.title}</h5>
                  <p style={{ color: '#8b949e', margin: 0, fontSize: '0.88rem', lineHeight: 1.6 }}>{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD ── */}
      <section style={{ padding: '0 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)',
            borderRadius: 20, padding: '2.5rem 2rem', textAlign: 'center',
            boxShadow: '0 16px 48px rgba(247,147,30,0.35)',
          }}>
            <h2 style={{ color: '#000', fontWeight: 900, fontSize: 'clamp(1.4rem,4vw,2rem)', marginBottom: 8 }}>
              📱 Get the BikeHouse App!
            </h2>
            <p style={{ color: 'rgba(0,0,0,0.70)', fontWeight: 500, marginBottom: '1.5rem', fontSize: '1rem' }}>
              Buy, sell, and manage your bikes on the go. Download now:
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: 52, cursor: 'pointer', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }} />
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" style={{ height: 52, cursor: 'pointer', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section style={{ padding: '0 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionTitle icon="🤝" title="Our Partners" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
            {partners.map((p, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '1.2rem 1rem', textAlign: 'center',
                transition: 'all 0.22s ease', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = 'rgba(247,147,30,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                <img src={p.logo} alt={p.name} style={{ height: 44, objectFit: 'contain', marginBottom: 8, filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
                <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{ padding: '0 1.5rem 3rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...glassCard, textAlign: 'center' }}>
            <h2 className="bh-section-title" style={{ marginBottom: 8 }}>📧 Contact Us</h2>
            <div style={{ width: 50, height: 3, background: 'linear-gradient(90deg,#f7931e,#ffd700)', margin: '0 auto 1.2rem', borderRadius: 2 }} />
            <p style={{ color: '#8b949e', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Have questions or need help? Reach out to our support team!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>✉️</span>
                <a href="mailto:support@bikehouse.com" style={contactLink}>support@bikehouse.com</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>📞</span>
                <a href="tel:+919876543210" style={contactLink}>+91-9876543210</a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── Shared sub-components ── */
function SectionTitle({ icon, title }) {
  return (
    <div style={{ marginBottom: '1.4rem' }}>
      <h2 style={{
        fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 800,
        color: '#fff', letterSpacing: -0.5,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span>{icon}</span> {title}
      </h2>
      <div style={{ width: 50, height: 3, background: 'linear-gradient(90deg,#f7931e,#ffd700)', borderRadius: 2, marginTop: 6 }} />
    </div>
  );
}

function BikeCard({ bike, size }) {
  const imgH = size === 'lg' ? 220 : 190;
  return (
    <div
      className="bh-card"
      onClick={() => window.location.href = `/bike/${bike._id}`}
      style={{ cursor: 'pointer', borderRadius: 16, overflow: 'hidden', background: '#131c27', border: '1px solid rgba(255,255,255,0.09)' }}
    >
      <div style={{ position: 'relative', height: imgH, overflow: 'hidden' }}>
        {bike.images && bike.images[0] ? (
          <img src={`${API_URL}${bike.images[0]}`} alt={bike.model}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#1c2333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🏍️</div>
        )}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: 'linear-gradient(135deg,#f7931e,#ffd700)',
          color: '#000', fontWeight: 800, borderRadius: 20, padding: '3px 12px', fontSize: '0.82rem',
        }}>₹{bike.price?.toLocaleString()}</div>
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(13,17,23,0.80)', backdropFilter: 'blur(8px)',
          color: '#e6edf3', fontWeight: 600, borderRadius: 8, padding: '2px 10px', fontSize: '0.75rem',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>{bike.brand}</div>
      </div>
      <div style={{ padding: '1rem' }}>
        <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{bike.brand} {bike.model}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
          {[
            { icon: '📍', label: bike.location },
            { icon: '👥', label: `${bike.ownersCount} owners` },
            { icon: '🛣️', label: `${bike.kilometresRun} km` },
            { icon: '📅', label: bike.modelYear },
          ].map((item, i) => (
            <div key={i} style={{ color: '#8b949e', fontSize: '0.80rem', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{item.icon}</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
            </div>
          ))}
        </div>
        {bike.description && (
          <p style={{ color: '#6e7681', fontSize: '0.80rem', marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>
            {bike.description.substring(0, 80)}{bike.description.length > 80 ? '...' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

/* Shared styles */
const glassCard = {
  background: 'rgba(22,27,34,0.80)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 20, padding: '2rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
};

const searchInput = {
  background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)',
  borderRadius: 10, color: '#e6edf3', padding: '0.65rem 0.9rem',
  width: '100%', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', outline: 'none',
};

const labelS = {
  display: 'block', color: '#8b949e', fontSize: '0.76rem',
  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
};

const contactLink = {
  color: '#f7931e', textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
};

export default Home;