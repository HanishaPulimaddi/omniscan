import os

LOCAL_UPLOAD_DIR = "app/uploads/scans"


def save_scan_file(file_bytes: bytes, filename: str) -> str:
    """
    Saves a scan image and returns the value to store in the DB as
    Scan.file_path.

    If AWS_S3_BUCKET is set, uploads to S3 and returns the bare object key
    (the bucket is private — callers must go through the presigned-URL scan
    image route to actually view it). Otherwise saves to local disk and
    returns a relative URL served by the app's own /uploads mount. Local dev
    needs no AWS setup at all; setting AWS_S3_BUCKET (+ AWS credentials)
    switches to S3 with no other code changes.
    """
    bucket = os.getenv("AWS_S3_BUCKET")
    if bucket:
        return _save_to_s3(file_bytes, filename, bucket)
    return _save_to_local(file_bytes, filename)


def _save_to_local(file_bytes: bytes, filename: str) -> str:
    os.makedirs(LOCAL_UPLOAD_DIR, exist_ok=True)
    fs_path = os.path.join(LOCAL_UPLOAD_DIR, filename)

    with open(fs_path, "wb") as f:
        f.write(file_bytes)

    return f"/uploads/scans/{filename}"


def _save_to_s3(file_bytes: bytes, filename: str, bucket: str) -> str:
    import boto3

    s3 = boto3.client("s3")
    key = f"scans/{filename}"
    s3.put_object(Bucket=bucket, Key=key, Body=file_bytes)

    return key
