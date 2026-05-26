# SmartQuiz

SmartQuiz is a modern, JSON-powered quiz and study platform built with React, Vite, Tailwind CSS, Radix UI, and Recharts.

It ships with a cybersecurity awareness sample bank for end users, but the real value is the reusable engine: swap the JSON file and SmartQuiz becomes a practice app for certifications, official exams, language learning, interviews, onboarding, compliance training, or classroom education.

## Why SmartQuiz

- **Fast to adapt:** question banks are plain JSON, and the exam profile can be edited from Settings.
- **No backend required:** progress, language, test limits, and attempts are stored locally in the browser.
- **Study plus assessment:** learners can review explanations in study mode, then take randomized practice tests.
- **Built-in question editor:** admins can add, search, paginate, edit, duplicate, delete, import, and export questions from Settings.
- **Reusable by domain:** works for cybersecurity, PMP, Azure, AWS, CompTIA, Cisco, NCLEX, real estate, citizenship, English learning, technical interviews, K-12 practice, and internal corporate training.
- **GitHub-friendly:** no private access codes, proprietary assets, personal emails, or vendor-specific content.
- **Product-ready foundation:** modern responsive UI, 50-question bilingual sample content, score tracking, progress charts, gamified XP, and configurable test limits.

## Demo Content

The included sample is a 50-question high-level cybersecurity awareness assessment for non-technical users. It covers:

- Phishing indicators and suspicious messages
- Unsafe links, attachments, and payment-change requests
- Malware warning signs and safe response habits
- Passwords, multi-factor prompts, privacy, and reporting

The sample lives in:

```txt
src/components/data/cybersecurityAwarenessQuestions.json
```

## Features

- Bilingual question bank example: English and Spanish
- Module cards with limits and availability
- Randomized test generation
- Answer feedback with explanations
- Pass/fail result screen
- Gamified results with XP, levels, level-up moments, and lightweight celebration animations
- Study mode using the same question bank
- Progress dashboard with learning level, score trend, category performance, per-question review insights, and recent attempts
- Local settings for test limits and counter resets
- Editable exam profile for app name, domain, hero copy, module labels, passing score, and quiz length
- Local question CRUD with debounced search, pagination, duplication, base-question overrides, and soft deletes
- Optional question metadata for difficulty and tags
- JSON import/export for backups and content migration
- Responsive app shell with modern SaaS-style design

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Radix UI primitives
- Recharts
- Framer Motion
- Lucide icons

## Getting Started

```bash
npm install
npm run dev
```

Then open the local Vite URL printed in the terminal.

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Question Bank Schema

Create a JSON file with language keys and question arrays:

```json
{
  "en": [
    {
      "id": "phish-001",
      "category": "phishing_awareness",
      "block_id": 1,
      "block_name": "Suspicious Messages",
      "difficulty": "beginner",
      "tags": ["phishing", "urgency", "verification"],
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 2,
      "explanation": "Short teaching explanation."
    }
  ],
  "es": [
    {
      "id": "phish-001",
      "category": "phishing_awareness",
      "block_id": 1,
      "block_name": "Mensajes sospechosos",
      "difficulty": "beginner",
      "tags": ["phishing", "urgencia", "verificacion"],
      "question": "Texto de la pregunta",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 2,
      "explanation": "Explicacion breve."
    }
  ]
}
```

Fields:

- `id`: stable identifier for the question.
- `category`: module key used by Home, Quiz, Progress, and Settings.
- `block_id`: numeric topic group used by study filters.
- `block_name`: visible topic name.
- `difficulty`: optional level such as `beginner`, `intermediate`, or `advanced`.
- `tags`: optional array of short labels for filtering, review, and analytics.
- `question`: question text.
- `options`: answer choices.
- `correct_answer`: zero-based index of the correct option.
- `explanation`: teaching note shown after answering and in study mode.

To replace the sample, import your file in:

```txt
src/components/data/index.jsx
```

Then update labels and module cards in:

```txt
src/components/language/LanguageProvider.jsx
src/pages/Home.jsx
```

## Managing Questions In The App

SmartQuiz includes a local question bank manager in `Settings`.

From the UI, users can:

- Add new questions.
- Search by question text, topic, answer option, explanation, difficulty, or tag.
- Navigate large banks with pagination and page-size controls.
- Use a compact desktop table or mobile-friendly question cards.
- Add difficulty and tags to support smarter review and analytics.
- Edit bundled sample questions through local overrides.
- Duplicate existing questions to create variants quickly.
- Delete bundled or custom questions locally.
- Filter by language, category, and source.
- Export a JSON backup of all local edits.
- Import a SmartQuiz JSON backup or a plain `{ "en": [], "es": [] }` question bank.
- Restore the bundled sample bank.

The bundled JSON file is never modified at runtime. Local changes are stored in:

```txt
smartquiz_question_bank_customizations
```

This keeps the project safe for static hosting while still giving users a practical editing workflow.

## Adapting The Exam Profile

Settings also includes an editable exam profile. Without changing source code, users can customize:

- App name and subtitle.
- Hero headline and description.
- Domain label, such as cybersecurity, medical, language, cloud, or interview prep.
- Passing score.
- Number of questions per test.
- Module names and descriptions in English and Spanish.

The profile is stored locally in:

```txt
smartquiz_exam_profile
```

This lets the same interface support cybersecurity awareness, AWS/Azure exam prep, medical review, English learning, corporate training, or technical interview practice.

## Project Structure

```txt
src/
  components/
    data/       JSON bank and data adapter
    profile/    editable exam profile and defaults
    gamification/ XP, levels, and reward calculation
    language/   UI translations and language state
    quiz/       cards, questions, results, limits
    settings/   question bank manager
    theory/     study-mode cards
    ui/         reusable Radix/shadcn-style primitives
  pages/
    Home.jsx
    Theory.jsx
    Quiz.jsx
    Progress.jsx
    Settings.jsx
```

## Opportunities

SmartQuiz can become:

- A certification prep product with paid premium question packs.
- A corporate training portal for compliance, cybersecurity, HR, and onboarding.
- A language-learning quiz app with bilingual explanations.
- A technical interview preparation tool by role and seniority.
- A school or tutoring platform with topic-based practice.
- A public-sector exam prep app for citizenship or licensing exams.

Because the app is JSON-first and frontend-only, it is easy to prototype, publish, fork, and customize.

## Privacy

SmartQuiz does not send quiz attempts anywhere. Progress is stored in the user's browser using `localStorage`.

## License

MIT. See [LICENSE](LICENSE).
