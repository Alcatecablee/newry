# NeuroLint Enterprise CLI Testing Guide

This guide explains how to test all enterprise CLI features safely and comprehensively.

## 🚀 Quick Start Testing

### 1. Build the CLI

```bash
cd cli/
npm install
npm run build
```

### 2. Run Automated Tests

```bash
# Run comprehensive test suite
node test-enterprise.js
```

### 3. Start Mock Server (Optional)

```bash
# In a separate terminal
node dev-server-mock.js
```

## 🧪 Test Categories

### **Basic CLI Tests**

- ✅ Help commands and documentation
- ✅ Version information
- ✅ Command validation
- ✅ Error handling

### **Enterprise Authentication**

- ✅ Authentication validation
- ✅ API connectivity checks
- ✅ Enterprise-only command protection

### **Team Management**

```bash
# Test team commands (will show auth required)
./dist/cli.js team --help
./dist/cli.js team --list
./dist/cli.js team --create "Test Team"
```

### **Analytics & Reporting**

```bash
# Test analytics commands
./dist/cli.js analytics --help
./dist/cli.js analytics --dashboard
./dist/cli.js analytics --export --format json
```

### **Webhook Management**

```bash
# Test webhook commands
./dist/cli.js webhook --help
./dist/cli.js webhook --list
./dist/cli.js webhook --create --url https://example.com/hook
```

### **SSO Integration**

```bash
# Test SSO commands
./dist/cli.js sso --help
./dist/cli.js sso --list
./dist/cli.js sso --setup saml --domain company.com
```

### **Audit & Compliance**

```bash
# Test audit commands
./dist/cli.js audit --help
./dist/cli.js audit --trail
./dist/cli.js audit --compliance
```

## 🔧 Testing with Mock Server

### 1. Start Mock Server

```bash
node dev-server-mock.js
# Server runs on http://localhost:3001
```

### 2. Configure CLI for Testing

```bash
# Set up test configuration
./dist/cli.js config --set apiUrl=http://localhost:3001
./dist/cli.js config --set apiKey=test-key-123
```

### 3. Test Real API Calls

```bash
# Now test with actual API responses
./dist/cli.js team --list
./dist/cli.js analytics --dashboard
./dist/cli.js webhook --list
./dist/cli.js sso --list
./dist/cli.js audit --trail --days 7
```

## 📊 Interactive Testing

### Test Interactive Modes

```bash
# Test interactive team management
./dist/cli.js team

# Test interactive analytics
./dist/cli.js analytics

# Test interactive webhook management
./dist/cli.js webhook

# Test main interactive mode
./dist/cli.js interactive
```

## 🛡️ Security Testing

### Test Authentication

```bash
# Should require auth
./dist/cli.js team --list
./dist/cli.js analytics --export

# Should work without auth
./dist/cli.js help
./dist/cli.js config --list
./dist/cli.js status
```

### Test Input Validation

```bash
# Test invalid inputs
./dist/cli.js team --invite invalid-email
./dist/cli.js webhook --create --url invalid-url
./dist/cli.js sso --setup invalid-type --domain test
```

## 📋 Test Checklist

### Core Functionality

- [ ] CLI builds without errors
- [ ] Help system works for all commands
- [ ] Authentication checks work properly
- [ ] Error messages are clear and helpful
- [ ] Interactive modes don't crash

### Enterprise Commands

- [ ] `neurolint team` - All team management features
- [ ] `neurolint analytics` - Data export and reporting
- [ ] `neurolint webhook` - Webhook CRUD operations
- [ ] `neurolint sso` - SSO provider management
- [ ] `neurolint audit` - Audit trail and compliance

### Error Handling

- [ ] Network failures are handled gracefully
- [ ] Invalid inputs show proper error messages
- [ ] API errors are displayed clearly
- [ ] Timeouts work correctly

### User Experience

- [ ] Progress indicators work
- [ ] Interactive prompts are clear
- [ ] Output formatting is consistent
- [ ] Help text is comprehensive

## 🐛 Common Issues & Solutions

### Build Issues

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

### Permission Issues

```bash
# Make CLI executable
chmod +x dist/cli.js
```

### Network Issues

```bash
# Test API connectivity
curl -H "Authorization: Bearer test" http://localhost:3001/api/health
```

### Missing Dependencies

```bash
# Reinstall dependencies
rm -rf node_modules/
npm install
```

## 📈 Test Results

The test suite validates:

- ✅ **15+ Command Tests** - All CLI commands and options
- ✅ **Authentication** - Enterprise auth requirements
- ✅ **Error Handling** - Graceful failure scenarios
- ✅ **Input Validation** - Parameter validation
- ✅ **Interactive Modes** - User interaction flows
- ✅ **API Integration** - Network request handling
- ✅ **File Operations** - Export and file handling

## 🚀 Production Testing

### Before Deployment

1. Run full test suite: `node test-enterprise.js`
2. Test with real API endpoints
3. Validate error scenarios
4. Check performance with large datasets
5. Verify security requirements

### Manual Testing Checklist

- [ ] Install CLI globally: `npm install -g .`
- [ ] Test in clean environment
- [ ] Verify all commands work
- [ ] Check enterprise features require auth
- [ ] Test export functionality
- [ ] Validate interactive modes

## 📞 Need Help?

If tests fail or you encounter issues:

1. Check the build process: `npm run build`
2. Verify dependencies: `npm install`
3. Test with mock server first
4. Check API endpoint configuration
5. Review error logs for details

The enterprise CLI is designed to be robust and user-friendly. All features include proper error handling, validation, and user feedback to ensure a smooth experience for enterprise users.
