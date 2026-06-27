from fastapi import HTTPException, UploadFile, status

from utils.s3 import upload_image_to_s3


def resolve_image_url(
    image: UploadFile | None,
    image_url: str | None,
    folder: str,
    *,
    required: bool = False,
) -> str | None:
    has_file = image is not None and bool(image.filename)
    has_url = bool(image_url and image_url.strip())

    if has_file and has_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either an image file or an image URL, not both",
        )
    if has_file:
        return upload_image_to_s3(image, folder)
    if has_url:
        return image_url.strip()
    if required:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either an image file or an image URL is required",
        )
    return None
