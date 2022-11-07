import boto3
from botocore.exceptions import ClientError
import sys
import os
from dotenv import dotenv_values

# Retrieve the list of existing buckets
config = dotenv_values('.env')

def download_file(file_name, bucket, object_name=None):
    # get dotenv values
    access_key = config['S3_ACCESSKEYID']
    secret_key = config['S3_SECRETACCESSKEY']
    endpoint = config['S3_ENDPOINT']
    # If s3 object_name was not specified
    if object_name is None:
        object_name = os.path.basename(file_name)

    # Download the file
    s3 = boto3.resource('s3', endpoint_url=endpoint, aws_access_key_id=access_key, aws_secret_access_key=secret_key)
    
    path = os.path.split(file_name)[0]

    if (not os.path.exists(path)):
        os.makedirs(path)

    s3.Bucket(bucket).download_file(object_name, file_name)

if __name__ == '__main__':
    if (len(sys.argv) != 2):
        print('Missing Arguments', file=sys.stderr)
    else:
        try:
            download_file(f'downloads/{sys.argv[1]}/{sys.argv[1]}.zip', config['S3_GAMES_BUCKET'], f'{sys.argv[1]}/{sys.argv[1]}.zip')
            print("success") 
        except ClientError as e:
            print(e, file=sys.stderr)