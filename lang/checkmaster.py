# -*- coding: utf-8 -*-
import json
import io

fileInMaster="lang_master.json"
fileInEn="lang_en.json"
langEn=json.load(open(fileInEn,'r'))
langMaster=json.load(open(fileInMaster,'r'))

for en in langEn:
    if langMaster.get(en,'NONE')=='NONE':
        print('%s not found'%en)
