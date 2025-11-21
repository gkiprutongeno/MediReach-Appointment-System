const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Create appointment
exports.create = async (req, res, next) => {
  try {
    const { doctorId, dateTime, type, reason, symptoms, notes } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
    if (!doctor.acceptingNewPatients) return res.status(400).json({ success: false, error: 'Doctor not accepting new patients' });

    const appointmentDateTime = new Date(dateTime);
    const isAvailable = await Appointment.isSlotAvailable(doctorId, appointmentDateTime);
    if (!isAvailable) return res.status(400).json({ success: false, error: 'Time slot is not available' });

    const endTime = new Date(appointmentDateTime);
    endTime.setMinutes(endTime.getMinutes() + doctor.slotDuration);

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      dateTime: appointmentDateTime,
      endTime,
      type: type || 'in-person',
      reason,
      symptoms: symptoms || [],
      notes: { patient: notes || '' },
      fee: { amount: doctor.consultationFee }
    });

    const populated = await Appointment.findById(appointment._id);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// Get appointments
exports.getAll = async (req, res, next) => {
  try {
    const { status, from, to, page = 1, limit = 10 } = req.query;
    let query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) return res.status(404).json({ success: false, error: 'Doctor profile not found' });
      query.doctor = doctor._id;
    }

    if (status) query.status = status;
    if (from || to) {
      query.dateTime = {};
      if (from) query.dateTime.$gte = new Date(from);
      if (to) query.dateTime.$lte = new Date(to);
    }

    const appointments = await Appointment.find(query)
      .sort('-dateTime')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({ success: true, count: appointments.length, total, pages: Math.ceil(total / limit), data: appointments });
  } catch (err) {
    next(err);
  }
};

// Get single appointment
exports.getById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const doctor = await Doctor.findOne({ user: req.user._id });
    const isDoctor = doctor && appointment.doctor._id.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Not authorized' });

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// Update appointment
exports.update = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const doctor = await Doctor.findOne({ user: req.user._id });
    const isDoctor = doctor && appointment.doctor._id.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Not authorized' });

    const { status, notes, prescription } = req.body;
    const updates = {};
    if (isPatient && notes) updates['notes.patient'] = notes;
    if (isDoctor) {
      if (status) updates.status = status;
      if (notes) updates['notes.doctor'] = notes;
      if (prescription) updates.prescription = prescription;
    }
    if (status === 'cancelled') {
      updates.status = 'cancelled';
      updates.cancelledBy = req.user.role;
      updates.cancellationReason = req.body.reason || '';
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// Delete / cancel
exports.remove = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    if (!isPatient && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Not authorized' });

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user.role;
    appointment.cancellationReason = req.body.reason || 'Cancelled by user';
    await appointment.save();

    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
