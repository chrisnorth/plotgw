# make json file
import json
import re

fileInDataDict='datadict.json'
lang='en-US'
fileInLang='lang_%s.json'%lang
# fileInLinks='links.json'
fileInEvents='events.json'

fileOutAll=open('bbh-test_%s.json'%(lang),'w')
fileOutDataDict=open('datadict_%s.json'%(lang),'w')
# fileOutLang=open('langdict_%s.json'%(lang),'w')

# jsIn=json.load(fileIn)
# extract language dictionary
# lang=jsIn['langdict'][lang]
# datadict=jsIn['datadict']
# events=jsIn['events']

# read in files
lang=json.load(open(fileInLang,'r'))
datadict=json.load(open(fileInDataDict,'r'))
events=json.load(open(fileInEvents,'r'))
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

# replace data in datadict
# print 'replacing names in datadict'
# datadict=replacekeys(datadict,lang)

# domains=lang['domains']
links=events['links']
# print('replacing domains in links')
# links=replacekeys(links,lang)


# compile all into one file
json.dump({'datadict':datadict,'events':events,'lang':lang},fileOutAll,indent=4)
# json.dump(lang,fileOutLang,indent=4)
json.dump(datadict,fileOutDataDict,indent=4)
# json.dump({'events':events,'links':links},fileOutEvents,indent=4)
fileOutAll.close()
fileOutDataDict.close()

# print 'datadict:',datadict
# print 'links:',links