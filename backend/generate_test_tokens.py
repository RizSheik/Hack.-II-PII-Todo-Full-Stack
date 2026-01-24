#!/usr/bin/env python3
"""
Generate JWT tokens for testing the Todo Backend API.
"""
import jwt
from datetime import datetime, timedelta

# JWT secret from .env
JWT_SECRET = "your-super-secret-jwt-key-min-32-characters-REPLACE-THIS"

# Generate token for user 123
payload_123 = {
    "user_id": 123,
    "sub": "123",
    "exp": datetime.utcnow() + timedelta(hours=24)
}
token_123 = jwt.encode(payload_123, JWT_SECRET, algorithm="HS256")

# Generate token for user 456
payload_456 = {
    "user_id": 456,
    "sub": "456",
    "exp": datetime.utcnow() + timedelta(hours=24)
}
token_456 = jwt.encode(payload_456, JWT_SECRET, algorithm="HS256")

print("=" * 80)
print("JWT TOKENS FOR TESTING")
print("=" * 80)
print()
print("User 123 Token:")
print(token_123)
print()
print("User 456 Token:")
print(token_456)
print()
print("=" * 80)
print("EXAMPLE AUTHORIZATION HEADERS")
print("=" * 80)
print()
print("For user 123:")
print(f'Authorization: Bearer {token_123}')
print()
print("For user 456:")
print(f'Authorization: Bearer {token_456}')
print()
print("=" * 80)
print("CURL EXAMPLES")
print("=" * 80)
print()
print("# Test with user 123:")
print(f'curl -H "Authorization: Bearer {token_123}" http://localhost:8000/api/users/123/todos')
print()
print("# Test with user 456:")
print(f'curl -H "Authorization: Bearer {token_456}" http://localhost:8000/api/users/456/todos')
print()
