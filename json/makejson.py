# make json file
import json
import re

fileIn=open('bbh-test.json','r')
lang='en-US'
fileOutAll=open('bbh-test_%s.json'%(lang),'w')
fileOutDataDict=open('datadict_%s.json'%(lang),'w')
fileOutLang=open('langdict_%s.json'%(lang),'w')
fileOutEvents=open('events.json','w')

jsIn=json.load(fileIn)
# extract language dictionary
lang=jsIn['langdict'][lang]

datadict=jsIn['datadict']
events=jsIn['events']
links=jsIn['links']

def replacekeys(holder,transdict):
    for key in holder:
        if type(holder[key])==dict:
            # cascade into sub-dict
            print 'entering:',key
            holder[key]=replacekeys(holder[key],transdict)
        if type(holder[key])==unicode:
            #check for text within % delimiters
            for dkey in re.findall("\%(.*?)\%",holder[key]):
                try:
                    # replace text (including % delimeters)
                    holder[key]=holder[key].replace('%%%s%%'%dkey,transdict[dkey])
                except:
                    # report error (but continue without replacing anything)
                    print 'Unknown key: %s'%(dkey)
    return holder

print 'replacing names in datadict'
datadict=replacekeys(datadict,lang)

print('replacing domains in links')
domains=links['domains']
links=replacekeys(links,domains)

json.dump({'datadict':datadict,'links':links,'events':events},fileOutAll,indent=4)
json.dump(lang,fileOutLang,indent=4)
json.dump(datadict,fileOutDataDict,indent=4)
json.dump({'events':events,'links':links},fileOutEvents,indent=4)


# print 'datadict:',datadict
# print 'links:',links