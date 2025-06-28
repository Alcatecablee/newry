# NeuroLint

Advanced code analysis and transformation platform with intelligent multi-layer analysis. Currently in beta with smart architecture.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

#### Required for Authentication

- `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key

#### Optional for Database (uses in-memory storage if not set)

- `DATABASE_URL`: PostgreSQL connection string

#### Optional for Payments

- `PAYPAL_CLIENT_ID`: PayPal client ID
- `PAYPAL_CLIENT_SECRET`: PayPal client secret

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5000

## Setting Up Clerk Authentication

1. **Create a Clerk Account**
   - Go to [clerk.com](https://clerk.com)
   - Create a new application
   - Choose "Next.js" as your framework

2. **Get Your Keys**
   - In your Clerk dashboard, go to "API Keys"
   - Copy your "Publishable key" and "Secret key"

3. **Add to Environment**

   ```bash
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   ```

4. **Restart the Server**
   ```bash
   npm run dev
   ```

Authentication will now be enabled!

## Setting Up Local Database (Optional)

By default, the app uses in-memory storage. For persistent data:

### 1. Install PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database

```bash
createdb neurolint
```

### 3. Add to Environment

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/neurolint
```

### 4. Push Database Schema

```bash
npm run db:push
```

## Features

- **Multi-layer Analysis**: 6 intelligent layers for comprehensive code analysis
- **Real-time Feedback**: Instant code quality assessment
- **CLI Tool**: Command-line interface for CI/CD integration
- **VS Code Extension**: Real-time analysis in your editor
- **REST API**: Integrate with your existing tools
- **Team Collaboration**: Manage projects and team members

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema

### Project Structure

```
├── client/                 # Frontend React application
│   ���── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express server
│   ├── routes/             # API routes
│   └── db.ts              # Database configuration
├── shared/                 # Shared types and schemas
└── cli/                   # Command-line tool
```

## API Documentation

Once running, API documentation is available at:

- http://localhost:5000/api/docs

## Troubleshooting

### Authentication Issues

- Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set correctly
- Check that the key starts with `pk_test_` or `pk_live_`
- Restart the development server after adding environment variables

### Database Issues

- Ensure PostgreSQL is running
- Check the `DATABASE_URL` format
- Run `npm run db:push` to create tables

### Build Issues

- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run check`

## Support

For questions and support:

- GitHub Issues: [Report a bug or request a feature]
- Documentation: [View our docs]
- Community: [Join our Discord]

## License

MIT License - see LICENSE file for details.
