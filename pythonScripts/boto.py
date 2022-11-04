import boto3
from botocore.exceptions import ClientError
import sys
import os
from dotenv import dotenv_values

# Retrieve the list of existing buckets
config = dotenv_values('.env')

def upload_file(file_name, bucket, object_name=None):
    # get dotenv values
    access_key = config['S3_ACCESSKEYID']
    secret_key = config['S3_SECRETACCESSKEY']
    endpoint = config['S3_ENDPOINT']
    # If s3 object_name was not specified
    if object_name is None:
        object_name = os.path.basename(file_name)

    # Upload the file
    s3_client = boto3.client('s3', endpoint_url=endpoint, aws_access_key_id=access_key, aws_secret_access_key=secret_key)
    response = s3_client.upload_file(file_name, bucket, object_name)


####### upload_file(f'uploads/{sys.argv[1]}.zip', 'devcade-games', f'{sys.argv[1]}/{sys.argv[1]}.zip')


if __name__ == '__main__':
    if (len(sys.argv) != 4):
        print('Missing Arguments', file=sys.stderr)
    else:
        try:
            upload_file(f'uploads/{sys.argv[1]}/{sys.argv[1]}.zip', config['S3_GAMES_BUCKET'], f'{sys.argv[1]}/{sys.argv[1]}.zip')
            # upload game icon and banner files
            upload_file(f'uploads/{sys.argv[1]}/{sys.argv[2]}', config['S3_GAMES_BUCKET'], f'{sys.argv[1]}/{sys.argv[2]}')
            upload_file(f'uploads/{sys.argv[1]}/{sys.argv[3]}', config['S3_GAMES_BUCKET'], f'{sys.argv[1]}/{sys.argv[3]}')
            print("success") 
        except ClientError as e:
            print(e, file=sys.stderr)
        

    
    # for o in s3.Bucket('devcade-games').objects.all():
    #     print(o)
    # for bucket in s3.buckets.all():
    #     print(bucket.name)
    #     for bucket_obj in bucket.objects.all():
    #         print(f'\t{bucket_obj}')

#file_name = 'bankshot.zip'

#bucket = s3.Bucket('devcade-games')

#bucket.upload_file(Filename=file_name,
#                   Key='bankshot.zip')