import express from 'express';
import bcrypt from 'bcrypt';
import pg from 'pg';
import requireAdmin from '../middleware/auth.js';

const router = express.Router();
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
let dbReady = false;

const dbConnection = db.connect()
  .then(() => {
    dbReady = true;
    console.log('Admin routes connected to PostgreSQL.');
  })
  .catch((error) => {
    console.error('Admin database connection failed:', error.message);
  });

router.get('/login', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    await dbConnection;

    if (!dbReady) {
      return res.status(503).render('admin/login', {
        error: 'The database is temporarily unavailable.',
      });
    }

    const { username, password } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).render('admin/login', {
        error: 'Please enter your username and password.',
      });
    }

    const result = await db.query(
      `SELECT id, username, password_hash
       FROM admins
       WHERE username = $1`,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).render('admin/login', {
        error: 'Invalid username or password.',
      });
    }

    const admin = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).render('admin/login', {
        error: 'Invalid username or password.',
      });
    }

    req.session.regenerate((error) => {
      if (error) {
        console.error('Session error:', error.message);

        return res.status(500).render('admin/login', {
          error: 'Unable to sign in right now. Please try again.',
        });
      }

      req.session.admin = {
        id: admin.id,
        username: admin.username,
      };

      req.session.save((saveError) => {
        if (saveError) {
          console.error('Session save error:', saveError.message);

          return res.status(500).render('admin/login', {
            error: 'Unable to sign in right now. Please try again.',
          });
        }

        return res.redirect('/admin/dashboard');
      });
    });
  } catch (error) {
    console.error('Admin login error:', error.message);

    return res.status(500).render('admin/login', {
      error: 'Something went wrong. Please try again.',
    });
  }
});
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    await dbConnection;

    if (!dbReady) {
      return res.status(503).send('Database is temporarily unavailable.');
    }

    const result = await db.query(
      `SELECT id, vname, destination, rating, review,
              approvalst, created_at
       FROM recommendations
       ORDER BY created_at DESC`
    );

    const recommendations = result.rows;

    res.render('admin/dashboard', {
      admin: req.session.admin,
      pendingRecommendations: recommendations.filter(
        item => item.approvalst === 'pending'
      ),
      approvedRecommendations: recommendations.filter(
        item => item.approvalst === 'approved'
      ),
      rejectedRecommendations: recommendations.filter(
        item => item.approvalst === 'rejected'
      )
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).send('Unable to load the admin dashboard.');
  }
});

// Approve a recommendation
router.post(
  '/recommendations/:id/approve',
  requireAdmin,
  async (req, res) => {
    try {
      const recommendationId = Number(req.params.id);

      if (!Number.isInteger(recommendationId) || recommendationId <= 0) {
        return res.status(400).send('Invalid recommendation ID.');
      }

      const result = await db.query(
        `UPDATE recommendations
         SET approvalst = $1
         WHERE id = $2 AND approvalst = $3
         RETURNING id`,
        ['approved', recommendationId, 'pending']
      );

      if (result.rowCount === 0) {
        return res.status(404).send(
          'Recommendation not found or already processed.'
        );
      }

      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Approve recommendation error:', error.message);
      res.status(500).send('Unable to approve the recommendation.');
    }
  }
);

// Reject a recommendation
router.post(
  '/recommendations/:id/reject',
  requireAdmin,
  async (req, res) => {
    try {
      const recommendationId = Number(req.params.id);

      if (!Number.isInteger(recommendationId) || recommendationId <= 0) {
        return res.status(400).send('Invalid recommendation ID.');
      }

      const result = await db.query(
        `UPDATE recommendations
         SET approvalst = $1
         WHERE id = $2 AND approvalst = $3
         RETURNING id`,
        ['rejected', recommendationId, 'pending']
      );

      if (result.rowCount === 0) {
        return res.status(404).send(
          'Recommendation not found or already processed.'
        );
      }

      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Reject recommendation error:', error.message);
      res.status(500).send('Unable to reject the recommendation.');
    }
  }
);
// Delete a recommendation permanently
router.post(
'/recommendations/:id/delete',
requireAdmin,
async (req, res) => {
try {
const recommendationId = Number(req.params.id);


  if (!Number.isInteger(recommendationId) || recommendationId <= 0) {
    return res.status(400).send('Invalid recommendation ID.');
  }

  const result = await db.query(
    `DELETE FROM recommendations
     WHERE id = $1
     RETURNING id`,
    [recommendationId]
  );

  if (result.rowCount === 0) {
    return res.status(404).send('Recommendation not found.');
  }

  return res.redirect('/admin/dashboard');
} catch (error) {
  console.error('Delete recommendation error:', error.message);
  return res.status(500).send('Unable to delete the recommendation.');
}

}
);
router.post('/logout', requireAdmin, (req, res, next) => {
req.session.destroy((error) => {
if (error) {
console.error('Logout error:', error.message);
return res.status(500).send('Unable to log out. Please try again.');
}


res.clearCookie('admin.sid');
return res.redirect('/admin/login');


});
});

export default router;