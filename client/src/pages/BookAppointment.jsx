import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, startOfDay } from 'date-fns';
import { doctorAPI, appointmentAPI } from '../services/api';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ reason: '', symptoms: '', type: 'in-person', notes: '' });
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch doctor info
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await doctorAPI.getById(doctorId);
        setDoctor(data.data);
      } catch (err) {
        setError('Doctor not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor) return;
      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const { data } = await doctorAPI.getSlots(doctorId, dateStr);
        setSlots(data.data);
      } catch (err) {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [doctorId, selectedDate, doctor]);

  const handleDateChange = (days) => {
    const newDate = addDays(selectedDate, days);
    if (newDate >= startOfDay(new Date())) {
      setSelectedDate(newDate);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await appointmentAPI.create({
        doctorId,
        dateTime: selectedSlot.dateTime,
        type: formData.type,
        reason: formData.reason,
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        notes: formData.notes
      });
      navigate('/dashboard', { state: { message: 'Appointment booked successfully!' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error && !doctor) return <div className="alert alert-error">{error}</div>;

  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));

  return (
    <div className="book-appointment-page">
      <header className="page-header">
        <h1>Book Appointment</h1>
        {doctor && (
          <p>with Dr. {doctor.user?.firstName} {doctor.user?.lastName} - {doctor.specialization?.replace('-', ' ')}</p>
        )}
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="booking-container">
        <section className="date-selection">
          <h2>Select Date</h2>
          <div className="date-picker">
            {dates.map(date => (
              <button key={date.toISOString()} type="button"
                className={`date-btn ${selectedDate.toDateString() === date.toDateString() ? 'active' : ''}`}
                onClick={() => setSelectedDate(date)}>
                <span className="day-name">{format(date, 'EEE')}</span>
                <span className="day-num">{format(date, 'd')}</span>
                <span className="month">{format(date, 'MMM')}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="time-selection">
          <h2>Select Time</h2>
          {slotsLoading ? (
            <p>Loading available times...</p>
          ) : slots.length === 0 ? (
            <p className="no-slots">No available slots for this date.</p>
          ) : (
            <div className="time-grid">
              {slots.map(slot => (
                <button key={slot.dateTime} type="button"
                  className={`time-btn ${selectedSlot?.dateTime === slot.dateTime ? 'active' : ''}`}
                  onClick={() => setSelectedSlot(slot)}>
                  {slot.formatted}
                </button>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit} className="booking-form">
          <h2>Appointment Details</h2>
          
          <div className="form-group">
            <label htmlFor="type">Appointment Type</label>
            <select id="type" value={formData.type}
              onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}>
              <option value="in-person">In-Person Visit</option>
              <option value="video">Video Consultation</option>
              <option value="phone">Phone Consultation</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Visit *</label>
            <input type="text" id="reason" required placeholder="e.g., Annual checkup, Follow-up"
              value={formData.reason} onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))} />
          </div>

          <div className="form-group">
            <label htmlFor="symptoms">Symptoms (comma-separated)</label>
            <input type="text" id="symptoms" placeholder="e.g., headache, fatigue, fever"
              value={formData.symptoms} onChange={(e) => setFormData(p => ({ ...p, symptoms: e.target.value }))} />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea id="notes" rows="3" placeholder="Any additional information for the doctor"
              value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} />
          </div>

          {doctor && (
            <div className="booking-summary">
              <h3>Summary</h3>
              <p><strong>Doctor:</strong> Dr. {doctor.user?.firstName} {doctor.user?.lastName}</p>
              <p><strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> {selectedSlot?.formatted || 'Not selected'}</p>
              <p><strong>Fee:</strong> ${doctor.consultationFee}</p>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !selectedSlot}>
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}