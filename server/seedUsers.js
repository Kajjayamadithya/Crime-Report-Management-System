const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const uri = process.env.MONGO_URI || 'mongodb+srv://tarunadithyakajjayam:ghO2IXuDWp0IPSS0@cluster0.k1rjgte.mongodb.net/Crime-report?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to DB. Seeding users...');

    // 1. Seed Admin
    const adminExists = await User.findOne({ email: 'tarunadithya2006@gmail.com' });
    if (!adminExists) {
        await User.create({
            name: 'Tarun Adithya',
            email: 'tarunadithya2006@gmail.com',
            password: 'Adithya29806',
            phone: '9999999999',
            role: 'admin'
        });
        console.log('✅ Admin account seeded: tarunadithya2006@gmail.com');
    }

    console.log('--- Initial Admin Seeding Complete ---');
    process.exit(0);
  })
  .catch(err => {
      console.error('Error seeding DB:', err);
      process.exit(1);
  });
