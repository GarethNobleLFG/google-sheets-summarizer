const app = require('./src/app');

if (process.env.NODE_ENV !== 'production') {    
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}!`);
    });
}

module.exports = app;