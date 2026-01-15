// scripts/seedOrders.ts
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Pet } from '../models/Pet';
import { Tag } from '../models/Tag';
import { Product } from '../models/Product';
import dotenv from 'dotenv';

dotenv.config();

async function seedOrders() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || '';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    // Get all products
    const products = await Product.find({ isActive: true });
    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users and ${products.length} products`);

    // Clear existing orders (optional - comment out if you want to keep existing orders)
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Predefined shipping addresses for variety
    const shippingAddresses = [
      {
        street: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      {
        street: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA'
      },
      {
        street: '789 Pine Road',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      {
        street: '321 Elm Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      {
        street: '555 Maple Drive',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        country: 'USA'
      },
      {
        street: '777 Cedar Lane',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      }
    ];

    const orderStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['credit_card', 'paypal', 'apple_pay', 'google_pay'];

    // Create orders for each user
    for (const user of users) {
      console.log(`\nCreating orders for user: ${user.email}`);

      // Get user's pets and tags
      const userPets = await Pet.find({ userId: user._id });
      const userTags = await Tag.find({ userId: user._id });

      // Create 2-4 random orders per user
      const numOrders = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numOrders; i++) {
        // Randomly select 1-3 products for this order
        const numProducts = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let subtotal = 0;

        for (let j = 0; j < numProducts; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 items
          
          const itemSubtotal = product.price * quantity;
          subtotal += itemSubtotal;

          // Select random size and color if available
          const selectedSize = product.availableSizes && product.availableSizes.length > 0
            ? product.availableSizes[Math.floor(Math.random() * product.availableSizes.length)]
            : undefined;

          const selectedColor = product.availableColors && product.availableColors.length > 0
            ? product.availableColors[Math.floor(Math.random() * product.availableColors.length)].name
            : undefined;

          orderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.images && product.images.length > 0 ? product.images[0].url : undefined,
            sku: product.sku,
            size: selectedSize,
            color: selectedColor,
          });
        }

        // Calculate shipping and tax
        const shipping = subtotal > 50 ? 0 : 10.00;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        // Random status
        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        
        // Random dates based on status
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 60)); // Last 60 days

        const orderData: any = {
          userId: user._id,
          items: orderItems,
          status: status,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          shipping: parseFloat(shipping.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          currency: 'USD',
          shippingAddress: shippingAddresses[Math.floor(Math.random() * shippingAddresses.length)],
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          createdAt: createdDate,
          // Optionally assign a pet if available
          petId: userPets.length > 0 && Math.random() > 0.4 
            ? userPets[Math.floor(Math.random() * userPets.length)]._id 
            : undefined,
          // Randomly assign a tag if available
          tagId: userTags.length > 0 && Math.random() > 0.5 
            ? userTags[Math.floor(Math.random() * userTags.length)]._id 
            : undefined,
        };

        // Add status-specific fields
        if (status === 'paid' || status === 'processing' || status === 'shipped' || status === 'delivered') {
          orderData.paidAt = new Date(createdDate.getTime() + 1000 * 60 * 60 * 2); // 2 hours after creation
          orderData.squarePaymentId = `sq_pay_${Math.random().toString(36).substr(2, 9)}`;
          orderData.squareOrderId = `sq_ord_${Math.random().toString(36).substr(2, 9)}`;
        }

        if (status === 'shipped' || status === 'delivered') {
          orderData.shippedAt = new Date(createdDate.getTime() + 1000 * 60 * 60 * 48); // 2 days after
          orderData.trackingNumber = `TRK${Math.floor(Math.random() * 1000000000)}`;
        }

        if (status === 'delivered') {
          orderData.deliveredAt = new Date(createdDate.getTime() + 1000 * 60 * 60 * 120); // 5 days after
        }

        if (status === 'cancelled') {
          orderData.cancelledAt = new Date(createdDate.getTime() + 1000 * 60 * 60 * 12); // 12 hours after
        }

        const order = await Order.create(orderData);
        
        console.log(`  Created order: ${order._id}`);
        console.log(`    Status: ${order.status}`);
        console.log(`    Items: ${order.items.length}`);
        order.items.forEach(item => {
          let itemDetails = `      - ${item.name} x${item.quantity} (${item.price})`;
          if (item.size) itemDetails += ` - Size: ${item.size}`;
          if (item.color) itemDetails += ` - Color: ${item.color}`;
          console.log(itemDetails);
        });
        console.log(`    Subtotal: $${order.subtotal.toFixed(2)}`);
        console.log(`    Tax: $${order.tax.toFixed(2)}`);
        console.log(`    Shipping: $${order.shipping.toFixed(2)}`);
        console.log(`    Total: $${order.total.toFixed(2)}`);
        if (order.petId) console.log(`    Pet: ${order.petId}`);
        if (order.trackingNumber) console.log(`    Tracking: ${order.trackingNumber}`);
      }
    }

    console.log('\n✅ Orders seeded successfully!');
    
    // Show summary
    const totalOrders = await Order.countDocuments();
    const ordersWithPets = await Order.countDocuments({ petId: { $exists: true, $ne: null } });
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log(`\nTotal orders created: ${totalOrders}`);
    console.log(`Orders with pets: ${ordersWithPets}`);
    console.log(`Orders without pets: ${totalOrders - ordersWithPets}`);
    console.log('\nOrders by status:');
    ordersByStatus.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count}`);
    });

    // Calculate total revenue
    const revenue = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    if (revenue.length > 0) {
      console.log(`\nTotal Revenue (paid orders): $${revenue[0].total.toFixed(2)}`);
    }

    // Show product statistics
    const productStats = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    console.log('\nTop 5 Products by Quantity Sold:');
    productStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.totalQuantity} units ($${stat.totalRevenue.toFixed(2)})`);
    });

  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedOrders();