# 🌟 Stellar Blockchain Integration

Your FoodChain AI is now connected to the **Stellar Testnet** blockchain for immutable data storage!

## ✅ What's Configured

- **Stellar Secret Key:** Loaded from `.env` file
- **Network:** Stellar Testnet
- **Horizon Server:** https://horizon-testnet.stellar.org
- **Transaction Type:** Payment with memo (data hash)

## 🔐 Your Stellar Account

**Public Key:** (Derived from your secret key)
**Secret Key:** Stored securely in `backend/.env`

⚠️ **Security Note:** Never commit `.env` to Git! It's already in `.gitignore`.

## 📊 How It Works

1. **Data Collection** - Sensor readings (TDS, Color, pH, Turbidity)
2. **AI Analysis** - Product-specific quality assessment
3. **Hash Generation** - SHA256 hash of the analysis data
4. **Blockchain Storage** - Hash stored on Stellar with memo
5. **Immutable Record** - Transaction hash returned as proof

## 🧪 Example Transaction

```json
{
  "batch_id": "REAL-STELLAR-001",
  "status": "safe",
  "blockchain_hash": "e4ca57b5b72b2b4e4839fa347d9cb4e8197d06a6fa6f8c5228f4b35f47ac85f6"
}
```

## 🔍 Verify Transactions

You can verify any transaction on Stellar:

1. Go to: https://stellar.expert/explorer/testnet
2. Search for your transaction hash
3. View the memo containing your data hash

## 💰 Testnet XLM

Your account needs testnet XLM for transactions. Get free testnet XLM:
- https://laboratory.stellar.org/#account-creator

## 📝 Transaction Details

Each analysis creates a Stellar transaction with:
- **Amount:** 0.00001 XLM (minimal)
- **Fee:** 100 stroops (0.00001 XLM)
- **Memo:** First 28 characters of data hash
- **Destination:** Self (your account)

## 🚀 Production Deployment

For production:
1. Create a mainnet Stellar account
2. Fund it with real XLM
3. Update `.env` with mainnet secret key
4. Change network to `Network.PUBLIC_NETWORK_PASSPHRASE`

## 🔄 Switching Back to Simulation

To disable blockchain and use simulation mode:
1. Remove or comment out `STELLAR_SECRET_KEY` in `.env`
2. Restart the backend
3. Hashes will be prefixed with `sim_`

## 📊 Benefits

✅ **Immutability** - Data cannot be altered once recorded
✅ **Transparency** - Anyone can verify transactions
✅ **Traceability** - Complete audit trail
✅ **Decentralization** - No single point of failure
✅ **Cost-Effective** - Minimal transaction fees

---

*Your FoodChain AI is now blockchain-powered! 🎉*
