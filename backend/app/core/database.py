from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings
from app.models.models import Base

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    poolclass=NullPool,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("ALTER TABLE quest_completions ADD COLUMN IF NOT EXISTS proof_text TEXT;"))
        await conn.execute(text("ALTER TABLE quest_completions ADD COLUMN IF NOT EXISTS proof_link VARCHAR;"))
        await conn.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS trophies INTEGER DEFAULT 0;"))
        await conn.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS gems INTEGER DEFAULT 10;"))

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
