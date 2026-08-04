# WaveSpeak SIMPLE TTS v13

This version starts from the function-complete v10 package.

Playback changes:
- Removes the voice dropdown
- Removes cached/stored voice objects
- Removes uploaded TTS audio
- Calls `speechSynthesis.getVoices()` fresh every time Listen is clicked
- Prefers a normal en-US voice such as Samantha
- Falls back to any available English voice or the browser default
- Phrase-by-Phrase also requests a fresh voice for every phrase

All existing learning content and features remain unchanged.

Upload every file and the complete `audio` folder.
Confirm deployment by checking for `SIMPLE TTS v13`.
