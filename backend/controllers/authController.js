import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

class AuthController {

    async register(req, res) {
        try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'user',
            isActive: true
        });

        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        res.status(201).json({
            user: userResponse,
            token
        });
        } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ 
            error: 'Erreur serveur lors de l\'inscription',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        }
    }

    async login(req, res) {
        try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Identifiants invalides ou compte désactivé' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        await user.update({ lastLoginAt: new Date() });

        const token = jwt.sign(
            { 
            userId: user.id,
            email: user.email,
            role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            lastLoginAt: user.lastLoginAt
        };

        res.json({
            user: userResponse,
            token
        });
        } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ 
            error: 'Erreur serveur lors de la connexion',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        }
    }

    async getProfile(req, res) {
        try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { 
            exclude: ['password'],
            include: ['createdAt', 'updatedAt', 'lastLoginAt'] 
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(user);
        } catch (error) {
        console.error('Erreur profil:', error);
        res.status(500).json({ 
            error: 'Erreur serveur lors de la récupération du profil',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        }
    }
}

export default new AuthController();
