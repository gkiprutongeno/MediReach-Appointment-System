const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Get all doctors
exports.getAll = async (req, res, next) => {
  try {
    const { specialization, city, page = 1, limit = 10, sort = '-rating.average' } = req.query;
    const query = { isVerified: true };
    if (specialization) query.specialization = specialization;
    if (city) query['clinicAddress.city'] = new RegExp(city, 'i');

    const doctors = await Doctor.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments(query);

    res.json({ success: true, count: doctors.length, total, pages: Math.ceil(total / limit), data: doctors });
  } catch (err) {
    next(err);
  }
};

// Get doctor by id
exports.getById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

// Get available slots
exports.getSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, error: 'Date is required' });

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();
    const dayAvailability = doctor.availability.find(a => a.dayOfWeek === dayOfWeek && a.isAvailable);
    if (!dayAvailability) return res.json({ success: true, data: [] });

    const slots = [];
    const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);

    let current = new Date(requestedDate);
    current.setHours(startHour, startMin, 0, 0);
    const endTime = new Date(requestedDate);
    endTime.setHours(endHour, endMin, 0, 0);

    while (current < endTime) {
      slots.push(new Date(current));
      current.setMinutes(current.getMinutes() + doctor.slotDuration);
    }

    const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      dateTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] }
    }).select('dateTime');

    const bookedTimes = bookedAppointments.map(a => a.dateTime.getTime());

    const availableSlots = slots
      .filter(slot => !bookedTimes.includes(slot.getTime()) && slot > new Date())
      .map(slot => ({
        dateTime: slot,
        formatted: slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }));

    res.json({ success: true, data: availableSlots });
  } catch (err) {
    next(err);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'specialization', 'bio', 'consultationFee', 'experience',
      'languages', 'clinicAddress', 'acceptingNewPatients', 'qualifications'
    ];

    const updates = {};
    allowedFields.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, updates, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

// Update availability
exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability, slotDuration } = req.body;
    const updates = {};
    if (availability) updates.availability = availability;
    if (slotDuration) updates.slotDuration = slotDuration;

    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, updates, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};
