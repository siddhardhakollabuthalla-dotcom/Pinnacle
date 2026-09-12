from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Character, Item, Inventory, GoldTransaction
from app.schemas.schemas import ItemOut, InventoryOut

router = APIRouter(prefix="/shop", tags=["shop"])

@router.get("/items", response_model=List[ItemOut])
async def get_shop_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item))
    items = result.scalars().all()
    return [ItemOut.model_validate(item) for item in items]

@router.get("/inventory", response_model=List[InventoryOut])
async def get_user_inventory(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Inventory).filter(Inventory.user_id == current_user.id)
    )
    inv_items = result.scalars().all()

    out = []
    for inv in inv_items:
        item_res = await db.execute(select(Item).filter(Item.id == inv.item_id))
        item = item_res.scalars().first()
        if item:
            out.append(
                InventoryOut(
                    item=ItemOut.model_validate(item),
                    acquired_at=inv.acquired_at,
                    equipped=inv.equipped
                )
            )
    return out

@router.post("/purchase/{item_id}")
async def purchase_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch item
    item_res = await db.execute(select(Item).filter(Item.id == item_id))
    item = item_res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # 2. Check if already owned
    existing_inv = await db.execute(
        select(Inventory).filter(Inventory.user_id == current_user.id, Inventory.item_id == item_id)
    )
    if existing_inv.scalars().first():
        raise HTTPException(status_code=400, detail="Item already owned")

    # 3. Fetch character & check gold
    char_res = await db.execute(select(Character).filter(Character.user_id == current_user.id))
    character = char_res.scalars().first()
    if not character or character.gold < item.cost:
        raise HTTPException(status_code=400, detail="Insufficient gold")

    # 4. Deduct gold & grant item
    character.gold -= item.cost

    inv_entry = Inventory(user_id=current_user.id, item_id=item.id, equipped=False)
    db.add(inv_entry)

    # 5. Ledger entry
    gold_tx = GoldTransaction(
        user_id=current_user.id,
        amount=-item.cost,
        reason="shop_purchase",
        reference_id=item.id
    )
    db.add(gold_tx)

    await db.commit()
    return {"status": "success", "remaining_gold": character.gold, "item": ItemOut.model_validate(item)}

@router.post("/equip/{item_id}")
async def equip_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch inventory entry
    inv_res = await db.execute(
        select(Inventory).filter(Inventory.user_id == current_user.id, Inventory.item_id == item_id)
    )
    inv = inv_res.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Item not owned in inventory")

    # Fetch item to see type
    item_res = await db.execute(select(Item).filter(Item.id == item_id))
    target_item = item_res.scalars().first()

    # Unequip all items of the same type
    all_inv_res = await db.execute(select(Inventory).filter(Inventory.user_id == current_user.id))
    all_inv = all_inv_res.scalars().all()

    for item_entry in all_inv:
        it_res = await db.execute(select(Item).filter(Item.id == item_entry.item_id))
        it = it_res.scalars().first()
        if it and it.type == target_item.type:
            item_entry.equipped = (item_entry.item_id == item_id)

    await db.commit()
    return {"status": "equipped", "item_id": item_id}
