# -*- coding: utf-8 -*-
import json
import io
import argparse
parser=argparse.ArgumentParser(prog="checklang.py", description="Updates the gwcat-data database")
parser.add_argument('-l','--lang', dest='lang', type=str, default='master', help='language to compare')
args=parser.parse_args()
lang=args.lang

fileInComp="lang_{}.json".format(lang)
fileInEn="lang_en.json"
print('comparing {} with {}'.format(fileInEn,fileInComp))

langEn=json.load(open(fileInEn,'r'))
langComp=json.load(open(fileInComp,'r'))

for en in langEn:
    if langComp.get(en,'NONE')=='NONE':
        print('{} not found in {} [en = {}]'.format(en,lang,langEn[en]))

for comp in langComp:
    if langEn.get(comp,'NONE')=='NONE':
        print('{} not found in "en" [{} = {}]'.format(en,lang,langComp[comp]))
