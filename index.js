const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const dataFilePath = path.join(__dirname, 'data', 'data.json');

// Create data directory if not exists
if (!fs.existsSync(path.dirname(dataFilePath))) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
}

app.get('/api/data', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }
        res.status(200).json(JSON.parse(data));
    });
});

app.post('/api/data', (req, res) => {
    const { activity, description, price } = req.body;
    const id = uuidv4();
    const newRecord = { id, activity, description, price };

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        const jsonData = JSON.parse(data);
        jsonData.push(newRecord);

        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Data saved successfully', id });
        });
    });
});

app.put('/api/data/:id', (req, res) => {
    const id = req.params.id;
    const { activity, description, price } = req.body;

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }

        jsonData[index] = { id, activity, description, price };

        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Data updated successfully' });
        });
    });
});

app.delete('/api/data/:id', (req, res) => {
    const id = req.params.id;

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }

        jsonData.splice(index, 1);

        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to data file' });
            }
            res.status(200).json({ message: 'Record deleted successfully' });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});