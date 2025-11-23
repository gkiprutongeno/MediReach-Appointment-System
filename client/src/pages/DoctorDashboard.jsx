import { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';

const statusColors = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  completed: 'status-completed',
  cancelled: 'status-cancelled'
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ today: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const { data } = await appointmentAPI.getAll({
          from: startOfDay(selectedDate).toISOString(),
          to: endOfDay(selectedDate).toISOString()
        });
        setAppointments(data.data);

        // Fetch stats
        const allData = await appointmentAPI.getAll({ limit: 1000 });
        const all = allData.data.data;
        const today = startOfDay(new Date());
        setStats({
          today: all.filter(a => new Date(a.dateTime) >= today && new Date(a.dateTime) < addDays(today, 1)).length,
          pending: all.filter(a => a.status === 'pending').length,
          total: all.length
        });
      } catch (err) {
        console.error('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [selectedDate]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentAPI.update(id, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i - 1));

  return (
    <div className="dashboard-page doctor-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {user?.role === 'doctor' ? 'Dr. ' : ''}{user?.firstName}!</h1>
          <p>Manage your schedule and appointments</p>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.today}</span>
          <span className="stat-label">Today's Appointments</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Pending Confirmation</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Appointments</span>
        </div>
      </div>

      <section className="schedule-section">
        <h2>Schedule</h2>
        <div className="date-nav">
          {dates.map(date => (
            <button key={date.toISOString()}
              className={`date-btn ${selectedDate.toDateString() === date.toDateString() ? 'active' : ''}`}
              onClick={() => setSelectedDate(date)}>
              <span className="day-name">{format(date, 'EEE')}</span>
              <span className="day-num">{format(date, 'd')}</span>
            </button>
          ))}
        </div>

        <h3>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <p>No appointments scheduled for this day.</p>
          </div>
        ) : (
          <div className="appointments-timeline">
            {appointments
              .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
              .map(apt => (
                <article key={apt._id} className="timeline-item">
                  <div className="timeline-time">
                    {format(new Date(apt.dateTime), 'h:mm a')}
                  </div>
                  <div className="timeline-content">
                    <div className="patient-info">
                      <h4>{apt.patient?.firstName} {apt.patient?.lastName}</h4>
                      <p className="contact">{apt.patient?.email} • {apt.patient?.phone}</p>
                    </div>
                    <div className="apt-details">
                      <p><strong>Reason:</strong> {apt.reason}</p>
                      {apt.symptoms?.length > 0 && (
                        <p><strong>Symptoms:</strong> {apt.symptoms.join(', ')}</p>
                      )}
                      <span className={`apt-type type-${apt.type}`}>{apt.type}</span>
                    </div>
                    <div className="apt-status">
                      <span className={`status-badge ${statusColors[apt.status]}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="apt-actions">
                      {apt.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                            className="btn btn-sm btn-success">Confirm</button>
                          <button onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                            className="btn btn-sm btn-outline">Decline</button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button onClick={() => handleStatusUpdate(apt._id, 'completed')}
                          className="btn btn-sm btn-primary">Mark Complete</button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
