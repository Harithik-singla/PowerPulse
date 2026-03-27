const Outage    = require('../models/Outage');
const { getIO } = require('../config/socket');

exports.getOutages = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, status, pincode } = req.query;
    let query = {};
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      };
    }
    if (status)  query.status  = status;
    if (pincode) query.pincode = pincode;

    const outages = await Outage.find(query)
      .populate('reportedBy', 'name locality')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ outages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createOutage = async (req, res) => {
  try {
    const { locality, pincode, coordinates, durationMinutes, description } = req.body;

    const outage = await Outage.create({
      reportedBy:      req.user._id,
      locality:        locality || req.user.locality,
      pincode:         pincode  || req.user.pincode,
      location:        { type: 'Point', coordinates },
      durationMinutes: durationMinutes || 0,
      description:     description || ''
    });

    await outage.populate('reportedBy', 'name locality');

    // Emit to everyone in this pincode room + ops room
    const io = getIO();
    io.to(`pincode:${outage.pincode}`).emit('outage:new', outage);
    io.to('ops').emit('outage:new', outage);

    res.status(201).json({ outage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOutage = async (req, res) => {
  try {
    const outage = await Outage.findById(req.params.id)
      .populate('reportedBy', 'name locality');
    if (!outage) return res.status(404).json({ message: 'Outage not found' });
    res.json({ outage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upvoteOutage = async (req, res) => {
  try {
    const outage = await Outage.findById(req.params.id);
    if (!outage) return res.status(404).json({ message: 'Not found' });

    const userId      = req.user._id.toString();
    const alreadyVoted = outage.upvotes.map(u => u.toString()).includes(userId);

    if (alreadyVoted) {
      outage.upvotes = outage.upvotes.filter(u => u.toString() !== userId);
    } else {
      outage.upvotes.push(req.user._id);
    }

    await outage.save();

    // Emit upvote count update to pincode room
    getIO().to(`pincode:${outage.pincode}`).emit('outage:upvoted', {
      _id:     outage._id,
      upvotes: outage.upvotes.length
    });

    res.json({ upvotes: outage.upvotes.length, voted: !alreadyVoted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, ert } = req.body;
    const outage = await Outage.findById(req.params.id);
    if (!outage) return res.status(404).json({ message: 'Not found' });

    outage.status = status || outage.status;
    if (ert) outage.ert = new Date(ert);
    if (status === 'resolved') outage.resolvedAt = new Date();

    await outage.save();
    await outage.populate('reportedBy', 'name locality');

    // Emit status update to pincode room + ops room
    const io = getIO();
    io.to(`pincode:${outage.pincode}`).emit('outage:updated', outage);
    io.to('ops').emit('outage:updated', outage);

    res.json({ outage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOutages = async (req, res) => {
  try {
    const outages = await Outage.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ outages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};