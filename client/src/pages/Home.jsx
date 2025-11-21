import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const specializations = [
  { id: 'general-practice', name: 'General Practice', icon: '👨‍⚕️' },
  { id: 'cardiology', name: 'Cardiology', icon: '❤️' },
  { id: 'dermatology', name: 'Dermatology', icon: '🧴' },
  { id: 'pediatrics', name: 'Pediatrics', icon: '👶' },
  { id: 'orthopedics', name: 'Orthopedics', icon: '🦴' },
  { id: 'neurology', name: 'Neurology', icon: '🧠' },
  { id: 'psychiatry', name: 'Psychiatry', icon: '🧘' },
  { id: 'dentistry', name: 'Dentistry', icon: '🦷' }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleSpecializationClick = (id) => {
    navigate(`/doctors?specialization=${id}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title">Find & Book Your Doctor Appointment</h1>
          <p className="hero-subtitle">
            Connect with qualified healthcare professionals in your area. 
            Book appointments easily and manage your health journey.
          </p>

          <form onSubmit={handleSearch} className="search-form" role="search">
            <div className="search-input-wrapper">
              <input
                type="search"
                placeholder="Search doctors, specializations, or conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search doctors"
                className="search-input"
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="specializations" aria-labelledby="spec-title">
        <h2 id="spec-title">Browse by Specialization</h2>
        <div className="spec-grid">
          {specializations.map((spec) => (
            <button
              key={spec.id}
              onClick={() => handleSpecializationClick(spec.id)}
              className="spec-card"
              aria-label={`Find ${spec.name} doctors`}
            >
              <span className="spec-icon" aria-hidden="true">{spec.icon}</span>
              <span className="spec-name">{spec.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features" aria-labelledby="features-title">
        <h2 id="features-title">Why Choose MediReach?</h2>
        <div className="features-grid">
          <article className="feature-card">
            <span className="feature-icon" aria-hidden="true">📅</span>
            <h3>Easy Booking</h3>
            <p>Book appointments in seconds with our simple scheduling system.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon" aria-hidden="true">✅</span>
            <h3>Verified Doctors</h3>
            <p>All healthcare providers are verified and credentialed.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon" aria-hidden="true">🔔</span>
            <h3>Reminders</h3>
            <p>Never miss an appointment with automated reminders.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon" aria-hidden="true">📱</span>
            <h3>Mobile Friendly</h3>
            <p>Access your health information anywhere, anytime.</p>
          </article>
        </div>
      </section>
    </div>
  );
}