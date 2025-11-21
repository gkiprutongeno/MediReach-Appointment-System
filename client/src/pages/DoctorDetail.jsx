import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorAPI } from '../services/api';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorDetail() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await doctorAPI.getById(id);
        setDoctor(data.data);
      } catch (err) {
        setError('Doctor not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!doctor) return null;

  const { user } = doctor;

  return (
    <div className="doctor-detail-page">
      <div className="doctor-profile">
        <header className="profile-header">
          <div className="profile-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" />
            ) : (
              <span className="avatar-placeholder avatar-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            )}
          </div>
          <div className="profile-info">
            <h1>Dr. {user?.firstName} {user?.lastName}</h1>
            <p className="specialization">{doctor.specialization?.replace('-', ' ')}</p>
            <div className="rating">
              <span className="stars">
                {'★'.repeat(Math.round(doctor.rating?.average || 0))}
                {'☆'.repeat(5 - Math.round(doctor.rating?.average || 0))}
              </span>
              <span>{doctor.rating?.average?.toFixed(1) || '0.0'}</span>
              <span className="count">({doctor.rating?.count || 0} reviews)</span>
            </div>
          </div>
          <div className="profile-actions">
            <Link to={`/book/${doctor._id}`} className="btn btn-primary">
              Book Appointment
            </Link>
          </div>
        </header>

        <div className="profile-content">
          <section className="profile-section">
            <h2>About</h2>
            <p>{doctor.bio || 'No bio available.'}</p>
          </section>

          <section className="profile-section">
            <h2>Details</h2>
            <dl className="details-list">
              <div>
                <dt>Experience</dt>
                <dd>{doctor.experience} years</dd>
              </div>
              <div>
                <dt>Consultation Fee</dt>
                <dd>${doctor.consultationFee}</dd>
              </div>
              <div>
                <dt>Languages</dt>
                <dd>{doctor.languages?.join(', ') || 'English'}</dd>
              </div>
              <div>
                <dt>Accepting New Patients</dt>
                <dd>{doctor.acceptingNewPatients ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </section>

          {doctor.qualifications?.length > 0 && (
            <section className="profile-section">
              <h2>Qualifications</h2>
              <ul className="qualifications-list">
                {doctor.qualifications.map((q, i) => (
                  <li key={i}>
                    <strong>{q.degree}</strong>
                    {q.institution && <span> - {q.institution}</span>}
                    {q.year && <span> ({q.year})</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="profile-section">
            <h2>Availability</h2>
            {doctor.availability?.length > 0 ? (
              <ul className="availability-list">
                {doctor.availability
                  .filter(a => a.isAvailable)
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((a, i) => (
                    <li key={i}>
                      <span className="day">{dayNames[a.dayOfWeek]}</span>
                      <span className="time">{a.startTime} - {a.endTime}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No availability set.</p>
            )}
          </section>

          {doctor.clinicAddress?.street && (
            <section className="profile-section">
              <h2>Location</h2>
              <address>
                {doctor.clinicAddress.name && <strong>{doctor.clinicAddress.name}<br /></strong>}
                {doctor.clinicAddress.street}<br />
                {doctor.clinicAddress.city}, {doctor.clinicAddress.state} {doctor.clinicAddress.zipCode}
              </address>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}