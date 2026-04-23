const Grievance = require('../models/Grievance');

exports.createGrievance = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const grievance = new Grievance({
            title,
            description,
            category,
            studentId: req.studentId
        });

        await grievance.save();
        res.status(201).json(grievance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllGrievances = async (req, res) => {
    try {
        const grievances = await Grievance.find({ studentId: req.studentId }).sort({ date: -1 });
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getGrievanceById = async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);
        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }
        res.json(grievance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateGrievance = async (req, res) => {
    try {
        const { title, description, category, status } = req.body;
        let grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        // Check ownership
        if (grievance.studentId.toString() !== req.studentId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        grievance = await Grievance.findByIdAndUpdate(
            req.params.id,
            { title, description, category, status },
            { new: true }
        );

        res.json(grievance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteGrievance = async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        // Check ownership
        if (grievance.studentId.toString() !== req.studentId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await Grievance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Grievance deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.searchGrievances = async (req, res) => {
    try {
        const { title } = req.query;
        const grievances = await Grievance.find({
            studentId: req.studentId,
            title: { $regex: title, $options: 'i' }
        });
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
