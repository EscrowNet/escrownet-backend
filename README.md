# EscrowNet - Decentralized Escrow Platform on Starknet

## Overview
EscrowNet is a decentralized application (dApp) and API that enables secure escrow payments on the Starknet network. It provides a trustless environment for conducting transactions between parties by holding assets in escrow until predefined conditions are met.

## Features
- Secure escrow smart contracts on Starknet
- User-friendly web interface for managing escrow transactions
- RESTful API for integration with other applications
- Support for multiple asset types
- Real-time transaction status monitoring
- Automated release of funds upon condition fulfillment
- Multi-signature security for large transactions

## Prerequisites
- Node.js (v16.0 or higher)
- Yarn or npm package manager
- Starknet wallet (e.g., ArgentX, Braavos)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/<yourusername>/escrownet.git
cd escrownet
```


2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env.local

Edit .env.local with your configuration details.
```
## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Smart Contract Integration

The dApp interacts with Starknet smart contracts.

Detailed instructions can be found in the [Escrownet-contracts](https://github.com/EscrowNet/escrownet-contracts).

## API Documentation

The EscrowNet API provides endpoints for:
- Creating escrow transactions
- Monitoring transaction status
- Managing conditions and releases
- User authentication

For detailed API documentation, refer to [Escrownet-backend](https://github.com/EscrowNet/escrownet-backend)

## Security Considerations

- Audited smart contracts
- Multi-signature requirement for high-value transactions
- Time-locked escrow releases
- Emergency pause functionality
- Regular security updates

## Testing

Run the test suite:
```bash
npm run test
# or
yarn test
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

Please read our [Contributing Guidelines](https://github.com/EscrowNet/escrownet-dapp/blob/main/CONTRIBUTION.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Issues: [GitHub Issues](https://github.com/EscrowNet/escrownet-dapp/issues)
- Telegram: [Join our community](https://t.me/+Ihee-Tw-ioxiMDY8)

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Starknet](https://starknet.io)

---


## Project Status

Current Version: 1.0.0
Status: Beta Release

This project is actively maintained. For the latest updates, follow our [changelog](CHANGELOG.md).
