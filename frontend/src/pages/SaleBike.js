import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../api/api';

const brandOptions = ['Hero', 'Honda', 'Yamaha', 'Royal Enfield', 'Suzuki', 'Bajaj', 'TVS', 'KTM', 'Other'];
const bgImage = 'https://t3.ftcdn.net/jpg/12/57/98/50/360_F_1257985039_uWRawb8gzSHXshvOik689aEaJdj8FQfp.jpg';

function SaleBike() {
  const [form, setForm] = useState({ brand: '', model: '', location: '', price: '', description: '', color: '', ownersCount: '', kilometresRun: '', modelYear: '' });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [rcFiles, setRcFiles] = useState([]);
  const [insuranceFiles, setInsuranceFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImageChange = e => { setImages([...e.target.files]); setPreview([...e.target.files].map(f => URL.createObjectURL(f))); };
  const handleRcChange = e => setRcFiles([...e.target.files]);
  const handleInsuranceChange = e => setInsuranceFiles([...e.target.files]);

  const validate = () => {
    const errs = {};
    if (!form.brand) errs.brand = 'Brand is required';
    if (!form.model.trim()) errs.model = 'Model is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.price) errs.price = 'Price is required';
    else if (isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Price must be a positive number';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.color.trim()) errs.color = 'Color is required';
    if (!form.ownersCount) errs.ownersCount = 'Number of owners is required';
    else if (isNaN(form.ownersCount) || Number(form.ownersCount) < 1) errs.ownersCount = 'Must be at least 1';
    if (!form.kilometresRun) errs.kilometresRun = 'Kilometres run is required';
    else if (isNaN(form.kilometresRun) || Number(form.kilometresRun) < 0) errs.kilometresRun = 'Must be 0 or more';
    if (!form.modelYear) errs.modelYear = 'Model year is required';
    else if (isNaN(form.modelYear) || Number(form.modelYear) < 1900) errs.modelYear = 'Enter a valid year';
    if (images.length === 0) errs.images = 'At least one bike image is required';
    if (rcFiles.length === 0) errs.rc = 'At least one RC file is required';
    if (insuranceFiles.length === 0) errs.insurance = 'At least one insurance file is required';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const token = localStorage.getItem('token');
    if (!token) { setMessage('You must be logged in to post a bike.'); setOpen(true); return; }
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (['ownersCount', 'kilometresRun', 'modelYear', 'price'].includes(k)) { if (v !== '' && !isNaN(v)) data.append(k, Number(v)); }
      else if (k === 'postedOn') { data.append('postedOn', new Date().toISOString()); }
      else { if (v !== '') data.append(k, v); }
    });
    images.forEach(img => data.append('images', img));
    rcFiles.forEach(file => data.append('rc', file));
    insuranceFiles.forEach(file => data.append('insurance', file));
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/bikes`, data, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      setMessage('Bike posted for sale successfully!');
      setOpen(true);
      setForm({ brand: '', model: '', location: '', price: '', description: '', color: '', ownersCount: '', kilometresRun: '', modelYear: '' });
      setImages([]); setPreview([]); setRcFiles([]); setInsuranceFiles([]);
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data?.error || 'Failed to post bike');
      setOpen(true);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px) brightness(0.30)', transform: 'scale(1.05)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg,rgba(13,17,23,0.65) 0%,rgba(15,32,39,0.75) 100%)' }} />

      <div className="bh-page" style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{
          width: '100%', maxWidth: 860,
          background: 'rgba(13,17,23,0.90)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.65)', padding: 'clamp(1.8rem,5vw,2.8rem)',
          animation: 'fadeInUp 0.5s ease both',
        }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, color: '#fff', letterSpacing: -0.5, margin: 0 }}>
              🏍️ Sell Your Bike
            </h2>
            <p style={{ color: '#8b949e', marginTop: 6, fontSize: '0.9rem' }}>List your bike and connect with thousands of buyers</p>
            <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#f7931e,#ffd700)', borderRadius: 2, marginTop: 10 }} />
          </div>

          <form noValidate onSubmit={handleSubmit} autoComplete="off">
            {/* Section: Basic Info */}
            <SectionDivider label="Basic Information" icon="📋" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <Field label="Brand" error={errors.brand}>
                <select name="brand" value={form.brand} onChange={handleChange} style={selectSt} required>
                  <option value="">Select Brand</option>
                  {brandOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Model" error={errors.model}>
                <input type="text" name="model" value={form.model} onChange={handleChange} style={inputSt} placeholder="e.g. Splendor Plus" required />
              </Field>
              <Field label="Location" error={errors.location}>
                <input type="text" name="location" value={form.location} onChange={handleChange} style={inputSt} placeholder="e.g. Chennai" required />
              </Field>
              <Field label="Asking Price (₹)" error={errors.price}>
                <input type="number" name="price" value={form.price} onChange={handleChange} style={inputSt} placeholder="e.g. 45000" min="1" required />
              </Field>
            </div>

            <Field label="Description" error={errors.description} full>
              <textarea name="description" value={form.description} onChange={handleChange} style={{ ...inputSt, resize: 'vertical', minHeight: 90 }} placeholder="Describe your bike's condition, features, and history..." required rows={3} />
            </Field>

            {/* Section: Technical Details */}
            <SectionDivider label="Technical Details" icon="⚙️" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <Field label="Color" error={errors.color}>
                <input type="text" name="color" value={form.color} onChange={handleChange} style={inputSt} placeholder="e.g. Red" required />
              </Field>
              <Field label="Number of Owners" error={errors.ownersCount}>
                <input type="number" name="ownersCount" value={form.ownersCount} onChange={handleChange} style={inputSt} min="1" placeholder="e.g. 1" required />
              </Field>
              <Field label="Kilometres Run" error={errors.kilometresRun}>
                <input type="number" name="kilometresRun" value={form.kilometresRun} onChange={handleChange} style={inputSt} min="0" placeholder="e.g. 25000" required />
              </Field>
              <Field label="Model Year" error={errors.modelYear}>
                <input type="number" name="modelYear" value={form.modelYear} onChange={handleChange} style={inputSt} min="1900" placeholder="e.g. 2019" required />
              </Field>
            </div>

            {/* Section: Documents & Images */}
            <SectionDivider label="Photos & Documents" icon="📁" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.2rem' }}>

              {/* Bike Images */}
              <div>
                <label style={labelSt}>Bike Images <span style={{ color: '#ef4444' }}>*</span></label>
                <label style={uploadZone}>
                  <span style={{ fontSize: '2rem' }}>📸</span>
                  <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.95rem' }}>Upload Bike Images</span>
                  <span style={{ color: '#8b949e', fontSize: '0.80rem' }}>Click to browse or drag & drop</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} required style={{ display: 'none' }} />
                </label>
                {errors.images && <span style={errSt}>{errors.images}</span>}
                {preview.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {preview.map((src, i) => (
                      <img key={i} src={src} alt="preview" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid rgba(247,147,30,0.45)' }} />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelSt}>RC Documents <span style={{ color: '#ef4444' }}>*</span></label>
                  <label style={{ ...uploadZone, padding: '1.2rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📝</span>
                    <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.85rem' }}>Upload RC Files</span>
                    <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>{rcFiles.length > 0 ? `${rcFiles.length} file(s) selected` : 'Image or PDF'}</span>
                    <input type="file" multiple accept="image/*,application/pdf" onChange={handleRcChange} required style={{ display: 'none' }} />
                  </label>
                  {errors.rc && <span style={errSt}>{errors.rc}</span>}
                </div>
                <div>
                  <label style={labelSt}>Insurance Files <span style={{ color: '#ef4444' }}>*</span></label>
                  <label style={{ ...uploadZone, padding: '1.2rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                    <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.85rem' }}>Upload Insurance</span>
                    <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>{insuranceFiles.length > 0 ? `${insuranceFiles.length} file(s) selected` : 'Image or PDF'}</span>
                    <input type="file" multiple accept="image/*,application/pdf" onChange={handleInsuranceChange} required style={{ display: 'none' }} />
                  </label>
                  {errors.insurance && <span style={errSt}>{errors.insurance}</span>}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '1rem',
              background: loading ? 'rgba(247,147,30,0.5)' : 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)',
              border: 'none', borderRadius: 50, color: '#000', fontWeight: 800,
              fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 28px rgba(247,147,30,0.38)',
              transition: 'all 0.22s ease', fontFamily: 'Poppins, sans-serif', letterSpacing: 0.5,
            }}>
              {loading ? 'Posting Your Bike...' : '🚀 Post Bike for Sale'}
            </button>
          </form>

          {open && (
            <div style={{
              marginTop: '1rem', padding: '0.85rem 1.2rem',
              background: message.includes('success') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${message.includes('success') ? 'rgba(34,197,94,0.40)' : 'rgba(239,68,68,0.40)'}`,
              borderRadius: 12, color: message.includes('success') ? '#22c55e' : '#ef4444',
              fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{message}</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SectionDivider({ label, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1.4rem 0 1rem' }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.92rem', letterSpacing: 0.3 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
    </div>
  );
}

function Field({ label, error, children, full }) {
  return (
    <div style={full ? { marginBottom: '1rem' } : {}}>
      <label style={labelSt}>{label}</label>
      {children}
      {error && <span style={errSt}>{error}</span>}
    </div>
  );
}

const inputSt = {
  background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)',
  borderRadius: 10, color: '#e6edf3', padding: '0.68rem 0.9rem',
  fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', outline: 'none', width: '100%',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const selectSt = {
  ...inputSt, background: 'rgba(22,27,34,0.92)',
  appearance: 'none', WebkitAppearance: 'none',
};

const labelSt = {
  display: 'block', color: '#8b949e', fontSize: '0.76rem',
  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
};

const errSt = { color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'block' };

const uploadZone = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  border: '2px dashed rgba(247,147,30,0.38)', borderRadius: 12, padding: '1.5rem',
  cursor: 'pointer', transition: 'all 0.22s ease', background: 'rgba(247,147,30,0.04)',
  textAlign: 'center',
};

export default SaleBike;