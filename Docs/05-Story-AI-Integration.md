# Story 5: AI Integration (Gemini)

## 📝 Description
We will add a button that asks Gemini for advice based on the data we have collected.

## 🏃‍♂️ Action Items

### 1. Create the Server Action
In Next.js, we can use "Server Actions" to call APIs securely from the frontend.
Create `app/actions.ts`:

```typescript
'use server';

import { GoogleGenAI } from "@google/genai";

export async function getAIAdvice(priceHistory: any[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const prompt = `
    Context: Northern Ireland Home Heating Oil Prices (900L).
    History (last 30 days): ${JSON.stringify(priceHistory)}
    
    Analyze this trend. Should I buy now or wait? 
    Keep it short (under 50 words). 
    If the trend is down, say WAIT. 
    If near the 30-day low, say BUY.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
}
```

### 2. Connect to UI
Update `components/DashboardClient.tsx` to import this action and call it when the user clicks "Analyze".

```typescript
import { getAIAdvice } from '@/app/actions';
// inside your component...
const [insight, setInsight] = useState('');

const handleAnalyze = async () => {
  const advice = await getAIAdvice(data);
  setInsight(advice);
}
```

## ✅ Success Criteria
- [ ] Clicking the "Analyze" button on the dashboard returns a real response from Gemini.
