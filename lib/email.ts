import nodemailer from "nodemailer";
import { SupplierData } from "./schema";

interface PriceAlertData {
  currentPrice: number;
  previousPrice: number | null;
  cheapestSupplier: string;
  avgPrice: number;
  top5Suppliers: SupplierData[];
  recordedAt: Date;
}

// Create transporter using Google SMTP
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatPrice(price: number): string {
  return `£${price.toFixed(0)}`;
}

function formatPriceDiff(current: number, previous: number | null): string {
  if (previous === null) return "";
  const diff = current - previous;
  if (diff < 0) {
    return `↓ £${Math.abs(diff).toFixed(0)} from yesterday`;
  } else if (diff > 0) {
    return `↑ £${diff.toFixed(0)} from yesterday`;
  }
  return "No change from yesterday";
}

function generateEmailSubject(current: number, previous: number | null): string {
  const priceStr = formatPrice(current);
  if (previous !== null) {
    const diff = current - previous;
    if (diff < 0) {
      return `Oil Price Alert: ${priceStr} (↓ £${Math.abs(diff).toFixed(0)} from yesterday)`;
    } else if (diff > 0) {
      return `Oil Price Alert: ${priceStr} (↑ £${diff.toFixed(0)} from yesterday)`;
    }
  }
  return `Oil Price Alert: ${priceStr}`;
}

function generateHtmlTemplate(data: PriceAlertData): string {
  const {
    currentPrice,
    previousPrice,
    cheapestSupplier,
    avgPrice,
    top5Suppliers,
    recordedAt,
  } = data;

  const priceDiff = formatPriceDiff(currentPrice, previousPrice);
  const savingsVsAvg = avgPrice - currentPrice;
  const dateStr = recordedAt.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const suppliersHtml = top5Suppliers
    .map(
      (supplier, index) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 16px; font-size: 14px; color: #374151;">
          ${index + 1}. ${supplier.name}
        </td>
        <td style="padding: 12px 16px; font-size: 14px; color: #374151; text-align: right; font-weight: 600;">
          £${supplier.price500L.toFixed(0)}
        </td>
        <td style="padding: 12px 16px; font-size: 14px; color: #6b7280; text-align: right;">
          ${supplier.ppl500L.toFixed(2)}p/L
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oil Price Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 12px 12px 0 0; padding: 32px 24px;">
          <tr>
            <td style="text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Oil Price Alert
              </h1>
              <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 14px;">
                ${dateStr}
              </p>
            </td>
          </tr>
        </table>

        <!-- Main Price Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 32px 24px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                Cheapest 500L Price
              </p>
              <h2 style="margin: 0; color: #1f2937; font-size: 48px; font-weight: 800;">
                ${formatPrice(currentPrice)}
              </h2>
              ${priceDiff ? `
              <p style="margin: 12px 0 0 0; color: ${currentPrice < (previousPrice || currentPrice) ? '#059669' : '#dc2626'}; font-size: 16px; font-weight: 600;">
                ${priceDiff}
              </p>
              ` : ''}
            </td>
          </tr>
        </table>

        <!-- Stats Row -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 24px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <tr>
            <td width="50%" style="text-align: center; border-right: 1px solid #e5e7eb;">
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">
                Best Supplier
              </p>
              <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                ${cheapestSupplier}
              </p>
            </td>
            <td width="50%" style="text-align: center;">
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">
                Savings vs Average
              </p>
              <p style="margin: 0; color: #059669; font-size: 16px; font-weight: 600;">
                £${savingsVsAvg.toFixed(0)} below avg
              </p>
            </td>
          </tr>
        </table>

        <!-- Top 5 Suppliers -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 24px 24px 16px 24px;">
              <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                Top 5 Cheapest Suppliers
              </h3>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 8px 24px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px 16px; font-size: 12px; color: #6b7280; text-align: left; text-transform: uppercase; font-weight: 600;">
                    Supplier
                  </th>
                  <th style="padding: 12px 16px; font-size: 12px; color: #6b7280; text-align: right; text-transform: uppercase; font-weight: 600;">
                    500L Price
                  </th>
                  <th style="padding: 12px 16px; font-size: 12px; color: #6b7280; text-align: right; text-transform: uppercase; font-weight: 600;">
                    Per Litre
                  </th>
                </tr>
                ${suppliersHtml}
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 0 0 12px 12px; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Data sourced from cheapestoil.co.uk
              </p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                Oil Price Tracker - Northern Ireland
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendPriceAlert(data: PriceAlertData): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const { SMTP_USER, SMTP_PASS, ALERT_EMAIL } = process.env;

  if (!SMTP_USER || !SMTP_PASS || !ALERT_EMAIL) {
    console.log("Email not configured - skipping alert");
    return {
      success: false,
      error: "Email configuration missing (SMTP_USER, SMTP_PASS, or ALERT_EMAIL)",
    };
  }

  try {
    const transporter = createTransporter();
    const subject = generateEmailSubject(data.currentPrice, data.previousPrice);
    const html = generateHtmlTemplate(data);

    const info = await transporter.sendMail({
      from: `"Oil Price Tracker" <${SMTP_USER}>`,
      to: ALERT_EMAIL,
      subject,
      html,
    });

    console.log(`Price alert email sent: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send price alert email:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export function shouldSendAlert(
  currentPpl: number,
  previousPpl: number | null,
  pplChangeThreshold: number = 5
): { shouldSend: boolean; reason: string; change: number | null } {
  if (previousPpl === null) {
    // First record - send alert to confirm setup
    return { shouldSend: true, reason: "first_record", change: null };
  }

  const change = currentPpl - previousPpl;
  const absChange = Math.abs(change);

  // Alert if ppl changed by more than threshold (default 5p)
  if (absChange > pplChangeThreshold) {
    const direction = change < 0 ? "dropped" : "increased";
    return {
      shouldSend: true,
      reason: `ppl_${direction}_${absChange.toFixed(1)}p`,
      change
    };
  }

  return { shouldSend: false, reason: "no_significant_change", change };
}
