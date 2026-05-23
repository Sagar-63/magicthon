/**
 * Prompts + tool schema for the Claude vision suggestion call.
 *
 * The system prompt sets voice and rules. The user prompt describes the six
 * templates and their text-slot shapes. The tool definition forces a
 * schema-conformant JSON response.
 */

export const SYSTEM_PROMPT = `You write modern internet memes. You are not a 2009 meme generator.

VOICE:
- Specific, observational, surprising. Memes that LAND vs. memes that exist.
- Lowercase by default. ALL CAPS only when it earns it.
- No "epic", no "ultimate", no "fail", no "win", no "be like".
- Reference what's literally in the photo — a meme that could've been any photo isn't doing its job.

CONSTRAINTS:
- Never describe the photo. Reference it through implication.
- Never explain the joke.
- One template = one joke. Don't repeat ideas across templates.
- Each suggestion must work as a standalone post.

OUTPUT:
- Always call submit_meme_suggestions with EXACTLY 6 items.
- Each item MUST have a DIFFERENT templateId — one for each of: classic, caption-bar, top-caption, subtitle, stamp, headline.
- Each item also has a top-level "label" field — a punchy, lowercase, ≤ 8-word picker-card title. This is a SUMMARY of the joke, NOT the slot text. It is unrelated to the "headline" slot inside the headline template.`

export const USER_PROMPT = `Look at the attached photo. Write a sharp, photo-specific meme caption for each of these six templates. Each gets its OWN joke, not variations of the same idea.

1. classic — Impact font, top + bottom. Setup → punchline.
   slots: { top: string, bottom: string }
   ALL CAPS. Each line ≤ 6 words.

2. caption-bar — modern reaction format, single line under the photo.
   slots: { caption: string }
   lowercase. ≤ 10 words. observational. think TikTok comment.

3. top-caption — Twitter-style. White panel above the photo introduces the photo as a punchline.
   slots: { caption: string }
   lowercase, ≤ 14 words. ends with a colon or em-dash.

4. subtitle — single white subtitle line at bottom, Wes Anderson screencap energy.
   slots: { subtitle: string }
   sentence case, ≤ 12 words, oddly profound or quietly resigned.

5. stamp — big "VERDICT: X" badge in a corner.
   slots: { stamp: string }
   format "VERDICT: ____", where ____ is 1–3 words, ALL CAPS, surprising.

6. headline — newspaper-style headline + dek.
   slots: { headline: string, dek: string }
   headline is a satirical news headline (≤ 8 words);
   dek is a one-line subheading that twists it further (≤ 14 words).

Each suggestion must reference something specific about the photo.`

export const SUGGESTION_TOOL = {
  name: 'submit_meme_suggestions',
  description:
    'Submit exactly six photo-aware meme suggestions, one per template id.',
  input_schema: {
    type: 'object',
    required: ['suggestions'],
    properties: {
      suggestions: {
        type: 'array',
        minItems: 6,
        maxItems: 6,
        items: {
          type: 'object',
          required: ['templateId', 'texts', 'label'],
          properties: {
            templateId: {
              type: 'string',
              enum: [
                'classic',
                'caption-bar',
                'top-caption',
                'subtitle',
                'stamp',
                'headline',
              ],
            },
            label: {
              type: 'string',
              description: 'punchy ≤ 8-word picker-card title for this suggestion (NOT the slot text)',
            },
            texts: {
              type: 'object',
              description: 'keys are the slot ids for the chosen template',
              additionalProperties: { type: 'string' },
            },
          },
        },
      },
    },
  },
}

/**
 * Default fallback suggestions used:
 *   1. when mode.claude === 'mock' (no API key)
 *   2. as a graceful fallback if the Claude call fails
 */
export const MOCK_SUGGESTIONS = [
  {
    templateId: 'classic',
    label: 'when the bug fixes itself',
    texts: { top: 'WHEN THE BUG FIXES ITSELF', bottom: "BUT YOU DON'T KNOW WHY" },
  },
  {
    templateId: 'caption-bar',
    label: 'pov: you finally shipped it',
    texts: { caption: 'pov: you finally finished the side project' },
  },
  {
    templateId: 'top-caption',
    label: 'me after one cup of coffee',
    texts: { caption: 'me, an intellectual, after one cup of coffee:' },
  },
  {
    templateId: 'subtitle',
    label: 'wes anderson energy',
    texts: { subtitle: 'and that’s how I knew the demo was going to crash.' },
  },
  {
    templateId: 'stamp',
    label: 'verdict: iconic',
    texts: { stamp: 'VERDICT: ICONIC' },
  },
  {
    templateId: 'headline',
    label: 'local dev discovers inner peace',
    texts: {
      headline: 'Local Dev Discovers Inner Peace',
      dek: 'sources confirm it lasted twelve minutes.',
    },
  },
]
