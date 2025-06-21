#!/usr/bin/env python3
"""
UI test script to verify the full end-to-end OTP service flow.
"""

import requests
import re
from bs4 import BeautifulSoup

# --- Configuration ---
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "rahulbouri16@gmail.com"  # Use your actual email to receive the OTP
# ---

def test_full_login_flow():
    """
    Tests the complete user login flow:
    1. Submits email to get an OTP.
    2. Prompts user to enter the OTP from their email.
    3. Verifies the correct OTP.
    4. Checks for successful redirection to the dashboard.
    5. Verifies the invalid OTP error message.
    """
    print("\n🧪 Starting Full End-to-End OTP Login Test...")
    print("-" * 50)
    
    try:
        # Use a session object to maintain cookies across requests
        with requests.Session() as session:
            
            # --- Step 1: Request Login Page (GET) ---
            print(f"STEP 1: Accessing login page at {BASE_URL}/login")
            login_page_res = session.get(f"{BASE_URL}/login", timeout=10)
            login_page_res.raise_for_status()
            print("✅ Login page accessed successfully.")

            # --- Step 2: Submit Email to Request OTP (POST) ---
            print(f"\nSTEP 2: Submitting email '{TEST_EMAIL}' to request an OTP...")
            otp_request_res = session.post(f"{BASE_URL}/login", data={'email': TEST_EMAIL}, timeout=15)
            otp_request_res.raise_for_status()

            if "OTP sent successfully" not in otp_request_res.text:
                print("❌ FAILED: The page did not confirm that the OTP was sent.")
                return False
            print("✅ OTP request sent. The server is now waiting for verification.")
            
            # --- Step 3: User Interaction to Get OTP ---
            print("\nSTEP 3: Please check your email for the OTP code.")
            try:
                otp_code = input("🔑 Please enter the OTP you received: ")
                if not otp_code.strip().isdigit() or len(otp_code.strip()) != 6:
                    print("⚠️ Warning: OTP should be a 6-digit number.")
            except (KeyboardInterrupt, EOFError):
                print("\n❌ Test cancelled by user.")
                return False

            # --- Step 4: Submit Correct OTP for Verification (POST) ---
            print(f"\nSTEP 4: Submitting OTP '{otp_code}' for verification...")
            verify_data = {'email': TEST_EMAIL, 'otp': otp_code}
            
            # We expect a redirect, so we disable allow_redirects to inspect the 302 response
            verify_res = session.post(f"{BASE_URL}/verify-otp", data=verify_data, allow_redirects=False, timeout=10)

            if verify_res.status_code == 302 and verify_res.headers.get("Location") == "/dashboard":
                print("✅ SUCCESS: OTP verification successful! Received redirect to /dashboard.")
            else:
                print(f"❌ FAILED: Expected a redirect to /dashboard, but got status {verify_res.status_code}.")
                print(f"Response Body: {verify_res.text[:200]}...") # Show first 200 chars
                return False

            # --- Step 5: Follow the Redirect to the Dashboard ---
            print("\nSTEP 5: Following redirect to the dashboard page...")
            dashboard_res = session.get(f"{BASE_URL}{verify_res.headers['Location']}", timeout=10)
            dashboard_res.raise_for_status()

            # Use BeautifulSoup to parse HTML and check for content
            soup = BeautifulSoup(dashboard_res.text, 'html.parser')
            if "Welcome to Dashboard" in soup.get_text() and TEST_EMAIL in soup.get_text():
                 print(f"✅ SUCCESS: Dashboard loaded, welcome message and user email '{TEST_EMAIL}' are present.")
            else:
                print("❌ FAILED: Welcome message or user email not found on the dashboard.")
                return False

            # --- Step 6: Test Invalid OTP ---
            print("\nSTEP 6: Testing invalid OTP functionality...")
            invalid_otp = "000000"
            print(f"Submitting deliberately incorrect OTP '{invalid_otp}'...")
            
            # Note: We need to request a new OTP before we can verify again
            print("Requesting a new OTP for the invalid test...")
            session.post(f"{BASE_URL}/login", data={'email': TEST_EMAIL}, timeout=15)
            
            invalid_verify_data = {'email': TEST_EMAIL, 'otp': invalid_otp}
            invalid_verify_res = session.post(f"{BASE_URL}/verify-otp", data=invalid_verify_data, timeout=10)
            
            if "OTP credentials did not match" in invalid_verify_res.text:
                print("✅ SUCCESS: Correctly received 'OTP credentials did not match' error.")
            else:
                print("❌ FAILED: Did not receive the expected error message for an invalid OTP.")
                return False

    except requests.exceptions.RequestException as e:
        print(f"❌ An error occurred during the test: {e}")
        print("💡 Make sure the Docker containers are running: 'docker-compose up -d'")
        return False
    
    return True

if __name__ == "__main__":
    print("🎯 OTP Service End-to-End Test")
    print("=" * 50)
    
    success = test_full_login_flow()
    
    print("\n" + "="*50)
    if success:
        print("🎉🎉🎉 All End-to-End tests passed successfully! 🎉🎉🎉")
    else:
        print("❌ One or more tests failed. Please check the logs above.")
        exit(1) 