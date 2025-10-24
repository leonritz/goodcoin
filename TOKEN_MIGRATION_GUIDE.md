# Goodcoin Token Migration Guide

This guide explains how to migrate from in-game coins (database) to actual on-chain ERC-20 tokens.

## Current System (Phase 1) ✅ Implemented

- **Coins**: Stored as numbers in database (Vercel KV)
- **Purchases**: Users pay ETH/USDC → receive database credits
- **Transactions**: Instant, no gas fees, centralized
- **Benefits**: Fast, cheap, easy to test

## Future System (Phase 2) - On-Chain Tokens

- **Token**: ERC-20 smart contract on Base
- **Purchases**: Users pay ETH/USDC → receive actual tokens
- **Transactions**: On-chain, decentralized, verifiable
- **Benefits**: True ownership, composable, trustless

---

## Migration Steps

### Step 1: Deploy ERC-20 Token Contract

Create a Goodcoin token contract:

```solidity
// contracts/GoodcoinToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GoodcoinToken is ERC20, Ownable {
    constructor() ERC20("Goodcoin", "GOOD") Ownable(msg.sender) {
        // Mint initial supply to treasury
        _mint(msg.sender, 1_000_000_000 * 10**decimals()); // 1 billion tokens
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

**Deploy to Base:**
```bash
forge create --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  src/GoodcoinToken.sol:GoodcoinToken
```

### Step 2: Create Token Sale Contract

Allow users to buy tokens with ETH/USDC:

```solidity
// contracts/GoodcoinSale.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GoodcoinSale is Ownable {
    IERC20 public goodcoinToken;
    IERC20 public usdc;
    
    uint256 public constant TOKENS_PER_ETH = 3000; // 0.001 ETH = 100 tokens
    uint256 public constant TOKENS_PER_USDC = 33; // $3 = 100 tokens
    
    address public treasury;
    
    constructor(address _token, address _usdc, address _treasury) Ownable(msg.sender) {
        goodcoinToken = IERC20(_token);
        usdc = IERC20(_usdc);
        treasury = _treasury;
    }
    
    function buyWithETH() external payable {
        require(msg.value > 0, "Must send ETH");
        uint256 tokenAmount = (msg.value * TOKENS_PER_ETH) / 1 ether;
        
        // Transfer ETH to treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "ETH transfer failed");
        
        // Transfer tokens to buyer
        require(goodcoinToken.transfer(msg.sender, tokenAmount), "Token transfer failed");
    }
    
    function buyWithUSDC(uint256 usdcAmount) external {
        require(usdcAmount > 0, "Must send USDC");
        uint256 tokenAmount = (usdcAmount * TOKENS_PER_USDC) / 1e6;
        
        // Transfer USDC from buyer to treasury
        require(usdc.transferFrom(msg.sender, treasury, usdcAmount), "USDC transfer failed");
        
        // Transfer tokens to buyer
        require(goodcoinToken.transfer(msg.sender, tokenAmount), "Token transfer failed");
    }
}
```

### Step 3: Update Frontend Purchase Flow

Replace `PurchaseModal.tsx` to interact with smart contracts:

```typescript
// components/PurchaseModal.tsx
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

const GOODCOIN_SALE_ADDRESS = '0x...'; // Your deployed contract

export default function PurchaseModal({ ... }) {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handlePurchase = async () => {
    // Call smart contract instead of API
    writeContract({
      address: GOODCOIN_SALE_ADDRESS,
      abi: GoodcoinSaleABI,
      functionName: 'buyWithETH',
      value: parseEther(selectedPackage.priceETH),
    });
  };
}
```

### Step 4: Migrate Existing Balances

Create a migration contract to convert database balances to tokens:

```solidity
// contracts/GoodcoinMigration.sol
contract GoodcoinMigration is Ownable {
    IERC20 public goodcoinToken;
    mapping(address => bool) public hasMigrated;
    
    function migrateBalance(address user, uint256 amount, bytes signature) external {
        require(!hasMigrated[user], "Already migrated");
        require(verifySignature(user, amount, signature), "Invalid signature");
        
        hasMigrated[user] = true;
        require(goodcoinToken.transfer(user, amount), "Transfer failed");
    }
    
    // Verify signature from backend to prevent fraud
    function verifySignature(...) internal view returns (bool) { ... }
}
```

Backend API to sign migrations:

```typescript
// app/api/migrate/route.ts
export async function POST(request: NextRequest) {
  const { userAddress, fid } = await request.json();
  
  // Get user's database balance
  const user = await db.get(`users:${fid}`);
  const balance = user.balance;
  
  // Sign the balance with server private key
  const signature = await signMessage(userAddress, balance);
  
  return NextResponse.json({
    balance,
    signature,
  });
}
```

### Step 5: Update Transaction System

Replace database transactions with on-chain transfers:

```typescript
// controller/TransactionController.ts
async createDonation(fromFid, toFid, amount, postId) {
  // Get wallet addresses from fids
  const fromAddress = await getAddressFromFid(fromFid);
  const toAddress = await getAddressFromFid(toFid);
  
  // Use wagmi to transfer tokens
  const hash = await writeContract({
    address: GOODCOIN_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [toAddress, amount],
  });
  
  // Wait for confirmation
  await waitForTransaction({ hash });
  
  // Record in database for UI
  await db.set(`transactions:${hash}`, { ... });
}
```

### Step 6: Read Balances from Chain

Update balance checks to read from smart contract:

```typescript
// controller/UserController.ts
import { readContract } from 'wagmi/actions';

async getUserBalance(fid: string): Promise<number> {
  const address = await getAddressFromFid(fid);
  
  const balance = await readContract({
    address: GOODCOIN_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
  
  return Number(balance);
}
```

---

## Migration Timeline (Recommended)

### Phase 1: Current (Database) ✅
- **Duration**: 2-4 weeks
- **Goal**: Launch MVP, gather users, test mechanics
- **Status**: Implemented

### Phase 1.5: Hybrid (Optional)
- **Duration**: 2 weeks
- **Description**: Deploy token but keep database for UI speed
- **Goal**: Test contract before full migration

### Phase 2: Full On-Chain
- **Duration**: 1-2 weeks migration
- **Description**: 
  1. Deploy contracts
  2. Announce migration period (1 week)
  3. Users claim on-chain tokens for database balances
  4. Switch to on-chain only
- **Goal**: Full decentralization

---

## Key Considerations

### Gas Costs
- **Database**: Free (centralized)
- **On-chain**: ~$0.01-0.05 per transaction on Base
- **Solution**: Consider gasless transactions via relayer for small donations

### Speed
- **Database**: Instant
- **On-chain**: 2-5 seconds per transaction
- **Solution**: Show optimistic UI updates

### Reversibility
- **Database**: Can reverse fraudulent transactions
- **On-chain**: Immutable, irreversible
- **Solution**: Add dispute resolution period

### Storage
- **Database**: Can store rich metadata (posts, comments)
- **On-chain**: Expensive to store data
- **Solution**: Keep metadata in database, only token balances on-chain

---

## Contract Addresses (To be deployed)

```typescript
// lib/contracts.ts
export const CONTRACTS = {
  GOODCOIN_TOKEN: '0x...', // ERC-20 token
  GOODCOIN_SALE: '0x...', // Sale contract
  GOODCOIN_MIGRATION: '0x...', // Migration contract
};

export const GOODCOIN_TOKEN_ABI = [ ... ];
export const GOODCOIN_SALE_ABI = [ ... ];
```

---

## Testing Checklist

Before going live with on-chain tokens:

- [ ] Deploy contracts to Base Sepolia (testnet)
- [ ] Test purchase flow with testnet ETH
- [ ] Test token transfers between users
- [ ] Test balance reading from contract
- [ ] Audit smart contracts (recommended)
- [ ] Test migration flow
- [ ] Load test with multiple users
- [ ] Verify on BaseScan
- [ ] Create multisig for contract ownership

---

## Advantages of On-Chain Migration

✅ **True Ownership**: Users actually own their tokens
✅ **Composability**: Tokens can be used in other DeFi apps
✅ **Transparency**: All transactions publicly verifiable
✅ **Decentralization**: No single point of failure
✅ **Trading**: Users can trade tokens on DEXs
✅ **Trust**: Smart contracts enforce rules

---

## Recommended: Gradual Rollout

1. **Week 1-4**: Database only (current system)
2. **Week 5**: Deploy contracts to testnet, internal testing
3. **Week 6**: Deploy to mainnet, announce migration
4. **Week 7**: Open migration, users claim tokens
5. **Week 8**: Full on-chain, database as cache only

---

## Cost Estimate

- **Smart Contract Development**: 1-2 weeks
- **Testing & Auditing**: 1 week
- **Deployment**: ~$100 in gas fees
- **Migration**: Minimal (users pay gas)
- **Total**: ~2-3 weeks development time

---

## Need Help?

The transition from database to on-chain is actually quite straightforward:
1. Deploy ERC-20 token
2. Update purchase flow to call contracts
3. Migrate existing balances
4. Switch balance reads to chain

The current architecture is already designed to make this easy! 🚀

