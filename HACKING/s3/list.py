import boto3
import argparse

parser.add_argument('--name', dest='name', required=True, type=str, help='Bucket Name')
args = parser.parse_args()

access_key = os.environ['s3_access_key']
secret_key = os.environ['s3_secret_key']
my_url = os.environ['s3_url']

my_bucket = args.name 

s3 = boto3.resource('s3', endpoint_url=my_url, aws_access_key_id=access_key, aws_secret_access_key=secret_key)

def list_objects():
    bucket = s3.Bucket(my_bucket)
    for my_bucket_object in bucket.objects.all():
        print(my_bucket_object)

print('listing objects')
list_objects()

