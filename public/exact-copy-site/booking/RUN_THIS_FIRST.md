> LEGACY REFERENCE ONLY. This document predates the current PA LINE Platform Beta. Use `/CURRENT_SOURCE_OF_TRUTH.md` for current development.

# RUN THIS FIRST

## Fastest way to start

You only need **Node.js** and **Visual Studio Code**.

1. Extract the project ZIP.
2. Open the extracted `PA_LINE_Booking_VSCode_Copilot_v50` folder.
3. Double-click `PA_LINE_Booking.code-workspace`, or open the folder in VS Code.
4. Open a terminal in VS Code.
5. Run:

```bash
npm run validate
npm run dev
```

6. Open:

```text
http://localhost:5173
```

The basic development server uses only Node.js. You do **not** need `npm install` just to run the prototype.

## When you want Vite hot reload / a production build

Run once:

```bash
npm install
```

Then you can use:

```bash
npm run dev:vite
npm run build
npm run preview
```

## Start Copilot safely

Open `COPILOT_START_PROMPT.md`, copy all of it, paste it into Copilot Chat, and let Copilot read the instruction/context files before editing.

Do not ask Copilot to "rewrite the whole app in React" as the first step. The current application has working business logic that should be protected by tests before a framework migration.
