
import razorpay
import os

# This reads the keys from your .env file
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

# Check if we're in test mode (development)
IS_TEST_MODE = os.getenv("RAZORPAY_TEST_MODE", "false").lower() == "true"

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Test payment configuration
TEST_CARDS = {
    "success": {
        "card_number": "4111111111111111",
        "expiry": "12/25",
        "cvv": "123",
        "otp": "123456",
        "name": "Test Success Card"
    },
    "failure": {
        "card_number": "4000000000000002",
        "expiry": "12/25", 
        "cvv": "123",
        "otp": "123456",
        "name": "Test Failure Card"
    }
}

def get_test_payment_info():
    """Get test payment card information for development"""
    if IS_TEST_MODE:
        return TEST_CARDS
    return None

def is_test_mode():
    """Check if we're in test mode"""
    return IS_TEST_MODE
