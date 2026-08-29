import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = join(__dirname, '../resources/htmltemplates');

/**
 * Load an HTML email template and replace {{placeholder}} tokens.
 *
 * Available templates:
 *  - password-reset-link   → {{userName}}, {{resetLink}}
 *  - password-recovery     → {{userName}}, {{password}}
 *  - create-account        → {{userName}}, {{tag}}, {{ubication}}
 *  - added-to-trip         → {{userName}}, {{tripName}}, {{ownerName}}, {{ownerTag}}
 *  - removed-from-trip     → {{userName}}, {{tripName}}, {{ownerName}}, {{ownerTag}}
 *  - confirm-email         → {{userName}}, {{confirmationUrl}}
 *
 * {{year}} is injected automatically with the current year.
 *
 * @param {string} templateName - Filename without the .html extension
 * @param {Record<string, string>} vars - Token map, e.g. { userName: 'Alice' }
 * @returns {string} Rendered HTML string
 */
export function loadTemplate(templateName, vars = {}) {
  const filePath = join(TEMPLATES_DIR, `${templateName}.html`);
  let html = readFileSync(filePath, 'utf-8');

  const tokens = { year: String(new Date().getFullYear()), ...vars };

  for (const [key, value] of Object.entries(tokens)) {
    html = html.replaceAll(`{{${key}}}`, value ?? '');
  }

  return html;
}
