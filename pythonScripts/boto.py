import boto3
from botocore.exceptions import ClientError
import sys
import os
# Retrieve the list of existing buckets

access_key = "devcade2022AccessKey8acb00449528cd9f93bd8d1f21558918511048ea498f77a721be025077b29cd7"
secret_key = "devcade2022SecretKeyd35460c908e215c3612ef82edd8519ead606ed05b0dedc7d3715f52afc7ae1b8"

s3 = boto3.resource('s3', endpoint_url='https://s3.csh.rit.edu', aws_access_key_id=access_key, aws_secret_access_key=secret_key)



def upload_file(file_name):
    s3 = boto3.resource('s3', endpoint_url='https://s3.csh.rit.edu', aws_access_key_id=access_key, aws_secret_access_key=secret_key)
    try:
        bucket = s3.Bucket('devcade-games')
        bucket.upload_file(Filename=f'uploads/{sys.argv[1]}.zip', Key=sys.argv[1])
    except ClientError as e:
        return False
    return True

for o in s3.Bucket('devcade-games').objects.all():
    print(o)
for bucket in s3.buckets.all():
    print(bucket.name)
    for bucket_obj in bucket.objects.all():
        print(f'\t{bucket_obj}')




#file_name = 'bankshot.zip'

#bucket = s3.Bucket('devcade-games')

#bucket.upload_file(Filename=file_name,
#                   Key='bankshot.zip')