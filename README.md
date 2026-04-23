# Framework Templatizer Chrome Extension

Convert specific sales emails and frameworks into reusable templates using the Junoleads copywriting framework syntax.

## Features

- **AI-Powered Templatization**: Uses Claude Sonnet 4.6 with the system prompt cached for fast reruns
- **New Framework Syntax**: Output uses the six-segment spec (`{variable}`, `[{clean-variable}]`, `` `FORMULA()` ``, `::instruction::`, `"verbatim"`, plain text)
- **Direct Notion Integration**: Creates Framework pages directly in the Frameworks database
- **Optional Channel & Subject Line**: Set Channel (Email / LinkedIn) and optionally pre-write a Subject Line Framework; for first-touch frameworks without one provided, the AI auto-generates a subject line framework too
- **Simple UI**: Dark theme matching the Junoleads design system

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this extension folder

## Usage

1. Click the extension icon in Chrome toolbar
2. Paste the framework/email you want to templatize
3. Optionally provide a title (AI will generate one if left empty)
4. Select the step type (First-touch or Follow-up)
5. Optionally select Channel (Email / LinkedIn)
6. Optionally provide a Subject Line Framework (first-touch only; auto-generated otherwise)
7. Click "Templatize"
8. Click the link to open the new Framework in Notion

## Output Format — Copywriting Framework Syntax

See `-tasks/architecture/copywriting/copywriting-system-architecture.md` §1 for the full spec. The six segment types:

- `{variable}` — deterministic substitution from request data (kebab-case names)
- `[{clean-variable}]` — LLM-cleaned variable (e.g., "Chief Executive Officer" → "CEO")
- `` `FORMULA()` `` — deterministic conditional logic (`IF`, `COALESCE`, `NOTEMPTY`, etc.)
- `::instruction::` — creative AI fill zone
- `"verbatim"` — word-for-word text (CTAs, hooks)
- Plain text — tone/flow guidance the agent adapts naturally

### Example output

```
Hi [{first-name}],
::brief introduction to our product and what we do::
`IF(NOTEMPTY({trigger}), ::reference {trigger} and connect to our solution::, ::general pain point for their industry::)`
::Short social proof example including stats::, which helped ::overall benefit::
`IF({colleague-name}, "Should I ask [{colleague-name}] about this?", "Let me know what you think.")`
"I can set up a quick 15-min demo if you're interested?"
```
