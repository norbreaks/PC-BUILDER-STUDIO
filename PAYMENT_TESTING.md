# Razorpay Test Payment Gateway Documentation

## Overview
This document explains how to use the enhanced Razorpay test payment system for your PC Builder application.

## Environment Setup

### 1. Environment Variables
Add these variables to your `.env` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_TEST_MODE=true

# Frontend Environment (in .env.local or similar)
VITE_NODE_ENV=development
```

### 2. Test Keys Setup
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings > API Keys
3. Copy your Test Key ID and Key Secret
4. Add them to your `.env` file

## Test Payment Cards

### Successful Payment
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: 12/25
- **CVV**: 123
- **OTP**: 123456
- **Name**: Test User

### Failed Payment
- **Card Number**: 4000 0000 0000 0002
- **Expiry**: 12/25
- **CVV**: 123
- **OTP**: 123456
- **Name**: Test User

### Additional Test Cards
- **Card Number**: 4111 1111 1111 1111 → Success
- **Card Number**: 4000 0000 0000 0002 → Failed (Insufficient funds)
- **Card Number**: 4000 0000 0000 9995 → Failed (Incorrect CVV)

## Testing the Payment Flow

### 1. Start Your Application
```bash
# Backend
cd /mnt/Data/testingdata2.0
python main.py

# Frontend (in another terminal)
cd pc-builder-frontend
npm run dev
```

### 2. Create a Test Build
1. Register/Login to the application
2. Create a new PC build
3. Add components to reach a total amount

### 3. Test Payment Process
1. Navigate to your build details
2. Click "Pay Securely" button
3. Use test card details from above
4. Complete OTP verification with 123456
5. Verify success page displays correctly

### 4. Test Error Scenarios
1. **Failed Payment**: Use 4000 0000 0000 0002
2. **Payment Cancellation**: Close payment modal
3. **Network Error**: Disconnect internet during payment

## Enhanced Features

### 1. Improved Success Page
- **Payment Details**: Shows order ID, payment ID, amount
- **Build Information**: Displays build name and components
- **Next Steps**: Clear information about order processing
- **Support Links**: Contact information for assistance

### 2. Enhanced Checkout Component
- **Better Error Handling**: Detailed error messages
- **Loading States**: Visual feedback during payment processing
- **Security Indicators**: Shows secure payment messaging
- **Test Card Info**: Development mode shows test card details

### 3. Backend Improvements
- **Test Mode Detection**: Automatically detects test environment
- **Enhanced Logging**: Better debugging for test payments
- **Signature Verification**: Proper HMAC signature validation

## Development vs Production

### Test Mode (Development)
- Uses Razorpay test keys
- No real money transactions
- Test cards work
- Enhanced debugging enabled

### Production Mode
- Uses Razorpay live keys
- Real money transactions
- Actual card processing
- Minimal logging

## Troubleshooting

### Common Issues

1. **Payment Modal Not Opening**
   - Check if Razorpay SDK is loaded
   - Verify API keys are correct
   - Check browser console for errors

2. **Payment Verification Failing**
   - Ensure backend is running
   - Check API endpoint URLs
   - Verify JWT token is valid

3. **Success Page Not Loading**
   - Check if payment success route exists
   - Verify buildId parameter is passed
   - Check browser console for errors

### Debug Mode
Enable debug logging by setting:
```bash
RAZORPAY_TEST_MODE=true
```

## Security Considerations

### For Development
- Use only test keys
- Test cards for all testing
- Never commit real API keys

### For Production
- Use live API keys
- Enable HTTPS
- Proper error handling
- Input validation

## API Endpoints

### Create Order
```bash
POST /payment/create-order/{build_id}
Authorization: Bearer {jwt_token}
```

### Verify Payment
```bash
POST /payment/verify-payment
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "razorpay_payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx", 
  "razorpay_signature": "signature",
  "build_id": "build_id"
}
```

## Success Page URL Format
```
/payment-success?buildId={build_id}&payment_id={payment_id}&order_id={order_id}
```

## Next Steps for Production

1. **Replace Test Keys**: Update with live Razorpay keys
2. **SSL Certificate**: Ensure HTTPS is enabled
3. **Error Monitoring**: Set up proper error tracking
4. **Email Integration**: Add order confirmation emails
5. **Webhook Handling**: Implement Razorpay webhooks for better reliability

## Support

For issues related to:
- **Razorpay Integration**: Check [Razorpay Docs](https://razorpay.com/docs/)
- **Application Issues**: Check browser console and backend logs
- **Test Payments**: Refer to this documentation

## Testing Checklist

- [ ] Environment variables configured
- [ ] Test API keys set up
- [ ] Successful payment flow works
- [ ] Failed payment handling works
- [ ] Payment cancellation works
- [ ] Success page displays correctly
- [ ] Error messages are clear
- [ ] Build status updates correctly
- [ ] Test cards display in development mode
- [ ] No console errors during payment flow
