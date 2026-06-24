# הוראות לClaude Code — עדכון project-log.json

## מה זה?
קובץ `project-log.json` בשורש הריפו הוא ממשק התקשורת בינך לבין לוח הבקרה של הפרויקט.
**חובה לעדכן אותו לאחר כל פעולה משמעותית.**

## מתי לעדכן?
- לאחר השלמת משימה → שנה status ל-`"done"` והוסף `completedAt`
- לפני שמתחיל משימה → הוסף פריט חדש עם status `"todo"`
- כשנתקל בחסימה → שנה status ל-`"blocked"` והוסף `note`
- כשקורא רעיונות של המשתמש → שנה status ל-`"todo"` כשמתחיל לבצע

## סטטוסים אפשריים
| status    | משמעות                        |
|-----------|-------------------------------|
| `todo`    | ממתין לביצוע                  |
| `done`    | הושלם                         |
| `blocked` | תקוע / דורש התערבות          |
| `idea`    | רעיון שהמשתמש הכניס — לקרוא! |

## פורמט הקובץ
```json
{
  "lastUpdated": "ISO 8601 timestamp",
  "tasks": [
    {
      "id": 1234567890,
      "title": "תיאור המשימה",
      "status": "todo|done|blocked|idea",
      "createdAt": "ISO 8601",
      "completedAt": "ISO 8601 (רק אם done)",
      "source": "claude-code|user",
      "note": "הערה אופציונלית"
    }
  ]
}
```

## כיצד לעדכן מ-CLI
```bash
# קרא את הקובץ הנוכחי
cat project-log.json

# עדכן עם Python (קצר ומהיר)
python3 -c "
import json, time
with open('project-log.json', 'r') as f:
    log = json.load(f)

# עדכן משימה קיימת
for task in log['tasks']:
    if task['id'] == TASK_ID:
        task['status'] = 'done'
        task['completedAt'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())

log['lastUpdated'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())

with open('project-log.json', 'w', encoding='utf-8') as f:
    json.dump(log, f, ensure_ascii=False, indent=2)
print('Updated!')
"

# הוסף משימה חדשה
python3 -c "
import json, time
with open('project-log.json', 'r') as f:
    log = json.load(f)

log['tasks'].append({
    'id': int(time.time() * 1000),
    'title': 'שם המשימה כאן',
    'status': 'todo',
    'createdAt': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime()),
    'source': 'claude-code'
})
log['lastUpdated'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())

with open('project-log.json', 'w', encoding='utf-8') as f:
    json.dump(log, f, ensure_ascii=False, indent=2)
print('Task added!')
"

# Push לGitHub
git add project-log.json && git commit -m "chore: update project-log" && git push
```

## קריאת רעיונות מהמשתמש
```bash
# בדוק אם יש רעיונות חדשים
python3 -c "
import json
with open('project-log.json') as f:
    log = json.load(f)
ideas = [t for t in log['tasks'] if t['status'] == 'idea']
for idea in ideas:
    print(f\"ID: {idea['id']} | {idea['title']}\")
"
```
כשאתה מתחיל לבצע רעיון — שנה את הסטטוס שלו ל-`todo`, ולאחר השלמה ל-`done`.
