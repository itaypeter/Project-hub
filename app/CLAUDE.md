# הוראות לClaude Code — project-log.json

## העיקרון החשוב ביותר
**פעל בצורה עצמאית. אל תשאל שאלות אלא אם אתה באמת חסום.**
המשתמש רוצה לראות תוצאות, לא לנהל תהליך. קבל החלטות בעצמך, בצע, ולאחר מכן דווח מה עשית.

---

## מתי לשאול שאלה (רק במקרים אלה)
- בחירה שלא ניתן לבטל ושמשפיעה על ארכיטקטורה מרכזית
- מידע שרק המשתמש יודע (credentials, API key, domain-specific requirement)
- שני כיוונים שקולים לחלוטין שמשפיעים על UX נראה למשתמש

אם אתה יכול לנחש, לחקור, או לפעול לפי Best Practice — עשה זאת. **אל תשאל.**

---

## פורמט הקובץ

```json
{
  "lastUpdated": "ISO 8601 timestamp",
  "tasks": [
    {
      "id": 1234567890,
      "title": "תיאור המשימה",
      "status": "todo|done|blocked|idea",
      "type": "task|question|output",
      "createdAt": "ISO 8601",
      "completedAt": "ISO 8601 (רק אם done)",
      "source": "claude-code|user",
      "note": "הערה — מה עשית, למה, מה השתנה",
      "commitUrl": "https://github.com/... (אם רלוונטי)"
    }
  ]
}
```

---

## סטטוסים

| status    | משמעות                        |
|-----------|-------------------------------|
| `todo`    | ממתין לביצוע                  |
| `done`    | הושלם                         |
| `blocked` | תקוע — דורש התערבות          |
| `idea`    | רעיון מהמשתמש — לקרוא ולבצע |

---

## כיצד לכתוב שאלה (type: "question")

השתמש בזה רק כשאתה חייב תשובה מהמשתמש לפני שתוכל להמשיך:

```json
{
  "id": 1750000000000,
  "type": "question",
  "title": "שאלה קצרה וברורה?",
  "options": ["אפשרות א", "אפשרות ב", "תחליט בעצמך"],
  "status": "idea",
  "source": "claude-code",
  "createdAt": "2026-06-27T10:00:00.000Z",
  "note": "הסבר קצר למה אתה צריך את ההחלטה הזו"
}
```

- **תמיד כלול `options`** — 2-4 אפשרויות כולל "תחליט בעצמך" כשרלוונטי
- **title חייב להיות שאלה ישירה** — לא "צריך עזרה", אלא "PostgreSQL או SQLite?"
- **בצע עבודה מקסימלית לפני שאתה שואל** — אל תשאל על הכיוון הכללי, שאל רק על הנקודה הספציפית

כשהמשתמש ענה (`status: "done"`, `answer` field), קרא את הקובץ מחדש, עבד את התשובה, והמשך.

---

## כיצד לדווח על תוצאות (source: "claude-code")

לאחר כל פעולה משמעותית, הוסף task עם `source: "claude-code"` ופרט **מה עשית בפועל**:

```json
{
  "id": 1750000000001,
  "title": "הוספתי endpoint לאימות JWT",
  "status": "done",
  "source": "claude-code",
  "createdAt": "...",
  "completedAt": "...",
  "note": "יצרתי POST /auth/verify ב-routes/auth.js. משתמש ב-jsonwebtoken עם HS256. הוספתי middleware ל-protected routes. לא שיניתי את schema של DB.",
  "commitUrl": "https://github.com/owner/repo/commit/abc123"
}
```

**note חייב לכלול:**
- מה קבצים שינית / יצרת
- החלטות שקיבלת בעצמך ולמה
- מה לא שינית (למניעת בלבול)

---

## רצף עבודה טיפוסי

1. קרא `project-log.json`
2. מצא tasks עם `status: "idea"` — אלה הרעיונות של המשתמש
3. שנה status ל-`"todo"` ו-push (מסמן שהתחלת)
4. בצע את העבודה עצמאית — קבל החלטות, כתוב קוד
5. שנה status ל-`"done"`, הוסף `note` עם סיכום, ו-push

---

## עדכון מהיר מ-CLI

```bash
python3 -c "
import json, time
with open('project-log.json') as f: log = json.load(f)

# עדכן task קיים
for t in log['tasks']:
    if t['id'] == TASK_ID:
        t['status'] = 'done'
        t['completedAt'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
        t['note'] = 'מה שעשיתי כאן'

log['lastUpdated'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
with open('project-log.json', 'w', encoding='utf-8') as f:
    json.dump(log, f, ensure_ascii=False, indent=2)
"

git add project-log.json && git commit -m "chore: update project-log" && git push
```
