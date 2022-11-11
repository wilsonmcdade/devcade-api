import boto3
import argparse
import os

parser = argparse.ArgumentParser()

parser.add_argument('--name', dest='name', required=True, type=str, help='Bucket Name')
args = parser.parse_args()

access_key = "devcade2022AccessKey8acb00449528cd9f93bd8d1f21558918511048ea498f77a721be025077b29cd7"
secret_key = "devcade2022SecretKeyd35460c908e215c3612ef82edd8519ead606ed05b0dedc7d3715f52afc7ae1b8"
my_url = "https://s3.csh.rit.edu/"

my_bucket = args.name 

s3 = boto3.resource('s3', endpoint_url=my_url, aws_access_key_id=access_key, aws_secret_access_key=secret_key)

def list_objects():
    bucket = s3.Bucket(my_bucket)
    for my_bucket_object in bucket.objects.all():
        print(my_bucket_object)

print('listing objects')
list_objects()

