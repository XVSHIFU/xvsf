from __future__ import print_function
import urllib2,ssl,json,base64,getpass
url='https://10.3.11.1/restconf/data/Cisco-IOS-XE-native:native/line/vty'
password=getpass.getpass('RESTCONF password: ')
headers={'Authorization':'Basic '+base64.b64encode('labadmin:'+password),'Accept':'application/yang-data+json','Content-Type':'application/yang-data+json'}
def call(method,data=None):
 r=urllib2.Request(url,json.dumps(data) if data is not None else None,headers)
 r.get_method=lambda:method
 response=urllib2.urlopen(r,context=ssl._create_unverified_context(),timeout=30)
 text=response.read()
 print(method,response.getcode(),text)
 return json.loads(text) if text else None
before=call('GET')
open('before.json','w').write(json.dumps(before,indent=2))
key=list(before.keys())[0]
rows=before[key]
assert all('none' in x['transport']['input'] for x in rows)
patch={key:[dict(first=x['first'],last=x['last'],transport={'input':{'all':[None]}}) for x in rows]}
open('patch.json','w').write(json.dumps(patch,indent=2))
call('PATCH',patch)
after=call('GET')
open('after.json','w').write(json.dumps(after,indent=2))
assert [(x['first'],x['last']) for x in after[key]]==[(x['first'],x['last']) for x in rows]
assert all('all' in x['transport']['input'] for x in after[key])
print('PASS: all returned VTY ranges changed from none to all via host31')
