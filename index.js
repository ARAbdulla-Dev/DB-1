const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.get('/activityData', (req, res) => {
    res.sendFile(`${__dirname}/public/activityData.html`);
});

app.get('/cityData', (req, res) => {
    res.sendFile(`${__dirname}/public/cityData.html`);
});


const activityDB = path.join(__dirname, 'data', 'activityData.json');
const cityDB = path.join(__dirname, 'data', 'cityData.json');

// =======================================================================================================
// Create data directory if not exists
if (!fs.existsSync(path.dirname(activityDB))) {
    fs.mkdirSync(path.dirname(activityDB), { recursive: true });
}

app.get('/api/activityData', (req, res) => {
    fs.readFile(activityDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }
        res.status(200).json(JSON.parse(data));
    });
});

app.post('/api/activityData', (req, res) => {
    const { activity, description, price } = req.body;
    const id = uuidv4();
    const newRecord = { id, activity, description, price };

    fs.readFile(activityDB, 'utf8', (err, data) => {
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

app.put('/api/activityData/:id', (req, res) => {
    const id = req.params.id;
    const { activity, description, price } = req.body;

    fs.readFile(activityDB, 'utf8', (err, data) => {
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

app.delete('/api/activityData/:id', (req, res) => {
    const id = req.params.id;

    fs.readFile(activityDB, 'utf8', (err, data) => {
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
// =======================================================================================================

// Create data directory if not exists
if (!fs.existsSync(path.dirname(cityDB))) {
    fs.mkdirSync(path.dirname(cityDB), { recursive: true });
}

app.get('/api/cityData', (req, res) => {
    fs.readFile(cityDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }
        res.status(200).json(JSON.parse(data));
    });
});

app.post('/api/cityData', (req, res) => {
    const { city, places } = req.body;
    const id = uuidv4();
    const newRecord = { id, city, places };

    fs.readFile(cityDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        const jsonData = JSON.parse(data);
        jsonData.push(newRecord);

        fs.writeFile(cityDB, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Data saved successfully', id });
        });
    });
});

app.put('/api/cityData/:id', (req, res) => {
    const id = req.params.id;
    const { city, places } = req.body;

    fs.readFile(cityDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }

        jsonData[index] = { id, city, places };

        fs.writeFile(cityDB, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Data updated successfully' });
        });
    });
});

app.delete('/api/cityData/:id', (req, res) => {
    const id = req.params.id;

    fs.readFile(cityDB, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }

        jsonData.splice(index, 1);

        fs.writeFile(cityDB, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Record deleted successfully' });
        });
    });
});

// =======================================================================================================

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});