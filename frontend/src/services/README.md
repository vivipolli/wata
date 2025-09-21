# Frontend Services Architecture

This document describes the scalable service architecture implemented for the W.A.T.A. Chain frontend.

## 🏗️ Architecture Overview

The frontend services are organized in a modular, scalable structure that separates concerns and provides clean abstractions for API interactions.

```
src/
├── services/
│   ├── api.js              # Axios configuration and interceptors
│   ├── agreements.js       # Agreement-related API calls
│   ├── readings.js         # Water quality readings API calls
│   ├── payments.js         # Payment-related API calls
│   ├── health.js           # System health monitoring
│   └── index.js            # Centralized exports
├── hooks/
│   ├── useAgreements.js    # Agreement state management
│   ├── useReadings.js      # Readings state management
│   ├── usePayments.js      # Payment state management
│   ├── useHealth.js        # Health monitoring
│   └── index.js            # Hook exports
└── utils/
    ├── constants.js        # Application constants
    ├── helpers.js          # Utility functions
    └── index.js            # Utility exports
```

## 🔧 Services Layer

### API Client (`api.js`)

Centralized axios configuration with:
- Base URL configuration
- Request/response interceptors
- Error handling
- Logging
- Timeout configuration

```javascript
import apiClient from './services/api'

// Usage
const response = await apiClient.get('/agreements')
```

### Individual Services

Each service module handles specific domain operations:

#### Agreements Service (`agreements.js`)
- `getAll()` - Fetch all agreements
- `getById(id)` - Get specific agreement
- `create(data)` - Create new agreement
- `getPayments(agreementId)` - Get agreement payments
- `update(id, data)` - Update agreement
- `delete(id)` - Delete agreement

#### Readings Service (`readings.js`)
- `getRecent(limit)` - Get recent readings
- `getByAgreement(agreementId, limit)` - Get agreement readings
- `getStats(agreementId, days)` - Get reading statistics
- `submit(data)` - Submit real reading
- `simulate(data)` - Simulate reading
- `getComplianceStatus(agreementId, threshold)` - Check compliance

#### Payments Service (`payments.js`)
- `triggerCheck(agreementId)` - Trigger payment check
- `getByAgreement(agreementId)` - Get agreement payments
- `getPending()` - Get pending payments
- `process(paymentId)` - Process payment
- `getStats()` - Get payment statistics
- `getHistory(filters)` - Get payment history

#### Health Service (`health.js`)
- `checkHealth()` - Check backend health
- `getSystemStatus()` - Get system metrics
- `ping()` - Test connectivity

## 🎣 Custom Hooks

Custom hooks provide state management and business logic:

### useAgreements
```javascript
const { 
  agreements, 
  loading, 
  error, 
  fetchAgreements, 
  createAgreement 
} = useAgreements()
```

### useReadings
```javascript
const { 
  readings, 
  loading, 
  error, 
  simulateReading, 
  getComplianceStatus 
} = useReadings()
```

### usePayments
```javascript
const { 
  payments, 
  loading, 
  error, 
  triggerPaymentCheck, 
  processPayment 
} = usePayments()
```

### useHealth
```javascript
const { 
  isHealthy, 
  healthData, 
  checkHealth, 
  ping 
} = useHealth()
```

## 🛠️ Utilities

### Constants (`constants.js`)
- API configuration
- Water quality standards
- Payment statuses
- UI constants
- Error messages

### Helpers (`helpers.js`)
- Date formatting
- Number formatting
- Water quality calculations
- Validation functions
- Common utilities

## 📱 Component Integration

Components use hooks instead of direct API calls:

```javascript
// Before (direct API calls)
const [agreements, setAgreements] = useState([])
useEffect(() => {
  fetch('http://localhost:3001/api/agreements')
    .then(res => res.json())
    .then(data => setAgreements(data.agreements))
}, [])

// After (using hooks)
const { agreements, loading, error } = useAgreements()
```

## 🔄 State Management

Each hook manages its own state:
- Loading states
- Error handling
- Data caching
- Automatic refresh
- Optimistic updates

## 🚀 Scalability Features

### Environment Configuration
```javascript
// .env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_REFRESH_INTERVAL=30000
```

### Error Handling
- Centralized error handling
- User-friendly error messages
- Retry mechanisms
- Fallback strategies

### Performance
- Request debouncing
- Data caching
- Optimistic updates
- Lazy loading

### Testing
- Service mocking
- Hook testing
- Component isolation
- API contract testing

## 🔧 Configuration

### API Base URL
Set via environment variable:
```bash
VITE_API_BASE_URL=https://api.wata-chain.com
```

### Timeout Configuration
```javascript
// api.js
const apiClient = axios.create({
  timeout: 10000, // 10 seconds
})
```

### Retry Logic
```javascript
// Automatic retry on network errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'NETWORK_ERROR') {
      // Retry logic
    }
    return Promise.reject(error)
  }
)
```

## 📊 Monitoring

### Health Checks
- Automatic health monitoring
- Connection status indicators
- Error rate tracking
- Performance metrics

### Logging
- Request/response logging
- Error tracking
- Performance monitoring
- User action tracking

## 🔮 Future Enhancements

1. **Caching Layer**: Implement Redis or local storage caching
2. **Real-time Updates**: WebSocket integration for live data
3. **Offline Support**: Service worker for offline functionality
4. **Advanced Error Recovery**: Automatic retry with exponential backoff
5. **Data Synchronization**: Conflict resolution for concurrent updates
6. **Performance Monitoring**: Real-time performance metrics
7. **A/B Testing**: Feature flag integration
8. **Internationalization**: Multi-language support

## 🧪 Testing Strategy

### Unit Tests
- Service function testing
- Hook behavior testing
- Utility function testing

### Integration Tests
- API contract testing
- Component integration testing
- End-to-end user flows

### Mocking
- API response mocking
- Service layer mocking
- External dependency mocking

This architecture provides a solid foundation for scaling the W.A.T.A. Chain frontend while maintaining clean code organization and excellent developer experience.
