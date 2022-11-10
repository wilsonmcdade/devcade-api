import boto3

import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--path', dest='path', required=True, type=str, help='Path to your data')
parser.add_argument('--key', dest='key', required=True, type=str, help='Object key')
parser.add_argument('--name', dest='name', required=True, type=str, help='Bucket Name')
args = parser.parse_args()

access_key = os.environ['s3_access_key']
secret_key = os.environ['s3_secret_key']
my_url = os.environ['s3_url']

my_bucket = args.name

s3 = boto3.resource('s3', endpoint_url=my_url, aws_access_key_id=access_key, aws_secret_access_key=secret_key)
#response = s3.list_buckets()
#print(response)


#s3.create_bucket(Bucket=my_bucket)

def upload(file, key):

    bucket = s3.Bucket(my_bucket)

    bucket.upload_file(Filename=file,
                       Key=key)

def list_objects():
    bucket = s3.Bucket(my_bucket)
    for my_bucket_object in bucket.objects.all():
        print(my_bucket_object)

print('uploading...')
upload(args.path, args.key)

print('deleting')
my_object = s3.Object(my_bucket, args.key)
my_object.delete()

print('listing objects')
list_objects()

