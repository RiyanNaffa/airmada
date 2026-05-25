# 🚀 aiRMADA Data Analyst AI - Quick Reference Card

**Print this or bookmark for quick access!**

---

## ⚡ 60-Second Setup

```bash
# 1. Get API key from: https://openrouter.ai/

# 2. Add to apps/web/.env.local:
OPENROUTER_API_KEY=your_key_here

# 3. Start server:
npm run dev

# 4. Open browser:
http://localhost:3000/ai-chat

# 5. Upload file and chat!
```

---

## 📁 Important Files

| File                                             | Action             |
| ------------------------------------------------ | ------------------ |
| `README_DATA_ANALYST.md`                         | READ THIS FIRST ⭐ |
| `apps/web/.env.local`                            | ADD API KEY HERE   |
| `SAMPLE_FLEET_DATA.csv`                          | TEST WITH THIS     |
| `apps/web/src/components/ai/DataAnalystChat.tsx` | MAIN COMPONENT     |
| `apps/web/src/lib/openrouter.ts`                 | CUSTOMIZE AI HERE  |

---

## 🎯 AI Capabilities

The AI can analyze and provide:

```
✓ Fleet performance insights
✓ Abnormal vehicle detection
✓ Maintenance recommendations
✓ Efficiency analysis
✓ Cost optimization
✓ All in Bahasa Indonesia
```

---

## 💻 API Endpoints

### Upload File

```bash
POST /api/ai/analyst/upload
Content-Type: multipart/form-data

Request: file (CSV/Excel, max 10MB)
Response: { analysis, sessionId, success }
```

### Chat

```bash
POST /api/ai/analyst/chat
Content-Type: application/json

Request: { messages: [{role, content}, ...] }
Response: { message, timestamp, success }
```

---

## 📊 CSV Format

```csv
No,Plat Nomor,Tipe Kendaraan,Tahun,Kondisi,Total KM,Konsumsi BBM
1,B 1234 ABC,Truck,2020,Good,250000,8.5
2,B 5678 DEF,Van,2019,Fair,300000,10.2
```

**Columns**: Plat, Tipe, Tahun, Kondisi, KM, BBM, Maintenance, Jam Operasional

---

## 🧪 Test Commands

```bash
# Upload & analyze
curl -X POST http://localhost:3000/api/ai/analyst/upload \
  -F "file=@SAMPLE_FLEET_DATA.csv"

# Chat
curl -X POST http://localhost:3000/api/ai/analyst/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Test"}]}'
```

---

## ✅ Verification Checklist

- [ ] npm run dev (server running)
- [ ] Open http://localhost:3000/ai-chat
- [ ] Upload SAMPLE_FLEET_DATA.csv
- [ ] Get analysis
- [ ] Ask a question
- [ ] Get AI response

---

## 🆘 Common Issues

| Problem                  | Fix                                        |
| ------------------------ | ------------------------------------------ |
| "API key not configured" | Add to `.env.local` + restart server       |
| "Upload fails"           | File > 10MB? Wrong format? Check console   |
| "AI response slow"       | Wait / Try smaller file / Check connection |
| "Component not showing"  | Check import, verify no errors in console  |

---

## 📚 Documentation Map

```
START → README_DATA_ANALYST.md
   ↓
   ├→ Setup: OPENROUTER_SETUP.md
   ├→ Details: AI_DATA_ANALYST_FEATURE.md
   ├→ Verify: IMPLEMENTATION_CHECKLIST_DATA_ANALYST.md
   └→ Files: FILE_INDEX.md
```

---

## 🎨 React Usage

### Component

```tsx
import { DataAnalystChat } from '@/components/ai/DataAnalystChat'

export default function Page() {
  return <DataAnalystChat />
}
```

### Hook

```tsx
const { uploadFile, sendMessage, messages, isLoading } = useDataAnalyst()
```

---

## 🔑 Customization

### Change System Prompt

File: `apps/web/src/lib/openrouter.ts`

```tsx
export const SYSTEM_PROMPT = `Your new prompt here...`
```

### Change AI Model

File: `apps/web/src/lib/openrouter.ts`

```tsx
model: 'mistralai/mistral-7b-instruct:free' // ← Change here
```

### Change UI Colors

File: `apps/web/src/components/ai/DataAnalystChat.tsx`

```tsx
className = 'bg-orange-500' // ← Change colors (Tailwind)
```

---

## 📞 Support Links

- OpenRouter Docs: https://openrouter.ai/docs
- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Full Guide: README_DATA_ANALYST.md

---

## 🚢 Deployment Checklist

- [ ] Set `OPENROUTER_API_KEY` in production
- [ ] Test file upload works
- [ ] Configure error logging
- [ ] Monitor API usage
- [ ] Consider rate limiting
- [ ] Backup/persist data if needed

---

## 📊 Performance Stats

| Operation        | Time     |
| ---------------- | -------- |
| Page load        | < 2 sec  |
| File upload      | 1-5 sec  |
| Initial analysis | 5-30 sec |
| Chat response    | 2-10 sec |

_Times may vary based on file size and API load_

---

## 🎓 Sample Questions to Ask

```
"Kendaraan mana yang perlu maintenance?"
"Berapa rata-rata konsumsi BBM?"
"Mana kendaraan paling efisien?"
"Apa rekomendasi optimasi armada?"
"Deteksi kendaraan abnormal apa saja?"
"Berapa biaya maintenance yang diperkirakan?"
```

---

## 🔐 Security Best Practices

- ✅ Keep `OPENROUTER_API_KEY` secret
- ✅ Don't commit `.env.local` to git
- ✅ Use `.gitignore` for env files
- ✅ Verify file before upload (server-side)
- ✅ Sanitize error messages
- ✅ Monitor API usage for abuse

---

## 🎉 You're All Set!

Everything is ready to use. Start with:

```bash
1. Get API key from https://openrouter.ai/
2. Add to apps/web/.env.local
3. npm run dev
4. Visit http://localhost:3000/ai-chat
```

**Questions?** Check `README_DATA_ANALYST.md` or troubleshooting section.

---

**Version**: 1.0.0 | **Status**: ✅ Production Ready | **Date**: January 2024
