from pathlib import Path
from uuid import uuid4

import boto3
from fastapi import HTTPException, UploadFile, status

from database import settings

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def validate_image_file(file: UploadFile) -> str:
    extension = Path(file.filename or "").suffix.lower()
    if file.content_type not in ALLOWED_IMAGE_TYPES or extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, PNG, WEBP and GIF image files are allowed",
        )
    return ".jpg" if extension == ".jpeg" else extension


def upload_image_to_s3(file: UploadFile, folder: str) -> str:
    if not all(
        [
            settings.aws_access_key_id,
            settings.aws_secret_access_key,
            settings.aws_region,
            settings.aws_bucket_name,
        ]
    ):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AWS S3 environment variables are not configured",
        )

    extension = validate_image_file(file)
    key = f"{folder.strip('/')}/{uuid4().hex}{extension}"
    client = boto3.client(
        "s3",
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region,
    )
    client.upload_fileobj(
        file.file,
        settings.aws_bucket_name,
        key,
        ExtraArgs={"ContentType": file.content_type},
    )
    return f"https://{settings.aws_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{key}"
