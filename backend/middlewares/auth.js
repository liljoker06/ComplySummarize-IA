import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.header('Authorization');
    
    // Vérifier si l'en-tête existe et commence par 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Aucun token Bearer, autorisation refusée' });
    }

    // Extraire le token (enlever 'Bearer ' du début)
    const token = authHeader.split(' ')[1];

    // Vérifier si le token existe
    if (!token) {
        return res.status(401).json({ msg: 'Token manquant, autorisation refusée' });
    }

    // Vérifier le token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token invalide' });
    }
};

export default authMiddleware;
