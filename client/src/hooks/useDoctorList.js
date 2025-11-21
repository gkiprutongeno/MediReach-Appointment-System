import { useEffect, useState, useCallback } from 'react';
import { doctorAPI } from '../services/api';

/**
 * Custom Hook: useDoctorList
 * 
 * Abstracts doctor fetching and filtering logic
 * Manages loading, error, and pagination states
 * 
 * Parameters:
 *   - specialization: Doctor specialization to filter by
 *   - city: City to filter by
 *   - page: Current page number
 *   - limit: Results per page
 * 
 * Returns:
 *   - doctors: Array of doctor objects
 *   - loading: Boolean indicating fetch in progress
 *   - error: Error message if fetch failed
 *   - pagination: Object with { page, pages, total, count }
 *   - refetch: Function to manually refetch doctors
 * 
 * Usage:
 * const { doctors, loading, error, pagination, refetch } = useDoctorList({
 *   specialization: 'cardiology',
 *   city: 'nairobi',
 *   page: 1,
 *   limit: 10
 * });
 */

export const useDoctorList = ({
  specialization = '',
  city = '',
  page = 1,
  limit = 10
} = {}) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    count: 0
  });

  // Fetch doctors with current filters
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build params object only with non-empty values
      const params = { page, limit };
      if (specialization) params.specialization = specialization;
      if (city) params.city = city;

      // Call API
      const { data } = await doctorAPI.getAll(params);

      // Update state with response data
      setDoctors(data.data || []);
      setPagination({
        page: data.page || page,
        pages: data.pages || 1,
        total: data.total || 0,
        count: data.count || 0
      });
    } catch (err) {
      // Set error message from API response or generic error
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load doctors';
      setError(errorMessage);
      console.error('❌ [useDoctorList] Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [specialization, city, page, limit]);

  // Fetch doctors when filters or page changes
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Return state and refetch function
  return {
    doctors,
    loading,
    error,
    pagination,
    refetch: fetchDoctors
  };
};

export default useDoctorList;
