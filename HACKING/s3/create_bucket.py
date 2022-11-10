import boto3
import argparse
import os

parser = argparse.ArgumentParser()
parser.add_argument('--name', dest='name', required=True, type=str, help='Bucket Name')
args = parser.parse_args()

access_key = os.environ['s3_access_key']
secret_key = os.environ['s3_secret_key']
my_url = os.environ['s3_url']

my_bucket = args.name

s3 = boto3.resource('s3', endpoint_url=my_url, aws_access_key_id=access_key, aws_secret_access_key=secret_key)

s3.create_bucket(Bucket=my_bucket)

print('bucket created.')
