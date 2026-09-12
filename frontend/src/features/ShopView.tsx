import React from 'react';
import { ShoppingBag, Check, Palette, Award, Coins } from 'lucide-react';
import type { Item, InventoryItem } from '../types';

export const ShopView: React.FC<{
  items: Item[];
  inventory: InventoryItem[];
  userGold: number;
  onPurchase: (itemId: string) => Promise<void>;
  onEquip: (itemId: string) => Promise<void>;
}> = ({ items, inventory, userGold, onPurchase, onEquip }) => {
  const ownedItemIds = new Set(inventory.map((inv) => inv.item.id));
  const equippedItemIds = new Set(inventory.filter((inv) => inv.equipped).map((inv) => inv.item.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" /> ARMORY & COSMETIC SHOP
        </h3>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
          <Coins className="w-4 h-4" /> {userGold} GOLD
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => {
          const isOwned = ownedItemIds.has(item.id);
          const isEquipped = equippedItemIds.has(item.id);
          const canAfford = userGold >= item.cost;

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                isEquipped
                  ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : isOwned
                  ? 'bg-gray-900/60 border-white/20'
                  : 'bg-black/30 border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-white/5 border border-white/5 text-amber-400">
                    {item.type === 'theme' ? <Palette className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                    {item.type}
                  </span>
                </div>

                <h4 className="font-bold text-white text-base mb-1">{item.name}</h4>
                <p className="text-xs text-gray-400 mb-4">{item.description}</p>
              </div>

              <div>
                {isEquipped ? (
                  <button disabled className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> EQUIPPED
                  </button>
                ) : isOwned ? (
                  <button
                    onClick={() => onEquip(item.id)}
                    className="w-full py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-white/10"
                  >
                    EQUIP ITEM
                  </button>
                ) : (
                  <button
                    onClick={() => onPurchase(item.id)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-4 h-4" /> BUY FOR {item.cost} GOLD
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
