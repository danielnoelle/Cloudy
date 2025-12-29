import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('cloudportfolio-test')

def lambda_handler(event, context):
    try:
        # Ignore favicon and other non-root requests
        raw_path = event.get('rawPath', '/')
        if raw_path != '/':
            return {
                'statusCode': 204,
                'body': ''
            }
        
        # Get current view count
        response = table.get_item(Key={'id': '0'})
        
        # Handle case where item or view_count attribute doesn't exist
        if 'Item' in response:
            # DynamoDB returns Decimal, convert to int
            view_count = int(response['Item'].get('view_count', 0))
        else:
            view_count = 0
        
        # Increment view count
        view_count = view_count + 1
        
        # Update the table
        table.put_item(Item={
            'id': '0',
            'view_count': view_count
        })
        
        # Return proper response for Function URL
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'view_count': view_count})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
