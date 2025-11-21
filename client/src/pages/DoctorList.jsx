import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const specializations = [
  { id: '', name: 'All Specializations' },
  { id: 'general-practice', name: 'General Practice' },
  { id: 'cardiology', name: 'Cardiology' },
  { id: 'dermatology', name: 'Dermatology' },
  { id: 'pediatrics', name: 'Pediatrics' },
  { id: 'orthopedics', name: 'Orthopedics' },
  { id: 'neurology', name: 'Neurology' },
  { id: 'psychiatry', name: 'Psychiatry' },
  { id: 'dentistry', name: 'Dentistry' }
];

export default function DoctorList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const { setSelectedDoctor, isAuthenticated, isPatient } = useAuth();
  const navigate = useNavigate();

  const specialization = searchParams.get('specialization') || '';
  const city = searchParams.get('city') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (specialization) params.specialization = specialization;
        if (city) params.city = city;
        
        const { data } = await doctorAPI.getAll(params);
        setDoctors(data.data);
        setPagination({ page, pages: data.pages, total: data.total });
      } catch (err) {
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [specialization, city, page]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // Handle doctor selection for booking flow
  const handleChooseDoctor = (doctor) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    if (!isPatient) {
      setError('Only patients can book appointments');
      return;
    }
    // Store selected doctor in context
    setSelectedDoctor(doctor);
    // Navigate to booking page
    navigate(`/book/${doctor._id}`);
  };

  return (
    <div className="doctor-list-page">
      <header className="page-header">
        <h1>Find a Doctor</h1>
        <p>Browse our network of qualified healthcare professionals</p>
      </header>

      <div className="filters" role="search">
        <div className="filter-group">
          <label htmlFor="specialization">Specialization</label>
          <select id="specialization" value={specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}>
            {specializations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="city">City</label>
          <input type="text" id="city" value={city} placeholder="Enter city"
            onChange={(e) => handleFilterChange('city', e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading doctors...</div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : doctors.length === 0 ? (
        <div className="empty-state">
          <p>No doctors found matching your criteria.</p>
          <button className="btn btn-outline" onClick={() => setSearchParams({})}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <p className="results-count">{pagination.total} doctors found</p>
          <div className="doctor-grid">
            {doctors.map(doctor => (
              <article key={doctor._id} className="doctor-card">
                <div className="doctor-avatar">
                  {doctor.user?.profileImage ? (
                    <img src={doctor.user.profileImage} alt="" />
                  ) : (
                    <span className="avatar-placeholder">
                      {doctor.user?.firstName?.[0]}{doctor.user?.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div className="doctor-info">
                  <h3>Dr. {doctor.user?.firstName} {doctor.user?.lastName}</h3>
                  <p className="specialization">{doctor.specialization?.replace('-', ' ')}</p>
                  <p className="experience">{doctor.experience} years experience</p>
                  <div className="rating">
                    <span className="stars" aria-label={`Rating: ${doctor.rating?.average || 0} out of 5`}>
                      {'★'.repeat(Math.round(doctor.rating?.average || 0))}
                      {'☆'.repeat(5 - Math.round(doctor.rating?.average || 0))}
                    </span>
                    <span className="count">({doctor.rating?.count || 0})</span>
                  </div>
                  <p className="fee">${doctor.consultationFee} per visit</p>
                </div>
                <div className="doctor-actions">
                  <Link to={`/doctors/${doctor._id}`} className="btn btn-outline btn-sm">
                    View Profile
                  </Link>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleChooseDoctor(doctor)}
                    aria-label={`Choose Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`}
                  >
                    {isPatient ? 'Book Now' : 'Choose'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {pagination.pages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                Previous
              </button>
              <span>Page {page} of {pagination.pages}</span>
              <button disabled={page === pagination.pages} onClick={() => handlePageChange(page + 1)}>
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}