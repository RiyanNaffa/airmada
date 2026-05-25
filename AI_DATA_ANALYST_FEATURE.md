# aiRMADA Data Analyst AI

## Overview

**aiRMADA Data Analyst** adalah fitur AI-powered yang memungkinkan pengguna untuk upload file CSV atau Excel berisi data armada/logistik, kemudian melakukan chat dengan AI untuk mendapatkan:

- 📊 **Insight Armada** - Analisis performa keseluruhan
- 🚗 **Deteksi Abnormal** - Identifikasi kendaraan dengan performa tidak normal
- 🔧 **Rekomendasi Maintenance** - Saran maintenance predictive dan preventive
- ⚡ **Analisis Efisiensi** - Optimasi bahan bakar dan rute
- 💡 **Rekomendasi Operasional** - Saran peningkatan efisiensi

AI bertindak sebagai **"aiRMADA Data Analyst AI"** yang memahami industri logistik dan memberikan rekomendasi dalam Bahasa Indonesia yang mudah dipahami.

## Tech Stack

- **Backend**: Next.js API Routes
- **AI Provider**: OpenRouter (Free API Access)
- **Frontend**: React + TypeScript + Tailwind CSS
- **File Processing**: Native File API (browser) + Node.js Buffer (server)

## Architecture

```
┌─────────────────────┐
│  Browser (React)    │
│   File Upload +     │
│   Chat Interface    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Next.js API       │
│   Routes            │
├─────────────────────┤
│ /api/ai/analyst/    │
│   upload (POST)     │
│   chat (POST)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OpenRouter API     │
│  (Free)             │
│                     │
│ Models:             │
│ - Mistral 7B        │
│ - Llama 2 7B        │
│ - And many more     │
└─────────────────────┘
```

## File Structure

```
apps/web/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── ai/
│   │           └── analyst/
│   │               ├── upload/
│   │               │   └── route.ts       # File upload endpoint
│   │               └── chat/
│   │                   └── route.ts       # Chat endpoint
│   │   └── (dashboard)/
│   │       └── ai-chat/
│   │           └── page.tsx              # Main page
│   ├── components/
│   │   └── ai/
│   │       └── DataAnalystChat.tsx       # Main component
│   └── lib/
│       └── openrouter.ts                 # OpenRouter API utilities
└── ...
```

## Component: DataAnalystChat

**Location**: `apps/web/src/components/ai/DataAnalystChat.tsx`

### Features

1. **File Upload**
   - Drag & drop support
   - File type validation (CSV, Excel)
   - Size limit (10MB)
   - Progress indication

2. **AI Analysis**
   - Initial analysis on upload
   - Conversation history
   - Real-time response streaming
   - Error handling

3. **Chat Interface**
   - Message bubbles (user vs assistant)
   - Auto-scroll to latest message
   - Multi-line text input
   - Keyboard shortcuts (Enter to send)

### Props

None - fully self-contained component

### Example Usage

```tsx
import { DataAnalystChat } from '@/components/ai/DataAnalystChat'

export default function Page() {
  return (
    <div className="h-screen">
      <DataAnalystChat />
    </div>
  )
}
```

## API Endpoints

### 1. POST `/api/ai/analyst/upload`

Upload file dan dapatkan initial analysis.

**Request:**

```typescript
POST /api/ai/analyst/upload
Content-Type: multipart/form-data

Body:
{
  file: File // CSV atau Excel
}
```

**Response:**

```json
{
  "success": true,
  "fileName": "fleet_data.csv",
  "fileSize": 12345,
  "analysis": "Berdasarkan data armada Anda...",
  "sessionId": "session_1234567890"
}
```

**Error Cases:**

- 400: No file provided / Invalid file type / File too large
- 500: Server error during analysis

### 2. POST `/api/ai/analyst/chat`

Chat dengan AI analyst untuk pertanyaan follow-up.

**Request:**

```typescript
POST /api/ai/analyst/chat
Content-Type: application/json

Body:
{
  "messages": [
    {
      "role": "user",
      "content": "Kendaraan mana yang perlu maintenance segera?"
    },
    {
      "role": "assistant",
      "content": "Berdasarkan data Anda..."
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Dari analisis data armada Anda...",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## System Prompt

AI dikonfigurasi dengan system prompt spesifik:

```
Kamu adalah "aiRMADA Data Analyst AI", seorang AI analyst ahli
dalam industri logistik dan armada kendaraan.

Tugas utamamu:
1. INSIGHT ARMADA: Analisis data armada untuk memberikan insight berharga
2. DETEKSI ABNORMAL: Identifikasi kendaraan dengan performa abnormal
3. REKOMENDASI MAINTENANCE: Berikan rekomendasi maintenance predictive
4. ANALISIS EFISIENSI: Analisis efisiensi rute dan penggunaan resource
5. KOMUNIKASI SIMPEL: Jelaskan dengan bahasa mudah dipahami

[... full prompt di openrouter.ts ...]
```

## Data Format

### CSV Example

```csv
No,Plat Nomor,Tipe Kendaraan,Tahun,Kondisi,KM,Konsumsi BBM,Maintenance,Jam Operasional
1,B 1234 ABC,Truck,2020,Good,250000,8.5,Filter replacement,180
2,B 5678 DEF,Truck,2019,Fair,350000,6.2,Oil change,200
```

### Key Columns

| Column          | Type   | Description                     |
| --------------- | ------ | ------------------------------- |
| Plat Nomor      | String | License plate / identification  |
| Tipe Kendaraan  | String | Vehicle type (Truck, Van, etc.) |
| Tahun           | Number | Year of manufacture             |
| Kondisi         | String | Condition (Good, Fair, Poor)    |
| KM              | Number | Total kilometers                |
| Konsumsi BBM    | Number | Fuel efficiency (KM/L)          |
| Maintenance     | String | Last maintenance type           |
| Jam Operasional | Number | Operating hours per month       |

## Environment Setup

### 1. Get API Key

Visit [OpenRouter.ai](https://openrouter.ai/) and create free account:

```bash
1. Go to https://openrouter.ai/
2. Sign up
3. Navigate to Keys
4. Create new API key
5. Copy to .env.local
```

### 2. Configure .env.local

```env
# apps/web/.env.local
OPENROUTER_API_KEY=your_api_key_here
```

### 3. Restart Dev Server

```bash
npm run dev
```

## Usage Flow

```
User
  │
  ├─→ Visit /ai-chat page
  │
  ├─→ Click "Pilih File"
  │
  ├─→ Select CSV/Excel file
  │
  ├─→ File uploaded to /api/ai/analyst/upload
  │
  ├─→ OpenRouter AI analyzes file
  │
  ├─→ Initial analysis displayed
  │
  ├─→ Ask questions in chat
  │
  └─→ Each message goes to /api/ai/analyst/chat
```

## Features in Detail

### 📊 Insight Armada

AI analyzes fleet data and provides:

- Overall performance metrics
- Fleet trends and patterns
- Cost analysis
- Performance comparisons

Example Output:

```
INSIGHT ARMADA ANDA:

Ringkas:
Armada Anda terdiri dari 15 kendaraan dengan performa yang bervariasi.
Konsumsi BBM rata-rata 8.2 KM/L menunjukkan efisiensi yang cukup baik.

Breakdown:
- 10 kendaraan dalam kondisi GOOD/EXCELLENT (67%)
- 4 kendaraan dalam kondisi FAIR (27%)
- 1 kendaraan dalam kondisi POOR (7%)

Rekomendasi:
✓ Fokus pada maintenance preventive untuk 5 kendaraan yang aging
✓ Intensifkan monitoring konsumsi BBM (ada pola tidak normal)
✓ Pertimbangkan penggantian untuk kendaraan dengan KM > 400.000
```

### 🚗 Deteksi Abnormal

Identifies vehicles with unusual patterns:

- High fuel consumption
- Excessive mileage
- Overdue maintenance
- Performance degradation

Example:

```
KENDARAAN DENGAN PERFORMA ABNORMAL:

🔴 URGENT:
1. B 3456 JKL (Truck)
   - Konsumsi BBM: 5.1 KM/L (23% dibanding rata-rata)
   - Total KM: 420.000 (tertinggi)
   - Jam operasional: 220h/bulan (tertinggi)
   - Action: Schedule urgent maintenance

🟡 WARNING:
2. B 2345 PQR (Truck)
   - Terakhir maintenance: 28 hari lalu
   - Kondisi: FAIR (aging fleet concern)
```

### 🔧 Rekomendasi Maintenance

Predictive maintenance recommendations:

- Preventive maintenance schedule
- Component replacement forecasts
- Cost estimates
- Priority ranking

### ⚡ Analisis Efisiensi

Operational efficiency analysis:

- Fuel efficiency trends
- Cost per KM
- Utilization rates
- Optimization opportunities

## Error Handling

### Client-Side

- File validation
- Size checking
- Format verification
- Network error handling

### Server-Side

- API key validation
- Request validation
- Rate limiting preparation
- Error logging

### Display

- User-friendly error messages
- Retry mechanisms
- Fallback suggestions

## Performance Considerations

1. **File Size**: Max 10MB (configurable)
2. **API Response**: ~5-30 seconds depending on file size
3. **Streaming**: Optional streaming support for longer analyses
4. **Caching**: Session-based conversation history

## Security

- ✅ API key stored in server environment only
- ✅ All processing server-side
- ✅ No data persistence without user action
- ✅ File validation and sanitization
- ✅ CORS configured appropriately

## Future Enhancements

1. **Persistent Storage**
   - Save analysis history to database
   - Multi-session support
   - Team collaboration

2. **Advanced Analytics**
   - Predictive modeling
   - ML-based anomaly detection
   - Custom KPI tracking

3. **Integration**
   - Real-time vehicle data integration
   - GPS tracking data analysis
   - Driver performance correlation

4. **UI Improvements**
   - Export analysis as PDF/Excel
   - Custom dashboard
   - Real-time monitoring
   - Data visualization

## Testing

### Sample Data

Use `SAMPLE_FLEET_DATA.csv` for testing:

- 15 vehicles with varied conditions
- Realistic operational metrics
- Examples of normal and abnormal patterns

### Test Scenarios

1. **Happy Path**: Upload file → Get analysis → Ask questions
2. **Error Handling**: Invalid file → Error message
3. **Large File**: Test 10MB limit
4. **Network Error**: Test offline behavior
5. **Multiple Sessions**: Multiple files, different questions

## Troubleshooting

### Issue: "OPENROUTER_API_KEY is not configured"

**Solution**:

1. Verify `.env.local` exists
2. Check key is correctly set
3. Restart dev server

### Issue: "File upload fails"

**Solution**:

1. Check file format (CSV or Excel)
2. Verify file size < 10MB
3. Check file has headers in first row

### Issue: "AI response is generic"

**Solution**:

1. Ensure CSV has descriptive column headers
2. Include relevant data columns
3. Ask specific questions about data

## Support

For issues or questions:

1. Check error messages in browser console
2. Verify OpenRouter API key
3. Review sample data format
4. Check network connectivity

## References

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

---

**Created**: January 2024
**Version**: 1.0.0
**Status**: Production Ready
