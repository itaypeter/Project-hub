# Weekly Inbox Review

Use this every week to process everything captured since last session.

---

## Step 1 — Drop your captures into the Claude chat

- Screenshots / photos of ideas or UI inspiration
- Apple Reminders inbox (copy-paste the list)
- Voice memo transcripts
- Links, articles, anything worth saving

---

## Step 2 — Paste this prompt

```
Process my weekly inbox. For everything I just shared:

1. Extract ideas — pull out any product ideas, features, or tasks.
   For each one, identify which app it belongs to (archlog, coparent-hub,
   j-krish, ledgerdary, life-hub, listo, matrix, price-tracker, project-hub,
   sharks, soulmatch, swisswander — or a new app if it's something new).

2. Route to context files — append each idea to the right
   context/<app>.md file in itaypeter/Project-hub on GitHub under ## Ideas.

3. Promote ready tasks — if any idea is specific and actionable enough
   to build right now, add it to app/project-log.json as "status": "idea"
   so the autopilot picks it up on the next run.

4. Summarize — give me a short list of what went where so I can
   clear my Apple Reminders inbox and iCloud capture folder.

Date: [today's date]
```

---

## Step 3 — After Claude processes it

- Clear your Apple Reminders inbox (swipe all done)
- Empty your iCloud `Lapricode Inbox` folder
- Promoted tasks will be picked up automatically by the next autopilot run

---

*Run this every Monday morning. Takes 5 minutes.*
