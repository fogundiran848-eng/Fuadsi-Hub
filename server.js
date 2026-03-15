const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000; 

// Serve static files from the root directory and assets folder
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets'))); 

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
}); 

app.listen(PORT, () => {
    console.log(`FUADSI Hub running at http://localhost:${PORT}`);
});
