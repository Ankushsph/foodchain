import requests
from stellar_sdk import Keypair

def create_testnet_account():
    # Generate a new random keypair
    kp = Keypair.random()
    print(f"Public Key: {kp.public_key}")
    print(f"Secret Key: {kp.secret}")

    # Fund the account using Friendbot
    print("Funding account via Friendbot...")
    response = requests.get(f"https://friendbot.stellar.org?addr={kp.public_key}")
    if response.status_code == 200:
        print("✅ Account successfully funded on Testnet!")
        print("\nACTION: Copy the Secret Key above and paste it into backend/.env")
    else:
        print("❌ Failed to fund account. Friendbot might be down.")

if __name__ == "__main__":
    create_testnet_account()
