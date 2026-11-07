import { Check } from 'lucide-react';
import { STORE_NAMES, type AgentInput, type Category, type Frequency, type StoreName } from '../domain/types';
import { Sheet } from './Sheet';
import { SegmentedControl } from './SegmentedControl';
import type { AgentPicker } from './AgentFields';

const categories: Category[] = ['Fones', 'Cafeteiras', 'Aspiradores'];
const knownBrands = ['Sony', 'Bose', 'Nespresso', 'Dyson'];
const frequencies: Frequency[] = ['1 h', '6 h', '24 h'];

const titles: Record<AgentPicker, string> = {
  category: 'Selecionar categoria',
  price: 'Faixa de preço',
  brands: 'Selecionar marcas',
  stores: 'Selecionar lojas',
  frequency: 'Frequência',
};

export function AgentPickerSheet({
  picker,
  draft,
  priceValue,
  customBrand,
  onPriceChange,
  onCustomBrandChange,
  onApplyPrice,
  onAddBrand,
  onCategory,
  onToggleBrand,
  onToggleStore,
  onFrequency,
  onClose,
}: {
  picker: AgentPicker;
  draft: AgentInput;
  priceValue: string;
  customBrand: string;
  onPriceChange: (value: string) => void;
  onCustomBrandChange: (value: string) => void;
  onApplyPrice: () => void;
  onAddBrand: () => void;
  onCategory: (category: Category) => void;
  onToggleBrand: (brand: string) => void;
  onToggleStore: (store: StoreName) => void;
  onFrequency: (frequency: string) => void;
  onClose: () => void;
}) {
  return (
    <Sheet title={titles[picker]} onClose={onClose}>
      {picker === 'category' && (
        <div className="picker-options">
          {categories.map((category) => (
            <button key={category} className="picker-option" onClick={() => onCategory(category)}>
              <span>{category}</span>
              {draft.category === category && <Check aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}

      {picker === 'price' && (
        <div className="picker-content">
          <label className="input-label" htmlFor="max-price">Preço máximo</label>
          <input
            id="max-price"
            className="text-input price-input"
            inputMode="decimal"
            placeholder="Ex.: 1.500,00"
            value={priceValue}
            onChange={(event) => onPriceChange(event.target.value)}
          />
          <button className="button button-primary button-full" onClick={onApplyPrice}>Aplicar</button>
        </div>
      )}

      {picker === 'brands' && (
        <div className="picker-content">
          <div className="chip-options">
            {knownBrands.map((brand) => (
              <button
                key={brand}
                className={draft.brands.includes(brand) ? 'choice-chip selected' : 'choice-chip'}
                aria-pressed={draft.brands.includes(brand)}
                onClick={() => onToggleBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
          <label className="input-label" htmlFor="custom-brand">Adicionar outra marca</label>
          <div className="input-action-row">
            <input
              id="custom-brand"
              className="text-input"
              value={customBrand}
              onChange={(event) => onCustomBrandChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onAddBrand();
                }
              }}
              placeholder="Nome da marca"
            />
            <button className="button button-outline" onClick={onAddBrand}>Adicionar</button>
          </div>
        </div>
      )}

      {picker === 'stores' && (
        <div className="picker-options">
          {STORE_NAMES.map((store) => (
            <button key={store} className="picker-option" onClick={() => onToggleStore(store)}>
              <span>{store}</span>
              {draft.stores.includes(store) && <Check aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}

      {picker === 'frequency' && (
        <div className="picker-content">
          <SegmentedControl
            items={frequencies}
            value={draft.frequency}
            onChange={onFrequency}
            label="Frequência de verificação"
          />
        </div>
      )}
    </Sheet>
  );
}
