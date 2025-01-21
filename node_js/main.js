const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcrypt');
const { URL } = require('url');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');

require('dotenv').config()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  
}));
const port = process.env.PORT || 3000; 


app.use(express.json());


app.use(express.static(path.join('C:/xampp/htdocs/Quiz', 'code')));


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'quiz', 
  charset: 'utf8mb4',
};


async function dbConnect() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MariaDB/MySQL database');
    return connection;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

function error_message(res, text, errorCode = null) {
  const response = {
    status: 0,
    error_message: text,
  };
  if (errorCode) {
    response.error_code = errorCode;
  }
  res.status(500).json(response);
}

function URL_source(username) {
  const url = new URL(`/users/${username}`, 'http://localhost:3000'); 
  return url.toString();
}


async function user_already_exists(username, connection) {
  try {
    const [rows, fields] = await connection.execute('SELECT * FROM user WHERE username = ?', [username]);
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
}

app.post('/api/users', async (req, res) => {
  const connection = await dbConnect();
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error_message: 'Missing username, email, or password' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    if (await user_already_exists(username, connection)) {
      return res.status(409).json({ error_message: 'User already exists!' });
    }

    const [result] = await connection.execute('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [
      username,
      email,
      hashedPassword,
    ]);
    const insertedUserId = result.insertId;

    const accessToken = jwt.sign({ username: username}, process.env.ACCESS_TOKEN_SECRET);
      

    res.status(200).json({ accessToken });

  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(500).json({ error_message: 'Error adding user', error_code: 123 });
  } /*finally {
    connection.end();
  }*/
});

app.get('/api/users', async (req, res) => {
const connection = await dbConnect();
try {
  if (req.query.username) {
    const username = req.query.username;
    const [rows, fields] = await connection.execute('SELECT username, email, password FROM user WHERE username = ?', [username]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]); 
    } else {
      res.status(404).json({ error_message: 'User not found' }); 
    }
  } else {
    const [rows, fields] = await connection.execute('SELECT username, email, password FROM user');
    res.status(200).json(rows); 
  }
} catch (error) {
  console.error('Error fetching users:', error);
  error_message(res, 'Error fetching users', 666);
} /*finally {
  connection.end();
}*/
});

app.get('/api/users/:username', async (req, res) => {
  const connection = await dbConnect();
  try {
    const { username } = req.params;
    const [rows, fields] = await connection.execute('SELECT username, email FROM user WHERE username = ?', [username]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]); 
    } else {
      res.status(404).json({ error_message: 'User not found' }); 
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    error_message(res, 'Error fetching user', 666);
  } /*finally {
    connection.end();
  }*/
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  const connection = await dbConnect();
  try {
    const { username } = req.user; 
    const [rows] = await connection.execute(
      `SELECT user.username, COUNT(quiz.result) AS quiz_count, MAX(quiz.result) AS max_result, user.registration_time 
       FROM user 
       LEFT JOIN quiz ON user.username = quiz.username 
       WHERE user.username = ?`,
      [username]
    );
    if (rows.length > 0) {
      res.status(200).json(rows[0]); 
    } else {
      res.status(404).json({ error_message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error_message: 'Error fetching profile' });
  } /*finally {
    connection.end(); 
  }*/
});

app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  const connection = await dbConnect();
  try {
    
    const [rows, fields] = await connection.execute('SELECT username, result FROM quiz ORDER BY result DESC LIMIT 25');
    connection.end(); 

    if (rows.length > 0) {
      res.status(200).json(rows); 
    } else {
      res.status(404).json({ error_message: 'No results found' }); 
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error_message: 'Error fetching leaderboard', error_code: 666 });
  }
});

app.get('/api/quiz', async (req, res) => {
    const connection = await dbConnect();
    try {
      const [rows, fields] = await connection.execute('SELECT quiz_id, username, result FROM quiz');
      connection.end(); 
  
      if (rows.length > 0) {
        res.status(200).json(rows); 
      } else {
        res.status(404).json({ error_message: 'No results found' }); 
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      error_message(res, 'Error fetching quizzes', 666);
    }
  });

app.get('/api/quiz/:username', authenticateToken, async (req, res) => {
    try {
      const connection = await dbConnect();
      const { username } = req.params;
      const [rows, fields] = await connection.execute(
        'SELECT quiz_id, result FROM quiz WHERE username= ?', [username]
      );
      await connection.end(); 
  
      if (rows.length > 0) {
        res.status(200).json(rows); 
      } else {
        res.status(404).json({ error_message: 'No details found' }); 
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      res.status(500).json({ error_message: 'Error fetching quiz details' }); 
    }
  });

app.post('/api/quiz', async (req, res) => {
    const connection = await dbConnect();
    try {
      const { username, result } = req.body;
  
      if (!username || !result) {
        return res.status(400).json({ error_message: 'username and result are required' });
      }
  
      const [output] = await connection.execute('INSERT INTO quiz (username, result) VALUES (?, ?)', [username, result]);
  
      res.status(201).json({ message: 'Quiz result added successfully', output });
    } catch (error) {
      console.error('Error adding details:', error);
      return res.status(500).json({ error_message: 'Error adding details', error_code: 123 });
    } 
  });

app.get('/api/template', async (req, res) => {
    const connection = await dbConnect();
    try {
      const [rows, fields] = await connection.execute('SELECT template FROM template');
      connection.end(); 
  
      if (rows.length > 0) {
        res.status(200).json(rows); 
      } else {
        res.status(404).json({ error_message: 'No templates found' }); 
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      error_message(res, 'Error fetching templates', 666);
    }
  });

app.get('/api/template/:template_id', async (req, res) => {
const connection = await dbConnect();
try {
    const { template_id } = req.params;
    const [rows, fields] = await connection.execute('SELECT template FROM template WHERE template_id = ?', [template_id]);
    if (rows.length > 0) {
    res.status(200).json(rows[0]); 
    } else {
    res.status(404).json({ error_message: 'User not found' });
    }
} catch (error) {
    console.error('Error fetching template:', error);
    error_message(res, 'Error fetching template', 666);
} /*finally {
    connection.end();
}*/
});

app.get('/api/country', async (req, res) => {
    const connection = await dbConnect();
    try {
        const [rows, fields] = await connection.execute('SELECT country, capital_city, flag, region FROM country');
        connection.end(); 
    
        if (rows.length > 0) {
        res.status(200).json(rows); 
        } else {
        res.status(404).json({ error_message: 'No templates found' }); 
        }
    } catch (error) {
        console.error('Error fetching countries:', error);
        error_message(res, 'Error fetching countries', 666);
    }
    });

app.get('/api/country/:country_id', async (req, res) => {
    const connection = await dbConnect();
    try {
        const { country_id } = req.params;
        const [rows, fields] = await connection.execute('SELECT country, capital_city, flag, region FROM country WHERE country_id = ?', [country_id])
        if (rows.length > 0) {
        res.status(200).json(rows[0]); 
        } else {
        res.status(404).json({ error_message: 'Country not found' }); 
        }
    } catch (error) {
        console.error('Error fetching country:', error);
        error_message(res, 'Error fetching country', 666);
    } /*finally {
        connection.end();
    }*/
    });

app.get('/api/capital/:country_id', async (req, res) => {
    const connection = await dbConnect();
    try {
        const { country_id } = req.params;
        const [rows, fields] = await connection.execute('SELECT capital_city FROM country WHERE country_id = ?', [country_id])
        if (rows.length > 0) {
        res.status(200).json(rows[0]); 
        } else {
        res.status(404).json({ error_message: 'Country not found' }); 
        }
    } catch (error) {
        console.error('Error fetching capital:', error);
        error_message(res, 'Error fetching capital', 666);
    } /*finally {
        connection.end();
    }*/
    });

app.get('/api/details/:username', async (req, res) => {
  let connection;
  try {
    connection = await dbConnect();
    const { username } = req.params; 
    const [rows, fields] = await connection.execute(
      'SELECT qd.quiz_id, qd.question, qd.answer, qd.correct ' +
      'FROM quiz_details qd ' +
      'JOIN quiz q ON qd.quiz_id = q.quiz_id ' +
      'JOIN user u ON q.username = u.username ' +
      'WHERE u.username = ?',
      [username]
    );

    if (rows.length > 0) {
      res.status(200).json(rows); 
    } else {
      res.status(404).json({ error_message: 'No details found' }); 
    }
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    res.status(500).json({ error_message: 'Error fetching quiz details' }); 
  } finally {
    if (connection) {
      await connection.end(); 
    }
  }
});

app.post('/api/details', async (req, res) => {
    let connection;
    try {
      connection = await dbConnect();
      const { quiz_id, template_id, country_id, question, answer, correct } = req.body;
  
      if (!quiz_id || !template_id || !country_id || !question || !answer || typeof correct === 'undefined') {
        return res.status(400).json({ error_message: 'Missing quiz_id, template_id, country_id, question, answer, correct' });
      }
  
      const [result] = await connection.execute(
        'INSERT INTO quiz_details (quiz_id, template_id, country_id, question, answer, correct) VALUES (?, ?, ?, ?, ?, ?)',
        [quiz_id, template_id, country_id, question, answer, correct]
      );
  
      res.status(201).json({ message: 'Quiz details added successfully', result });
    } catch (error) {
      console.error('Error adding details:', error.message); 
      return res.status(500).json({ error_message: 'Error adding details', error_code: 123, error_detail: error.message });
    } finally {
      if (connection) {
        connection.end(); 
      }
    }
  });
  
app.post('/api/login', async (req, res) => {
  const connection = await dbConnect();
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error_message: 'Missing username or password' });
    }

    
    const [rows] = await connection.execute('SELECT * FROM user WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(404).json({ error_message: 'User not found' });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error_message: 'Incorrect password' });
    }

    const accessToken = jwt.sign({ username: user.username}, process.env.ACCESS_TOKEN_SECRET);
 
    res.status(200).json({ accessToken });

    
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ error_message: 'Error logging in user', error_code: 456 });
  } /*finally {
    connection.end();
  }*/
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); 

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); 
    req.user = user;
    next(); 
  });
}
  
  app.get('/leaderboard/',  (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'leaderboard.html'));
});

  app.get('/profile',  (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'profile.html'));
});

app.get('/quiz/', authenticateToken, (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'quiz.html'));
});

app.get('/index/', authenticateToken, (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'index.html'));
});

app.get('/login/', (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'login.html'));
});

app.get('/documentation/', (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'documentation.html'));
});
  
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
