import mongoose from 'mongoose';

const connectDB = async() =>{
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`MongoDB Connected successfully`);
    } catch (error){
        console.log(`MongoDB Connection error`, error);
    }
}

export default connectDB