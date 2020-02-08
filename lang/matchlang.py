# -*- coding: utf-8 -*-
import json
import io

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

print(conv)

lang='cy'
fileInLang="../bhbubble-lang/%s.json"%lang
langIn=json.load(io.open(fileInLang,'r'))[0]
langConv={}
for l in langIn:
    if (l in conv):
        print(l,conv[l])
        langConv[conv[l]]=langIn[l]
    else:
        print("can't find %s"%l)

print(langConv)
fileOutLang=io.open('../lang/lang_%s_2.json'%lang,'w',encoding='utf8')
data= json.dumps(langConv,indent=4,ensure_ascii=False,encoding='utf8')
fileOutLang.write(str(data))
fileOutLang.close()