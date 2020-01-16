# -*- coding: utf-8 -*-
import json
import io
import argparse
parser=argparse.ArgumentParser(prog="checklang.py", description="Updates the gwcat-data database")
parser.add_argument('-l','--lang', dest='lang', type=str, default='master', help='language to compare (Default = master)')
parser.add_argument('--in', dest='inlang', type=str, default='en', help='input language to compare from  (Default = en)')
parser.add_argument('-b','--both', dest='both', action='store_true', default=False, help='check in both directions (Default = False)')
args=parser.parse_args()
lang=args.lang
inlang=args.inlang
both=args.both

fileInComp="lang_{}.json".format(lang)
fileInIn="lang_{}.json".format(inlang)

langIn=json.load(open(fileInIn,'r'))
langComp=json.load(open(fileInComp,'r'))

print('comparing {} with {}'.format(fileInIn,fileInComp))
for en in langIn:
    if langComp.get(en,'NONE')=='NONE':
        print('{} not found in {} [en = {}]'.format(en,lang,langIn[en]))

if both:
    print('comparing {} with {}'.format(fileInComp,fileInIn))
    for comp in langComp:
        if comp.find('section')==0 or comp.find('subsection')==0:
            continue
        if langIn.get(comp,'NONE')=='NONE':
            print('{} not found in "en" [{} = {}]'.format(comp,lang,langComp[comp]))
