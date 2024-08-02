const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const ImageModule = require('docxtemplater-image-module-free');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require("cors");
const cookieSession = require("cookie-session");
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Set up cookie session middleware
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const users = JSON.parse(fs.readFileSync('data/phoneNumbers.json', 'utf8'));

// Serve static files
//app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check authentication
const isAuthenticated = async (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    await res.redirect('/');
};

// Serve login.html at the root route
app.get('/', async (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/home');
    }
    return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);
    if (!user || user.password !== password) {
        return res.status(400).send('Invalid email or password');
    }

    req.session.isLoggedIn = true;
    req.session.email = email;

    const token = jwt.sign({ email }, 'secret_key');

    await res.send({ token });
});

// Serve protected routes
app.get('/home', isAuthenticated, async (req, res) => {
    await res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/form', isAuthenticated, async (req, res) => {
    await res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

/*
app.get('/cityData', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cityData.html'));
});
*/

app.get('/hotelData', isAuthenticated, async (req, res) => {
    await res.sendFile(path.join(__dirname, 'public', 'hotelData.html'));
});

app.get('/activityData', isAuthenticated, async (req, res) => {
    await res.sendFile(path.join(__dirname, 'public', 'activityData.html'));
});

app.get('/output', isAuthenticated, async (req, res) => {
    await res.sendFile(path.join(__dirname, 'public', 'output.html'));
});


// Logout route
app.get('/logout', async (req, res) => {
    req.session = null;
    await res.redirect('/');
});

app.use('/', express.static(path.join(__dirname, 'public')));




const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);



const activityDB = path.join(__dirname, 'data', 'activityData.json');
//const cityDB = path.join(__dirname, 'data', 'cityData.json');
const hotelDB = path.join(__dirname, 'data', 'hotelData.json');

// =======================================================================================================
// Create data directory if not exists
if (!fs.existsSync(path.dirname(activityDB))) {
    fs.mkdirSync(path.dirname(activityDB), { recursive: true });
}

app.get('/api/activityData', async (req, res) => {
    await fs.readFile(activityDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }
        res.status(200).json(JSON.parse(data));
    });
});

app.post('/api/activityData', async (req, res) => {
    const { activity, description, price } = req.body;
    const id = uuidv4();
    const newRecord = { id, activity, description, price };

    await fs.readFile(activityDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        const jsonData = JSON.parse(data);
        jsonData.push(newRecord);

        fs.writeFile(activityDB, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Data saved successfully', id });
        });
    });
});

app.put('/api/activityData/:id', async (req, res) => {
    const id = req.params.id;
    const { activity, description, price } = req.body;

    await fs.readFile(activityDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }

        jsonData[index] = { id, activity, description, price };

        fs.writeFile(activityDB, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Data updated successfully' });
        });
    });
});

app.delete('/api/activityData/:id', async (req, res) => {
    const id = req.params.id;

    await fs.readFile(activityDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }

        jsonData.splice(index, 1);

        fs.writeFile(activityDB, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Record deleted successfully' });
        });
    });
});

// Create data directory if not exists
if (!fs.existsSync(path.dirname(hotelDB))) {
    fs.mkdirSync(path.dirname(hotelDB), { recursive: true });
}

app.get('/api/hotelData', async (req, res) => {
    await fs.readFile(hotelDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }
        res.status(200).json(JSON.parse(data));
    });
});

app.post('/api/hotelData', async (req, res) => {
    const { city, type, name } = req.body;
    const id = uuidv4();
    const newRecord = { id, city, type, name };

    await fs.readFile(hotelDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        const jsonData = JSON.parse(data);
        jsonData.push(newRecord);

        fs.writeFile(hotelDB, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Data saved successfully', id });
        });
    });
});

app.put('/api/hotelData/:id', async (req, res) => {
    const id = req.params.id;
    const  {city, type, name } = req.body;

    await fs.readFile(hotelDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }

        jsonData[index] = { id, city, type, name };

        fs.writeFile(hotelDB, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Data updated successfully' });
        });
    });
});

app.delete('/api/hotelData/:id', async (req, res) => {
    const id = req.params.id;

    await fs.readFile(hotelDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }

        jsonData.splice(index, 1);

        fs.writeFile(hotelDB, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Record deleted successfully' });
        });
    });
});
// =======================================================================================================


app.get('/api/def', async (req, res) => {
    const filePath = await path.join(__dirname, 'data', 'default.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.status(500).send('Error reading file');
        return;
      }
      res.json(JSON.parse(data));
    });
  });
  
  app.post('/save', async (req, res) => {
    const userID = uuidv4().slice(0, 10);
    const dataPath = await path.join(__dirname, 'data', `${userID}.json`);
  
    await fs.writeFile(dataPath, JSON.stringify(req.body, null, 2), (err) => {
      if (err) {
        res.status(500).send('Error saving data');
        return;
      }
      res.json({ userID });
    });
  });
  
  // Endpoint to list and serve all data files
  app.get('/data', async (req, res) => {
      const dataDir = await path.join(__dirname, 'data');
      
      await fs.readdir(dataDir, (err, files) => {
        if (err) {
          res.status(500).send('Error reading data directory');
          return;
        }
    
        const fileContents = files.map((file) => {
          const filePath = path.join(dataDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          return { fileName: file, content: JSON.parse(content) };
        });
    
        res.json(fileContents);
      });
    });
    
  
    // Endpoint to list and serve all data files
  app.get('/data/:userID', async (req, res) => {
    const { userID } = req.params;
    const dataDir = await path.join(__dirname, 'data');
    const filePath = await path.join(dataDir, `${userID}.json`);
  
    await fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.status(404).json({ error: 'No data found for the provided User ID.' });
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (error) {
        console.error('Error parsing JSON data:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  });
  
  app.post('/generateDocx/:userID', async (req, res) => {
    try {
        const userID = req.params.userID;
        const jsonFilePath = path.join(__dirname, 'data', `${userID}.json`);
        const templateFilePath = path.join(__dirname, 'public', 'temp.docx');
        const outputFilePath = path.join(__dirname, 'data', `${userID}.docx`);
  
        // Check if JSON file exists
        if (!fs.existsSync(jsonFilePath)) {
            return res.status(404).send('JSON file not found.');
        }
  
        // Read the JSON data
        const jsonData = await readFileAsync(jsonFilePath, 'utf-8');
        const data = JSON.parse(jsonData);
  
        // Generate Word document with the provided data
        await generateWordDocument(jsonFilePath, templateFilePath, outputFilePath, data);
  
        // Send the generated file to the client for download
        res.download(outputFilePath, `${userID}.docx`, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            } else {
                console.log('File sent successfully.');
            }
        });
    } catch (error) {
        console.error('Error generating Word document:', error);
        res.status(500).send('Internal Server Error');
    }
  });
  
  
  async function generateWordDocument(jsonFilePath, templateFilePath, outputFilePath, data) {
    try {
      // Read JSON data
      const jsonData = await readFileAsync(jsonFilePath, 'utf-8');
      const data = JSON.parse(jsonData);
  
      // Read the Word template
      const templateData = await readFileAsync(templateFilePath, 'binary');
      const zip = new PizZip(templateData);
      const docx = new Docxtemplater().loadZip(zip);
  
      // Configure image module
      const imageOpts = {
        centered: true,
        getImage: (tagValue) => tagValue,
        getSize: () => [300, 200],
      };
      const imageModule = new ImageModule(imageOpts);
      docx.attachModule(imageModule);
  
      // Preprocess travel days data
      const travelDays = [];
      const travelTbEntries = data.travelTb.travelDay.map((day, index) => ({
        day,
        activity: data.travelTb.activity[index]
      }));
  
      Object.keys(data).forEach((key) => {
        if (key.startsWith('Day')) {
          const dayNumber = key.slice(3);
          const activity = data.travelTb.activity[parseInt(dayNumber) - 1];
  
          travelDays.push({
            day: key,
            date: data[key].date,
            description: data[key].description,
            meals: data[key].meals,
            hotel: data[key].hotel,
            activity: activity,
          });
        }
      });
  
      // Preprocess data to make accommodations template-friendly
      const accommodationsEntries = [];
      Object.keys(data).forEach((key) => {
        if (key.startsWith('Day')) {
          accommodationsEntries.push({
            city: data[key].hotelCity,
            hotel: data[key].hotel
          });
        }
      });
  
      // Set the data into the template
      await docx.setData({
        ...data,
        travelDays: travelDays,
        accommodationsEntries: accommodationsEntries,
        travelTbEntries: travelTbEntries,
      });
  
      // Render the document
      await docx.render();
  
      // Write the output file
      const buffer = await docx.getZip().generate({ type: 'nodebuffer' });
      await writeFileAsync(outputFilePath, buffer);
  
      console.log('Word document generated successfully.');
    } catch (error) {
      console.error('Error generating Word document:', error);
      throw error;
    }
  }
  //======================================================================================================

 

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});