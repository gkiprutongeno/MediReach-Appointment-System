import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * DoctorCard Component
 * 
 * Reusable card for displaying individual doctor information
 * Shows: Avatar, Name, Specialization, Experience, Rating, Fee
 * Includes: View Profile and Choose buttons
 * 
 * Props:
 *   - doctor: Doctor object with user and profile data
 *   - onChoose: Callback function when "Choose" button is clicked
 *   - showButtons: Whether to display action buttons (default: true)
 * 
 * Usage:
 * <DoctorCard 
 *   doctor={doctorObj} 
 *   onChoose={(doc) => handleSelection(doc)}
 *   showButtons={true}
 * />
 */

export default function DoctorCard({ doctor, onChoose, showButtons = true }) {
  // Extract doctor data for display
  const { user, specialization, experience, consultationFee, rating } = doctor;
  const { firstName, lastName, profileImage } = user || {};

  // Format specialization text: 'general-practice' -> 'General Practice'
  const formatSpecialization = (spec) => {
    return spec
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate star rating display (★★★★☆)
  const getRatingStars = (avg) => {
    const roundedRating = Math.round(avg || 0);
    return {
      filled: '★'.repeat(roundedRating),
      empty: '☆'.repeat(5 - roundedRating)
    };
  };

  const stars = getRatingStars(rating?.average);

  return (
    <article className="doctor-card" data-doctor-id={doctor._id}>
      {/* Doctor Avatar Section */}
      <div className="doctor-avatar">
        {profileImage ? (
          <img
            src={profileImage}
            alt={`Dr. ${firstName} ${lastName}`}
            loading="lazy"
            className="avatar-image"
          />
        ) : (
          <span className="avatar-placeholder" aria-hidden="true">
            {firstName?.[0]}{lastName?.[0]}
          </span>
        )}
      </div>

      {/* Doctor Info Section */}
      <div className="doctor-info">
        {/* Doctor Name */}
        <h3 className="doctor-name">
          Dr. {firstName} {lastName}
        </h3>

        {/* Specialization */}
        <p className="doctor-specialization">
          {formatSpecialization(specialization)}
        </p>

        {/* Years of Experience */}
        <p className="doctor-experience">
          <span className="label">Experience:</span>
          <span className="value">{experience} years</span>
        </p>

        {/* Rating with Stars */}
        <div className="doctor-rating">
          <span
            className="stars"
            aria-label={`Rating: ${rating?.average || 0} out of 5 stars`}
          >
            {stars.filled}
            {stars.empty}
          </span>
          <span className="rating-info">
            {rating?.average ? rating.average.toFixed(1) : '0.0'} ({rating?.count || 0} reviews)
          </span>
        </div>

        {/* Consultation Fee */}
        <p className="doctor-fee">
          <span className="label">Consultation Fee:</span>
          <span className="value">${consultationFee}</span>
        </p>
      </div>

      {/* Action Buttons Section */}
      {showButtons && (
        <div className="doctor-actions">
          {/* View Full Profile Button */}
          <Link
            to={`/doctors/${doctor._id}`}
            className="btn btn-outline btn-sm"
            aria-label={`View full profile of Dr. ${firstName} ${lastName}`}
          >
            View Profile
          </Link>

          {/* Choose/Book Button */}
          <button
            onClick={() => onChoose(doctor)}
            className="btn btn-primary btn-sm"
            aria-label={`Select Dr. ${firstName} ${lastName} for appointment`}
          >
            Choose
          </button>
        </div>
      )}
    </article>
  );
}

DoctorCard.propTypes = {
  doctor: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    specialization: PropTypes.string.isRequired,
    experience: PropTypes.number.isRequired,
    consultationFee: PropTypes.number.isRequired,
    rating: PropTypes.shape({
      average: PropTypes.number,
      count: PropTypes.number
    }),
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      profileImage: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string
    })
  }).isRequired,
  onChoose: PropTypes.func.isRequired,
  showButtons: PropTypes.bool
};
