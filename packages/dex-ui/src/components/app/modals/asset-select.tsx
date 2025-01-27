import { ModalProps } from './types';
import { SelectCoinsItemDropdown } from '../../ui/select-coins/select-coins-item-dropdown';
import { useGlobalModalContext } from './modal-context';

export default function AssetSelect({
  value,
  items = [],
  maxListItem = 6,
  onChange,
}: { value: any; items: any[]; maxListItem: number } & ModalProps) {
  const { hideModal } = useGlobalModalContext();
  return (
    <SelectCoinsItemDropdown
      // inputRef={inputRef}
      placeholderInput={'Search name or contract address'}
      onClose={hideModal}
      onChange={onChange}
      coin={value}
      items={items}
      title="Pick asset"
      // loading={loading}
      // reversed={reversed}
      maxListItem={maxListItem}
      // fuseSearchKeys={fuseSearchKeys}
      // shouldSearchForImports={shouldSearchForImports}
    />
  );
}
