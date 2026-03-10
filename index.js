import app from './src/app.js';  

if (process.env.NODE_ENV !== 'production') {    
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}!`);
    });
}

export default app; 