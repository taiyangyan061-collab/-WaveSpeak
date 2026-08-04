# WaveSpeak CONTENT ENGINE v8

This version keeps all v7 and Creative Sound Lab features and adds a scalable content system.

Architecture:
- `content-catalog.json`: structured sentence, chunk, phrasal-verb, sound-term, dictation, and studio records
- `topic-index.json`: fast topic-to-content index
- Content Engine screen: catalog counts, topic browser, adaptive daily plan, and local spaced review
- Each sentence has an ID, topic, CEFR level, focus, chunk references, audio reference, tags, and review intervals

Current seed database:
- 70 daily sentences
- Unique normalized chunks
- 70 phrasal verbs
- Sound-design vocabulary
- Dictations and studio scenarios

The important change is that future content can be appended to JSON records without rewriting the app interface.

Upload every file and the entire `audio` folder.
Confirm deployment by checking for `CONTENT ENGINE v8`.
