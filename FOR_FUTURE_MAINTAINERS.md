# FOR FUTURE MAINTAINERS
## I
Hello. I am ID @fakefred from 2104, EFZ. You are unknown from unknown, EFZ.
You can find me, of course, and brag about how crappy my code is.
You can bloat, you have won 2 NOI champions, you built a bot the other day.

You can find me, I will be the one with Twenty Øne Piløts decals on my laptop.
You can find me, I will be the one who has various posters on his dorm wall.

I am pleased to know you are willing to maintain this code.
You might want to 'rewrite' this, rather than to maintain this sh*t.
I understand you; this piece of code is literally rewritten.
Took my August, September, October, and most of November.
Now I am typing a letter to someone who is imaginary.

Anyway, as you are here, there lies two possibilities:
(i) you are a junior school student, and are very interested in EFZ. (incl. me, as of June 2018)
(ii) you are already a freshman, and you heard there's this kind of thing.

If you feel confused, here's some clue:
this series of project is used on the Campus Culture and Art Festival of EFZ,
which is hosted by the Club Union. If you came/come to EFZ in March for the _zizhao_ program,
you probably have noticed/will notice posters which read 'Eternity'. That's the theme of this year's CCAF.

Of either of the two possibilities mentioned above, you are welcome to fork this repo and become a rockstar.
Actually, at the very first chance I entered the Tech Dept of Club Union,
of which I successfully became one of the four members.
Within the first few months you will have, very likely, _absolutely_ nothing to do.
But as time approaches December, you will be called ~~midnight~~ one day,
and you will attend a ~~assassination~~ meeting. That marks the beginning of CCAF.
People will ask you to do some real stuff, e.g. ~~miscellaneous assistance~~ a lottery system.

Okay, I might not have told this much - spoilers are not fun.

## II
### --How this ~~crap~~ works
This project uses socket.io to send data flow. Mind that, socket.io is not compatible with stock websocket (cite: socket.io docs)
Client ===[bullet dataflow]===> Server ===[manipulated bullet dataflow]===> Display  
Admin ===[bullet dataflow]===> Server ===[a little bit manipulated dataflow]===> Display  
Server ===[server status; blacklist and whitelist]===with an interval===> Admin  
Admin ===[blacklist and whitelist]===> Server  

Bet you have at least a little basis on danmaku system. In this entire codebase, 
'dan', 'danmaku' and 'bullet' all refer to the same object. 
I have made maintenance as easy as possible by using intuitiveVariableNames and also intuitive-class-and-id-names.
