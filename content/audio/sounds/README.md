# Recorded sounds

Recordings that stand in for a sound character's prompts (`recordings` in [`config.json`](../config.json)). Each is cut from a CC0 recording, faded at both ends and levelled to about −3 dBFS peak (the soft bark and the whine and growl lower).

| File                  | Line           | Source (CC0, Joseph Sardin, [BigSoundBank](https://bigsoundbank.com/licenses.html)) | Cut                             |
| --------------------- | -------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| `dog/haf.mp3`         | Haf!           | [Small dog barking, s0612](https://bigsoundbank.com/small-dog-barking-s0612.html)   | 7.25–7.60 s                     |
| `dog/haf-soft.mp3`    | Haf.           | s0612                                                                               | 25.70–26.05 s, −8 dB            |
| `dog/haf-haf.mp3`     | Haf! Haf!      | s0612                                                                               | 29.80–30.50 s                   |
| `dog/haf-haf-haf.mp3` | Haf! Haf! Haf! | s0612                                                                               | 29.80–30.50 s, then 7.25–7.60 s |
| `dog/whine.mp3`       | Kňu…           | [Dog singing 1, s2450](https://bigsoundbank.com/dog-singing-1-s2450.html)           | 0.05–1.65 s                     |
| `dog/growl.mp3`       | Vrrr…          | [Barking dog 3, s2955](https://bigsoundbank.com/barking-dog-3-s2955.html)           | 0.22–1.45 s, after the bark     |

The clip's hash is the line's, not the file's: after replacing a recording, regenerate that line with `--force --only "<text>"`.
