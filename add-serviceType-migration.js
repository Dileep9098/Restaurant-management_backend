import mongoose from 'mongoose';
import Restaurent from './models/restaurentModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pop_software');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const addServiceTypeToExistingRestaurants = async () => {
  try {
    console.log('🔄 Starting serviceType migration...');
    
    // Find all restaurants that don't have serviceType
    const restaurantsWithoutServiceType = await Restaurent.find({ 
      serviceType: { $exists: false } 
    });

    console.log(`📊 Found ${restaurantsWithoutServiceType.length} restaurants without serviceType`);

    if (restaurantsWithoutServiceType.length > 0) {
      // Update all restaurants to have default serviceType "dine_in"
      const updateResult = await Restaurent.updateMany(
        { serviceType: { $exists: false } },
        { 
          $set: { 
            serviceType: "dine_in" 
          } 
        }
      );

      console.log(`✅ Updated ${updateResult.modifiedCount} restaurants with serviceType "dine_in"`);
    } else {
      console.log('ℹ️ All restaurants already have serviceType field');
    }

    // Verify the update
    const allRestaurants = await Restaurent.find({});
    const withServiceType = allRestaurants.filter(r => r.serviceType);
    const withoutServiceType = allRestaurants.filter(r => !r.serviceType);

    console.log(`📈 Migration complete:`);
    console.log(`   - Total restaurants: ${allRestaurants.length}`);
    console.log(`   - With serviceType: ${withServiceType.length}`);
    console.log(`   - Without serviceType: ${withoutServiceType.length}`);

    if (withoutServiceType.length === 0) {
      console.log('🎉 Migration successful! All restaurants now have serviceType field.');
    } else {
      console.log('⚠️ Some restaurants still missing serviceType field');
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};

// Run the migration
const runMigration = async () => {
  await connectDB();
  await addServiceTypeToExistingRestaurants();
  
  // Close connection
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed');
  process.exit(0);
};

// Execute migration
runMigration();
