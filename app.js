
import 'dotenv/config';
import express from 'express'; 
import path from 'path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import session from 'express-session';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


const db = process.env.DATABASE_URL
    ? new pg.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })
    : new pg.Client({
        user: 'postgres',
        host: 'localhost',
        database: 'reviews',
        password: process.env.DB_PASSWORD,
        port: 5432,
    });

db.connect()
  .then(() => {
    console.log('Connected to PostgreSQL successfully!');
  })
  .catch((error) => {
    console.error('PostgreSQL connection failed:', error.message);
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use (express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'admin.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60
  }
}));

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

 app.get('/', (req, res) => {
    res.render('guide');
});
app.get('/petra', (req, res) => {
    res.render('petra');
});
app.get('/jordan', (req, res) => {
    res.render('jordan');
});
app.get('/recommendations', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, vname, destination, rating, review, created_at
       FROM recommendations
       WHERE approvalst = $1
       ORDER BY created_at DESC`,
      ['approved']
    );

    res.render('recommendations', {
      recommendations: result.rows
    });

  } catch (error) {
    console.error('Error loading recommendations:', error.message);
    res.status(500).send('Unable to load recommendations right now.');
  }
});

app.get('/visitor-guide', (req, res) => {
    res.render('visitor-guide');
});
app.get('/contact', (req, res) => {
    res.render('contact');
});

app.post('/recommendations', async (req, res) => {
  try {
    const { visitor_name, destination, rating, review_text } = req.body;

    // Validate the submitted data
    if (
      typeof visitor_name !== 'string' ||
      typeof destination !== 'string' ||
      typeof review_text !== 'string' ||
      !visitor_name.trim() ||
      !destination.trim() ||
      !review_text.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields.'
      });
    }

    const parsedRating = Number(rating);

    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5 ||
      visitor_name.trim().length > 80 ||
      destination.trim().length > 120 ||
      review_text.trim().length < 10 ||
      review_text.trim().length > 1500
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please check your name, destination, rating, and review.'
      });
    }

    const result = await db.query(
      `INSERT INTO recommendations
        (vname, destination, rating, review, approvalst)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
      [
        visitor_name.trim(),
        destination.trim(),
        parsedRating,
        review_text.trim()
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your recommendation has been submitted for review.'
    });

  } catch (error) {
    console.error('Error saving recommendation:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
});

app.use('/admin', adminRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});