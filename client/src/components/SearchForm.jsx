import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * SearchForm Component
 * 
 * Reusable search form for filtering doctors
 * Accepts specialization and city as filter inputs
 * 
 * Usage:
 * <SearchForm onFilter={(filters) => handleSearch(filters)} />
 */

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

export default function SearchForm({ 
  onFilter, 
  initialSpecialization = '', 
  initialCity = '' 
}) {
  // Component state for form inputs
  const [specialization, setSpecialization] = useState(initialSpecialization);
  const [city, setCity] = useState(initialCity);

  // Handle specialization dropdown change
  const handleSpecializationChange = (e) => {
    const value = e.target.value;
    setSpecialization(value);
    // Trigger parent callback immediately
    onFilter({ specialization: value, city });
  };

  // Handle city input change
  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    // Trigger parent callback immediately (optional: add debounce for performance)
    onFilter({ specialization, city: value });
  };

  // Handle form reset (clear all filters)
  const handleReset = () => {
    setSpecialization('');
    setCity('');
    onFilter({ specialization: '', city: '' });
  };

  return (
    <div className="search-form">
      <div className="form-group">
        <label htmlFor="specialization">
          Specialization
          <span className="required" aria-label="required">*</span>
        </label>
        <select
          id="specialization"
          value={specialization}
          onChange={handleSpecializationChange}
          className="form-control"
          aria-label="Filter by doctor specialization"
        >
          {specializations.map(spec => (
            <option key={spec.id} value={spec.id}>
              {spec.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="city">
          City
          <span className="required" aria-label="required">*</span>
        </label>
        <input
          type="text"
          id="city"
          value={city}
          onChange={handleCityChange}
          placeholder="Enter city name"
          className="form-control"
          aria-label="Filter by city"
        />
      </div>

      <button
        type="button"
        onClick={handleReset}
        className="btn btn-outline"
        aria-label="Clear all filters"
      >
        Clear Filters
      </button>
    </div>
  );
}

SearchForm.propTypes = {
  onFilter: PropTypes.func.isRequired,
  initialSpecialization: PropTypes.string,
  initialCity: PropTypes.string
};
