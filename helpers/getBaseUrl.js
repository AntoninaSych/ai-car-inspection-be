const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '5001';

export const getBaseUrl = () => {
    return `http://${HOST}:${PORT}`;
};

export default getBaseUrl;

