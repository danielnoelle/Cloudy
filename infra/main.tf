resource "aws_lambda_function" "myfunction" {
    filename         = data.archive_file.zip.output_path
    source_code_hash = data.archive_file.zip.output_base64sha256
    function_name    = "myfunction"
    role             = aws_iam_role.iam_for_lambda.arn
    handler          = "function.lambda_handler"
    runtime          = "python3.9"
}

resource "aws_iam_role" "iam_for_lambda" {
    name = "iam_for_lambda"

    assume_role_policy = <<EOF
    {
        "Version": "2012-10-17",
        "Statement": [
            {
            "Action": "sts:AssumeRole",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
            }
        ]
    }
    EOF
}

# Using inline role policy (simpler, no attachment needed)
resource "aws_iam_role_policy" "lambda_policy" {
    name = "lambda_dynamodb_policy"
    role = aws_iam_role.iam_for_lambda.id

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Action = [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ]
                Resource = "arn:aws:logs:*:*:*"
            },
            {
                Effect = "Allow"
                Action = [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem"
                ]
                Resource = "arn:aws:dynamodb:*:*:table/cloudportfolio-test"
            }
        ]
    })
}

data "archive_file" "zip" {
    type        = "zip"
    source_dir  = "${path.module}/lambda/"
    output_path = "${path.module}/lambda/lambda.zip"
}

resource "aws_lambda_function_url" "url1" {
    function_name      = aws_lambda_function.myfunction.function_name
    authorization_type = "NONE"

    cors {
        allow_credentials = false
        allow_origins     = ["*"]
        allow_methods     = ["*"]
        allow_headers     = ["date", "keep-alive"]
        expose_headers    = ["keep-alive", "date"]
        max_age           = 86400
    }
}

# Permission 1: Allow invoking the function URL
resource "aws_lambda_permission" "allow_public_url" {
    statement_id           = "FunctionURLAllowPublicAccess"
    action                 = "lambda:InvokeFunctionUrl"
    function_name          = aws_lambda_function.myfunction.function_name
    principal              = "*"
    function_url_auth_type = "NONE"
}

# Permission 2: Allow invoking the function
resource "aws_lambda_permission" "allow_public_invoke" {
    statement_id  = "FunctionURLInvokeAllowPublicAccess"
    action        = "lambda:InvokeFunction"
    function_name = aws_lambda_function.myfunction.function_name
    principal     = "*"
}

output "function_url" {
    value = aws_lambda_function_url.url1.function_url
}