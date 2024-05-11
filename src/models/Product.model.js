// models/Product.js

import mongoose from 'mongoose';
import { generatePresignedUrl } from '../storage/cloudflareStorage.js';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true
  },
  description: String,
  price: {
    type: Number,
    // required: true
  },
  imageUrl: String
});



const Product = mongoose.model('Product', productSchema);

export default Product;
