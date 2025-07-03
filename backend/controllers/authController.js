import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { Op } from 'sequelize';

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

    async validateToken(req, res) {
        try {
            // Si on arrive ici, c'est que le middleware d'authentification a validé le token
            const user = await User.findByPk(req.user.userId, {
                attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
            });

            if (!user || !user.isActive) {
                return res.status(401).json({ valid: false, error: 'Utilisateur non trouvé ou désactivé' });
            }

            res.json({ 
                valid: true, 
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Erreur validation token:', error);
            res.status(401).json({ valid: false, error: 'Token invalide' });
        }
    }

    async refreshToken(req, res) {
        try {
            // Vérifier que l'utilisateur existe toujours et est actif
            const user = await User.findByPk(req.user.userId);
            
            if (!user || !user.isActive) {
                return res.status(401).json({ error: 'Utilisateur non trouvé ou désactivé' });
            }

            // Générer un nouveau token
            const newToken = jwt.sign(
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
                role: user.role
            };

            res.json({
                token: newToken,
                user: userResponse
            });
        } catch (error) {
            console.error('Erreur rafraîchissement token:', error);
            res.status(500).json({ 
                error: 'Erreur serveur lors du rafraîchissement du token',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const { firstName, lastName, email } = req.body;
            const userId = req.user.userId;

            // Validation des données
            if (!firstName || !lastName || !email) {
                return res.status(400).json({ error: 'Prénom, nom et email sont requis' });
            }

            // Vérifier si l'email est déjà utilisé par un autre utilisateur
            if (email !== req.user.email) {
                const existingUser = await User.findOne({ 
                    where: { 
                        email: email,
                        id: { [Op.ne]: userId } // Exclure l'utilisateur actuel
                    } 
                });
                
                if (existingUser) {
                    return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre utilisateur' });
                }
            }

            // Mettre à jour l'utilisateur
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            await user.update({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase()
            });

            // Retourner les données mises à jour (sans le mot de passe)
            const updatedUser = await User.findByPk(userId, {
                attributes: { 
                    exclude: ['password'],
                    include: ['createdAt', 'updatedAt', 'lastLoginAt'] 
                }
            });

            res.json({
                success: true,
                message: 'Profil mis à jour avec succès',
                user: updatedUser
            });
        } catch (error) {
            console.error('Erreur mise à jour profil:', error);
            res.status(500).json({ 
                error: 'Erreur serveur lors de la mise à jour du profil',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default new AuthController();
