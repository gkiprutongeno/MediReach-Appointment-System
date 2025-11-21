import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, doctorAPI } from '../services/api';

export default function Profile() {
  const { user, isDoctor, loadUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
    gender: user?.gender || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [doctorData, setDoctorData] = useState({
    bio: user?.doctorProfile?.bio || '',
    consultationFee: user?.doctorProfile?.consultationFee || '',
    experience: user?.doctorProfile?.experience || '',
    acceptingNewPatients: user?.doctorProfile?.acceptingNewPatients ?? true
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await userAPI.updateProfile(profileData);
      await loadUser();
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await userAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await doctorAPI.updateProfile({
        ...doctorData,
        consultationFee: Number(doctorData.consultationFee),
        experience: Number(doctorData.experience)
      });
      await loadUser();
      setMessage({ type: 'success', text: 'Doctor profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>Account Settings</h1>
      </header>

      <div className="profile-container">
        <nav className="profile-nav" role="tablist">
          <button role="tab" aria-selected={activeTab === 'profile'}
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}>Profile</button>
          <button role="tab" aria-selected={activeTab === 'password'}
            className={activeTab === 'password' ? 'active' : ''}
            onClick={() => setActiveTab('password')}>Password</button>
          {isDoctor && (
            <button role="tab" aria-selected={activeTab === 'doctor'}
              className={activeTab === 'doctor' ? 'active' : ''}
              onClick={() => setActiveTab('doctor')}>Doctor Settings</button>
          )}
        </nav>

        <div className="profile-content">
          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <h2>Personal Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" value={profileData.firstName}
                    onChange={(e) => setProfileData(p => ({ ...p, firstName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" value={profileData.lastName}
                    onChange={(e) => setProfileData(p => ({ ...p, lastName: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input type="tel" id="phone" value={profileData.phone}
                  onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input type="date" id="dateOfBirth" value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData(p => ({ ...p, dateOfBirth: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" value={profileData.gender}
                    onChange={(e) => setProfileData(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <h2>Change Password</h2>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                  required minLength={8} />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {activeTab === 'doctor' && isDoctor && (
            <form onSubmit={handleDoctorSubmit} className="settings-form">
              <h2>Doctor Profile</h2>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" rows="4" value={doctorData.bio}
                  onChange={(e) => setDoctorData(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell patients about yourself..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="consultationFee">Consultation Fee ($)</label>
                  <input type="number" id="consultationFee" value={doctorData.consultationFee}
                    onChange={(e) => setDoctorData(p => ({ ...p, consultationFee: e.target.value }))}
                    min="0" required />
                </div>
                <div className="form-group">
                  <label htmlFor="experience">Years of Experience</label>
                  <input type="number" id="experience" value={doctorData.experience}
                    onChange={(e) => setDoctorData(p => ({ ...p, experience: e.target.value }))}
                    min="0" required />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={doctorData.acceptingNewPatients}
                    onChange={(e) => setDoctorData(p => ({ ...p, acceptingNewPatients: e.target.checked }))} />
                  <span>Accepting new patients</span>
                </label>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}