export const jwtConstants = {
    // In production, use environment variable!
    secret: process.env.JWT_SECRET || 'secretKey',
};
