import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { connectToDb } from './config/db';
import path from 'path'; 
import 'express-async-handler';
import userRoutes from './routes/user.routes';
import settingsRoutes from './routes/settings.routes';
import garageRoutes from './routes/garage.routes';
import paymentRoutes from './routes/payment.routes';
import statisticsRoutes from './routes/statistics.routes';
import userRepositoryRoutes from './routes/userRepository.routes';
import feedbackRoutes from './routes/feedback.routes';
import managerRoutes from './routes/manager.routes'; 
import administratorRoutes from './routes/admin.routes'; 
import registeredUserRoutes from './routes/registeredUser.routes';

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

app.use(express.json());

app.use('/api/users', userRoutes); 
app.use('/api/registered-user', registeredUserRoutes);
app.use('/api/manager', managerRoutes); 
app.use('/api/administrator', administratorRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/settings', settingsRoutes);
app.use('/garage', garageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/user-repository', userRepositoryRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/test', (req, res) => {
    res.send('API is working!');
});

const PORT = process.env.PORT || 3000;

connectToDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});
