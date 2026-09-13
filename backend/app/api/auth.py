from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import (
    get_password_hash, verify_password, create_access_token, decode_access_token, cookie_sec
)
from app.models.models import User, Character, Attribute, CharacterAttribute
from app.schemas.schemas import UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        # Fallback to Authorization header if provided
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    user_id = payload["sub"]
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.post("/signup", response_model=UserOut)
async def signup(user_in: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    email_clean = user_in.email.strip().lower()
    username_clean = user_in.username.strip()

    # Check if user exists
    existing = await db.execute(select(User).filter((User.email == email_clean) | (User.username == username_clean)))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Username or email already registered")

    new_user = User(
        email=email_clean,
        username=username_clean,
        password_hash=get_password_hash(user_in.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Initialize character
    character = Character(user_id=new_user.id)
    db.add(character)
    await db.commit()
    await db.refresh(character)

    # Initialize attributes for character
    attrs_result = await db.execute(select(Attribute))
    attrs = attrs_result.scalars().all()
    attr_map = {a.key: a.id for a in attrs}
    for attr in attrs:
        char_attr = CharacterAttribute(character_id=character.id, attribute_id=attr.id)
        db.add(char_attr)

    # Initialize default daily recurring quests
    from app.models.models import Quest
    default_daily = [
        {
            "title": "Drink 4 Litres of Water",
            "description": "Hydrate consistently throughout the day. Achieve maximum cellular vitality and cognitive performance.",
            "difficulty": "medium",
            "attribute_id": attr_map.get("vitality"),
            "is_recurring": True,
            "recurrence_rule": "days:Mon,Tue,Wed,Thu,Fri,Sat,Sun"
        },
        {
            "title": "Walk 10,000 Steps",
            "description": "Maintain active daily physical movement and cardiovascular endurance.",
            "difficulty": "medium",
            "attribute_id": attr_map.get("strength"),
            "is_recurring": True,
            "recurrence_rule": "days:Mon,Tue,Wed,Thu,Fri,Sat,Sun"
        }
    ]
    for dq in default_daily:
        new_q = Quest(
            user_id=new_user.id,
            title=dq["title"],
            description=dq["description"],
            difficulty=dq["difficulty"],
            attribute_id=dq["attribute_id"],
            is_recurring=True,
            recurrence_rule=dq["recurrence_rule"],
            status="active"
        )
        db.add(new_q)

    await db.commit()

    token = create_access_token({"sub": new_user.id})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Dev default
        max_age=60 * 60 * 24 * 7
    )
    new_user.token = token
    return new_user

@router.post("/login")
async def login(user_in: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    identifier = user_in.username_or_email.strip()
    identifier_lower = identifier.lower()

    result = await db.execute(
        select(User).filter(
            (User.username == identifier) | (User.email == identifier_lower)
        )
    )
    user = result.scalars().first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.id})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 7
    )
    return {"status": "success", "token": token, "user": UserOut.model_validate(user)}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"status": "logged_out"}

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
