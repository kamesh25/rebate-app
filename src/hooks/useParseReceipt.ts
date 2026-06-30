import Anthropic from '@anthropic-ai/sdk'
import { STORE_POLICIES } from '../types'

export interface ParsedReceipt {
  store: string
  item: string
  purchaseDate: string   // YYYY-MM-DD
  returnDays: number
  returnDeadline: string | null  // YYYY-MM-DD if found on receipt
  notes: string
}

export async function parseReceiptPhoto(photoDataUrl: string, apiKey: string): Promise<ParsedReceipt> {
  // Strip the data:image/...;base64, prefix
  const [header, base64Data] = photoDataUrl.split(',')
  const mediaType = header.match(/data:(image\/\w+)/)?.[1] ?? 'image/jpeg'

  const knownStores = STORE_POLICIES.map(p => p.store).filter(s => s !== 'Other').join(', ')

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType as any, data: base64Data },
        },
        {
          type: 'text',
          text: `Look at this receipt or order confirmation and extract the following.

Known stores (use exact name if matched): ${knownStores}

Return ONLY valid JSON with these fields:
{
  "store": "exact store name",
  "item": "short description of what was purchased (max 60 chars)",
  "purchaseDate": "YYYY-MM-DD",
  "returnDeadline": "YYYY-MM-DD or null if not printed on receipt",
  "returnDays": <number — use deadline if found, else standard store policy>,
  "notes": "order number or any useful detail, empty string if none"
}

If you cannot read the receipt clearly, make your best guess. Always return valid JSON.`,
        },
      ],
    }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const parsed = JSON.parse(text) as ParsedReceipt

  // If returnDeadline is on the receipt, calculate returnDays from purchaseDate
  if (parsed.returnDeadline && parsed.purchaseDate) {
    const purchase = new Date(parsed.purchaseDate)
    const deadline = new Date(parsed.returnDeadline)
    const days = Math.ceil((deadline.getTime() - purchase.getTime()) / 86400000)
    if (days > 0) parsed.returnDays = days
  }

  return parsed
}
