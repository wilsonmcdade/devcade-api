import boto3
from botocore.exceptions import ClientError
import sys
import os
from dotenv import dotenv_values

# Retrieve the list of existing buckets
config = dotenv_values('.env')

def download_file(bucket, game_uuid):
    # get dotenv values
    access_key = config['S3_ACCESSKEYID']
    secret_key = config['S3_SECRETACCESSKEY']
    endpoint = config['S3_ENDPOINT']

    # Download the file
    s3 = boto3.resource('s3', endpoint_url=endpoint, aws_access_key_id=access_key, aws_secret_access_key=secret_key)
    
    path = f'downloads/{game_uuid}'

    if (not os.path.exists(path)):
        os.makedirs(path)

    icon_obj_key = f'{game_uuid}/icon'
    banner_obj_key = f'{game_uuid}/banner'

    for bucket_obj in s3.Bucket(bucket).objects.all():
        if (icon_obj_key in bucket_obj.key or banner_obj_key in bucket_obj.key):
            s3.Bucket(bucket).download_file(bucket_obj.key, f'{path}/{os.path.basename(bucket_obj.key)}')

if __name__ == '__main__':
    if (len(sys.argv) != 2):
        print('Missing Arguments', file=sys.stderr)
    else:
        try:
            download_file(config['S3_GAMES_BUCKET'], sys.argv[1])
            print("success") 
        except ClientError as e:
            print(e, file=sys.stderr)