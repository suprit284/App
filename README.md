


## Runtime View

### Real-Time User Status Updates via WebSocket

#### 1. Overview
The application uses WebSocket connections to deliver real-time user status updates (online/offline/typing, etc.) to all connected clients. This ensures instant visibility of user presence without constant HTTP polling.

#### 2. Technical Architecture

```
┌─────────────┐      WebSocket WSS      ┌─────────────────┐
│   Client    │◄───────────────────────►│   WebSocket     │
│  (Browser)  │      Persistent         │   Server        │
│             │      Connection         │   (Node.js)     │
└─────────────┘                         └─────────────────┘
      ▲                                          │
      │                                          │
      │    Status Updates Broadcast              │
      │    to All Connected Clients              │
      │                                          ▼
      │                                 ┌─────────────────┐
      └─────────────────────────────────│   Redis/PubSub  │
                                        │   (Optional)    │
                                        └─────────────────┘
```

#### 3. Connection Management
- **Single Connection Per User**: Each user maintains exactly 1 WebSocket connection to the server
- **Session Persistence**: Connections persist throughout the user's session
- **Auto-Reconnect**: Built-in reconnection logic with exponential backoff
- **Heartbeat**: Ping/Pong mechanism to detect stale connections (every 30 seconds)
- **Max Tabs per Domain**: Maximum 6 tabs can be open simultaneously per domain

#### 4. Bandwidth Analysis

**4.1 Per Connection Overhead**

| Component | Size | Notes |
|-----------|------|-------|
| WebSocket Frame Header | ~2-14 bytes | Depends on payload length |
| TCP/IP Overhead | ~40 bytes | Per packet |
| TLS Overhead | ~20-40 bytes | For WSS connections |
| **Base Overhead** | **~60-90 bytes** | Per message |

**4.2 Status Update Message Size**

Example Status Message:
```json
{
  "type": "user_status",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "online",
  "timestamp": "2026-07-27T10:30:00.000Z"
}
```

| Component | Size |
|-----------|------|
| JSON Payload | ~120 bytes |
| WebSocket Frame | ~10 bytes |
| TCP/IP/TLS | ~60 bytes |
| **Total Per Message** | **~190 bytes** |

**4.3 Bandwidth Calculations for 100 Users**

| Scenario | Calculation | Bandwidth |
|----------|-------------|-----------|
| Single Status Update | 99 users × 190 bytes | **~18.8 KB** |
| 100 Simultaneous Updates | 9,900 messages × 190 bytes | **~1.88 MB** (burst) |
| Normal Activity (10 users/min) | 990 messages × 190 bytes | **~188 KB/min** |
| Peak Hour (50 users/min) | 4,950 messages × 190 bytes | **~940 KB/min** |

**4.4 Continuous Connection Overhead**

| Metric | Per User | For 100 Users |
|--------|----------|---------------|
| Heartbeat (Ping/Pong) | ~100 bytes/30s | ~10 KB/30s |
| Keep-Alive Traffic | ~200 bytes/min | ~20 KB/min |
| **Monthly Traffic** | ~8.6 MB | **~860 MB** |

**4.5 Multi-Tab Impact (6 Tabs per User)**

| Metric | Value |
|--------|-------|
| Total Connections | 100 × 6 = 600 |
| Bandwidth (Single Update) | 600 × 190 bytes = **114 KB** |
| Bandwidth (100 Updates Burst) | 600 × 100 × 190 = **11.4 MB** |

#### 5. Memory Consumption Analysis

**5.1 Server Memory per WebSocket Connection**

| Component | Memory | Notes |
|-----------|--------|-------|
| WebSocket Object | ~2-5 KB | Socket.io or ws library |
| Connection State | ~1-2 KB | User ID, metadata |
| Buffers | ~1 KB | Write buffers |
| Event Listeners | ~1 KB | Callbacks and handlers |
| **Total Per Connection** | **~5-9 KB** | Average estimate |

**5.2 Server Memory for 100 Users**

| Metric | Value |
|--------|-------|
| Per Connection Memory | ~7 KB (average) |
| **Total for 100 Connections** | **~700 KB** |
| Additional Overhead (Redis/State) | ~2-3 MB |
| **Total Server Memory** | **~3-4 MB** |

**5.3 Client Memory Usage**

| Component | Per Tab | For 6 Tabs (Max) |
|-----------|---------|------------------|
| WebSocket Client | ~2-3 MB | ~12-18 MB |
| Status Cache | ~500 KB | ~3 MB |
| Event Queue | ~200 KB | ~1.2 MB |
| **Total Per Client** | **~2.7-3.7 MB** | **~16-22 MB** |

#### 6. Performance Optimizations

| Optimization | Bandwidth Reduction |
|--------------|---------------------|
| Binary Protocol | 20-30% |
| Per-message Compression | 40-50% |
| Message Batching | 30-40% |
| Selective Broadcasting | 60-70% |
| **Combined Savings** | **~70-80%** |

#### 7. Scaling Projections

| User Count | Connections | Server Memory | Bandwidth (Burst) |
|------------|-------------|---------------|-------------------|
| 100 | 100 | ~3-5 MB | ~1.88 MB |
| 1,000 | 1,000 | ~30-50 MB | ~18.8 MB |
| 10,000 | 10,000 | ~300-500 MB | ~188 MB |
| 100,000 | 100,000 | ~3-5 GB | ~1.88 GB |

#### 8. Monitoring & Alerts

**Key Performance Indicators (KPIs)**:
- Active WebSocket connections
- Messages per second (in/out)
- Average message latency
- Memory usage per connection
- Reconnection rate
- Error rate

**Alert Thresholds**:
- Connection count > 90% of capacity
- Message queue backlog > 1000 messages
- Latency > 500ms
- Memory usage > 80%

#### 9. Fallback Strategy
1. Automatic reconnection with exponential backoff
2. Long-polling HTTP fallback (as backup)
3. Last known status cache (to show stale data)
4. Connection status indicator for users

---

### Summary: Key Numbers for 100 Users

| Metric | Value |
|--------|-------|
| **Bandwidth per Status Update** | ~19 KB (broadcast to all) |
| **Bandwidth (100 simultaneous updates)** | ~1.88 MB (burst) |
| **Monthly Bandwidth** | ~860 MB (average) |
| **Server Memory** | ~3-5 MB |
| **Client Memory** | ~2.7-3.7 MB (per tab) |
| **Max Tabs per Domain** | 6 |
| **Total Connections (100 users × 6 tabs)** | 600 |
| **Latency** | < 50ms average |




