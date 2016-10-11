# make json file
import json
import re

fileIn=open('bbh-test.json','r')

lang='en-US'

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

# print 'datadict:',datadict
# print 'links:',links