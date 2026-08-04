export const CREATIVE = {
 categories:{
  "Atmosphere & Emotion":[
   ["eerie","strangely unsettling or uncanny","An eerie high tone hangs above the scene, making the familiar room feel unsafe."],
   ["ominous","suggesting that something threatening may happen","A low, ominous drone foreshadows the character’s arrival."],
   ["haunting","emotionally persistent and difficult to forget","The haunting vocal fragment returns like a memory that cannot be erased."],
   ["ethereal","light, delicate, and seemingly otherworldly","An ethereal layer of harmonics floats above the dialogue."],
   ["oppressive","heavy, restrictive, or psychologically suffocating","The oppressive low-frequency pressure makes the space feel impossible to escape."],
   ["serene","calm, peaceful, and balanced","A serene field of soft wind and distant birds opens the scene."],
   ["dreamlike","resembling a dream; blurred, fluid, or unreal","The dreamlike transition dissolves the boundary between memory and present time."]
  ],
  "Timbre & Texture":[
   ["grainy","rough, particulate, or made of many small sonic fragments","The recording has a grainy texture that reveals the instability of the signal."],
   ["brittle","thin, hard, and easily perceived as breaking","The brittle high frequencies make each impact feel fragile and sharp."],
   ["glassy","clear, hard, smooth, and bright like glass","A glassy synth tone reflects light without feeling warm."],
   ["metallic","resembling resonating metal","The metallic resonance gives the footsteps an industrial character."],
   ["abrasive","harsh and physically irritating","An abrasive band of noise cuts through the mix and creates discomfort."],
   ["muffled","softened or obscured, with reduced high frequencies","The muffled dialogue sounds as if it is coming through a wall."],
   ["resonant","rich in sustained or emphasized frequencies","The resonant body of the drum makes the room feel larger."],
   ["warm","full, rounded, and comfortable, often with strong low-mid energy","A warm saturated pad supports the performer without drawing attention."],
   ["saturated","enriched or compressed through harmonic distortion","The saturated tape texture gives the memory sequence a worn physical presence."]
  ],
  "Space & Distance":[
   ["intimate","very close, private, and immediate","The intimate breathing places the listener inside the character’s personal space."],
   ["distant","far away or psychologically removed","A distant siren suggests the city without defining a precise location."],
   ["enclosed","contained within a small or restricted space","The enclosed reflections make the room feel airless."],
   ["cavernous","extremely large, deep, and echoing","The cavernous reverb transforms the corridor into an impossible architecture."],
   ["diffuse","spread broadly without a precise source","A diffuse noise field surrounds the audience without revealing its origin."],
   ["localized","clearly positioned at a specific point","The localized whisper moves from the rear-left speaker to the center."],
   ["immersive","surrounding and involving the listener","The immersive sound field places the audience inside the storm."],
   ["dry","with little or no reverberation","The dry voice feels direct, exposed, and emotionally close."],
   ["reverberant","rich in reflections and sustained spatial decay","The reverberant bell connects the present action to the memory of the church."]
  ],
  "Movement & Transformation":[
   ["emerge","to become gradually audible or perceptible","A low pulse emerges from the room tone."],
   ["dissolve","to fade or lose definition gradually","The mechanical rhythm dissolves into breath."],
   ["swell","to increase gradually in intensity or size","The strings swell beneath the final line."],
   ["recede","to move away or become less prominent","The traffic recedes as the character enters the interior space."],
   ["drift","to move slowly without a fixed direction","Fragments of speech drift across the surround field."],
   ["accumulate","to gather or increase through addition","Small clicks accumulate into a dense rhythmic mass."],
   ["scatter","to spread rapidly in multiple directions","The granular fragments scatter across the speaker array."],
   ["morph","to transform gradually from one identity into another","The train sound morphs into a sustained vocal tone."],
   ["collapse","to break down suddenly or lose structure","The layered sound world collapses into a single dry breath."]
  ],
  "Density, Rhythm & Energy":[
   ["sparse","containing few elements with significant space between them","A sparse texture leaves room for the audience to notice each breath."],
   ["dense","containing many simultaneous or closely packed elements","The dense mix creates sensory overload."],
   ["layered","constructed from multiple distinguishable levels","The layered ambience combines traffic, voices, ventilation, and distant music."],
   ["fragmented","broken into incomplete or discontinuous parts","Fragmented speech mirrors the character’s unstable memory."],
   ["restrained","controlled and deliberately limited","The restrained score avoids forcing the emotional interpretation."],
   ["chaotic","disordered, unpredictable, and highly active","A chaotic burst of alarms and footsteps overwhelms the scene."],
   ["pulsating","moving or repeating with a regular energetic pulse","A pulsating bass tone drives the transition forward."]
  ],
  "Creative & Dramaturgical":[
   ["sonic world","the complete aural environment and aesthetic logic of a work","The sonic world combines domestic realism with unstable electronic memory."],
   ["sonic motif","a recurring sound idea associated with a character, theme, or action","The closing door becomes a sonic motif for separation."],
   ["emotional arc","the progression of emotional intensity or character experience","The emotional arc moves from serenity to psychological pressure."],
   ["dramatic tension","sonic pressure that supports uncertainty, conflict, or expectation","The unresolved pulse increases dramatic tension without becoming louder."],
   ["psychological space","an aural environment representing an internal mental state","The distorted room tone creates a psychological space rather than a realistic room."],
   ["sonic memory","a sound that functions as remembered experience","The childhood song returns as a degraded sonic memory."],
   ["sense of place","the recognizable identity and atmosphere of a location","The layered street recordings establish a specific sense of place."],
   ["narrative function","the role sound plays in communicating or structuring the story","The silence has a narrative function: it marks the moment the character understands the loss."]
  ]
 },
 listening:[
  {type:"eerie",choices:["eerie","serene","warm"],explain:"The unstable high partials and low drone create an eerie, uncanny atmosphere."},
  {type:"muffled",choices:["muffled","glassy","resonant"],explain:"The reduced high frequencies and softened attack make the sound muffled."},
  {type:"cavernous",choices:["intimate","dry","cavernous"],explain:"Long delays and repeating reflections create a cavernous sense of scale."},
  {type:"pulsating",choices:["pulsating","sparse","restrained"],explain:"A repeating amplitude pattern creates a pulsating energy."},
  {type:"accumulate",choices:["scatter","accumulate","recede"],explain:"More layers enter over time, so the texture accumulates."}
 ],
 comparisons:[
  {title:"Eerie vs. Ominous",prompt:"A strange, uncanny toy melody makes the room feel subtly wrong, but no specific threat is suggested.",answer:"eerie",options:["eerie","ominous"],explain:"Use eerie for uncanniness. Use ominous when the sound strongly suggests future danger."},
  {title:"Warm vs. Muffled",prompt:"The voice has rich low-mid energy and soft harmonics, but it remains clear and intelligible.",answer:"warm",options:["warm","muffled"],explain:"Warm describes a pleasing tonal balance. Muffled means clarity is obscured by reduced high frequencies."},
  {title:"Diffuse vs. Distant",prompt:"Noise surrounds the audience from many speakers, and no exact source can be located.",answer:"diffuse",options:["diffuse","distant"],explain:"Diffuse describes spread and unclear localization. Distant describes perceived physical or psychological distance."},
  {title:"Dense vs. Layered",prompt:"The ambience contains several clearly distinguishable levels: traffic, voices, wind, and machinery.",answer:"layered",options:["dense","layered"],explain:"Layered emphasizes organized levels. Dense emphasizes the amount and compactness of material."},
  {title:"Dissolve vs. Recede",prompt:"A rhythmic texture gradually loses its identity and becomes an undifferentiated wash.",answer:"dissolve",options:["dissolve","recede"],explain:"Dissolve means losing definition. Recede means moving farther away or becoming less prominent."}
 ],
 contexts:{
  "Critique":"The sound begins with a {atmosphere}, {timbre} texture in a {space} space. It gradually {movement}s, creating {drama}.",
  "Presentation":"My design establishes a {atmosphere} sonic world through {timbre} material and a {space} spatial perspective. As the scene develops, the sound {movement}s to support {drama}.",
  "Portfolio":"This project explores a {atmosphere} sound language built from {timbre} textures and a {space} listening perspective. The material {movement}s across the piece, giving the sound a clear {drama}.",
  "Director Conversation":"I’m thinking of making this moment more {atmosphere}. We could use a {timbre} texture that feels {space}, then let it {movement} so it strengthens the {drama} without covering the dialogue."
 }
};
