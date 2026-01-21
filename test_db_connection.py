import requests

try:
    response = requests.get('http://localhost:8000/health_check')
    print('Status:', response.status_code)
    if response.status_code == 200:
        data = response.json()
        print('Health check successful:', data)
        if data.get("checks", {}).get("database", {}).get("status") == "up":
            print("✅ Database connection is confirmed.")
        else:
            print("❌ Database connection check failed in response.")
    else:
        print('Error:', response.text)
except requests.exceptions.ConnectionError as e:
    print('Connection error:', e)
except Exception as e:
    print('An error occurred:', e)
