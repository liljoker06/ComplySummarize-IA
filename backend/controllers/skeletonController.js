import { Skeleton } from '../models/index.js';

class SkeletonController {

    // Create
    async createSkeleton(req, res) {
        try {
            const skeleton = await Skeleton.create(req.body);
            res.status(201).json(skeleton);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Read all 
    async getAllSkeletons(req, res) {
        try {
            const skeletons = await Skeleton.findAll();
            res.json(skeletons);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Read one
    async getSkeletonById(req, res) {
        try {
            const skeleton = await Skeleton.findByPk(req.params.id);
            if (!skeleton) {
                return res.status(404).json({ error: 'Skeleton not found' });
            }
            res.json(skeleton);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update
    async updateSkeleton(req, res) {
        try {
            const [updated] = await Skeleton.update(req.body, {
                where: { id: req.params.id }
            });
            if (updated) {
                const updatedSkeleton = await Skeleton.findByPk(req.params.id);
                res.json(updatedSkeleton);
            } else {
                res.status(404).json({ error: 'Skeleton not found' });
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Delete
    async deleteSkeleton(req, res) {
        try {
            const deleted = await Skeleton.destroy({
                where: { id: req.params.id }
            });
            if (deleted) {
                res.json({ message: 'Skeleton deleted successfully' });
            } else {
                res.status(404).json({ error: 'Skeleton not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new SkeletonController();