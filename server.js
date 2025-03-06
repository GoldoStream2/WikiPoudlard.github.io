const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static('./'));

// Endpoint to list files in the Poudlard folder
app.get('/Poudlard', async (req, res) => {
    try {
        const files = await fs.readdir(path.join(__dirname, 'Poudlard'));
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Error reading directory' });
    }
});

// Endpoint to get file content
app.get('/Poudlard/:filename', async (req, res) => {
    try {
        const content = await fs.readFile(
            path.join(__dirname, 'Poudlard', req.params.filename),
            'utf-8'
        );
        res.send(content);
    } catch (error) {
        res.status(500).json({ error: 'Error reading file' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});