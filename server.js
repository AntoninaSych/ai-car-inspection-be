import app from './app.js';
import { connectDB } from './db/sequelize.js';
import cors from "cors";

const PORT = process.env.PORT || 5001;
app.use(cors());
const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🚀 Swagger running on port http://localhost:${PORT}/api-docs/`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
};

start();
