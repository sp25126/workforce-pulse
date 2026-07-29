from fastapi import APIRouter, HTTPException, status

router = APIRouter()

@router.get("/")
def get_aggregates():
    """
    Placeholder for the aggregates endpoint.
    Returns 501 Not Implemented.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Aggregates endpoint not implemented yet."
    )
