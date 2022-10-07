import boto3
# Retrieve the list of existing buckets

access_key = 'devcade2022AccessKeyinconstantly38254-unaccomplished'
secret_key = 'devcade2022SecretKeylabor-intensive1699-wretchedness'

s3 = boto3.resource('s3', endpoint_url='https://s3.csh.rit.edu', aws_access_key_id=access_key, aws_secret_access_key=secret_key)
response = s3.list_buckets()
print(response)

#file_name = 'bankshot.zip'

#bucket = s3.Bucket('devcade-games')

#bucket.upload_file(Filename=file_name,
#                   Key='bankshot.zip')