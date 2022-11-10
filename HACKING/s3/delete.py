import boto3
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--name', dest='name', required=True, type=str, help='Bucket Name')
parser.add_argument('--confirm', dest='confirm', required=True, type=bool, help='Confirm that you want to do this')
args = parser.parse_args()

if args.confirm == False:
    print("Please be certain. Run this script with the --confirm option.")
    exit(1)

access_key = os.environ['s3_access_key']
secret_key = os.environ['s3_secret_key']
my_url = os.environ['s3_url']

# Retrieve the list of existing buckets
my_bucket = args.name

s3 = boto3.resource('s3', endpoint_url=my_url, aws_access_key_id=access_key, aws_secret_access_key=secret_key)
items = s3.list_buckets()

def list_objects():
    bucket = s3.Bucket(my_bucket)
    for my_bucket_object in bucket.objects.all():
        print(my_bucket_object)

def del_objects():
    bucket = s3.Bucket(my_bucket)
    for my_bucket_object in bucket.objects.all():
        print(my_bucket_object)
        my_bucket_object.delete()

print('listing objects')
list_objects()

print('deleting all objects')
del_objects()
