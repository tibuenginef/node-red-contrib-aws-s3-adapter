# node-red-contrib-aws-s3-adapter

This is a helper node that uses the aws-sdk & bluebird to upload files into S3 bucket.

## Mandatory/Default Inputs - on all nodes

**Name**  
Display name of the Node.

**TargetAttribute**
Defines the Attribute of the `msg` Object that will store the location url.  
Defaults to `msg.payload`.

**Access Key Id**  
Access Key Id of the user with programmatic access to S3.

**Secret Access Key**  
Secret Access Key of the user with programmatic access to S3.

**Region**  
Region of the S3 bucket. eg: eu-west-1

**Bucket Name**  
Name of the S3 bucket.

## Inputs

**File Name**  
Here we normally use the userId of an account to store the items for a specific user.  
This can also be provided as a parameter to the inbound message on attribute `msg.userId`.  
If the `msg.userId` is present on the input, it will be removed before the message is send forward.

**Base64 Encoded**  
The Base64 encode string of the file.  
This can also be provided as a parameter to the inbound message on attribute `msg.base64`.  
If the `msg.base64` is present on the input, it will be removed before the message is send forward.

**Folder Name**  
The Folder Name in which the file is to be uploaded.  
This can also be provided as a parameter to the inbound message on attribute `msg.folderName`.  
If the `msg.folderName` is present on the input, it will be removed before the message is send forward.

**File Type**  
The type of the file ie: jpeg, png or gif.  
This can also be provided as a parameter to the inbount message on attribute `msg.fileType`.  
If the `msg.fileType` is present on the input, it will be removed before the message is send foreward.

## Output

`msg.payload`

## Dependencies

- aws-sdk
- bluebird
