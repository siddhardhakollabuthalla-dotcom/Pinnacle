import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.core.database import get_db
from app.models.models import Base
from app.services.progression import calculate_rewards, xp_to_next_level, update_streak
from seed import seed_data

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture
async def init_db_fixture():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestingSessionLocal() as session:
        await seed_data(session)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_auth_flows(init_db_fixture):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login with bad credentials -> returns 401 Unauthorized
        bad_login = await ac.post("/auth/login", json={
            "username_or_email": "nonexistent_user",
            "password": "wrongpassword"
        })
        assert bad_login.status_code == 401
        assert bad_login.json()["detail"] == "Incorrect username/email or password"

        # 2. Login with seeded demo user (hero123 / password123) -> returns 200
        demo_login = await ac.post("/auth/login", json={
            "username_or_email": "hero123",
            "password": "password123"
        })
        assert demo_login.status_code == 200
        login_data = demo_login.json()
        assert "token" in login_data
        assert login_data["user"]["username"] == "hero123"

        # 3. Get /auth/me
        me_res = await ac.get("/auth/me")
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "hero@liferpg.com"

        # 4. Signup new user
        signup_res = await ac.post("/auth/signup", json={
            "email": "newadventurer@liferpg.com",
            "username": "adventurer",
            "password": "mypassword123"
        })
        assert signup_res.status_code == 200
        assert signup_res.json()["username"] == "adventurer"

        # 5. Duplicate signup -> returns 400
        dup_signup = await ac.post("/auth/signup", json={
            "email": "newadventurer@liferpg.com",
            "username": "adventurer",
            "password": "mypassword123"
        })
        assert dup_signup.status_code == 400

        # 6. Logout
        logout_res = await ac.post("/auth/logout")
        assert logout_res.status_code == 200

@pytest.mark.asyncio
async def test_character_and_quests_flow(init_db_fixture):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login demo user
        await ac.post("/auth/login", json={"username_or_email": "hero123", "password": "password123"})

        # Get character
        char_res = await ac.get("/character")
        assert char_res.status_code == 200
        char_data = char_res.json()
        assert char_data["level"] == 1
        assert len(char_data["attributes"]) > 0

        # Create Quest without attribute
        q1_res = await ac.post("/quests", json={"title": "Read 20 pages of book", "difficulty": "medium"})
        assert q1_res.status_code == 200
        q1 = q1_res.json()
        assert q1["status"] == "active"

        # Create Quest with invalid attribute -> 400
        invalid_q = await ac.post("/quests", json={"title": "Invalid", "attribute_id": "invalid-attr-id"})
        assert invalid_q.status_code == 400

        # Update Quest
        patch_res = await ac.patch(f"/quests/{q1['id']}", json={"title": "Read 30 pages of book", "difficulty": "hard"})
        assert patch_res.status_code == 200
        assert patch_res.json()["title"] == "Read 30 pages of book"

        # List Quests (active filter & all filter)
        active_quests = await ac.get("/quests?status_filter=active")
        assert len(active_quests.json()) >= 1

        all_quests = await ac.get("/quests?status_filter=all")
        assert len(all_quests.json()) >= 1

        # Complete Quest
        comp_res = await ac.post(f"/quests/{q1['id']}/complete")
        assert comp_res.status_code == 200
        comp_data = comp_res.json()
        assert comp_data["quest_id"] == q1["id"]
        assert comp_data["xp_awarded"] > 0

        # Try completing non-recurring completed quest again -> 400
        comp_again = await ac.post(f"/quests/{q1['id']}/complete")
        assert comp_again.status_code == 400

        # Check history
        hist_res = await ac.get("/history")
        assert hist_res.status_code == 200
        assert len(hist_res.json()) >= 1

@pytest.mark.asyncio
async def test_shop_and_inventory_flow(init_db_fixture):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/auth/login", json={"username_or_email": "hero123", "password": "password123"})

        # Get Shop items
        items_res = await ac.get("/shop/items")
        assert items_res.status_code == 200
        items = items_res.json()
        assert len(items) > 0
        cheap_item = min(items, key=lambda x: x["cost"])

        # Purchase cheap item (demo user starts with 100 gold)
        buy_res = await ac.post(f"/shop/purchase/{cheap_item['id']}")
        assert buy_res.status_code == 200
        assert buy_res.json()["status"] == "success"

        # Try purchasing same item again -> 400 owned
        buy_dup = await ac.post(f"/shop/purchase/{cheap_item['id']}")
        assert buy_dup.status_code == 400

        # Check Inventory
        inv_res = await ac.get("/shop/inventory")
        assert inv_res.status_code == 200
        inv = inv_res.json()
        assert len(inv) == 1
        assert inv[0]["item"]["id"] == cheap_item["id"]

        # Equip Item
        equip_res = await ac.post(f"/shop/equip/{cheap_item['id']}")
        assert equip_res.status_code == 200
        assert equip_res.json()["status"] == "equipped"

def test_xp_curve():
    assert xp_to_next_level(1) == 50
    assert xp_to_next_level(2) == 151  # floor(50 * 2^1.6)
    assert xp_to_next_level(5) == 656  # floor(50 * 5^1.6)

@pytest.mark.asyncio
async def test_legendary_quest_and_leaderboard(init_db_fixture):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login
        login_res = await ac.post("/auth/login", json={"username_or_email": "hero123", "password": "password123"})
        assert login_res.status_code == 200

        # 2. Create Legendary Quest
        leg_q = await ac.post("/quests", json={
            "title": "Conquer Distributed Systems Architecture",
            "difficulty": "legendary"
        })
        assert leg_q.status_code == 200
        leg_data = leg_q.json()
        assert leg_data["difficulty"] == "legendary"

        # 3. Complete Legendary Quest
        comp_res = await ac.post(f"/quests/{leg_data['id']}/complete")
        assert comp_res.status_code == 200
        comp_data = comp_res.json()
        assert comp_data["xp_awarded"] >= 250
        assert comp_data["gold_awarded"] >= 60

        # 4. Check Leaderboard
        lead_res = await ac.get("/character/leaderboard")
        assert lead_res.status_code == 200
        leaderboard = lead_res.json()
        assert len(leaderboard) >= 5
        # Verify ranks are sequential 1, 2, 3...
        for idx, entry in enumerate(leaderboard, start=1):
            assert entry["rank"] == idx
        # Verify current user is marked is_current
        current_entries = [e for e in leaderboard if e["is_current"]]
        assert len(current_entries) == 1
        assert current_entries[0]["name"] == "hero123"

        # 5. Signup returns token
        new_signup = await ac.post("/auth/signup", json={
            "email": "legendary_hero@liferpg.com",
            "username": "legendary_hero",
            "password": "password123"
        })
        assert new_signup.status_code == 200
        assert new_signup.json()["token"] is not None

