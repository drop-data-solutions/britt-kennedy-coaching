Gallery videos (Brittany's own clips only, no stock or AI)

To add a video:
1. Crop out any captions, stickers or app text (keep her feet in frame).
   ffmpeg -i in.mp4 -vf "crop=iw:ih-BOTTOM_PX:0:0" -an out.mp4
2. Strip the audio (music is often copyrighted). The -an flag above does this.
3. Keep it short (about 20 s or less) and 1.5 MB or less. If it is bigger:
   ffmpeg -i out.mp4 -an -c:v libx264 -crf 26 -preset slow -vf "scale=360:-2" -movflags +faststart videos/britt-NAME.mp4
   If it is already small: ffmpeg -i out.mp4 -an -c copy -movflags +faststart videos/britt-NAME.mp4
4. Make a poster frame (a good moment, 150 KB or less):
   ffmpeg -ss 3.5 -i videos/britt-NAME.mp4 -frames:v 1 -q:v 4 videos/britt-NAME-poster.jpg
5. In index.html, find the "VIDEO BLOCK" comment in the #gallery section, copy the
   <figure class="gallery-video"> block, and change src, poster, width/height and aria-label
   (describe what she is doing, e.g. "Britt doing a kettlebell swing at Big North Barbell").

The page plays each video muted and looped only while it is on screen, and pauses it
when scrolled away. Visitors who prefer reduced motion get play controls instead of autoplay.
Tap or click a playing video to pause it. Portrait clips are shown in the same 4:5 card
as the photos, anchored to the bottom so feet are never trimmed.
