import json

fileInOld="../bhbubble-lang/en.json"
fileInNew="../lang/lang_en.json"
langOld=json.load(open(fileInOld,'r'))[0]
langNew=json.load(open(fileInNew,'r'))

conv={}
for o in langOld:
    ov=langOld[o]
    for n in langNew:
        nv=langNew[n]
        if nv==ov:
            conv[o]=n

print conv

lang='fr'
fileInLang="../bhbubble-lang/%s.json"%lang
langIn=json.load(open(fileInLang,'r'))[0]
langConv={}
for l in langIn:
    if (conv.has_key(l)):
        print l,conv[l]
        langConv[conv[l]]=langIn[l]
    else:
        print "can't find %s"%l

print langConv
fileOutLang=open('../lang/lang_%s_2.json'%lang,'w')
json.dump(langConv,fileOutLang,indent=4)
fileOutLang.close()